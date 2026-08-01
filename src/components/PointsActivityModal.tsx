import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Sparkles, X, Filter, Calendar, Award, CheckCircle2, Search, Trash2 } from 'lucide-react';

export interface PointsActivityItem {
  id: string;
  taskText: string;
  points: number;
  category: string;
  timestamp: string;
  date: string;
}

const DEFAULT_ACTIVITIES: PointsActivityItem[] = [
  {
    id: 'act_1',
    taskText: 'Morning Samayik 48-Min Practice (प्रातः सामायिक)',
    points: 50,
    category: 'Samayik',
    timestamp: 'Today, 07:15 AM',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'act_2',
    taskText: '108 Navkar Mantra Japa Chanting (णमोक्कार जाप)',
    points: 40,
    category: 'Japa',
    timestamp: 'Today, 08:00 AM',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'act_3',
    taskText: 'Agam Swadhyaya Study Session (स्वाध्याय पठन)',
    points: 30,
    category: 'Swadhyaya',
    timestamp: 'Yesterday, 08:30 PM',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  },
  {
    id: 'act_4',
    taskText: 'Daily Evening Pratikraman (सायं प्रतिक्रमण)',
    points: 35,
    category: 'Ritual',
    timestamp: 'Yesterday, 07:00 PM',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  },
  {
    id: 'act_5',
    taskText: 'Gyanshala Kids Value Teaching Seva (ज्ञानशाला सेवा)',
    points: 25,
    category: 'Seva',
    timestamp: '2 days ago',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
  }
];

export function logPointsActivity(taskText: string, points: number, category: string = 'Sadhana') {
  try {
    const saved = localStorage.getItem('terapanth_points_activity_log');
    let log: PointsActivityItem[] = saved ? JSON.parse(saved) : DEFAULT_ACTIVITIES;
    const now = new Date();
    const timeStr = 'Today, ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newEntry: PointsActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      taskText,
      points,
      category,
      timestamp: timeStr,
      date: now.toISOString().split('T')[0]
    };
    log = [newEntry, ...log].slice(0, 50);
    localStorage.setItem('terapanth_points_activity_log', JSON.stringify(log));
  } catch (e) {
    console.warn("Could not log points activity", e);
  }
}

interface PointsActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'hi' | 'en';
  totalPoints?: number;
}

export default function PointsActivityModal({
  isOpen,
  onClose,
  language = 'hi',
  totalPoints = 0
}: PointsActivityModalProps) {
  const [activities, setActivities] = useState<PointsActivityItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('terapanth_points_activity_log');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActivities(parsed);
          } else {
            setActivities(DEFAULT_ACTIVITIES);
            localStorage.setItem('terapanth_points_activity_log', JSON.stringify(DEFAULT_ACTIVITIES));
          }
        } else {
          setActivities(DEFAULT_ACTIVITIES);
          localStorage.setItem('terapanth_points_activity_log', JSON.stringify(DEFAULT_ACTIVITIES));
        }
      } catch (e) {
        setActivities(DEFAULT_ACTIVITIES);
      }
    }
  }, [isOpen]);

  const handleClearHistory = () => {
    if (window.confirm(language === 'hi' ? 'क्या आप संपूर्ण साधना अंक इतिहास हटाना चाहते हैं?' : 'Are you sure you want to clear activity log history?')) {
      setActivities([]);
      localStorage.setItem('terapanth_points_activity_log', JSON.stringify([]));
    }
  };

  const filteredActivities = activities.filter(act => {
    const matchesCategory = selectedCategory === 'All' || act.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = act.taskText.toLowerCase().includes(searchQuery.toLowerCase()) || act.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const computedTotalLogged = activities.reduce((acc, curr) => acc + (curr.points || 0), 0);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border-2 border-amber-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          id="points-activity-modal-container"
        >
          {/* Modal Header */}
          <div className="p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md text-xl">
                ✨
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'hi' ? 'साधना अंक गतिविधि विवरण' : 'Sadhana Points Activity Log'}</span>
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  {language === 'hi' ? 'आपके द्वारा पूर्ण किए गए संकल्पों का इतिहास' : 'Recent breakdown of earned spiritual points'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              id="close-points-modal-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Points Overview Stats Bar */}
          <div className="p-4 bg-amber-500/5 border-b border-amber-500/10 grid grid-cols-2 gap-3 shrink-0">
            <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-2xl border border-amber-500/20 flex items-center gap-3">
              <div className="p-2 bg-amber-500/15 text-amber-600 rounded-xl">
                <Award size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">
                  {language === 'hi' ? 'अर्जित कुल अंक' : 'Total Points Earned'}
                </span>
                <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">
                  ✨ {totalPoints > 0 ? totalPoints : computedTotalLogged} PTS
                </span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-2xl border border-orange-500/20 flex items-center gap-3">
              <div className="p-2 bg-orange-500/15 text-orange-600 rounded-xl">
                <History size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">
                  {language === 'hi' ? 'कुल गतिविधियाँ' : 'Logged Activities'}
                </span>
                <span className="text-sm font-black font-mono text-gray-800 dark:text-gray-100">
                  {activities.length} {language === 'hi' ? 'प्रविष्टियाँ' : 'entries'}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="p-4 space-y-3 border-b border-black/5 dark:border-white/5 shrink-0">
            <div className="relative flex items-center bg-gray-100 dark:bg-zinc-800/80 rounded-2xl px-3 py-2 border border-black/5 dark:border-white/10">
              <Search size={16} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'गतिविधि खोजें (जैसे सामायिक, जाप)...' : 'Search activities...'}
                className="w-full bg-transparent text-xs font-bold text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {['All', 'Samayik', 'Japa', 'Swadhyaya', 'Ritual', 'Seva'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {cat === 'All' ? (language === 'hi' ? 'सभी' : 'All') : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Activity List Container */}
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1 min-h-[220px]">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-10 text-gray-400 space-y-2">
                <History size={36} className="mx-auto opacity-30 text-amber-500" />
                <p className="text-xs font-bold">
                  {language === 'hi' ? 'कोई गतिविधि नहीं मिली' : 'No points activity logged yet'}
                </p>
                <p className="text-[10px] text-gray-500">
                  {language === 'hi' ? 'साधना संकल्पों को पूर्ण करके अंक अर्जित करें।' : 'Complete daily goals to earn points.'}
                </p>
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 hover:bg-amber-500/5 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm shrink-0 border border-amber-500/30">
                      {act.category === 'Samayik' ? '🧘‍♂️' : act.category === 'Japa' ? '📿' : act.category === 'Swadhyaya' ? '📖' : '✨'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-gray-100 truncate">
                        {act.taskText}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-0.2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold font-mono">
                          {act.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar size={10} />
                          {act.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 font-black font-mono text-xs shrink-0 shadow-2xs">
                    +{act.points} PTS
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-gray-50 dark:bg-zinc-900/90 border-t border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-500/10 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>{language === 'hi' ? 'इतिहास साफ़ करें' : 'Clear History'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
