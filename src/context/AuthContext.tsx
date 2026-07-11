import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthContext] Mounting AuthProvider. Setting up 3-second master safety timeout and onAuthStateChanged listener.");
    
    let isResolved = false;

    const safetyTimeout = setTimeout(() => {
      if (!isResolved) {
        console.warn("[AuthContext] Master safety timeout fired! Forcing auth loading state to false to unblock rendering.");
        setLoading(false);
        isResolved = true;
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("[AuthContext] onAuthStateChanged callback triggered. Current user:", currentUser ? currentUser.email : "guest/none");
      
      setUser(currentUser);
      
      if (currentUser) {
        const isOwner = currentUser.email?.toLowerCase() === 'jainkaran8999@gmail.com';
        const defaultRole = isOwner ? 'admin' : 'user';

        // Instantly assign basic userData properties synchronously to prevent UI locks while syncing
        setUserData({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: defaultRole
        });

        // Run heavy Firestore sync completely asynchronously (non-blocking) in the background
        const userPath = `users/${currentUser.uid}`;
        const userRef = doc(db, 'users', currentUser.uid);
        
        console.log("[AuthContext] Spawning non-blocking Firestore background sync task for uid:", currentUser.uid);
        (async () => {
          try {
            console.log("[AuthContext] Background Sync: Saving user profile to Firestore...");
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: defaultRole,
              lastLoginAt: serverTimestamp(),
              createdAt: currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime) : serverTimestamp(),
            }, { merge: true });
            
            console.log("[AuthContext] Background Sync: Saved profile successfully. Fetching database role/claims...");
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              if (isOwner) {
                data.role = 'admin'; // Always force owner to admin
              }
              setUserData(data);
              console.log("[AuthContext] Background Sync: Profile loaded from database:", data);
            } else {
              console.log("[AuthContext] Background Sync: User document not found in database.");
            }
          } catch (error) {
            console.error("[AuthContext] Background Sync Error:", error);
            handleFirestoreError(error as any, OperationType.WRITE, userPath);
            // Fallback to basic state on error
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
        console.log("[AuthContext] No authenticated user found. Checking for cached demo profile...");
        const localDemo = localStorage.getItem('tp_demo_user');
        if (localDemo) {
          try {
            const parsed = JSON.parse(localDemo);
            console.log("[AuthContext] Found cached demo user profile:", parsed.email);
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
          console.log("[AuthContext] No cached demo user found. App running in default guest mode.");
          setUserData(null);
        }
      }
      
      if (!isResolved) {
        console.log("[AuthContext] Authentication state resolved. Setting loading state to false.");
        setLoading(false);
        isResolved = true;
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      console.log("[AuthContext] Cleaning up AuthProvider listeners and timeouts...");
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('tp_demo_user');
      await signOut(auth);
      // Clear app-specific local storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('terapanth_') || key.startsWith('anuvrat_') || key.startsWith('tp_') || key.startsWith('panchang_') || key.startsWith('perm_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    try {
      // Update Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL
      });

      // Update Firestore
      const userPath = `users/${auth.currentUser.uid}`;
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName,
        photoURL
      });

      // Update local state with only the needed serializable properties or let Firebase handle it
      setUser(auth.currentUser);
      setUserData((prev: any) => prev ? { ...prev, displayName, photoURL } : { displayName, photoURL });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
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
