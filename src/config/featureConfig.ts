export interface FeatureSettings {
  enabled: boolean;
  order: number;
  lazy: boolean;
}

export const FEATURE_MANIFEST: Record<string, FeatureSettings> = {
  chronometer: {
    enabled: true,
    order: 1,
    lazy: false,
  },
  dailySuvichar: {
    enabled: true,
    order: 2,
    lazy: true,
  },
  streakWidget: {
    enabled: true,
    order: 3,
    lazy: true,
  },
  sadhanaTracker: {
    enabled: true,
    order: 4,
    lazy: true,
  },
  quizShortcut: {
    enabled: true,
    order: 5,
    lazy: true,
  },
  liveStats: {
    enabled: true,
    order: 6,
    lazy: true,
  },
};
