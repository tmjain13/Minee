import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';

/**
 * Synchronizes Firebase Auth claims with Firestore user document.
 * Run this after user signs in.
 */
export const syncAdminStatus = async (user: User) => {
  try {
    // If the browser is offline, skip trying to call Firebase Auth network API to prevent network errors
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log("[auth-sync] Browser is offline. Skipping admin status sync.");
      return;
    }

    const idTokenResult = await user.getIdTokenResult();
    const isAdmin = idTokenResult.claims.admin === true;

    if (isAdmin) {
      await setDoc(
        doc(db, 'admins', user.uid),
        {
          uid: user.uid,
          email: user.email,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    }
  } catch (error: any) {
    if (error?.code === 'auth/network-request-failed' || error?.message?.includes('network-request-failed')) {
      console.warn("[auth-sync] Admin status sync skipped due to network connectivity issues:", error.message || error);
    } else {
      console.warn("[auth-sync] Could not sync admin status:", error?.message || error);
    }
  }
};
