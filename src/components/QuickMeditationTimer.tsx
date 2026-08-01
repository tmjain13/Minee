import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Bell, Sparkles, Clock, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { logPointsActivity } from './PointsActivityModal';

interface QuickMeditationTimerProps {
  language?: 'hi' | 'en';
  onMeditationComplete?: (minutes: number, points: number) => void;
}

export default function QuickMeditationTimer({ language = 'hi', onMeditationComplete }: QuickMeditationTimerProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(5); // Default 5 minutes
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Play synthetic Tibetan / Jain temple singing bowl chime via Web Audio API
  const playTempleBell = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Fundamental frequency & harmonics for deep bell chime
      const freqs = [432, 864, 1296, 1728];
      const gains = [0.6, 0.3, 0.15, 0.08];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(gains[idx], ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 3.6);
      });
    } catch (e) {
      console.warn('Web Audio Bell Chime error', e);
    }
  };

  const selectPreset = (minutes: number) => {
    if (isRunning) {
      setIsRunning(false);
      clearInterval(timerRef.current);
    }
    setSelectedPreset(minutes);
    setTimeLeft(minutes * 60);
    setIsCompleted(false);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsCompleted(true);
            playTempleBell();
            
            // Trigger Confetti & Reward
            if (typeof confetti === 'function') {
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            }

            const earnedPts = selectedPreset * 10;
            logPointsActivity(`Quick Preksha Meditation (${selectedPreset} Mins)`, earnedPts, 'Samayik');
            
            if (onMeditationComplete) {
              onMeditationComplete(selectedPreset, earnedPts);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedPreset]);

  const toggleStartPause = () => {
    if (timeLeft <= 0) {
      setTimeLeft(selectedPreset * 60);
      setIsCompleted(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedPreset * 60);
    setIsCompleted(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = Math.round(((selectedPreset * 60 - timeLeft) / (selectedPreset * 60)) * 100);

  return (
    <div className="p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/5 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 border border-amber-500/25 rounded-[2rem] shadow-sm space-y-4 text-left relative overflow-hidden" id="quick-meditation-timer-widget">
      {/* Background Decorative Element */}
      <div className="absolute -left-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md text-xl shrink-0">
            🧘‍♂️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-mono">
                {language === 'hi' ? 'त्वरित प्रेक्षाध्यान' : 'QUICK MEDITATION'}
              </span>
            </div>
            <h3 className="serif-text text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {language === 'hi' ? 'प्रेक्षाध्यान टाइमर (Meditation Timer)' : 'Quick Meditation Timer'}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-xl border transition-all ${
            isMuted
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20'
          }`}
          title={isMuted ? 'Muted' : 'Temple Bell Sound Enabled'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Preset Minute Selector Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {[5, 10, 20].map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => selectPreset(mins)}
            className={`py-2.5 px-3 rounded-2xl font-mono text-xs font-black transition-all cursor-pointer border flex flex-col items-center justify-center ${
              selectedPreset === mins
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-md scale-[1.02]'
                : 'bg-white/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-zinc-700 hover:border-amber-500/40'
            }`}
          >
            <span className="text-sm font-extrabold">{mins} MIN</span>
            <span className="text-[9px] opacity-80 font-bold">
              +{mins * 10} PTS
            </span>
          </button>
        ))}
      </div>

      {/* Timer Counter Display & Controls */}
      <div className="p-5 bg-white/90 dark:bg-zinc-800/80 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-black text-lg">
            {isRunning ? (
              <span className="animate-pulse">{formatTime(timeLeft)}</span>
            ) : (
              <span>{formatTime(timeLeft)}</span>
            )}
            {/* Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-amber-500/20"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-amber-500 transition-all duration-500"
                strokeWidth="3"
                fill="none"
                strokeDasharray="175"
                strokeDashoffset={175 - (175 * progressPct) / 100}
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
              {isCompleted ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-black">
                  <CheckCircle2 size={16} />
                  {language === 'hi' ? 'ध्यान पूर्ण हुआ! 🔔' : 'Meditation Completed! 🔔'}
                </span>
              ) : isRunning ? (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles size={14} className="animate-spin" />
                  {language === 'hi' ? 'श्वास प्रेक्षा एवं ध्यान जारी...' : 'Deep Preksha Breath Meditation...'}
                </span>
              ) : (
                <span>{language === 'hi' ? 'साधना ध्यान प्रारंभ करें' : 'Ready to begin Meditation'}</span>
              )}
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              {isCompleted
                ? (language === 'hi' ? `बधाई हो! मंदिर की घंटी के साथ +${selectedPreset * 10} अंक अर्जित हुए।` : `Great job! Earned +${selectedPreset * 10} points with temple chime bell.`)
                : (language === 'hi' ? 'शांत वातावरण में बैठें और अंतर्यात्रा करें।' : 'Sit comfortably, close eyes, and observe breathing.')}
            </p>
          </div>
        </div>

        {/* Play/Pause & Reset Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleStartPause}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
              isRunning
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-600'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-600 hover:to-orange-600'
            }`}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>
              {isRunning
                ? (language === 'hi' ? 'रोकें' : 'Pause')
                : (language === 'hi' ? 'प्रारंभ करें' : 'Start')}
            </span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-200 dark:border-zinc-700 transition-all cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
