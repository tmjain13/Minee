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
  Shield,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MuniDineshComparativePortal({ onClose }: { onClose?: () => void }) {
  const { language } = useLanguage();
  const [lang, setLang] = useState<'hi' | 'en'>(language === 'hi' ? 'hi' : 'en');
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const text = {
    en: {
      title: "Muni Dr. Dinesh Kumar Ji Profile",
      subTitle: "Member of Elite Bahushrut Parishad • Terapanth AI",
      searchLabel: "Svetambara Monastic Identity Matrix",
      lblCommon: "Core Ascetic Vows (Common to Swetambar Terapanth)",
      btnLang: "🇮🇳 हिंदी संस्करण",
      btnShare: "Share Master Profile",
      lblCopy: "Profile info copied successfully!",
      tag1: "Swetambar Terapanth Order"
    },
    hi: {
      title: "मुनि डॉ. दिनेश कुमार जी जीवनवृत",
      subTitle: "तेरापंथ बहुश्रुत परिषद शीर्ष सदस्य • तेरापंथ एआई",
      searchLabel: "प्रामाणिक संयम एवं इतिहास निरूपण",
      lblCommon: "मूल जैन श्वेतांबर तेरापंथ श्रमण मर्यादाएं",
      btnLang: "🔤 English UI",
      btnShare: "जीवनवृत साझा करें",
      lblCopy: "मुनि श्री का इतिहास वृत्त कॉपी किया गया!",
      tag1: "श्वेतांबर तेरापंथ संप्रदाय"
    }
  }[lang];

  const handleShare = () => {
    const info = lang === 'hi'
      ? `[मुनि डॉ. दिनेश कुमार जी - तेरापंथ]: 
- शासन स्थिति: तेरापंथ धर्मसंघ की सर्वोच्च विद्वत 'बहुश्रुत परिषद' के शीर्ष सदस्य।
- दीक्षा व आयु: २२ सितंबर १९८० (लाडनूं), वर्तमान वर्ष २०२६ तक लगभग ४५ वर्ष पूर्ण कर ४६वें संयम पर्याय में गतिमान।
- साहित्य: साहित्य और दर्शन में पीएचडी (Ph.D.) की उत्कृष्ट अकादमिक उपाधि प्राप्त।`
      : `[Muni Dr. Dinesh Kumar Ji - Terapanth]: 
- Council Position: Active Prominent Member of the elite 7-member Bahushrut Parishad advisory body.
- Diksha & Longevity: Initiated on September 22, 1980 in Ladnun. In 2026, he is spending his 46th Year of pure asceticism.
- Academics: Holds a Ph.D. in Jain Literature and Metaphysics.`;
    navigator.clipboard.writeText(info);
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 2000);
  };

  return (
    <div className="bg-[var(--card-bg)] text-[var(--text-spiritual)] rounded-[2.5rem] overflow-hidden border border-[var(--border-color)] shadow-2xl relative flex flex-col w-full max-w-2xl mx-auto h-auto my-auto max-h-[92vh] font-sans">
      {/* Background radial neon glows */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* HEADER BAR */}
      <div className="bg-[var(--card-bg)]/85 backdrop-blur-xl border-b border-[var(--border-color)] p-5 flex items-center justify-between sticky top-0 z-40 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 dark:from-emerald-500 dark:to-cyan-500 flex items-center justify-center text-white shrink-0">
            <Award size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="serif-text font-black text-[var(--text-spiritual)] text-sm sm:text-base leading-tight truncate">
              {lang === 'hi' ? 'मुनि डॉ. दिनेश कुमार जी' : 'Muni Dr. Dinesh Kumar Ji'}
            </h2>
            <p className="text-[10px] text-orange-600 dark:text-cyan-400 font-bold uppercase tracking-widest leading-none mt-1">
              {text.subTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="bg-orange-600 hover:bg-orange-750 dark:bg-cyan-600 dark:hover:bg-cyan-550 text-white border-none py-1.5 px-3.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-md whitespace-nowrap"
          >
            {text.btnLang}
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

      <div className="overflow-y-auto p-4 sm:p-6 space-y-5 z-10 flex-grow scrollbar-thin">
        
        {/* SAINT DISAMBIGUATION CLARITY BANNER */}
        <div className="bg-orange-500/5 dark:bg-amber-500/5 border border-orange-500/20 dark:border-amber-500/25 rounded-[2rem] p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Shield size={85} className="text-cyan-500" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
            <span className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              🛡️ {lang === 'hi' ? 'जैन श्वेतांबर तेरापंथ इतिहास' : 'Jain Swetambar Terapanth History'}
            </span>
            <span className="text-[9px] font-black text-gray-400">
              {lang === 'hi' ? '४६वां संयम पर्याय' : '46th Year of Asceticism'}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-300 font-medium leading-relaxed">
            {lang === 'hi'
              ? "डॉ. मुनि श्री दिनेश कुमार जी तेरापंथ धर्मसंघ के प्रखर विद्वान संत हैं। वे महातपस्वी आचार्य श्री तुलसी, गणाधिपति आचार्य श्री महाप्रज्ञ जी एवं वर्तमान युगप्रधान आचार्य श्री महाश्रमण जी के अत्यंत विश्वस्त शिष्य हैं।"
              : "Dr. Muni Shri Dinesh Kumar Ji is a highly distinguished and erudite ascetic member of the Swetambar Terapanth Order. He served with absolute devotion under Acharya Tulsi, Acharya Mahapragya, and currently continues his ascetic journey under Acharya Mahashraman."}
          </p>
        </div>

        {/* PROFILE CARD: DR. MUNI DINESH KUMAR JI (TERAPANTH EXCLUSIVE) */}
        <div className="space-y-4">
          <motion.div 
            layout
            className="bg-black/5 dark:bg-white/[0.012] border border-[var(--border-color)] rounded-[1.8rem] p-5 space-y-3 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Layers size={60} className="text-cyan-400" />
            </div>
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
              <h3 className="serif-text font-black text-sm sm:text-base text-[var(--text-spiritual)]">
                {lang === 'hi' ? 'मुनि डॉ. दिनेश कुमार जी' : 'Dr. Muni Dinesh Kumar Ji'}
              </h3>
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                {text.tag1}
              </span>
            </div>

            <div className="space-y-2.5 text-[11px] sm:text-xs font-semibold text-gray-300 leading-relaxed">
              <div className="flex gap-2 items-start">
                <span className="text-cyan-500 font-extrabold select-none">•</span>
                <p>
                  <strong>{lang === 'hi' ? ' शासन स्थिति:' : 'Council Position:'}</strong>{' '}
                  {lang === 'hi' 
                    ? 'श्वेतांबर तेरापंथ धर्मसंघ की सर्वोच्च विद्वत "बहुश्रुत परिषद" के शीर्ष ७ गौरवशाली सदस्यों में शामिल।' 
                    : 'An active prominent member of the elite 7-in-1 Bahushrut Parishad advisory body.'
                  }
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-cyan-500 font-extrabold select-none">•</span>
                <p>
                  <strong>{lang === 'hi' ? 'परंपरा गुरु:' : 'Spiritual Masters:'}</strong>{' '}
                  {lang === 'hi' 
                    ? '९वें अनुशास्ता आचार्य श्री तुलसी, १०वें आचार्य श्री महाप्रज्ञ जी एवं वर्तमान में ११वें आचार्य श्री महाश्रमण जी के अत्यंत विश्वस्त शिष्य।' 
                    : 'Served faithfully under Acharya Tulsi, Acharya Mahapragya, and currently is a trusted scholar of Acharya Mahashraman.'
                  }
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-cyan-500 font-extrabold select-none">•</span>
                <p>
                  <strong>{lang === 'hi' ? 'दीक्षा व आयु:' : 'Diksha & Longevity:'}</strong>{' '}
                  {lang === 'hi' 
                    ? '२२ सितंबर १९८० को लाडनूं में दीक्षा अंगीकार की। वर्तमान वर्ष २०२६ तक लगभग ४५ वर्ष पूर्ण कर ४६वें दीक्षा वर्ष (संयम पर्याय) में गतिमान। सितंबर २०२६ में पावन ४६ वर्ष पूर्ण होंगे।' 
                    : 'Initiated into monkhood on September 22, 1980 in Ladnun. As of 2026, has completed 45 years and is entering his 46th year of pure, unbroken ascetic penance.'
                  }
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-cyan-500 font-extrabold select-none">•</span>
                <p>
                  <strong>{lang === 'hi' ? 'मूल परिचय व जन्म स्थान:' : 'Native Origin & Birthplace:'}</strong>{' '}
                  {lang === 'hi' 
                    ? 'संसार पक्ष का नाम "दिनेश बैद"। टपरा (सरदारशहर के निकट), राजस्थान ग्राम में जनम पाकर जैन संयम पथ अपनाया। साहित्य और दर्शन में पीएचडी (Ph.D.) की उत्कृष्ट शैक्षणिक उपाधि प्राप्त की।' 
                    : 'Born as "Dinesh Baid" in Tapara village (near Sardarsahar), Rajasthan. Holds a Doctor of Philosophy (Ph.D.) degree in Jain literature and spiritual metaphysics.'}
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-cyan-500 font-extrabold select-none">•</span>
                <p>
                  <strong>{lang === 'hi' ? 'प्रवचन शैली व व्याख्या:' : 'Preaching Philosophy:'}</strong>{' '}
                  {lang === 'hi' 
                    ? 'अणुव्रत आंदोलन, ध्यान साधना और समता भाव पर विशेष बल। प्राचीन ऐतिहासिक राजाओं और व्यापारियों के मर्मस्पर्शी दृष्टांतों से कर्म सिद्धांत का निरूपण।' 
                    : 'Emphasizes Anuvrat tenets, meditation, and equanimity, using ancient stories of righteous kings to clarify Karma laws.'
                  }
                </p>
              </div>
            </div>
          </motion.div>

          {/* MONASTIC MAHAVRATAS SECTION */}
          <div className="bg-black/5 dark:bg-white/[0.012] border border-[var(--border-color)] p-4 rounded-3xl space-y-3 z-10 relative">
            <h4 className="text-xs font-black text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
              🛡️ {text.lblCommon}
            </h4>
            <div className="space-y-2 text-[10px] sm:text-[11px] leading-relaxed font-semibold text-gray-400">
              <div className="flex gap-2 items-start">
                <span className="text-cyan-500 font-extrabold">•</span>
                <p><strong>अहिंसा महाव्रत (Ahimsavrata):</strong> {lang === 'hi' ? 'बिजली उपकरण, आधुनिक वाहन, टेलीफोन, मोबाइल या किसी भी प्रकार के इलेक्ट्रॉनिक संसाधनों का सर्वथा त्याग।' : 'Absolute restriction on electricity, mobile phones, transport, or technological infrastructure.'}</p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-rose-500 font-extrabold">•</span>
                <p><strong>अनवरत पदविहार (Vihar):</strong> {lang === 'hi' ? 'संपूर्ण भारतवर्ष में बिना जूते, चप्पल या पादत्राण पहने केवल नंगे पैर पैदल गतिशीलता।' : 'Vows of walking exclusively barefoot over thousands of kilometers to respect non-violence filters.'}</p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-cyan-500 font-extrabold">•</span>
                <p><strong>विशुद्ध गोचरी (Bhiksha):</strong> {lang === 'hi' ? 'स्वयं अन्न नहीं पकाते, न ही धन संग्रह करते हैं। काष्ठ (लकड़ी) के पात्रों में गृहस्थ श्रावकों के यहाँ से बिना किसी बाधा के निर्दोष शाकाहारी आहार ग्रहण करते हैं।' : 'Do not touch money or cook meals. Walk to local homes to collect simple remnants of vegetarian nutrition in wooden bowls.'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* CONTROLS */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black uppercase tracking-widest py-3 rounded-2xl text-[10px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-cyan-500/10"
          >
            <Share2 size={13} className="text-slate-950" />
            {text.btnShare}
          </button>
        </div>

        {/* VERIFICATION ID FOOTER */}
        <div className="bg-black/5 dark:bg-white/[0.012] border border-[var(--border-color)] p-4 rounded-[1.8rem] flex justify-between items-center text-[10px] font-bold text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>{lang === 'hi' ? 'प्रमाणित इतिहास लेखागार' : 'Canonical History Verified'}</span>
          </div>
          <span>{lang === 'hi' ? 'सूचना कोड: ८६४' : 'Info ID: 864 (Active)'}</span>
        </div>

      </div>

      {/* TOAST PANEL */}
      <AnimatePresence>
        {showCopiedAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2 border border-white/20 whitespace-nowrap"
          >
            <Check size={14} className="stroke-black stroke-2" />
            <span>{text.lblCopy}</span>
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
