import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const AdminRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email?.toLowerCase() === 'jainkaran8999@gmail.com') {
          setIsAdmin(true);
        } else {
          // Check if this user's UID exists in the 'admins' collection
          const adminRef = doc(db, 'admins', user.uid);
          const adminSnap = await getDoc(adminRef);
          
          // Also check users collection as backup
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          const hasUserAdminRole = userSnap.exists() && userSnap.data()?.role === 'admin';
          
          setIsAdmin(adminSnap.exists() || hasUserAdminRole);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (isAdmin === null) {
    return <div className="p-10 text-center animate-pulse text-orange-600">Verifying Admin Credentials...</div>;
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <span className="text-4xl mb-4">🚫</span>
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">Only authorized Sabha administrators can view this portal.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRouteWrapper;
