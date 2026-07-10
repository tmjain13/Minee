import React, { useState } from 'react';
import { User, Lock, Check, X, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { validatePassword, PasswordStrength } from './authSecurity';

interface RegisterStepProps {
  onComplete: (username: string) => void;
  language: 'hi' | 'en';
}

export function RegisterStep({ onComplete, language }: RegisterStepProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength: PasswordStrength = validatePassword(password);
  const passedRulesCount = Object.values(strength).filter(Boolean).length;

  const calculateEntropy = (pw: string) => {
    if (!pw) {
      return {
        score: 0,
        level: 'empty',
        color: 'text-slate-400',
        bg: 'bg-slate-200 dark:bg-slate-800',
        text: language === 'hi' ? 'खाली' : 'Empty'
      };
    }

    const len = pw.length;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);

    const typesCount = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0);

    // Color green (strong) for 12+ chars, special symbols, and numbers
    const isStrong = len >= 12 && hasSpecial && hasDigit && (hasLower || hasUpper);
    
    // Color amber (fair) for 8+ chars and mixed types
    const isFair = len >= 8 && typesCount >= 2;

    if (isStrong) {
      const score = Math.min(100, 75 + (len - 12) * 4 + (typesCount - 2) * 8);
      return {
        score,
        level: 'strong',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500',
        text: language === 'hi' ? 'मजबूत' : 'Strong'
      };
    } else if (isFair) {
      const score = Math.min(74, 45 + (len - 8) * 3 + (typesCount - 2) * 6);
      return {
        score,
        level: 'fair',
        color: 'text-amber-500',
        bg: 'bg-amber-500',
        text: language === 'hi' ? 'मध्यम' : 'Fair'
      };
    } else {
      const score = Math.min(44, Math.max(10, len * 3 + typesCount * 4));
      return {
        score,
        level: 'weak',
        color: 'text-rose-500',
        bg: 'bg-rose-500',
        text: language === 'hi' ? 'कमजोर' : 'Weak'
      };
    }
  };

  const strengthMeta = calculateEntropy(password);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError(language === 'hi' ? 'उपयोगकर्ता नाम कम से कम 3 वर्णों का होना चाहिए।' : 'Username must be at least 3 characters.');
      return;
    }

    if (strengthMeta.level === 'weak') {
      setError(language === 'hi' ? 'कृपया एक अधिक मजबूत पासवर्ड दर्ज करें (कम से कम मध्यम श्रेणी का)।' : 'Please choose a stronger password (at least Fair).');
      return;
    }

    onComplete(username.trim());
  };

  const RequirementRow = ({ label, passed }: { label: string; passed: boolean }) => (
    <div className="flex items-center space-x-2 text-xs">
      {passed ? (
        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
      )}
      <span className={passed ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white" id="register_step_title">
          {language === 'hi' ? 'नया खाता बनाएं' : 'Create Profile'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'hi' 
            ? 'तेरापंथ एआई हब में शामिल होने के लिए अपना विवरण पूरा करें' 
            : 'Complete your profile information to register'}
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Username Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {language === 'hi' ? 'उपयोगकर्ता नाम (Username)' : 'Username'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500">
              <User className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={language === 'hi' ? 'उदा. अमित_जैन' : 'e.g. amit_jain'}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all font-medium"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {language === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500">
              <Lock className="w-5 h-5" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {/* Real-time Password Strength progress bar directly below the password field */}
          {password && (
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${strengthMeta.bg}`}
                style={{ width: `${strengthMeta.score}%` }}
              />
            </div>
          )}
        </div>

        {/* Strength Meter Bars */}
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1 text-orange-400" />
              {language === 'hi' ? 'पासवर्ड शक्ति:' : 'Security Strength:'}
            </span>
            <span className={`font-bold ${strengthMeta.color}`}>{strengthMeta.text}</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 h-1.5">
            {[1, 2, 3, 4].map((barIdx) => {
              const active = 
                (strengthMeta.level === 'weak' && barIdx === 1) ||
                (strengthMeta.level === 'fair' && barIdx <= 3) ||
                (strengthMeta.level === 'strong');
              return (
                <div
                  key={barIdx}
                  className={`h-full rounded-full transition-colors ${
                    active && password.length > 0
                      ? strengthMeta.bg 
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Individual Requirements Breakdown */}
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <RequirementRow label={language === 'hi' ? 'कम से कम 8 अक्षर' : 'At least 8 chars'} passed={strength.length} />
            <RequirementRow label={language === 'hi' ? '1 बड़ा अक्षर (A-Z)' : '1 uppercase (A-Z)'} passed={strength.upper} />
            <RequirementRow label={language === 'hi' ? '1 संख्या (0-9)' : '1 number (0-9)'} passed={strength.number} />
            <RequirementRow label={language === 'hi' ? '1 विशेष वर्ण (@#$)' : '1 special character'} passed={strength.special} />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 rounded-xl flex items-center space-x-2 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
        >
          <span>{language === 'hi' ? 'खाता बनाएं और लॉग इन करें' : 'Register & Enter'}</span>
        </button>
      </form>
    </div>
  );
}
