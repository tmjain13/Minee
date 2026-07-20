import React from "react";

interface PermissionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onAllow: () => void;
  onIgnore: () => void;
  status?: string;
}

export default function PermissionCard({
  title,
  description,
  icon,
  checked,
  onAllow,
  onIgnore,
  status,
}: PermissionCardProps) {
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#180a02] border border-orange-100/70 dark:border-orange-950/40 rounded-3xl shadow-sm transition-all"
    >
      {/* Left side: Icon & Text */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          className={`mt-1 p-2 rounded-lg shrink-0 ${checked ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}
        >
          {icon}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              {title}
            </h3>
            {status && (
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest sm:hidden">
                {status === "granted" ? "Enabled" : "Draft"}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Right side: Button Group */}
      <div className="flex flex-wrap items-center gap-2 mt-2 w-full">
        <button
          onClick={onIgnore}
          className="flex-1 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 text-zinc-900 dark:text-zinc-100"
        >
          IGNORE
        </button>
        <button
          onClick={onAllow}
          className="flex-1 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-200 bg-emerald-500 text-white hover:bg-emerald-600"
        >
          ALLOW
        </button>
      </div>
    </div>
  );
}
