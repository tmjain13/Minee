import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Users, Key, Award, ChevronRight, Compass, ShieldAlert, Star, Flame } from 'lucide-react';

interface TabItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}

export default function TerapanthOverview() {
  const [activeTab, setActiveTab] = useState<string>('history');

  const tabs: TabItem[] = [
    { id: 'history', title: 'इतिहास (History)', icon: <BookOpen size={16} />, color: 'from-orange-500 to-amber-500' },
    { id: 'figures', title: 'प्रमुख आचार्य (Key Figures)', icon: <Users size={16} />, color: 'from-amber-500 to-red-500' },
    { id: 'tenets', title: 'मुख्य सिद्धांत (Tenets)', icon: <Key size={16} />, color: 'from-red-500 to-rose-500' },
    { id: 'ethics', title: 'नैतिक नियम (Ethics)', icon: <Award size={16} />, color: 'from-rose-500 to-orange-500' }
  ];

  return (
    <div id="terapanth_overview_root" className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] shadow-sm space-y-5">
      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="bg-orange-500/10 p-2.5 rounded-2xl text-orange-600 dark:text-orange-400">
          <Compass className="w-6 h-6 animate-spin-slow" />
        </div>
        <div>
          <h2 className="serif-text text-xl font-black text-[var(--text-spiritual)]">जैन श्वेतांबर तेरापंथ इतिहास व दर्शन</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mt-0.5">Canonical Spiritual Blueprint</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-md scale-102'
                  : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/10'
              }`}
            >
              {tab.icon}
              <span>{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-5 border border-[var(--border-color)]">
        <AnimatePresence mode="wait">
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Star size={18} className="fill-current" />
                <h3 className="font-extrabold text-base">तेरापंथ स्थापना (1760 ईस्वी)</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                जैन श्वेतांबर तेरापंथ पंथ की स्थापना <strong>आचार्य भिक्षु (स्वामी भीखनजी)</strong> द्वारा विक्रम संवत 1817 (आषाढ़ शुक्ल पूर्णिमा, तदनुसार 28 जून 1760) को केलवा, राजस्थान में हुई थी। तत्कालीन शिथिलाचार को त्याग कर पूर्ण अहिंसा, अपरिग्रह तथा कड़े आगमिक नियमों के पालन हेतु यह नवीन क्रान्तिकारी शुरुआत थी।
              </p>
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                <h4 className="font-bold text-xs text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-1.5">"तेरापंथ" नामकरण का इतिहास:</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  शुरुआत में स्वामीजी के साथ केवल 13 मुनि थे। जोधपुर के दीवान फतेहचंदजी ने इस संगठन को देखकर सहज कहा: <strong>"हे प्रभु! यह तो हे तेरा (तेरह) पंथ!"</strong>। आचार्य भिक्षु ने इस शब्द को परमात्मा से जोड़ते हुए सुंदर पद रचा: <em>"हे प्रभु! यह तेरा (आपका) ही पंथ है"</em>। साथ ही, यह 13 नियमों (5 महाव्रत, 5 समिति, 3 गुप्ति) का प्रतिनिधित्व करता है।
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'figures' && (
            <motion.div
              key="figures"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Users size={18} />
                <h3 className="font-extrabold text-base">युगप्रवर्तक आचार्य परंपरा (11 आचार्य)</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                तेरापंथ पंथ में <strong>एक गुरु प्रणाली (Ek Guru System)</strong> का विधान है, जिसके अंतर्गत पूरा संघ एक ही आचार्य के आदेश में संघबद्ध रहता है।
              </p>
              <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {[
                  { name: '1. आचार्य भिक्षु (1760-1803)', desc: 'संस्थापक आचार्य, मर्यादा पत्र के लेखक तथा कठोर संन्यास के प्रणेता।' },
                  { name: '9. आचार्य तुलसी (1936-1997)', desc: 'अणुव्रत आंदोलन (1949) के प्रणेता, प्रेक्षा ध्यान तथा समण श्रेणी के संस्थापक।' },
                  { name: '10. आचार्य महाप्रज्ञ (1997-2010)', desc: 'महान लेखक, दार्शनिक, जैन आगमों के संपादक तथा प्रेक्षा ध्यान पद्धति के सूत्रधार।' },
                  { name: '11. आचार्य महाश्रमण (2010-वर्तमान)', desc: 'वर्तमान सर्वोच्च अधिशास्ता। जिन्होंने 50,000+ किमी की नंगे पैर ऐतिहासिक अहिंसा यात्रा सम्पन्न की।' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border-l-4 border-amber-500">
                    <p className="font-black text-xs text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'tenets' && (
            <motion.div
              key="tenets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Flame size={18} />
                <h3 className="font-extrabold text-base">मुख्य दार्शनिक सिद्धांत</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                तेरापंथ पूर्णतः <strong>अमूर्त्तिपूजक (Amurti Pujak)</strong> संप्रदाय है, जिसमें मूर्ति पूजा के स्थान पर ध्यान, स्वाध्याय और संयम को मोक्ष का मार्ग माना गया है।
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/10 text-center">
                  <span className="text-xl">🕉️</span>
                  <p className="font-bold text-xs text-red-900 dark:text-red-300 mt-1">9 तत्त्व (9 Tattvas)</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">जीव, अजीव, पुण्य, पाप, आस्रव, संवर, निर्जरा, बंध, मोक्ष</p>
                </div>
                <div className="bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 text-center">
                  <span className="text-xl">📜</span>
                  <p className="font-bold text-xs text-rose-900 dark:text-rose-300 mt-1">लौकिक बनाम लोकोत्तर</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">सांसारिक जीवन एवं विशुद्ध आत्म-कल्याणकारी आध्यात्मिक नियमों में स्पष्ट भेद</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ethics' && (
            <motion.div
              key="ethics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Award size={18} />
                <h3 className="font-extrabold text-base">नैतिक जीवन एवं अणुव्रत सिद्धांत</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                आचार्य तुलसी द्वारा 1949 में शुरू किया गया <strong>अणुव्रत आंदोलन</strong> सर्वधर्म-समभाव पर आधारित है, जो गृहस्थों के लिए छोटे-छोटे नैतिक नियम प्रतिपादित करता है।
              </p>
              <div className="space-y-1.5">
                {[
                  'मैं किसी भी निरपराध जीव की संकल्पपूर्वक हत्या नहीं करूँगा।',
                  'मैं हिंसात्मक या सामाजिक रूप से अहितकर असत्य भाषण नहीं करूँगा।',
                  'मैं चोरी या अनैतिक रूप से दूसरे की संपत्ति नहीं हड़पूँगा।',
                  'मैं अपनी इच्छाओं और संग्रह की प्रवृत्तियों को सीमित रखूँगा।'
                ].map((rule, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="text-rose-500 mt-0.5">✔</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
