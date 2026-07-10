import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, ArrowRight, ShieldCheck, Keyboard, AlertCircle, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

interface ContactStepProps {
  onNext: (contact: string, isAlreadyAuthenticated?: boolean) => void;
  language: 'hi' | 'en';
}

export function ContactStep({ onNext, language }: ContactStepProps) {
  const [contact, setContact] = useState('');
  const [inputType, setInputType] = useState<'phone' | 'email'>('phone');
  const [honeypot, setHoneypot] = useState('');
  const [isBotChecked, setIsBotChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email/Password & Password Reset states
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  // Keystroke statistics for behavioral biometrics simulation
  const [typingMetrics, setTypingMetrics] = useState<number[]>([]);
  const lastKeyTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Monitor typing pattern and render to a secure canvas
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    if (lastKeyTimeRef.current !== 0) {
      const interval = now - lastKeyTimeRef.current;
      setTypingMetrics((prev) => [...prev.slice(-30), interval]);
    }
    lastKeyTimeRef.current = now;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f97316'; // orange-500
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    if (typingMetrics.length === 0) {
      // Draw idle line
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    } else {
      const step = canvas.width / Math.max(10, typingMetrics.length);
      typingMetrics.forEach((metric, idx) => {
        const x = idx * step;
        // Clamp height visually
        const normalizedVal = Math.min(100, Math.max(5, metric / 5));
        const y = canvas.height - normalizedVal;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [typingMetrics]);

  const handleForgotPassword = async () => {
    setError(null);
    setIsResetSent(false);
    const trimmed = contact.trim();
    if (!trimmed) {
      setError(language === 'hi' ? 'कृपया पहले अपनी ईमेल आईडी दर्ज करें।' : 'Please enter your email address first.');
      return;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isEmail) {
      setError(language === 'hi' ? 'कृपया वैध ईमेल आईडी दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setIsResetSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'ईमेल भेजने में विफलता।');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsResetSent(false);

    // Bot detection check (Honeypot)
    if (honeypot) {
      setError(language === 'hi' ? 'रोबोट गतिविधि का पता चला है।' : 'Spam activity detected.');
      return;
    }

    // Bot verification check (Simulated reCAPTCHA)
    if (!isBotChecked) {
      setError(language === 'hi' ? 'कृपया पुष्टि करें कि आप रोबोट नहीं हैं।' : 'Please confirm you are not a robot.');
      return;
    }

    // Contact format validation
    const trimmed = contact.trim();
    if (!trimmed) {
      setError(language === 'hi' ? 'कृपया ईमेल या मोबाइल नंबर दर्ज करें।' : 'Please enter your email or mobile number.');
      return;
    }

    if (inputType === 'phone') {
      const isPhone = /^[6-9]\d{9}$/.test(trimmed) || /^\+?[1-9]\d{1,14}$/.test(trimmed);
      if (!isPhone) {
        setError(language === 'hi' ? 'कृपया सही मोबाइल नंबर दर्ज करें।' : 'Please enter a valid phone number.');
        return;
      }
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (!isEmail) {
        setError(language === 'hi' ? 'कृपया वैध ईमेल आईडी दर्ज करें।' : 'Please enter a valid email address.');
        return;
      }
    }

    // Email & Password Mode Direct Firebase Auth
    if (inputType === 'email' && usePassword) {
      const trimmedPassword = password.trim();
      if (!trimmedPassword) {
        setError(language === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.');
        return;
      }
      if (isSignUp && trimmedPassword.length < 6) {
        setError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
        return;
      }

      setAuthLoading(true);
      try {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, trimmed, trimmedPassword);
        } else {
          await signInWithEmailAndPassword(auth, trimmed, trimmedPassword);
        }
        onNext(trimmed, true); // Direct pass-through, user already authenticated
      } catch (err: any) {
        console.error("Firebase Auth Direct Error:", err);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          setError(language === 'hi' ? 'ईमेल या पासवर्ड अमान्य है।' : 'Invalid email or password.');
        } else if (err.code === 'auth/email-already-in-use') {
          setError(language === 'hi' ? 'यह ईमेल पहले से पंजीकृत है।' : 'Email already in use.');
        } else if (err.code === 'auth/weak-password') {
          setError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
        } else {
          setError(err.message || 'प्रमाणीकरण विफल रहा।');
        }
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    onNext(trimmed, false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white" id="contact_step_title">
          {language === 'hi' ? 'लॉगिन / साइन अप' : 'Login / Sign Up'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'hi'
            ? 'तेरापंथ एआई हब का उपयोग करने के लिए क्रेडेंशियल्स दर्ज करें'
            : 'Access the Terapanth AI Hub securely'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anti-spam Bot Honeypot Input (Visually Hidden) */}
        <input
          type="hidden"
          name="honeypot"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          placeholder="Do not fill this field"
        />

        {/* Input Switch Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => { setInputType('phone'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              inputType === 'phone'
                ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
          </button>
          <button
            type="button"
            onClick={() => { setInputType('email'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              inputType === 'email'
                ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
          </button>
        </div>

        {/* Contact Input Field */}
        <div className="space-y-1.5">
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500">
              {inputType === 'phone' ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </span>
            <input
              type={inputType === 'phone' ? 'tel' : 'email'}
              value={contact}
              onKeyDown={handleKeyDown}
              onChange={(e) => setContact(e.target.value)}
              placeholder={
                inputType === 'phone'
                  ? (language === 'hi' ? 'उदा. 9876543210' : 'e.g. 9876543210')
                  : (language === 'hi' ? 'shravak@example.com' : 'shravak@example.com')
              }
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all font-medium"
              required
            />
          </div>
        </div>

        {/* Password Mode Toggle & Inputs */}
        {inputType === 'email' && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center space-x-2 p-1">
              <input
                type="checkbox"
                id="usePasswordCheckbox"
                checked={usePassword}
                onChange={(e) => {
                  setUsePassword(e.target.checked);
                  setError(null);
                  setIsResetSent(false);
                }}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-800 cursor-pointer"
              />
              <label htmlFor="usePasswordCheckbox" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                {language === 'hi' ? 'पासवर्ड के साथ लॉगिन/साइन-अप करें' : 'Sign in / Sign up with Password'}
              </label>
            </div>

            {usePassword && (
              <div className="space-y-3 animate-fadeIn">
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'hi' ? 'पासवर्ड दर्ज करें (Password)...' : 'Enter Password...'}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all font-medium"
                    required={usePassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between px-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                  >
                    {isSignUp 
                      ? (language === 'hi' ? 'लॉगिन मोड पर जाएं' : 'Switch to Login') 
                      : (language === 'hi' ? 'नया खाता बनाएं?' : 'Create an account?')}
                  </button>

                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-slate-500 dark:text-slate-400 hover:text-orange-500 hover:underline cursor-pointer"
                    >
                      {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reset Password Success Banner */}
        {isResetSent && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center space-x-2 text-xs font-bold">
            <span className="text-emerald-500 font-extrabold">✓</span>
            <span>
              {language === 'hi' 
                ? 'पासवर्ड रीसेट ईमेल सफलतापूर्वक भेजा गया! कृपया अपना इनबॉक्स जांचें।' 
                : 'Password reset email sent! Please check your inbox.'}
            </span>
          </div>
        )}

        {/* Typing Behavior Visualization Component */}
        <div className="bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3 text-orange-400 animate-pulse" />
              {language === 'hi' ? 'व्यवहार बायोमेट्रिक्स संकेतक' : 'Behavioral Biometric Pattern'}
            </span>
            <span>{typingMetrics.length} {language === 'hi' ? 'कीस्ट्रोक्स' : 'strokes'}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={340}
            height={30}
            className="w-full bg-slate-100/50 dark:bg-slate-950/80 rounded h-[30px] border border-slate-200/40 dark:border-slate-800/40"
          />
        </div>

        {/* reCAPTCHA Security Checkbox */}
        <div 
          onClick={() => setIsBotChecked(!isBotChecked)}
          className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer select-none transition-all ${
            isBotChecked 
              ? 'bg-orange-50/50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/40' 
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isBotChecked}
              onChange={() => {}}
              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 pointer-events-none"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'मैं एक इंसान हूँ (सुरक्षित सत्यापित)' : 'I am a human (Verified Sec)'}
            </span>
          </div>
          <ShieldCheck className={`w-5 h-5 ${isBotChecked ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`} />
        </div>

        {/* Error State Banner */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 rounded-xl flex items-center space-x-2 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Progress Trigger */}
        <button
          type="submit"
          disabled={!isBotChecked || authLoading}
          className={`w-full py-3.5 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all active:scale-98 cursor-pointer ${
            isBotChecked && !authLoading
              ? 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg' 
              : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
          }`}
        >
          {authLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : null}
          <span>
            {authLoading
              ? (language === 'hi' ? 'प्रमाणित किया जा रहा है...' : 'Authenticating...')
              : inputType === 'email' && usePassword
                ? isSignUp
                  ? (language === 'hi' ? 'नया खाता बनाएं' : 'Create Account')
                  : (language === 'hi' ? 'लॉगिन करें' : 'Login')
                : (language === 'hi' ? 'सत्यापन कोड प्राप्त करें' : 'Get Verification Code')
            }
          </span>
          {!authLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
