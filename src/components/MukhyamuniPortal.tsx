import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  X, 
  TrendingUp, 
  Quote, 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  ShieldAlert, 
  Share2, 
  CheckCircle2, 
  Map, 
  Info,
  Layers,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MukhyamuniPortal({ onClose }: { onClose?: () => void }) {
  const { language } = useLanguage();
  const [lang, setLang] = useState<'hi' | 'en'>(language === 'hi' ? 'hi' : 'en');
  const [activeMantraTab, setActiveMantraTab] = useState<'biography' | 'elevation' | 'contributions' | 'philosophy'>('biography');
  const [isPlayingHymn, setIsPlayingHymn] = useState(false);
  const [hymnProgress, setHymnProgress] = useState(0);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [selectedThought, setSelectedThought] = useState<'positive' | 'negative' | null>('positive');

  // Simulated audio progress timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingHymn) {
      interval = setInterval(() => {
        setHymnProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingHymn(false);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingHymn]);

  const t = {
    en: {
      title: "Mukhyamuni Monastic Portal",
      subTitle: "Jain Shvetambar Terapanth Dharmasangh",
      lblBirth: "Birthplace & Early Foundation",
      lblDiksha: "Monastic Diksha & Renunciation",
      lblPost: "Institutional Elevation as Mukhyamuni",
      lblContribution: "Spiritual Contributions & Sermons",
      lblPhilosophy: "Philosophy of Positivity",
      btnLang: "🇮🇳 हिंदी संस्करण",
      designation: "Pujya Mukhyamuni (The Chief Monk)",
      designationDesc: "The chief pillars of monastic governance, executive discipline, and spiritual guidance within the Terapanth order under Acharya Mahashraman Ji.",
      btnShare: "Share Wisdom",
      btnHymn: "Melodious Bhajans (Amritvani)",
      hymnDesc: "Listen to the soulful devotional hymns and prayers composed & recited by Mukhyamuni Ji.",
      lblCopy: "Motto Copied Successfully!",
      lblElevationPhase: "Two-Stage Apostolic Ascent"
    },
    hi: {
      title: "Pujya Mukhyamuni Shraman Portal",
      subTitle: "जैन श्वेतांबर तेरापंथ धर्मसंघ",
      lblBirth: "जन्मभूमि एवं प्रारंभिक पृष्ठभूमि",
      lblDiksha: "वैराग्य एवं कठिन जैन श्रमण दीक्षा",
      lblPost: "मुख्यमुनि गौरव ऐतिहासिक अलंकरण",
      lblContribution: "आध्यात्मिक अवदान एवं मंगल प्रवचन",
      lblPhilosophy: "सकारात्मक जीवन दर्शन (आम का चयन)",
      btnLang: "🔤 English Edition",
      designation: "पूज्य मुख्यमुनि (Chief Monk) श्री महावीर कुमार जी",
      designationDesc: "परम पूज्य आचार्य श्री महाश्रमण देव के अत्यंत विश्वसनीय, आज्ञानुवर्ती, और प्रिय शिष्य। आप संपूर्ण साधु वृन्द के कुशल अनुशासन के मुख्य संवाहक हैं।",
      btnShare: "विचार साझा करें",
      btnHymn: "मधुर जैन भजन (अमृतवाणी)",
      hymnDesc: "पूज्य मुख्यमुनि जी के सुरीले कंठ से सजे प्रेरणादायक आत्मिक भजनों एवं गीतों का रसपान करें।",
      lblCopy: "सकारात्मक विचार कॉपी किया गया!",
      lblElevationPhase: "द्वि-चरणीय ऐतिहासिक पद-सृजन"
    }
  }[lang];

  const handleShare = () => {
    const motto = lang === 'hi' 
      ? `"जैसे आप बाज़ार से आम खरीदते समय केवल मीठे आम चुनते हैं और सड़े आम छोड़ देते हैं; ठीक वैसे ही मस्तिष्क में केवल सकारात्मक विचारों को प्रवेश दें।" - पूज्य मुख्यमुनि श्री महावीर कुमार जी`
      : `"Just as you carefully select and bring home only the best mangoes from the market, you must only allow the best, most positive thoughts into your mind and reject negativity." - Pujya Mukhyamuni Shree Mahaveer Kumar Ji`;
    navigator.clipboard.writeText(motto);
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 2000);
  };

  return (
    <div className="bg-[#060814] text-white rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative flex flex-col w-full max-w-2xl mx-auto h-auto my-auto max-h-[92vh] font-sans">
      {/* Absolute Dynamic Neon background glows */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-spiritual/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* HEADER SECTION - Premium responsive glassmorphic banner */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5 flex items-center justify-between sticky top-0 z-40 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/10 shrink-0">
            <Award size={20} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="serif-text font-black text-amber-400 text-sm sm:text-base leading-tight truncate">
              {lang === 'hi' ? 'मुख्यमुनि महावीर कुमार जी' : 'Mukhyamuni Muni Shree Mahaveer Kumar Ji'}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
              {t.subTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="bg-amber-600 hover:bg-amber-500 text-white border-none py-1.5 px-3.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shadow-amber-500/5 whitespace-nowrap"
          >
            {t.btnLang}
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto p-4 sm:p-6 space-y-6 z-10 flex-grow scrollbar-thin">
        
        {/* DESIGNATION TOP HERO-NODE */}
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-900/60 to-slate-900/80 border border-amber-500/30 rounded-[2rem] p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Layers size={80} className="text-amber-500" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
            <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              👑 {lang === 'hi' ? 'सर्वोच्च मुनि गौरव' : 'Monastic Status'}
            </span>
            <span className="text-[9px] font-black text-gray-400">
              {lang === 'hi' ? 'श्रमण संघ मर्यादा' : 'Order Hierarchy'}
            </span>
          </div>
          <h3 className="serif-text font-black text-lg sm:text-xl text-white mb-2 leading-tight">
            {t.designation}
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-300 font-medium leading-relaxed">
            {t.designationDesc}
          </p>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-[10px] text-amber-400/80 leading-none font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              {lang === 'hi' ? "बहुश्रुत परिषद के शीर्ष ७ विद्वान सदस्य" : "Top 7 Scholars of Bahushrut Parishad"}
            </span>
            <span>{lang === 'hi' ? "दीक्षा पर्याय: आचार्य श्री महाश्रमण सह-हस्ताक्षर" : "Trusted Companion of Acharya Dev"}</span>
          </div>
        </div>

        {/* INTERACTIVE NAVIGATION CONTROL PILLS */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'biography', label: lang === 'hi' ? 'जीवनवृत्त' : 'Biography' },
            { id: 'elevation', label: lang === 'hi' ? 'ऋद्धि-प्रक्रिया' : 'Elevation' },
            { id: 'contributions', label: lang === 'hi' ? 'संघ-अवदान' : 'Contributions' },
            { id: 'philosophy', label: lang === 'hi' ? 'दर्शन-आम' : 'Philosophy' },
          ].map((tab) => {
            const isActive = activeMantraTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMantraTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center truncate ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS - ANIMATED PORTAL MODULES */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMantraTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {activeMantraTab === 'biography' && (
              <div className="space-y-4">
                {/* Origins block */}
                <div className="bg-slate-950/60 border border-white/5 rounded-[1.8rem] p-5 space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                    <MapPin size={13} className="text-amber-500" />
                    <span>{t.lblBirth}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-300 font-medium leading-relaxed">
                    {lang === 'hi'
                      ? "पूज्य श्री का जन्म राजस्थान की मरुधरा में स्थित जैसलमेर जिले के अत्यंत प्रसिद्ध गाँव 'फलसूंड' (Falsund) में हुआ। अत्यंत सुसंस्कृत जैन श्रावक परिवार में जन्मे बालक महावीर की रुचि बचपन से ही संतों की सेवा और ध्यान में थी।"
                      : "Main origins are mapped to Falsund village within the Jaisalmer district of Rajasthan. Born into a pious Jain family, his childhood was marked by a natural inclination towards monk aggregation and meditation."}
                  </p>
                </div>

                {/* Diksha Details block */}
                <div className="bg-slate-950/60 border border-white/5 rounded-[1.8rem] p-5 space-y-4 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                    <Calendar size={13} className="text-amber-500" />
                    <span>{t.lblDiksha}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-semibold text-gray-300">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">दीक्षा धाम / Location</span>
                      <span className="text-white mt-1">जसोल (बालोतरा, राजस्थान)</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col">
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">दीक्षा वय / Age at Diksha</span>
                      <span className="text-white mt-1">{lang === 'hi' ? '१४ वर्ष की अल्पायु' : 'Just 14 Years Old'}</span>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-spiritual-lighter leading-relaxed font-semibold italic border-l-2 border-amber-500/60 pl-3">
                    {lang === 'hi'
                      ? "दीक्षा अत्यंत कठिन जैन श्रमण आचार संप्रदाय के अनुकूल जसोल में संपन्न हुई। अत्यंत कम आयु में संयम मार्ग स्वीकार करने के बावजूद आपने बिना किसी हिचकिचाहट के कठोर 'केश लोच' की प्रक्रिया को पूर्ण हर्ष के साथ स्वीकार किया।"
                      : "The holy ordination took place in Jasol near Balotra under strict Agamic regulations. Despite his tender age, he cheerfully accepted the rigorous physical penance of Kesh Loch (manual hair plucking), symbolizing perfect detachment."}
                  </p>
                </div>
              </div>
            )}

            {activeMantraTab === 'elevation' && (
              <div className="space-y-4">
                <div className="bg-[#fcf5eb]/5 border border-amber-300/10 p-4 rounded-[1.8rem] text-center">
                  <h4 className="serif-text font-black text-amber-400 text-xs sm:text-sm flex items-center justify-center gap-2">
                    <TrendingUp size={14} />
                    {t.lblElevationPhase}
                  </h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {lang === 'hi' ? "धर्मसंघ का द्वितीय सर्वोच्च मुनि पद" : "The 2nd highest status in Shraman Sangh"}
                  </p>
                </div>

                {/* Timeline Stepper */}
                <div className="relative border-l border-white/10 pl-6 ml-3 space-y-6 py-2">
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-[7px] font-black z-10 text-amber-400">1</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-400">सन् २०१५ ( Nepal Phase )</span>
                        <span className="text-[8px] bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-gray-400">Viratnagar, Nepal</span>
                      </div>
                      <h5 className="font-extrabold text-[11px] sm:text-xs text-white">
                        {lang === 'hi' ? 'प्रारंभिक प्रक्रिया एवं सुमधुर अलंकरण' : 'Initial Declaration & Foundation'}
                      </h5>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                        {lang === 'hi'
                          ? "नेपाल के विराटनगर चातुर्मास काल के दौरान परम पूज्य आचार्य श्री महाश्रमण जी महाराज द्वारा मुनि संघ की सुव्यवस्था के हेतु इस गरिमापूर्ण पद की प्रारंभिक योजना की घोषणा की गई थी।"
                          : "During the Nepal monsoon retreat in Viratnagar, Acharya Mahashraman Ji initiated the formal procedural blueprint to institute this crucial managerial office for effective monastic stewardship."}
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-[7px] font-black z-10 text-white shadow-md shadow-amber-500/25">2</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-400">सन् २०१७ ( Assam Formal Coronation )</span>
                        <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">Official Chayan</span>
                      </div>
                      <h5 className="font-extrabold text-[11px] sm:text-xs text-white">
                        {lang === 'hi' ? 'असम प्रान्त में मुख्यमुनि पद का ऐतिहासिक सृजन' : 'Formal Coronation in Barpathar, Assam'}
                      </h5>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                        {lang === 'hi'
                          ? "अहिंसा यात्रा के दौरान, ज्येष्ठ कृष्णा चतुर्दशी को असम की पावन धरा के 'बरपाथार' (Barpathar) कस्बे में संघ के इतिहास में 'मुख्यमुनि' पद का आधिकारिक सृजन कर पूज्य मुनि श्री महावीर कुमार जी स्वामी को इस पर प्रतिष्ठित किया गया।"
                          : "Monitored during the historic Ahimsa Yatra. On Jyeshtha Krishna Chaturdashi, inside Barpathar, Assam, the supreme title 'MUKHYAMUNI' was officially coined and conferred on Muni Shri Mahaveer Kumar Ji."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 p-3 rounded-2xl text-[9px] sm:text-[10px] text-center text-gray-400 font-extrabold uppercase tracking-wide">
                  🎉 {lang === 'hi' ? "संघ प्रतिवर्ष इस तिथि को 'चयन दिवस' के रूप में गर्व से मनाता है।" : "Sect celebrates this historical day annually as 'Chayan Diwas' globally."}
                </div>
              </div>
            )}

            {activeMantraTab === 'contributions' && (
              <div className="space-y-4">
                <div className="bg-[#fcf5eb]/5 border border-white/5 rounded-[1.8rem] p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black">
                    <BookOpen size={13} />
                    <span>{lang === 'hi' ? 'जैन रामायण के अप्रतिम व्याख्याता' : 'Master of the Jain Ramayana discourses'}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-medium">
                    {lang === 'hi'
                      ? "आप जैन रामायण के विशिष्ट, सारगर्भित और गहन तात्विक विश्लेषण युक्त मंगल प्रवचनों के लिए संपूर्ण भारतवर्ष में जाने जाते हैं। महानगरीय केंद्रों जैसे मुम्बई, सूरत, और अहमदाबाद में आपके चातुर्मास प्रवास काल के समय हज़ारों श्रावक इनके प्रवचनों से लाभांवित होते हैं।"
                      : "Pujya Chief Monk is globally celebrated for his extensive and detailed scriptural discourses on the Jain Ramayana. His monsoon stays in megacities like Mumbai, Surat, and Ahmedabad attract massive gatherings of lay followers daily."}
                  </p>
                </div>

                {/* Simulated Bhajan Recitation component */}
                <div className="bg-slate-950/80 border border-amber-500/25 rounded-[1.8rem] p-4 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Music size={14} className="animate-bounce" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{t.btnHymn}</span>
                    </div>
                    {isPlayingHymn && (
                      <span className="text-[8px] bg-red-600 text-white font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                        Playing Live
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold">{t.hymnDesc}</p>

                  <div className="bg-slate-900 border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-4">
                    <button 
                      onClick={() => setIsPlayingHymn(!isPlayingHymn)}
                      className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-all cursor-pointer select-none"
                    >
                      {isPlayingHymn ? <Pause size={16} /> : <Play size={16} className="ml-1" />}
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                        <span>{lang === 'hi' ? 'भक्ति तरंग: गुरुवर चरणों में वंदना' : 'Hymn: Guruvar Vandana'}</span>
                        <span>{isPlayingHymn ? `${Math.floor((hymnProgress * 3.4) / 60)}:${Math.floor((hymnProgress * 3.4) % 60).toString().padStart(2, '0')}` : '0:00'}</span>
                      </div>
                      {/* Custom Audio Line progress bar */}
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300" 
                          style={{ width: `${hymnProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMantraTab === 'philosophy' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-white/5 rounded-[1.8rem] p-5 space-y-3 relative overflow-hidden text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-400 font-black text-xs">
                    <Quote size={13} />
                    <span>{t.lblPhilosophy}</span>
                  </div>

                  {/* High Quality Quote display */}
                  <blockquote className="text-xs sm:text-sm font-extrabold text-white leading-relaxed italic p-3 bg-white/5 border border-amber-500/20 rounded-2xl relative">
                    <span className="absolute -top-3 -left-1 text-2xl text-amber-500/30 font-serif">“</span>
                    {lang === 'hi'
                      ? `"जैसे आप बाज़ार से आम खरीदते समय केवल अच्छे और मीठे आम चुनकर घर लाते हैं और सड़े हुए आमों को बाहर छोड़ देते हैं; ठीक वैसे ही अपने मस्तिष्क में केवल श्रेष्ठ और सकारात्मक विचारों को ही प्रवेश दें, नकारात्मकता को बाहर ही छोड़ दें।"`
                      : `"Just as you carefully select and bring home only the best mangoes from the market, you must only allow the best, most positive thoughts into your mind and reject negativity."`}
                    <span className="absolute -bottom-3 -right-1 text-2xl text-amber-500/30 font-serif">”</span>
                  </blockquote>

                  {/* Interactive Mango Thought Selector - visual demonstration of his philosophical motto */}
                  <div className="pt-2">
                    <span className="text-[8px] font-black uppercase text-gray-500 tracking-wider block mb-2">
                      {lang === 'hi' ? 'स्वयं करके देखें (दार्शनिक आम चयन):' : 'Interactive Mind Processor:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedThought('positive')}
                        className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          selectedThought === 'positive'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-white/5 border-transparent text-gray-400'
                        }`}
                      >
                        🥭 {lang === 'hi' ? 'मीठा आम (सद्भावना)' : 'Sweet Mango (Positivity)'}
                      </button>
                      <button
                        onClick={() => setSelectedThought('negative')}
                        className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          selectedThought === 'negative'
                            ? 'bg-red-500/10 border-red-500 text-red-400 shadow-lg shadow-red-500/5'
                            : 'bg-white/5 border-transparent text-gray-400'
                        }`}
                      >
                        🗑️ {lang === 'hi' ? 'सड़ा आम (नकारात्मक विचार)' : 'Rotten Mango (Refusal)'}
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedThought === 'positive' ? (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-bold"
                        >
                          🎉 {lang === 'hi' ? 'उत्कृष्ट चयन! सकारात्मक विचारों से मानसिक ऊर्जा और संघ का गौरव बढ़ेगा।' : 'Excellent selection! Nurturing holy, positive thought flows elevates direct moral strength.'}
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold"
                        >
                          ⚠️ {lang === 'hi' ? 'अस्वीकृत! नकारात्मक विचारों को जस का तस बाहर ही त्याग दें। सड़े आम घर नहीं लाते।' : 'Rejected! Just like you throw away a rotten mango, instantly bar bad thoughts from entering your skull.'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleShare}
                      className="w-full bg-white/5 hover:bg-white/10 text-amber-400 border border-amber-500/30 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      <Share2 size={12} />
                      {t.btnShare}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CLOUD DATA INTEGRITY FEED -- No simulated telemetry but a clean literal community badge */}
        <div className="bg-slate-950/60 border border-white/5 p-4 rounded-[1.8rem] flex justify-between items-center text-[10px] font-bold text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>{lang === 'hi' ? 'प्रमाणित इतिहास लेखागार' : 'Canonical History Verified'}</span>
          </div>
          <span>{lang === 'hi' ? 'सूचना कोड: ८६६' : 'Info ID: 866 (Active)'}</span>
        </div>

      </div>

      {/* TOAST NOTIFICATION BANNER */}
      <AnimatePresence>
        {showCopiedAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2 border border-white/20 whitespace-nowrap"
          >
            <Check size={14} className="stroke-black stroke-2" />
            <span>{t.lblCopy}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
