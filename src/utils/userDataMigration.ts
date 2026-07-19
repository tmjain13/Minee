import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { devLog } from '../lib/devLog';
import { secureStorage } from './secureStorage';

export interface SadhanaLog {
  date: string;
  samayikCount: number;
  meditationMinutes: number;
  diaryWritten?: boolean;
}

export interface UserStreaks {
  sadhana_streak: number;
  terapanth_sadhana_streak_count: number;
  mantra_streak: number;
  quiz_streak: number;
  terapanth_quiz_streak: number;
  tapa_streak: number;
}

export const syncSpiritualData = async (uid: string) => {
  if (!uid) return;
  devLog(`[SpiritualSync] Beginning synchronization/migration for user: ${uid}`);

  const migrationKey = `terapanth_migrated_${uid}`;

  try {
    // 1. Resolve local logs and streaks (check both plain and secure local storages)
    let plainLogs: SadhanaLog[] = [];
    try {
      const saved = localStorage.getItem('sadhana_logs');
      if (saved) {
        plainLogs = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[SpiritualSync] Failed to parse local plain sadhana_logs:', e);
    }

    let secureLogs: SadhanaLog[] = [];
    try {
      const savedSecure = await secureStorage.get<SadhanaLog[]>(uid, 'sadhana_logs');
      if (savedSecure) {
        secureLogs = savedSecure;
      }
    } catch (e) {
      console.warn('[SpiritualSync] Failed to fetch secure sadhana_logs:', e);
    }

    // Merge plain and secure local logs first
    const localLogsMap = new Map<string, SadhanaLog>();
    secureLogs.forEach(log => { if (log && log.date) localLogsMap.set(log.date, log); });
    plainLogs.forEach(log => {
      if (log && log.date) {
        const existing = localLogsMap.get(log.date);
        if (existing) {
          localLogsMap.set(log.date, {
            date: log.date,
            samayikCount: Math.max(existing.samayikCount || 0, log.samayikCount || 0),
            meditationMinutes: Math.max(existing.meditationMinutes || 0, log.meditationMinutes || 0),
            diaryWritten: existing.diaryWritten || log.diaryWritten || false,
          });
        } else {
          localLogsMap.set(log.date, log);
        }
      }
    });
    const resolvedLocalLogs = Array.from(localLogsMap.values());

    // Check plain local streaks
    const plainStreaks = {
      sadhana_streak: Number(localStorage.getItem('sadhana_streak') || 0),
      terapanth_sadhana_streak_count: Number(localStorage.getItem('terapanth_sadhana_streak_count') || 0),
      mantra_streak: Number(localStorage.getItem('mantra_streak') || 0),
      quiz_streak: Number(localStorage.getItem('quiz_streak') || 0),
      terapanth_quiz_streak: Number(localStorage.getItem('terapanth_quiz_streak') || 0),
      tapa_streak: Number(localStorage.getItem('tapa_streak') || 0),
    };

    // Check secure local streaks
    let secureStreaks: Partial<UserStreaks> = {};
    try {
      const savedSecure = await secureStorage.get<UserStreaks>(uid, 'streaks');
      if (savedSecure) {
        secureStreaks = savedSecure;
      }
    } catch (e) {
      console.warn('[SpiritualSync] Failed to fetch secure streaks:', e);
    }

    const localStreaks: UserStreaks = {
      sadhana_streak: Math.max(plainStreaks.sadhana_streak, secureStreaks.sadhana_streak || 0),
      terapanth_sadhana_streak_count: Math.max(plainStreaks.terapanth_sadhana_streak_count, secureStreaks.terapanth_sadhana_streak_count || 0),
      mantra_streak: Math.max(plainStreaks.mantra_streak, secureStreaks.mantra_streak || 0),
      quiz_streak: Math.max(plainStreaks.quiz_streak, secureStreaks.quiz_streak || 0),
      terapanth_quiz_streak: Math.max(plainStreaks.terapanth_quiz_streak, secureStreaks.terapanth_quiz_streak || 0),
      tapa_streak: Math.max(plainStreaks.tapa_streak, secureStreaks.tapa_streak || 0),
    };

    // 2. Fetch remote data from Firestore
    const logsDocRef = doc(db, 'users', uid, 'sadhana_diary', 'logs');
    const streaksDocRef = doc(db, 'users', uid, 'sadhana_diary', 'streaks_and_settings');

    let remoteLogs: SadhanaLog[] = [];
    let remoteStreaks: Partial<UserStreaks> = {};

    try {
      const [logsSnap, streaksSnap] = await Promise.all([
        getDoc(logsDocRef),
        getDoc(streaksDocRef),
      ]);

      if (logsSnap.exists()) {
        remoteLogs = logsSnap.data().logs || [];
      }
      if (streaksSnap.exists()) {
        remoteStreaks = streaksSnap.data().streaks || {};
      }
    } catch (err) {
      console.warn('[SpiritualSync] Operating in offline mode or Firestore fetch failed. Relying on local cache.', err);
      // If we are offline, we shouldn't overwrite anything, just skip sync
      return;
    }

    // 3. Merge logs (union by date, keeping the higher stats or merging them)
    const mergedLogsMap = new Map<string, SadhanaLog>();
    
    // Seed with remote logs
    remoteLogs.forEach((log) => {
      if (log && log.date) {
        mergedLogsMap.set(log.date, log);
      }
    });

    // Merge/overwrite with local resolved logs if they contain higher values or are newer
    resolvedLocalLogs.forEach((log) => {
      if (log && log.date) {
        const existing = mergedLogsMap.get(log.date);
        if (existing) {
          mergedLogsMap.set(log.date, {
            date: log.date,
            samayikCount: Math.max(existing.samayikCount || 0, log.samayikCount || 0),
            meditationMinutes: Math.max(existing.meditationMinutes || 0, log.meditationMinutes || 0),
            diaryWritten: existing.diaryWritten || log.diaryWritten || false,
          });
        } else {
          mergedLogsMap.set(log.date, log);
        }
      }
    });

    const finalLogs = Array.from(mergedLogsMap.values()).sort((a, b) => b.date.localeCompare(a.date));

    // 4. Merge streaks (keep max value)
    const finalStreaks: UserStreaks = {
      sadhana_streak: Math.max(localStreaks.sadhana_streak, remoteStreaks.sadhana_streak || 0),
      terapanth_sadhana_streak_count: Math.max(localStreaks.terapanth_sadhana_streak_count, remoteStreaks.terapanth_sadhana_streak_count || 0),
      mantra_streak: Math.max(localStreaks.mantra_streak, remoteStreaks.mantra_streak || 0),
      quiz_streak: Math.max(localStreaks.quiz_streak, remoteStreaks.quiz_streak || 0),
      terapanth_quiz_streak: Math.max(localStreaks.terapanth_quiz_streak, remoteStreaks.terapanth_quiz_streak || 0),
      tapa_streak: Math.max(localStreaks.tapa_streak, remoteStreaks.tapa_streak || 0),
    };

    // 5. Persist to Firestore (remote backup)
    await Promise.all([
      setDoc(logsDocRef, { logs: finalLogs, lastSyncedAt: new Date().toISOString() }, { merge: true }),
      setDoc(streaksDocRef, { streaks: finalStreaks, lastSyncedAt: new Date().toISOString() }, { merge: true }),
    ]);

    // 6. Save final merged results to SECURE, encrypted storage for secure offline support
    await Promise.all([
      secureStorage.set(uid, 'sadhana_logs', finalLogs),
      secureStorage.set(uid, 'streaks', finalStreaks),
      secureStorage.set(uid, 'terapanth_sadhana_streak_count', finalStreaks.terapanth_sadhana_streak_count),
    ]);

    // 7. DELETING original unencrypted plain local records upon successful sync!
    localStorage.removeItem('sadhana_logs');
    localStorage.removeItem('sadhana_streak');
    localStorage.removeItem('terapanth_sadhana_streak_count');
    localStorage.removeItem('mantra_streak');
    localStorage.removeItem('quiz_streak');
    localStorage.removeItem('terapanth_quiz_streak');
    localStorage.removeItem('tapa_streak');
    localStorage.removeItem('terapanth_sadhana_daily_tasks');
    localStorage.removeItem('terapanth_sadhana_points');

    // Mark as migrated successfully
    localStorage.setItem(migrationKey, 'true');
    devLog(`[SpiritualSync] Synchronization/migration completed successfully for user: ${uid}. Deleted unencrypted local copies.`);
  } catch (err) {
    console.error('[SpiritualSync] Migration/Synchronization failed:', err);
  }
};
