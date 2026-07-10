import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  MapPin, 
  Calendar, 
  BookOpen, 
  X, 
  TrendingUp, 
  Quote, 
  Share2, 
  CheckCircle2, 
  Info,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Check,
  Heart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SadhviVaryaPortal({ onClose }: { onClose?: () => void }) {
  const { language } = useLanguage();
  const [lang, setLang] = useState<'hi' | 'en'>(language === 'hi' ? 'hi' : 'en');
  const [activeTab, setActiveTab] = useState<'history' | 'profile' | 'duties' | 'milestones'>('history');
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [activeProcessor, setActiveProcessor] = useState<'barefoot' | 'composure' | 'no_tech' | 'gochari'>('composure');

  const t = {
    en: {
      title: "Sadhvi Varya Monastic Hub",
      subTitle: "Jain Shvetambar Terapanth Dharmasangh",
      lblHistory: "Historical Background & Post Origin",
      lblProfile: "Spiritual Personality & Traits",
      lblDuties: "Monastic Roles & Responsibilities",
      lblOverview: "Quick Monastic Summary Ledger",
      btnLang: "🇮🇳 हिंदी संस्करण",
      designation: "First Sadhvi Varya (Sambudhyasha Ji)",
      designationDesc: "Announced on June 2, 2016 in Barpathar, Assam by Acharya Mahashraman Ji. She is the first-ever holder of this administrative rank in 250+ years of Terapanth history.",
      btnShare: "Share Core Message",
      lblCopy: "Quotes copied successfully!",
      attributeProcessors: {
        composure: "A deeply calm countenance, coupled with serene composure and highly dignified spiritual poise.",
        barefoot: "Strictly barefoot travels (Vihar) over thousands of kilometers, embodying extreme physical detachment.",
        no_tech: "Complete avoidance of electrical devices and transport systems, honoring pristine monastic laws.",
        gochari: "Pristine alms-seeking (Gochari/Bhiksha) with supreme alertness, entirely relying on dry food offerings."
      }
    },
    hi: {
      title: "पूज्य साध्वी वर्या आध्यात्मिक पोर्टल",
      subTitle: "जैन श्वेतांबर तेरापंथ धर्मसंघ",
      lblHistory: "पदवी का इतिहास एवं गौरवशाली पृष्ठभूमि",
      lblProfile: "आध्यात्मिक व्यक्तित्व एवं विशिष्ट गुण",
      lblDuties: "धर्मसंघ में भूमिका एवं मुख्य उत्तरदायित्व",
      lblOverview: "श्रमण निर्देशिका सार (एक नज़र में)",
      btnLang: "🔤 English Edition",
      designation: "साध्वी वर्या संबुद्धयशा जी (प्रथम साध्वी वर्या)",
      designationDesc: "२ जून २०१६ को असम प्रान्त के 'बारपाथर' में अहिंसा यात्रा के दौरान, ११वें अधिनायक आचार्य श्री महाश्रमण जी ने तेरापंथ इतिहास में प्रथम बार इस नए पद का आधिकारिक सृजन कर आपको सुभूषित किया।",
      btnShare: "संदेश साझा करें",
      lblCopy: "आध्यात्मिक विचार कॉपी किया गया!",
      attributeProcessors: {
        composure: "सौम्य मुखमंडल, गंभीर आचरण और परम शांत भाव जो श्रद्धालुओं को सहज ही आकर्षित करते हैं।",
        barefoot: "प्रतिवर्ष हजारों किलोमीटर का दुर्गम पदविहार (विहार) बिना किसी वाहन अथवा बिजली उपकरणों के प्रयोग के।",
        no_tech: "साधु मर्यादा के अनुरूप किसी भी बिजली उपकरण या वाहन का सर्वथा निषेध व पूर्ण आत्म शुद्धि साधना।",
        gochari: "अनासक्त भाव से भिक्षावृत्ति (गोचरी) की मर्यादा का निष्ठापूर्वक पालन कर तन को संयम की भट्टी में तपना।"
      }
    }
  }[lang];

  const handleShare = () => {
    const motto = lang === 'hi' 
      ? `"साध्वी वर्या संबुद्धयशा जी संघ की मर्यादा, आचार संहिताओं और साध्वी प्रमुखा जी के साथ समन्वय की अनमोल प्रहरी हैं।" - पूज्य साध्वी वर्या संबुद्धयशा जी`
      : `"Sadhvi Varya Sambudhyasha Ji serves as an ultimate guardian of spiritual discipline, working in perfect sync with Sadhvi Pramukha Ji." - Pujya Sadhvi Varya Sambudhyasha Ji`;
    navigator.clipboard.writeText(motto);
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 2000);
  };

  return (
    <div className="bg-[#060814] text-white rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative flex flex-col w-full max-w-2xl mx-auto h-auto my-auto max-h-[92vh] font-sans">
      {/* Background radial neon glows */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* HEADER BAR */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5 flex items-center justify-between sticky top-0 z-40 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/10 shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="serif-text font-black text-amber-400 text-sm sm:text-base leading-tight truncate">
              {lang === 'hi' ? 'साध्वी वर्या संबुद्धयशा जी' : 'Sadhvi Varya Shri Sambudhyasha Ji'}
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
        
        {/* LEAD HIGHLIGHT BAR */}
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-900/60 to-slate-900/80 border border-amber-500/30 rounded-[2rem] p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Layers size={85} className="text-amber-500" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              👑 {lang === 'hi' ? 'इतिहास में प्रथम धारक' : 'First Post Holder'}
            </span>
            <span className="text-[9px] font-black text-gray-400">
              {lang === 'hi' ? '२ जून २०१६' : 'Announced June 2, 2016'}
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
              {lang === 'hi' ? "२५० वर्षों के इतिहास में नवीन पद" : "Unique Administrative Title"}
            </span>
            <span>{lang === 'hi' ? "चातुर्मास प्रबंधन व आगम मनीषी" : "Monastic Discipline Specialist"}</span>
          </div>
        </div>

        {/* CONTROLS PILLS */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'history', label: lang === 'hi' ? 'पद का इतिहास' : 'History' },
            { id: 'profile', label: lang === 'hi' ? 'साधना गुण' : 'Sadhana' },
            { id: 'duties', label: lang === 'hi' ? 'मुख्य दायित्व' : 'Duties' },
            { id: 'milestones', label: lang === 'hi' ? 'चयन दिवस' : 'Anniversary' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

        {/* TAB CORNER BLOCK */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-white/5 rounded-[1.8rem] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                    <Info size={13} className="text-amber-500" />
                    <span>{t.lblHistory}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-semibold italic border-l-2 border-amber-500/60 pl-3">
                    {lang === 'hi'
                      ? "तेरापंथ धर्मसंघ के २५० से अधिक वर्षों के पावन इतिहास में, साध्वी संघ के सूक्ष्म प्रबंधन को सुदृढ़ बनाने के लिए आचार्य श्री महाश्रमण जी महाराज द्वारा इस गौरवशाली पद की घोषणा असम के 'बारपाथर' प्रवास काल में की गई। साध्वी संबुद्धयशा जी को प्रथम 'साध्वी वर्या' के रूप में नियुक्त किया गया।"
                      : "To optimize structural discipline, higher education tiers, and smooth communication channels among the extensive nunhood wings, Acharya Mahashraman Ji coined this brand-new title on June 2, 2016. She historically is the premiere recipient of this high status."}
                  </p>
                </div>

                {/* Ledger matrix */}
                <div className="bg-[#11152b] border border-amber-500/20 rounded-[1.8rem] p-5 space-y-3">
                  <h4 className="text-xs uppercase font-black text-amber-400 tracking-wider">📊 {t.lblOverview}</h4>
                  <div className="space-y-2 text-[11px] sm:text-xs font-semibold text-gray-300">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">{lang === 'hi' ? 'नियुक्त पदवी:' : 'Allocated Rank:'}</span>
                      <span className="text-white">{lang === 'hi' ? 'साध्वी वर्या (प्रथम धारक)' : 'Sadhvi Varya (First Holder)'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">{lang === 'hi' ? 'सृजन स्थल:' : 'Coined Location:'}</span>
                      <span className="text-white">बारपाथर, असम (अहिंसा यात्रा)</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">{lang === 'hi' ? 'पद प्रदाता अधिनायक:' : 'Bestowing Acharya:'}</span>
                      <span className="text-white">{lang === 'hi' ? '११वें आचार्य श्री महाश्रमण जी' : '11th Acharya Sri Mahashraman Ji'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === 'hi' ? 'प्रमुख सहयोगी:' : 'Co-Associate Leader:'}</span>
                      <span className="text-pink-400">{lang === 'hi' ? 'साध्वी प्रमुखा श्री विश्रुतविभा जी' : 'Sadhvi Pramukha Vishrutvibha Ji'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-white/5 rounded-[1.8rem] p-5 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                    <Zap size={13} />
                    <span>{t.lblProfile}</span>
                  </div>

                  {/* Attribute Selector Panel */}
                  <div className="grid grid-cols-2 gap-2 pb-2">
                    {[
                      { id: 'composure', label: lang === 'hi' ? 'सौम्य मुखमंडल' : 'Composure' },
                      { id: 'barefoot', label: lang === 'hi' ? 'दुर्गम पदविहार' : 'Barefoot travels' },
                      { id: 'no_tech', label: lang === 'hi' ? 'उपकरण त्याग' : 'No Technology' },
                      { id: 'gochari', label: lang === 'hi' ? 'गोचरी मर्यादा' : 'Alms Seeking' }
                    ].map((attr) => (
                      <button
                        key={attr.id}
                        onClick={() => setActiveProcessor(attr.id as any)}
                        className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-wider text-center cursor-pointer transition-all ${
                          activeProcessor === attr.id 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {attr.id === 'composure' ? '🌸' : attr.id === 'barefoot' ? '👣' : attr.id === 'no_tech' ? '🔌' : '🥣'} {attr.label}
                      </button>
                    ))}
                  </div>

                  {/* Attribute display content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeProcessor}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="bg-white/5 p-4 rounded-2xl border border-white/5 text-[11px] sm:text-xs leading-relaxed font-semibold text-gray-300"
                    >
                      <span className="text-[8px] bg-amber-500/10 text-amber-400 font-black px-2.5 py-0.5 rounded uppercase tracking-widest block mb-2 w-max">
                        Active spiritual attribute
                      </span>
                      {t.attributeProcessors[activeProcessor]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === 'duties' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-white/5 rounded-[1.8rem] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs pb-2 border-b border-white/5">
                    <BookOpen size={13} />
                    <span>{t.lblDuties}</span>
                  </div>

                  <div className="space-y-3 font-semibold text-[11px] sm:text-xs text-gray-300 leading-relaxed">
                    <div className="flex gap-2.5 items-start">
                      <span className="text-amber-500 font-extrabold pb-1">•</span>
                      <p>
                        <strong>{lang === 'hi' ? 'साध्वी संघ का कुशल आचार' : 'Coordinating Nunhood Activities'}:</strong> {lang === 'hi' ? 'पूज्य साध्वी प्रमुखा विश्रुतविभा जी के साथ पूर्ण तालमेल स्थापित कर साध्वी संघ और समणी श्रेणी के प्रवासों, चातुर्मास आवंटनों और अनुशासन व्यवस्थाओं का संचालन।' : 'Collaborates with Sadhvi Pramukha Vishrutvibha Ji for managing Chaturmas sites, medical issues, and daily codes of hundreds of nuns.'}
                      </p>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <span className="text-amber-500 font-extrabold pb-1">•</span>
                      <p>
                        <strong>{lang === 'hi' ? 'ग्रंथ संपादन व आगम अनुसंधान' : 'Scriptural Legacy Projects'}:</strong> {lang === 'hi' ? 'जैन विश्व भारती (JVB) विश्वविद्यालय और अन्य शोध केंद्रों के माध्यम से दुर्लभ आगम ग्रंथों के संपादन और गंभीर अकादमिक साहित्य कार्यों में आध्यात्मिक मार्गदर्शन।' : 'Steers intellectual projects, Agama editing parameters, and university collaborations under Jain Vishva Bharati.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <div className="bg-[#fcf5eb]/5 border border-amber-300/10 p-5 rounded-[1.8rem] text-center space-y-2">
                  <h4 className="serif-text font-black text-amber-400 text-xs sm:text-sm">
                    {lang === 'hi' ? '११वां पावन चयन दिवस (संस्मरणोत्सव २०२६)' : '11th Chayan Diwas (Anniversary 2026)'}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Celebrated Globally
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-semibold italic">
                    {lang === 'hi'
                      ? "तेरापंथ धर्मसंघ में मई-जून का समय इस ऐतिहासिक घटना की पावन स्मृति का मुख्य केंद्र होता है। वर्तमान वर्ष २०२६ में पूज्य साध्वी वर्या जी का ११वां चयन दिवस विभिन्न समाज केंद्रों द्वारा पूर्ण आध्यात्मिक गरिमा, अनुष्ठानों और कृतज्ञता के साथ मनाया गया।"
                      : "In this current year 2026, her 11th Selection Anniversary (Chayan Diwas) was honored with unique spiritually aligned activities and deep congratulations from lay families worldwide."}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

          {/* SHARED MESSAGING CONTROL */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black uppercase tracking-widest py-3 rounded-2xl text-[10px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-amber-500/10"
            >
              <Share2 size={13} className="text-slate-950" />
              {t.btnShare}
            </button>
          </div>

          {/* CLOUD ID Badging */}
          <div className="bg-slate-950/60 border border-white/5 p-4 rounded-[1.8rem] flex justify-between items-center text-[10px] font-bold text-gray-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>{lang === 'hi' ? 'प्रमाणित इतिहास लेखागार' : 'Canonical History Verified'}</span>
            </div>
            <span>{lang === 'hi' ? 'सूचना कोड: १५४' : 'Info ID: 154 (Active)'}</span>
          </div>

      </div>

      {/* TOAST PANEL */}
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
