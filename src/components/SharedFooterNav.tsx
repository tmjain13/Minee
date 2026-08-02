import React, { ReactNode } from 'react';
import LotusLogo from './LotusLogo';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: ReactNode;
}

// Custom icons matching the image design
const HomeSolidIcon = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className={active ? "text-[#FFFDF8]" : "text-[#E6CDAA]/85"}>
    <path d="M12 2.5L2 11h3v10.5a1 1 0 001 1h12a1 1 0 001-1V11h3L12 2.5z" />
  </svg>
);

const CalendarGridIcon = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.75"} strokeLinecap="round" strokeLinejoin="round" className={active ? "text-[#FFFDF8]" : "text-[#E6CDAA]/85"}>
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

const LotusPetalIcon = ({ active }: { active?: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "1.5" : "1.75"}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={active ? "text-[#FFFDF8]" : "text-[#E6CDAA]/85"}
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

const ProfileOutlineIcon = ({ active }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.75"} strokeLinecap="round" strokeLinejoin="round" className={active ? "text-[#FFFDF8]" : "text-[#E6CDAA]/85"}>
    <circle cx="12" cy="7.5" r="4" />
    <path d="M19 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 5 19.5V21" />
  </svg>
);

const AISparkleCluster = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C12 6.41828 8.41828 10 4 10C8.41828 10 12 13.5817 12 18C12 13.5817 15.5817 10 20 10C15.5817 10 12 6.41828 12 2Z" fill="url(#sharedGoldSparkleGrad)" />
    <path d="M18 1.5C18 3.433 16.433 5 14.5 5C16.433 5 18 6.567 18 8.5C18 6.567 19.567 5 21.5 5C19.567 5 18 3.433 18 1.5Z" fill="url(#sharedGoldSparkleGrad)" opacity="0.9" />
    <path d="M6 14.5C6 15.8807 4.88071 17 3.5 17C4.88071 17 6 18.1193 6 19.5C6 18.1193 7.11929 17 8.5 17C7.11929 17 6 15.8807 6 14.5Z" fill="url(#sharedGoldSparkleGrad)" opacity="0.85" />
    <defs>
      <linearGradient id="sharedGoldSparkleGrad" x1="4" y1="2" x2="21.5" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E6C065" />
        <stop offset="0.5" stopColor="#C59B27" />
        <stop offset="1" stopColor="#9E7312" />
      </linearGradient>
    </defs>
  </svg>
);

export const getNavConfig = (t: (key: string) => string): NavItemConfig[] => [
  { id: 'HOME', label: t('home') || 'Home', icon: <HomeSolidIcon /> },
  { id: 'PANCHANG', label: t('panchang') || 'Calendar', icon: <CalendarGridIcon /> },
  { id: 'CHAT', label: 'AI', icon: <AISparkleCluster /> },
  { id: 'SADHANA', label: t('sadhana') || 'Sadhana', icon: <LotusLogo size={24} variant="nav" ariaLabel="Sadhana Sacred Lotus Logo Navigation Tab" altText="Sadhana Sacred Lotus Logo" /> },
  { id: 'PROFILE', label: 'Profile', icon: <ProfileOutlineIcon /> }
];

interface SharedFooterNavProps {
  navConfig: NavItemConfig[];
  activeNav: string;
  isQuickActionsOpen: boolean;
  onNavClick: (id: string) => void;
  isDark: boolean;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  style?: React.CSSProperties;
}

export const SharedFooterNav: React.FC<SharedFooterNavProps> = ({
  activeNav,
  onNavClick,
  style
}) => {
  const isAiActive = activeNav.toUpperCase() === 'CHAT';

  return (
    <nav 
      role="navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none pb-3"
      style={style}
    >
      <div className="max-w-[460px] sm:max-w-[500px] mx-auto px-3 pointer-events-auto relative">
        <div className="relative w-full h-[62px] flex items-center justify-between px-4 sm:px-6">
          {/* SVG Background for Seamless Top Arched Pill Container */}
          <svg
            className="absolute inset-0 w-full h-full drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
            viewBox="0 0 500 70"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sharedFooterMaroonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#781822" />
                <stop offset="45%" stopColor="#871A27" />
                <stop offset="100%" stopColor="#560F18" />
              </linearGradient>
            </defs>
            <path
              d="M 30 8 L 208 8 C 220 8 224 -6 250 -6 C 276 -6 280 8 292 8 L 470 8 A 27 27 0 0 1 470 62 L 292 62 C 280 62 276 68 250 68 C 224 68 220 62 208 62 L 30 62 A 27 27 0 0 1 30 8 Z"
              fill="url(#sharedFooterMaroonGrad)"
              stroke="#D4AF37"
              strokeWidth="1.5"
            />
          </svg>

          {/* Center Elevated AI White Circle Button */}
          <div className="absolute left-1/2 -top-[14px] -translate-x-1/2 z-20">
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(25);
                }
                onNavClick('CHAT');
              }}
              className={`w-[66px] h-[66px] rounded-full bg-[#FFFDF8] border-2 border-[#D4AF37] flex flex-col items-center justify-center transition-transform duration-200 active:scale-95 cursor-pointer shadow-[0_0_22px_rgba(255,230,170,0.7)] ${
                isAiActive ? 'ring-2 ring-[#FFD700] ring-offset-2 ring-offset-[#781822] scale-102' : 'hover:bg-white'
              }`}
              aria-label="AI Assistant"
            >
              <AISparkleCluster />
              <span className="text-[11px] font-bold text-[#6E1620] leading-none flex items-center gap-0.5 mt-0.5">
                <span className="text-[8px] text-[#C59B27]">✨</span>
                AI
              </span>
            </button>
          </div>

          {/* Left Side: Home & Calendar */}
          <div className="relative z-10 flex items-center justify-around w-[42%] pr-2">
            {[
              { id: 'HOME', label: 'Home', icon: HomeSolidIcon },
              { id: 'PANCHANG', label: 'Calendar', icon: CalendarGridIcon },
            ].map((item) => {
              const Active = activeNav.toUpperCase() === item.id;
              const IconComp = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(15);
                    }
                    onNavClick(item.id);
                  }}
                  className="flex flex-col items-center justify-center py-1 px-1 min-h-[48px] min-w-[48px] cursor-pointer group focus:outline-none transition-colors"
                >
                  <IconComp active={Active} />
                  <span
                    className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                      Active ? 'text-[#FFFDF8] font-semibold' : 'text-[#E6CDAA]/85 group-hover:text-[#FFFDF8]'
                    }`}
                  >
                    {item.label}
                  </span>
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
          <div className="w-[60px] shrink-0" />

          {/* Right Side: Sadhana & Profile */}
          <div className="relative z-10 flex items-center justify-around w-[42%] pl-2">
            {[
              { id: 'SADHANA', label: 'Sadhana', icon: LotusPetalIcon },
              { id: 'PROFILE', label: 'Profile', icon: ProfileOutlineIcon },
            ].map((item) => {
              const Active = activeNav.toUpperCase() === item.id;
              const IconComp = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(15);
                    }
                    onNavClick(item.id);
                  }}
                  className="flex flex-col items-center justify-center py-1 px-1 min-h-[48px] min-w-[48px] cursor-pointer group focus:outline-none transition-colors"
                >
                  {item.id === 'SADHANA' ? (
                    <LotusLogo
                      size={24}
                      active={Active}
                      variant="nav"
                      animateBreathing={Active}
                      showGlow={Active}
                      ariaLabel="Sadhana Sacred Lotus Logo Navigation Tab"
                      altText="Sadhana Sacred Lotus Logo"
                    />
                  ) : (
                    <IconComp active={Active} />
                  )}
                  <span
                    className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                      Active ? 'text-[#FFFDF8] font-semibold' : 'text-[#E6CDAA]/85 group-hover:text-[#FFFDF8]'
                    }`}
                  >
                    {item.label}
                  </span>
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
      </div>
    </nav>
  );
};

