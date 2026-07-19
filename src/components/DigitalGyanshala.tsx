import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gyanshalaData from '../data/gyanshalaUnifiedDataset.json';
import { 
  BookOpen, 
  ChevronRight, 
  Heart, 
  Feather, 
  Search, 
  Award, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  BookOpenCheck,
  Flame,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react';

interface GyanshalaLevel {
  id: string;
  name: string;
  ageBracket: string;
  description: string;
  lessons: string[];
}

interface JainElement {
  name: string;
  hindiName: string;
  definition: string;
}

interface MoralStory {
  id: string;
  title: string;
  summary: string;
  moral: string;
}

interface CensusRegion {
  state: string;
  city: string;
  centers: number;
  teachers: number;
  students: number;
  coordinator: string;
  phone: string;
  email: string;
  localKendras: string[];
}

interface TrainerCourse {
  tierName: string;
  hindiTier: string;
  eligibility: string;
  duration: string;
  focus: string[];
  examPattern: string;
}

const GYANSHALA_LEVELS: GyanshalaLevel[] = [
  {
    id: "l1",
    name: "Pravesh (प्रवेश) - Level 1",
    ageBracket: "Age: 5 - 8 Years",
    description: "प्रारंभिक नैतिक संस्कार एवं मौलिक जैन तत्वज्ञान।",
    lessons: ["महामंत्र नवकार एवं अर्थ", "पंच परमेष्ठी परिचय", "हिंसा व झूठ से विरति", "बड़ों का सम्मान एवं विनय"]
  },
  {
    id: "l2",
    name: "Prathama (प्रथमा) - Level 2",
    ageBracket: "Age: 9 - 12 Years",
    description: "मध्यम स्तर जीवन मूल्य एवं अणुव्रत सिद्धांतों का अनुशीलन।",
    lessons: ["जीवाजीव (२ तत्व) भेद", "अहिंसा के प्रायोगिक प्रयोग", "समता और सामायिक विधि", "शाकाहार का वैज्ञानिक महत्व"]
  },
  {
    id: "l3",
    name: "Uttama (उत्तमा) - Level 3",
    ageBracket: "Age: 13 - 18 Years",
    description: "श्रीमद दशवैकालिक सूत्र के अंश एवं जटिल कर्म सिद्धांत।",
    lessons: ["दशवैकालिक सूत्र गाथा संवाद", "९ तत्वों का दार्शनिक स्वरूप", "कषाय मुक्ति (क्रोध-मान-माया-लोभ)", "अनेकांतवाद एवं सहिष्णुता"]
  }
];

const JAIN_ELEMENTS: JainElement[] = [
  { name: "Jiva", hindiName: "जीव (Soul)", definition: "जिसमें ज्ञान, दर्शन और चेतना हो; वह सुख-दुःख का अनुभव करता है।" },
  { name: "Ajiva", hindiName: "अजीव (Non-Soul)", definition: "जो सुख-दुःख का अनुभव न करे, जिसमें चेतना शून्य हो (जैसे पुद्गल, आकाश)।" },
  { name: "Punya", hindiName: "पुण्य (Merit)", definition: "शुभ कर्म जिससे सुखकारी संयोगों की प्राप्ति होती है।" },
  { name: "Papa", hindiName: "पाप (Demerit)", definition: "अशुभ कर्म जिससे कष्ट, शोक और प्रतिकूलता का उदय होता है।" },
  { name: "Asrava", hindiName: "आस्रव (Inflow)", definition: "कर्मपुद्गलों का आत्मा की ओर प्रवाहित होना (मन, वचन, काया के योग से)।" },
  { name: "Bandha", hindiName: "बन्ध (Bondage)", definition: "प्रवाहित हुए कर्मों का आत्मा के प्रदेशों के साथ चिपक जाना।" },
  { name: "Samvara", hindiName: "संवर (Stoppage)", definition: "कर्मों के प्रवाह को रोकना (व्रत, सावधानी और सतर्कता द्वारा)।" },
  { name: "Nirjara", hindiName: "निर्जरा (Shedding)", definition: "आत्मा से बंधे हुए कर्मों की तप व साधना द्वारा क्रमिक शुद्धि।" },
  { name: "Moksha", hindiName: "मोक्ष (Liberation)", definition: "समस्त कर्मों के पूर्ण क्षय से आत्मा का सिद्धावस्था में अनन्त आनंद पा लेना।" }
];

const MORAL_STORIES: MoralStory[] = [
  {
    id: "s1",
    title: "आचार्य भिक्षु की अटूट सत्यनिष्ठा",
    summary: "जब भिक्षु स्वामी ने सत्य का पथ चुना, तब उन्हें भयंकर जन-आक्रोश सहना पड़ा। कइयों ने पानी व अन्न देने से मना कर दिया। उन्होंने कहा, 'संसार में पानी के बिना काया सूख सकती है, पर सत्य के बिना आत्मा सूख जाती है।' भिक्षु स्वामी ने एक कुएँ के नीचे की गुफ़ा (पातलिया) में एकांत साधना करके सत्य की मर्यादा स्थापित की।",
    moral: "सच्चे धार्मिक जीवन में कठिन परिस्थितियों से समझौता न करके मर्यादा और सत्य सिद्धांत पर अडिग रहना ही वास्तविक तप है।"
  },
  {
    id: "s2",
    title: "अंधे हाथी और अनेकांत दर्शन",
    summary: "चार दृष्टिबाधित पुरुषों ने एक हाथी को छुआ। जिसने कान पकड़ा उसने कहा हाथी सूप जैसा है; जिसने पैर छुआ उसने कहा हाथी खम्भे जैसा है। सब अपने आंशिक सत्य में लड़ने लगे। एक बुद्धिमान साधु ने समझाया कि तुम सब आंशिक रूप से सही हो, पर पूर्ण सत्य को समझने के लिए सभी पक्षों (अनेकांत) को स्वीकारना होगा।",
    moral: "दूसरों के मतों को भी सम्मान देना और अपनी ही बात को हठपूर्वक सही न मानना ही विचारों की अनूठी अहिंसा है।"
  },
  {
    id: "s3",
    title: "मुनिश्री का संवेग (क्षमा की विजय)",
    summary: "एक क्रोधी व्यक्ति ने मुनिश्री को मार्ग में बहुत अपशब्द कहे। मुनिश्री ने मौन रहकर अपनी आत्म-चेतना में केवल मंगलकामना की। जब वह थक गया, तो मुनिश्री ने विनीत भाव से पूछा, 'भाई! क्या आपका क्रोध शांत हुआ? यदि मेरी काया से आपको कष्ट हुआ हो, तो क्षमा याचना करता हूँ।' यह सुनकर उसका हृदय परिवर्तित हो गया।",
    moral: "क्रोध को क्रोध से नहीं, अपितु केवल उत्कृष्ट क्षमा और समता भाव से ही जीता जा सकता है।"
  }
];

const CENSUS_REGIONS: CensusRegion[] = [
  {
    state: "Karnataka (कर्नाटक)",
    city: "Bangalore (बैंगलोर)",
    centers: 32,
    teachers: 180,
    students: 1000,
    coordinator: "श्री सुखराज जी बाफना",
    phone: "+91 94480 12345",
    email: "gyanshala.blr@terapanth.org",
    localKendras: [
      "Gandhinagar Kendra (गांधीनगर)",
      "Rajajinagar Kendra (राजाजीनगर)", 
      "Jayanagar Kendra (जयानगर)", 
      "Vijayanagar Kendra (विजयनगर)", 
      "Banashankari Kendra (बनाशंकरी)",
      "Yeshwantpur Kendra (यशवंतपुर)",
      "Malleshwaram Kendra (मल्लेश्वरम)"
    ]
  },
  {
    state: "Gujarat (गुजरात)",
    city: "Surat (सूरत)",
    centers: 45,
    teachers: 310,
    students: 1850,
    coordinator: "श्री महेंद्र जी धाकड़",
    phone: "+91 98251 67890",
    email: "gyanshala.srt@terapanth.org",
    localKendras: [
      "Adajan Kendra (अडाजन)", 
      "Varachha Kendra (वराछा)", 
      "City Light Kendra (सिटी लाइट)", 
      "Bhatar Kendra (भटार)",
      "Vesu Kendra (वेसू)",
      "Nanpura Kendra (नानपुरा)"
    ]
  },
  {
    state: "Rajasthan (राजस्थान)",
    city: "Sardarshahr (सरदारशहर)",
    centers: 24,
    teachers: 140,
    students: 720,
    coordinator: "श्री शांतिलाल जी दुगड़",
    phone: "+91 94142 54321",
    email: "gyanshala.sds@terapanth.org",
    localKendras: [
      "Ahimsagram Kendra (अहिंसाग्राम)", 
      "Tulsipath Kendra (तुलसीपथ)", 
      "Bhikshu Niketan (भिक्षु निकेतन)",
      "Rampura Bazar Kendra (रामपुरा बाजार)"
    ]
  },
  {
    state: "Maharashtra (महाराष्ट्र)",
    city: "Mumbai (मुंबई)",
    centers: 58,
    teachers: 420,
    students: 2300,
    coordinator: "श्री प्रकाश जी डागलिया",
    phone: "+91 98200 98765",
    email: "gyanshala.mum@terapanth.org",
    localKendras: [
      "Ghatkopar Kendra (घाटकोपर)", 
      "Malad Kendra (मलाड)", 
      "Dadar Kendra (दादर)", 
      "Thane Kendra (ठाणे)", 
      "Borivali Kendra (बोरीवली)",
      "Chembur Kendra (चेम्बूर)"
    ]
  },
  {
    state: "Delhi (दिल्ली NCR)",
    city: "Delhi (दिल्ली)",
    centers: 19,
    teachers: 125,
    students: 610,
    coordinator: "श्री ललित जी जैन",
    phone: "+91 98110 54321",
    email: "gyanshala.del@terapanth.org",
    localKendras: [
      "Rohini Kendra (रोहिणी)", 
      "Preet Vihar Kendra (प्रीत विहार)", 
      "South Ext Kendra (साउथ एक्स)",
      "Janakpuri Kendra (जनकपुरी)"
    ]
  }
];

const TRAINER_COURSES: TrainerCourse[] = [
  {
    tierName: "Vigya (विज्ञ)",
    hindiTier: "विज्ञ प्रशिक्षण श्रेणी",
    eligibility: "न्यूनतम आयु १८ वर्ष; ज्ञानशाला की मूल अवधारणा और मर्यादा में गहरी आस्था।",
    duration: "१ वर्ष (वार्षिक परीक्षा)",
    focus: [
      "जैन दर्शन प्रवेशिका (मूल जैन तत्व)",
      "सामान्य बोध कथाएँ व गाथा उच्चारण",
      "बाल मनोविज्ञान (Child Psychology) के बुनियादी आधार",
      "अणुव्रत जीवन शैली एवं बच्चों में चरित्र निर्माण"
    ],
    examPattern: "१०० अंक लिखित केंद्रीय परीक्षा (महासभा संचालित) + २५ अंक प्रायोगिक अध्यापन कौशल मूल्यांकन।"
  },
  {
    tierName: "Visharad (विशारद)",
    hindiTier: "विशारद मध्यम श्रेणी",
    eligibility: "विज्ञ उत्तीर्ण होने के साथ कम से कम २ वर्ष का ज्ञानशाला में सतत शिक्षण अनुभव।",
    duration: "१ वर्ष व्यावहारिक एवं सघन सत्र",
    focus: [
      "जीवाजीव तत्वों का प्रगत भेद विवेचन",
      "संवर, निर्जरा एवं तप सिद्धांतों की संचेतना",
      "संस्कृत गाथाओं का शुद्ध उच्चारण एवं विधि",
      "सक्रिय प्रश्नोत्तरी निर्माण व शिक्षण सहायक सामग्री निर्माण"
    ],
    examPattern: "१५० अंक (२ विस्तृत प्रश्न पत्र) लिखित परीक्षा + केंद्रीय प्रांतीय साक्षात्कार + प्रायोगिक अध्यापन प्रदर्शन।"
  },
  {
    tierName: "Snatak (स्नातक)",
    hindiTier: "स्नातक उच्च आचार्य श्रेणी",
    eligibility: "विशारद उत्तीर्ण, उत्तम चरित्र, मुनिश्री/महासभा द्वारा अनुमोदित मर्यादा पत्रक अनुपालक शिक्षिका।",
    duration: "२ वर्ष शोध, विशिष्ट स्वाध्याय एवं निर्देशन",
    focus: [
      "श्रीमद दशवैकालिक सूत्र की गाथाओं का विस्तृत दार्शनिक विवेचन",
      "जैन तत्वज्ञान प्रगत खंड (अनेकांतवाद एवं नयादिका दर्शन)",
      "मर्यादा पत्रक नियम संहिता एवं प्रशासनिक संचालन",
      "शिक्षिका प्रशिक्षण सेमिनार एवं राष्ट्रीय नेतृत्व तकनीक"
    ],
    examPattern: "२०0 अंक लिखित प्रांतीय परीक्षा + ३० पन्नों की थीसिस (लिखित प्रबंध) + केंद्रीय साक्षात्कार बोर्ड मूल्यांकन।"
  }
];

const NAVKAR_LINES = [
  { text: "णमो अरिहंताणं", hindi: "अरिहंतों को नमस्कार हो" },
  { text: "णमो सिद्धाणं", hindi: "सिद्धों को नमस्कार हो" },
  { text: "णमो आयरियाणं", hindi: "आचार्यों को नमस्कार हो" },
  { text: "णमो उवज्झायाणं", hindi: "उपाध्यायों को नमस्कार हो" },
  { text: "णमो लोए सव्वसाहूणं", hindi: "लोक के सभी साधुओं को नमस्कार हो" },
  { text: "एसोपंचणमुक्कारो, सव्वपावप्पणासणो", hindi: "यह पांच नमस्कार सभी पापों का नाश करने वाला है" },
  { text: "मंगला ण च सव्वेसिं, पढ़मं हवई मंगलं", hindi: "और सभी मंगलों में यह पहला मंगल है" }
];

const KIDS_QUIZZES = [
  {
    question: "ज्ञानशाला का मुख्य ध्येय वाक्य (Motto) क्या है?",
    answer: "\"घर घर जागे सद्संस्कार, ज्ञानशाला का यह उपहार\"",
    hint: "यह बच्चों में सदाचार और संस्कारों का प्रसार करता है।"
  },
  {
    question: "णमो अरिहंताणं पद में किन्हें नमस्कार किया गया है?",
    answer: "चरम चैतन्य को प्राप्त अरिहंत देवों को, जिन्होंने राग-द्वेष और कषायों को पूर्णतः जीत लिया है।",
    hint: "पंच परमेष्ठी में सर्वोच्च पद।"
  },
  {
    question: "अहिंसा का व्यवहारिक जीवन में क्या अर्थ है?",
    answer: "मन, वचन और शरीर से किसी भी प्राणी को दुःख या कष्ट न पहुँचाना, तथा सबकी रक्षा करना।",
    hint: "जैन धर्म का परम सिद्धांत।"
  },
  {
    question: "नौ तत्वों में 'संवर' तत्व का सरल अर्थ क्या है?",
    answer: "आत्मा में आने वाले कर्मों को रोकना। जैसे दरवाजे को बंद कर धूल को रोका जाता है, वैसे तप और व्रत से कर्मों को रोकना ही संवर है।",
    hint: "कर्मों के प्रवाह को रोकना।"
  }
];

export default function DigitalGyanshala() {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'elements' | 'stories' | 'stats' | 'trainers' | 'kids' | 'census'>('syllabus');
  const [selectedLevel, setSelectedLevel] = useState<GyanshalaLevel>(GYANSHALA_LEVELS[0]);
  const [elementIndex, setElementIndex] = useState(0);
  const [activeStory, setActiveStory] = useState<MoralStory>(MORAL_STORIES[0]);
  const [statsView, setStatsView] = useState<'NATIONAL' | 'REGIONAL'>('NATIONAL');

  // Trainers Hub tab states
  const [selectedTrainerCourse, setSelectedTrainerCourse] = useState<TrainerCourse>(TRAINER_COURSES[0]);

  // Census Tracker states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState<CensusRegion>(CENSUS_REGIONS[0]);
  const [coordinatorSent, setCoordinatorSent] = useState(false);
  const [coordinatorForm, setCoordinatorForm] = useState({ name: '', phone: '', note: '' });

  // Kids Zone states
  const [isMantraPlaying, setIsMantraPlaying] = useState(false);
  const [activeMantraLine, setActiveMantraLine] = useState(-1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [malaCount, setMalaCount] = useState(0);
  const [unlockedQuizIndices, setUnlockedQuizIndices] = useState<number[]>([]);
  const [quizCategoryFilter, setQuizCategoryFilter] = useState<string>('All');
  const [quizLevelFilter, setQuizLevelFilter] = useState<string>('All');
  const [quizSearchQuery, setQuizSearchQuery] = useState<string>('');
  const [quizVisibleCount, setQuizVisibleCount] = useState<number>(6);
  const mantraIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio System (Real Web Audio API)
  const playChime = (freq: number, duration: number) => {
    if (isAudioMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Graceful ignore
    }
  };

  // Navkar Chanting follow-along timer
  useEffect(() => {
    if (isMantraPlaying) {
      setActiveMantraLine(0);
      playChime(440, 0.4); // A4 Note

      mantraIntervalRef.current = setInterval(() => {
        setActiveMantraLine((prev) => {
          const next = prev + 1;
          if (next >= NAVKAR_LINES.length) {
            playChime(523.25, 0.8); // C5 Finish note
            setIsMantraPlaying(false);
            return -1;
          }
          // Dynamic tone per line
          const tones = [440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99];
          playChime(tones[next] || 440, 0.4);
          return next;
        });
      }, 2500);
    } else {
      if (mantraIntervalRef.current) {
        clearInterval(mantraIntervalRef.current);
      }
      setActiveMantraLine(-1);
    }

    return () => {
      if (mantraIntervalRef.current) {
        clearInterval(mantraIntervalRef.current);
      }
    };
  }, [isMantraPlaying, isAudioMuted]);

  // Bead Mala Increment
  const handleMalaIncrement = () => {
    setMalaCount((prev) => {
      const next = prev + 1;
      // Synthesize note
      if (next % 108 === 0) {
        // Complete Mala tone chord
        playChime(880, 0.9);
      } else {
        // Simple click note
        playChime(659.25, 0.08); // E5 micro click
      }
      return next;
    });
  };

  // Reset Bead Mala
  const handleMalaReset = () => {
    setMalaCount(0);
    playChime(329.63, 0.3); // E4 slide down reset sound
  };

  // Toggle quiz cards
  const toggleQuizCard = (idx: number) => {
    playChime(587.33, 0.06);
    if (unlockedQuizIndices.includes(idx)) {
      setUnlockedQuizIndices(unlockedQuizIndices.filter((i) => i !== idx));
    } else {
      setUnlockedQuizIndices([...unlockedQuizIndices, idx]);
    }
  };

  // Mock coordinator form submit
  const handleCoordinatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinatorForm.name || !coordinatorForm.phone) return;
    playChime(880, 0.25);
    setCoordinatorSent(true);
    setTimeout(() => {
      setCoordinatorSent(false);
      setCoordinatorForm({ name: '', phone: '', note: '' });
    }, 4000);
  };

  // Filtered census directories based on search query and state filter
  const filteredRegions = CENSUS_REGIONS.filter((region) => {
    const matchesSearch = 
      region.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.coordinator.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedStateFilter === 'All') return matchesSearch;
    return region.state.includes(selectedStateFilter) && matchesSearch;
  });

  const masterGyanshalaDatabase = {
    motto: "घर घर जागे सद्संस्कार, ज्ञानशाला का यह उपहार",
    centralHeadMonk: "अग्रगण्य मुनि श्री उदित कुमार जी स्वामी",
    nationalCore: {
      establishedYear: "1992 (व्यवस्थित महासभा संचालन)",
      rootSeeded: "1965 (९वें आचार्य श्री तुलसी द्वारा बीजारोपण)",
      totalCenters: 571,
      totalGyanarthis: 18098,
      totalPrashikshaks: 4038,
      cooperativeWings: ["तेरापंथ युवक परिषद (TYP)", "तेरापंथ महिला मंडल (TMM)"],
      trainingTiers: ["विज्ञ (Vigya)", "विशारद (Visharad)", "स्नातक (Snatak)"],
      evaluationMethod: "महासभा द्वारा आयोजित प्रतिवर्ष लिखित परीक्षाएं एवं अखिल भारतीय पुरस्कार वरीयता प्रणाली"
    },
    regionalLocal: {
      statesCovered: 23,
      totalRegions: 470,
      totalRegionalGyanarthis: 17872,
      totalRegionalPrashikshikas: 2978,
      aspiringStudents: 7932,
      bangaloreCaseStudy2021: {
        areaWiseKendras: 32,
        teachersCount: 180,
        studentsCount: 1000,
        historicalMilestone: "संवत् २०७४ (सन् २०१७) में ऐतिहासिक 'रजत जयंती वर्ष' (Rajat Jayanti Varsh) का सफल आयोजन"
      },
      nationalLeadership: {
        rashtriyaSanyojak: "श्री सोहनराज जी चोपड़ा",
        nationalTrainers: ["श्री मालमचंद जी नोलखा", "श्री निर्मल जी नोलखा"]
      }
    }
  };

  const n = masterGyanshalaDatabase.nationalCore;
  const r = masterGyanshalaDatabase.regionalLocal;

  // Extract all states names for filter
  const uniqueStates = ['All', 'Karnataka', 'Gujarat', 'Rajasthan', 'Delhi', 'Maharashtra'];

  return (
    <div id="gyanshala-custom-root" className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 sm:p-8 border border-black/5 dark:border-white/5 space-y-6 shadow-sm overflow-hidden">
      
      {/* Dynamic Header Block with Subtitle */}
      <div className="bg-gradient-to-br from-spiritual/10 to-orange-500/5 border border-spiritual/20 p-6 rounded-[2rem] flex items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-spiritual/5 rounded-full translate-x-10 translate-y-10" />
        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-spiritual shadow-sm shrink-0">
          <BookOpenCheck size={24} />
        </div>
        <div className="space-y-1">
          <span className="text-[9px] font-black text-spiritual uppercase tracking-widest block">Gyanshala Central Portal & Interactive Hub</span>
          <h4 className="serif-text font-black text-gray-900 dark:text-white text-lg mt-0.5">डिजिटल ज्ञानशाला महासंघ</h4>
          <p className="text-[11px] leading-relaxed text-gray-550 dark:text-gray-350">
            महासभा और प्रांतीय ज्ञानशाला परिषदों का आधिकारिक इंटरैक्टिव सूचना केंद्र। यह प्रभाग **अग्रगण्य मुनि श्री उदित कुमार जी स्वामी** (केंद्रीय मुख्य प्रभारी) के पावन शुभाशीष व कुशल दिशा-निर्देशन में संचालित है।
          </p>
        </div>
      </div>

      {/* Persistent Nav Menu Tabs with Horizontal Scrolling */}
      <div className="flex border-b border-black/5 dark:border-white/5 pb-1 gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'syllabus', label: '📖 पाठ्यक्रम (Syllabus)' },
          { id: 'elements', label: '📿 ९ तत्व (9 Tattvas)' },
          { id: 'kids', label: '🧒 स्वाध्याय ज़ोन (Kids Zone)' },
          { id: 'census', label: '📊 जनगणना (Kendra Census)' },
          { id: 'trainers', label: '🎓 शिक्षक प्रभाग (Teachers)' },
          { id: 'stories', label: '✍️ बोध कथाएँ (Moral Stories)' },
          { id: 'stats', label: '📈 महासभा आंकड़े (National Stats)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playChime(659.25, 0.05);
              setActiveTab(tab.id as any);
            }}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 border border-transparent cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-spiritual text-white font-black shadow-md shadow-spiritual/15' 
                : 'bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-black/10 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Switchboard Panel with Smooth Transitions */}
      <AnimatePresence mode="wait">
        
        {/* Tab 1: Syllabus Core */}
        {activeTab === 'syllabus' && (
          <motion.div
            key="syllabus"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Level select list */}
              <div className="flex sm:flex-col gap-2 shrink-0 sm:w-1/3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {GYANSHALA_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => {
                      playChime(587.33, 0.05);
                      setSelectedLevel(level);
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border text-xs font-bold transition-all shrink-0 sm:shrink cursor-pointer ${
                      selectedLevel.id === level.id
                        ? 'border-spiritual bg-spiritual/5 text-spiritual'
                        : 'border-black/5 bg-gray-50 dark:bg-black/20 hover:bg-black/5 text-gray-500'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{level.name.split('-')[0]}</div>
                    <div className="text-[10px] opacity-75 font-medium mt-0.5">{level.ageBracket}</div>
                  </button>
                ))}
              </div>

              {/* Course Detail Panel */}
              <div className="flex-1 bg-black/5 dark:bg-white/5 p-6 rounded-3xl space-y-4">
                <div>
                  <span className="text-[9px] font-black text-spiritual uppercase tracking-widest">{selectedLevel.ageBracket}</span>
                  <h4 className="serif-text font-black text-gray-900 dark:text-white text-lg leading-snug mt-1">{selectedLevel.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic mt-1">{selectedLevel.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-2">Core Syllabus Lessons / ज्ञानशाला विषय-वस्तु</span>
                  {selectedLevel.lessons.map((lesson, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-black/5 text-xs font-semibold shadow-sm">
                      <span className="w-5 h-5 rounded-full bg-spiritual/15 text-spiritual flex items-center justify-center text-[10px] font-black">
                        {index + 1}
                      </span>
                      <span className="text-gray-805 dark:text-gray-200">{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Jain 9 Elements */}
        {activeTab === 'elements' && (
          <motion.div
            key="elements"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="bg-spiritual/5 border border-spiritual/10 p-4 rounded-2xl">
              <p className="text-[11px] leading-relaxed text-spiritual font-black italic">
                जैन संचेतना और तत्व मीमांसा में ९ तत्व (9 Tattvas) ही सम्यक ज्ञान की सर्वोच्च कसौटी हैं। इन मूलभूत सिद्धांतों को आत्मसात करके ही श्रावक संवर और निर्जरा को प्राप्त कर सकता है।
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {JAIN_ELEMENTS.map((elem, idx) => {
                const isActive = elementIndex === idx;
                return (
                  <button
                    key={elem.name}
                    onClick={() => {
                      playChime(493.88 + (idx * 20), 0.06);
                      setElementIndex(idx);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all focus:outline-none flex flex-col justify-between h-28 cursor-pointer ${
                      isActive 
                        ? 'border-spiritual bg-spiritual/15 text-spiritual ring-1 ring-spiritual' 
                        : 'border-black/5 bg-white dark:bg-gray-805 hover:border-black/10'
                    }`}
                  >
                    <span className="text-[9px] font-black opacity-60">ELEMENT 0{idx + 1}</span>
                    <h5 className="serif-text font-black text-xs sm:text-sm text-gray-950 dark:text-gray-100">{elem.hindiName}</h5>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{elem.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Element Expanded Info card */}
            <motion.div 
              key={elementIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 space-y-2 mt-4"
            >
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-black/5 inline-flex text-[10px] font-black uppercase text-spiritual tracking-widest">
                Tattva Focus: {JAIN_ELEMENTS[elementIndex].name}
              </div>
              <h4 className="serif-text font-black text-gray-900 dark:text-white text-base mt-2">{JAIN_ELEMENTS[elementIndex].hindiName} की वैज्ञानिक व्याख्या</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-750 dark:text-gray-300 font-semibold pt-1">
                {JAIN_ELEMENTS[elementIndex].definition}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Tab 3: Kids Swadhyay Zone (NEW DESIGN) */}
        {activeTab === 'kids' && (
          <motion.div
            key="kids"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Kids Welcome Slogan Banner */}
            <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 p-5 rounded-3xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">"घर-घर जागे सद्संस्कार"</span>
                <h4 className="serif-text font-black text-amber-800 dark:text-amber-300 text-lg">बल स्वाध्याय एवं संस्कार वाटिका (Kids Hub)</h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug font-medium">
                  ज्ञानशाला के १८,०९८ से अधिक सक्रिय बच्चों के लिए आकर्षक खेल-खेल में जैन स्वाध्याय और नैतिक निर्माण केंद्र।
                </p>
              </div>
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shrink-0 animate-pulse">
                <Sparkles size={20} />
              </div>
            </div>

            {/* Sub-grid of activities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Navkar Mantra follow-along audio chimer */}
              <div className="bg-white dark:bg-gray-800 border border-black/5 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-spiritual/10 text-spiritual rounded-lg text-xs font-black">PAD 1</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">कंठस्थ नवकार अनुशीलन</span>
                  </div>
                  {/* Mute button */}
                  <button 
                    onClick={() => {
                      playChime(440, 0.05);
                      setIsAudioMuted(!isAudioMuted);
                    }}
                    className="p-1 text-gray-400 hover:text-spiritual hover:bg-black/5 rounded-lg transition-all"
                    title={isAudioMuted ? "Unmute sound" : "Mute audio"}
                  >
                    {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>

                <div className="space-y-1.5 py-4">
                  {NAVKAR_LINES.map((line, idx) => (
                    <motion.div 
                      key={idx}
                      animate={{ 
                        scale: activeMantraLine === idx ? 1.02 : 1,
                        opacity: activeMantraLine === idx ? 1 : (activeMantraLine === -1 ? 0.9 : 0.4)
                      }}
                      className={`p-2 rounded-xl transition-all border text-center ${
                        activeMantraLine === idx
                          ? 'bg-amber-500/10 border-amber-500 font-black text-amber-950 dark:text-amber-250 shadow-sm'
                          : 'border-transparent text-gray-700 dark:text-gray-300 font-semibold'
                      }`}
                    >
                      <h5 className="text-xs sm:text-sm">{line.text}</h5>
                      {activeMantraLine === idx && (
                        <span className="text-[9px] text-amber-600 dark:text-amber-400 block font-bold leading-tight mt-0.5">
                          {line.hindi}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsMantraPlaying(!isMantraPlaying)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                      isMantraPlaying 
                        ? 'bg-red-500 text-white hover:bg-red-650'
                        : 'bg-spiritual text-white hover:bg-opacity-90'
                    }`}
                  >
                    {isMantraPlaying ? '🛑 चैंटिंग रोकें (Stop Chanting)' : '🔊 स्वर पाठ शुरू (Auto Chant)'}
                  </button>
                </div>
              </div>

              {/* Box 2: Interactive Japa Mala Core */}
              <div className="bg-white dark:bg-gray-800 border border-black/5 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">PAD 2</span>
                  <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">डिजिटल जाप माला उपवन</h4>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    अपने मन को एकाग्र करके प्रतिदिन जप करें। १०८ मनके पूर्ण होने पर चक्र स्वत: पूर्ण हो जाता है।
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-6 bg-black/5 dark:bg-white/5 rounded-2xl relative border border-dashed border-black/10">
                  {/* Ring display simulating bead */}
                  <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-emerald-500/30">
                    {/* Pulsing ring inside */}
                    <motion.div 
                      key={malaCount}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full flex flex-col items-center justify-center"
                    >
                      <span className="text-[9px] font-black text-emerald-600 block leading-tight uppercase tracking-widest">मनका जाप</span>
                      <span className="text-3xl font-black text-emerald-950 dark:text-emerald-250 leading-none mt-1">
                        {malaCount}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 mt-0.5">/ 108</span>
                    </motion.div>
                  </div>

                  {/* Complete Mala Counter */}
                  <div className="mt-4 text-xs font-black text-emerald-800 dark:text-emerald-400">
                    🏆 पूर्ण की गई मालाएँ: {Math.floor(malaCount / 108)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleMalaIncrement}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    ☘️ मनका घुमाएं (Bead Count)
                  </button>
                  <button
                    onClick={handleMalaReset}
                    className="py-3 px-4 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-gray-500 dark:text-gray-300 rounded-xl text-xs font-black transition-all cursor-pointer"
                    title="रिसेट करें"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

            </div>

            {/* Box 3: Kids Quiz Flashcards Grid */}
            <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-gray-900/40 dark:to-gray-900/20 p-6 rounded-3xl border border-amber-500/10 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black">PAD 3</span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">बाल तत्वज्ञान क्विज़ चुनौती (Interactive Flashcards)</span>
                </div>
                {gyanshalaData?.gyanshala_unified_knowledge_base?.verified_q_and_a && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 px-2.5 py-1 rounded-full">
                    {gyanshalaData.gyanshala_unified_knowledge_base.verified_q_and_a.filter((item: any) => {
                      const matchesCategory = quizCategoryFilter === 'All' || item.category === quizCategoryFilter;
                      const matchesLevel = quizLevelFilter === 'All' || item.level === quizLevelFilter;
                      const query = quizSearchQuery.toLowerCase();
                      const matchesSearch = 
                        item.question_hi.toLowerCase().includes(query) ||
                        item.question_en.toLowerCase().includes(query) ||
                        item.answer_hi.toLowerCase().includes(query) ||
                        item.answer_en.toLowerCase().includes(query) ||
                        item.chapter.toLowerCase().includes(query);
                      return matchesCategory && matchesLevel && matchesSearch;
                    }).length} प्रश्न उपलब्ध
                  </span>
                )}
              </div>

              <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">स्वाध्याय ज्ञान-परीक्षण एवं तत्वबोध लाइब्रेरी</h4>
              <p className="text-xs text-gray-500 tracking-wide">प्रश्नों पर टैप करें और तुरंत सही धार्मिक नैतिक बोध की शास्त्रीय व्याख्या देखें। अपनी रुचि के अनुसार फ़िल्टर करें।</p>

              {/* Dynamic Filtering Controls */}
              <div className="space-y-3 pt-2">
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={quizSearchQuery}
                    onChange={(e) => {
                      setQuizSearchQuery(e.target.value);
                      setQuizVisibleCount(6); // Reset pagination on search
                    }}
                    placeholder="खोजें (जैसे: आत्मा, व्रत, अहिंसा, TPF, Level 1...)"
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-black/10 dark:border-white/15 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Level / Age Bracket Filter */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">आयु वर्ग:</span>
                  {['All', 'Level 1 (Age 5-7)', 'Level 2 (Age 8-10)', 'Level 3 (Age 11-13)'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        playChime(440, 0.05);
                        setQuizLevelFilter(lvl);
                        setQuizVisibleCount(6);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        quizLevelFilter === lvl
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/10'
                      }`}
                    >
                      {lvl === 'All' ? 'सभी वर्ग' : lvl.replace('Level', 'स्तर')}
                    </button>
                  ))}
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">श्रेणी (Category):</span>
                  {['All', 'Spiritual Principles', 'Jain Conduct & Vows', 'Spiritual Practices', 'Karma Philosophy', 'Jain Cosmology', 'Community Wings'].map((cat) => {
                    const count = (gyanshalaData?.gyanshala_unified_knowledge_base?.verified_q_and_a || []).filter((e: any) => cat === 'All' || e.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          playChime(440, 0.05);
                          setQuizCategoryFilter(cat);
                          setQuizVisibleCount(6);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          quizCategoryFilter === cat
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/10'
                        }`}
                      >
                        {cat === 'All' ? `सभी (${count})` : `${cat === 'Spiritual Principles' ? 'सिद्धांत' : cat === 'Jain Conduct & Vows' ? 'व्रत और नियम' : cat === 'Spiritual Practices' ? 'साधना' : cat === 'Karma Philosophy' ? 'कर्म सिद्धांत' : cat === 'Jain Cosmology' ? 'ब्रह्मांड' : cat === 'Community Wings' ? 'संस्थागत पंख' : cat} (${count})`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid of Flashcards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                {((gyanshalaData?.gyanshala_unified_knowledge_base?.verified_q_and_a || []) as any[]).filter((item: any) => {
                  const matchesCategory = quizCategoryFilter === 'All' || item.category === quizCategoryFilter;
                  const matchesLevel = quizLevelFilter === 'All' || item.level === quizLevelFilter;
                  const query = quizSearchQuery.toLowerCase();
                  const matchesSearch = 
                    item.question_hi.toLowerCase().includes(query) ||
                    item.question_en.toLowerCase().includes(query) ||
                    item.answer_hi.toLowerCase().includes(query) ||
                    item.answer_en.toLowerCase().includes(query) ||
                    item.chapter.toLowerCase().includes(query);
                  return matchesCategory && matchesLevel && matchesSearch;
                }).slice(0, quizVisibleCount).map((quiz: any) => {
                  const isUnlocked = unlockedQuizIndices.includes(quiz.id);
                  return (
                    <div 
                      key={quiz.id} 
                      onClick={() => {
                        playChime(587.33, 0.06);
                        setUnlockedQuizIndices((prev) => 
                          prev.includes(quiz.id) ? prev.filter(i => i !== quiz.id) : [...prev, quiz.id]
                        );
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        isUnlocked 
                          ? 'bg-white dark:bg-gray-800 border-amber-550 shadow-sm ring-1 ring-amber-500/20' 
                          : 'bg-white dark:bg-gray-800 border-black/5 dark:border-white/10 hover:border-amber-500/30 shadow-xs'
                      }`}
                    >
                      <div className="space-y-1">
                        {/* Tags */}
                        <div className="flex justify-between items-center text-[8px] font-extrabold tracking-widest text-gray-400 uppercase">
                          <span>{quiz.level.replace('Level ', 'स्तर ')} • {quiz.chapter}</span>
                          <span className={`px-1.5 py-0.5 rounded-md ${
                            isUnlocked ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400' : 'bg-black/5 dark:bg-white/5'
                          }`}>
                            {isUnlocked ? 'उत्तर बंद' : 'उत्तर देखें'}
                          </span>
                        </div>
                        
                        <h5 className="font-extrabold text-xs text-gray-900 dark:text-white leading-snug pt-1">
                          {quiz.question_hi}
                        </h5>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {quiz.question_en}
                        </p>
                      </div>

                      <AnimatePresence>
                        {isUnlocked ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 text-xs font-semibold leading-relaxed space-y-2"
                          >
                            <p className="text-spiritual dark:text-amber-300">
                              💡 <span className="font-bold text-gray-800 dark:text-gray-100">उत्तर:</span> {quiz.answer_hi}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-snug">
                              {quiz.answer_en}
                            </p>
                            {quiz.moral_value && (
                              <div className="bg-emerald-500/5 border border-emerald-500/15 p-2 rounded-lg text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                                🌟 <span className="font-black">नैतिक मूल्य:</span> {quiz.moral_value}
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <p className="text-[9px] text-gray-400 italic mt-2 flex items-center gap-1">
                            <span>✨ श्रेणी:</span>
                            <span className="font-bold text-gray-500 dark:text-gray-300">{quiz.category}</span>
                          </p>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* No items fallback */}
              {((gyanshalaData?.gyanshala_unified_knowledge_base?.verified_q_and_a || []) as any[]).filter((item: any) => {
                const matchesCategory = quizCategoryFilter === 'All' || item.category === quizCategoryFilter;
                const matchesLevel = quizLevelFilter === 'All' || item.level === quizLevelFilter;
                const query = quizSearchQuery.toLowerCase();
                const matchesSearch = 
                  item.question_hi.toLowerCase().includes(query) ||
                  item.question_en.toLowerCase().includes(query) ||
                  item.answer_hi.toLowerCase().includes(query) ||
                  item.answer_en.toLowerCase().includes(query) ||
                  item.chapter.toLowerCase().includes(query);
                return matchesCategory && matchesLevel && matchesSearch;
              }).length === 0 && (
                <div className="text-center py-10 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-black/10">
                  <p className="text-xs text-gray-500 font-bold">कोई मिलान करने वाले प्रश्न नहीं मिले।</p>
                  <button 
                    onClick={() => {
                      setQuizSearchQuery('');
                      setQuizCategoryFilter('All');
                      setQuizLevelFilter('All');
                    }}
                    className="mt-2 text-[10px] font-black text-amber-600 hover:underline uppercase"
                  >
                    सारे फ़िल्टर हटाएं
                  </button>
                </div>
              )}

              {/* Pagination control */}
              {((gyanshalaData?.gyanshala_unified_knowledge_base?.verified_q_and_a || []) as any[]).filter((item: any) => {
                const matchesCategory = quizCategoryFilter === 'All' || item.category === quizCategoryFilter;
                const matchesLevel = quizLevelFilter === 'All' || item.level === quizLevelFilter;
                const query = quizSearchQuery.toLowerCase();
                const matchesSearch = 
                  item.question_hi.toLowerCase().includes(query) ||
                  item.question_en.toLowerCase().includes(query) ||
                  item.answer_hi.toLowerCase().includes(query) ||
                  item.answer_en.toLowerCase().includes(query) ||
                  item.chapter.toLowerCase().includes(query);
                return matchesCategory && matchesLevel && matchesSearch;
              }).length > quizVisibleCount && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      playChime(440, 0.08);
                      setQuizVisibleCount(prev => prev + 6);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    ➕ और लोड करें (Load More Questions)
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 4: Local Census Geographic Lookup (NEW FEATURE) */}
        {activeTab === 'census' && (
          <motion.div
            key="census"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Search and Filters Block */}
            <div className="bg-white dark:bg-gray-850 p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div className="space-y-1">
                  <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">📍 प्रांतीय ज्ञानशाला निर्देशिका (Kendra Directory)</h4>
                  <p className="text-xs text-gray-500">
                    महासभा के ५७१ प्रभागों के क्षेत्रीय संपर्क, सक्रिय केंद्रों और कुल ज्ञानार्थियों की प्रमाणिक लाइव निर्देशिका।
                  </p>
                </div>
                {/* Micro stat badge */}
                <div className="bg-spiritual/10 text-spiritual px-3.5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest inline-flex self-start md:self-auto shadow-sm">
                  🧭 कुल डेटाबेस: 5 प्रान्त केस
                </div>
              </div>

              {/* Dynamic Inputs */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="शहर, संयोजिका या प्रान्त खोजें..."
                    className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 rounded-2xl text-xs text-gray-900 dark:text-white border border-transparent focus:border-spiritual focus:outline-none"
                  />
                </div>

                {/* State selector dropdown */}
                <div className="sm:w-1/3 flex gap-2">
                  <select
                    value={selectedStateFilter}
                    onChange={(e) => {
                      playChime(600, 0.05);
                      setSelectedStateFilter(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 rounded-2xl text-xs text-gray-700 dark:text-gray-300 border border-transparent focus:outline-none"
                  >
                    {uniqueStates.map((st) => (
                      <option key={st} value={st} className="dark:bg-gray-800 text-xs">
                        {st === 'All' ? '🌐 सभी प्रान्त (All)' : st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Output Lookup List & Detail Segment split */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left results item card list */}
              <div className="lg:w-2/5 space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar">
                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest block px-1">खोजे गए प्रान्त ({filteredRegions.length})</span>
                
                {filteredRegions.length === 0 ? (
                  <div className="bg-black/5 p-8 rounded-3xl text-center border text-xs text-gray-400">
                    🔍 कोई प्रविष्टि नहीं मिली। अन्य खोज प्रयास करें।
                  </div>
                ) : (
                  filteredRegions.map((region) => {
                    const isSelected = selectedRegion.city === region.city;
                    return (
                      <div
                        key={region.city}
                        onClick={() => {
                          playChime(587.33, 0.05);
                          setSelectedRegion(region);
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-spiritual text-white border-transparent shadow-md' 
                            : 'bg-white dark:bg-gray-800 border-black/5 hover:border-black/10'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h5 className={`serif-text font-black text-xs sm:text-sm ${
                            isSelected ? 'text-white' : 'text-gray-950 dark:text-white'
                          }`}>{region.city} ({region.state.split(' ')[0]})</h5>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                            isSelected ? 'bg-white/25 text-white' : 'bg-spiritual/10 text-spiritual'
                          }`}>{region.centers} प्रभाग</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[10px] opacity-80">
                          <User size={10} />
                          <span className="font-bold opacity-90">संयोजक: {region.coordinator}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right result selected interactive panel */}
              <div className="flex-1 bg-black/5 dark:bg-white/5 p-6 rounded-3xl space-y-4">
                
                {/* Header detail */}
                <div className="flex justify-between items-start gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-spiritual uppercase tracking-widest">{selectedRegion.state}</span>
                    <h4 className="serif-text font-black text-gray-900 dark:text-white text-base leading-snug">📍 {selectedRegion.city} क्षेत्रीय रिपोर्ट कार्ड</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                      संवत २०७८ के अनुसार सत्यापित महासभा जनगणना रिकॉर्ड।
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-black/5 text-center">
                    <span className="block text-xl font-black text-spiritual">{selectedRegion.centers}</span>
                    <span className="text-[8px] text-gray-400 font-black block uppercase tracking-wider">केंद्र</span>
                  </div>
                </div>

                {/* Counters inside detail */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-black/5">
                    <span className="text-[8px] opacity-60 block font-black uppercase">कार्यरत शिक्षिकाएं</span>
                    <span className="font-black text-gray-900 dark:text-white text-sm">{selectedRegion.teachers} शिक्षक प्रभाग</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-black/5">
                    <span className="text-[8px] opacity-60 block font-black uppercase">अध्ययनरत छात्र</span>
                    <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{selectedRegion.students} ज्ञानार्थी</span>
                  </div>
                </div>

                {/* Sub-centers visual grid list checklist */}
                <div className="space-y-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block">संबद्ध क्षेत्रीय सक्रिय केंद्र (Centres List)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedRegion.localKendras.map((kendra, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 px-3.5 py-2.5 rounded-xl border border-black/5 flex items-center gap-2 font-semibold">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        <span className="text-gray-800 dark:text-gray-200 truncate">{kendra}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coordinator micro connect form drawer */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-black/5 space-y-3">
                  <h5 className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                    📱 संयोजक प्रभाग संपर्क सूत्र
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-spiritual shrink-0" />
                      <span>{selectedRegion.coordinator}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-spiritual shrink-0" />
                      <span>{selectedRegion.phone}</span>
                    </div>
                  </div>

                  {/* Quick message popup trigger form */}
                  <form onSubmit={handleCoordinatorSubmit} className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">प्रभाग से जुड़ें (Admission / Teacher Query)</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={coordinatorForm.name}
                        onChange={(e) => setCoordinatorForm({ ...coordinatorForm, name: e.target.value })}
                        placeholder="आपका नाम (Name)" 
                        className="flex-1 px-3 py-2 text-[10px] bg-black/5 dark:bg-white/5 rounded-lg border border-transparent focus:border-spiritual focus:outline-none focus:bg-white text-gray-850 dark:text-white font-semibold"
                        required
                      />
                      <input 
                        type="tel"
                        value={coordinatorForm.phone}
                        onChange={(e) => setCoordinatorForm({ ...coordinatorForm, phone: e.target.value })} 
                        placeholder="मोबाइल नंबर (Phone)" 
                        className="flex-1 px-3 py-2 text-[10px] bg-black/5 dark:bg-white/5 rounded-lg border border-transparent focus:border-spiritual focus:outline-none focus:bg-white text-gray-850 dark:text-white font-semibold"
                        required
                      />
                      <button 
                        type="submit"
                        className="p-2 px-4 bg-spiritual text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-opacity-95 transition-all shrink-0 cursor-pointer"
                      >
                        संदेश भेजें
                      </button>
                    </div>
                    {coordinatorSent && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-emerald-600 font-black"
                      >
                        ✓ संदेश प्रेषित! प्रभाग के संयोजक सुखराज जी शीघ्र ही आपसे संपर्क करेंगे।
                      </motion.p>
                    )}
                  </form>
                </div>

              </div>

            </div>

          </motion.div>
        )}

        {/* Tab 5: Trainers Hub (NEW FEATURE) */}
        {activeTab === 'trainers' && (
          <motion.div
            key="trainers"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Slogan details and info */}
            <div className="bg-emerald-500/10 dark:bg-emerald-800/5 p-5 rounded-3xl border border-emerald-500/20 text-xs flex justify-between items-center gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">"शिक्षिका मर्यादा एवं प्रशिक्षण"</span>
                <h4 className="serif-text font-black text-emerald-800 dark:text-emerald-300 text-lg">प्रशिक्षक संदर्भ केंद्र (Trainers Hub)</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  ज्ञानशाला की ४,०३८ प्रमाणित शिक्षिकाओं (शिक्षकों) के लिए त्रि-स्तरीय पाठ्यक्रम की रूपरेखा, आवश्यक आचार-संहिता और मूल्यांकन नियमावली।
                </p>
              </div>
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md shrink-0">
                <Award size={20} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Category selector */}
              <div className="flex md:flex-col gap-2 shrink-0 md:w-1/3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {TRAINER_COURSES.map((course) => (
                  <button
                    key={course.tierName}
                    onClick={() => {
                      playChime(659.25, 0.05);
                      setSelectedTrainerCourse(course);
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border text-xs font-bold transition-all shrink-0 md:shrink cursor-pointer ${
                      selectedTrainerCourse.tierName === course.tierName
                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600'
                        : 'border-black/5 bg-gray-50 dark:bg-black/20 hover:bg-black/5 text-gray-500'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{course.tierName}</div>
                    <div className="text-[10px] opacity-75 font-medium mt-0.5">{course.hindiTier.split(' ')[0]}</div>
                  </button>
                ))}
              </div>

              {/* Category Detail Panel */}
              <div className="flex-1 bg-black/5 dark:bg-white/5 p-6 rounded-3xl space-y-4">
                
                {/* Duration and evaluation metadata */}
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-black/5 text-xs text-semibold">
                  <div>
                    <span className="text-[8px] text-gray-400 uppercase font-black block">कोर्स अवधि</span>
                    <span className="font-black text-gray-800 dark:text-gray-200">{selectedTrainerCourse.duration}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-400 uppercase font-black block">अखिल भारती परीक्षा स्वरूप</span>
                    <span className="font-black text-spiritual">{selectedTrainerCourse.examPattern.split(' + ')[0]}</span>
                  </div>
                </div>

                {/* Eligibility info */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-black/5 space-y-1">
                  <span className="text-[8px] text-emerald-600 uppercase font-black tracking-widest block">पात्रता मापदंड (Eligibility Guidelines)</span>
                  <p className="text-xs text-gray-700 dark:text-gray-350 font-bold italic">{selectedTrainerCourse.eligibility}</p>
                </div>

                {/* Sub-topics focus */}
                <div className="space-y-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block">सघन विषय केंद्रित प्रभाग (Course Syllabus Focus)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedTrainerCourse.focus.map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-black/5 flex items-center gap-3 font-semibold shadow-xs">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <span className="text-gray-850 dark:text-gray-200 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* General Trainers Rules (मर्यादा पत्रक) */}
            <div className="bg-white dark:bg-gray-850 p-5 rounded-3xl border border-black/5 space-y-4">
              <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">📒 ज्ञानशाला शिक्षिका आचार-संहिता (Trainer Rules Code)</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                ज्ञानशालाओं की गुणवत्ता एवं आध्यात्मिक मर्यादा बनाए रखने के लिए प्रत्येक शिक्षिका/शिक्षक को महासभा के मर्यादा-पत्रक के इन नियमों का अनिवार्य पालन करना होता है:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-750 dark:text-gray-300">
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                  <p className="leading-relaxed"><strong>शुद्ध गाथा संचेतना:</strong> कक्षाओं में पढ़ने से पूर्व स्वयं महामंत्र नवकार एवं जैन शास्त्रों की गाथाओं का विशुद्ध स्वरोच्चारण सुनिश्चित करें।</p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                  <p className="leading-relaxed"><strong>सदाचारी वेशभूषा:</strong> ज्ञानशालार्थियों के सामने सदा सौम्य, सात्विक एवं भारतीय मर्यादा के अनुकूल सादे कपड़ों में अध्यापन करवाएं।</p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                  <p className="leading-relaxed"><strong>अहिंसक व्यवहार (No Punishment):</strong> बच्चों को शिक्षा देते समय किसी भी प्रकार का शारीरिक प्रताड़न या अपमानजनक शब्दों का प्रयोग पूर्णतः निषिद्ध है।</p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 font-black text-[11px] flex items-center justify-center shrink-0">4</span>
                  <p className="leading-relaxed"><strong>साप्ताहिक प्रतिवेदन:</strong> प्रत्येक कक्षा का साप्ताहिक शिक्षण विवरण डायरी (Register) में संधारित करें तथा प्रान्त संयोजक को प्रेषित करें।</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 6: Ethical Stories */}
        {activeTab === 'stories' && (
          <motion.div
            key="stories"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Story selector sidebar */}
              <div className="flex sm:flex-col gap-2 overflow-x-auto pb-2 sm:pb-0 scroll-smooth no-scrollbar sm:w-1/3">
                {MORAL_STORIES.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => {
                      playChime(600, 0.05);
                      setActiveStory(story);
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border text-xs transition-all shrink-0 sm:shrink flex items-center justify-between gap-2 cursor-pointer ${
                      activeStory.id === story.id
                        ? 'border-spiritual bg-spiritual/10 text-spiritual font-black shadow-sm'
                        : 'border-black/5 bg-gray-50 dark:bg-black/20 hover:bg-black/5 text-gray-500'
                    }`}
                  >
                    <span className="serif-text font-bold leading-tight truncate">{story.title}</span>
                    <ChevronRight size={14} className="shrink-0" />
                  </button>
                ))}
              </div>

              {/* Story Display Panel */}
              <div className="flex-1 bg-black/5 dark:bg-white/5 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-spiritual/15 rounded-md text-spiritual shrink-0"><Feather size={14} /></span>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">प्रेरणादायी बोध कथा</span>
                </div>

                <h4 className="serif-text font-black text-gray-900 dark:text-white text-lg leading-snug">{activeStory.title}</h4>
                
                <p className="text-xs sm:text-sm leading-relaxed text-gray-705 dark:text-gray-300 font-medium bg-white dark:bg-gray-800 p-4 rounded-2xl border border-black/5">
                  {activeStory.summary}
                </p>

                {/* Moral Box */}
                <div className="bg-amber-500/10 dark:bg-amber-500/5 p-4 rounded-2xl border-l-4 border-amber-500 flex gap-3 text-xs">
                  <div className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <Heart size={16} fill="currentColor" />
                  </div>
                  <div>
                    <h5 className="font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest text-[9px] mb-0.5">शिक्षा / नैतिक बोध (Moral Philosophy)</h5>
                    <p className="font-bold text-gray-800 dark:text-gray-200 leading-relaxed italic">{activeStory.moral}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 7: National Statistics Hub */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Slogan Banner */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider block">ज्ञानशाला महामंत्र ध्येय वाक्य</span>
              <p className="serif-text font-black text-amber-900 dark:text-amber-300 text-sm sm:text-base mt-1">
                📢 "{masterGyanshalaDatabase.motto}"
              </p>
            </div>

            {/* Selector switches */}
            <div className="flex bg-black/5 dark:bg-white/10 p-1.5 rounded-2xl gap-2 border border-black/5">
              <button
                onClick={() => {
                  playChime(500, 0.05);
                  setStatsView('NATIONAL');
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statsView === 'NATIONAL'
                    ? 'bg-spiritual text-white shadow-md shadow-spiritual/15'
                    : 'text-gray-500 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                📊 महासभा डेटा (National)
              </button>
              <button
                onClick={() => {
                  playChime(550, 0.05);
                  setStatsView('REGIONAL');
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statsView === 'REGIONAL'
                    ? 'bg-spiritual text-white shadow-md shadow-spiritual/15'
                    : 'text-gray-500 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                🗺️ क्षेत्रीय सांख्यिकी (Regional)
              </button>
            </div>

            <AnimatePresence mode="wait">
              {statsView === 'NATIONAL' ? (
                <motion.div
                  key="national-stats"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  {/* Big figures */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 text-center">
                      <span className="block text-2xl font-black text-spiritual">{n.totalCenters}</span>
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mt-1">कुल केंद्र</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 text-center">
                      <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{n.totalGyanarthis}</span>
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mt-1">कुल ज्ञानार्थी</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 text-center">
                      <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{n.totalPrashikshaks}</span>
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mt-1">प्रमाणित शिक्षक</span>
                    </div>
                  </div>

                  {/* Operational History */}
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
                    <span className="text-[9px] font-black text-spiritual uppercase tracking-widest block">History & Timeline</span>
                    <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">महासभा संचालन एवं विकास इतिहास</h4>
                    <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                      <div>• <strong>बीजारोपण विज़न:</strong> सन् १९६५ में ९वें आचार्य श्री तुलसी द्वारा स्वप्नद्रष्टा के रूप में नींव रखी गई।</div>
                      <div>• <strong>महासभा कालक्रम:</strong> सन् १९९२ से महासभा के पूर्ण केंद्रीय दिशा-निर्देशन और स्थानीय व्यवस्था के अनुपालन में व्यवस्थित रूप से संचालन प्रारंभ हुआ।</div>
                      <div>• <strong>सहयोगी संघातिक तंत्र:</strong> अखिल भारतीय स्तर पर तेरापंथ युवक परिषद (TYP) एवं तेरापंथ महिला मंडल (TMM) सहयोगी मुख्य शाखाओं के रूप में शिक्षक भर्ती और विकास में भागीदारी निभाते हैं।</div>
                    </div>
                  </div>

                  {/* Certification Tiers */}
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3 font-semibold text-xs text-gray-750 dark:text-gray-300">
                    <h4 className="serif-text font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      🎓 शिक्षक प्रशिक्षण श्रेणियां (सन् २००२ से प्रभावी)
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      ज्ञानशालाओं की गुणवत्ता उत्कृष्ट स्तर पर रखने के लिए महासभा द्वारा त्रि-स्तरीय परीक्षा एवं प्रशिक्षण शिविर आयोजित किए जाते हैं:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 font-black">
                      {n.trainingTiers.map((tier, idx) => (
                        <span key={idx} className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-450 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full">
                          {tier}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-405 dark:text-gray-400 font-bold border-t border-black/5 dark:border-white/5 pt-2 italic">
                      ℹ️ {n.evaluationMethod}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="regional-stats"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {/* Stats Block */}
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
                    <h4 className="serif-text font-black text-blue-600 dark:text-blue-400 text-sm">
                      🗺️ प्रांतीय महासभा भौगोलिक विस्तार
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5">
                        <span className="text-[8px] text-gray-400 block font-black uppercase">सक्रिय राज्य</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-sm">{r.statesCovered} राज्य</span>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5">
                        <span className="text-[8px] text-gray-400 block font-black uppercase">कुल क्षेत्रीय प्रभाग</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-sm">{r.totalRegions} प्रभाग</span>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5">
                        <span className="text-[8px] text-gray-400 block font-black uppercase">क्षेत्रीय बच्चे</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-sm">{r.totalRegionalGyanarthis} ज्ञानार्थी</span>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5">
                        <span className="text-[8px] text-gray-400 block font-black uppercase">क्षेत्रीय शिक्षिकाएं</span>
                        <span className="font-extrabold text-gray-900 dark:text-white text-sm">{r.totalRegionalPrashikshikas} प्रशिक्षित</span>
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 dark:bg-blue-500/5 px-4 py-2.5 rounded-xl text-blue-700 dark:text-blue-400 text-[11px] font-bold flex justify-between items-center">
                      <span>📈 आकांक्षी ज्ञानार्थी (Aspiring students pipeline):</span>
                      <span className="text-sm font-black">{r.aspiringStudents} नए बच्चे</span>
                    </div>
                  </div>

                  {/* Bangalore Case study */}
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest inline-block">
                      Case Study: Bangalore Province (2021)
                    </span>
                    <h4 className="serif-text font-black text-gray-900 dark:text-white text-base">📍 स्थानीय प्रभाग केस स्टडी: बैंगलोर सांख्यिकी</h4>
                    <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
                      <div className="bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                        <span className="block font-black text-amber-700 dark:text-amber-450 text-lg">{r.bangaloreCaseStudy2021.areaWiseKendras}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">स्थानीय केंद्र</span>
                      </div>
                      <div className="bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                        <span className="block font-black text-amber-700 dark:text-amber-450 text-lg">{r.bangaloreCaseStudy2021.teachersCount}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">कार्यरत शिक्षिकाएं</span>
                      </div>
                      <div className="bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                        <span className="block font-black text-amber-700 dark:text-amber-450 text-lg">{r.bangaloreCaseStudy2021.studentsCount}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">अध्ययनरत छात्र</span>
                      </div>
                    </div>
                    <div className="bg-amber-500/10 dark:bg-amber-500/5 p-3 rounded-xl text-center border border-amber-500/20">
                      <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 leading-relaxed italic">
                        🏆 रजत जयंती वर्ष: {r.bangaloreCaseStudy2021.historicalMilestone}
                      </p>
                    </div>
                  </div>

                  {/* Administrative Leadership Roles */}
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
                    <h4 className="serif-text font-black text-gray-950 dark:text-white text-sm">
                      👥 केंद्रीय संगठन प्रशासनिक नेतृत्व
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                        <span className="font-bold text-gray-450 text-[10px] uppercase">राष्ट्रीय संयोजक (National Sanyojak)</span>
                        <span className="font-black text-spiritual">{r.nationalLeadership.rashtriyaSanyojak}</span>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl space-y-2">
                        <span className="font-bold text-gray-450 text-[10px] uppercase block mb-1">राष्ट्रीय मुख्य प्रशिक्षक (National Core Trainers)</span>
                        <div className="flex gap-2 font-black">
                          {r.nationalLeadership.nationalTrainers.map((trainer, idx) => (
                            <span key={idx} className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-800 dark:text-gray-100 text-[11px] border border-black/5">
                              {trainer}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
