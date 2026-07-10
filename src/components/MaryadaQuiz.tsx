import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, CheckCircle2, AlertCircle, RefreshCw, Trophy, ArrowRight, Award, ShieldAlert, Sparkles, HelpCircle as HelpIcon } from 'lucide-react';
const confetti = (...args: any[]) => {};
import { quizMaster } from '../data/quizMaster';

interface QuizQuestion {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'History' | 'Philosophy' | 'Rituals' | 'Organization' | 'Acharyas';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    difficulty: 'easy',
    category: 'Organization',
    question: "तेरापंथ धर्मसंघ में सर्वोच्च आध्यात्मिक अधिनायक और एकमात्र गुरु कौन होते हैं?",
    options: [
      "सर्वोच्च आचार्य देव (Acharya)",
      "मंत्री मुनि श्री (Mantri Muni)",
      "बहुश्रुत परिषद (Scholarly Council)",
      "केंद्रीय चातुर्मास व्यवस्था समिति"
    ],
    correctAnswerIndex: 0,
    explanation: "तेरापंथ एकनिष्ठ मर्यादा केंद्रित है, जहाँ आचार्य देव ही संपूर्ण धर्मसंघ के सर्वोच्च अधिनायक, अद्वितीय शासक और एकमात्र गुरु होते हैं। अन्य सभी पद गुरु के आदेशाधीन कार्य करते हैं।"
  },
  {
    id: 2,
    difficulty: 'medium',
    category: 'Acharyas',
    question: "ज्ञानशाला मूल्य-शिक्षा प्रणाली के केंद्रीय मुख्य प्रभारी कौन हैं, जिनकी ११वें आचार्य श्री महाश्रमण जी के साथ सह-दीक्षा हुई थी?",
    options: [
      "मुनि श्री ज्योतिर्मय कुमार जी स्वामी",
      "मुनि श्री उदित कुमार जी स्वामी (अग्रगण्य)",
      "मुनि श्री दिनेश कुमार जी स्वामी",
      "साध्वी प्रमुखा विश्रुतविभा जी"
    ],
    correctAnswerIndex: 1,
    explanation: "अग्रगण्य मुनि श्री उदित कुमार जी ज्ञानशाला प्रभाग के केंद्रीय मुख्य प्रभारी हैं। संवत् २०३१ (1974) में सरदारशहर में पूज्य आचार्य श्री महाश्रमण जी के साथ ही इनकी सह-दीक्षा हुई थी, तथा वे दीक्षा पर्याय में ज्येष्ठ हैं।"
  },
  {
    id: 3,
    difficulty: 'medium',
    category: 'Organization',
    question: "तेरापंथ धर्मसंघ की ७ शीर्ष विद्वान विभूतियों की सर्वोच्च सलाहकार परिषद को किस नाम से जाना जाता है?",
    options: [
      "अणुव्रत नीति प्रभाग",
      "मर्यादा महोत्सव टाइमलाइन",
      "बहुश्रुत परिषद (Bahushrut Parishad)",
      "ज्ञानशाला शिक्षक आगार"
    ],
    correctAnswerIndex: 2,
    explanation: "बहुश्रुत परिषद (Elite 7 Scholars Panel) धर्मसंघ की एक विशेष सलाहकार इकाई है जिसमें शीर्ष ७ संत-साध्वी शामिल होते हैं जो दार्शनिक और आगमिक व्याख्याओं में आचार्यप्रवर को सहयोग प्रदान करते हैं।"
  },
  {
    id: 4,
    difficulty: 'medium',
    category: 'Organization',
    question: "धर्मसंघ की मर्यादाओं के अनुसार 'अग्रगण्य' (Agraganya) अथवा 'अग्रणी' का प्रशासनिक दायित्व क्या होता है?",
    options: [
      "नवनियुक्त गृहस्थ श्रावक प्रतिनिधि",
      "पूज्य आचार्य देव के निर्देशानुसार किसी विशिष्ट संत-समूह (सिंघा) का स्थानीय नेतृत्व करना",
      "धर्मसंघ का मुख्य वित्तीय लेखाकार",
      "अस्थायी शिविर प्रदाता"
    ],
    correctAnswerIndex: 1,
    explanation: "'अग्रगण्य' (अग्रणी) आचार्य देव द्वारा मनोनीत वे वरिष्ठ संत होते हैं जो किसी विशिष्ट क्षेत्र या समूह (जैसे मुनि उदित कुमार जी का सिंघा) में अनुशासन और साधना का स्थानीय नेतृत्व संभालते हैं।"
  },
  {
    id: 5,
    difficulty: 'hard',
    category: 'Acharyas',
    question: "मुनि श्री ज्योतिर्मय कुमार जी किस ऐतिहासिक संत के दीक्षा-पर्याय और साझा विहार परंपरा से जुड़े हैं?",
    options: [
      "अग्रगण्य मुनि श्री उदित कुमार जी स्वामी",
      "आचार्य भिक्षु",
      "मुनि दिनेश कुमार जी",
      "मुनि महावीर कुमार जी"
    ],
    correctAnswerIndex: 0,
    explanation: "मुनि ज्योतिर्मय कुमार जी तथा अग्रगण्य मुनि श्री उदित कुमार जी दोनों ही स्व. मंत्री मुनि श्री सुमेरमल जी (लाडनूं) स्वामी के पट्ट-शिष्य हैं तथा २०१५ से साझा सिंघा तथा लगातार एक ही चातुर्मास स्थली पर सेवाएं दे रहे हैं।"
  },
  {
    id: 6,
    difficulty: 'easy',
    category: 'Organization',
    question: "व्यवसायी एवं नीति-निर्माता बुद्धिजीवियों को संघ से जोड़ने वाली विशिष्ट संस्था कौन सी है?",
    options: [
      "ABTYP (अखिल भारतीय तेरापंथ युवक परिषद)",
      "TPF (तेरापंथ प्रोफेशनल फोरम / Terapanth Professional Forum)",
      "ABTMM (महिला मंडल)",
      "अणुविभा वैश्विक संस्थान"
    ],
    correctAnswerIndex: 1,
    explanation: "TPF (Terapanth Professional Forum) डॉक्टरों, चार्टर्ड अकाउंटेंट, इंजीनियरों और पेशेवरों को धर्मसंघ के तत्वों और मर्यादाओं के साथ सेवा में नियोजित करने वाली संस्था है।"
  },
  {
    id: 7,
    difficulty: 'easy',
    category: 'History',
    question: "तेरापंथ धर्मसंघ की स्थापना कब हुई थी?",
    options: ["विक्रम संवत 1817", "विक्रम संवत 1800", "विक्रम संवत 1850", "विक्रम संवत 1760"],
    correctAnswerIndex: 0,
    explanation: "तेरापंथ की स्थापना आषाढ़ शुक्ला 15, विक्रम संवत 1817 (1760 CE) को केलवा (राजस्थान) में हुई।"
  },
  {
    id: 8,
    difficulty: 'easy',
    category: 'History',
    question: "तेरापंथ की स्थापना किस स्थान पर हुई?",
    options: ["सिरियारी", "केलवा", "सरदारशहर", "लाडनूं"],
    correctAnswerIndex: 1,
    explanation: "तेरापंथ की स्थापना राजस्थान के केलवा (वर्तमान पाली जिला) में हुई थी।"
  },
  {
    id: 9,
    difficulty: 'easy',
    category: 'Acharyas',
    question: "तेरापंथ के प्रथम आचार्य कौन थे?",
    options: ["आचार्य तुलसी", "आचार्य महाप्रज्ञ", "आचार्य भिक्षु", "आचार्य भारीमल"],
    correctAnswerIndex: 2,
    explanation: "आचार्य श्री भिक्षु जी तेरापंथ धर्मसंघ के संस्थापक एवं प्रथम आचार्य हैं।"
  },
  {
    id: 10,
    difficulty: 'easy',
    category: 'Rituals',
    question: "नवकार मंत्र में कितने नमस्कार हैं?",
    options: ["3", "5", "7", "9"],
    correctAnswerIndex: 1,
    explanation: "नवकार मंत्र में 5 नमस्कार हैं — अरिहंत, सिद्ध, आचार्य, उपाध्याय, और सर्व साधु।"
  },
  {
    id: 11,
    difficulty: 'easy',
    category: 'Philosophy',
    question: "अहिंसा का अर्थ क्या है?",
    options: ["केवल जीव हत्या न करना", "मन-वचन-काय से किसी को पीड़ा न देना", "मांसाहार न करना", "युद्ध न करना"],
    correctAnswerIndex: 1,
    explanation: "अहिंसा का अर्थ है — मन, वचन और काय (शरीर) तीनों से किसी भी जीव को पीड़ा न देना।"
  },
  {
    id: 12,
    difficulty: 'easy',
    category: 'Organization',
    question: "ABTYP का पूरा नाम क्या है?",
    options: ["All Bharat Terapanth Young Parishad", "Akhil Bhartiya Terapanth Yuva Parishad", "Akhil Bharat Terapanth Youth Program", "All Bharat Terapanth Yuva Program"],
    correctAnswerIndex: 1,
    explanation: "ABTYP — अखिल भारतीय तेरापंथ युवा परिषद — तेरापंथ का युवा संगठन है।"
  },
  {
    id: 13,
    difficulty: 'medium',
    category: 'History',
    question: "अहिंसा यात्रा कितने किलोमीटर से अधिक पूरी हो चुकी है?",
    options: ["25,000 km", "40,000 km", "50,000 km", "75,000 km"],
    correctAnswerIndex: 2,
    explanation: "आचार्यश्री महाश्रमण जी की अहिंसा पदयात्रा 50,050 किलोमीटर से अधिक पूरी हो चुकी है।"
  },
  {
    id: 14,
    difficulty: 'medium',
    category: 'Rituals',
    question: "सामायिक की न्यूनतम अवधि कितनी होती है?",
    options: ["15 मिनट", "30 मिनट", "48 मिनट", "1 घंटा"],
    correctAnswerIndex: 2,
    explanation: "सामायिक की मानक अवधि 48 मिनट (एक मुहूर्त) होती है।"
  },
  {
    id: 15,
    difficulty: 'medium',
    category: 'Philosophy',
    question: "अनेकांतवाद का मुख्य सिद्धांत क्या है?",
    options: ["एक ही सत्य होता है", "सत्य के अनेक पहलू होते हैं", "सत्य अज्ञेय है", "सत्य केवल गुरु जानते हैं"],
    correctAnswerIndex: 1,
    explanation: "अनेकांतवाद — जैन दर्शन का मूल सिद्धांत — यह मानता है कि सत्य के अनेक पहलू होते हैं।"
  },
  {
    id: 16,
    difficulty: 'medium',
    category: 'Acharyas',
    question: "आचार्य महाप्रज्ञ जी ने कौन सी ध्यान पद्धति विकसित की?",
    options: ["विपश्यना", "प्रेक्षाध्यान", "राजयोग", "अष्टांग योग"],
    correctAnswerIndex: 1,
    explanation: "आचार्यश्री महाप्रज्ञ जी ने प्रेक्षाध्यान — वैज्ञानिक ध्यान की पद्धति — विकसित की।"
  },
  {
    id: 17,
    difficulty: 'medium',
    category: 'Organization',
    question: "जैन विश्व भारती (JVB) विश्वविद्यालय कहाँ स्थित है?",
    options: ["जयपुर", "लाडनूं", "जोधपुर", "सरदारशहर"],
    correctAnswerIndex: 1,
    explanation: "जैन विश्व भारती विश्वविद्यालय राजस्थान के लाडनूं में स्थित है।"
  },
  {
    id: 18,
    difficulty: 'medium',
    category: 'History',
    question: "मर्यादा महोत्सव कौन से महीने में मनाया जाता है?",
    options: ["कार्तिक", "माघ", "चैत्र", "आषाढ़"],
    correctAnswerIndex: 1,
    explanation: "मर्यादा महोत्सव माघ शुक्ला सप्तमी को प्रतिवर्ष मनाया जाता है।"
  },
  {
    id: 19,
    difficulty: 'medium',
    category: 'Philosophy',
    question: "पंच महाव्रत में कौन सा व्रत नहीं है?",
    options: ["अहिंसा", "सत्य", "ब्रह्मचर्य", "क्षमा"],
    correctAnswerIndex: 3,
    explanation: "पंच महाव्रत हैं — अहिंसा, सत्य, अचौर्य, ब्रह्मचर्य, अपरिग्रह। क्षमा अलग गुण है।"
  },
  {
    id: 20,
    difficulty: 'hard',
    category: 'History',
    question: "तेरापंथ के चतुर्थ आचार्य जयाचार्य की रचना का नाम क्या था?",
    options: ["तेरापंथ दीपिका", "भगवती सूत्र काव्यानुवाद", "नवकार विवेचन", "कर्म सिद्धांत"],
    correctAnswerIndex: 1,
    explanation: "आचार्य जीतमल (जयाचार्य) ने भगवती सूत्र का काव्यानुवाद किया — एक अद्वितीय साहित्यिक कृति।"
  },
  {
    id: 21,
    difficulty: 'hard',
    category: 'Acharyas',
    question: "आचार्य तुलसी जी का जन्म कौन से गांव में हुआ था?",
    options: ["केलवा", "लाडनूं", "गंगाशहर", "सरदारशहर"],
    correctAnswerIndex: 3,
    explanation: "आचार्य श्री तुलसी जी का जन्म राजस्थान के सरदारशहर में हुआ था।"
  },
  {
    id: 22,
    difficulty: 'hard',
    category: 'Philosophy',
    question: "जैन कर्म सिद्धांत में कर्म के कितने मूल प्रकार हैं?",
    options: ["4", "6", "8", "12"],
    correctAnswerIndex: 2,
    explanation: "जैन दर्शन में कर्म के 8 मूल प्रकार हैं — ज्ञानावरणीय, दर्शनावरणीय, वेदनीय, मोहनीय, आयु, नाम, गोत्र, अंतराय।"
  },
  {
    id: 23,
    difficulty: 'hard',
    category: 'Rituals',
    question: "प्रतिक्रमण में 'इरियावही' सूत्र का उद्देश्य क्या है?",
    options: ["नमस्कार करना", "चलते समय हुई हिंसा की क्षमा मांगना", "गुरु वंदना", "उपवास का संकल्प"],
    correctAnswerIndex: 1,
    explanation: "इरियावही सूत्र में दिन में चलते-फिरते अनजाने में हुई जीव हिंसा के लिए क्षमा याचना की जाती है।"
  },
  {
    id: 24,
    difficulty: 'hard',
    category: 'Organization',
    question: "ABTMM का पूरा नाम क्या है?",
    options: ["All Bharat Terapanth Mahila Mandal", "Akhil Bhartiya Terapanth Mahila Mandal", "Akhil Bharat Terapanth Mahila Mission", "All Bhartiya Terapanth Mahila Morcha"],
    correctAnswerIndex: 1,
    explanation: "ABTMM — अखिल भारतीय तेरापंथ महिला मण्डल — तेरापंथ का महिला संगठन है।"
  },
  {
    id: 25,
    difficulty: 'hard',
    category: 'History',
    question: "तेरापंथ स्थापना के समय आचार्य भिक्षु के साथ कितने मूल शिष्य थे?",
    options: ["7", "10", "13", "16"],
    correctAnswerIndex: 2,
    explanation: "तेरापंथ स्थापना के समय आचार्य भिक्षु के साथ 13 मूल शिष्य थे — इसीलिए 'तेरापंथ' (तेरह = 13) नाम पड़ा।"
  },
  {
    id: 26,
    difficulty: 'hard',
    category: 'Philosophy',
    question: "लेश्या सिद्धांत में कितने रंग की लेश्याएं हैं?",
    options: ["3", "4", "6", "8"],
    correctAnswerIndex: 2,
    explanation: "जैन दर्शन में 6 लेश्याएं हैं — कृष्ण, नील, कापोत (अशुभ) और तेजो, पद्म, शुक्ल (शुभ)।"
  },
  {
    id: 27,
    difficulty: 'hard',
    category: 'Acharyas',
    question: "आचार्यश्री महाप्रज्ञ जी ने अपने जीवन में कितने ग्रंथों की रचना की?",
    options: ["200 से अधिक", "500 से अधिक", "700 से अधिक", "900 से अधिक"],
    correctAnswerIndex: 3,
    explanation: "आचार्यश्री महाप्रज्ञ जी ने अपने जीवन में 900 से अधिक ग्रंथों की रचना की — एक अद्वितीय विश्व रिकॉर्ड।"
  },
  {
    id: 28,
    difficulty: 'medium',
    category: 'Rituals',
    question: "चातुर्मास कितने महीनों का होता है?",
    options: ["2 महीने", "3 महीने", "4 महीने", "5 महीने"],
    correctAnswerIndex: 2,
    explanation: "चातुर्मास 4 महीनों का होता है — आषाढ़ शुक्ला 14 से कार्तिक शुक्ला 14 तक।"
  },
  {
    id: 29,
    difficulty: 'medium',
    category: 'Rituals',
    question: "अयम्बिल तप में क्या नियम होता है?",
    options: ["पूर्ण उपवास", "एक समय भोजन बिना नमक-घी के", "केवल फल खाना", "केवल पानी पीना"],
    correctAnswerIndex: 1,
    explanation: "अयम्बिल में एक बार भोजन, वह भी बिना नमक, घी, तेल, दूध, दही के — अत्यंत सादा भोजन।"
  },
  {
    id: 30,
    difficulty: 'hard',
    category: 'History',
    question: "तेरापंथ के किस आचार्य के काल में अणुव्रत आंदोलन प्रारम्भ हुआ?",
    options: ["आचार्य भिक्षु", "आचार्य कालूगणी", "आचार्य तुलसी", "आचार्य महाप्रज्ञ"],
    correctAnswerIndex: 2,
    explanation: "अणुव्रत आंदोलन की स्थापना आचार्यश्री तुलसी जी ने 1949 में की थी।"
  }
];

const MASTER_100_QUESTIONS: QuizQuestion[] = quizMaster.jainQuizDatabase.map(item => {
  let category: 'History' | 'Philosophy' | 'Rituals' | 'Organization' | 'Acharyas' = 'Philosophy';
  if (item.id >= 76 && item.id <= 94) category = 'Acharyas';
  else if (item.id >= 95) category = 'History';
  else if (item.id >= 41 && item.id <= 75) category = 'Rituals';
  else if (item.id >= 31 && item.id <= 40) category = 'Organization';

  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (item.id % 3 === 0) difficulty = 'easy';
  else if (item.id % 3 === 1) difficulty = 'medium';
  else difficulty = 'hard';

  return {
    id: 1000 + item.id,
    difficulty,
    category,
    question: item.question,
    options: item.options,
    correctAnswerIndex: item.correctIndex,
    explanation: item.explanation
  };
});

export default function MaryadaQuiz() {
  const [quizMode, setQuizMode] = useState<'standard' | 'master'>('master');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'History' | 'Philosophy' | 'Rituals' | 'Organization' | 'Acharyas' | 'all'>('all');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answersLog, setAnswersLog] = useState<{ questionId: number; isCorrect: boolean; selected: number }[]>([]);

  const handleModeChange = (mode: 'standard' | 'master') => {
    setQuizMode(mode);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setAnswersLog([]);
  };

  const handleDifficultyChange = (diff: 'easy' | 'medium' | 'hard' | 'all') => {
    setSelectedDifficulty(diff);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setAnswersLog([]);
  };

  const handleCategoryChange = (cat: 'History' | 'Philosophy' | 'Rituals' | 'Organization' | 'Acharyas' | 'all') => {
    setSelectedCategory(cat);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setAnswersLog([]);
  };

  const activeQuestionsPool = quizMode === 'master' ? MASTER_100_QUESTIONS : QUIZ_QUESTIONS;

  const filteredQuestions = activeQuestionsPool.filter(q => {
    const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
    return matchesDiff && matchesCat;
  });

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (submitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || submitted || !currentQuestion) return;
    
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswersLog(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        isCorrect,
        selected: selectedOption
      }
    ]);

    setSubmitted(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);

    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      // Trigger confetti if scored maximum
      if (score + (selectedOption === currentQuestion?.correctAnswerIndex ? 1 : 0) === filteredQuestions.length) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setAnswersLog([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
      
      {/* Filters Header Section */}
      <div className="space-y-4 border-b border-black/5 dark:border-white/5 pb-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/35 text-amber-700 rounded-xl">
              <Award size={18} />
            </div>
            <div>
              <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">
                {quizMode === 'master' ? '100 Q&A Mega Master Challenge' : 'Maryada & Hierarchy Quiz'}
              </h4>
              <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">
                {quizMode === 'master' ? 'तेरापंथ धर्मसंघ एवं तत्व ज्ञान महा-चुनौती' : 'Self-Assessment Learning Hub'}
              </p>
            </div>
          </div>
          {!quizFinished && filteredQuestions.length > 0 && (
            <div className="text-xs font-black bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full text-spiritual border border-black/5">
              प्रश्न: {currentQuestionIndex + 1} / {filteredQuestions.length}
            </div>
          )}
        </div>

        {/* Toggle Quiz Database Mode */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] p-1 rounded-2xl grid grid-cols-2 gap-1 border border-black/5 dark:border-white/5 mb-2">
          <button
            onClick={() => handleModeChange('master')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              quizMode === 'master'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Sparkles size={14} className={quizMode === 'master' ? 'animate-pulse text-yellow-200' : ''} />
            <span>100 प्रश्नोत्तर महा-चुनौती</span>
          </button>
          <button
            onClick={() => handleModeChange('standard')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              quizMode === 'standard'
                ? 'bg-spiritual text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Award size={14} />
            <span>मूल मर्यादा प्रश्नोत्तरी ({QUIZ_QUESTIONS.length})</span>
          </button>
        </div>

        {/* Filter Selectors (Difficulty & Category) */}
        {!quizFinished && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Difficulty Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 block">कठिनाई (Difficulty Level):</span>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { key: 'all', label: 'सभी (All)' },
                  { key: 'easy', label: 'आसान (Easy)' },
                  { key: 'medium', label: 'मध्यम (Medium)' },
                  { key: 'hard', label: 'कठिन (Hard)' }
                ] as const).map(diff => (
                  <button
                    key={diff.key}
                    id={`btn-diff-${diff.key}`}
                    onClick={() => handleDifficultyChange(diff.key)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                      selectedDifficulty === diff.key
                        ? 'bg-spiritual text-white border-spiritual shadow-xs'
                        : 'bg-black/[0.02] text-gray-500 border-black/5 dark:border-white/5 hover:bg-black/5 dark:text-gray-400'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 block">विषय (Category):</span>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { key: 'all', label: 'सभी (All)' },
                  { key: 'History', label: 'इतिहास' },
                  { key: 'Philosophy', label: 'दर्शन' },
                  { key: 'Rituals', label: 'विधि' },
                  { key: 'Organization', label: 'संगठन' },
                  { key: 'Acharyas', label: 'आचार्य' }
                ] as const).map(cat => (
                  <button
                    key={cat.key}
                    id={`btn-cat-${cat.key}`}
                    onClick={() => handleCategoryChange(cat.key)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                      selectedCategory === cat.key
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-black/[0.02] text-gray-500 border-black/5 dark:border-white/5 hover:bg-black/5 dark:text-gray-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {filteredQuestions.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="text-center py-12 space-y-4"
          >
            <ShieldAlert size={40} className="text-amber-550 mx-auto" />
            <div className="space-y-1">
              <h5 className="serif-text font-black text-lg text-gray-900 dark:text-white">कोई प्रश्न उपलब्ध नहीं है</h5>
              <p className="text-xs text-gray-500">चयनित फ़िल्टर के लिए कोई प्रश्न नहीं मिला। कृपया अन्य फ़िल्टर चुनें।</p>
            </div>
          </motion.div>
        ) : !quizFinished ? (
          <motion.div 
            key={`${selectedDifficulty}-${selectedCategory}-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Progress Bar */}
            <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-spiritual transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Header & Text */}
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <span className="capitalize px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-spiritual/10 text-spiritual">
                  {currentQuestion.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600">
                  {currentQuestion.category}
                </span>
              </div>
              <div className="serif-text font-black text-gray-900 dark:text-white text-base sm:text-lg leading-snug pt-1">
                {currentQuestion.question}
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectAnswer = index === currentQuestion.correctAnswerIndex;
                
                let optionStyle = 'border-black/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5';
                
                if (submitted) {
                  if (isCorrectAnswer) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold';
                  } else if (isSelected) {
                    optionStyle = 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400';
                  } else {
                    optionStyle = 'opacity-50 border-black/5';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-spiritual bg-spiritual/10 text-spiritual font-bold';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={submitted}
                    className={`w-full text-left px-5 py-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-4 transition-all focus:outline-none ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {submitted && isCorrectAnswer && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                    {submitted && isSelected && !isCorrectAnswer && <AlertCircle size={16} className="text-red-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanatory Box (Post Setup) */}
            {submitted && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-xs leading-relaxed flex gap-3 ${
                  selectedOption === currentQuestion.correctAnswerIndex 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/5 border border-emerald-500/20 text-emerald-800 dark:text-emerald-350' 
                    : 'bg-red-50/50 dark:bg-red-950/5 border border-red-500/20 text-red-800 dark:text-red-350'
                }`}
              >
                {selectedOption === currentQuestion.correctAnswerIndex ? (
                  <CheckCircle2 size={18} className="text-emerald-550 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert size={18} className="text-red-550 shrink-0 mt-0.5" />
                )}
                <div>
                  <h5 className="font-bold mb-1">
                    {selectedOption === currentQuestion.correctAnswerIndex ? "अति उत्तम! सही उत्तर।" : "चिंतन करें! सीखें:"}
                  </h5>
                  {selectedOption !== currentQuestion.correctAnswerIndex && (
                    <p className="font-bold text-red-700 dark:text-red-400 mb-1.5">
                      सही उत्तर: {currentQuestion.options[currentQuestion.correctAnswerIndex]}
                    </p>
                  )}
                  <p className="font-medium whitespace-pre-line text-xs">{currentQuestion.explanation}</p>
                </div>
              </motion.div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end pt-4 border-t border-black/5 dark:border-white/5">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    selectedOption === null 
                      ? 'bg-black/5 text-gray-400 cursor-not-allowed border border-black/5' 
                      : 'bg-spiritual text-white hover:bg-spiritual/95 shadow-md shadow-spiritual/15'
                  }`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3.5 bg-spiritual text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-spiritual/95 shadow-md"
                >
                  {currentQuestionIndex === filteredQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="finish-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 mx-auto animate-bounce">
              <Trophy size={36} />
            </div>

            <div className="space-y-2">
              <h4 className="serif-text font-black text-2xl text-gray-900 dark:text-white">अध्ययन परिणाम (Assessment Result)</h4>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                मर्यादा ज्ञान स्तर: {score === filteredQuestions.length ? 'ज्ञान सिंधु (Fully Perfect)' : score >= filteredQuestions.length / 2 ? 'सजग शिक्षार्थी (Sufficient Knowledge)' : 'अभ्यासी श्रावक (Needs Study)'}
              </p>
            </div>

            {/* Score Wheel */}
            <div className="w-32 h-32 rounded-full border-4 border-black/5 dark:border-white/5 flex flex-col items-center justify-center mx-auto relative">
              <div 
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-spiritual border-r-spiritual transform -rotate-45"
              />
              <span className="text-3xl font-black text-spiritual">{score}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Score / {filteredQuestions.length}</span>
            </div>

            {/* Final feedback text */}
            <p className="text-xs text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed font-semibold">
              {score === filteredQuestions.length 
                ? "अतीव सुंदर! आपको तेरापंथ संघ व्यवस्था, पदानुक्रम और मर्यादाओं का पूर्ण प्रामाणिक ज्ञान है। आप RAG बेस को शुद्ध रखने में सहायक हैं।" 
                : "शानदार प्रयास! मर्यादाओं का सही ज्ञान जीवन की धार्मिक दिशा को सुदृढ़ करता है। पुनः अभ्यास करके १००% सफलता प्राप्त करें।"}
            </p>

            <button 
              onClick={handleReset}
              className="px-6 py-3.5 bg-spiritual text-white rounded-2xl font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:bg-spiritual/95 shadow-md shadow-spiritual/15"
            >
              <RefreshCw size={14} />
              Re-attempt Quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
