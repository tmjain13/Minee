import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Users, TrendingUp, ChevronDown, ChevronUp, Sparkles, ShieldCheck } from 'lucide-react';

interface SadhanaLeaderboardProps {
  userXP: number;
  userTitle?: string;
  userIcon?: string;
  language?: 'hi' | 'en';
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  title: string;
  avatar: string;
  points: number;
  isUser: boolean;
  streak: number;
  badge: string;
}

export default function SadhanaLeaderboard({
  userXP,
  userTitle = 'Sadhak (Practitioner)',
  userIcon = '🌱',
  language = 'hi'
}: SadhanaLeaderboardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Compute community leaderboard with dynamic user placement
  const baseCommunityUsers: Omit<LeaderboardUser, 'rank'>[] = [
    {
      name: 'Muni Shree Jyotirmay Kumar Ji',
      title: 'Senior Sadhak Muni (साधक मुनि)',
      avatar: '🧘‍♂️',
      points: 2850,
      isUser: false,
      streak: 45,
      badge: '👑 Master'
    },
    {
      name: 'Sadhvi Varya Preksha Dhyan Group',
      title: 'Gyanshala Instructor (ज्ञानशाला प्रशिक्षक)',
      avatar: '🪷',
      points: 1920,
      isUser: false,
      streak: 32,
      badge: '🪷 Scholar'
    },
    {
      name: 'Terapanth Yuvak Parishad Wing',
      title: 'ABTYP Sadhak Wing (युवक परिषद)',
      avatar: '⭐',
      points: 850,
      isUser: false,
      streak: 18,
      badge: '☸️ Meditator'
    },
    {
      name: 'Anuvrat Mahila Mandal Seva',
      title: 'ABTMM Active Member (महिला मण्डल)',
      avatar: '🕯️',
      points: 620,
      isUser: false,
      streak: 14,
      badge: '🕯️ Devotee'
    },
    {
      name: 'Anuvrat Values Student',
      title: 'Junior Seeker (अनुव्रत साधक)',
      avatar: '🌱',
      points: 340,
      isUser: false,
      streak: 7,
      badge: '🌱 Seeker'
    }
  ];

  // Insert user dynamically into community list
  const userEntry: Omit<LeaderboardUser, 'rank'> = {
    name: language === 'hi' ? 'आप (स्वयं साधक)' : 'You (Sadhak)',
    title: userTitle,
    avatar: userIcon,
    points: userXP,
    isUser: true,
    streak: Math.max(1, Number(localStorage.getItem('terapanth_sadhana_streak_count') || 7)),
    badge: userXP >= 2000 ? '👑 Master' : userXP >= 1000 ? '🪷 Scholar' : userXP >= 600 ? '☸️ Meditator' : userXP >= 300 ? '🕯️ Devotee' : '🌱 Seeker'
  };

  const allUsersSorted = [...baseCommunityUsers, userEntry].sort((a, b) => b.points - a.points);

  const leaderboardWithRanks: LeaderboardUser[] = allUsersSorted.map((u, idx) => ({
    ...u,
    rank: idx + 1
  }));

  const currentUserRank = leaderboardWithRanks.find(u => u.isUser)?.rank || 3;
  const totalCommunityMembers = 1240;
  const topPercentile = Math.max(1, Math.round((currentUserRank / 15) * 100));

  const visibleList = isExpanded ? leaderboardWithRanks : leaderboardWithRanks.slice(0, 4);

  return (
    <div className="p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/5 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 border border-amber-500/20 rounded-[2rem] shadow-sm space-y-4 text-left relative overflow-hidden" id="sadhana-mini-leaderboard">
      {/* Background Decorative Accent */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md text-xl shrink-0">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-mono">
                {language === 'hi' ? 'सामुदायिक रैंकिंग' : 'COMMUNITY RANKING'}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                <TrendingUp size={11} /> Top {topPercentile}%
              </span>
            </div>
            <h3 className="serif-text text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {language === 'hi' ? 'तेरापंथ साधना लीडरबोर्ड' : 'Community Sadhana Leaderboard'}
            </h3>
          </div>
        </div>

        {/* User Rank Highlight Badge */}
        <div className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-2xl shadow-md flex items-center gap-2 shrink-0">
          <Trophy size={16} />
          <div className="text-right font-mono leading-tight">
            <span className="text-[9px] uppercase tracking-wider block opacity-80">
              {language === 'hi' ? 'आपकी रैंक' : 'Your Rank'}
            </span>
            <span className="text-sm font-black">#{currentUserRank} / {totalCommunityMembers}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard List Cards */}
      <div className="space-y-2 pt-1">
        {visibleList.map((usr) => (
          <div
            key={usr.rank + usr.name}
            className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
              usr.isUser
                ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-2 border-amber-500 shadow-md font-bold scale-[1.01]'
                : usr.rank === 1
                ? 'bg-amber-500/10 border-amber-500/30 text-gray-900 dark:text-gray-100'
                : 'bg-white/80 dark:bg-zinc-800/60 border-gray-200/80 dark:border-zinc-700/60 text-gray-800 dark:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Rank Badge */}
              <div
                className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                  usr.rank === 1
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : usr.rank === 2
                    ? 'bg-slate-300 text-slate-900 shadow-xs'
                    : usr.rank === 3
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-black/5 dark:bg-white/10 text-gray-500'
                }`}
              >
                {usr.rank === 1 ? '🥇' : usr.rank === 2 ? '🥈' : usr.rank === 3 ? '🥉' : `#${usr.rank}`}
              </div>

              {/* Avatar Icon */}
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center text-lg shrink-0 border border-amber-500/20">
                {usr.avatar}
              </div>

              {/* User Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className={`text-xs truncate ${usr.isUser ? 'font-black text-amber-900 dark:text-amber-200' : 'font-extrabold text-gray-900 dark:text-gray-100'}`}>
                    {usr.name}
                  </h4>
                  {usr.isUser && (
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-2 py-0.2 rounded-full font-black uppercase font-mono">
                      {language === 'hi' ? 'आप' : 'YOU'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {usr.title}
                </p>
              </div>
            </div>

            {/* Points & Streak Badge */}
            <div className="text-right shrink-0">
              <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400 block">
                ✨ {usr.points} PTS
              </span>
              <span className="text-[9px] font-bold text-gray-400 block font-mono">
                🔥 {usr.streak}d streak
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Expand / Collapse Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 bg-black/5 dark:bg-white/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        id="toggle-leaderboard-btn"
      >
        <span>
          {isExpanded
            ? (language === 'hi' ? 'कम देखें' : 'Show Less')
            : (language === 'hi' ? 'संपूर्ण लीडरबोर्ड देखें' : 'View Full Community Ranks')}
        </span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    </div>
  );
}
