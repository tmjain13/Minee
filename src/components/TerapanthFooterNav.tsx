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

// 1. Home Icon (Solid fill house matching image)
const HomeIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`transition-colors duration-200 ${
      active ? 'text-[#FFFDF8]' : 'text-[#E6CDAA]/85 group-hover:text-[#FFFDF8]'
    }`}
  >
    <path d="M12 2.5L2 11h3v10.5a1 1 0 001 1h12a1 1 0 001-1V11h3L12 2.5z" />
  </svg>
);

// 2. Calendar Icon (Outline grid calendar matching image)
const CalendarIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 22 }) => (
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
      active ? 'text-[#FFFDF8]' : 'text-[#E6CDAA]/85 group-hover:text-[#FFFDF8]'
    }`}
  >
    <rect x="3" y="4" width="18" height="17" rx="3.5" ry="3.5" />
    <line x1="16" y1="2" x2="16" y2="5" strokeWidth="2.2" />
    <line x1="8" y1="2" x2="8" y2="5" strokeWidth="2.2" />
    <line x1="3" y1="9" x2="21" y2="9" strokeWidth="1.2" />
    <circle cx="7.5" cy="12.5" r="1" fill="currentColor" />
    <circle cx="12" cy="12.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="12.5" r="1" fill="currentColor" />
    <circle cx="7.5" cy="16.5" r="1" fill="currentColor" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="16.5" r="1" fill="currentColor" />
  </svg>
);

// 3. Lotus Icon for Sadhana (Exact gold lotus vector matching image with central star)
const LotusIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 90"
    fill="none"
    className={`transition-colors duration-200 ${
      active ? 'text-[#FFFDF8]' : 'text-[#E6CDAA]/85 group-hover:text-[#FFFDF8]'
    }`}
  >
    {/* 4-pointed sparkle star inside upper central petal */}
    <path
      d="M50 24 C50 30 46 34 39 34 C46 34 50 38 50 44 C50 38 54 34 61 34 C54 34 50 30 50 24 Z"
      fill="currentColor"
    />

    {/* Central Petal Outline */}
    <path
      d="M50 78 C38 58 38 36 50 16 C62 36 62 58 50 78 Z"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Inner bottom stem lines inside central petal */}
    <path
      d="M50 78 C50 62 42 52 42 45"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M50 78 C50 62 58 52 58 45"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Middle layer petals */}
    <path
      d="M50 78 C31 68 25 48 31 34 M31 34 C38 29 44 26 50 24"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M50 78 C69 68 75 48 69 34 M69 34 C62 29 56 26 50 24"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Upper back petals */}
    <path
      d="M31 34 C30 26 36 21 44 20"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M69 34 C70 26 64 21 56 20"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Outer side wing petals and bottom cradle arch */}
    <path
      d="M31 34 C18 39 12 44 10 49 C18 69 34 76 50 78"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M69 34 C82 39 88 44 90 49 C82 69 66 76 50 78"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 4. Profile Icon (User head and shoulder outline)
const ProfileIcon: React.FC<{ active?: boolean; size?: number }> = ({ active, size = 22 }) => (
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
      active ? 'text-[#FFFDF8]' : 'text-[#E6CDAA]/85 group-hover:text-[#FFFDF8]'
    }`}
  >
    <circle cx="12" cy="7.5" r="4" />
    <path d="M19 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 5 19.5V21" />
  </svg>
);

// 5. Center AI Sparkle Cluster Icon
const AISparklesIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Main central sparkle */}
    <path
      d="M12 2C12 6.41828 8.41828 10 4 10C8.41828 10 12 13.5817 12 18C12 13.5817 15.5817 10 20 10C15.5817 10 12 6.41828 12 2Z"
      fill="url(#goldSparkleGrad)"
    />
    {/* Top right smaller sparkle */}
    <path
      d="M18 1.5C18 3.433 16.433 5 14.5 5C16.433 5 18 6.567 18 8.5C18 6.567 19.567 5 21.5 5C19.567 5 18 3.433 18 1.5Z"
      fill="url(#goldSparkleGrad)"
      opacity="0.9"
    />
    {/* Bottom left tiny sparkle */}
    <path
      d="M6 14.5C6 15.8807 4.88071 17 3.5 17C4.88071 17 6 18.1193 6 19.5C6 18.1193 7.11929 17 8.5 17C7.11929 17 6 15.8807 6 14.5Z"
      fill="url(#goldSparkleGrad)"
      opacity="0.85"
    />
    <defs>
      <linearGradient id="goldSparkleGrad" x1="4" y1="2" x2="21.5" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E6C065" />
        <stop offset="0.5" stopColor="#C59B27" />
        <stop offset="1" stopColor="#9E7312" />
      </linearGradient>
    </defs>
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

  const isAiActive = activeTab.toLowerCase() === 'chat';

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3 flex justify-center transition-all duration-300 ${
        isPaginationVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
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

        {/* Maroon Pill Bar Container with Center Arched Bridge */}
        <div className="relative w-full h-[60px] bg-gradient-to-r from-[#781822] via-[#851D29] to-[#560F18] border border-[#D4AF37] rounded-full shadow-[0_10px_32px_rgba(0,0,0,0.5)] flex items-center justify-between px-3 sm:px-6">
          
          {/* Center Raised Bridge Ring and AI Circle */}
          <div className="absolute left-1/2 -top-[16px] -translate-x-1/2 w-[72px] h-[72px] rounded-full bg-gradient-to-b from-[#851D29] to-[#6E1F2A] border border-[#D4AF37] p-1 flex items-center justify-center shadow-lg z-20">
            <button
              id="tp-nav-tab-chat"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(25);
                }
                setActiveTab('chat');
              }}
              className={`w-full h-full rounded-full bg-[#FFFDF8] border-2 border-[#D4AF37] flex flex-col items-center justify-center transition-transform duration-200 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(255,230,170,0.8)] ${
                isAiActive ? 'ring-2 ring-[#FFD700] ring-offset-2 ring-offset-[#781822] scale-102' : 'hover:bg-white'
              }`}
              aria-label="AI Assistant"
            >
              <AISparklesIcon size={24} />
              <span className="text-[11px] font-bold text-[#6E1620] leading-none flex items-center gap-0.5 mt-0.5">
                <span className="text-[8px] text-[#C59B27]">✨</span>
                {language === 'hi' ? 'AI' : 'AI'}
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
                  className="flex flex-col items-center justify-center py-1 cursor-pointer group focus:outline-none transition-colors"
                  aria-label={language === 'hi' ? item.labelHi : item.labelEn}
                  aria-current={Active ? 'page' : undefined}
                >
                  <div className="flex items-center justify-center">
                    {IconComponent && <IconComponent active={Active} size={22} />}
                  </div>

                  <span
                    className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                      Active ? 'text-[#FFFDF8] font-semibold' : 'text-[#E6CDAA]/85 group-hover:text-[#FFFDF8]'
                    }`}
                  >
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </span>

                  {/* Active Indicator Dot under Label */}
                  {Active ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5BA60] mt-0.5 shadow-xs" />
                  ) : (
                    <span className="w-1.5 h-1.5 opacity-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Spacer for Center AI Circle */}
          <div className="w-[56px] shrink-0" />

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
                  className="flex flex-col items-center justify-center py-1 cursor-pointer group focus:outline-none transition-colors relative"
                  aria-label={language === 'hi' ? item.labelHi : item.labelEn}
                  aria-current={Active ? 'page' : undefined}
                >
                  <div className="flex items-center justify-center relative">
                    {IconComponent && <IconComponent active={Active} size={22} />}

                    {item.id === 'sadhana' && pendingSyncs > 0 && (
                      <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#D4AF37] ring-1 ring-[#6E1F2A]" />
                    )}
                  </div>

                  <span
                    className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                      Active ? 'text-[#FFFDF8] font-semibold' : 'text-[#E6CDAA]/85 group-hover:text-[#FFFDF8]'
                    }`}
                  >
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </span>

                  {/* Active Indicator Dot under Label */}
                  {Active ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5BA60] mt-0.5 shadow-xs" />
                  ) : (
                    <span className="w-1.5 h-1.5 opacity-0 mt-0.5" />
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




