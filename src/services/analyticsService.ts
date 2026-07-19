import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore';
import { syncSpiritualData } from '../utils/userDataMigration';

/**
 * Atomic counter logger for tab clicks to optimize database usage and performance.
 */
export async function logTabVisit(tabId: string) {
  if (!tabId) return;
  try {
    const docRef = doc(db, 'app_analytics', 'tab_visits');
    await setDoc(docRef, {
      [tabId]: increment(1)
    }, { merge: true });
  } catch (e) {
    console.warn("Analytics tab visit log failed or offline:", e);
  }
}

/**
 * Documents user search queries within FAQ and AI search for administrative insights.
 */
export async function logFaqQuery(queryText: string) {
  const text = queryText?.trim();
  if (!text || text.length < 3) return;
  try {
    // Add raw query logs for admin text ranking dashboards
    await addDoc(collection(db, 'faq_queries_logs'), {
      query: text,
      timestamp: serverTimestamp()
    });

    const docRef = doc(db, 'app_analytics', 'general');
    await setDoc(docRef, {
      total_faq_queries: increment(1)
    }, { merge: true });
  } catch (e) {
    console.warn("Analytics query log failed or offline:", e);
  }
}

export interface SadhanaLog {
  date: string;
  samayikCount: number;
  meditationMinutes: number;
}

export const analyticsService = {
  // Save today's practice
  logPractice: (samayik: number, minutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    const existingData = localStorage.getItem('sadhana_logs');
    const logs: SadhanaLog[] = existingData ? JSON.parse(existingData) : [];

    const existingDayIndex = logs.findIndex(log => log.date === today);

    if (existingDayIndex >= 0) {
      logs[existingDayIndex].samayikCount += samayik;
      logs[existingDayIndex].meditationMinutes += minutes;
    } else {
      logs.push({ date: today, samayikCount: samayik, meditationMinutes: minutes });
    }

    localStorage.setItem('sadhana_logs', JSON.stringify(logs));

    // If user is authenticated, trigger Firestore sync immediately
    if (auth.currentUser?.uid) {
      syncSpiritualData(auth.currentUser.uid).catch((err) => {
        console.warn("[AnalyticsService] Background sync failed:", err);
      });
    }
  },

  // Retrieve data for charts/graphs
  getWeeklyStats: (): SadhanaLog[] => {
    const existingData = localStorage.getItem('sadhana_logs');
    if (!existingData) return [];
    
    const logs: SadhanaLog[] = JSON.parse(existingData);
    // Sort by date and return the last 7 days
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
  }
};
