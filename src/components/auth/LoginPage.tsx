import React, { useState, useEffect } from 'react';
import { ContactStep } from './ContactStep';
import { OtpStep } from './OtpStep';
import { RegisterStep } from './RegisterStep';
import { getDeviceFingerprint, maskContact, loginWithWebAuthnCredential } from './authSecurity';
import { SuccessModal } from './SuccessModal';
import { Sun, Moon, Languages, ShieldCheck, Cpu, MapPin, CheckCircle, Flame, Fingerprint, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { devLog } from '../../lib/devLog';

interface LoginPageProps {
  onLoginSuccess?: (username: string, contact: string) => void;
  isModal?: boolean;
}

export function LoginPage({ onLoginSuccess, isModal = false }: LoginPageProps) {
  const { signInWithGoogle } = useAuth();
  const [step, setStep] = useState(1); // 1: Contact, 2: OTP, 3: Register, 4: Success
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [userData, setUserData] = useState({ contact: '', username: '' });
  
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [simulatedIp, setSimulatedIp] = useState('192.168.1.1');
  const [simulatedCity, setSimulatedCity] = useState('Ladnun, Rajasthan');

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [biometricToast, setBiometricToast] = useState<string | null>(null);
  const [autoFillOtp, setAutoFillOtp] = useState(false);
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Load configuration on mount
  useEffect(() => {
    setDeviceFingerprint(getDeviceFingerprint());
    
    // Simulate lookup of geolocation
    const cities = ['New Delhi, Delhi', 'Mumbai, Maharashtra', 'Ladnun, Rajasthan', 'Jaipur, Rajasthan', 'Surat, Gujarat', 'Bengaluru, Karnataka'];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    setSimulatedCity(randomCity);

    const randomIp = `103.241.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    setSimulatedIp(randomIp);

    // Read theme from document element
    const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const handleContactSubmitted = (contact: string, isAlreadyAuthenticated: boolean = false) => {
    setUserData((prev) => ({ ...prev, contact }));
    if (isAlreadyAuthenticated) {
      const simulatedUsername = contact.includes('@') 
        ? contact.split('@')[0] 
        : `Shravak_${contact.slice(-4)}`;
      setUserData((prev) => ({ ...prev, username: simulatedUsername }));
      triggerSuccessCelebration(simulatedUsername);
    } else {
      setStep(2);
    }
  };

  const handleOtpVerified = (isNewUser: boolean) => {
    if (isNewUser) {
      setStep(3);
    } else {
      // Existing user: create simulated username from contact
      const simulatedUsername = userData.contact.includes('@') 
        ? userData.contact.split('@')[0] 
        : `Shravak_${userData.contact.slice(-4)}`;
      setUserData((prev) => ({ ...prev, username: simulatedUsername }));
      triggerSuccessCelebration(simulatedUsername);
    }
  };

  const handleRegistrationCompleted = (username: string) => {
    setUserData((prev) => ({ ...prev, username }));
    triggerSuccessCelebration(username);
  };

  const triggerSuccessCelebration = (userDisplayName: string) => {
    setStep(4);
    setIsSuccessModalOpen(true);
    
    // Fire celebratory confetti bursts
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    handleCompleteFlow();
  };

  const handleBiometricLogin = async () => {
    setIsBiometricAuthenticating(true);
    setBiometricToast(null);
    try {
      const credentials = await loginWithWebAuthnCredential();
      if (credentials) {
        setBiometricToast(language === 'hi' ? 'बायोमेट्रिक सत्यापित!' : 'Biometric Verified');
        
        // Auto fill email/phone to bypass steps deterministically
        const savedContact = "9876543210";
        setUserData({
          contact: savedContact,
          username: "Muni_Jyotirmaay_Guest"
        });

        setTimeout(() => {
          setBiometricToast(null);
          setAutoFillOtp(true);
          setStep(2); // Go to OTP step, which will auto-fill and submit!
        }, 1200);
      }
    } catch (err: any) {
      console.error("Biometric authentication error:", err);
      setBiometricToast(language === 'hi' ? 'बायोमेट्रिक प्रमाणीकरण विफल!' : 'Biometric Verification Failed!');
      setTimeout(() => setBiometricToast(null), 3000);
    } finally {
      setIsBiometricAuthenticating(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleAuthenticating(true);
    setGoogleError(null);
    try {
      await signInWithGoogle();
      const currentUser = auth.currentUser;
      if (currentUser) {
        devLog("User logged in via Google:", currentUser.email);
        setUserData({
          contact: currentUser.email || '',
          username: currentUser.displayName || 'Shravak'
        });
        triggerSuccessCelebration(currentUser.displayName || 'Shravak');
      }
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      setGoogleError(language === 'hi' ? 'गूगल लॉगिन विफल रहा!' : 'Google Login Failed!');
      setTimeout(() => setGoogleError(null), 4000);
    } finally {
      setIsGoogleAuthenticating(false);
    }
  };

  const handleCompleteFlow = () => {
    if (onLoginSuccess) {
      onLoginSuccess(userData.username, userData.contact);
    } else {
      // Reload or navigate
      window.location.reload();
    }
  };

  const renderContent = () => (
    <div className={`w-full max-w-md ${isModal ? 'bg-white dark:bg-slate-900' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800/60 shadow-2xl'} p-8 rounded-3xl transition-all relative`}>
      {biometricToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-full shadow-lg flex items-center space-x-2 animate-bounce">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>{biometricToast}</span>
        </div>
      )}

      {/* Spiritual Seal / Brand Badge */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-3 border border-orange-500/20">
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
        </div>
        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-black tracking-widest uppercase">
          {language === 'hi' ? 'जैन तेरापंथ' : 'JAIN TERAPANTH'}
        </span>
      </div>

      {googleError && (
        <div className="mb-4 p-3 bg-red-500/15 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold text-center">
          {googleError}
        </div>
      )}

      {/* Dynamic Multi-Step Subforms */}
      {step === 1 && (
        <>
          <ContactStep onNext={handleContactSubmitted} language={language} />

          <div className="relative my-4 flex py-1.5 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800/50"></div>
            <span className="flex-shrink mx-3 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              {language === 'hi' ? 'या सुरक्षित' : 'or secure'}
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800/50"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleAuthenticating}
            className="w-full py-3 mb-3 bg-white hover:bg-slate-50 dark:bg-slate-950/40 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer shadow-sm disabled:opacity-50 text-xs sm:text-sm"
          >
            {isGoogleAuthenticating ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.39 2.673 1.473 6.564l3.793 3.201z"
                />
                <path
                  fill="#4285F4"
                  d="M16.04 15.345c-1.127.764-2.509 1.218-4.04 1.218-2.927 0-5.418-1.982-6.309-4.655L1.92 15.11C3.836 19.01 7.8 21.682 12 21.682c3.11 0 5.927-1.09 8.045-2.964l-4.005-3.373z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.691 11.909a7.001 7.001 0 0 1 0-2.145L1.898 6.564a11.928 11.928 0 0 0 0 10.773l3.793-3.201c-.22-.682-.345-1.41-.345-2.227z"
                />
                <path
                  fill="#34A853"
                  d="M23.491 12.273c0-.818-.082-1.609-.227-2.382H12v4.518h6.464a5.536 5.536 0 0 1-2.427 3.636l4.005 3.373c2.345-2.164 3.791-5.336 3.791-8.927z"
                />
              </svg>
            )}
            <span>
              {isGoogleAuthenticating 
                ? (language === 'hi' ? 'गूगल प्रमाणित...' : 'Verifying with Google...') 
                : (language === 'hi' ? 'गूगल के साथ लॉगिन करें' : 'Continue with Google')}
            </span>
          </button>

          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={isBiometricAuthenticating}
            className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isBiometricAuthenticating ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            ) : (
              <Fingerprint className="w-4 h-4 text-orange-500 animate-pulse" />
            )}
            <span>
              {isBiometricAuthenticating 
                ? (language === 'hi' ? 'बायोमेट्रिक्स प्रमाणित...' : 'Verifying Biometrics...') 
                : (language === 'hi' ? 'बायोमेट्रिक्स के साथ लॉगिन करें' : 'Login with Biometrics')}
            </span>
          </button>
        </>
      )}
      
      {step === 2 && (
        <OtpStep 
          onVerify={handleOtpVerified} 
          contact={userData.contact} 
          language={language} 
          autoFill={autoFillOtp}
        />
      )}
      
      {step === 3 && (
        <RegisterStep 
          onComplete={handleRegistrationCompleted} 
          language={language} 
        />
      )}

      {/* Step 4: Success Telemetry Dashboard */}
      {step === 4 && (
        <div className="space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              जय जिनेन्द्र, {userData.username}!
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              {language === 'hi' 
                ? 'सुरक्षित लॉगिन पूरा हो गया है।' 
                : 'Your secure session has been established successfully.'}
            </p>
          </div>

          {/* Session Audit Telemetry Details Container */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-left space-y-3">
            <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              {language === 'hi' ? 'सत्र ऑडिट विवरण (Session Logs)' : 'Session Audit Telemetry'}
            </span>

            <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1.5">
                <span className="text-slate-400">{language === 'hi' ? 'प्रवेश माध्यम:' : 'Contact:'}</span>
                <span className="font-mono">{maskContact(userData.contact)}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1.5">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {language === 'hi' ? 'आईपी स्थान:' : 'Geo IP Location:'}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{simulatedCity} ({simulatedIp})</span>
              </div>

              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  {language === 'hi' ? 'सुरक्षा टोकन:' : 'Device Fingerprint:'}
                </span>
                <span className="font-mono text-[10px] text-orange-600 dark:text-orange-400 max-w-[180px] truncate">
                  {deviceFingerprint}
                </span>
              </div>
            </div>
          </div>

          {/* Final Entry Trigger Button */}
          <button
            onClick={handleCompleteFlow}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            {language === 'hi' ? 'डैशबोर्ड में प्रवेश करें' : 'Proceed to Dashboard'}
          </button>
        </div>
      )}

      {/* Back Link during active steps */}
      {step > 1 && step < 4 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setStep((s) => s - 1)}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-orange-500 font-bold transition-colors"
          >
            &larr; {language === 'hi' ? 'पीछे जाएं' : 'Go Back'}
          </button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        {/* Floating Utility Controls (embedded inside modal layout) */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <button
            onClick={toggleLanguage}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors"
            title="Switch Language"
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        {renderContent()}

        <SuccessModal 
          isOpen={isSuccessModalOpen} 
          onClose={handleSuccessModalClose} 
          username={userData.username} 
          language={language} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative Aura / Spiritual Background Nodes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/10 dark:bg-orange-500/5 rounded-full filter blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 rounded-full filter blur-3xl -z-10 animate-pulse pointer-events-none" />

      {/* Top Floating Utility Actions Bar */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        <button
          onClick={toggleLanguage}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors shadow-sm"
          title="Switch Language"
        >
          <Languages className="w-5 h-5" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {renderContent()}

      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={handleSuccessModalClose} 
        username={userData.username} 
        language={language} 
      />

      <span className="text-[10px] text-slate-400 font-bold mt-6 select-none opacity-60">
        © 2026 Terapanth AI Hub • Weetragi Communication Design
      </span>
    </div>
  );
}

export default LoginPage;
