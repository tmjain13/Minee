import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Heart, Calendar, ArrowRight, ArrowLeft, X, Check, HelpCircle, Smartphone } from 'lucide-react';

interface AppTourProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: string;
  onTourComplete: () => void;
}

export default function AppTour({ activeTab, setActiveTab, language, onTourComplete }: AppTourProps) {
  const [showInvitation, setShowInvitation] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Check if user already completed the tour
  useEffect(() => {
    const tourCompleted = localStorage.getItem('terapanth_hub_tour_completed');
    if (tourCompleted === 'true') {
      setShowInvitation(false);
    }
  }, []);

  const tourSteps = [
    {
      targetTab: 'home',
      icon: <Sparkles className="w-8 h-8 text-orange-500" />,
      titleEn: "Welcome to Terapanth AI Hub!",
      titleHi: "तेरापंथ एआई हब में आपका स्वागत है!",
      descEn: "Your centralized digital center for Shwetambar Terapanth knowledge, daily reflections, and spiritual tools. Let's take a 1-minute tour!",
      descHi: "श्वेतांबर तेरापंथ ज्ञान, दैनिक विचारों और आध्यात्मिक उपकरणों के लिए आपका डिजिटल केंद्र। आइए एक मिनट का टूर लें!",
      pointerPosition: "10%", // Left offset above bottom navigation
    },
    {
      targetTab: 'home',
      icon: <Smartphone className="w-8 h-8 text-amber-500 animate-pulse" />,
      titleEn: "Swipe Gestures Navigation",
      titleHi: "स्वाइप जेस्चर द्वारा नेविगेशन",
      descEn: "Seamlessly navigate! You can swipe left or right anywhere on the screen to switch tabs (Home, Chat, Sadhana, Panchang, Profile) with smooth transitions.",
      descHi: "सहज नेविगेशन! आप सभी मुख्य टैब (होम, चैट, साधना, पंचांग, प्रोफाइल) के बीच आसानी से बदलाव करने के लिए स्क्रीन पर कहीं भी बाएं या दाएं स्वाइप कर सकते हैं।",
      pointerPosition: "30%",
    },
    {
      targetTab: 'chat',
      icon: <MessageSquare className="w-8 h-8 text-emerald-500" />,
      titleEn: "Ask Terapanth Mitra",
      titleHi: "तेरापंथ मित्र से पूछें",
      descEn: "Powered by Gemini 2.0 Flash, this secure server-side assistant answers all your questions on Jain history, philosophy, and Gyanshala syllabus in complete privacy.",
      descHi: "जेमिनी 2.0 फ़्लैश द्वारा संचालित यह सुरक्षित असिस्टेंट जैन इतिहास, दर्शन और ज्ञानशाला पाठ्यक्रम के आपके सभी प्रश्नों के सही उत्तर देता है।",
      pointerPosition: "50%",
    },
    {
      targetTab: 'sadhana',
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      titleEn: "Spiritual Sadhana Tracker",
      titleHi: "आध्यात्मिक साधना ट्रैकर",
      descEn: "Log your daily prayers, fasts (Tapasya), or start a silent 48-minute Samayik meditation. Progress rings fill in real-time as you complete your vows.",
      descHi: "अपनी दैनिक सामायिक, जप या तपस्या लॉग करें। जैसे-जैसे आपके नियम पूरे होंगे, आपकी प्रोग्रेस रिंग्स वास्तविक समय में भरती जाएंगी।",
      pointerPosition: "70%",
    },
    {
      targetTab: 'panchang',
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      titleEn: "Calendar & Sunset Alerts",
      titleHi: "पंचांग और सूर्यास्त अलर्ट",
      descEn: "Access verified lunar-solar tithis, historical Maryada Mahotsav matrices, and precise location-based sunset timers for Chauvihar schedules.",
      descHi: "सटीक चंद्र-सूर्य तिथियां, ऐतिहासिक मर्यादा महोत्सव विवरण और चौविहार नियमों के लिए स्थान-आधारित सूर्यास्त टाइमर प्राप्त करें।",
      pointerPosition: "30%",
    },
    {
      targetTab: 'home',
      icon: <Sparkles className="w-8 h-8 text-orange-500" />,
      titleEn: "You Are Ready!",
      titleHi: "आप पूरी तरह तैयार हैं!",
      descEn: "Excellent! Switch tabs anytime or tap the floating '+' button for quick shortcuts to Navkar Mantra audio, Pratikraman, and Vihar logs. Jai Jinendra!",
      descHi: "शानदार! कभी भी टैब बदलें या नवकार महामंत्र, प्रतिक्रमण और विहार के लिए फ्लोटिंग '+' बटन का उपयोग करें। जय जिनेन्द्र!",
      pointerPosition: "10%",
    }
  ];

  const handleStartTour = () => {
    setShowInvitation(false);
    setIsActive(true);
    setCurrentStep(0);
    setActiveTab(tourSteps[0].targetTab);
  };

  const handleSkipTour = () => {
    localStorage.setItem('terapanth_hub_tour_completed', 'true');
    setShowInvitation(false);
    setIsActive(false);
    onTourComplete();
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setActiveTab(tourSteps[nextStep].targetTab);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setActiveTab(tourSteps[prevStep].targetTab);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('terapanth_hub_tour_completed', 'true');
    setIsActive(false);
    onTourComplete();
  };

  return (
    <>
      {/* 1. TOUR INVITATION OVERLAY DIALOG */}
      <AnimatePresence>
        {showInvitation && (
          <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-stone-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full relative"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center mb-4 border border-orange-100/50 dark:border-orange-900/20 text-orange-500">
                  <HelpCircle className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-stone-900 dark:text-white font-sans tracking-tight mb-2">
                  {language === 'hi' ? "त्वरित ऐप मार्गदर्शिका" : "Quick App Tour"}
                </h3>
                
                <p className="text-sm text-stone-600 dark:text-slate-300 leading-relaxed mb-6">
                  {language === 'hi' 
                    ? "तेरापंथ मित्र, साधना ट्रैकर और पंचांग हब जैसे प्रमुख आध्यात्मिक केंद्रों को समझने के लिए एक छोटा १-मिनट का टूर लें?" 
                    : "Would you like a quick 1-minute guided tour of our main spiritual hubs, including Chat, Sadhana logs, and Panchang alerts?"}
                </p>

                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={handleStartTour}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10"
                  >
                    {language === 'hi' ? "टूर शुरू करें" : "Start Guided Tour"} 
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleSkipTour}
                    className="w-full bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl text-sm transition-colors"
                  >
                    {language === 'hi' ? "बाद में / छोड़ें" : "Skip / Later"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. ACTIVE INTERACTIVE WALKTHROUGH */}
      <AnimatePresence>
        {isActive && (
          <div className="fixed inset-0 bg-black/50 z-[999] pointer-events-auto select-none overflow-hidden">
            
            {/* Ambient Highlighting Focus Halo above the footer nav (for specific steps) */}
            {currentStep > 0 && currentStep < 4 && (
              <div className="fixed bottom-0 left-0 right-0 z-[1000] pointer-events-none">
                <div className="max-w-md mx-auto px-3 relative h-[72px]">
                  <motion.div 
                    className="absolute top-[8px] -translate-x-1/2 w-14 h-14 rounded-full border-2 border-orange-500 bg-orange-500/10 shadow-[0_0_20px_#f97316]"
                    style={{ left: tourSteps[currentStep].pointerPosition }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}

            {/* Main Interactive Guide Tooltip Card */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 flex justify-center items-center p-4 pointer-events-none">
              <motion.div 
                key={currentStep}
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -15 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="bg-white dark:bg-slate-900 border border-stone-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-2xl max-w-sm w-full pointer-events-auto relative"
              >
                {/* Skip Icon */}
                <button
                  onClick={handleComplete}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-white transition-colors"
                  aria-label="Exit Tour"
                >
                  <X size={18} />
                </button>

                {/* Card Header & Icon */}
                <div className="flex gap-4 items-start mb-4">
                  <div className="p-3 bg-stone-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 border border-stone-100 dark:border-slate-700/50">
                    {tourSteps[currentStep].icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-stone-900 dark:text-white leading-tight font-sans">
                      {language === 'hi' ? tourSteps[currentStep].titleHi : tourSteps[currentStep].titleEn}
                    </h4>
                    <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full mt-1.5 inline-block border border-orange-100 dark:border-orange-900/30">
                      {language === 'hi' ? `चरण ${currentStep + 1} / ${tourSteps.length}` : `Step ${currentStep + 1} of ${tourSteps.length}`}
                    </span>
                  </div>
                </div>

                {/* Description Body */}
                <p className="text-stone-600 dark:text-slate-300 text-sm leading-relaxed mb-6 min-h-[4.5rem]">
                  {language === 'hi' ? tourSteps[currentStep].descHi : tourSteps[currentStep].descEn}
                </p>

                {currentStep === 1 && (
                  <div className="flex justify-center items-center gap-6 py-2 mb-6 bg-orange-500/5 dark:bg-orange-500/10 rounded-xl border border-orange-500/10">
                    <motion.div
                      animate={{ x: [-30, 30, -30] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="flex items-center gap-2 text-orange-500"
                    >
                      <ArrowLeft size={16} />
                      <span className="text-xl">🖐️</span>
                      <ArrowRight size={16} />
                    </motion.div>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                      currentStep === 0 
                        ? 'opacity-0 pointer-events-none' 
                        : 'text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-white bg-stone-50 hover:bg-stone-100 dark:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ArrowLeft size={14} />
                    {language === 'hi' ? "पीछे" : "Back"}
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10"
                  >
                    {currentStep === tourSteps.length - 1 
                      ? (language === 'hi' ? "समाप्त" : "Finish") 
                      : (language === 'hi' ? "आगे बढ़ें" : "Next")}
                    {currentStep === tourSteps.length - 1 ? <Check size={14} /> : <ArrowRight size={14} />}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
