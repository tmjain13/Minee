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
    const timeout = setTimeout(() => {
      console.warn("Auth check timed out, proceeding as guest.");
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      // Avoid spreading the whole user object as it contains circular references and methods
      setUser(user);
      if (user) {
        // Sync user to Firestore in the background to prevent blocking UI load in case of network timeouts
        const userPath = `users/${user.uid}`;
        const userRef = doc(db, 'users', user.uid);
        
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLoginAt: serverTimestamp(),
            createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : serverTimestamp(),
          }, { merge: true });
          
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            setUserData({ role: 'user' });
          }
        } catch (error) {
          handleFirestoreError(error as any, OperationType.WRITE, userPath);
          setUserData({ role: 'user' });
        }
      } else {
        const localDemo = localStorage.getItem('tp_demo_user');
        if (localDemo) {
          try {
            const parsed = JSON.parse(localDemo);
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
            console.error("Error parsing tp_demo_user:", e);
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
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
