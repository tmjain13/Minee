import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSyncQueueSize, syncPendingRecords, isOnline } from '../services/sadhanaOfflineSync';
import LotusLogo from './LotusLogo';

interface TerapanthFooterNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string;
  isPaginationVisible?: boolean;
}

// 1. Home Icon
const HomeIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={active ? "1.5" : "1.75"}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-colors duration-200 ${
      active ? 'text-[#7A1F2B]' : 'text-[#707070] group-hover:text-[#2B2B2B]'
    }`}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// 2. Calendar Icon
const CalendarIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "2" : "1.75"}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-colors duration-200 ${
      active ? 'text-[#7A1F2B]' : 'text-[#707070] group-hover:text-[#2B2B2B]'
    }`}
  >
    <rect x="3" y="4" width="18" height="17" rx="3.5" ry="3.5" />
    <line x1="16" y1="2" x2="16" y2="5" strokeWidth="2" />
    <line x1="8" y1="2" x2="8" y2="5" strokeWidth="2" />
    <line x1="3" y1="9" x2="21" y2="9" strokeWidth="1.2" />
    <circle cx="7.5" cy="12.5" r="1" fill="currentColor" />
    <circle cx="12" cy="12.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="12.5" r="1" fill="currentColor" />
    <circle cx="7.5" cy="16.5" r="1" fill="currentColor" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="16.5" r="1" fill="currentColor" />
  </svg>
);

// 3. Lotus Icon for Sadhana
const LotusIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "1.5" : "1.75"}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-colors duration-200 ${
      active ? 'text-[#7A1F2B]' : 'text-[#707070] group-hover:text-[#2B2B2B]'
    }`}
  >
    {/* Center petal */}
    <path
      d="M12 3C10 7.5 9.5 13 12 21C14.5 13 14 7.5 12 3Z"
      fill="currentColor"
      fillOpacity={active ? 0.25 : 0}
    />
    
    {/* Left inner petal */}
    <path
      d="M12 21C9.5 17 6.5 12.5 7 6C9 10.5 11 15.5 12 21Z"
      fill="currentColor"
      fillOpacity={active ? 0.18 : 0}
    />
    
    {/* Right inner petal */}
    <path
      d="M12 21C14.5 17 17.5 12.5 17 6C15 10.5 13 15.5 12 21Z"
      fill="currentColor"
      fillOpacity={active ? 0.18 : 0}
    />
    
    {/* Left outer petal */}
    <path
      d="M12 21C7.5 19.5 2.5 16 3 11C6 13 9 16.5 12 21Z"
      fill="currentColor"
      fillOpacity={active ? 0.12 : 0}
    />
    
    {/* Right outer petal */}
    <path
      d="M12 21C16.5 19.5 21.5 16 21 11C18 13 15 16.5 12 21Z"
      fill="currentColor"
      fillOpacity={active ? 0.12 : 0}
    />
    
    {/* Bottom stem cradle / leaf lines */}
    <path d="M2 18C5 21 10 21.5 12 19C14 21.5 19 21 22 18" />
    <path d="M12 19V22" />
  </svg>
);

// 4. Profile Icon
const ProfileIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "2" : "1.75"}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-colors duration-200 ${
      active ? 'text-[#7A1F2B]' : 'text-[#707070] group-hover:text-[#2B2B2B]'
    }`}
  >
    <circle cx="12" cy="7.5" r="4" />
    <path d="M19 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 5 19.5V21" />
  </svg>
);

// 5. Center AI Sparkle Icon
const AISparklesIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C12 6.41828 8.41828 10 4 10C8.41828 10 12 13.5817 12 18C12 13.5817 15.5817 10 20 10C15.5817 10 12 6.41828 12 2Z"
      fill="#B08D57"
    />
    <path
      d="M18 1.5C18 3.433 16.433 5 14.5 5C16.433 5 18 6.567 18 8.5C18 6.567 19.567 5 21.5 5C19.567 5 18 3.433 18 1.5Z"
      fill="#B08D57"
      opacity="0.85"
    />
  </svg>
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
    { id: 'home', icon: HomeIcon, labelEn: 'Home', labelHi: 'होम' },
    { id: 'panchang', icon: CalendarIcon, labelEn: 'Calendar', labelHi: 'पंचांग' },
    { id: 'chat', isAi: true, labelEn: 'AI', labelHi: 'AI' },
    { 
      id: 'sadhana', 
      icon: ({ active }: { active?: boolean }) => (
        <LotusLogo 
          size={24} 
          active={active} 
          variant="nav" 
          animateBreathing={active} 
          showGlow={active} 
          ariaLabel="Sadhana Sacred Lotus Logo Navigation Tab"
          altText="Sadhana Sacred Lotus Logo"
        />
      ), 
      labelEn: 'Sadhana', 
      labelHi: 'साधना' 
    },
    { id: 'profile', icon: ProfileIcon, labelEn: 'Profile', labelHi: 'प्रोफ़ाइल' }
  ];

  const isAiActive = activeTab.toLowerCase() === 'chat';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3 flex justify-center transition-all duration-300 translate-y-0 opacity-100"
    >
      {/* Floating Capsule Outer Container */}
      <nav
        className="w-full max-w-[440px] sm:max-w-[480px] pointer-events-auto relative"
        aria-label="Primary Navigation"
      >
        {/* Subtle Offline Sync Badge */}
        {pendingSyncs > 0 && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-[#6E1F2A] text-[#F3E5C8] border border-[#D4AF37]/60 shadow-md z-30">
            <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : `${pendingSyncs} Sync Pending`}</span>
          </div>
        )}

        {/* Clean Light Card Bottom Navigation Bar with 22px Radius & Soft Shadow */}
        <div className="relative w-full h-[58px] bg-white/95 dark:bg-[#1E1417]/95 backdrop-blur-md border border-[#E9E2D8] dark:border-[#2D1E23] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-between px-3 sm:px-5">
          
          {/* Center Raised AI Circle: White Circular Button + Thin Gold Ring + Small Glow */}
          <div className="absolute left-1/2 -top-[10px] -translate-x-1/2 w-[56px] h-[56px] rounded-full bg-[#FAF8F3] dark:bg-[#140D0F] border border-[#E9E2D8] dark:border-[#2D1E23] p-1 flex items-center justify-center shadow-md z-20">
            <button
              id="tp-nav-tab-chat"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(25);
                }
                setActiveTab('chat');
              }}
              className={`w-full h-full rounded-full bg-white dark:bg-[#1E1417] border border-[#B08D57] flex flex-col items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-[0_2px_10px_rgba(176,141,87,0.25)] ${
                isAiActive ? 'ring-2 ring-[#7A1F2B] ring-offset-2 ring-offset-[#FAF8F3] dark:ring-offset-[#140D0F] scale-102' : 'hover:border-[#7A1F2B]'
              }`}
              aria-label="AI Assistant"
            >
              <AISparklesIcon size={18} />
              <span className="text-[10px] font-bold text-[#7A1F2B] dark:text-[#B08D57] leading-none mt-0.5">
                AI
              </span>
            </button>
          </div>

          {/* Left Side: Home & Calendar */}
          <div className="relative z-10 flex items-center justify-around w-[40%] pr-1">
            {navItems.slice(0, 2).map((item) => {
              const Active = activeTab.toLowerCase() === item.id.toLowerCase();
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
                  className="flex flex-col items-center justify-center py-1 px-1 min-h-[48px] min-w-[48px] cursor-pointer group focus:outline-none transition-colors"
                  aria-label={language === 'hi' ? item.labelHi : item.labelEn}
                  aria-current={Active ? 'page' : undefined}
                >
                  <div className="flex items-center justify-center">
                    {IconComponent && <IconComponent active={Active} size={20} />}
                  </div>

                  <span
                    className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                      Active ? 'text-[#7A1F2B] dark:text-[#B08D57] font-bold' : 'text-[#707070] dark:text-stone-400 group-hover:text-[#2B2B2B]'
                    }`}
                  >
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </span>

                  {/* Active Indicator Dot under Label */}
                  {Active ? (
                    <span className="w-1 h-1 rounded-full bg-[#7A1F2B] dark:bg-[#B08D57] mt-0.5" />
                  ) : (
                    <span className="w-1 h-1 opacity-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Spacer for Center AI Circle */}
          <div className="w-[44px] shrink-0" />

          {/* Right Side: Sadhana & Profile */}
          <div className="relative z-10 flex items-center justify-around w-[40%] pl-1">
            {navItems.slice(3, 5).map((item) => {
              const Active = activeTab.toLowerCase() === item.id.toLowerCase();
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
                  className="flex flex-col items-center justify-center py-1 px-1 min-h-[48px] min-w-[48px] cursor-pointer group focus:outline-none transition-colors relative"
                  aria-label={language === 'hi' ? item.labelHi : item.labelEn}
                  aria-current={Active ? 'page' : undefined}
                >
                  <div className="flex items-center justify-center relative">
                    {IconComponent && <IconComponent active={Active} size={20} />}

                    {item.id === 'sadhana' && pendingSyncs > 0 && (
                      <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#7A1F2B]" />
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                      Active ? 'text-[#7A1F2B] dark:text-[#B08D57] font-bold' : 'text-[#707070] dark:text-stone-400 group-hover:text-[#2B2B2B]'
                    }`}
                  >
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </span>

                  {/* Active Indicator Dot under Label */}
                  {Active ? (
                    <span className="w-1 h-1 rounded-full bg-[#7A1F2B] dark:bg-[#B08D57] mt-0.5" />
                  ) : (
                    <span className="w-1 h-1 opacity-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </nav>
    </div>
  );
};

export default TerapanthFooterNav;




