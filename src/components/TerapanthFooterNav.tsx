import React, { useState, useEffect } from 'react';
import { Home, Calendar, MessageSquare, Heart, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSyncQueueSize, syncPendingRecords, isOnline } from '../services/sadhanaOfflineSync';

interface TerapanthFooterNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string; // भाषा बदलने के लिए नया प्रॉप
  isPaginationVisible?: boolean;
}

const TerapanthFooterNav: React.FC<TerapanthFooterNavProps> = ({ activeTab, setActiveTab, language, isPaginationVisible = true }) => {
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
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-orange-600/20 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 ${
        isPaginationVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-md mx-auto px-2 pb-safe">
        <div className="h-[60px] flex items-center justify-around relative">
          
          {/* Subtle Global Sync Status Strip at the very top edge if pending */}
          {pendingSyncs > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-3 py-1 rounded-t-xl text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-all duration-300 border border-b-0 shadow-xs bg-orange-600 text-white" style={{ borderColor: 'rgba(234, 88, 12, 0.3)' }}>
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
                className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-2xl"
                aria-label={language === 'en' ? item.labelEn : item.labelHi}
                aria-current={Active ? 'page' : undefined}
              >
                <div
                  className={`transition-all duration-300 flex items-center justify-center rounded-full relative
                  ${
                    Active
                      ? "bg-white text-orange-600 w-9 h-9 shadow-md shadow-orange-600/20"
                      : "w-9 h-9 text-orange-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={Active ? 2.5 : 2}
                  />

                  {/* Red Badge Indicator on Sadhana Tab for Offline pending syncs */}
                  {item.id === 'sadhana' && pendingSyncs > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white animate-bounce border border-white dark:border-slate-900 shadow-sm">
                      {pendingSyncs}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-0.5 text-[10px] font-semibold transition-colors
                  ${
                    Active
                      ? "text-white font-bold"
                      : "text-orange-100/90"
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

