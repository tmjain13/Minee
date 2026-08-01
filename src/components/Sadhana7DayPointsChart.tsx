import React, { useMemo } from 'react';
import { TrendingUp, BarChart2, Award, Calendar, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

interface Sadhana7DayPointsChartProps {
  userXP?: number;
  language?: 'hi' | 'en';
}

export default function Sadhana7DayPointsChart({ userXP = 0, language = 'hi' }: Sadhana7DayPointsChartProps) {
  // Compute past 7 days points history data from activity log or generate smooth trend
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];

    // Retrieve saved activity logs
    let activityLog: any[] = [];
    try {
      const saved = localStorage.getItem('terapanth_points_activity_log');
      if (saved) activityLog = JSON.parse(saved);
    } catch (e) {}

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      // Sum points logged on this date
      const dayLogs = activityLog.filter((item: any) => item.date === dateStr);
      let dayPts = dayLogs.reduce((acc: number, item: any) => acc + (item.points || 20), 0);

      // Baseline demo points curve if no custom logs exist for that date
      if (dayPts === 0) {
        const defaultCurve = [40, 65, 50, 80, 95, 70, Math.max(50, (userXP % 120) || 100)];
        dayPts = defaultCurve[6 - i];
      }

      result.push({
        day: dayName,
        date: dateStr,
        points: dayPts,
        tasks: Math.max(1, Math.round(dayPts / 25))
      });
    }

    return result;
  }, [userXP]);

  const totalWeeklyPoints = chartData.reduce((acc, d) => acc + d.points, 0);
  const avgDailyPoints = Math.round(totalWeeklyPoints / 7);
  const peakPointsDay = chartData.reduce((prev, current) => (prev.points > current.points ? prev : current), chartData[0]);

  return (
    <div className="p-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-emerald-500/5 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 border border-amber-500/20 rounded-[2rem] shadow-sm space-y-4 text-left" id="sadhana-7day-recharts-bar-chart">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/15">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-md">
            <BarChart2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
              {language === 'hi' ? '7-दिवसीय साधना प्रगति' : '7-DAY CONSISTENCY GRAPH'}
            </span>
            <h3 className="serif-text text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {language === 'hi' ? 'गत 7 दिनों के साधना अंक' : '7-Day Sadhana Points Trend'}
            </h3>
          </div>
        </div>

        <div className="text-right font-mono shrink-0">
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">
            {avgDailyPoints} PTS
          </span>
          <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">
            {language === 'hi' ? 'औसत दैनिक अंक' : 'Avg Points / Day'}
          </span>
        </div>
      </div>

      {/* Recharts BarChart */}
      <div className="w-full h-52 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
            <XAxis
              dataKey="day"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a8a29e', fontWeight: 'bold' }}
            />
            <YAxis
              domain={[0, 'dataMax + 20']}
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a8a29e' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid rgba(249,115,22,0.3)',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                backgroundColor: 'var(--card-bg, #18181b)',
                color: '#ffffff',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'black', color: '#f59e0b' }}
              labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#a1a1aa', marginBottom: '4px' }}
              formatter={(value: any) => [`${value} Sadhana Points`, 'Daily Points']}
            />
            <Bar dataKey="points" radius={[10, 10, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-bar-${index}`}
                  fill={index === chartData.length - 1 ? '#f97316' : '#f59e0b'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Breakdown Bar */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-500/15 text-center text-[10px] font-bold text-gray-500">
        <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-2xl">
          <span className="block text-[9px] uppercase text-gray-400 font-mono">
            {language === 'hi' ? 'उच्चतम अंक' : 'Peak Day'}
          </span>
          <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
            {peakPointsDay.day}: {peakPointsDay.points} Pts
          </span>
        </div>

        <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-2xl">
          <span className="block text-[9px] uppercase text-gray-400 font-mono">
            {language === 'hi' ? 'साधना निरंतरता' : '7-Day Consistency'}
          </span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
            100% Active 🔥
          </span>
        </div>

        <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-2xl">
          <span className="block text-[9px] uppercase text-gray-400 font-mono">
            {language === 'hi' ? 'सप्ताहिक योग' : 'Weekly Total'}
          </span>
          <span className="text-xs font-black text-orange-600 dark:text-orange-400 font-mono">
            {totalWeeklyPoints} Pts
          </span>
        </div>
      </div>
    </div>
  );
}
