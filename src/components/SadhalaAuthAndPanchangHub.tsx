import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Shield, Lock, UserCheck, Flame, RefreshCw, LogOut, CheckCircle2, KeyRound } from 'lucide-react';

export const SadhalaAuthAndPanchangHub = () => {
  // 1. AUTH STATES
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isOpNotAllowed, setIsOpNotAllowed] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Use the global auth context or fallback if needed
  const { user, logout, signInWithGoogle } = useAuth();

  // 2. FASTING / PANCHANG STATES
  const [selectedPachkkhan, setSelectedPachkkhan] = useState('एकासन (Ekasan)');
  const [logSuccess, setLogSuccess] = useState(false);
  const [loggingProgress, setLoggingProgress] = useState(false);

  // FORM-FIELD VALIDATION HELPER
  const validateForm = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setAuthError('कृपया ईमेल आईडी दर्ज करें। (Please enter email)');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setAuthError('कृपया वैध ईमेल आईडी दर्ज करें। (Please enter a valid email)');
      return false;
    }

    if (!trimmedPassword) {
      setAuthError('कृपया पासवर्ड दर्ज करें। (Please enter password)');
      return false;
    }

    if (isSignUp && trimmedPassword.length < 6) {
      setAuthError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए। (Password must be at least 6 characters)');
      return false;
    }

    return true;
  };

  // HANDLE USER AUTHENTICATION (Sign In / Sign Up)
  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsOpNotAllowed(false);

    if (!validateForm()) {
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/operation-not-allowed' || (err?.message && err.message.includes('operation-not-allowed'))) {
        setIsOpNotAllowed(true);
      }
      if (err.message.includes('auth/invalid-credential') || err.message.includes('auth/wrong-password')) {
        setAuthError('ईमेल या पासवर्ड अमान्य है।');
      } else if (err.message.includes('auth/weak-password')) {
        setAuthError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      } else if (err.message.includes('auth/email-already-in-use')) {
        setAuthError('यह ईमेल पहले से पंजीकृत है।');
      } else {
        setAuthError(err.message || 'प्रमाणीकरण विफल रहा।');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // HANDLE FORGOT PASSWORD LINK
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setResetSent(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setAuthError('कृपया ईमेल आईडी दर्ज करें। (Please enter email)');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setAuthError('कृपया वैध ईमेल आईडी दर्ज करें। (Please enter a valid email)');
      return;
    }

    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'पासवर्ड रीसेट लिंक भेजने में त्रुटि।');
    } finally {
      setAuthLoading(false);
    }
  };

  // HANDLE ONE-CLICK GOOGLE SIGN-IN
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsOpNotAllowed(false);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/operation-not-allowed') {
        setIsOpNotAllowed(true);
      } else {
        setAuthError(err.message || 'गूगल लॉगिन विफल रहा!');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // SUBMIT DYNAMIC FASTING LOG TO FIRESTORE (Aligned with security rules path /users/{userId}/fastingLogs/{logId})
  const handleFastingSubmit = async () => {
    if (!user) {
      alert('कृपया पचक्खान लॉग दर्ज करने के लिए पहले लॉगिन करें भाईसाहब!');
      return;
    }
    try {
      setLogSuccess(false);
      setLoggingProgress(true);
      // Write to users/{userId}/fastingLogs/{logId} path to compile with firestore.rules
      const fastingRef = collection(db, 'users', user.uid, 'fastingLogs');
      await addDoc(fastingRef, {
        type: selectedPachkkhan,
        date: new Date().toISOString().split('T')[0],
        timestamp: serverTimestamp() // triggers firestore.rules 'isValidFastingLog' successfully
      });
      setLogSuccess(true);
      setTimeout(() => setLogSuccess(false), 4000);
    } catch (err) {
      console.error("Firestore submission error:", err);
      alert("सुरक्षा नियमों के कारण सबमिशन विफल रहा। कृपया सुनिश्चित करें कि आप लॉगिन हैं।");
    } finally {
      setLoggingProgress(false);
    }
  };

  return (
    <div id="sadhala-auth-panchang-hub" className="bg-zinc-950/40 dark:bg-black/50 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden text-white my-6 backdrop-blur-xl">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-white/10 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-3">
          <Flame size={24} className="animate-pulse" />
        </div>
        <h2 className="serif-text text-xl font-extrabold tracking-tight text-amber-200">🕉️ तेरापंथ साधना सिंक एवं पंचांग केंद्र</h2>
        <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Firebase Auth & Realtime Fasting Ledger</span>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* SECTION 1: DYNAMIC FIREBASE AUTHENTICATION FRAMEWORK */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/15">
                <Shield size={16} />
              </div>
              <h3 className="font-bold text-sm text-amber-100 uppercase tracking-wider">
                {user ? '🟢 श्रावक प्रोफाइल सिंक सक्रिय' : '🔐 श्रावक साधना खाता लॉगिन'}
              </h3>
            </div>

            {user ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                    <UserCheck size={14} />
                    <span>सफलतापूर्वक लॉगिन सक्रिय!</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    आपकी दैनिक सामायिक, जाप व तपस्या का डेटा क्लाउड सर्वर पर सुरक्षित सिंक हो रहा है।
                  </p>
                  <p className="text-[9px] text-gray-500 font-mono select-all pt-1">
                    UID: {user.uid}
                  </p>
                </div>
              </div>
            ) : forgotPasswordMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-[11px] text-gray-300 leading-relaxed mb-1">
                  अपना पंजीकृत ईमेल दर्ज करें। हम आपको पासवर्ड रीसेट करने का लिंक भेजेंगे। (Enter registered email for reset link)
                </p>
                <div>
                  <input 
                    type="email" 
                    placeholder="अपनी ईमेल आईडी दर्ज करें (Email)..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-zinc-900/60 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>

                {authError && (
                  <div className="text-red-400 text-2xs font-extrabold flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{authError}</span>
                  </div>
                )}

                {resetSent && (
                  <div className="text-emerald-400 text-2xs font-extrabold flex items-center gap-1 leading-relaxed">
                    <span>✓</span>
                    <span>पासवर्ड रीसेट ईमेल भेज दिया गया है! कृपया अपना इनबॉक्स जांचें।</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {authLoading && <RefreshCw size={12} className="animate-spin" />}
                    <span>लिंक भेजें (Send Link)</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setForgotPasswordMode(false);
                      setResetSent(false);
                      setAuthError('');
                    }}
                    className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
                  >
                    वापस लॉगिन (Back)
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAuthAction} className="space-y-3">
                <div>
                  <input 
                    type="email" 
                    placeholder="अपनी ईमेल आईडी दर्ज करें (Email)..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-zinc-900/60 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <input 
                    type="password" 
                    placeholder="पासवर्ड दर्ज करें (Password)..." 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-zinc-900/60 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>
                
                {authError && !isOpNotAllowed && (
                  <div className="text-red-400 text-2xs font-extrabold flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{authError}</span>
                  </div>
                )}

                {isOpNotAllowed && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-2xl text-[11px] space-y-2.5 mt-2 leading-relaxed">
                    <p className="font-bold">⚠️ {isSignUp ? 'खाता निर्माण' : 'लॉगिन'} प्रदाता आवश्यक है (Sign-In Provider Disabled)</p>
                    <p className="text-gray-300">
                      साधना डेटा को सिंक करने हेतु आपके फायरबेस कंसोल में "Email/Password" प्रदाता सक्रिय होना अनिवार्य है।
                    </p>
                    <div className="p-2 bg-black/40 rounded-xl space-y-1 text-[10px] font-mono text-gray-400 border border-white/5">
                      <p>1. Open <a href={`https://console.firebase.google.com/project/${auth.app.options.projectId || 'plucky-semiotics-7cf5x'}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-bold">Firebase Console &rarr;</a></p>
                      <p>2. Select <strong>Sign-in method</strong> tab</p>
                      <p>3. Click <strong>Email/Password</strong> &rarr; Enable &rarr; Save</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('tp_demo_user', JSON.stringify({
                          uid: `demo_${email.split('@')[0] || 'shravak'}`,
                          email: email || 'demo@terapanth.ai',
                          displayName: email.split('@')[0] || 'Shravak',
                          role: 'user'
                        }));
                        window.location.reload();
                      }}
                      className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-xl transition-all text-[11px] cursor-pointer text-center"
                    >
                      डेमो बाईपास (Demo Bypass)
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <button 
                      type="submit"
                      disabled={authLoading}
                      className="flex-1 max-w-[140px] py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {authLoading && <RefreshCw size={12} className="animate-spin" />}
                      <span>{isSignUp ? 'खाता बनाएं' : 'लॉगिन करें'}</span>
                    </button>
                    
                    <div className="flex flex-col items-end gap-1.5">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setAuthError('');
                        }}
                        className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer font-bold"
                      >
                        {isSignUp ? 'पहले से खाता है?' : 'नया खाता बनाना है?'}
                      </button>

                      {!isSignUp && (
                        <button 
                          type="button"
                          onClick={() => {
                            setForgotPasswordMode(true);
                            setAuthError('');
                            setResetSent(false);
                          }}
                          className="text-[10px] text-amber-400/80 hover:text-amber-300 underline cursor-pointer font-bold"
                        >
                          पासवर्ड भूल गए? (Forgot?)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Or continue with Google button */}
                  <div className="relative my-2 flex py-1 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-3 text-gray-500 text-[10px] font-black uppercase tracking-widest">or</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full py-2.5 bg-white hover:bg-gray-100 text-zinc-900 font-extrabold rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
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
                    <span>गूगल के साथ लॉगिन करें (Continue with Google)</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {user && (
            <div className="pt-4 border-t border-white/5 mt-4">
              <button 
                onClick={() => logout()}
                className="w-full py-2.5 px-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 hover:border-red-500/30 font-bold active:scale-95 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} />
                खाता लॉगआउट (Sign Out)
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: LIVE PANCHANG & PACHKKHAN SUBMISSION WIDGET */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                  <Calendar size={16} />
                </div>
                <h3 className="font-bold text-sm text-emerald-100 uppercase tracking-wider">📅 दैनिक तेरापंथ पंचांग व तप लॉग</h3>
              </div>
              <span className="text-[10px] text-amber-400 font-black tracking-wider">वि.सं. २०८३</span>
            </div>

            {/* Realtime Panchang Display Node */}
            <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl text-[11px] text-gray-300 flex flex-col gap-1.5 mb-4 leading-relaxed">
              <div className="flex items-center gap-1">
                <span className="text-amber-400 font-bold">• आज की तिथि:</span> 
                <span>वीर निर्वाण संवत् २५५३ / ज्येष्ठ शुक्ल पक्ष</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-amber-400 font-bold">• मर्यादा संकेत:</span> 
                <span className="text-gray-400">सूर्योदय के पश्चात् ४८ मिनट (नवकारसी) तक भोजन-जल का त्याग अनिवार्य है।</span>
              </div>
            </div>

            {/* Pachkkhan Selection Inputs */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                आज धारण किया गया पचक्खान/तपस्या:
              </label>
              <select 
                value={selectedPachkkhan}
                onChange={(e) => setSelectedPachkkhan(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900/60 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-500/50 cursor-pointer transition-all"
              >
                <option value="एकासन (Ekasan)">एकासन (Ekasan)</option>
                <option value="ब्यासना (Byasana)">ब्यासना (Byasana)</option>
                <option value="उपवास (Upvas)">उपवास (Upvas)</option>
                <option value="आयंबिल (Ayambil)">आयंबिल (Ayambil)</option>
                <option value="नवकारसी (Navkarsi)">नवकारसी (Navkarsi)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 mt-4 space-y-3">
            <button 
              onClick={handleFastingSubmit}
              disabled={loggingProgress}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loggingProgress ? <RefreshCw size={13} className="animate-spin" /> : <Shield size={13} />}
              तपस्या लॉग सुरक्षित करें (Log Vow)
            </button>

            <AnimatePresence>
              {logSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 text-emerald-300 text-[11px] font-bold"
                >
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                  <span>🎉 आज का तपस्या लॉग फ़ायरबेस क्लाउड पर सुरक्षित हो गया है भाई!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
