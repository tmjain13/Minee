import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, Eye, EyeOff, RefreshCw, Save, Sparkles, UserCheck } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { User } from 'firebase/auth';

export interface DashboardPreferences {
  sadhana_tracker: boolean;
  quick_actions: boolean;
  quick_links: boolean;
  upcoming_festival: boolean;
  sadhana_index: boolean;
  quote_carousel: boolean;
  gallery_preview: boolean;
  succession_timeline: boolean;
}

export const DEFAULT_PREFERENCES: DashboardPreferences = {
  sadhana_tracker: true,
  quick_actions: true,
  quick_links: true,
  upcoming_festival: true,
  sadhana_index: true,
  quote_carousel: true,
  gallery_preview: true,
  succession_timeline: true,
};

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onPreferencesChanged: (prefs: DashboardPreferences) => void;
}

export default function DashboardCustomizerModal({
  isOpen,
  onClose,
  user,
  onPreferencesChanged,
}: DashboardCustomizerModalProps) {
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load preferences
  useEffect(() => {
    if (!isOpen) return;

    const loadPrefs = async () => {
      setIsLoading(true);
      // Try local storage first
      const localStored = localStorage.getItem('terapanth_dashboard_preferences');
      let currentPrefs = localStored ? JSON.parse(localStored) : { ...DEFAULT_PREFERENCES };

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.dashboardPreferences) {
              currentPrefs = { ...DEFAULT_PREFERENCES, ...data.dashboardPreferences };
              // Sync to local storage
              localStorage.setItem('terapanth_dashboard_preferences', JSON.stringify(currentPrefs));
            }
          }
        } catch (error) {
          console.error('Error loading cloud preferences:', error);
        }
      }

      setPreferences(currentPrefs);
      setIsLoading(false);
    };

    loadPrefs();
  }, [isOpen, user]);

  const handleToggle = (key: keyof DashboardPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // 1. Save to local storage
    localStorage.setItem('terapanth_dashboard_preferences', JSON.stringify(preferences));

    // 2. Save to cloud if logged in
    if (user) {
      const userPath = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          dashboardPreferences: preferences,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, userPath);
      }
    }

    // 3. Notify parent
    onPreferencesChanged(preferences);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const sectionDetails = [
    {
      key: 'sadhana_tracker' as const,
      title: 'मेरी साधना 🔥',
      subtitle: 'Daily Sadhana Tracker',
      description: 'Track daily Samayik, meditation goals, and overall scriptural reading progress.',
    },
    {
      key: 'quick_actions' as const,
      title: 'त्वरित मार्ग ⚡',
      subtitle: 'Quick Actions Row',
      description: 'Instant launch buttons for Navkar Japa, Pratikraman, News Feed, and Daily Suvichar.',
    },
    {
      key: 'quick_links' as const,
      title: 'विशेष फीचर्स 🔗',
      subtitle: 'Special Features Quick Links',
      description: 'Navigation grid for Tapa Leaderboard, Communities, Media Center, and Anuvrat Pledge.',
    },
    {
      key: 'upcoming_festival' as const,
      title: 'आगामी पर्व 📅',
      subtitle: 'Upcoming Festival Banner',
      description: 'Keep track of the next important festival with days countdown and Panchang link.',
    },
    {
      key: 'sadhana_index' as const,
      title: 'साप्ताहिक साधना सूचकांक 🏆',
      subtitle: 'Weekly Sadhana Index',
      description: 'Visual analysis of your weekly spiritual consistency scores and meditation averages.',
    },
    {
      key: 'quote_carousel' as const,
      title: 'सुविचार 🌿',
      subtitle: 'Daily Quote Carousel',
      description: 'Inspirational scriptural verses and quotes from Acharyas in a swipeable carousel.',
    },
    {
      key: 'gallery_preview' as const,
      title: 'दिव्य गैलरी 🖼️',
      subtitle: 'Divine Gallery Preview',
      description: 'Previews and highlights of sacred media, wallpapers, and spiritual photos.',
    },
    {
      key: 'succession_timeline' as const,
      title: 'आचार्य पट्टपरंपरा 👑',
      subtitle: 'Succession Timeline',
      description: 'Explore the chronological journey, milestones, and barefoot travels of all 11 Acharyas.',
    },
  ];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white dark:bg-gray-900 border border-black/10 dark:border-gray-800 text-zinc-900 dark:text-white w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="serif-text text-base font-bold text-gray-900 dark:text-white">डैशबोर्ड कस्टमाइज़र</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Layout Planner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          <div className="p-4 rounded-2xl bg-spiritual/5 border border-spiritual/10 text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p className="font-semibold text-spiritual flex items-center gap-1.5">
              <Sparkles size={13} />
              Simplify your home view
            </p>
            <p className="leading-relaxed">
              Choose which modules to display on your dashboard. Hide sections you do not use to create a clean, minimalist experience.
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
              <RefreshCw size={24} className="animate-spin text-orange-500" />
              <span>Loading preferences...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {sectionDetails.map((section) => {
                const isVisible = preferences[section.key];
                return (
                  <div
                    key={section.key}
                    onClick={() => handleToggle(section.key)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 select-none ${
                      isVisible
                        ? 'bg-orange-500/[0.02] border-orange-500/20 shadow-sm'
                        : 'bg-zinc-50/50 dark:bg-zinc-850/50 border-black/5 dark:border-white/5 opacity-65'
                    }`}
                  >
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="serif-text text-sm font-bold text-gray-950 dark:text-white leading-none">
                          {section.title}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 font-mono">
                          {section.subtitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                        {section.description}
                      </p>
                    </div>

                    {/* Styled Toggle Switch */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={isVisible ? 'text-orange-500' : 'text-gray-400'}>
                        {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                          isVisible ? 'bg-orange-500' : 'bg-gray-200 dark:bg-zinc-700'
                        }`}
                      >
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-5 h-5 rounded-full bg-white shadow-md"
                          style={{
                            marginLeft: isVisible ? '20px' : '0px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Offline/Guest Warn */}
          {!user && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-400 flex items-start gap-2.5">
              <UserCheck size={14} className="shrink-0 mt-0.5" />
              <p className="leading-normal">
                You are currently in guest mode. Your dashboard layout is saved to this device. <strong>Log in</strong> to sync your custom home screen across all devices!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
          >
            Reset to Default
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <UserCheck size={13} className="animate-bounce" />
                <span>Layout Saved!</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>Save Layout</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
