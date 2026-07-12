import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';

/**
 * Synchronizes Firebase Auth claims with Firestore user document.
 * Run this after user signs in.
 */
export const syncAdminStatus = async (user: User) => {
  try {
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
  } catch (error) {
    console.error("Error syncing admin status:", error);
  }
};
