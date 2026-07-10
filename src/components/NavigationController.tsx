import React from 'react';
import { SharedFooterNav, getNavConfig } from './SharedFooterNav';
import { useLanguage } from '../context/LanguageContext';
import { useChatFocus } from '../context/ChatFocusContext';

export interface NavigationControllerProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setSadhanaSubTab: (tab: any) => void;
  isQuickActionsOpen: boolean;
  setIsQuickActionsOpen: (isOpen: boolean) => void;
}

export const NavigationController = ({
  activeTab,
  setActiveTab,
  setSadhanaSubTab,
  isQuickActionsOpen,
  setIsQuickActionsOpen
}: NavigationControllerProps) => {
  const { t } = useLanguage();
  const { isChatInputFocused } = useChatFocus();
  const navConfig = getNavConfig(t);
  
  // Detect dark mode automatically roughly (if needed)
  const isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isChatInputFocused) return null;

  return (
    <SharedFooterNav
      navConfig={navConfig}
      activeNav={activeTab.toUpperCase()}
      isQuickActionsOpen={isQuickActionsOpen}
      isDark={isDark}
      onNavClick={(id) => {
        if (id === 'QUICK') {
          setIsQuickActionsOpen(!isQuickActionsOpen);
        } else {
          setActiveTab(id.toLowerCase() as any);
          if (id === 'SADHANA') setSadhanaSubTab('timer');
          setIsQuickActionsOpen(false);
        }
      }}
      onSwipeUp={() => setIsQuickActionsOpen(true)}
      onSwipeDown={() => setIsQuickActionsOpen(false)}
      style={{
        position: 'relative',
        height: 'calc(64px + env(safe-area-inset-bottom, 12px))',
        paddingTop: '8px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 12px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    />
  );
};
