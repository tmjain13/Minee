import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import { logAccess } from '../utils/auditLogger';
import { SkeletonLoader } from './SkeletonLoader';
import { devLog } from '../lib/devLog';

interface AdminGuardProps {
  children: React.ReactNode;
  onBack?: () => void;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, onBack }) => {
  const { user, userData, loading: authLoading } = useAuth();
  const isOwner = user?.email?.toLowerCase() === 'jainkaran8999@gmail.com';
  const [userRole, setUserRole] = useState<string | undefined>(isOwner ? 'admin' : userData?.role);
  const [checkingRole, setCheckingRole] = useState(true);

  // Sync state with userData role changes
  useEffect(() => {
    if (userData?.role) {
      setUserRole(user?.email?.toLowerCase() === 'jainkaran8999@gmail.com' ? 'admin' : userData.role);
    }
  }, [userData?.role, user?.email]);

  // Real-time Firestore document listener to ensure role state is 100% accurate
  useEffect(() => {
    if (authLoading) return;
    
    if (!user?.uid) {
      setUserRole(undefined);
      setCheckingRole(false);
      logAccess("anonymous", "denied", window.location.pathname);
      return;
    }

    // Direct access if owner
    if (user.email?.toLowerCase() === 'jainkaran8999@gmail.com') {
      setUserRole('admin');
      setCheckingRole(false);
      logAccess(user.uid, 'granted', window.location.pathname);
      return;
    }

    devLog("[AdminGuard] Subscribing to user role in real-time for:", user.uid);
    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(
      userRef, 
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const currentRole = data?.role;
          devLog("[AdminGuard] Real-time role check:", currentRole);
          setUserRole(currentRole);
          
          // Execute Audit Logging
          const status = currentRole === 'admin' ? 'granted' : 'denied';
          logAccess(user.uid, status, window.location.pathname);
        } else {
          devLog("[AdminGuard] No user document found for UID:", user.uid);
          setUserRole(undefined);
          logAccess(user.uid, 'denied', window.location.pathname);
        }
        setCheckingRole(false);
      },
      (err) => {
        console.error("[AdminGuard] Error in Firestore role listener:", err);
        setCheckingRole(false);
        logAccess(user.uid, 'denied', window.location.pathname);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, authLoading]);

  // Combined Loading indicator using elegant layout-preserving SkeletonLoader
  if (authLoading || checkingRole) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans animate-pulse">
            प्रमाणिकता की जांच की जा रही है... (Verifying Admin Status...)
          </p>
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  // Access Denied screen if role is not 'admin'
  const isAuthorized = user && (userRole === 'admin' || user.email?.toLowerCase() === 'jainkaran8999@gmail.com');

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto p-8 my-8 text-center bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-xl">
        <div className="w-16 h-16 bg-rose-500/10 dark:bg-rose-950/20 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-rose-500/20">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 dark:text-white font-sans">
          पहुँच अस्वीकृत (Access Denied)
        </h2>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed font-sans">
          इस व्यवस्थापक (Admin Panel) क्षेत्र को देखने के लिए आपके पास आवश्यक अधिकार नहीं हैं। कृपया लॉग इन विवरण सत्यापित करें या व्यवस्थापक से संपर्क करें।
        </p>

        <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl text-left border border-slate-100 dark:border-slate-800/60 mb-6">
          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-mono">
            <span>Identity Status</span>
            <span className="text-rose-500">Unauthorized</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 font-sans truncate">
            <strong>UID:</strong> {user?.uid || "Not Signed In"}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 font-sans mt-0.5">
            <strong>Assigned Role:</strong> <span className="font-bold text-orange-500">{userRole || "guest"}</span>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all active:scale-98 flex items-center justify-center space-x-2 cursor-pointer font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>पीछे जाएँ (Go Back)</span>
          </button>
        )}
      </div>
    );
  }

  // Render authentic Admin children
  return <>{children}</>;
};

export default AdminGuard;
