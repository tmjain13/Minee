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
  Heart,
  Globe,
  Compass,
  Layers,
  BookMarked,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SadhviPramukhaPortal({ onClose }: { onClose?: () => void }) {
  const { language } = useLanguage();
  const [lang, setLang] = useState<'hi' | 'en'>(language === 'hi' ? 'hi' : 'en');
  const [activeTab, setActiveTab] = useState<'biography' | 'evolution' | 'administration' | 'literature'>('biography');
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [selectedBook, setSelectedBook] = useState<number | null>(0);

  const t = {
    en: {
      title: "Sadhvi Pramukha Monastic Hub",
      subTitle: "Jain Shvetambar Terapanth Dharmasangh",
      lblProfile: "Life Introduction & Origins",
      lblJourney: "Monastic Evolution (Samani to Sadhvi)",
      lblAdmin: "Administrative Legacy (Mukhya Niyojika)",
      lblLiterature: "Literary & Global Impact",
      btnLang: "🇮🇳 हिंदी संस्करण",
      designation: "9th Sadhvi Pramukha (Shri Vishrutvibha Ji)",
      designationDesc: "Appointed on May 16, 2022 by Acharya Mahashraman Ji, following the rich legacy of Sadhvi Pramukha Kanakprabha Ji. She governs over 550+ Sadhvis and Samanis.",
      btnShare: "Share Core Message",
      lblCopy: "Quotes copied successfully!",
      lblTenure: "17-year Mukhya Niyojika Tenure",
      literatureBooks: [
        { title: "Journey into Jain Aagaam", desc: "Instructive moral parables and stories for the young mind." },
        { title: "The Basics Of Jainism", desc: "Comprehensive handbook detailing fundamental spiritual concepts." },
        { title: "Acharya Shree Tulsi: Legend Of Humanity", desc: "An extensive biographical and philosophical study." },
        { title: "Samayik: A Way To Better Life", desc: "A practical guide to equanimity and daily meditation." },
        { title: "An Introduction to Preksha Meditation", desc: "Step-by-step cognitive instructions for self-realization." }
      ]
    },
    hi: {
      title: "पूज्य साध्वी प्रमुखा आध्यात्मिक पोर्टल",
      subTitle: "जैन श्वेतांबर तेरापंथ धर्मसंघ",
      lblProfile: "जीवन परिचय एवं मोदी कुल पृष्ठभूमि",
      lblJourney: "ऐतिहासिक दीक्षा यात्रा (समन से साध्वी)",
      lblAdmin: "प्रशासनिक अनुभव (मुख्य नियोजिका कालक्रम)",
      lblLiterature: "साहित्यिक अवदान एवं वैश्विक प्रचार",
      btnLang: "🔤 English Edition",
      designation: "साध्वी प्रमुखा श्री विश्रुतविभा जी (९वीं प्रमुखा)",
      designationDesc: "पूज्य साध्वी प्रमुखा कनकप्रभा जी के महाप्रयाण के पश्चात, आचार्य श्री महाश्रमण जी ने १६ मई २०२२ को इस सर्वोच्च पद पर प्रतिष्ठित किया।",
      btnShare: "संदेश साझा करें",
      lblCopy: "आध्यात्मिक विचार कॉपी किया गया!",
      lblTenure: "१७ वर्षों का मुख्य नियोजिका दीर्घ अनुभव",
      literatureBooks: [
        { title: "द बेसिक्स ऑफ जैनिज्म (Jainism Cored)", desc: "मूल जैन तत्वज्ञान और आध्यात्मिक धारणाओं की विस्तृत हैंडबुक।" },
        { title: "जर्नी इनटू जैन आगम", desc: "आगम युग की प्रेरक कथाएं और बच्चों के लिए ज्ञानवर्धक कहानियां।" },
        { title: "आचार्य श्री तुलसी: मानवता के मसीहा", desc: "एक महान युगद्रष्टा आचार्य के पावन जीवन का दार्शनिक संकलन।" },
        { title: "सामायिक: सुखद जीवन का मार्ग", desc: "समता की साधना व दैनिक ध्यान विधि पर व्यावहारिक मार्गदर्शन।" },
        { title: "प्रेक्षा ध्यान: एक परिचय", desc: "चित्त शुद्धि और आत्म-साक्षात्कार के लिए वैज्ञानिक ध्यान प्रणालियाँ।" }
      ]
    }
  }[lang];

  const handleShare = () => {
    const motto = lang === 'hi' 
      ? `"परम पूज्य आचार्य श्री महाश्रमण देव के पावन आशीष से साध्वी संघ निरंतर सेवा, संयम और ज्ञान के मार्ग पर गतिशील है।" - साध्वी प्रमुखा श्री विश्रुतविभा जी`
      : `"Under the holy guidance of Acharya Mahashraman Ji, the Sadhvi Order moves relentlessly toward spiritual heights, absolute self-control, and cosmic truth." - Sadhvi Pramukha Vishrutvibha Ji`;
    navigator.clipboard.writeText(motto);
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 2000);
  };

  return (
    <div className="bg-[#060814] text-white rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative flex flex-col w-full max-w-2xl mx-auto h-auto my-auto max-h-[92vh] font-sans">
      {/* Visual background ambient glow spots */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* HEADER BAR */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5 flex items-center justify-between sticky top-0 z-40 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/10 shrink-0">
            <Heart size={20} className="text-white fill-white/20" />
          </div>
          <div className="min-w-0">
            <h2 className="serif-text font-black text-rose-400 text-sm sm:text-base leading-tight truncate">
              {lang === 'hi' ? 'साध्वी प्रमुखा विश्रुतविभा जी' : 'Sadhvi Pramukha Shri Vishrutvibha Ji'}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
              {t.subTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="bg-rose-600 hover:bg-rose-500 text-white border-none py-1.5 px-3.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md shadow-rose-500/5 whitespace-nowrap"
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
        
        {/* LEAD STATUS BLOCK */}
        <div className="bg-gradient-to-r from-rose-500/15 via-slate-900/60 to-slate-900/80 border border-rose-500/30 rounded-[2rem] p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Layers size={85} className="text-rose-500" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              👑 {lang === 'hi' ? '९वीं साध्वी प्रमुखा' : '9th Monastic Leader'}
            </span>
            <span className="text-[9px] font-black text-gray-400">
              {lang === 'hi' ? '१६ मई २०२२' : 'Assumed May 16, 2022'}
            </span>
          </div>
          <h3 className="serif-text font-black text-lg sm:text-xl text-white mb-2 leading-tight">
            {t.designation}
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-300 font-medium leading-relaxed">
            {t.designationDesc}
          </p>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-[10px] text-rose-400/80 leading-none font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              {lang === 'hi' ? "५५०+ साध्वियों और समणियों की निर्देशिका" : "Governs 550+ Sadhvis & Samani Class"}
            </span>
            <span>{lang === 'hi' ? "लाडनूं नगर की तृतीय गरिमा" : "Third Pramukha from Ladnun"}</span>
          </div>
        </div>

        {/* CONTROLS PILLS */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'biography', label: lang === 'hi' ? 'जीवन परिचय' : 'Overview' },
            { id: 'evolution', label: lang === 'hi' ? 'दीक्षा क्रांति' : 'Evolution' },
            { id: 'administration', label: lang === 'hi' ? 'मुख्य नियोजिका' : 'Governance' },
            { id: 'literature', label: lang === 'hi' ? 'साहित्य रचना' : 'Literature' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center truncate ${
                  isActive 
                    ? 'bg-rose-500 text-slate-950 font-black shadow-md shadow-rose-500/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {activeTab === 'biography' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-white/5 rounded-[1.8rem] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-xs">
                    <MapPin size={13} className="text-rose-500" />
                    <span>{t.lblProfile}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] sm:text-[11px] font-semibold text-gray-300">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] text-gray-500 font-bold uppercase">सांसारिक नाम / Pre-Diksha</span>
                      <span className="text-white block mt-1">{lang === 'hi' ? 'सरोज मोदी' : 'Saroj Modi'}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] text-gray-500 font-bold uppercase">जन्म स्थान / Birthplace</span>
                      <span className="text-white block mt-1">लाडनूं (राजस्थान)</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] text-gray-500 font-bold uppercase">गोत्र कुल / Clan Genealogy</span>
                      <span className="text-white block mt-1">{lang === 'hi' ? 'मोदी कुल गोत्र' : 'Modi Family'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-medium">
                    {lang === 'hi'
                      ? "आपका जन्म नागौर जिले के लाडनूं नगर के एक प्रतिष्ठित कुलीन मोदी परिवार में हुआ। माता श्रीमती भंवरी देवी एवं पिता श्री जनवरी मलजी मोदी के धार्मिक संस्कारों ने बचपन से ही आपके मन में गहरे वीतराग भाव संजोए।"
                      : "Born into the renowned, highly traditional Modi lineage in Ladnun, Rajasthan. Her parents Smt. Bhanwari Devi and Shri Janwari Malji Modi instilled spiritual tendencies from her earliest childhood days onwards."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'evolution' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-white/5 rounded-[1.8rem] p-5 space-y-4">
                  <div className="flex items-center gap-2 text-rose-500 font-black text-xs border-b border-white/5 pb-2">
                    <TrendingUp size={13} />
                    <span>{lang === 'hi' ? 'संयम पथ क्रांतियों के दो अविस्मरणीय चरण' : 'The Legendary Two-Stage Monastic Progress'}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border-l-4 border-rose-500 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-black text-rose-400">
                        <span>१. समणी दीक्षा (प्रथम सदस्य)</span>
                        <span>19 दिसम्बर 1980</span>
                      </div>
                      <h5 className="font-extrabold text-xs text-white">समणी स्मितप्रज्ञा</h5>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-semibold mt-1">
                        {lang === 'hi'
                          ? "९वें अनुशास्ता आचार्य श्री तुलसी द्वारा जैन इतिहास की सबसे बड़ी क्रांति 'समन श्रेणी' की प्रथम ६ बहनों के साथ दीक्षा अंगीकार कर धर्मसंघ की प्रथम समणियों में अपना नाम अंकित कराया।"
                          : "Enrolled in the historical first-ever patch of the Saman Order established by Acharya Tulsi. Bestowed with the new title 'Samani Smitpragya'."}
                      </p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border-l-4 border-rose-500 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-black text-rose-400">
                        <span>२. भागवती साध्वी दीक्षा</span>
                        <span>18 अक्टूबर 1992</span>
                      </div>
                      <h5 className="font-extrabold text-xs text-white">साध्वी विश्रुतविभा</h5>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-semibold mt-1">
                        {lang === 'hi'
                          ? "१२ वर्षों की गहन समणी साधना और विदेशों में ज्ञान गंगा प्रवाहित करने के पश्चात लाडनूं की पवित्र भूमि पर आचार्य तुलसी से पूर्ण भागवती साध्वी दीक्षा ग्रहण की।"
                          : "Elevated to full-fledged monastic status under complete Agamic protocols as Sadhvi Vishrutvibha by Acharya Tulsi, after 12 rigorous years of global teachings."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'administration' && (
              <div className="space-y-4">
                <div className="bg-[#fcf5eb]/5 border border-rose-300/10 p-5 rounded-[1.8rem] space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs">
                    <Layers size={14} />
                    <span>{t.lblTenure}</span>
                  </div>
                  <h4 className="serif-text font-black text-white text-sm">
                    {lang === 'hi' ? 'मुख्य नियोजिका (३ नवंबर २००५)' : 'Chief Coordinator Appointee (Nov 3, 2005)'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-medium">
                    {lang === 'hi'
                      ? "१०वें अधिनायक आचार्य श्री महाप्रज्ञ जी द्वारा आपको साध्वी संघ की 'मुख्य नियोजिका' के महत्वपूर्ण पद पर नियुक्त किया गया था। आपने १७ वर्षों तक सैकड़ों साध्वियों के चातुर्मास प्रवास, स्वास्थ्य, शिक्षा और उत्कृष्ट आचार संहिताओं का कुशलता और सूक्ष्मता से प्रबंधन किया।"
                      : "Formally elected as Mukhya Niyojika by Acharya Mahapragya on Nov 3, 2005. For 17 glorious years, she micro-managed the Chaturmas sites, medical logistics, training syllabi, and structural discipline profile of the entire sisterhood network seamlessly."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'literature' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-white/5 rounded-[1.8rem] p-4 space-y-3">
                  <div className="flex items-center justify-between text-rose-400 font-black text-xs border-b border-white/5 pb-2">
                    <span className="flex items-center gap-2">
                      <BookOpen size={13} />
                      {lang === 'hi' ? 'प्रकाशित कृतियाँ एवं ग्रंथ' : 'Masterworks & Bibliography'}
                    </span>
                    <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                      Agama research
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {t.literatureBooks.map((book, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedBook(idx)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedBook === idx 
                            ? 'bg-rose-500/10 border-rose-500 text-rose-300' 
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-extrabold text-[11px] text-white flex items-center justify-between">
                          <span className="truncate pr-2">{book.title}</span>
                          <span className="text-[8px] text-rose-500 font-bold shrink-0">#0{idx+1}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1 leading-tight">{book.desc}</p>
                      </div>
                    ))}
                  </div>

                  {selectedBook !== null && (
                    <div className="mt-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 text-[11px] leading-relaxed text-gray-300 font-medium">
                      <div className="text-[8px] text-rose-400 font-black uppercase tracking-widest block mb-1">
                        Active Book Spec: {t.literatureBooks[selectedBook].title}
                      </div>
                      {t.literatureBooks[selectedBook].desc}
                    </div>
                  )}
                </div>

                {/* Global Travels badge */}
                <div className="bg-slate-950/60 border border-white/5 p-4 rounded-3xl flex items-center gap-3">
                  <Globe size={18} className="text-rose-500 flex-shrink-0" />
                  <div>
                    <h5 className="font-black text-white text-[11px] uppercase tracking-wider leading-none">
                      {lang === 'hi' ? 'वैश्विक पदविहार एवं प्रचार' : 'International Spiritual Travels'}
                    </h5>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">
                      {lang === 'hi' 
                        ? "अमेरिका, जर्मनी, इंग्लैंड, इटली, फ्रांस, थाईलैंड सहित दर्जनों देशों में वीतराग जैन आगम ज्ञान का प्रसार किया।" 
                        : "Directed deep spiritual tours across USA, UK, Germany, Italy, and France to preach non-violence pathways."
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CONTROLS */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest py-3 rounded-2xl text-[10px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-rose-500/10"
          >
            <Share2 size={13} />
            {t.btnShare}
          </button>
        </div>

        {/* VERIFICATION AND ID */}
        <div className="bg-slate-950/60 border border-white/5 p-4 rounded-[1.8rem] flex justify-between items-center text-[10px] font-bold text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>{lang === 'hi' ? 'प्रमाणित इतिहास लेखागार' : 'Canonical History Verified'}</span>
          </div>
          <span>{lang === 'hi' ? 'सूचना कोड: ६२२' : 'Info ID: 622 (Active)'}</span>
        </div>

      </div>

      {/* TOAST PANEL */}
      <AnimatePresence>
        {showCopiedAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-rose-500 text-slate-950 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2 border border-white/20 whitespace-nowrap"
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
