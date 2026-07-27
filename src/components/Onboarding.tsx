import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, MessageSquare, Award, ArrowRight, CheckCircle2, User, MapPin, Building, Sparkles, Heart } from 'lucide-react';
import { saveUserProfile, getUserProfile } from '../utils/userProfile';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const existingProfile = getUserProfile();

  // Profile Form State
  const [name, setName] = useState(existingProfile.name || '');
  const [age, setAge] = useState(existingProfile.age ? String(existingProfile.age) : '');
  const [gender, setGender] = useState(existingProfile.gender || 'Male');
  const [city, setCity] = useState(existingProfile.city || '');
  const [wing, setWing] = useState(existingProfile.wing || 'General Devotee (श्रावक/श्राविका)');
  const [errorMsg, setErrorMsg] = useState('');

  const totalSteps = 4; // 3 Intro Slides + 1 Registration Form Step

  const slides = [
    {
      title: "Spiritual Companion",
      description: "तेरापंथ दर्शन, दैनिक साधना और पंचांग को अपने मोबाइल पर एक बेहद आधुनिक और साफ-सुथरे इंटरफेस में अनुभव करें।",
      icon: <Compass className="w-14 h-14 text-orange-600" />,
      color: "from-orange-500/10 to-amber-500/10"
    },
    {
      title: "Ask Terapanth Mitra",
      description: "हमारा सुरक्षित एआई इंजन (Gemini API द्वारा संचालित) जैन दर्शन, आगमों और आचार्य परंपरा से जुड़े आपके हर सवाल का सही जवाब देगा।",
      icon: <MessageSquare className="w-14 h-14 text-emerald-600" />,
      color: "from-emerald-500/10 to-teal-500/10"
    },
    {
      title: "Track Your Sadhana",
      description: "सामयिक, जप काउंटर और दैनिक व्रतों को आसानी से लॉग करें। जैसे-जैसे आपके नियम पूरे होंगे, आपकी प्रोग्रेस रिंग्स भरती जाएंगी।",
      icon: <Award className="w-14 h-14 text-blue-600" />,
      color: "from-blue-500/10 to-indigo-500/10"
    }
  ];

  const handleNext = () => {
    if (currentSlide < totalSteps - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    if (!name.trim()) {
      setErrorMsg('कृपया अपना नाम दर्ज करें (Please enter your name)');
      return;
    }

    setErrorMsg('');

    // Save profile to localStorage with reactive event
    saveUserProfile({
      name: name.trim(),
      fullName: name.trim(),
      age: age.trim(),
      gender: gender,
      city: city.trim(),
      wing: wing,
    });

    // Mark onboarding complete
    localStorage.setItem('terapanth_hub_onboarded', 'true');
    onComplete();
  };

  const firstName = name.trim().split(' ')[0] || (name.trim() ? name.trim() : 'करण');

  return (
    <div className="fixed inset-0 bg-[#FCF8F2] z-[9999] flex flex-col justify-between p-4 sm:p-6 font-sans select-none overflow-y-auto">
      {/* Decorative Atmosphere Filter */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none z-0" />

      {/* Top Slide Tracker Indicators */}
      <div className="flex gap-2 w-full max-w-md mx-auto pt-2 relative z-10 shrink-0">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index}
            className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${index === currentSlide ? 'bg-orange-600' : 'bg-stone-200'}`}
          />
        ))}
      </div>

      {/* Main Content Animation Shell */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative z-10 my-auto py-4">
        <AnimatePresence mode="wait">
          {currentSlide < 3 ? (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center text-center px-4"
            >
              {/* Soft Ambient Vector Frame */}
              <div className={`p-6 sm:p-8 rounded-full bg-gradient-to-br ${slides[currentSlide].color} mb-6 shadow-inner border border-stone-100`}>
                {slides[currentSlide].icon}
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 tracking-tight mb-3">
                {slides[currentSlide].title}
              </h2>
              
              <p className="text-sm text-stone-600 leading-relaxed max-w-xs">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          ) : (
            /* STEP 4: USER REGISTRATION / ONBOARDING PROFILE FORM */
            <motion.div
              key="form-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xl space-y-4"
            >
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <Sparkles size={12} className="text-amber-600" />
                  व्यक्तिगत प्रोफ़ाइल पंजीकरण
                </span>
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  आपका स्वागत है! (Welcome)
                </h3>
                <p className="text-xs text-stone-500">
                  ऐप में प्रवेश करने से पहले कृपया अपना विवरण दर्ज करें ताकि हम आपको व्यक्तिगत जय जिनेन्द्र संबोधन दे सकें।
                </p>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3 text-left">
                {/* Name Input */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                    <User size={13} className="text-amber-600" />
                    आपका नाम (Your Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="उदा. Karan / करण"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                  />
                  {errorMsg && <p className="text-xs text-rose-600 font-bold mt-1">{errorMsg}</p>}
                </div>

                {/* Age & Gender Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      आयु (Age)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="उदा. 28"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      लिंग (Gender)
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                    >
                      <option value="Male">पुरुष (Male)</option>
                      <option value="Female">महिला (Female)</option>
                      <option value="Other">अन्य (Other)</option>
                    </select>
                  </div>
                </div>

                {/* City Location */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                    <MapPin size={13} className="text-amber-600" />
                    शहर/स्थान (City/Location)
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="उदा. Surat / लाडनूँ / Delhi"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                {/* Terapanth Wing Selection */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                    <Building size={13} className="text-amber-600" />
                    तेरापंथ संस्था/विंग (Wing)
                  </label>
                  <select
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                  >
                    <option value="ABTYP (युवक परिषद)">ABTYP (तेरापंथ युवक परिषद)</option>
                    <option value="TPF (प्रोफेशनल फोरम)">TPF (तेरापंथ प्रोफेशनल फोरम)</option>
                    <option value="ABTMM (महिला मंडल)">ABTMM (तेरापंथ महिला मंडल)</option>
                    <option value="GYANSHALA (ज्ञानशाला)">ज्ञानशाला (Gyanshala)</option>
                    <option value="General Devotee (श्रावक/श्राविका)">सामान्य श्रावक / श्राविका (General Devotee)</option>
                  </select>
                </div>

                {/* Live Greeting Card Preview */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-300 text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    लाइव अभिवादन पूर्वावलोकन (Live Greeting Preview)
                  </span>
                  <p className="font-serif font-black text-amber-900 text-base">
                    {`जय जिनेन्द्र ${firstName}! 🙏`}
                  </p>
                  <p className="text-[11px] text-stone-600 font-medium">
                    {`Jai Jinendra ${firstName}! 🙏 Have a blessed day ahead.`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Action Button Tray */}
      <div className="w-full max-w-md mx-auto pb-4 relative z-10 shrink-0">
        <button
          onClick={handleNext}
          className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-stone-950/10 cursor-pointer"
        >
          {currentSlide < 3 ? (
            <>
              आगे बढ़ें (Next) <ArrowRight className="w-4 h-4 text-stone-400" />
            </>
          ) : (
            <>
              पंजीकरण पूर्ण करें एवं ऐप में प्रवेश करें <CheckCircle2 className="w-4 h-4 text-orange-400" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
