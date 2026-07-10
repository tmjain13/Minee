import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Shield, HelpCircle, Activity, Award, CheckCircle2, ChevronDown, ChevronUp, Sun, Sparkles, RefreshCw, Milestone, ArrowRight } from 'lucide-react';

interface KarmaType {
  id: number;
  name: string;
  nameEn: string;
  color: string;
  icon: string;
  description: string;
  cause: string;
  effect: string;
  remedy: string;
}

const KARMA_TYPES: KarmaType[] = [
  { id: 1, name: "ज्ञानावरणीय", nameEn: "Jnanavarniya", color: "#6366f1", icon: "🧠", description: "आत्मा के ज्ञान को ढकने वाला कर्म। जैसे बादल सूर्य को ढकते हैं।", cause: "दूसरों की विद्या में बाधा डालना, ज्ञान की निंदा करना, शास्त्रों का तिरस्कार करना।", effect: "अज्ञान, स्मरण शक्ति में कमी, सीखने में कठिनाई, सत्य ज्ञान को समझने में बाधा।", remedy: "सच्चे ज्ञान का आदर करना, स्वाध्याय करना, विद्या का प्रचार करना तथा विद्यार्थियों की सहायता।" },
  { id: 2, name: "दर्शनावरणीय", nameEn: "Darshanavarniya", color: "#8b5cf6", icon: "👁️", description: "आत्मा की दर्शन शक्ति (सामान्य बोध) को ढकने वाला कर्म।", cause: "सम्यक दर्शन की निंदा, सच्चे देवताओं और गुरुओं पर संदेह, निद्रा अधिक लाना।", effect: "सही दृष्टि न होना, मानसिक भ्रम, आत्मज्ञान से दूरी, दर्शन शक्ति की क्षीणता।", remedy: "सम्यक दर्शन का विकास, गुरुजनों की सेवा, सदाचरण का पालन।" },
  { id: 3, name: "वेदनीय", nameEn: "Vedaniya", color: "#f59e0b", icon: "💫", description: "आत्मा को सुख और दुःख का भौतिक संसार में अनुभव कराने वाला कर्म।", cause: "जीवों को प्रताड़ित करना (अशाता वेदनीय), दुखियों को सुख पहुँचाना (शाता वेदनीय)।", effect: "शारीरिक व मानसिक सुख-दुख की प्राप्ति, प्रतिकूल या अनुकूल परिस्थितियां मिलना।", remedy: "अहिंसा का पूर्ण आचरण, पीड़ित जीवों पर दया, निस्वार्थ सेवा करना।" },
  { id: 4, name: "मोहनीय", nameEn: "Mohaniya", color: "#ef4444", icon: "😵", description: "सबसे खतरनाक कर्म — आत्मा की विवेक शक्ति को मोहित कर राग-द्वेष में फंसाता है।", cause: "क्रोध, मान, माया, लोभ (चार कषाय), तीव्र आसक्ति, किसी से ईर्ष्या।" , effect: "सत्य-असत में भेद न कर पाना, अत्यंत मोह, क्रोध तथा मानसिक अशांति का चक्र।", remedy: "क्षमा, विनय, सरलता, संतोष की साधना तथा प्रेक्षाध्यान।" },
  { id: 5, name: "आयु", nameEn: "Ayu", color: "#10b981", icon: "⏳", description: "संसार की चार गतियों (मनुष्य, देव, तिर्यंच, नरक) में जीवन की अवधि निर्धारित करने वाला कर्म।", cause: "अत्यधिक आरंभ या परिग्रह (नरक), मायाचार (तिर्यंच), सादा जीवन (मनुष्य), संयम (देव आयु)।", effect: "वर्तमान और आगामी जीवन का कालमान (Life span) तय होना।", remedy: "सम्यक आचरण, तपस्या, आसक्ति रहित होकर धर्म का पालन करना।" },
  { id: 6, name: "नाम", nameEn: "Nam", color: "#06b6d4", icon: "🌺", description: "जीव के शरीर की रचना, रूप, रंग, स्वर और सामाजिक स्वरूप निर्धारित करने वाला कर्म।", cause: "मन, वचन, काय की कुटिलता (अशुभ नाम), निष्कपट व्यवहार एवं सरलता (शुभ नाम)।", effect: "सुंदर या कुरूप शरीर, सुरीली या कर्कश आवाज, यश-अपयश की प्राप्ति।", remedy: "इंद्रिय संयम, सेवाभाव, शरीर का आत्मशुद्धि हेतु सदुपयोग।" },
  { id: 7, name: "गोत्र", nameEn: "Gotra", color: "#f97316", icon: "👑", description: "समाज व परिवार में उच्च या नीच कुल में जन्म निर्धारित करने वाला कर्म।", cause: "स्वयं की प्रशंसा करना व दूसरों की निंदा करना, अहंकार (नीच गोत्र); नम्रता व विनय (उच्च गोत्र)।", effect: "समाज में मान-प्रतिष्ठा या अनादर, अनुकूल कुलीनता की प्राप्ति।", remedy: "विनय, नम्रता, बड़ों का सम्मान तथा अहंकार का पूर्ण विसर्जन।" },
  { id: 8, name: "अंतराय", nameEn: "Antaraya", color: "#84cc16", icon: "🚧", description: "दान, लाभ, भोग, उपभोग और आत्मवीर्य (शक्ति) में बाधा डालने वाला अंतराय कर्म।", cause: "दूसरों की मदद रोकने का प्रयास, दूसरों के लाभ में रुकावट डालना, दान का तिरस्कार।", effect: "पुरुषार्थ करने पर भी इच्छित फल न मिलना, साधनों का अभाव होना।", remedy: "दीन-दुखियों की सहायता, दान की भावना और साधकों के मार्ग में आने वाले विघ्नों को दूर करना।" }
];

interface CycleStep {
  stepNum: number;
  name: string;
  nameEn: string;
  description: string;
  example: string;
  color: string;
}

const CYCLE_STEPS: CycleStep[] = [
  {
    stepNum: 1,
    name: "आस्रव",
    nameEn: "Asrava",
    description: "आत्मा की ओर कर्म पुद्गलों (Karma Particles) का बहाव होना। कषाय, राग-द्वेष और मन-वचन-काय की गतिविधियों से कर्म आकर्षित होते हैं।",
    example: "जैसे खिड़की खुली रखने से कमरे में धूल के कण प्रवेश करते हैं।",
    color: "from-red-500/10 to-transparent text-red-600 border-red-500/20"
  },
  {
    stepNum: 2,
    name: "बंध",
    nameEn: "Bandha",
    description: "आत्मा के साथ आकृष्ट कर्म पुद्गलों का स्थायी रूप से चिपक जाना। आत्मा के राग-द्वेष के कषाय रूपी स्निग्धता के कारण कर्म बंधते हैं।",
    example: "जैसे गीले शरीर पर धूल चिपक जाती है, राग-द्वेष युक्त आत्मा से कर्म बंधते हैं।",
    color: "from-amber-500/10 to-transparent text-amber-600 border-amber-500/20"
  },
  {
    stepNum: 3,
    name: "संवर",
    nameEn: "Samvar",
    description: "उचित व्रतों, नियमों और सामायिक के द्वारा आत्मा की ओर नए कर्म पुद्गलों के आगमन को पूरी तरह रोक देना।",
    example: "जैसे खिड़की को बंद करके धूल के नए प्रवाह को कमरे में आने से रोक दिया जाता है।",
    color: "from-indigo-500/10 to-transparent text-indigo-600 border-indigo-500/20"
  },
  {
    stepNum: 4,
    name: "निर्जरा",
    nameEn: "Nirjara",
    description: "तप, उपवास, स्वाध्याय और ध्यान की अग्नि द्वारा आत्मा से पूर्व संचित कर्मों को जलाकर अलग करना।",
    example: "जैसे कमरे में पहले से मौजूद धूल को बुहारी या झाड़ू लगाकर बाहर कर दिया जाता है।",
    color: "from-emerald-500/10 to-transparent text-emerald-600 border-emerald-500/20"
  },
  {
    stepNum: 5,
    name: "मोक्ष",
    nameEn: "Moksha",
    description: "आत्मा का समस्त कर्म बंधनों से पूर्णतः मुक्त हो जाना। सिद्धशिला पर परम आनंद, निरपेक्ष स्वतंत्रता और अनंत चतुष्टय की प्राप्ति।",
    example: "जब कमरा पूरी तरह से धूल रहित हो जाता है और हमेशा के लिए निखर उठता है।",
    color: "from-rose-500/10 to-transparent text-rose-600 border-rose-500/20"
  }
];

export default function KarmaTheory({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<'types' | 'cycle'>('types');
  const [expandedTypeId, setExpandedTypeId] = useState<number | null>(null);

  const toggleTypeExpand = (id: number) => {
    setExpandedTypeId(expandedTypeId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 border border-black/5 dark:border-white/5 space-y-6 shadow-sm overflow-hidden text-left" id="karma-theory-container">
      
      {/* Header section with icons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-2xl shadow-sm">
            <Activity className="animate-pulse" size={24} />
          </div>
          <div>
            <h3 className="serif-text font-black text-gray-900 dark:text-white text-xl">जैन कर्म सिद्धांत</h3>
            <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">The Science of Action & Liberation</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl w-fit border border-black/5 dark:border-white/5 shadow-inner">
        <button
          onClick={() => setActiveTab('types')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'types' ? 'bg-white dark:bg-gray-750 text-purple-650 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Sparkles size={13} />
          8 कर्म प्रकार
        </button>
        <button
          onClick={() => setActiveTab('cycle')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'cycle' ? 'bg-white dark:bg-gray-750 text-purple-650 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Milestone size={13} />
          कर्म चक्र (Cycle)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'types' ? (
          <motion.div
            key="karma-types-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {KARMA_TYPES.map(karma => {
              const isExpanded = expandedTypeId === karma.id;
              return (
                <motion.div
                  key={karma.id}
                  layout="position"
                  className="bg-gray-50/50 dark:bg-gray-800/40 rounded-3xl p-5 border border-black/5 dark:border-white/5 space-y-4 self-start transition-all"
                  style={{ borderLeft: `5px solid ${karma.color}` }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="serif-text font-black text-gray-900 dark:text-white text-base flex items-center gap-2">
                        <span className="text-xl" role="img" aria-label={karma.nameEn}>{karma.icon}</span>
                        {karma.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">{karma.nameEn} Karma</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                    {karma.description}
                  </p>

                  {/* Expandable Box */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-3 pt-3 border-t border-dashed border-black/10 dark:border-white/10"
                      >
                        {/* Cause section */}
                        <div className="p-3 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border border-red-500/10 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-red-500 block">बंधन का कारण (Causes of Bandha):</span>
                          <span className="text-xs text-gray-650 dark:text-gray-350 leading-relaxed block">{karma.cause}</span>
                        </div>

                        {/* Effect section */}
                        <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/10 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-555 block">कर्म का प्रभाव (Effects):</span>
                          <span className="text-xs text-gray-650 dark:text-gray-350 leading-relaxed block">{karma.effect}</span>
                        </div>

                        {/* Remedy section */}
                        <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-555 block">निर्जरा का उपाय (Remedy & Virtue):</span>
                          <span className="text-xs text-gray-655 dark:text-gray-355 leading-relaxed block font-medium">{karma.remedy}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => toggleTypeExpand(karma.id)}
                    className="w-full py-2.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-gray-650 dark:text-gray-305 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>{isExpanded ? "कम जानें" : "विस्तृत विवरण जानें"}</span>
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="karma-cycle-timeline"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {CYCLE_STEPS.map((step, idx) => {
              return (
                <div key={step.stepNum} className="space-y-4">
                  {idx > 0 && (
                    <div className="flex justify-center -my-2">
                      <div className="p-1 px-3 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] text-gray-400 font-extrabold flex items-center gap-1">
                        बावजुद इसके आगे का चरण <ArrowRight size={10} className="text-purple-500" />
                      </div>
                    </div>
                  )}

                  <div className={`bg-gradient-to-r ${step.color} border p-5 rounded-3xl space-y-3`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                          {step.stepNum}
                        </span>
                        <div>
                          <h4 className="serif-text font-black text-base text-gray-905 dark:text-white leading-none">
                            {step.name}
                          </h4>
                          <span className="text-[9px] text-gray-405 font-bold uppercase tracking-wider">{step.nameEn}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                      {step.description}
                    </p>

                    <div className="p-3 bg-white/50 dark:bg-black/10 rounded-2xl border border-black/5 dark:border-white/5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-505 block mb-1">व्यावहारिक उदाहरण (Practical Analogy):</span>
                      <p className="text-xs text-gray-550 dark:text-gray-400 italic">"{step.example}"</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Footer Wrapper */}
      <div className="text-center pt-4 border-t border-black/5 dark:border-white/5 space-y-1">
        <p className="serif-text italic text-xs text-purple-650 dark:text-purple-400 font-medium">
          "कर्म का सिद्धांत भाग्यवाद नहीं — यह पुरुषार्थ का विज्ञान है।"
        </p>
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400/80">
          — आचार्यश्री महाप्रज्ञ जी (Yugacharya)
        </span>
      </div>

    </div>
  );
}
