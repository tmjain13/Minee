import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, ShieldAlert, Cpu, MapPin, Key, Globe, LogIn } from 'lucide-react';
import { getDeviceFingerprint, getMockGeoIp } from './authSecurity';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  language: 'hi' | 'en';
}

export function SuccessModal({ isOpen, onClose, username, language }: SuccessModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes countdown
  const [sessionToken, setSessionToken] = useState('');
  const geoIp = getMockGeoIp();
  const fingerprint = getDeviceFingerprint();

  // Generate a cryptographically random-like session token once on mount
  useEffect(() => {
    if (isOpen) {
      const chars = 'abcdef0123456789';
      let token = 'tp_sess_';
      for (let i = 0; i < 24; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
      }
      setSessionToken(token);
      setSecondsLeft(300); // reset countdown
    }
  }, [isOpen]);

  // Handle countdown logic
  useEffect(() => {
    if (!isOpen) return;
    if (secondsLeft <= 0) {
      // Refresh or handle timeout
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  if (!isOpen) return null;

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const browserName = typeof window !== 'undefined'
    ? (() => {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Google Chrome';
        if (ua.includes('Safari')) return 'Apple Safari';
        if (ua.includes('Firefox')) return 'Mozilla Firefox';
        if (ua.includes('Edge')) return 'Microsoft Edge';
        return 'Standard Secure Browser';
      })()
    : 'Unknown Environment';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn" id="success_modal_overlay">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-6"
        id="success_modal_container"
      >
        {/* Animated Check Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-500 animate-scaleIn">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">
            {language === 'hi' ? 'सुरक्षित क्रेडेंशियल सत्यापित!' : 'Secure Credentials Verified!'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi' 
              ? `जय जिनेन्द्र ${username || ''}! आपका प्रमाणीकरण सफल रहा।`
              : `Jai Jinendra ${username || ''}! Secure session has been established.`}
          </p>
        </div>

        {/* Security Summary Box */}
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 border-b border-slate-200/40 dark:border-slate-800/40 pb-2 mb-2">
            <Cpu className="w-4 h-4 text-orange-500" />
            <span>{language === 'hi' ? 'एंटरप्राइज सुरक्षा संदर्भ' : 'Enterprise Security Context'}</span>
          </div>

          {/* Session Token */}
          <div className="flex justify-between items-start text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5 shrink-0">
              <Key className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              Session Token:
            </span>
            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded break-all text-right select-all">
              {sessionToken}
            </span>
          </div>

          {/* Device Fingerprint */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5 shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              Device Fingerprint:
            </span>
            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
              {fingerprint}
            </span>
          </div>

          {/* Login Location */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              Login Location:
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">
              {geoIp.city}, {geoIp.country} ({geoIp.ip})
            </span>
          </div>

          {/* Browser Info */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5 shrink-0">
              <Globe className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              Browser Platform:
            </span>
            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
              {browserName}
            </span>
          </div>
        </div>

        {/* 5-minute countdown session timer */}
        <div className="flex items-center justify-between p-3.5 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-950/30 rounded-xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-500 animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'सुरक्षित सत्र टाइमर' : 'Secure Session Timer'}
              </p>
              <p className="text-[10px] text-slate-400">
                {language === 'hi' ? 'सत्र समाप्त होने से पहले आगे बढ़ें' : 'Proceed before the session expires'}
              </p>
            </div>
          </div>
          <span className="font-mono text-base font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-lg border border-orange-200/40 dark:border-orange-900/30">
            {formatTime(secondsLeft)}
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
        >
          <LogIn className="w-5 h-5" />
          <span>{language === 'hi' ? 'डैशबोर्ड में प्रवेश करें' : 'Proceed to Dashboard'}</span>
        </button>
      </div>
    </div>
  );
}
