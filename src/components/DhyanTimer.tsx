import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

const DHYAN_DURATION = 10 * 60; // 10 minutes

export default function DhyanTimer() {
  const [timeLeft, setTimeLeft] = useState(DHYAN_DURATION);
  const [isActive, setIsActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Using a sample ambient sound
    audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      audioRef.current?.play().catch(console.error);
    } else {
      clearInterval(interval!);
      audioRef.current?.pause();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const progress = 1 - timeLeft / DHYAN_DURATION;

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-black/5 dark:border-white/5">
      <h3 className="text-sm font-black uppercase tracking-widest text-orange-600">Dhyan Timer</h3>
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-stone-200" />
          <motion.circle
            cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray="552"
            strokeDashoffset={552 * (1 - progress)}
            className="text-orange-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={() => setIsActive(!isActive)} className="p-4 bg-orange-100 rounded-full text-orange-600">
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={() => { setIsActive(false); setTimeLeft(DHYAN_DURATION); }} className="p-4 bg-stone-100 rounded-full text-stone-600">
          <RefreshCw size={24} />
        </button>
      </div>
    </div>
  );
}
