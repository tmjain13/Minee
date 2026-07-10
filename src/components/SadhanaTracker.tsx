import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Sparkles, Wind, Quote, Award } from "lucide-react";
import PrekshaVisualizer from "./PrekshaVisualizer";
import SadhanaStreaks from "./SadhanaStreaks";
import AgamShorts from "./AgamShorts";

export default function SadhanaTracker() {
  const [activeSubTab, setActiveSubTab] = useState<
    "STREAKS" | "BREATH" | "AGAM"
  >("STREAKS");

  return (
    <div className="w-full">
      <div
        className="relative w-full bg-[#1c1917] rounded-2xl p-4 border border-white/10 shadow-sm overflow-hidden"
        id="master-sadhana-hub-container"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-60 h-60 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header Tabs Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-5">
          <div>
            <div className="flex justify-between items-center gap-3">
              <h2 className="text-white font-bold text-lg m-0 flex items-center gap-1.5 font-sans tracking-tight">
                🪷 तेरापंथ प्रीमियम साधना हब
              </h2>
              <div className="bg-orange-500 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase shrink-0">
                Premium
              </div>
            </div>
            <p className="text-zinc-400 text-sm mt-1.5">
              साधना प्रोग्रेस, प्रेक्षा ध्यान और आगम वाणी
            </p>
          </div>

          {/* Minimal high-contrast sub-tab control pills */}
          <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 select-none">
            <button
              onClick={() => setActiveSubTab("STREAKS")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                activeSubTab === "STREAKS"
                  ? "bg-zinc-800 text-white font-black shadow-lg shadow-black/20"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Flame size={11} />
              <span>साधना चक्र</span>
            </button>
            <button
              onClick={() => setActiveSubTab("BREATH")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                activeSubTab === "BREATH"
                  ? "bg-zinc-800 text-white font-black shadow-lg shadow-black/20"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Wind size={11} />
              <span>प्रेक्षा ध्यान</span>
            </button>
            <button
              onClick={() => setActiveSubTab("AGAM")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                activeSubTab === "AGAM"
                  ? "bg-zinc-800 text-white font-black shadow-lg shadow-black/20"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Quote size={11} />
              <span>आगम वाणी</span>
            </button>
          </div>
        </div>

        {/* Main Dynamic View Panels with transitions */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeSubTab === "STREAKS" && (
              <motion.div
                key="streaks"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <SadhanaStreaks />
              </motion.div>
            )}

            {activeSubTab === "BREATH" && (
              <motion.div
                key="breath"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <PrekshaVisualizer />
              </motion.div>
            )}

            {activeSubTab === "AGAM" && (
              <motion.div
                key="agam"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <AgamShorts />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Integrated visual branding trust note */}
        <div className="mt-5 text-[9px] text-gray-500 text-center font-bold tracking-wider flex items-center justify-center gap-1 border-t border-zinc-800 pt-4">
          <Award size={10} className="text-orange-500/60" />
          <span>
            PREMIUM GENERATIVE SPIRITUAL INTERFACE • JAIN SHWETAMBAR TERAPANTH
            SECT
          </span>
        </div>
      </div>
    </div>
  );
}
