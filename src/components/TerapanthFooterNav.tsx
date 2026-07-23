import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSyncQueueSize, syncPendingRecords, isOnline } from '../services/sadhanaOfflineSync';

interface TerapanthFooterNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string;
  isPaginationVisible?: boolean;
}

// 1. Home Icon (Filled or Outlined matching image)
const HomeIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={active ? "0" : "1.8"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" />
  </svg>
);

// 2. Calendar Icon (Matching grid image)
const CalendarIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "2.2" : "1.8"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="17" rx="3.5" ry="3.5" />
    <line x1="16" y1="2" x2="16" y2="5" strokeWidth="2" />
    <line x1="8" y1="2" x2="8" y2="5" strokeWidth="2" />
    <line x1="3" y1="9" x2="21" y2="9" strokeWidth="1.5" />
    <circle cx="7.5" cy="12.5" r="1" fill="currentColor" />
    <circle cx="12" cy="12.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="12.5" r="1" fill="currentColor" />
    <circle cx="7.5" cy="16.5" r="1" fill="currentColor" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="16.5" r="1" fill="currentColor" />
  </svg>
);

// 3. Lotus Icon for Sadhana (Multi-petal line art matching image)
const LotusIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "2" : "1.75"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Center lotus petal */}
    <path d="M12 3C9.5 7.5 8 12 12 18.5C16 12 14.5 7.5 12 3Z" fill={active ? "currentColor" : "none"} fillOpacity="0.15" />
    {/* Middle left & right petals */}
    <path d="M12 18.5C8 14 4.5 12 3 14.5C1.5 17 6 19 12 18.5Z" />
    <path d="M12 18.5C16 14 19.5 12 21 14.5C22.5 17 18 19 12 18.5Z" />
    {/* Base outer petals */}
    <path d="M12 18.5C7.5 16.5 3.5 15.5 2 18C4 20.5 8.5 19.8 12 18.5Z" />
    <path d="M12 18.5C16.5 16.5 20.5 15.5 22 18C20 20.5 15.5 19.8 12 18.5Z" />
  </svg>
);

// 4. Profile Icon
const ProfileIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "2.2" : "1.8"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// 5. Center AI Sparkle Star Icon
const AISparkleIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-[#C59B27]">
    <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" />
    <path d="M19 3C19 5.2 17.2 7 15 7C17.2 7 19 8.8 19 11C19 8.8 20.8 7 23 7C20.8 7 19 5.2 19 3Z" opacity="0.8" />
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
    { id: 'sadhana', icon: LotusIcon, labelEn: 'Sadhana', labelHi: 'साधना' },
    { id: 'profile', icon: ProfileIcon, labelEn: 'Profile', labelHi: 'प्रोफ़ाइल' }
  ];

  return (
    <div
      className={`fixed bottom-4 left-0 right-0 z-50 px-3 md:px-6 pointer-events-none transition-all duration-300 ${
        isPaginationVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      {/* Outer Floating Container with Gold Border and Soft Deep Shadow */}
      <nav
        className="max-w-lg mx-auto pointer-events-auto relative shadow-[0_12px_36px_rgba(110,31,42,0.3)] rounded-full"
        aria-label="Primary Navigation"
      >
        {/* Subtle Offline Sync Badge */}
        {pendingSyncs > 0 && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-[#6E1F2A] text-[#F3E5C8] border border-[#D4AF37]/50 shadow-md">
            <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : `${pendingSyncs} Sync Pending`}</span>
          </div>
        )}

        {/* Main Maroon Pill Bar with Curved Center Notch */}
        <div className="relative bg-gradient-to-b from-[#8B2232] via-[#7B1B28] to-[#5C101A] border border-[#C59B27]/60 rounded-full px-4 py-2 flex items-center justify-between text-[#F3E5C8]">
          
          {/* Central Raised Arch/Bridge Ring for AI Circle */}
          <div className="absolute left-1/2 -top-5 -translate-x-1/2 w-[72px] h-[72px] rounded-full bg-gradient-to-b from-[#8B2232] to-[#6E1F2A] border border-[#C59B27]/70 p-1 flex items-center justify-center shadow-[0_4px_18px_rgba(0,0,0,0.25)]">
            {/* Inner AI White Button */}
            <button
              id="tp-nav-tab-chat"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(25);
                }
                setActiveTab('chat');
              }}
              className={`w-full h-full rounded-full bg-[#FFFDF9] flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.7)] ${
                activeTab === 'chat' ? 'ring-2 ring-[#C59B27] scale-102' : 'hover:bg-white'
              }`}
              aria-label="AI Assistant"
            >
              <AISparkleIcon size={22} />
              <span className="text-[10px] font-bold text-[#6E1F2A] leading-tight flex items-center gap-0.5 mt-0.5">
                <span className="text-[8px] text-[#C59B27]">✨</span>
                {language === 'hi' ? 'AI' : 'AI'}
              </span>
            </button>
          </div>

          {/* Left Side: Home & Calendar */}
          <div className="flex items-center justify-around w-[40%] pr-2">
            {navItems.slice(0, 2).map((item) => {
              const Active = activeTab === item.id;
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
                  className="flex flex-col items-center justify-center py-1 cursor-pointer group focus:outline-none transition-colors"
                  aria-label={language === 'hi' ? item.labelHi : item.labelEn}
                  aria-current={Active ? 'page' : undefined}
                >
                  <div
                    className={`transition-colors duration-200 ${
                      Active ? 'text-[#FFFDF8] scale-105' : 'text-[#E6CDAA]/80 group-hover:text-[#FFFDF8]'
                    }`}
                  >
                    {IconComponent && <IconComponent active={Active} size={21} />}
                  </div>

                  <span
                    className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                      Active ? 'text-[#FFFDF8] font-bold' : 'text-[#E6CDAA]/80 group-hover:text-[#FFFDF8]'
                    }`}
                  >
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </span>

                  {/* Active Indicator Dot under Label */}
                  {Active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5BA60] mt-0.5 shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Spacer for Middle Elevated AI Circle */}
          <div className="w-[60px] shrink-0" />

          {/* Right Side: Sadhana & Profile */}
          <div className="flex items-center justify-around w-[40%] pl-2">
            {navItems.slice(3, 5).map((item) => {
              const Active = activeTab === item.id;
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
                  className="flex flex-col items-center justify-center py-1 cursor-pointer group focus:outline-none transition-colors relative"
                  aria-label={language === 'hi' ? item.labelHi : item.labelEn}
                  aria-current={Active ? 'page' : undefined}
                >
                  <div
                    className={`transition-colors duration-200 ${
                      Active ? 'text-[#FFFDF8] scale-105' : 'text-[#E6CDAA]/80 group-hover:text-[#FFFDF8]'
                    }`}
                  >
                    {IconComponent && <IconComponent active={Active} size={21} />}

                    {item.id === 'sadhana' && pendingSyncs > 0 && (
                      <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#D4AF37] ring-1 ring-[#6E1F2A]" />
                    )}
                  </div>

                  <span
                    className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                      Active ? 'text-[#FFFDF8] font-bold' : 'text-[#E6CDAA]/80 group-hover:text-[#FFFDF8]'
                    }`}
                  >
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </span>

                  {/* Active Indicator Dot under Label */}
                  {Active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5BA60] mt-0.5 shadow-xs" />
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



