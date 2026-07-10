import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Copy, Share2, Check, ChevronDown, ChevronUp, Star, Info, Volume2 } from 'lucide-react';

interface SutraLine {
  prakrit: string;
  hindi: string;
  meaning: string;
}

interface Sutra {
  id: string;
  name: string;
  nameEn: string;
  occasion: string;
  lines: SutraLine[];
}

const SUTRAS: Sutra[] = [
  {
    id: 'navkar',
    name: 'नवकार मंत्र',
    nameEn: 'Navkar Mantra',
    occasion: 'प्रतिदिन — दिन में कभी भी',
    lines: [
      { prakrit: 'णमो अरिहंताणं', hindi: 'अरिहंतों को नमस्कार', meaning: 'मैं उन आत्माओं को नमन करता हूं जिन्होंने समस्त कर्मों का नाश कर सर्वज्ञता प्राप्त की।' },
      { prakrit: 'णमो सिद्धाणं', hindi: 'सिद्धों को नमस्कार', meaning: 'मैं उन मुक्त आत्माओं को नमन करता हूं जो सांसारिक बंधनों से सर्वथा मुक्त हैं।' },
      { prakrit: 'णमो आयरियाणं', hindi: 'आचार्यों को नमस्कार', meaning: 'मैं उन आचार्यों को नमन करता हूं जो संघ का नेतृत्व करते हैं।' },
      { prakrit: 'णमो उवज्झायाणं', hindi: 'उपाध्यायों को नमस्कार', meaning: 'मैं उन उपाध्यायों को नमन करता हूं जो शास्त्रों का अध्ययन-अध्यापन करते हैं।' },
      { prakrit: 'णमो लोए सव्व साहूणं', hindi: 'सभी साधुओं को नमस्कार', meaning: 'मैं संसार के सभी साधु-साध्वियों को नमन करता हूं।' },
      { prakrit: 'एसो पंच नमोक्कारो', hindi: 'यह पांच नमस्कार', meaning: 'यह पाँचों नमस्कार।' },
      { prakrit: 'सव्वपावप्पणासणो', hindi: 'सभी पापों का नाश करता है', meaning: 'समस्त पापों का नाश करने वाला है।' },
      { prakrit: 'मंगलाणं च सव्वेसिं', hindi: 'सभी मंगलों में', meaning: 'और सभी मंगलों में।' },
      { prakrit: 'पढमं हवइ मंगलं', hindi: 'प्रथम मंगल है', meaning: 'सर्वप्रथम मंगल है।' }
    ]
  },
  {
    id: 'irayavahi',
    name: 'इरियावही सूत्र',
    nameEn: 'Iriyavahi Sutra',
    occasion: 'प्रतिक्रमण के प्रारंभ में — चलने की हिंसा की क्षमा',
    lines: [
      { prakrit: 'इच्छामि पडिक्कमिउं', hindi: 'मैं प्रतिक्रमण करना चाहता हूं', meaning: 'मैं अपने कर्मों से निवृत्त होना चाहता हूं।' },
      { prakrit: 'इरियावहियाए', hindi: 'चलने-फिरने में', meaning: 'चलने-फिरने के दौरान।' },
      { prakrit: 'विराहणाए', hindi: 'जो विराधना हुई', meaning: 'जो भी जीव हिंसा हुई।' },
      { prakrit: 'गमणागमणे', hindi: 'आने-जाने में', meaning: 'आवागमन के दौरान।' },
      { prakrit: 'पाणक्कमणे', hindi: 'जीवों पर पैर पड़ने से', meaning: 'छोटे जीवों पर पैर पड़ जाने से।' },
      { prakrit: 'तसथावराणं', hindi: 'त्रस और स्थावर जीवों की', meaning: 'चलने वाले और न चलने वाले — सभी जीवों की।' },
      { prakrit: 'अप्पत्तियाए', hindi: 'अनजाने में', meaning: 'अनजाने में हुई हिंसा के लिए।' },
      { prakrit: 'तस्स मिच्छामि दुक्कडं', hindi: 'वह पाप मिथ्या हो', meaning: 'वह पाप मिथ्या हो — मैं उसके लिए क्षमा मांगता हूं।' }
    ]
  },
  {
    id: 'khamemi',
    name: 'खमेमि सव्वे जीवे',
    nameEn: 'Khamemi Savve Jive',
    occasion: 'पर्युषण — संवत्सरी क्षमापना',
    lines: [
      { prakrit: 'खमेमि सव्वे जीवे', hindi: 'मैं सभी जीवों को क्षमा करता हूं', meaning: 'मैं इस संसार के समस्त जीवों को हृदय से क्षमा करता हूं।' },
      { prakrit: 'सव्वे जीवा खमंतु मे', hindi: 'सभी जीव मुझे क्षमा करें', meaning: 'सभी जीव मुझे क्षमा करें — जो भी मुझसे अनजाने में गलती हुई।' },
      { prakrit: 'मित्ती मे सव्व भूएसु', hindi: 'सभी प्राणियों से मेरी मैत्री है', meaning: 'इस संसार के समस्त प्राणियों से मेरी मित्रता है।' },
      { prakrit: 'वेरं मज्झं न केणइ', hindi: 'किसी से भी वैर नहीं', meaning: 'किसी भी जीव से मेरा कोई वैर नहीं है।' }
    ]
  },
  {
    id: 'logassa',
    name: 'लोगस्स सूत्र',
    nameEn: 'Logassa Sutra',
    occasion: 'देववंदना — 24 तीर्थंकरों की स्तुति',
    lines: [
      { prakrit: 'लोगस्स उज्जोयगरे', hindi: 'लोक को प्रकाशित करने वाले', meaning: '24 तीर्थंकर जो संसार को ज्ञान का प्रकाश देते हैं।' },
      { prakrit: 'धम्मतित्थयरे जिणे', hindi: 'धर्म तीर्थ के स्थापक जिन', meaning: 'जिन्होंने धर्म का मार्ग दिखाया।' },
      { prakrit: 'अरिहंते कित्तइस्सं', hindi: 'अरिहंतों की स्तुति करूंगा', meaning: 'मैं अरिहंत परमात्मा की स्तुति करता हूं।' },
      { prakrit: 'चउव्वीसंपि केवली', hindi: 'चौबीसों केवली', meaning: 'चौबीसों केवलज्ञानी तीर्थंकरों की।' }
    ]
  },
  {
    id: 'karemi',
    name: 'करेमि भंते',
    nameEn: 'Karemi Bhante',
    occasion: 'सामायिक ग्रहण के समय',
    lines: [
      { prakrit: 'करेमि भंते सामाइयं', hindi: 'हे भगवन्! मैं सामायिक करता हूं', meaning: 'हे गुरुदेव, मैं सामायिक स्वीकार करता हूं।' },
      { prakrit: 'सव्वं सावज्जं जोगं', hindi: 'समस्त पापयुक्त योगों से', meaning: 'समस्त पापकारी कार्यों से।' },
      { prakrit: 'पच्चक्खामि', hindi: 'मैं विरति लेता हूं', meaning: 'मैं पूर्णतः दूर रहने का संकल्प लेता हूं।' },
      { prakrit: 'जाव नियमं पज्जुवासामि', hindi: 'जब तक नियम पर्यंत', meaning: 'जब तक यह नियम चले।' },
      { prakrit: 'दुविहं तिविहेणं', hindi: 'दो प्रकार से तीन योगों से', meaning: 'करने और करवाने — दोनों से, तथा मन-वचन-काय तीनों से।' },
      { prakrit: 'मणेणं वायाए काएणं', hindi: 'मन, वचन और काय से', meaning: 'विचार, वाणी और शरीर तीनों से।' },
      { prakrit: 'न करेमि न कारवेमि', hindi: 'न करूंगा न करवाऊंगा', meaning: 'स्वयं नहीं करूंगा और दूसरों से नहीं करवाऊंगा।' },
      { prakrit: 'तस्स भंते पडिक्कमामि', hindi: 'उसका प्रतिक्रमण करता हूं', meaning: 'यदि कोई भूल हो जाए तो उसका प्रतिक्रमण करता हूं।' }
    ]
  }
];

export default function SutraLibrary({ onBack }: { onBack?: () => void }) {
  const [selectedSutraId, setSelectedSutraId] = useState<string>('navkar');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedLines, setExpandedLines] = useState<Record<number, boolean>>({});

  const activeSutra = SUTRAS.find(s => s.id === selectedSutraId) || SUTRAS[0];

  const handleSutraChange = (id: string) => {
    setSelectedSutraId(id);
    setExpandedLines({});
  };

  const toggleLineExpand = (index: number) => {
    setExpandedLines(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getFullTextToCopy = () => {
    return `${activeSutra.name} (${activeSutra.nameEn})\nप्रसंग: ${activeSutra.occasion}\n\n` + 
      activeSutra.lines.map((line, i) => `${i + 1}. ${line.prakrit}\n- अर्थ: ${line.hindi}\n- भावार्थ: ${line.meaning}`).join('\n\n');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(getFullTextToCopy());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = getFullTextToCopy();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `तेरापंथ AI - ${activeSutra.name}`,
          text: text,
        });
      } catch (err) {
        // user cancelled or failed, falling back to copy
        handleCopyToClipboard();
      }
    } else {
      handleCopyToClipboard();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 border border-black/5 dark:border-white/5 space-y-6 shadow-sm overflow-hidden text-left" id="sutra-library-container">
      
      {/* Header section with icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
            <BookOpen className="animate-pulse" size={24} />
          </div>
          <div>
            <h3 className="serif-text font-black text-gray-900 dark:text-white text-xl">सूत्र पाठशाला</h3>
            <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Sacred Jain Sutras — Word by Word</p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyToClipboard}
            className="px-4 py-2 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-gray-600 dark:text-gray-300 transition-all flex items-center gap-1.5 cursor-pointer"
            title="पूरा सूत्र कॉपी करें"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{copied ? "कॉपी हुआ!" : "कॉपी"}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="साझा करें"
          >
            <Share2 size={12} />
            <span>साझा करें</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Tabs with unique UI styling */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide -mx-2 px-2 mask-linear-edges" id="sutra-tabs-scroll-container">
          {SUTRAS.map(sutra => (
            <button
              key={sutra.id}
              onClick={() => handleSutraChange(sutra.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                selectedSutraId === sutra.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/10'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 border-black/5 dark:border-white/5 hover:bg-black/5'
              }`}
            >
              {sutra.name}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSutra.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-6"
        >
          {/* Header detail box of selected sutra */}
          <div className="bg-gradient-to-br from-indigo-50/60 to-indigo-50/20 dark:from-indigo-950/20 dark:to-indigo-950/5 border border-indigo-500/10 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Star size={13} className="fill-indigo-600/20 text-indigo-500" />
                {activeSutra.nameEn}
              </span>

              {/* Occasion custom Badge */}
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                कब पढ़ें: {activeSutra.occasion}
              </span>
            </div>

            <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">
              मूल प्राकृत मय शब्दार्थ विज्ञान
            </h4>
          </div>

          {/* List of lines as cards */}
          <div className="space-y-3.5">
            {activeSutra.lines.map((line, index) => {
              const isExpanded = !!expandedLines[index];
              return (
                <div
                  key={index}
                  onClick={() => toggleLineExpand(index)}
                  className="bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all rounded-2xl p-4.5 border border-black/5 dark:border-white/5 cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-widest block">
                        पद {index + 1}
                      </span>
                      {/* Prakrit Line (text-lg font-bold text-spiritual) */}
                      <p className="text-lg font-bold text-[var(--text-spiritual)] leading-relaxed">
                        {line.prakrit}
                      </p>
                    </div>

                    <button className="p-1 px-2.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg border border-black/5 dark:border-white/5 transition-colors flex items-center gap-1 shrink-0">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                        {isExpanded ? "कम" : "भाव"}
                      </span>
                      {isExpanded ? <ChevronUp size={11} className="text-gray-450" /> : <ChevronDown size={11} className="text-gray-450" />}
                    </button>
                  </div>

                  {/* Hindi dictionary term rendering */}
                  <div className="border-t border-black/[0.03] dark:border-white/[0.03] pt-2">
                    <span className="text-[9px] font-black uppercase text-gray-400 block tracking-widest mb-0.5">शब्दार्थ (Hindi Wordplay):</span>
                    {/* Hindi Line (text-sm font-semibold text-gray-700) */}
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {line.hindi}
                    </p>
                  </div>

                  {/* Expandable detailed meaning container with italics */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-dashed border-indigo-500/10 pt-2.5 space-y-1"
                      >
                        <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                          गहन आध्यात्मिक भावार्थ (Detailed Metaphysics):
                        </span>
                        {/* Detailed Meaning (text-xs text-gray-400 italic or slightly darker for darkmode contrast) */}
                        <p className="text-xs text-gray-400 dark:text-gray-450 italic leading-relaxed">
                          {line.meaning}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </motion.div>
      </AnimatePresence>

      {/* Instructional footer card */}
      <div className="flex gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/25 rounded-2xl border border-black/5 dark:border-white/5">
        <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
          <b>नोट:</b> ये सूत्र प्राकृत मय भाषा (अर्धमागधी) में रचित हैं। तेरापंथ साधना क्रम में प्रत्येक सूत्र के प्रत्येक पद का गहन अर्थ आत्मा की शुद्धि और बंध का निवारण करने वाला है। किसी भी पद पर क्लिक करके विस्तृत भावार्थ (Metaphysics) जानें।
        </p>
      </div>

    </div>
  );
}
