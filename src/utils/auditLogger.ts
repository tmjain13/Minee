import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs security audit entries securely to Firestore.
 * Conforms to secure auditing best-practices.
 */
export const logAccess = async (uid: string, status: 'granted' | 'denied', path: string) => {
  try {
    if (!uid) {
      console.warn("[AuditLogger] Attempted to log access with an empty UID");
      return;
    }
    
    await addDoc(collection(db, 'access_audit'), {
      uid,
      status,
      path,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent || 'unknown',
      clientLanguage: navigator.language || 'unknown'
    });
    console.log(`[AuditLogger] Access ${status.toUpperCase()} recorded for UID: ${uid}`);
  } catch (error) {
    console.error("[AuditLogger] Security audit writing failed:", error);
  }
};
