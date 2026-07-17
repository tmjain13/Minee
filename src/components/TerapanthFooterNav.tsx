import React, { useState, useEffect } from 'react';
import { Home, Calendar, MessageSquare, Heart, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSyncQueueSize, syncPendingRecords, isOnline } from '../services/sadhanaOfflineSync';

interface TerapanthFooterNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string; // भाषा बदलने के लिए नया प्रॉप
}

const TerapanthFooterNav: React.FC<TerapanthFooterNavProps> = ({ activeTab, setActiveTab, language }) => {
  const { user } = useAuth();
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkSyncQueue = async () => {
    const size = await getSyncQueueSize();
    setPendingSyncs(size);
    
    // Auto-sync if online, there are pending items, and user is logged in
    if (size > 0 && isOnline() && user && !isSyncing) {
      setIsSyncing(true);
      try {
        await syncPendingRecords(user.uid);
        const newSize = await getSyncQueueSize();
        setPendingSyncs(newSize);
      } catch (err) {
        console.error('[Footer Sync] Auto-sync failed:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    checkSyncQueue();
    // Poll the sync queue size periodically
    const interval = setInterval(checkSyncQueue, 4000);
    
    window.addEventListener('online', checkSyncQueue);
    window.addEventListener('offline', checkSyncQueue);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkSyncQueue);
      window.removeEventListener('offline', checkSyncQueue);
    };
  }, [user]);

  const navItems = [
    { id: 'home', icon: Home, labelEn: 'Home', labelHi: 'होम' },
    { id: 'panchang', icon: Calendar, labelEn: 'Calendar', labelHi: 'पंचांग' },
    { id: 'chat', icon: MessageSquare, labelEn: 'Chat', labelHi: 'चैट' },
    { id: 'sadhana', icon: Heart, labelEn: 'Sadhana', labelHi: 'साधना' },
    { id: 'profile', icon: User, labelEn: 'Profile', labelHi: 'प्रोफ़ाइल' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-3 pb-safe">
        <div className="h-[72px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-t-3xl border border-gray-100 dark:border-slate-800/40 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] flex items-center justify-around relative">
          
          {/* Subtle Global Sync Status Strip at the very top edge if pending */}
          {pendingSyncs > 0 && (
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-3 py-1 rounded-t-xl text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-all duration-300 border border-b-0 shadow-xs ${
              isSyncing 
                ? 'bg-orange-500 text-white border-orange-600' 
                : 'bg-amber-500 text-white border-amber-600'
            }`}>
              <RefreshCw size={10} className={isSyncing ? 'animate-spin' : 'animate-pulse'} />
              <span>
                {isSyncing 
                  ? (language === 'hi' ? 'क्लाउड सिंक जारी...' : 'SYNCING TO CLOUD...') 
                  : (language === 'hi' ? `${pendingSyncs} सिंक लंबित` : `${pendingSyncs} SYNC PENDING`)}
              </span>
            </div>
          )}

          {navItems.map((item) => {
            const Active = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(30);
                  }
                  setActiveTab(item.id);
                }}
                className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-2xl"
                aria-label={language === 'en' ? item.labelEn : item.labelHi}
                aria-current={Active ? 'page' : undefined}
              >
                <div
                  className={`transition-all duration-300 flex items-center justify-center rounded-full relative
                  ${
                    Active
                      ? "bg-orange-500 text-white w-11 h-11 shadow-lg shadow-orange-300 dark:shadow-orange-950/40"
                      : "w-10 h-10 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={Active ? 2.6 : 2}
                  />

                  {/* Red Badge Indicator on Sadhana Tab for Offline pending syncs */}
                  {item.id === 'sadhana' && pendingSyncs > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-white animate-bounce border border-white dark:border-slate-900 shadow-sm">
                      {pendingSyncs}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-1 text-[11px] font-medium transition-colors
                  ${
                    Active
                      ? "text-orange-500 font-bold"
                      : "text-gray-400 dark:text-slate-400"
                  }`}
                >
                  {language === 'en' ? item.labelEn : item.labelHi}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TerapanthFooterNav;

