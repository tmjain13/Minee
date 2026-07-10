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
  Heart,
  Hourglass,
  Feather
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SadhviRajimatiPortal({ onClose }: { onClose?: () => void }) {
  const { language } = useLanguage();
  const [lang, setLang] = useState<'hi' | 'en'>(language === 'hi' ? 'hi' : 'en');
  const [activeTab, setActiveTab] = useState<'history' | 'profile' | 'duties' | 'milestones'>('history');
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [activeProcessor, setActiveProcessor] = useState<'beej_mantra' | 'composure' | 'simhavalokan' | 'kashaya'>('beej_mantra');

  const t = {
    en: {
      title: "Sadhvi Rajimati Spiritual Hub",
      subTitle: "Jain Shvetambar Terapanth Dharmasangh",
      lblHistory: "Personal Profile & Family Roots",
      lblProfile: "Spiritual Personality & Traits",
      lblDuties: "Monastic Roles & Responsibilities",
      lblOverview: "Quick Monastic Summary Ledger",
      btnLang: "🇮🇳 हिंदी संस्करण",
      designation: "Shasan Gaurav Sadhvi Shri Rajimati Ji",
      designationDesc: "A respected member of the elite 7-in-1 Bahushrut Parishad. At 93+ years of age, she stands as a radiant pillar of persistent austerity, classical Agamic wisdom, and uninterrupted Beej Mantra recitation.",
      btnShare: "Share Core Message",
      lblCopy: "Quotes copied successfully!",
      attributeProcessors: {
        beej_mantra: "Chants ancient empowering seed syllables (Beej Mantras) in large congregations to purify the inner spiritual consciousness.",
        composure: "A highly serene forehead, composed demeanor, and peaceful expression that instantly uplifts layout visitors.",
        simhavalokan: "Pioneered the 'Simhavalokan' principle: looking back with total honesty to analyze one's own spiritual profit and loss.",
        kashaya: "Emphasizes the absolute reduction of anger, pride, deceit, and greed (Kashayas) for mental and physical well-being."
      }
    },
    hi: {
      title: "शासन गौरव साध्वी राजिमती आध्यात्मिक पोर्टल",
      subTitle: "जैन श्वेतांबर तेरापंथ धर्मसंघ",
      lblHistory: "जीवन परिचय एवं अंचलिया कुल पृष्ठभूमि",
      lblProfile: "आध्यात्मिक व्यक्तित्व एवं विशिष्ट गुण",
      lblDuties: "धर्मसंघ में भूमिका एवं मुख्य उत्तरदायित्व",
      lblOverview: "श्रमण निर्देशिका सार (एक नज़र में)",
      btnLang: "🔤 English Edition",
      designation: "साध्वी श्री राजिमती जी (शासन गौरव)",
      designationDesc: "धर्मसंघ की सर्वोच्च विद्वत 'बहुश्रुत परिषद' की शिर्ष ७ सदस्यों में सुशोभित। ९३+ वर्ष की आयु में भी आपकी कठोर तितिक्षा, आगम ज्ञान, ध्यान और अखंड मंत्र साधना प्रेरणापुंज है।",
      btnShare: "संदेश साझा करें",
      lblCopy: "आध्यात्मिक विचार कॉपी किया गया!",
      attributeProcessors: {
        beej_mantra: "प्राचीन बीज मंत्रों का अखंड जाप कर श्रावकों और श्रद्धालुओं की अंतःचेतना का शोधन व कल्याण प्रशस्त करना।",
        composure: "अत्यंत सौम्य मुखमंडल, शांत और गंभीर आचरण जो श्रद्धालुओं को सादगी और आत्मदर्शन का बोध करवाता है।",
        simhavalokan: "सिंहवालोकन दर्शन—आध्यात्मिक लाभ-हानि का निष्पक्ष स्व-मूल्यांकन कर निरंतर आत्म-निरीक्षण करना।",
        kashaya: "क्रोध, मान, माया, लोभ रूपी कषायों की मंदता और परिवारों में अखंड आपसी स्नेह संचरण पर विशेष बल।"
      }
    }
  }[lang];

  const handleShare = () => {
    const motto = lang === 'hi' 
      ? `"स्वयं का सिंहवालोकन करें, कषाय मंद करें और अंतःकरण की शुद्धि के लिए निरंतर कल्याणकारी जप में लीन रहें।" - शासन गौरव साध्वी श्री राजिमती जी`
      : `"Analyze your own soul via Simhavalokan, calm down the inner passions (Kashayas), and pursue holy chanting daily." - Shasan Gaurav Sadhvi Shri Rajimati Ji`;
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
            <Award size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="serif-text font-black text-amber-400 text-sm sm:text-base leading-tight truncate">
              {lang === 'hi' ? 'साध्वी श्री राजिमती जी' : 'Sadhvi Shri Rajimati Ji'}
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
              👑 {lang === 'hi' ? 'शासन गौरव अलंकरण' : 'Shasan Gaurav Honor'}
            </span>
            <span className="text-[9px] font-black text-gray-400">
              {lang === 'hi' ? '७५+ वर्ष संयम पर्याय' : '75+ Years Asceticism'}
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
              {lang === 'hi' ? "बहुश्रुत परिषद शीर्ष ७ सदस्या" : "Member of Elite Bahushrut Parishad"}
            </span>
            <span>{lang === 'hi' ? "९३+ वय में भी अखंड तपस्या" : "Intense Penance at 93+ Age"}</span>
          </div>
        </div>

        {/* CONTROLS PILLS */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'history', label: lang === 'hi' ? 'कुल पृष्ठभूमि' : 'Origins' },
            { id: 'profile', label: lang === 'hi' ? 'साधना सूत्र' : 'Sadhana' },
            { id: 'duties', label: lang === 'hi' ? 'साहित्य रचना' : 'Literature' },
            { id: 'milestones', label: lang === 'hi' ? 'ऐतिहासिक ७५ वर्ष' : 'Ascetic 75 Yrs' },
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] sm:text-[11px] font-semibold text-gray-300">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] text-gray-500 font-bold uppercase">जन्म स्थान / Origin Site</span>
                      <span className="text-white block mt-1">{lang === 'hi' ? 'चंगरबंधा (W.B.)' : 'Changrabandha'}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] text-gray-500 font-bold uppercase">जन्म तिथि / birth date</span>
                      <span className="text-white block mt-1">14 जुलाई 1933</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] text-gray-500 font-bold uppercase">कुल गोत्र / Clan</span>
                      <span className="text-white block mt-1">{lang === 'hi' ? 'अंचलिया कुल' : 'Anchalia family'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-medium">
                    {lang === 'hi'
                      ? "साध्वी जी का सांसारिक मूल राजस्थान के रतनगढ़ के सुप्रसिद्ध धर्मपरायण अंचलिया परिवार से है। पश्चिम बंगाल के चंगरबंधा में आपका जन्म हुआ। माता श्रीमती धापू देवी व पिता श्री हुलासमल जी अंचलिया के यहाँ आपने जन्म लिया। सन् १९५० में छोटी आयु में हरियाणा के हाँसी में ९वें आचार्य श्री तुलसी के पावन सानिध्य में अखंड संयम दीक्षा अंगीकार की।"
                      : "Her ancestral roots lie with the devout, highly respected Anchalia lineage of Ratangarh, Rajasthan, while she was born in Changrabandha, West Bengal. Born to Smt. Dhapu Devi and Shri Hulasmalji Anchalia, she accepted lifelong ascetic vows in 1950 at Hansi, Haryana under the holy patronage of the 9th Acharya Sri Tulsi."}
                  </p>
                </div>

                {/* Ledger matrix */}
                <div className="bg-[#11152b] border border-amber-500/20 rounded-[1.8rem] p-5 space-y-3">
                  <h4 className="text-xs uppercase font-black text-amber-400 tracking-wider">📊 {t.lblOverview}</h4>
                  <div className="space-y-2 text-[11px] sm:text-xs font-semibold text-gray-300">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">{lang === 'hi' ? 'धर्मसंघीय अलंकरण:' : 'Monastic Citation:'}</span>
                      <span className="text-white">{lang === 'hi' ? 'शासन गौरव साध्वी' : 'Shasan Gaurav'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">{lang === 'hi' ? 'परिषद भूमिका:' : 'Committee Position:'}</span>
                      <span className="text-white">{lang === 'hi' ? 'बहुश्रुत परिषद सदस्य (शीर्ष ७)' : 'Bahushrut Parishad (Elite 7)'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">{lang === 'hi' ? 'मंत्र साधना केन्द्र:' : 'Core Spiritual Practice:'}</span>
                      <span className="text-white">{lang === 'hi' ? 'प्राचीन बीज मंत्र साधना' : 'Ancient Syllable Beej Mantras'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{lang === 'hi' ? 'मूल कृति / Book:' : 'Key Masterwork:'}</span>
                      <span className="text-amber-400 font-bold">{lang === 'hi' ? '"अनुभव पथ"' : '"Anubhav Path"'}</span>
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
                      { id: 'beej_mantra', label: lang === 'hi' ? 'बीज मंत्र जाप' : 'Beej Mantra' },
                      { id: 'composure', label: lang === 'hi' ? 'सौम्य मुख' : 'Composure' },
                      { id: 'simhavalokan', label: lang === 'hi' ? 'सिंहवालोकन' : 'Simhavalokan' },
                      { id: 'kashaya', label: lang === 'hi' ? 'कषाय मंदता' : 'No Passions' }
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
                        {attr.id === 'beej_mantra' ? '☸️' : attr.id === 'composure' ? '🌸' : attr.id === 'simhavalokan' ? '👣' : '🥣'} {attr.label}
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
                    <span>{lang === 'hi' ? "साहित्यिक अवदान एवं अनुभव संदेश" : "Literary Contributions"}</span>
                  </div>

                  <div className="space-y-3 font-semibold text-[11px] sm:text-xs text-gray-300 leading-relaxed">
                    <div className="bg-[#11152b] border border-amber-500/20 p-4 rounded-2xl">
                      <h5 className="font-extrabold text-xs text-white mb-1.5 flex items-center gap-1.5">
                        <Feather size={14} className="text-amber-500" />
                        <span>{lang === 'hi' ? '"अनुभव पथ" (Anubhav Path)' : '"Anubhav Path" (Path of Experience)'}</span>
                      </h5>
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                        {lang === 'hi'
                          ? "यह ग्रंथ साध्वी जी के दशकों की मौन तपस्या और गहरे आत्म-मंथन से उपजा एक अप्रतिम संकलन है। इसमें श्रावक समाज को सांसारिक जिम्मेदारियों से सम्मुख रहते हुए अंतरंग चेतना को जागृत करने, कषायों को मंद करने और आध्यात्मिक उन्नति का संतुलित मार्ग प्राप्त करने के लिए व्यावहारिक नियम प्रदान किए गए हैं।"
                          : "This publication features her deep introspections from decades of soundless penance. It serves as a structural blueprint guiding lay followers to balance worldly households with precise spiritual enhancements and Kashaya mastery."}
                      </p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl text-[10px] sm:text-[11px] text-gray-300 leading-normal flex items-start gap-2">
                      <span className="text-amber-500 font-black">•</span>
                      <p>
                        <strong>{lang === 'hi' ? 'बहुश्रुत परिषद योगदान' : 'Bahushrut Parishad Guidance'}:</strong> {lang === 'hi' ? 'संघ की नीतियों, शिक्षण संरचना प्रणालियों और गंभीर विमर्षों में शीर्ष परिषद सलाहकार के रूप में सतत मार्ग निर्देशन।' : 'Gives consistent advisory parameters on central education boards, monk/nun evaluation codes, and complex philosophical validations.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <div className="bg-[#fcf5eb]/5 border border-amber-300/10 p-5 rounded-[1.8rem] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-1">
                    <Hourglass size={20} className="text-amber-500" />
                  </div>
                  <h4 className="serif-text font-black text-amber-400 text-xs sm:text-sm">
                    {lang === 'hi' ? '७५ वर्ष का ऐतिहासिक संयम पर्याय (अभ्यर्थनाोत्सव)' : '75 Years of Monastic Auspicious Era'}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                    12 October 2025 • Nokha (Bikaner)
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-semibold">
                    {lang === 'hi'
                      ? "१२ अक्टूबर २०२५ को शासन गौरव साध्वी श्री राजिमती जी ने अपने संयम जीवन के ७५ वर्ष (दीक्षा पर्याय) पूर्ण कर लिए। इस ऐतिहासिक बेला पर बीकानेर प्रान्त के नोखा में एक भव्य विशेष 'अभ्यर्थना समारोह' का आयोजन किया गया जहाँ परम पूज्य युगप्रधान आचार्य श्री महाश्रमण जी महाराज का विशेष मंगल संदेश महासभा तथा विशाल श्रावक मेदिनी के समक्ष वाचन किया गया।"
                      : "On October 12, 2025, she achieved a legendary milestone of completing 75 years of pure ascetic lineage. A dedicated congratulatory assembly (Vishesh Abhyarthana Samaroh) was organized in Nokha, Bikaner, highlighted by the public reading of an exclusive blessing message from Acharya Mahashraman Ji."}
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
          <span>{lang === 'hi' ? 'सूचना कोड: ५३८' : 'Info ID: 538 (Active)'}</span>
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
