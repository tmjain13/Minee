import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import toast from 'react-hot-toast';
import { syncAdminStatus } from '../lib/auth-sync';
import { devLog } from '../lib/devLog';
import * as Sentry from '@sentry/react';
import { syncSpiritualData } from '../utils/userDataMigration';

// In-memory cache (lives for session, no localStorage needed)
let cachedOwnerEmail: string | null = null;
let ownerEmailPromise: Promise<string | null> | null = null;

async function getOwnerEmail(): Promise<string | null> {
  if (cachedOwnerEmail !== null) return cachedOwnerEmail;
  if (ownerEmailPromise) return ownerEmailPromise;
  
  ownerEmailPromise = (async () => {
    try {
      const snap = await getDoc(doc(db, 'config', 'admin'));
      if (snap.exists()) {
        cachedOwnerEmail = snap.data().ownerEmail || null;
      } else {
        cachedOwnerEmail = null;
      }
    } catch (e) {
      // Offline or permission denied — fail silently, don't block auth, return null
      console.warn('Failed to load admin config:', e);
      cachedOwnerEmail = null;
    }
    return cachedOwnerEmail;
  })();
  
  return ownerEmailPromise;
}

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    devLog("[AuthContext] Mounting AuthProvider. Setting up 3-second master safety timeout and onAuthStateChanged listener.");
    
    let isResolved = false;

    const safetyTimeout = setTimeout(() => {
      if (!isResolved) {
        console.warn("[AuthContext] Master safety timeout fired! Forcing auth loading state to false to unblock rendering.");
        setLoading(false);
        isResolved = true;
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      devLog("[AuthContext] onAuthStateChanged callback triggered. Current user:", currentUser ? currentUser.email : "guest/none");
      
      setUser(currentUser);
      
      if (currentUser) {
        Sentry.addBreadcrumb({
          category: 'auth',
          type: 'login',
          message: 'User authenticated successfully',
          level: 'info',
          data: {
            uid: currentUser.uid,
          },
        });

        // Sync Admin Status
        await syncAdminStatus(currentUser);

        // Fetch owner email dynamically
        const ownerEmail = await getOwnerEmail();
        const isOwner = !!(currentUser.email && ownerEmail && currentUser.email.toLowerCase() === ownerEmail.toLowerCase());
        const defaultRole = isOwner ? 'admin' : 'user';

        setUserData({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: defaultRole
        });

        const userPath = `users/${currentUser.uid}`;
        const userRef = doc(db, 'users', currentUser.uid);
        
        devLog("[AuthContext] Spawning non-blocking Firestore background sync task for uid:", currentUser.uid);
        (async () => {
          try {
            devLog("[AuthContext] Background Sync: Saving user profile to Firestore...");
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: defaultRole,
              lastLoginAt: serverTimestamp(),
              createdAt: currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime) : serverTimestamp(),
            }, { merge: true });
            
            devLog("[AuthContext] Background Sync: Saved profile successfully. Fetching database role/claims...");
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              const activeOwnerEmail = await getOwnerEmail();
              if (currentUser.email && activeOwnerEmail && currentUser.email.toLowerCase() === activeOwnerEmail.toLowerCase()) {
                data.role = 'admin'; // Always force owner to admin
              }
              setUserData(data);
              devLog("[AuthContext] Background Sync: Profile loaded from database:", data);
            } else {
              devLog("[AuthContext] Background Sync: User document not found in database.");
            }

            // Sync user's sensitive spiritual data from localStorage to Firestore
            await syncSpiritualData(currentUser.uid);
          } catch (error) {
            console.error("[AuthContext] Background Sync Error:", error);
            handleFirestoreError(error as any, OperationType.WRITE, userPath);
            setUserData({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: isOwner ? 'admin' : 'user'
            });
          }
        })();
      } else {
        devLog("[AuthContext] No authenticated user found. Checking for cached demo profile...");
        const localDemo = localStorage.getItem('tp_demo_user');
        if (localDemo) {
          try {
            const parsed = JSON.parse(localDemo);
            devLog("[AuthContext] Found cached demo user profile:", parsed.email);
            setUser({
              uid: parsed.uid,
              email: parsed.email,
              displayName: parsed.displayName,
              photoURL: parsed.photoURL || '',
              emailVerified: true,
              isAnonymous: false,
              metadata: {},
              providerData: [],
            } as any);
            setUserData({
              uid: parsed.uid,
              email: parsed.email,
              displayName: parsed.displayName,
              role: parsed.role || 'user',
              lastLoginAt: new Date().toISOString()
            });
          } catch (e) {
            console.error("[AuthContext] Error parsing tp_demo_user:", e);
            setUserData(null);
          }
        } else {
          devLog("[AuthContext] No cached demo user found. App running in default guest mode.");
          setUserData(null);
        }
      }
      
      if (!isResolved) {
        devLog("[AuthContext] Authentication state resolved. Setting loading state to false.");
        setLoading(false);
        isResolved = true;
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      devLog("[AuthContext] Cleaning up AuthProvider listeners and timeouts...");
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    Sentry.addBreadcrumb({
      category: 'login',
      type: 'auth',
      message: 'Attempting Google Sign-In',
      level: 'info',
      data: {
        method: 'google_popup',
      },
    });

    try {
      await signInWithPopup(auth, provider);
      
      Sentry.addBreadcrumb({
        category: 'login',
        type: 'auth',
        message: 'Google Sign-In successful',
        level: 'info',
        data: {
          uid: auth.currentUser?.uid,
        },
      });

      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      
      // Track failed login attempt without exposing sensitive credentials (like password, token, or email)
      Sentry.addBreadcrumb({
        category: 'login',
        type: 'auth',
        message: 'Google Sign-In failed',
        level: 'warning',
        data: {
          errorCode: error.code || 'unknown_code',
          errorMessage: error.message || 'No error message provided',
        },
      });

      let message = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/network-request-failed') message = 'Network issue. Check your connection.';
      else if (error.code === 'auth/popup-closed-by-user') message = 'Sign-in cancelled.';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('tp_demo_user');
      await signOut(auth);
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('terapanth_') || key.startsWith('anuvrat_') || key.startsWith('tp_') || key.startsWith('panchang_') || key.startsWith('perm_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      toast.success('Logged out successfully.');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error('Failed to log out.');
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL
      });

      const userPath = `users/${auth.currentUser.uid}`;
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName,
        photoURL
      });

      setUser(auth.currentUser);
      setUserData((prev: any) => prev ? { ...prev, displayName, photoURL } : { displayName, photoURL });
      toast.success('Profile updated!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      toast.error('Failed to update profile.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, isLoading: loading, signInWithGoogle, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
