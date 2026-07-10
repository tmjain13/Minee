import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface KnowledgeData {
  category: string;
  count: number;
  color: string;
}

// Generate some initial simulated data (in a real app, this would come from the user's history/DB)
const MOCK_DATA: KnowledgeData[] = [
  { category: "Spiritual History", count: 45, color: "#f97316" }, // orange-500
  { category: "Meditation (Preksha)", count: 30, color: "#0ea5e9" }, // sky-500
  { category: "Acharya Lineage", count: 25, color: "#8b5cf6" }, // violet-500
  { category: "Vihar Tracking", count: 15, color: "#10b981" }, // emerald-500
  { category: "Philosophy (Jainism)", count: 20, color: "#f43f5e" }, // rose-500
];

export default function KnowledgeInsights() {
  const [data, setData] = useState<KnowledgeData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = () => {
    setIsRefreshing(true);
    // Simulate fetching data
    setTimeout(() => {
      setData([...MOCK_DATA]);
      setIsRefreshing(false);
    }, 800);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalInteractions = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-zinc-800/80 shadow-sm p-6 mt-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Knowledge Insights
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your spiritual learning distribution
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isRefreshing}
          className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Insights"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="w-full max-w-sm mx-auto p-4 flex flex-col items-center">
        <div className="w-full h-64 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="count"
                nameKey="category"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
                itemStyle={{ color: "#1f2937", fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full mt-4 space-y-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm"
            >
              <span className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-zinc-700 dark:text-zinc-300">
                  {item.category}
                </span>
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {item.count} (
                {totalInteractions > 0
                  ? Math.round((item.count / totalInteractions) * 100)
                  : 0}
                %)
              </span>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Total
            </span>
            <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
              {totalInteractions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
