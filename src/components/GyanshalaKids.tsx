import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, Award, Sparkles, Check, X, ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { readTextAloud, stopReading } from '../utils/voiceReader';

interface Story {
  id: string;
  emoji: string;
  title: string;
  excerpt: string;
  fullStory: string;
  lesson: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const STORIES: Story[] = [
  {
    id: 'chandanbala',
    emoji: '🐘',
    title: 'चंदनबाला की भक्ति और भगवान महावीर',
    excerpt: 'चंदनबाला ने कई दिनों तक भूखे रहकर भी केवल भगवान को आहार दान देने का संकल्प लिया। उनकी इस निस्वार्थ भावना से बेड़ियां टूट गईं...',
    fullStory: 'चंदनबाला का वास्तविक नाम वसुमती था। वह एक राजकुमारी थीं, परंतु परिस्थितियोंवश वे दासी बन गईं। उनके पैरों में बेड़ियां डाल दी गई थीं और सिर मुंडवा दिया गया था। वह बेहद कष्ट में थीं, और उनके पास खाने के लिए केवल उड़द के बाकुले (सूखे चने) थे। उस भीषण परिस्थिति में भी उनके मन में केवल भगवान महावीर को आहार बहराने (दान देने) की तीव्र भावना थी। जब भगवान महावीर उनके द्वार पर पधारे, तो चंदनबाला ने बड़ी ही करुणा और भक्ति भाव से उन्हें उड़द के बाकुले बहराए। भगवान महावीर ने उस भक्तिमय दान को स्वीकार किया। भगवान के आहार ग्रहण करते ही चंदनबाला के हाथों और पैरों की बेड़ियां टूट कर गिर गईं, उनके सिर पर स्वर्ण मुकुट आ गया, और उनके सारे कष्ट दूर हो गए। यह चंदनबाला की अटूट भक्ति और निस्वार्थ भाव का ही चमत्कार था।',
    lesson: 'सच्ची भक्ति और निस्वार्थ भावना में अपार शक्ति होती है। जब हम पवित्र मन से दान करते हैं, तो हमारे सारे बंधन टूट जाते हैं।'
  },
  {
    id: 'gajsukumal',
    emoji: '🧘',
    title: 'मुनि गजसुकुमाल की परम क्षमाशीलता',
    excerpt: 'मुनि गजसुकुमाल ने ध्यान की अवस्था में अपने सिर पर जलते अंगारे रखे जाने पर भी अत्यंत शांत रहकर क्षमा भाव रखा...',
    fullStory: 'गजसुकुमाल भगवान कृष्ण के छोटे भाई थे। उन्होंने युवावस्था में ही संसार का त्याग कर दीक्षा ग्रहण की। एक दिन जब वे श्मशान में ध्यानमग्न थे, तब उनके ससुर सोमिल वहां आए। सोमिल गजसुकुमाल के दीक्षा लेने से अत्यधिक क्रोधित थे। बदले की भावना से सोमिल ने मिट्टी का एक बर्तन मुनि गजसुकुमाल के सिर पर रखा और उसमें धधकते अंगारे (आग) भर दिए। मुनि गजसुकुमाल को असहनीय शारीरिक वेदना हुई, परंतु उनके मन में सोमिल के प्रति रंचमात्र भी क्रोध या द्वेष उत्पन्न नहीं हुआ। उन्होंने सोचा कि सोमिल तो मेरे मोक्ष मार्ग में सहायक बन रहे हैं। वे अत्यंत शांत रहे, ध्यान में लीन रहे और अपनी आत्मा को कर्मों से मुक्त कर लिया। उसी अवस्था में उन्हें केवलज्ञान प्राप्त हुआ और वे मोक्ष पधारे।',
    lesson: 'क्षमाशीलता आत्मा का सबसे उत्कृष्ट आभूषण है। बाहरी परिस्थितियां चाहे कितनी भी कष्टदायक हों, हमें अपना आंतरिक संतुलन और दया भाव नहीं खोना चाहिए।'
  },
  {
    id: 'shalibhadra',
    emoji: '🏡',
    title: 'पुण्यशाली शालिभद्र का महान त्याग',
    excerpt: 'शालिभद्र अत्यंत वैभवशाली जीवन जीते थे, पर जब उन्हें आत्मज्ञान हुआ, तो उन्होंने अपने अपार वैभव को तिनके के समान छोड़ दिया...',
    fullStory: 'शालिभद्र मगध साम्राज्य के सबसे धनी और वैभवशाली व्यक्ति थे। उनके पास बत्तीस भव्य महल और बत्तीस रानियां थीं। उनका पूरा जीवन वैभव, विलास और सुख-सुविधाओं से भरा हुआ था। एक बार जब उन्होंने भगवान महावीर के दर्शन किए और संतों के परम त्यागमयी एवं संयमित जीवन को देखा, तो उनके मन में वैराग्य जागृत हो गया। उन्हें अहसास हुआ कि भौतिक सुख क्षणभंगुर और अशाश्वत हैं, जबकि सच्चा सुख केवल संयमी जीवन में है। उन्होंने अपने अपार सुख और वैभव को तिनके के समान त्याग दिया और दीक्षा अंगीकार कर ली। कठिन साधना और तपस्या करके उन्होंने अपनी आत्मा का कल्याण किया।',
    lesson: 'संसार के चक्रव्यूह से मुक्त होने के लिए आंतरिक त्याग आवश्यक है। भौतिक ऐश्वर्य कभी भी मन को स्थायी शांति नहीं दे सकता।'
  }
];

const NAVKAR_LINES = [
  { text: 'णमो अरिहंताणं', meaning: 'अरिहंत भगवंतों को नमस्कार हो।' },
  { text: 'णमो सिद्धाणं', meaning: 'सिद्ध भगवंतों को नमस्कार हो।' },
  { text: 'णमो आयरियाणं', meaning: 'आचार्यों को नमस्कार हो।' },
  { text: 'णमो उवज्झायाणं', meaning: 'उपाध्यायों को नमस्कार हो।' },
  { text: 'णमो लोए सव्वसाहूणं', meaning: 'संसार के सभी साधु-संतों को नमस्कार हो।' },
  { text: 'एसोपंचणमुक्कारो, सव्वपावप्पणासणो', meaning: 'यह पांचों नमस्कार सभी पापों का नाश करने वाले हैं।' },
  { text: 'मंगला णं च सव्वेसिं, पढमं हवई मंगलं', meaning: 'और सभी मंगलों में यह प्रथम कल्याणकारी मंगल है।' }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'जैन धर्म के प्रथम तीर्थंकर कौन थे?',
    options: ['भगवान ऋषभदेव (आदिनाथ स्वामी)', 'भगवान महावीर स्वामी', 'भगवान पार्श्वनाथ स्वामी'],
    correctIndex: 0,
    explanation: 'भगवान ऋषभदेव (आदिनाथ स्वामी) जैन धर्म के प्रथम तीर्थंकर थे, जिन्होंने इस युग में जैन धर्म की पुनः स्थापना की और कृषि, कला, शिल्प तथा संगीत सिखाया।'
  },
  {
    id: 'q2',
    question: 'जैन धर्म में कुल कितने तीर्थंकर हुए हैं?',
    options: ['12 तीर्थंकर', '24 तीर्थंकर', '108 तीर्थंकर'],
    correctIndex: 1,
    explanation: 'इस वर्तमान चौबीसी में कुल 24 तीर्थंकर हुए हैं। प्रथम तीर्थंकर भगवान ऋषभदेव थे और 24वें अंतिम तीर्थंकर भगवान महावीर स्वामी थे।'
  },
  {
    id: 'q3',
    question: 'तेरापंथ धर्म संघ की स्थापना किसने की थी?',
    options: ['आचार्य तुलसी ने', 'आचार्य भिक्षु (स्वामी जी) ने', 'आचार्य महाप्रज्ञ ने'],
    correctIndex: 1,
    explanation: 'तेरापंथ धर्म संघ की स्थापना स्वामी भिक्षुजी (आचार्य भिक्षु) ने विक्रम संवत 1817 (सन 1760 ईस्वी) में राजस्थान के केलवा ग्राम में की थी।'
  },
  {
    id: 'q4',
    question: 'नवकार मंत्र में कितनी पुण्य आत्माओं को नमस्कार किया गया है?',
    options: ['तीन (3)', 'पांच (5 - पंचपरमेष्ठी)', 'नौ (9)'],
    correctIndex: 1,
    explanation: 'नवकार मंत्र में पंचपरमेष्ठी (अरिहंत, सिद्ध, आचार्य, उपाध्याय और साधु) को नमस्कार किया गया है, जो हमारी मोक्ष यात्रा के सच्चे मार्गदर्शक हैं।'
  },
  {
    id: 'q5',
    question: 'अहिंसा का सरल शब्दों में क्या अर्थ है?',
    options: ['किसी भी जीव को दुःख या पीड़ा न पहुँचाना', 'दूसरों पर गुस्सा करना', 'अधिक से अधिक धन कमाना'],
    correctIndex: 0,
    explanation: 'अहिंसा का अर्थ है विचार, वाणी और कर्म से किसी भी छोटे या बड़े जीव को चोट न पहुँचाना। यह जैन धर्म का सबसे महत्वपूर्ण सिद्धांत है।'
  }
];

export default function GyanshalaKids() {
  const [activeTab, setActiveTab] = useState<'story' | 'mantra' | 'quiz'>('story');
  
  // Story States
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string | null>(null);
  
  // Quiz States
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Audio Playback handler
  const handleTTSPlay = (textToSpeak: string, id: string) => {
    if (currentlySpeakingText === id) {
      stopReading();
      setCurrentlySpeakingText(null);
    } else {
      readTextAloud(textToSpeak);
      setCurrentlySpeakingText(id);
      
      // Setup listener/timer or simple cancel callback fallback
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const checkSpeechFinished = setInterval(() => {
          if (!synth.speaking) {
            setCurrentlySpeakingText(null);
            clearInterval(checkSpeechFinished);
          }
        }, 1000);
      }
    }
  };

  const handleStopTTS = () => {
    stopReading();
    setCurrentlySpeakingText(null);
  };

  // Reset Quiz
  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowExplanation(false);
    setQuizCompleted(false);
  };

  // Handle Option Select
  const handleSelectOption = (index: number) => {
    if (selectedAnswer !== null) return; // cannot change answer once locked
    setSelectedAnswer(index);
    if (index === QUIZ_QUESTIONS[currentQuizIndex].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  // Next Question
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  return (
    <div className="flex flex-col bg-amber-50/70 overflow-hidden font-sans rounded-3xl border border-yellow-200/60 shadow-xl max-w-2xl mx-auto my-2">
      
      {/* 🎈 Header Section (Playful & Warm Kids Layout) */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 p-6 shrink-0 rounded-b-[36px] shadow-md relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider mb-2 w-max">
              <Sparkles size={11} className="animate-spin" />
              <span>ज्ञानशाला पाठशाला</span>
            </div>
            <h1 className="text-3xl font-black text-white drop-shadow-md tracking-tight">किड्स कॉर्नर 🌟</h1>
            <p className="text-xs text-amber-50/90 font-medium">नैतिक मूल्य और पवित्र चरित्र का निर्माण</p>
          </div>
          <div className="text-5xl animate-bounce mt-2 select-none filter drop-shadow">🦁</div>
        </div>
        {/* Playful background graphics */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/25 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
      </div>

      {/* 🧩 Tab Navigation (Kids Friendly & Tactile) */}
      <div className="flex justify-center gap-2 p-4 shrink-0 mt-2 bg-white/40 backdrop-blur-sm mx-4 rounded-2xl border border-yellow-100">
        <button 
          id="kids_tab_story"
          onClick={() => { setActiveTab('story'); setSelectedStory(null); handleStopTTS(); }}
          className={`flex-1 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
            activeTab === 'story' 
              ? 'bg-orange-500 text-white scale-102 shadow-orange-500/10' 
              : 'bg-white text-orange-500 hover:bg-orange-50/50'
          }`}
        >
          <BookOpen size={16} />
          <span>📖 कहानी</span>
        </button>
        <button 
          id="kids_tab_mantra"
          onClick={() => { setActiveTab('mantra'); handleStopTTS(); }}
          className={`flex-1 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
            activeTab === 'mantra' 
              ? 'bg-blue-500 text-white scale-102 shadow-blue-500/10' 
              : 'bg-white text-blue-500 hover:bg-blue-50/50'
          }`}
        >
          <Volume2 size={16} />
          <span>🙏 मंत्र</span>
        </button>
        <button 
          id="kids_tab_quiz"
          onClick={() => { setActiveTab('quiz'); handleStopTTS(); }}
          className={`flex-1 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
            activeTab === 'quiz' 
              ? 'bg-emerald-600 text-white scale-102 shadow-emerald-500/10' 
              : 'bg-white text-emerald-600 hover:bg-emerald-50/50'
          }`}
        >
          <Award size={16} />
          <span>🧩 खेल</span>
        </button>
      </div>

      {/* 🌈 Main Content Area */}
      <main className="flex-1 p-5 pb-8 min-h-[350px]">
        
        {/* STORY TAB */}
        {activeTab === 'story' && (
          <div className="space-y-4">
            {!selectedStory ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">मनोरंजक कहानियां</p>
                {STORIES.map(story => (
                  <div 
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className="p-5 bg-white rounded-3xl border-2 border-orange-100 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 relative group cursor-pointer flex gap-4"
                  >
                    <span className="text-4xl bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center self-start shrink-0 select-none group-hover:scale-110 transition-transform">
                      {story.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black text-orange-400 tracking-wider uppercase mb-1 block">रोचक कथा</span>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-snug group-hover:text-orange-600 transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">
                        {story.excerpt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 space-y-4">
                <button 
                  onClick={() => { setSelectedStory(null); handleStopTTS(); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  ← पीछे जाएं
                </button>
                
                <div className="flex items-center gap-3 border-b-2 border-orange-100/50 pb-4">
                  <span className="text-4xl">{selectedStory.emoji}</span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                      {selectedStory.title}
                    </h3>
                    <p className="text-[10px] text-orange-500 font-extrabold uppercase tracking-widest mt-0.5">साधना प्रेरक बाल प्रसंग</p>
                  </div>
                </div>

                <div className="text-gray-700 text-sm sm:text-base leading-relaxed space-y-3 font-medium text-justify">
                  {selectedStory.fullStory}
                </div>

                {/* Shravak Lesson Highlight Box */}
                <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 p-4 rounded-2xl space-y-1.5">
                  <p className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={14} className="text-yellow-500" />
                    <span>कहानी से शिक्षा (Siksha)</span>
                  </p>
                  <p className="text-xs text-yellow-900 font-bold leading-relaxed">
                    {selectedStory.lesson}
                  </p>
                </div>

                {/* Read Aloud Controller */}
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={() => handleTTSPlay(selectedStory.fullStory + ' शिक्षा: ' + selectedStory.lesson, selectedStory.id)}
                    className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      currentlySpeakingText === selectedStory.id 
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                        : 'bg-orange-550 hover:bg-orange-600 text-white bg-orange-500'
                    }`}
                  >
                    {currentlySpeakingText === selectedStory.id ? (
                      <>
                        <VolumeX size={18} />
                        <span>आवाज़ रोकें (Stop Aloud)</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={18} />
                        <span>बोलकर सुनाएं (Read Aloud) 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MANTRA TAB */}
        {activeTab === 'mantra' && (
          <div className="space-y-4">
            <div className="bg-blue-50/60 rounded-3xl p-6 border-2 border-blue-100 flex flex-col md:flex-row gap-5 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-blue-900">महामंत्र नवकार सीखें</h3>
                    <p className="text-xs text-blue-600 font-semibold">शुद्ध उच्चारण और स्वर के साथ याद करें</p>
                  </div>
                  {currentlySpeakingText === 'full_navkar' ? (
                    <button 
                      onClick={handleStopTTS}
                      className="px-3 py-1.5 bg-red-100 text-red-600 rounded-xl font-bold text-[10px] uppercase cursor-pointer"
                    >
                      रोकें
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleTTSPlay(NAVKAR_LINES.map(l => l.text).join(', '), 'full_navkar')}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 size={12} /> Play All
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {NAVKAR_LINES.map((line, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-2xl shadow-sm border transition-all flex items-center justify-between gap-3 ${
                        currentlySpeakingText === `line_${idx}`
                          ? 'bg-blue-100 border-blue-300 scale-102 font-extrabold'
                          : 'bg-white hover:bg-blue-50/35 border-blue-50'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-extrabold text-blue-900 text-sm sm:text-base tracking-wide">
                          {line.text}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 mt-1 font-semibold dark:text-gray-500">
                          अर्थ: {line.meaning}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleTTSPlay(line.text + '. इसका अर्थ है: ' + line.meaning, `line_${idx}`)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
                          currentlySpeakingText === `line_${idx}`
                            ? 'bg-blue-500 text-white animate-bounce'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                        title="सुनें"
                      >
                        {currentlySpeakingText === `line_${idx}` ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            {!quizCompleted ? (
              <div className="bg-emerald-50/60 rounded-3xl p-6 border border-emerald-100">
                
                {/* Score and Tracker Header */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                    प्रश्न {currentQuizIndex + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider bg-amber-100 px-3 py-1 rounded-full">
                    स्कोर: {quizScore} ✨
                  </span>
                </div>

                <div className="space-y-4 text-center">
                  <span className="text-4xl block animate-bounce select-none">🎯</span>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug px-2">
                    {QUIZ_QUESTIONS[currentQuizIndex].question}
                  </h3>
                  
                  <div className="space-y-3 pt-3">
                    {QUIZ_QUESTIONS[currentQuizIndex].options.map((option, index) => {
                      const isCorrectAnswer = index === QUIZ_QUESTIONS[currentQuizIndex].correctIndex;
                      const isSelected = selectedAnswer === index;
                      
                      let optionStyle = "border-gray-100 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/30";
                      
                      if (selectedAnswer !== null) {
                        if (isCorrectAnswer) {
                          optionStyle = "border-emerald-500 bg-emerald-100 text-emerald-900 font-extrabold";
                        } else if (isSelected) {
                          optionStyle = "border-red-400 bg-red-100 text-red-900";
                        } else {
                          optionStyle = "border-gray-50 bg-gray-50/50 text-gray-400 cursor-not-allowed";
                        }
                      }

                      return (
                        <button 
                          key={index}
                          onClick={() => handleSelectOption(index)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-left font-bold text-xs sm:text-sm shadow-sm active:scale-98 ${optionStyle}`}
                        >
                          <span>{option}</span>
                          {selectedAnswer !== null && isCorrectAnswer && <Check size={16} className="text-emerald-600 shrink-0" />}
                          {selectedAnswer !== null && isSelected && !isCorrectAnswer && <X size={16} className="text-red-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-emerald-100 p-4 rounded-2xl text-left mt-4 text-xs space-y-2.5 shadow-sm"
                    >
                      <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-500" />
                        <span>ज्ञान समाधान (Explanation)</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed font-semibold">
                        {QUIZ_QUESTIONS[currentQuizIndex].explanation}
                      </p>
                      <button 
                        onClick={handleNextQuestion}
                        className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 font-bold uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-[10px]"
                      >
                        <span>{currentQuizIndex === QUIZ_QUESTIONS.length - 1 ? 'पूर्ण देखें / Results' : 'अगला प्रश्न / Next'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-emerald-100 text-center space-y-5">
                <span className="text-6xl block select-none">🏆</span>
                <h3 className="text-2xl font-black text-emerald-950">बधाई हो, बाल वैज्ञानिक!</h3>
                <p className="text-gray-600 text-sm font-semibold max-w-sm mx-auto">
                  आपने गेम सफलतापूर्वक पूरा कर लिया है और जैन धर्म संघ संघ के बारे में बहुत अच्छी शिक्षा प्राप्त की!
                </p>
                
                <div className="bg-emerald-50 px-5 py-4 inline-block rounded-2xl border border-emerald-200">
                  <p className="text-3xl font-black text-emerald-700">{quizScore} / {QUIZ_QUESTIONS.length}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600 mt-1">आपका स्कोर</p>
                </div>

                <button 
                  onClick={handleResetQuiz}
                  className="w-full px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
                >
                  <RotateCcw size={16} />
                  <span>पुनः खेलें / Reset Game</span>
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
