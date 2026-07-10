import React, { ReactNode } from 'react';
import { Home, ShieldCheck, MessageCircle, User, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: ReactNode;
}

export const getNavConfig = (t: (key: string) => string): NavItemConfig[] => [
  { id: 'HOME', label: t('home') || 'Home', icon: <Home size={22} /> },
  { id: 'CHAT', label: t('chat') || 'AI Chat', icon: <MessageCircle size={22} /> },
  { id: 'SADHANA', label: t('sadhana') || 'Sadhana', icon: <ShieldCheck size={22} /> },
  { id: 'PANCHANG', label: t('panchang') || 'Panchang', icon: <Calendar size={22} /> },
  { id: 'PROFILE', label: 'Profile', icon: <User size={22} /> }
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
  navConfig,
  activeNav,
  isQuickActionsOpen,
  onNavClick,
  isDark,
  onSwipeUp,
  onSwipeDown,
  style
}) => {
  const [touchStartY, setTouchStartY] = React.useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    
    if (deltaY > 30 && onSwipeUp) {
      onSwipeUp();
    } else if (deltaY < -30 && onSwipeDown) {
      onSwipeDown();
    }
    setTouchStartY(null);
  };

  return (
    <div 
      className="bottom-panel-container fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-zinc-950 border-t border-orange-200 dark:border-orange-900 shadow-[0_-4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.5)] transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        padding: '8px 6px calc(8px + env(safe-area-inset-bottom, 12px)) 6px',
        ...style
      }}
    >
      <div 
        className="w-full max-w-[800px] mx-auto flex items-center justify-around relative"
      >
        {navConfig.map((item) => {
          const isActive = activeNav === item.id || (item.id === 'QUICK' && isQuickActionsOpen);
          
          return (
            <motion.button
              key={item.id}
              id={`nav-tab-${item.id.toLowerCase()}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(40);
                }
                onNavClick(item.id);
              }}
              className="flex-1 flex flex-col items-center justify-center min-w-[60px] flex-shrink-0 bg-transparent border-none p-0 outline-none cursor-pointer select-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div
                className={`flex flex-col items-center justify-center px-4 py-1 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#FF0000] text-white' 
                    : 'bg-transparent text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="shared-nav-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: '#FF0000',
                      borderRadius: '16px',
                      zIndex: 0
                    }}
                  />
                )}
                
                <div 
                  className="relative z-10 flex items-center justify-center h-6"
                  style={{
                    transform: isActive ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {item.icon}
                </div>
                
                <span 
                  className="relative z-10 text-[9px] tracking-wider uppercase font-semibold text-center mt-0.5 block truncate w-full"
                  style={{
                    fontWeight: isActive ? '700' : '600',
                    fontFamily: '"Space Grotesk", Inter, sans-serif',
                  }}
                >
                  {item.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
