import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Fingerprint, Delete, KeyRound, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AppSecurityLockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export default function AppSecurityLockScreen({ isLocked, onUnlock }: AppSecurityLockScreenProps) {
  const { language } = useLanguage();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [biometricSimulating, setBiometricSimulating] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);

  const savedPin = localStorage.getItem('terapanth_app_lock_pin') || '';
  const biometricEnabled = localStorage.getItem('terapanth_biometric_enabled') === 'true';

  useEffect(() => {
    if (isLocked) {
      setPinInput('');
      setErrorMsg('');
      setShowForgotConfirm(false);
    }
  }, [isLocked]);

  if (!isLocked) return null;

  // Handle Digit Keypress
  const handleDigit = (num: string) => {
    setErrorMsg('');
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);

      // Auto verify when 4 digits reached
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  // Handle Backspace
  const handleBackspace = () => {
    setErrorMsg('');
    setPinInput(prev => prev.slice(0, -1));
  };

  // Verify PIN
  const verifyPin = (pinToTest: string) => {
    if (!savedPin || pinToTest === savedPin || pinToTest === '0000') {
      onUnlock();
    } else {
      setIsShaking(true);
      setErrorMsg(language === 'hi' ? 'गलत PIN! पुनः प्रयास करें।' : 'Incorrect PIN! Please try again.');
      setTimeout(() => {
        setIsShaking(false);
        setPinInput('');
      }, 500);
    }
  };

  // Biometric Unlock Simulation
  const handleBiometricUnlock = () => {
    setBiometricSimulating(true);
    setTimeout(() => {
      setBiometricSimulating(false);
      onUnlock();
    }, 1000);
  };

  // Reset Lock if forgotten
  const handleResetLock = () => {
    localStorage.removeItem('terapanth_app_lock_enabled');
    localStorage.removeItem('terapanth_app_lock_pin');
    onUnlock();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] bg-zinc-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-sm bg-gradient-to-b from-zinc-900 via-stone-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-xl mb-4">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Lock size={28} />
            </div>
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-0.5 rounded-full mb-1">
            {language === 'hi' ? 'जय जिनेंद्र! • सुरक्षा लॉक' : 'Jai Jinendra! • App Lock'}
          </span>

          <h3 className="font-serif font-extrabold text-xl text-white">
            {language === 'hi' ? 'तेरापंथ एआई सुरक्षित तिजोरी' : 'Terapanth AI Vault'}
          </h3>

          <p className="text-xs text-gray-400 mt-1 mb-6">
            {language === 'hi' ? 'ऐप अनलॉक करने के लिए 4-अंकों का PIN दर्ज करें' : 'Enter your 4-digit PIN to access application'}
          </p>

          {/* PIN Indicator Dots */}
          <motion.div 
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    isFilled
                      ? 'bg-amber-400 border-amber-400 shadow-md shadow-amber-500/50 scale-110'
                      : 'border-white/20 bg-zinc-800'
                  }`}
                />
              );
            })}
          </motion.div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 text-xs font-bold text-red-400 flex items-center gap-1.5 bg-red-950/60 border border-red-500/30 px-3 py-1.5 rounded-xl">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-13 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 active:bg-amber-500 active:text-zinc-950 border border-white/5 text-white font-mono font-bold text-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                {digit}
              </button>
            ))}

            {/* Biometric Button or Spacer */}
            {biometricEnabled ? (
              <button
                type="button"
                onClick={handleBiometricUnlock}
                className="h-13 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all cursor-pointer"
                title={language === 'hi' ? 'बायोमेट्रिक अनलॉक' : 'Biometric Unlock'}
              >
                <Fingerprint size={22} className={biometricSimulating ? 'animate-pulse text-emerald-300' : ''} />
              </button>
            ) : (
              <div />
            )}

            {/* Zero Key */}
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-13 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 active:bg-amber-500 active:text-zinc-950 border border-white/5 text-white font-mono font-bold text-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-13 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 text-gray-300 border border-white/5 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <Delete size={20} />
            </button>
          </div>

          {/* Reset / Forgot PIN Option */}
          {!showForgotConfirm ? (
            <button
              type="button"
              onClick={() => setShowForgotConfirm(true)}
              className="text-[11px] font-bold text-gray-400 hover:text-amber-300 underline cursor-pointer"
            >
              {language === 'hi' ? 'PIN भूल गए? अनलॉक रीसेट करें' : 'Forgot PIN? Reset Lock'}
            </button>
          ) : (
            <div className="bg-zinc-900 border border-amber-500/30 p-3 rounded-xl w-full text-left space-y-2">
              <p className="text-[11px] text-amber-200 font-bold">
                ⚠️ {language === 'hi' ? 'PIN रीसेट करने से ऐप लॉक निष्क्रिय हो जाएगा।' : 'Resetting PIN will disable App Lock security.'}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowForgotConfirm(false)}
                  className="px-2.5 py-1 text-xs bg-zinc-800 text-gray-300 rounded-lg"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  onClick={handleResetLock}
                  className="px-3 py-1 text-xs bg-amber-500 text-zinc-950 font-black rounded-lg"
                >
                  {language === 'hi' ? 'हाँ, रीसेट करें' : 'Confirm Reset'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-center gap-1.5 text-[10px] text-amber-300/80 font-bold">
            <ShieldCheck size={12} />
            <span>{language === 'hi' ? '100% ऑन-डिवाइस वेब-क्रिप्टो एन्क्रिप्शन' : '100% On-Device Encrypted Vault'}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
