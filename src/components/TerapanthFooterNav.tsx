import React, { useState, useEffect } from 'react';
import { Home, Calendar, User, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSyncQueueSize, syncPendingRecords, isOnline } from '../services/sadhanaOfflineSync';

interface TerapanthFooterNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string;
  isPaginationVisible?: boolean;
}

// Custom Lotus Icon for Sadhana tab to replace standard Heart
const LotusIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 4C10 7.5 7 10 3 11C6.5 13.5 8.5 17.5 12 20C15.5 17.5 17.5 13.5 21 11C17 10 14 7.5 12 4Z" />
    <path d="M12 9C10.5 11.5 8 13.5 5 14.2C7.5 16 9.2 18.2 12 20C14.8 18.2 16.5 16 19 14.2C16 13.5 13.5 11.5 12 9Z" opacity="0.6" />
    <circle cx="12" cy="14" r="1.5" fill="currentColor" opacity="0.8" />
  </svg>
);

// Branded AI Wisdom Emblem for Center Tab (Minee AI)
const MineeAIEmblem: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <div className="relative flex items-center justify-center">
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
        isActive
          ? "bg-[#6E1F2A] text-[#B68D40] ring-2 ring-[#B68D40]/60 shadow-[#6E1F2A]/30 scale-105"
          : "bg-[#6E1F2A] text-amber-100 hover:bg-[#50161E] ring-1 ring-[#B68D40]/30"
      }`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        {/* Wisdom Ray / Triratna Agam Sparkle Emblem */}
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="12" cy="6" r="1.2" fill="#B68D40" />
        <circle cx="7" cy="15" r="1.2" fill="#B68D40" />
        <circle cx="17" cy="15" r="1.2" fill="#B68D40" />
        <path d="M12 3V8M12 16V21M3 12H8M16 12H21" strokeLinecap="round" opacity="0.8" />
        <path d="M5.6 5.6L9.2 9.2M14.8 14.8L18.4 18.4M18.4 5.6L14.8 9.2M9.2 14.8L5.6 18.4" strokeLinecap="round" strokeDasharray="1 2.5" opacity="0.5" />
      </svg>
    </div>
    {isActive && (
      <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#B68D40] animate-pulse" />
    )}
  </div>
);

const TerapanthFooterNav: React.FC<TerapanthFooterNavProps> = ({
  activeTab,
  setActiveTab,
  language,
  isPaginationVisible = true
}) => {
  const { user } = useAuth();
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkSyncQueue = async () => {
    const size = await getSyncQueueSize();
    setPendingSyncs(size);
    
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
    { id: 'home', icon: Home, labelEn: 'Home', labelHi: 'गृह' },
    { id: 'panchang', icon: Calendar, labelEn: 'Calendar', labelHi: 'पंचांग' },
    { id: 'chat', isAi: true, labelEn: 'Minee AI', labelHi: 'मिनी AI' },
    { id: 'sadhana', isLotus: true, labelEn: 'Sadhana', labelHi: 'साधना' },
    { id: 'profile', icon: User, labelEn: 'Profile', labelHi: 'प्रोफ़ाइल' }
  ];

  return (
    <div
      className={`fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none transition-all duration-300 ${
        isPaginationVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <nav
        className="max-w-md mx-auto pointer-events-auto bg-[#FFFDF8]/90 dark:bg-[#1C1014]/90 backdrop-blur-xl border border-[#ECE8E3] dark:border-[#2E1B22] rounded-full px-3 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative"
        aria-label="Primary Navigation"
      >
        {/* Subtle Sync Badge */}
        {pendingSyncs > 0 && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 bg-[#6E1F2A] text-white border border-[#B68D40]/30 shadow-xs">
            <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : `${pendingSyncs} Offline`}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const Active = activeTab === item.id;

            if (item.isAi) {
              return (
                <button
                  key={item.id}
                  id={`tp-nav-tab-${item.id}`}
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(25);
                    }
                    setActiveTab(item.id);
                  }}
                  className="relative -top-3 px-2 flex flex-col items-center justify-center cursor-pointer group focus:outline-none"
                  aria-label={item.labelEn}
                  aria-current={Active ? 'page' : undefined}
                >
                  <MineeAIEmblem isActive={Active} />
                  <span
                    className={`text-[9.5px] font-semibold mt-0.5 transition-colors ${
                      Active ? 'text-[#6E1F2A] dark:text-[#D4AF64] font-bold' : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </span>
                </button>
              );
            }

            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                id={`tp-nav-tab-${item.id}`}
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(15);
                  }
                  setActiveTab(item.id);
                }}
                className="flex-1 flex flex-col items-center justify-center py-1 rounded-full cursor-pointer transition-all duration-200 focus:outline-none"
                aria-label={language === 'hi' ? item.labelHi : item.labelEn}
                aria-current={Active ? 'page' : undefined}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 relative ${
                    Active
                      ? 'bg-[#6E1F2A]/10 dark:bg-[#B68D40]/15 text-[#6E1F2A] dark:text-[#D4AF64]'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {item.isLotus ? (
                    <LotusIcon size={19} className={Active ? 'stroke-[2]' : 'stroke-[1.6]'} />
                  ) : IconComponent ? (
                    <IconComponent size={19} strokeWidth={Active ? 2.2 : 1.7} />
                  ) : null}

                  {item.id === 'sadhana' && pendingSyncs > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6E1F2A] ring-2 ring-white dark:ring-stone-900" />
                  )}
                </div>

                <span
                  className={`text-[10px] font-medium transition-colors ${
                    Active
                      ? 'text-[#6E1F2A] dark:text-[#D4AF64] font-bold'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {language === 'hi' ? item.labelHi : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default TerapanthFooterNav;


