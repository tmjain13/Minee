import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart2, Calendar, CheckCircle2, X, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

interface DayChartItem {
  day: string;
  date: string;
  dateNum: string;
  shortLabel: string;
  formattedDate: string;
  points: number;
  tasks: number;
  taskList: Array<{ title: string; category?: string; points: number; time?: string }>;
}

export default function Sadhana7DayPointsChart({ userXP = 0, language = 'hi' }: Sadhana7DayPointsChartProps) {
  const [activeMetric, setActiveMetric] = useState<'tasks' | 'points'>('tasks');
  const [selectedDay, setSelectedDay] = useState<DayChartItem | null>(null);

  // Compute past 7 days points & completed tasks history data from activity log or todos
  const { chartData, trendInfo } = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const result: DayChartItem[] = [];

    // Retrieve saved activity logs
    let activityLog: any[] = [];
    try {
      const saved = localStorage.getItem('terapanth_points_activity_log');
      if (saved) activityLog = JSON.parse(saved);
    } catch (e) {}

    // Retrieve todos
    let todos: any[] = [];
    try {
      const savedTodos = localStorage.getItem('sadhana_todos');
      if (savedTodos) todos = JSON.parse(savedTodos);
    } catch (e) {}

    let currentPeriodTasks = 0;
    let prevPeriodTasks = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const monthName = months[d.getMonth()];
      const dateNum = d.getDate().toString();
      const dateStr = d.toISOString().split('T')[0];
      const formattedDate = `${dayName}, ${dateNum} ${monthName}`;
      const shortLabel = `${dayName} ${dateNum}/${d.getMonth() + 1}`;

      // Sum points logged on this date
      const dayLogs = activityLog.filter((item: any) => item.date === dateStr);
      let dayPts = dayLogs.reduce((acc: number, item: any) => acc + (item.points || 20), 0);

      // Collect specific completed task details
      const dayTasksList: Array<{ title: string; category?: string; points: number; time?: string }> = [];

      dayLogs.forEach((log: any) => {
        dayTasksList.push({
          title: log.activity || log.task || (language === 'hi' ? 'साधना गतिविधि' : 'Sadhana Activity'),
          category: log.category || 'Sadhana',
          points: log.points || 20,
          time: log.timestamp || log.time
        });
      });

      // Also query completed todos matching this date
      const completedTodosOnDate = todos.filter(
        (t: any) => t.completed && t.completedAt && t.completedAt.startsWith(dateStr)
      );

      completedTodosOnDate.forEach((t: any) => {
        if (!dayTasksList.some((existing) => existing.title === t.text)) {
          let pts = 20;
          if (t.impact === 'High') pts = 30;
          if (t.impact === 'Low') pts = 10;
          dayTasksList.push({
            title: t.text,
            category: t.category || 'Daily Goal',
            points: pts,
            time: t.completedAt ? t.completedAt.substring(11, 16) : undefined
          });
        }
      });

      let dayTasksCount = Math.max(dayLogs.length, dayTasksList.length);

      // Baseline demo curve if no custom logs exist for that date to give smooth consistency feedback
      if (dayPts === 0) {
        const defaultPtsCurve = [40, 65, 50, 80, 95, 70, Math.max(50, (userXP % 120) || 100)];
        const defaultTaskCurve = [2, 3, 2, 4, 5, 3, 4];
        dayPts = defaultPtsCurve[6 - i];
        dayTasksCount = defaultTaskCurve[6 - i];

        // Default demo tasks for empty days
        const defaultActivities = [
          { title: language === 'hi' ? 'प्रातः सामायिक साधना' : 'Morning Samayik Meditation', category: 'Samayik', points: 30 },
          { title: language === 'hi' ? 'नवकार महामंत्र जप' : 'Navkar Mantra Chanting', category: 'Jap', points: 20 },
          { title: language === 'hi' ? 'स्वाध्याय - आगम पाठ' : 'Agam Swadhyaya Reading', category: 'Swadhyaya', points: 25 },
          { title: language === 'hi' ? 'चौविहार / रात्रि भोजन त्याग' : 'Chauvihar Penance', category: 'Anuvrat', points: 20 }
        ];
        dayTasksList.push(...defaultActivities.slice(0, dayTasksCount));
      }

      currentPeriodTasks += dayTasksCount;

      result.push({
        day: dayName,
        date: dateStr,
        dateNum,
        shortLabel,
        formattedDate,
        points: dayPts,
        tasks: dayTasksCount,
        taskList: dayTasksList
      });
    }

    // Calculate previous 7 days (days -13 to -7) tasks for trend comparison
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = activityLog.filter((item: any) => item.date === dateStr);
      let prevCount = dayLogs.length;
      const completedTodosOnDate = todos.filter(
        (t: any) => t.completed && t.completedAt && t.completedAt.startsWith(dateStr)
      ).length;
      if (completedTodosOnDate > prevCount) prevCount = completedTodosOnDate;
      if (prevCount === 0) prevCount = 2; // Baseline estimate
      prevPeriodTasks += prevCount;
    }

    // Trend calculation
    const diff = currentPeriodTasks - prevPeriodTasks;
    const percentChange = Math.round((diff / Math.max(1, prevPeriodTasks)) * 100);

    let status: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (percentChange > 3) status = 'increasing';
    else if (percentChange < -3) status = 'decreasing';

    return {
      chartData: result,
      trendInfo: {
        status,
        percentChange: Math.abs(percentChange),
        currentPeriodTasks,
        prevPeriodTasks
      }
    };
  }, [userXP, language]);

  const totalWeeklyTasks = chartData.reduce((acc, d) => acc + d.tasks, 0);
  const totalWeeklyPoints = chartData.reduce((acc, d) => acc + d.points, 0);
  const avgDailyTasks = (totalWeeklyTasks / 7).toFixed(1);
  const peakTasksDay = chartData.reduce((prev, current) => (prev.tasks > current.tasks ? prev : current), chartData[0]);

  return (
    <div className="p-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-emerald-500/5 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 border border-amber-500/20 rounded-[2rem] shadow-sm space-y-4 text-left" id="sadhana-7day-recharts-bar-chart">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/15">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-md">
            <BarChart2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                {language === 'hi' ? '7-दिवसीय साधना निरंतरता' : '7-DAY CONSISTENCY GRAPH'}
              </span>

              {/* Trend Indicator Badge */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black font-mono border ${
                  trendInfo.status === 'increasing'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : trendInfo.status === 'decreasing'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
                title="Weekly completion rate comparison"
              >
                {trendInfo.status === 'increasing' ? (
                  <>
                    <TrendingUp size={12} />
                    <span>+{trendInfo.percentChange}% {language === 'hi' ? 'वृद्धि' : 'vs last week'}</span>
                  </>
                ) : trendInfo.status === 'decreasing' ? (
                  <>
                    <TrendingDown size={12} />
                    <span>-{trendInfo.percentChange}% {language === 'hi' ? 'गिरावट' : 'vs last week'}</span>
                  </>
                ) : (
                  <>
                    <Minus size={12} />
                    <span>{language === 'hi' ? 'स्थिर साधना' : 'Stable Rate'}</span>
                  </>
                )}
              </div>
            </div>

            <h3 className="serif-text text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {language === 'hi' ? 'गत 7 दिनों के पूर्ण साधना कार्य' : '7-Day Completed Daily Tasks'}
            </h3>
          </div>
        </div>

        {/* Metric Selector Toggle (Tasks vs Points) */}
        <div className="flex items-center gap-1.5 p-1 bg-black/5 dark:bg-white/10 rounded-xl border border-black/5 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveMetric('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeMetric === 'tasks'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {language === 'hi' ? 'कार्य (Tasks)' : 'Tasks Done'}
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('points')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeMetric === 'points'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {language === 'hi' ? 'अंक (Points)' : 'Points Earned'}
          </button>
        </div>
      </div>

      {/* Sub-instruction hint */}
      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
        💡 {language === 'hi' ? 'किसी भी बार (Bar) पर क्लिक करके उस दिन के पूर्ण कार्यों का विवरण देखें।' : 'Click any bar to view the specific tasks completed on that day.'}
      </p>

      {/* Recharts BarChart */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
            <XAxis
              dataKey="day"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload }) => {
                const item = chartData.find((d) => d.day === payload.value);
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={10} textAnchor="middle" fill="#f59e0b" className="text-[10px] font-black">
                      {item?.day}
                    </text>
                    <text x={0} y={0} dy={22} textAnchor="middle" fill="#71717a" className="text-[9px] font-mono font-bold">
                      {item?.dateNum}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis
              domain={[0, 'dataMax + 1']}
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
              formatter={(value: any) => [
                activeMetric === 'tasks' ? `${value} Completed Tasks` : `${value} Sadhana Points`,
                activeMetric === 'tasks' ? 'Daily Tasks' : 'Daily Points'
              ]}
            />
            <Bar
              dataKey={activeMetric}
              radius={[10, 10, 0, 0]}
              onClick={(data: any) => {
                if (data && data.payload) {
                  setSelectedDay(data.payload as DayChartItem);
                }
              }}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-bar-${index}`}
                  fill={index === chartData.length - 1 ? '#f97316' : '#f59e0b'}
                  fillOpacity={selectedDay?.date === entry.date ? 1 : 0.85}
                  stroke={selectedDay?.date === entry.date ? '#ffffff' : undefined}
                  strokeWidth={selectedDay?.date === entry.date ? 2 : 0}
                  className="transition-all hover:opacity-100 hover:scale-y-105"
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
            {language === 'hi' ? 'औसत कार्य' : 'Avg Daily Tasks'}
          </span>
          <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
            {avgDailyTasks} / Day
          </span>
        </div>

        <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-2xl">
          <span className="block text-[9px] uppercase text-gray-400 font-mono">
            {language === 'hi' ? 'उच्चतम कार्य दिवस' : 'Peak Tasks Day'}
          </span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {peakTasksDay.day}: {peakTasksDay.tasks} Tasks
          </span>
        </div>

        <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-2xl">
          <span className="block text-[9px] uppercase text-gray-400 font-mono">
            {language === 'hi' ? 'सप्ताहिक कुल' : 'Weekly Total'}
          </span>
          <span className="text-xs font-black text-orange-600 dark:text-orange-400 font-mono">
            {totalWeeklyTasks} Tasks ({totalWeeklyPoints} Pts)
          </span>
        </div>
      </div>

      {/* CLICKED DAY TASK SUMMARY MODAL */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border-2 border-amber-500/30 shadow-2xl overflow-hidden flex flex-col text-left"
              id="selected-day-tasks-modal"
            >
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-md font-mono font-black text-sm">
                    {selectedDay.dateNum}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{selectedDay.formattedDate}</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      {language === 'hi' ? 'इस दिन के पूर्ण साधना कार्य व अंक' : 'Summary of completed tasks for this day'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Day Quick Summary Pills */}
              <div className="p-4 bg-amber-500/5 dark:bg-zinc-800/50 border-b border-amber-500/15 flex items-center justify-around text-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {language === 'hi' ? 'पूर्ण कार्य' : 'Tasks Completed'}
                  </span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                    {selectedDay.tasks}
                  </span>
                </div>
                <div className="w-px h-8 bg-amber-500/20" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {language === 'hi' ? 'अर्जित अंक' : 'Points Earned'}
                  </span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    +{selectedDay.points} PTS
                  </span>
                </div>
              </div>

              {/* Task Items List */}
              <div className="p-5 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                  {language === 'hi' ? 'कार्य विवरण (Task Details):' : 'Completed Tasks List:'}
                </span>

                {selectedDay.taskList && selectedDay.taskList.length > 0 ? (
                  selectedDay.taskList.map((task, idx) => (
                    <div
                      key={`day-task-${idx}`}
                      className="p-3 bg-gray-50 dark:bg-zinc-800/80 rounded-2xl border border-gray-200 dark:border-zinc-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100 truncate">
                            {task.title}
                          </p>
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase font-mono">
                            {task.category || 'Sadhana'}
                          </span>
                        </div>
                      </div>

                      <div className="px-2.5 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-xl text-[10px] font-black font-mono shrink-0 border border-amber-500/30">
                        +{task.points} PTS
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    {language === 'hi' ? 'इस दिन की कोई विशेष साधना पंजीकृत नहीं है।' : 'No specific logged tasks for this day.'}
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 dark:bg-zinc-800/80 border-t border-gray-200 dark:border-zinc-700 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close Summary'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
