import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, collectionGroup, getDocs, query } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';
import { 
  Trophy, 
  Award, 
  RefreshCw, 
  TrendingUp, 
  Sparkles, 
  PlusCircle, 
  ShieldAlert, 
  Info,
  Flame,
  User,
  HeartHandshake
} from 'lucide-react';

interface FastingLog {
  id: string;
  type: string;
  duration?: number;
  date: string;
  timestamp: any;
  userId: string;
}

interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
}

interface UserAggregate {
  userId: string;
  displayName: string;
  photoURL?: string;
  totalCount: number;
  totalImpact: number;
  currentStreak: number;
  lastFastDate?: string;
}

interface TapaLeaderboardProps {
  onNavigateToSadhana?: () => void;
  onBack?: () => void;
}

const FASTING_IMPACTS: Record<string, number> = {
  upvas: 20,
  ekasana: 5,
  biyasana: 3,
  chauvihar: 2,
  navkarsi: 1
};

const FASTING_NAMES: Record<string, string> = {
  upvas: 'Upvas (उपवास)',
  ekasana: 'Ekasana (एकासन)',
  biyasana: 'Biyasana (ब्यासन)',
  chauvihar: 'Chauvihar (चौविहार)',
  navkarsi: 'Navkarsi (नवकारसी)'
};

function calculateFastingStreak(logs: { date: string }[]): number {
  if (logs.length === 0) return 0;
  
  // Clean dates: remove empty/invalid dates and sort ascending
  const dates = Array.from(
    new Set(logs.map(l => l.date).filter(Boolean))
  ).sort();
  
  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  
  // Format check date as local calendar date string YYYY-MM-DD
  let currentCheckDate = new Date(today);
  let checkStr = currentCheckDate.toISOString().split('T')[0];
  
  // If no log today, check yesterday
  if (!dates.includes(checkStr)) {
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    checkStr = currentCheckDate.toISOString().split('T')[0];
    if (!dates.includes(checkStr)) {
      return 0; // Streak is broken
    }
  }
  
  // Trailing count backwards day by day
  while (dates.includes(checkStr)) {
    streak++;
    currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    checkStr = currentCheckDate.toISOString().split('T')[0];
  }
  
  return streak;
}

function getLevelBadge(count: number) {
  if (count >= 31) {
    return { 
      name: "तप सम्राट", 
      color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/30", 
      tier: "diamond" 
    };
  } else if (count >= 16) {
    return { 
      name: "महातपस्वी", 
      color: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/30", 
      tier: "gold" 
    };
  } else if (count >= 6) {
    return { 
      name: "तपस्वी", 
      color: "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700/30", 
      tier: "silver" 
    };
  } else {
    return { 
      name: "साधक", 
      color: "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border-orange-100 dark:border-orange-900/30", 
      tier: "bronze" 
    };
  }
}

export default function TapaLeaderboard({ onNavigateToSadhana, onBack }: TapaLeaderboardProps) {
  const [filter, setFilter] = useState<'month' | 'three_months' | 'year'>('month');
  const [leaderboardData, setLeaderboardData] = useState<UserAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const currentUser = auth.currentUser;

  const fetchTapaData = async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorStatus(null);

    try {
      // 1. Fetch user profiles map to resolve names & avatars
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const profilesMap: Record<string, UserProfile> = {};
      usersSnapshot.forEach((doc) => {
        profilesMap[doc.id] = { uid: doc.id, ...doc.data() } as UserProfile;
      });

      // 2. Fetch all fasting logs using collectionGroup
      const fastingLogsSnapshot = await getDocs(collectionGroup(db, 'fastingLogs'));
      
      const rawLogs: FastingLog[] = [];
      fastingLogsSnapshot.forEach((doc) => {
        const data = doc.data();
        const parentId = doc.ref.parent?.parent?.id || 'unknown';
        rawLogs.push({
          id: doc.id,
          type: data.type || '',
          duration: data.duration || 1,
          date: data.date || '',
          timestamp: data.timestamp,
          userId: parentId
        });
      });

      // Compute dates filters
      const today = new Date();
      const currentYear = today.getFullYear().toString();
      const currentMonthPrefix = `${currentYear}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

      // Groups logs by user
      const userLogsMap: Record<string, FastingLog[]> = {};
      rawLogs.forEach(log => {
        if (!userLogsMap[log.userId]) {
          userLogsMap[log.userId] = [];
        }
        userLogsMap[log.userId].push(log);
      });

      // Process aggregates based on the selected filter
      const processedUsers: UserAggregate[] = Object.keys(userLogsMap).map(userId => {
        const allUserLogs = userLogsMap[userId];
        const profile = profilesMap[userId] || { uid: userId };
        const displayName = profile.displayName || "Anonymous Sadhak";
        const photoURL = profile.photoURL;

        // Calculate absolute streak using all logs
        const currentStreak = calculateFastingStreak(allUserLogs);

        // Filter logs according to range choice
        const filteredLogs = allUserLogs.filter(log => {
          if (filter === 'month') {
            return log.date && log.date.startsWith(currentMonthPrefix);
          } else if (filter === 'three_months') {
            return log.date && log.date >= ninetyDaysAgoStr;
          } else { // 'year'
            return log.date && log.date.startsWith(currentYear);
          }
        });

        // Compute sums
        const totalCount = filteredLogs.length;
        const totalImpact = filteredLogs.reduce((sum, log) => {
          const impactUnit = FASTING_IMPACTS[log.type] || 0;
          return sum + (impactUnit * (log.duration || 1));
        }, 0);

        const sortedDates = filteredLogs
          .map(l => l.date)
          .filter(Boolean)
          .sort();
        const lastFastDate = sortedDates[sortedDates.length - 1];

        return {
          userId,
          displayName,
          photoURL,
          totalCount,
          totalImpact,
          currentStreak,
          lastFastDate
        };
      }).filter(user => user.totalCount > 0); // Only include active practitioners

      // Rank users
      processedUsers.sort((a, b) => {
        if (b.totalCount !== a.totalCount) {
          return b.totalCount - a.totalCount;
        }
        if (b.totalImpact !== a.totalImpact) {
          return b.totalImpact - a.totalImpact;
        }
        return b.currentStreak - a.currentStreak;
      });

      setLeaderboardData(processedUsers);
    } catch (err: any) {
      console.error(err);
      setErrorStatus("कर्म संकलन में त्रुटि हुई। कृपया पुन: प्रयास करें।");
      try {
        handleFirestoreError(err, OperationType.LIST, 'fastingLogs_collection_group');
      } catch (innerErr) {
        // Log clean error
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTapaData();
  }, [filter]);

  // Navigate fallback
  const handleNavToSadhana = () => {
    if (onNavigateToSadhana) {
      onNavigateToSadhana();
    } else {
      const navBtn = document.getElementById('nav-sadhana');
      if (navBtn) {
        navBtn.click();
      }
    }
  };

  // Logged-in user stats
  const currentUserStats = leaderboardData.find(u => u.userId === currentUser?.uid);
  const currentUserRank = leaderboardData.findIndex(u => u.userId === currentUser?.uid) + 1;
  const userMyFastsThisMonth = leaderboardData.find(u => u.userId === currentUser?.uid)?.totalCount || 0;

  // Top 10 Slice
  const topTen = leaderboardData.slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 border border-black/5 dark:border-white/5 space-y-6 shadow-sm text-left relative overflow-hidden" id="tapa-leaderboard-container">
      
      {/* Header section with icon and Refresh button */}
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-2xl shadow-sm">
            <Trophy className="animate-bounce" size={24} />
          </div>
          <div>
            <h3 className="serif-text font-black text-gray-900 dark:text-white text-xl">तप लीडरबोर्ड</h3>
            <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">The Ascent of Determination</p>
          </div>
        </div>

        <button 
          onClick={() => fetchTapaData(true)} 
          disabled={refreshing || loading}
          className="p-2 sm:px-4 sm:py-2 bg-orange-50 dark:bg-orange-950/20 text-orange-600 hover:bg-orange-100 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-40"
          title="ताजा करें"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline text-xs font-black">ताजा करें</span>
        </button>
      </div>

      {/* Encouragement Banner < 3 fasts this month */}
      {currentUser && userMyFastsThisMonth < 3 && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500/10 to-amber-500/5 dark:from-orange-500/20 dark:to-transparent border border-orange-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-500/20 rounded-2xl text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="serif-text font-black text-orange-950 dark:text-orange-200 text-sm">तप: परमं निर्जरा</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                तपस्या आत्मा के संचित कर्मों की परम शुद्धि है। इस माह की अपनी साधना यात्रा शुरू करें।
              </p>
            </div>
          </div>
          <button 
            onClick={handleNavToSadhana}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md shadow-orange-500/10 transition-all duration-300 flex items-center gap-1.5 cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <PlusCircle size={14} />
            नया तप जोड़ें
          </button>
        </motion.div>
      )}

      {/* Filter range selector Pills */}
      <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-fit" id="leaderboard-filter-container">
        <button 
          onClick={() => setFilter('month')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ${filter === 'month' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-600 dark:text-orange-400' : 'text-gray-400 hover:text-gray-600'}`}
        >
          इस माह
        </button>
        <button 
          onClick={() => setFilter('three_months')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ${filter === 'three_months' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-600 dark:text-orange-400' : 'text-gray-400 hover:text-gray-600'}`}
        >
          पिछले 3 माह
        </button>
        <button 
          onClick={() => setFilter('year')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ${filter === 'year' ? 'bg-white dark:bg-gray-700 shadow-sm text-orange-600 dark:text-orange-400' : 'text-gray-400 hover:text-gray-600'}`}
        >
          इस वर्ष
        </button>
      </div>

      {/* Milestone Alert Banner */}
      {currentUserStats && [5, 13, 28].includes(currentUserStats.currentStreak) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-600 rounded-xl">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-200">Milestone Approaching!</h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                You are just 2 days away from a <b>{currentUserStats.currentStreak + 2}-day</b> continuous fasting milestone! Keep going!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Logged in User's Rank Card Container (Top Sticky display) */}
      {currentUser && !loading && (
        <div className="border border-orange-500/15 bg-orange-50/5 dark:bg-orange-950/5 rounded-3xl p-5" id="user-own-rank-highlight">
          {currentUserStats ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 font-mono text-lg font-black text-orange-600 dark:text-orange-400">
                  #{currentUserRank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-gray-950 dark:text-gray-100">{currentUserStats.displayName} (आप)</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border tracking-wide uppercase ${getLevelBadge(currentUserStats.totalCount).color}`}>
                      {getLevelBadge(currentUserStats.totalCount).name}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">
                    संपादित तप: {currentUserStats.totalCount} बार | कुल निर्जरा प्रभाव: {currentUserStats.totalImpact}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between border-t sm:border-t-0 sm:pt-0 pt-2 border-black/5 dark:border-white/5">
                {currentUserStats.currentStreak > 0 && (
                  <div className="flex items-center gap-1 text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl">
                    <Flame size={14} className="fill-orange-600 animate-pulse text-orange-600" />
                    <span>{currentUserStats.currentStreak} दिन निरंतर</span>
                  </div>
                )}
                {currentUserRank <= 10 ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black tracking-wider uppercase flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-xl">
                    <Sparkles size={12} />
                    शीर्ष 10 में!
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase">
                    आपकी रैंक #{currentUserRank} है
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">आप वर्तमान अवधि में अनुपस्थित हैं</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  इस अवधि में अभी तक कोई तप दर्ज नहीं किया गया है। पहला तप संचित करें।
                </p>
              </div>
              <button 
                onClick={handleNavToSadhana}
                className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md shadow-orange-500/10 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle size={14} />
                तप संचित करें
              </button>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Cards container */}
      <div className="space-y-3" id="leaderboard-cards-list-container">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-orange-500" size={32} />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">लॉग संकलित किए जा रहे हैं...</p>
          </div>
        ) : errorStatus ? (
          <div className="py-12 text-center border-2 border-dashed border-red-500/20 rounded-[2rem] bg-red-500/5 flex flex-col items-center justify-center gap-2">
            <ShieldAlert className="text-red-500" size={32} />
            <p className="text-sm font-black text-red-600">{errorStatus}</p>
            <button 
              onClick={() => fetchTapaData()} 
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-lg transition-all"
            >
              पुन: प्रयास करें
            </button>
          </div>
        ) : topTen.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-black/5 rounded-[2rem] flex flex-col items-center justify-center gap-2">
            <HeartHandshake className="text-gray-400" size={32} />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">इस अवधि के लिए कोई तप दर्ज नहीं है</p>
            <p className="text-[11px] text-gray-300">तप शुरू कर इतिहास का पहला बिंदु बनें!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {topTen.map((userAggregate, index) => {
              const rank = index + 1;
              const badge = getLevelBadge(userAggregate.totalCount);
              const isMe = userAggregate.userId === currentUser?.uid;

              return (
                <motion.div
                  key={userAggregate.userId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-800/30 dark:to-zinc-800/10 rounded-2xl border ${isMe ? 'border-orange-500/30' : 'border-black/[0.04] dark:border-white/[0.04]'} hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 group`}
                  id={`leaderboard-card-rank-${rank}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Position rank badge */}
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      {rank === 1 ? (
                        <span className="text-3xl" title="🥇 प्रथम स्थान">🥇</span>
                      ) : rank === 2 ? (
                        <span className="text-3xl" title="🥈 द्वितीय स्थान">🥈</span>
                      ) : rank === 3 ? (
                        <span className="text-3xl" title="🥉 तृतीय स्थान">🥉</span>
                      ) : (
                        <span className="font-mono font-black text-gray-400 text-sm">{rank}</span>
                      )}
                    </div>

                    {/* Avatar structure */}
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center relative shrink-0 text-orange-600 font-extrabold uppercase text-sm">
                      {userAggregate.photoURL ? (
                        <img 
                          src={userAggregate.photoURL} 
                          alt={userAggregate.displayName} 
                          className="w-full h-full rounded-xl object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Erase photoURL if load fails
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        userAggregate.displayName.slice(0, 2)
                      )}
                    </div>

                    {/* Meta info */}
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tight">
                          {userAggregate.displayName} {isMe && "(आप)"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-widest ${badge.color}`}>
                          {badge.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <span>कुल तप: <b className="text-orange-500 font-black">{userAggregate.totalCount}</b></span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 hidden xs:inline" />
                        <span>प्रभाव अंक: <b className="text-orange-600 dark:text-orange-400 font-black">{userAggregate.totalImpact}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Hot streak and CTA stats */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-black/5 dark:border-white/5 mt-3 sm:mt-0 pt-2 sm:pt-0">
                    <span className="sm:hidden text-[9px] text-zinc-400 font-medium tracking-wide">Continuous fasting streak</span>
                    <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 px-3 py-1.5 rounded-xl text-orange-600 dark:text-orange-400 text-xs font-black">
                      {userAggregate.currentStreak > 0 ? (
                        <>
                          <Flame size={14} className="fill-orange-500 text-orange-500" />
                          <span>{userAggregate.currentStreak} दिन</span>
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 font-normal">स्थिर</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Compliance / Privacy Policy Note */}
      <div className="mt-6 flex items-start gap-2.5 p-4 bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border border-black/[0.03] dark:border-white/[0.03]" id="leaderboard-privacy-footer">
        <Info size={16} className="text-orange-600/70 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
          <b className="text-[#f97316] font-bold">गोपनीयता सूचना:</b> विवरण केवल सार्वजनिक प्रोफ़ाइलों से संकलित हैं। यदि आप अपनी प्रोफ़ाइल गोपनीयता सेटिंग्स बदलना चाहते हैं, तो कृपया अपने प्रोफ़ाइल टैब पर जाएँ।
        </p>
      </div>

    </div>
  );
}
