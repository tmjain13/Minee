import React, { Suspense } from 'react';

// 1. Feature Flags Configuration
export const FEATURE_FLAGS = {
  enableQuiz: true,
  enableViharTracking: true,
  enableSadhanaDiary: true,
  enableAdminTools: false, // Set to true only for admins
};

// 2. Standardized Error Boundary
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ComponentErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ComponentRegistry ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) return <div className="p-4 text-xs text-red-500 border border-red-200 bg-red-50 rounded-xl">Component failed to load.</div>;
    return this.props.children;
  }
}

// 3. Lazy Loading Wrapper Function with self-healing default fallback
const lazyWrap = (importFunc: () => Promise<any>, exportName?: string) => {
  const LazyComponent = React.lazy(() => importFunc().then(m => {
    if (exportName && m[exportName]) {
      return { default: m[exportName] };
    }
    if (m.default) return { default: m.default };
    const firstFunc = Object.values(m).find(v => typeof v === 'function');
    if (firstFunc) return { default: firstFunc };
    return m;
  }));
  return (props: any) => (
    <ComponentErrorBoundary>
      <Suspense fallback={<div className="animate-pulse h-24 bg-stone-100 dark:bg-stone-800 rounded-xl w-full"></div>}>
        <LazyComponent {...props} />
      </Suspense>
    </ComponentErrorBoundary>
  );
};

// 4. Registry Mapping of the components
export const Registry = {
  // HOME TAB
  DailyQuizChallenge: lazyWrap(() => import('../components/DailyQuizChallenge')),
  SunriseSunset: lazyWrap(() => import('../components/SunriseSunset')),
  UnifiedHomeDashboard: lazyWrap(() => import('../components/UnifiedHomeDashboard')),
  DailyReflectionEngineV2: lazyWrap(() => import('../components/DailyReflectionEngineV2')),
  DailySuvichar: lazyWrap(() => import('../components/DailySuvichar')),
  TerapanthNewsFeed: lazyWrap(() => import('../components/TerapanthNewsFeed')),
  QuickActions: lazyWrap(() => import('../components/QuickActions')),
  
  // SADHANA TAB
  SadhanaTracker: lazyWrap(() => import('../components/SadhanaTracker')),
  DhyanTimer: lazyWrap(() => import('../components/DhyanTimer')),
  DailyVachan: lazyWrap(() => import('../components/DailyVachan')),
  SadhanaDiary: lazyWrap(() => import('../components/SadhanaDiary')),
  SadhanaGratitude: lazyWrap(() => import('../components/SadhanaGratitude')),
  SadhanaStreaks: lazyWrap(() => import('../components/SadhanaStreaks')),
  HabitsCalendar: lazyWrap(() => import('../components/HabitsCalendar')),
  RozKiSalah: lazyWrap(() => import('../components/RozKiSalah')),
  SevaLedger: lazyWrap(() => import('../components/SevaLedger')),
  PushNotificationSimulator: lazyWrap(() => import('../components/PushNotificationSimulator')),
  BeadCounter: lazyWrap(() => import('../components/BeadCounter')),
  NavkarMantra: lazyWrap(() => import('../components/NavkarMantra')),
  RitualFlow: lazyWrap(() => import('../components/RitualFlow')),
  PratikramanGuide: lazyWrap(() => import('../components/PratikramanGuide')),
  KarmaTheory: lazyWrap(() => import('../components/KarmaTheory')),
  PrekshaVisualizer: lazyWrap(() => import('../components/PrekshaVisualizer')),
  SpiritualJournal: lazyWrap(() => import('../components/SpiritualJournal')),
  SadhalaAuthAndPanchangHub: lazyWrap(() => import('../components/SadhalaAuthAndPanchangHub')),
  TerapanthGoldAdditions: lazyWrap(() => import('../components/TerapanthGoldAdditions')),
  SadhanaStreaksComponent: lazyWrap(() => import('../components/SadhanaStreaks')),
  TapaLeaderboard: lazyWrap(() => import('../components/TapaLeaderboard')),
  TapaScheduler: lazyWrap(() => import('../components/TapaScheduler')),

  // PANCHANG TAB
  LiveViharLedger2026: lazyWrap(() => import('../components/LiveViharLedger2026'), 'LiveViharLedger2026'),
  PanchangSection: lazyWrap(() => import('../components/PanchangSection')),
  LiveLocationVihar2026: lazyWrap(() => import('../components/LiveLocationVihar2026')),
  ViharTracker: lazyWrap(() => import('../components/ViharTracker')),
  ViharStatusCard: lazyWrap(() => import('../components/ViharStatusCard')),
  SacredPlacesMap: lazyWrap(() => import('../components/SacredPlacesMap')),
  TerapanthCalendar: lazyWrap(() => import('../components/TerapanthCalendar')),
  ChaturmasMasterPortal2026: lazyWrap(() => import('../components/ChaturmasMasterPortal2026')),
  ChaturmasRegistry: lazyWrap(() => import('../components/ChaturmasRegistry')),

  // PROFILE / REGISTRY TAB
  AcharyaArchiveModal: lazyWrap(() => import('../components/AcharyaArchiveModal')),
  BahushrutParishadPortal: lazyWrap(() => import('../components/BahushrutParishadPortal')),
  AdminRouteWrapper: lazyWrap(() => import('../components/AdminGuard')),
  ProfileTab: lazyWrap(() => import('../components/ProfileTab')),
  SadhviPramukhaPortal: lazyWrap(() => import('../components/SadhviPramukhaPortal')),
  SadhviRajimatiPortal: lazyWrap(() => import('../components/SadhviRajimatiPortal')),
  SadhviVaryaPortal: lazyWrap(() => import('../components/SadhviVaryaPortal')),
  SaintsList: lazyWrap(() => import('../components/SaintsList')),
  UnifiedRegistry: lazyWrap(() => import('../components/UnifiedRegistry')),
  MukhyamuniPortal: lazyWrap(() => import('../components/MukhyamuniPortal')),
  MuniDineshComparativePortal: lazyWrap(() => import('../components/MuniDineshComparativePortal')),
  MuniUditChronology: lazyWrap(() => import('../components/MuniUditChronology')),

  // ADDITIONAL INTERACTIVE TABS & MODALS
  GalleryTab: lazyWrap(() => import('../components/GalleryTab')),
  CommunityPolls: lazyWrap(() => import('../components/CommunityPolls')),
  CommunityPrayerWall: lazyWrap(() => import('../components/CommunityPrayerWall')),
  MediaCenter: lazyWrap(() => import('../components/MediaCenter')),
  AudioCenter: lazyWrap(() => import('../components/AudioCenter')),
  DigitalLibrary: lazyWrap(() => import('../components/DigitalLibrary')),
  DigitalGyanshala: lazyWrap(() => import('../components/DigitalGyanshala')),
  GyanshalaKids: lazyWrap(() => import('../components/GyanshalaKids')),
  MaryadaQuiz: lazyWrap(() => import('../components/MaryadaQuiz')),
  UnifiedQuizEngine: lazyWrap(() => import('../components/UnifiedQuizEngine')),
  AgamShorts: lazyWrap(() => import('../components/AgamShorts')),
  SutraLibrary: lazyWrap(() => import('../components/SutraLibrary')),
  AnuvratPledge: lazyWrap(() => import('../components/AnuvratPledge')),
  ParyushanaTab: lazyWrap(() => import('../components/ParyushanaTab')),
  ParyushanaMode: lazyWrap(() => import('../components/ParyushanaMode')),
  ChauviharAlert: lazyWrap(() => import('../components/ChauviharAlert')),
  AiSmartFaqEngine: lazyWrap(() => import('../components/AiSmartFaqEngine'), 'AiSmartFaqEngine'),
  PermanentBhawanDirectory: lazyWrap(() => import('../components/PermanentBhawanDirectory')),
  EnhancedCityDirectory2026: lazyWrap(() => import('../components/EnhancedCityDirectory2026')),
  TerapanthMasterHub2026: lazyWrap(() => import('../components/TerapanthMasterHub2026'), 'TerapanthMasterHub2026'),
  
  // SHELL & OVERLAYS
  AdminPanel: lazyWrap(() => import('../components/AdminPanel')),
  LoginModal: lazyWrap(() => import('../components/LoginModal')),
  Onboarding: lazyWrap(() => import('../components/Onboarding')),
  ThemeCustomizer: lazyWrap(() => import('../components/ThemeCustomizer')),
  UnifiedPermissionsModal: lazyWrap(() => import('../components/UnifiedPermissionsModal')),
  NavigationController: lazyWrap(() => import('../components/NavigationController'), 'NavigationController'),
  ChatAgentOverlay: lazyWrap(() => import('../components/ChatAgentOverlay')),
  TerapanthLightChatUI: lazyWrap(() => import('../components/TerapanthLightChatUI'), 'TerapanthLightChatUI'),
  SharedFooterNav: lazyWrap(() => import('../components/SharedFooterNav')),
  TerapanthFooterNav: lazyWrap(() => import('../components/TerapanthFooterNav')),
  TerapanthHeader: lazyWrap(() => import('../components/TerapanthHeader')),
  PermissionCard: lazyWrap(() => import('../components/PermissionCard')),
  DashboardCustomizerModal: lazyWrap(() => import('../components/DashboardCustomizerModal')),
  FeedbackModal: lazyWrap(() => import('../components/FeedbackModal')),
  FullScreenImageViewer: lazyWrap(() => import('../components/FullScreenImageViewer')),
  LoadingScreen: lazyWrap(() => import('../components/LoadingScreen')),
  ThemeCustomizerModal: lazyWrap(() => import('../components/ThemeCustomizer')),
  TerapanthOverview: lazyWrap(() => import('../components/TerapanthOverview')),
};

export const LazyWrapper = ({ componentKey, ...props }: { componentKey: keyof typeof Registry } & any) => {
  const Component = Registry[componentKey];
  return <Component {...props} />;
};

