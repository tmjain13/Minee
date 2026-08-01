import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Lock, Sparkles, CheckCircle2, ShieldCheck, Flame, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface SpiritualBadgeItem {
  id: string;
  titleHi: string;
  titleEn: string;
  requiredXP: number;
  icon: string;
  category: 'Milestone' | 'Samayik' | 'Japa' | 'Swadhyaya';
  descriptionHi: string;
  descriptionEn: string;
  color: string;
}

export const SPIRITUAL_MILESTONE_BADGES: SpiritualBadgeItem[] = [
  {
    id: 'badge_seeker',
    titleHi: 'साधना साधक (Sadhana Seeker)',
    titleEn: 'Sadhana Seeker',
    requiredXP: 100,
    icon: '🌱',
    category: 'Milestone',
    descriptionHi: '100 साधना अंक अर्जित करने पर प्रथम आध्यात्मिक पड़ाव अनलॉक होता है।',
    descriptionEn: 'Unlocked upon reaching 100 total Sadhana Points.',
    color: 'from-emerald-400 to-teal-600'
  },
  {
    id: 'badge_tapasvi',
    titleHi: 'तपस्वी साधक (Tapasvi Devotee)',
    titleEn: 'Tapasvi Devotee',
    requiredXP: 300,
    icon: '🕯️',
    category: 'Milestone',
    descriptionHi: '300 साधना अंक पूर्ण कर नियमबद्धता एवं तपस्या का प्रतीक।',
    descriptionEn: 'Unlocked upon reaching 300 total Sadhana Points.',
    color: 'from-amber-400 to-orange-600'
  },
  {
    id: 'badge_dhyani',
    titleHi: 'ध्यानी साधक (Dhyani Meditator)',
    titleEn: 'Dhyani Meditator',
    requiredXP: 600,
    icon: '☸️',
    category: 'Milestone',
    descriptionHi: '600 साधना अंक अर्जित कर प्रेक्षाध्यान एवं समाधि की सिद्धि।',
    descriptionEn: 'Unlocked upon reaching 600 total Sadhana Points.',
    color: 'from-blue-400 to-indigo-600'
  },
  {
    id: 'badge_gyani',
    titleHi: 'ज्ञानी विद्वान (Gyani Scholar)',
    titleEn: 'Gyani Scholar',
    requiredXP: 1000,
    icon: '🪷',
    category: 'Milestone',
    descriptionHi: '1000 साधना अंक प्राप्त कर आगम ज्ञान एवं स्वाध्याय शिरोमणि।',
    descriptionEn: 'Unlocked upon reaching 1000 total Sadhana Points.',
    color: 'from-purple-400 to-fuchsia-600'
  },
  {
    id: 'badge_master',
    titleHi: 'परम साधना स्वामी (Meditation Master)',
    titleEn: 'Meditation Master',
    requiredXP: 2000,
    icon: '👑',
    category: 'Milestone',
    descriptionHi: '2000 साधना अंक प्राप्त कर सर्वोच्च आध्यात्मिक सिद्धि एवं नेतृत्व।',
    descriptionEn: 'Unlocked upon reaching 2000 total Sadhana Points.',
    color: 'from-amber-300 via-yellow-500 to-amber-600'
  },
  {
    id: 'badge_samayik',
    titleHi: 'सामायिक चक्रवर्ती (Samayik Champion)',
    titleEn: 'Samayik Champion',
    requiredXP: 250,
    icon: '🧘‍♂️',
    category: 'Samayik',
    descriptionHi: 'नियमित सामायिक ध्यान द्वारा 5 से अधिक सत्र पूर्ण करने पर।',
    descriptionEn: 'Unlocked by completing 5+ Samayik meditation sessions.',
    color: 'from-cyan-400 to-blue-600'
  },
  {
    id: 'badge_japa',
    titleHi: 'णमोक्कार जाप योगी (Japa Sadhak)',
    titleEn: 'Japa Sadhak',
    requiredXP: 200,
    icon: '📿',
    category: 'Japa',
    descriptionHi: 'णमोक्कार महामंत्र एवं जाप द्वारा निरंतर सिद्धि प्राप्त करने पर।',
    descriptionEn: 'Unlocked through consistent Navkar Mantra chanting.',
    color: 'from-rose-400 to-red-600'
  }
];

interface SpiritualBadgesProps {
  userXP: number;
  language?: 'hi' | 'en';
}

export default function SpiritualBadges({ userXP, language = 'hi' }: SpiritualBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<SpiritualBadgeItem | null>(null);

  const handleBadgeClick = (badge: SpiritualBadgeItem) => {
    setSelectedBadge(badge);
    if (userXP >= badge.requiredXP) {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
        });
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    }
  };

  const unlockedCount = SPIRITUAL_MILESTONE_BADGES.filter(b => userXP >= b.requiredXP).length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4 text-left" id="spiritual-badges-hub">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
              {language === 'hi' ? 'आध्यात्मिक बैच एवं उपलब्धियाँ' : 'Spiritual Badges & Milestones'}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              {language === 'hi' ? 'साधना अंकों द्वारा अनलॉक की गई विशिष्ट उपलब्धियाँ' : 'Unique badges unlocked as you earn Sadhana Points'}
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full font-mono font-black text-xs text-amber-700 dark:text-amber-300">
          🏆 {unlockedCount} / {SPIRITUAL_MILESTONE_BADGES.length} {language === 'hi' ? 'अनलॉक' : 'Unlocked'}
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
        {SPIRITUAL_MILESTONE_BADGES.map((badge) => {
          const isUnlocked = userXP >= badge.requiredXP;
          const progressPct = Math.min(100, Math.round((userXP / badge.requiredXP) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                isUnlocked
                  ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border-amber-500/40 hover:border-amber-500 shadow-xs hover:shadow-md hover:scale-[1.02]'
                  : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-2xl transition-transform group-hover:scale-110 ${!isUnlocked && 'grayscale'}`}>
                  {badge.icon}
                </span>

                {isUnlocked ? (
                  <span className="text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold text-zinc-400 flex items-center gap-0.5">
                    <Lock size={10} /> {badge.requiredXP} Pts
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 leading-snug truncate">
                  {language === 'hi' ? badge.titleHi : badge.titleEn}
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  {language === 'hi' ? badge.descriptionHi : badge.descriptionEn}
                </p>
              </div>

              {/* Progress Bar for Locked / Progress Indicator */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[9px] font-mono font-bold text-zinc-400">
                  <span>{progressPct}%</span>
                  <span>{userXP}/{badge.requiredXP} PTS</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${badge.color}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Badge Details Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl space-y-4 text-center relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>

              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-4xl shadow-xl mx-auto border-2 border-amber-300/40">
                {selectedBadge.icon}
              </div>

              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  userXP >= selectedBadge.requiredXP
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                }`}>
                  {userXP >= selectedBadge.requiredXP ? '🎉 UNLOCKED BADGE!' : '🔒 LOCKED BADGE'}
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-2">
                  {language === 'hi' ? selectedBadge.titleHi : selectedBadge.titleEn}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {language === 'hi' ? selectedBadge.descriptionHi : selectedBadge.descriptionEn}
                </p>
              </div>

              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-xs font-mono font-bold flex justify-between items-center text-zinc-700 dark:text-zinc-200">
                <span>{language === 'hi' ? 'आवश्यक साधना अंक:' : 'Required Points:'}</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                  ✨ {selectedBadge.requiredXP} PTS
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md cursor-pointer transition-all active:scale-95"
              >
                {language === 'hi' ? 'ठीक है (Close)' : 'Awesome!'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
