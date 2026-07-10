import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, BookOpen, User, Star, Plus, X, Award, ChevronRight, Activity } from 'lucide-react';
import { BAHUSHRUT_PARISHAD_DATABASE } from '../data/bahushrutParishad';
import MuniUditChronology from './MuniUditChronology';

export interface ParishadDetail {
  rank: number;
  name: string;
  title: string;
  role: string;
  contributions: string[];
  philosophy: string;
}

const PARISHAD_DETAILS: ParishadDetail[] = [
  {
    rank: 1,
    name: "मुनि श्री उदित कुमार जी",
    title: "अग्रगण्य / अग्रणी (Group Leader)",
    role: "ज्ञानशाला के केंद्रीय मुख्य प्रभारी (Global Gyanshala Lead)",
    contributions: [
      "पूज्य ११वें आचार्य श्री महाश्रमण जी के साथ संवत् २०३१ में सरदारशहर में सह-दीक्षित।",
      "दीक्षा पर्याय मर्सिया अनुसार गुरुदेव से वरिष्ठ/ज्येष्ठ संत।",
      "ज्ञानशाला (मूल्य-शिक्षा प्रणाली) के वैश्विक केंद्रीय प्रभारी के रूप में अध्यापन प्रभाग के नियंता।",
      "आगमों के प्रगाढ़ अध्येता, प्रेक्षाध्यान के मुख्य प्रशिक्षक, और 'पुण्यात्मा' जीवनवृत्त के लेखक।"
    ],
    philosophy: "गुरु समर्पण और बाल-संस्कार निर्माण ही धर्मसंघ के श्रेष्ठ सुदृढ़ीकरण की आधारशिला है।"
  },
  {
    rank: 2,
    name: "मुनि श्री दिनेश कुमार जी",
    title: "विद्वान लेखक व डॉक्टर ऑफ़ फिलॉसफी (Ph.D)",
    role: "वरिष्ठ विचारक एवं शोध प्रभाग (Scientific Research & Philosophy)",
    contributions: [
      "आधुनिक विज्ञान और जैन ब्रह्मांड विज्ञान के सूक्ष्म समन्वय के सर्वोच्च विशेषज्ञ।",
      "अनेकों दार्शनिक पुस्तकों और शोध-पत्रों के लब्धप्रतिष्ठ संकलनकर्ता।",
      "युवा पीढ़ी के लिए वैज्ञानिक दृष्टि से जैन तत्वों की प्रयोगात्मक व्याख्या के पुरोधा।"
    ],
    philosophy: "जब अध्यात्म और विज्ञान एक दूसरे के परिपूरक बनते हैं, तब सार्वभौमिक सत्य का साक्षात्कार संभव होता है।"
  },
  {
    rank: 3,
    name: "मुनि श्री महावीर कुमार जी",
    title: "वरिष्ठ आगम विशेषज्ञ (Agamic Text Interpreter)",
    role: "सनातनी आगम व्याख्या परिषद प्रणेता",
    contributions: [
      "प्राचीन प्राकृत, संस्कृत एवं अर्धमागधी लिपियों तथा वाचनाओं के शीर्ष अध्येता।",
      "आचार्यप्रवर के नेतृत्व में संपादित हो रहे नवीन आगम ग्रंथों की समीक्षात्मक शुद्धि टीम के अहम सदस्य।"
    ],
    philosophy: "मूल आगमों के अक्षरों में तीर्थंकरों की सच्ची वाणी समाहित है; उनकी सुरक्षा ही संघ-सुरक्षा है।"
  },
  {
    rank: 4,
    name: "साध्वी प्रमुखा विश्रुतविभा जी",
    title: "मुख्य नियोजिका एवं साध्वी श्रेणी प्रमुख",
    role: "समस्त साध्वी वृन्द एवं समणी श्रेणी की केंद्रीय अधिनायिका व शासिका",
    contributions: [
      "पूज्य आचार्य श्री महाश्रमण जी द्वारा साध्वी समाज के विकास और अनुशासन के संपूर्ण संचालन हेतु नियुक्त।",
      "नारी चेतना संघ और साध्वी गुरुकुल पाठ्यक्रमों की सर्वोच्च मार्गदर्शिका।"
    ],
    philosophy: "परम संयमशीलता और विनम्रता ही नारी संघ की अलौकिक शक्ति और ओजस्वी प्रभा है।"
  },
  {
    rank: 5,
    name: "साध्वी वर्या संबुद्धयशा जी",
    title: "वरिष्ठ साध्वी नेतृत्व (Senior Nun Council)",
    role: "शैक्षणिक और ध्यान साधना प्रकोष्ठ मुख्य संचालिका",
    contributions: [
      "साध्वी समाज में नव-दीक्षितों के दीक्षाकाल से लेकर अग्रगामी तत्वों के पठन-पाठन का सुचारु संचालन।",
      "कठिन व्रतों और तपस्याओं के व्यावहारिक अनुपालन प्रभाग की संरक्षक।"
    ],
    philosophy: "संयम की अखंडता जीवन के प्रति आत्म-जागरूकता और अनुशासन से ही निरंतर परिपोषित होती है।"
  },
  {
    rank: 6,
    name: "साध्वी राजिमती जी",
    title: "विद्वान साध्वी वृन्द (Canonical Orator)",
    role: "तत्वज्ञान काव्य व अनुवाद प्रभाग",
    contributions: [
      "शास्त्र संवादों और तत्व व्याख्यानों की अत्यंत ओजस्वी प्रवक्ता।",
      "प्राचीन प्राकृत सूत्रों का सरल हिंदी एवं आंचलिक काव्यात्मक अनुवाद कर श्रावक वर्ग को प्रबुद्ध करना।"
    ],
    philosophy: "सरल वाणी और उत्कृष्ट सात्विक अभिव्यक्ति से ही गूढ़तम आध्यात्मिक सत्यों को लोक-हृदय तक पहुँचाया जा सकता है।"
  },
  {
    rank: 7,
    name: "साध्वी कनकश्री जी",
    title: "विद्वान संस्कृत व्याकरण आचार्या (Grammar Scholar)",
    role: "भारतीय न्याय व दर्शन प्रकोष्ठ विशेषज्ञ",
    contributions: [
      "भारतीय दर्शन पद्धतियों और संस्कृत व्याकरण प्रमेयों की श्रेष्ठ अध्यापिका।",
      "साध्वी समाज में न्याय दर्शन तथा जैन तर्कशास्त्र प्रभाग की मुख्य पथप्रदर्शिका।"
    ],
    philosophy: "शास्त्रार्थ की गंभीरता और सम्यक तर्क बुद्धि हमारी वैचारिक चेतना को निर्मल और अमोघ बनाती है।"
  }
];

export default function BahushrutParishadPortal() {
  const [selectedMember, setSelectedMember] = useState<ParishadDetail | null>(null);
  const [showChronology, setShowChronology] = useState(false);

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="bg-[#fcf5eb] dark:bg-amber-950/10 border border-amber-300/30 p-5 rounded-[2.5rem] flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full" />
        <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
          <ShieldCheck size={10} /> Conserved Elite Matrix
        </span>
        <h4 className="serif-text font-black text-amber-800 dark:text-amber-300 text-xl leading-snug">
          बहुश्रुत परिषद (Bahushrut Parishad Portal)
        </h4>
        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
          यह तेरापंथ धर्मसंघ की सर्वोच्च विद्वत परिषद (Elite 7 Scholars) है, जो तत्वज्ञान के वैज्ञानिक विवेचन, नवीन आगम संपादन, और विधिक संघ मामलों में आचार्य देव की मुख्य सलाहकार है।
        </p>
      </div>

      {/* Grid of members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {PARISHAD_DETAILS.map((member) => {
          const isUditKumar = member.rank === 1;
          return (
            <motion.div 
              key={member.rank}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedMember(member);
                if (member.rank !== 1) setShowChronology(false);
              }}
              className={`p-5 rounded-[2rem] border cursor-pointer flex flex-col justify-between h-52 transition-all shadow-sm ${
                isUditKumar 
                  ? 'bg-amber-50/20 dark:bg-amber-950/5 border-amber-300 dark:border-amber-800/60 ring-1 ring-amber-500/10' 
                  : 'bg-white dark:bg-gray-800 border-black/5 dark:border-white/5 hover:border-spiritual/30 shadow-black/5'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-7 h-7 rounded-lg bg-spiritual/10 text-spiritual flex items-center justify-center text-[10px] font-black">
                    Rank {member.rank}
                  </div>
                  {isUditKumar && (
                    <span className="text-[8px] bg-amber-600 text-white font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse">
                      Chief Member / ज्ञानशाला प्रभारी
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="serif-text font-extrabold text-gray-900 dark:text-white text-base leading-snug flex items-center gap-1">
                    {member.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-1">{member.title}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] font-black text-spiritual uppercase tracking-wider">
                <span>View Responsibilities</span>
                <ChevronRight size={14} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-2xl bg-[var(--bg-cream)] dark:bg-gray-900 rounded-[3rem] p-6 sm:p-8 border border-black/15 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setSelectedMember(null);
                  setShowChronology(false);
                }}
                className="absolute right-6 top-6 p-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors z-20"
              >
                <X size={18} />
              </button>

              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-spiritual/10 text-spiritual flex items-center justify-center text-lg font-black">
                    #{selectedMember.rank}
                  </div>
                  <div>
                    <h3 className="serif-text font-black text-gray-900 dark:text-white text-xl">{selectedMember.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{selectedMember.title}</p>
                  </div>
                </div>

                {/* Role and Portfolio */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-black/5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">Central Portfolio / दायित्व</span>
                  <span className="text-sm font-black text-spiritual leading-snug">{selectedMember.role}</span>
                </div>

                {/* Custom Button for Udit Kumar's Timeline */}
                {selectedMember.rank === 1 && (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setShowChronology(!showChronology)}
                      className="w-full py-3.5 px-4 bg-spiritual text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-spiritual/25 flex items-center justify-center gap-2 hover:bg-spiritual/90 transition-all"
                    >
                      <Activity size={14} className={showChronology ? 'animate-pulse' : ''} />
                      {showChronology ? 'Hide Chaturmas Voyage Chronology' : 'Open Chaturmas Voyage Chronology (1974 - 2026)'}
                    </button>
                    
                    {showChronology && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <MuniUditChronology />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Key Contributions */}
                <div className="space-y-3">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                    <BookOpen size={10} /> Key Achievements (प्रमुख संघ-योगदान)
                  </span>
                  <div className="space-y-2">
                    {selectedMember.contributions.map((con, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start text-xs text-gray-700 dark:text-gray-300 font-medium bg-black/5 dark:bg-white/5 p-3 rounded-xl leading-relaxed">
                        <span className="text-spiritual mt-0.5">•</span>
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Philosophy Statement */}
                <div className="border-t border-black/5 dark:border-white/5 pt-4">
                  <p className="text-xs text-spiritual dark:text-amber-400 leading-relaxed font-black block mb-1 italic">
                    " {selectedMember.philosophy} "
                  </p>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mt-1">— Spiritual Vision</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
