import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, History, Trash2, Clock, AlertCircle, BookOpen, ShieldCheck, HelpCircle, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';
import { devLog } from '../lib/devLog';

interface PratikramanStep {
  name: string;
  duration: number; // in seconds
  text: string;
  purpose: string;
}

const STEPS_DATA: Record<string, PratikramanStep[]> = {
  devsi: [
    { name: "इरियावही सूत्र", duration: 60, text: "इच्छामि पडिक्कमिउं इरियावहियाए विराहणाए, गमणागमणे, पाणाक्कवणे, बीयाक्कवणे, हरियाक्कवणे, ओसा-उत्तिंग-पणग-दग-मट्टी-मक्क्डा-संताणा-संकमणे, जे मे जीवा विराहिया, एगिंदिया, बेइंदिया, तेइंदिया, चउरिंदिया, पंचिंदिया, अभिहया, वत्तिया, लेसिया, संघट्टिया, संघाइया, परियाविया, किलामिया, उद्दविया, ठाणाओ ठाणं संकामिया, जीवियाओ ववरोविया, तस्स मिच्छामि दुक्कडं ॥", purpose: "सड़क यात्रा, गमनागमन या चलने उठने में हुए जीव-विराधना दोषों की शुद्धि एवं क्षमायाचना।" },
    { name: "तस्स उत्तरी", duration: 30, text: "तस्स उत्तरी करणेणं, पायच्छित्त करणेणं, विसोही करणेणं, विसल्लीकरणेणं, पावाणं कम्माणं निग्घायाणट्ठाए, ठामि काउस्सग्गं ॥", purpose: "कायिक व मानसिक स्थिरता की अभिवृद्धि हेतु कायोत्सर्ग धारण करने का निश्चय।" },
    { name: "अन्नत्थ सूत्र", duration: 30, text: "अन्नत्थ ऊसासनिसासेणं, खासणेणं, छीएणं, जंभाइएणं, उड्डुएणं, वायनिसग्गेणं, भमलीए, पित्तमुच्छाए, सुहुमेहिं अंगसंचालेहिं, सुहुमेहिं खेलसंचालेहिं, सुहुमेहिं दिद्विसंचालेहिं, एवमाइएहिं आगारेहिं, अभग्गो अविराहिओ, हुज्ज मे काउस्सग्गो ॥", purpose: "ध्यान के समय होने वाली स्वाभाविक शारीरिक क्रियाओं या अपवादों की पूर्व-घोषणा।" },
    { name: "नवकार मंत्र", duration: 60, text: "णमो अरिहंताणं, णमो सिद्धाणं, णमो आयरियाणं, णमो उवज्झायाणं, णमो लोए सव्व साहूणं। एसो पंच नमोक्कारो, सव्वपावप्पणासणो, मंगलाणं च सव्वेसिं, पढमं हवइ मंगलं ॥", purpose: "समस्त पाँच परमेष्ठियों के प्रति सर्वोच्च आध्यात्मिक वंदना एवं विघ्नविनाशक महामंत्र।" },
    { name: "करेमि भंते", duration: 45, text: "करेमि भंते ! सामाइयं सावज्जं जोगं पच्चक्खामि, जाव नियमं पज्जुवासामि, दुविहं तिविहेणं-मणेणं वायाए काएणं, न करेमि न कारवेमि, तस्स भंते ! पडिक्कमामि, निंदामि, गरिहामि, अप्पाणं वोसिरामि ॥", purpose: "समस्त सावद्य (हिंसकारी) प्रवृत्तियों के त्याग की शास्त्रीय सामायिक प्रतिज्ञा।" },
    { name: "देवसी प्रतिक्रमण सूत्र", duration: 180, text: "इच्छामि ठामि काउस्सग्गं, जो मे देवसिओ अइयारो कओ, काइओ, वाइओ, माणसिओ, उस्सुत्तो, उम्मग्गो, अकप्पो, अकरणिज्जो, दुच्चिंतिओ, दुब्भासिओ, अणायारो, अणिच्छिअब्बो, अन्नयरो अइयारो, तस्स मिच्छामि दुक्कडं ॥", purpose: "दिनभर में जाने-अनजाने में हुए समस्त दुष्कृत्यों एवं मर्यादाओं के अतिक्रमण की आत्मिक शुद्धि।" },
    { name: "वंदणवत्तिया", duration: 60, text: "वंदणवत्तिया देवसिआए, राइसिआए, इच्छामि पडिक्कमिउं अइआराओ, दुच्चिंतिआओ, दुब्भासिआओ, अकरणिज्जाओ, असहणयाओ, अकूआओ, मग्गावक्कमणाओ, अणाचाराओ, तस्स मिच्छामि दुक्कडं ॥", purpose: "गुरुदेव और उत्कृष्ट चारित्रवानों के प्रति कृतज्ञता पूर्ण त्रिकाल संध्या वंदना एवं दोष शुद्धि।" },
    { name: "जयवीयराय", duration: 45, text: "जय वीयराय ! जगगुरु ! जगन्नाह ! जगबंधु ! कप्पाण कुणसु ममावि, संसार-मुक्ख-मग्ग-अणुगामी, समाहि-मरणं च लहू-कम्मुत्तणं च, पडिबंधु-रहिओ सव्व-संग-मुक्को, सिव-मयं ठाणं लहामि ॥", purpose: "राग-द्वेष विमुक्त वीतराग देवों से संसार सागर से मोक्ष मार्ग पर अग्रसर होने की नम्र प्रार्थना।" },
    { name: "खमासमण सूत्र", duration: 30, text: "इच्छामि खमासमणो ! वंदिउं जावणिज्जाए निसीहियाए, मथ्थेण वंदामि, अनुकूल-जोगेणं, उवधि-परिग्गहेणं, संथार-पट्टएणं, पडिक्कमामि देवसिअमइआरं, मिच्छामि दुक्कडं ॥", purpose: "परम उपकारी गुरु देवों से विनीत भाव तथा मस्तक झुकाकर क्षमा याचना।" },
    { name: "कायोत्सर्ग", duration: 120, text: "ध्यान मुद्रा — Kayotsarg posture for 2 Minutes. संवर, विवेक और एकाग्रता के साथ संपूर्ण शरीर का विसर्जन व शिथिलीकरण करें। आंतरिक श्वास-प्रश्वास के साथ आत्मा के चैतन्य स्वरूप में स्थिर रहें।", purpose: "देह से आसक्ति मिटाकर शुद्ध आत्म-प्रदेशों में रमण करने की परम समाधि।" },
    { name: "पारना (समाप्ति)", duration: 30, text: "नमो अरिहंताणं — सामायिक और प्रतिक्रमण की पावन आराधना सम्पन्न। जीवमात्र के प्रति असीम मैत्री भाव का चिंतन करें : 'खामेमि सव्वजीवे, सव्वे जीवा खमंतु मे, मित्ती मे सव्वभूएसु, वेरं मज्झं न केणइ। मिच्छामि दुक्कडं!'", purpose: "समस्त चर-अचर जीवों से नि:शर्त क्षमा तथा अखिल ब्रह्मांड मैत्री की दिव्य प्रतिज्ञा।" }
  ],
  rai: [
    { name: "इरियावही सूत्र", duration: 60, text: "इच्छामि पडिक्कमिउं इरियावहियाए विराहणाए, गमणागमणे, पाणाक्कवणे, बीयाक्कवणे..." , purpose: "रात्रि गमन या अन्य संचलनों में हुए दोषों की शुद्धि हेतु इरियावही देव।" },
    { name: "तस्स उत्तरी", duration: 30, text: "तस्स उत्तरी करणेणं, पायच्छित्त करणेणं, विसोही करणेणं, विसल्लीकरणेणं...", purpose: "कायिक शुद्धि हेतु निश्चय वाक्य।" },
    { name: "अन्नत्थ सूत्र", duration: 30, text: "अन्नत्थ ऊसासनिसासेणं, खासणेणं, छीएणं, जंभाइएणं, उड्डुएणं..." , purpose: "कायोत्सर्ग समय की अपवाद मर्यादाएं।" },
    { name: "नवकार मंत्र", duration: 60, text: "णमो अरिहंताणं, णमो सिद्धाणं, णमो आयरियाणं, णमो उवज्झायाणं, णमो लोए सव्व साहूणं...", purpose: "महामंगलकारी पंच परमेष्ठी स्मरण।" },
    { name: "करेमि भंते", duration: 45, text: "करेमि भंते ! सामाइयं सावज्जं जोगं पच्चक्खामि, जाव नियमं पज्जुवासामि...", purpose: "सामायिक व्रत ग्रहण का शाश्वत पाठ।" },
    { name: "राइ प्रतिक्रमण सूत्र", duration: 180, text: "इच्छामि ठामि काउस्सग्गं, जो मे राइसिओ अइयारो कओ, काइओ, वाइओ, माणसिओ, उस्सुत्तो, उम्मग्गो, अकप्पो, अकरणिज्जो, दुच्चिंतिओ, दुब्भासिओ, अणायारो, अणिच्छिअब्बो, अन्नयरो अइयारो, तस्स मिच्छामि दुक्कडं ॥", purpose: "रात्रिभर में हुए प्रमाद, दुःस्वप्न या मानसिक विकारों की शुद्धि।" },
    { name: "वंदणवत्तिया", duration: 60, text: "वंदणवत्तिया राइसिआए, इच्छामि पडिक्कमिउं अइआराओ...", purpose: "रात्रि कालीन विराधनाओं पर पश्चाताप व गुरु वंदना।" },
    { name: "जयवीयराय", duration: 45, text: "जय वीयराय ! जगगुरु ! जगन्नाह ! जगबंधु ! कप्पाण कुणसु ममावि...", purpose: "बंधनों से मुक्ति और वीतरागता की आध्यात्मिक अभिलाषा।" },
    { name: "खमासमण सूत्र", duration: 30, text: "इच्छामि खमासमणो ! वंदिउं जावणिज्जाए निसीहियाए, मथ्थेण वंदामि...", purpose: "गुरू-चरणों में उपस्थित होकर आत्म-दोषों की स्वीकृति व समर्पण।" },
    { name: "कायोत्सर्ग", duration: 120, text: "ध्यान मुद्रा — Kayotsarg posture for 2 Minutes. शरीर के प्रति विमोह भूलकर चैतन्य रश्मियों का साक्षात्कार करें।", purpose: "शारीरिक आलस्य त्याग कर अंतर्यात्रा की दृढ़ता।" },
    { name: "पारना (समाप्ति)", duration: 30, text: "नमो अरिहंताणं — आराधना संपन्न। प्राणी मात्र के प्रति मित्रता: 'मित्ती मे सव्वभूएसु, वेरं मज्झं न केणइ।'", purpose: "सर्व जीव शांति प्रार्थना।" }
  ],
  pakkhi: [
    { name: "इरियावही सूत्र", duration: 60, text: "इच्छामि पडिक्कमिउं इरियावहियाए विराहणाए, गमणागमणे..." , purpose: "पक्ष (१५ दिन) में हुए बड़े संचलनों के अतिचारों की शुद्धि।" },
    { name: "तस्स उत्तरी", duration: 30, text: "तस्स उत्तरी करणेणं, पायच्छित्त करणेणं...", purpose: "आत्मविशुद्धि के लिए संकल्प विधि।" },
    { name: "अन्नत्थ सूत्र", duration: 30, text: "अन्नत्थ ऊसासनिसासेणं, खासणेणं, छीएणं..." , purpose: "ध्यानस्थ स्थिरता नियमों का परिपालन।" },
    { name: "नवकार मंत्र", duration: 60, text: "णमो अरिहंताणं, णमो सिद्धाणं, णमो आयरियाणं, णमो उवज्झायाणं..." , purpose: "दिव्य चेतना की मंगलकारी भावना।" },
    { name: "करेमि भंते", duration: 45, text: "करेमि भंते ! सामाइयं सावज्जं जोगं पच्चक्खामि...", purpose: "सामायिक की विशुद्ध प्रतिज्ञा।" },
    { name: "पाक्खी प्रतिक्रमण सूत्र", duration: 240, text: "इच्छामि ठामि काउस्सग्गं, जो मे पाक्खिओ अइयारो कओ, काइओ, वाइओ, माणसिओ, उस्सुत्तो, उम्मग्गो, अकप्पो, अकरणिज्जो, दुच्चिंतिओ, दुब्भासिओ, अणायारो, अणिच्छिअब्बो, अन्नयरो अइयारो, पाक्खिअं मिच्छामि दुक्कडं ॥", purpose: "१५ दिनों के पाक्षिक व्रतों की समीक्षा एवं सघन प्रायश्चित सूत्र।" },
    { name: "वंदणवत्तिया", duration: 60, text: "वंदणवत्तिया पाक्खिआए, इच्छामि पडिक्कमिउं अइआराओ...", purpose: "पाक्षिक गुरुवंदना एवं दोष प्रक्षालन।" },
    { name: "जयवीयराय", duration: 45, text: "जय वीयराय ! जगगुरु ! जगन्नाह ! जगबंधु ! कप्पाण कुणसु ममावि...", purpose: "वीतराग भावों का हृदय में सिंचन।" },
    { name: "खमासमण सूत्र", duration: 30, text: "इच्छामि खमासमणो ! वंदिउं जावणिज्जाए निसीहियाए, मथ्थेण वंदामि...", purpose: "क्षमाशीलता के उत्कृष्ट गुण की साधना।" },
    { name: "कायोत्सर्ग", duration: 180, text: "ध्यान मुद्रा — Kayotsarg posture for 3 Minutes. पंद्रह दिनों के संचित कषायों और विकारों की निर्जरा करें।", purpose: "सघन आध्यात्मिक ध्यान और ध्यानलीनता।" },
    { name: "पारना (समाप्ति)", duration: 30, text: "नमो अरिहंताणं — पाक्खी प्रतिक्रमण की मंगल आराधना पूर्ण। 'मित्ती मे सव्वभूएसु, वेरं मज्झं न केणइ।'" , purpose: "मैत्री भावना का प्रसार।" }
  ],
  samvatsari: [
    { name: "इरियावही सूत्र", duration: 60, text: "इच्छामि पडिक्कमिउं इरियावहियाए विराहणाए, गमणागमणे..." , purpose: "वर्षभर के गमनागमन अतिचारों की शुद्धि।" },
    { name: "तस्स उत्तरी", duration: 30, text: "तस्स उत्तरी करणेणं, पायच्छित्त करणेणं...", purpose: "कायोत्सर्ग की आधारशिला रूप निश्चय।" },
    { name: "अन्नत्थ सूत्र", duration: 30, text: "अन्नत्थ ऊसासनिसासेणं, खासणेणं..." , purpose: "प्राणायाम एवं ध्यान अपवाद मर्यादाएँ।" },
    { name: "नवकार मंत्र", duration: 60, text: "णमो अरिहंताणं, णमो सिद्धाणं, णमो आयरियाणं, णमो उवज्झायाणं..." , purpose: "समस्त पाप विमोचक महामंत्र आराधना।" },
    { name: "करेमि भंते", duration: 45, text: "करेमि भंते ! सामाइयं सावज्जं जोगं पच्चक्खामि...", purpose: "सांवत्सरिक महाव्रत सामायिक नियम पाठ।" },
    { name: "सांवत्सरिक प्रतिक्रमण सूत्र", duration: 300, text: "इच्छामि ठामि काउस्सग्गं, जो मे संवच्छरिओ अइयारो कओ, काइओ, वाइओ, माणसिओ, उस्सुत्तो, उम्मग्गो, अकप्पो, अकरणिज्जो, दुच्चिंतिओ, दुब्भासिओ, अणायारो, अणिच्छिअब्बो, अन्नयरो अइयारो, सांवत्सरिअं मिच्छामि दुक्कडं ॥", purpose: "वर्षभर के समस्त ज्ञात-अज्ञात कर्मबंधों की शुद्धि का सर्वोच्च सांवत्सरिक पश्चाताप सूत्र।" },
    { name: "वंदणवत्तिया", duration: 60, text: "वंदणवत्तिया सांवत्सरिआए, इच्छामि पडिक्कमिउं अइआराओ...", purpose: "वार्षिक वंदना, गुरु कृतज्ञता एवं अतिचार विजातीय शुद्धीकरण।" },
    { name: "जयवीयराय", duration: 45, text: "जय वीयराय ! जगगुरु ! जगन्नाह ! जगबंधु ! कप्पाण कुणसु ममावि...", purpose: "वीतराग के चरण रज का ध्यान।" },
    { name: "खमासमण सूत्र", duration: 30, text: "इच्छामि खमासमणो ! वंदिउं जावणिज्जाए निसीहियाए, मथ्थेण वंदामि...", purpose: "संसार के सभी जीवों के प्रति परम क्षमा भाव का प्रगटीकरण।" },
    { name: "कायोत्सर्ग", duration: 240, text: "ध्यान मुद्रा — Kayotsarg posture for 4 Minutes. संवर, विवेक और अखंड मौन के साथ कर्म-निर्जरा का महा-ध्यान करें।", purpose: "महा-संवर ध्यान एवं आत्म-रूप में लीनता।" },
    { name: "पारना (समाप्ति)", duration: 30, text: "नमो अरिहंताणं — सांवत्सरिक महा प्रतिक्रमण आराधना पूर्ण। 'खामेमि सव्वजीवे, सव्वे जीवा खमंतु मे, मित्ती मे सव्वभूएसु, वेरं मज्झं न केणइ। मिच्छामि दुक्कडं!'", purpose: "अखिल विश्व-मैत्री एवं संवत्सरी महापर्व मिच्छामि दुक्कडं संकल्प।" }
  ]
};

const MODE_LABELS: Record<string, string> = {
  devsi: "देवसी प्रतिक्रमण (Evening)",
  rai: "रात्रि प्रतिक्रमण (Nightly)",
  pakkhi: "पाक्खी प्रतिक्रमण (Fortnightly)",
  samvatsari: "सांवत्सरिक प्रतिक्रमण (Samvatsari)"
};

export default function PratikramanGuide({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'devsi' | 'rai' | 'pakkhi' | 'samvatsari'>('devsi');
  const [guidedStepIndex, setGuidedStepIndex] = useState<number | null>(null); // null means overview mode
  const [timerLeft, setTimerLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [justCompletedMode, setJustCompletedMode] = useState<string | null>(null);

  // Print & Booklet Customization States
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [printFontSize, setPrintFontSize] = useState<number>(14);
  const [printSections, setPrintSections] = useState({
    cover: true,
    intro: true,
    sutras: true,
    glossary: true,
    colophon: true,
  });
  const [isPrintCustomizerOpen, setIsPrintCustomizerOpen] = useState<boolean>(false);

  const steps = STEPS_DATA[activeMode] || STEPS_DATA.devsi;
  const currentStep = guidedStepIndex !== null ? steps[guidedStepIndex] : null;

  // Realtime subscription for history completions
  useEffect(() => {
    if (!user) {
      setHistoryLogs([]);
      return;
    }

    const path = `users/${user.uid}/pratikramanLogs`;
    const q = query(
      collection(db, path),
      orderBy('completedAt', 'desc'),
      limit(7)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistoryLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.warn("Pratikraman logs permission checked or load skipped:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync Timer duration whenever active index shifts
  useEffect(() => {
    if (currentStep) {
      setTimerLeft(currentStep.duration);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [guidedStepIndex, activeMode]);

  // Timer loop handler
  useEffect(() => {
    if (!isTimerRunning || guidedStepIndex === null) return;

    const interval = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          clearInterval(interval);
          handleNextStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, guidedStepIndex]);

  // Audio synthesis for step transition beep
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // Standard 440Hz spiritual beep

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Web Audio API blocked or not supported yet:", e);
    }
  };

  // Navigations hooks
  const startGuidedMode = () => {
    setGuidedStepIndex(0);
    setJustCompletedMode(null);
  };

  const quitGuidedMode = () => {
    setGuidedStepIndex(null);
    setIsTimerRunning(false);
  };

  const handleNextStep = () => {
    if (guidedStepIndex === null) return;
    if (guidedStepIndex < steps.length - 1) {
      setGuidedStepIndex(guidedStepIndex + 1);
    } else {
      // Completed last step! Log it and show completed state.
      triggerCompletion();
    }
  };

  const handlePrevStep = () => {
    if (guidedStepIndex === null) return;
    if (guidedStepIndex > 0) {
      setGuidedStepIndex(guidedStepIndex - 1);
    }
  };

  // Log completion to firestore securely
  const triggerCompletion = async () => {
    const totalTimeComputed = steps.reduce((acc, step) => acc + step.duration, 0);
    const completedMode = activeMode;

    quitGuidedMode();
    setJustCompletedMode(completedMode);

    if (!user) {
      devLog("No authenticated user profile loaded: Skipping cloud database sync.");
      return;
    }

    setIsSaving(true);
    const path = `users/${user.uid}/pratikramanLogs`;
    try {
      await addDoc(collection(db, path), {
        mode: completedMode,
        completedAt: serverTimestamp(),
        stepsCompleted: steps.length,
        totalDuration: totalTimeComputed
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete from history
  const handleDeleteLog = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/pratikramanLogs/${id}`;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/pratikramanLogs`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Utility calculations
  const totalDurationSeconds = steps.reduce((acc, s) => acc + s.duration, 0);
  const totalDurationMinutes = Math.ceil(totalDurationSeconds / 60);

  // Circular timer rings dimensions
  const radius = 54;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const currentTotal = currentStep ? currentStep.duration : 1;
  const progressPercent = Math.min(100, (timerLeft / currentTotal) * 100);
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const getLogModeLabel = (m: string) => {
    if (m === 'devsi') return "देवसी (Daily)";
    if (m === 'rai') return "रात्रि (Nightly)";
    if (m === 'pakkhi') return "पाक्खी (Fortnightly)";
    if (m === 'samvatsari') return "सांवत्सरिक (Annual)";
    return m;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-4 sm:p-6" id="pratikraman-guide-module">
      
      {/* Title Header area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-spiritual)] serif-text tracking-tight">
            प्रतिक्रमण साधना मार्गदर्शिका
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium leading-relaxed">
            जैन तेरापंथ धर्म संघ की शास्त्रीय विधि अनुसार संध्या-रात्रि और पाक्षिक-वार्षिक आत्म-निवेदन एवं चित्त-विशुद्धि साधना।
          </p>
        </div>

        {guidedStepIndex === null && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 py-2 px-3 border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="Print current guide as a booklet"
            >
              <Printer size={14} />
              <span>प्रिंट (Print)</span>
            </button>
            <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl w-fit">
              {(['devsi', 'rai', 'pakkhi', 'samvatsari'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setActiveMode(mode);
                    setJustCompletedMode(null);
                  }}
                  className={`py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    activeMode === mode
                      ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {mode === 'devsi' && 'देवसी'}
                  {mode === 'rai' && 'रात्रि'}
                  {mode === 'pakkhi' && 'पाक्खी'}
                  {mode === 'samvatsari' && 'संवत्सरी'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* COMPLETED CELEBRATION VIEW */}
        {justCompletedMode && guidedStepIndex === null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 text-center shadow-lg flex flex-col items-center gap-4"
            key="completion-pane"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-bounce shadow-md">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[var(--text-spiritual)] serif-text">
                🙏 प्रतिक्रमण सम्पन्न
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-extrabold uppercase tracking-widest mt-1">
                {MODE_LABELS[justCompletedMode]} Succesfully Practiced
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                'मिच्छामि दुक्कडं' — जाने-अनजाने में हुए कषायों, अतिचारों, मर्यादा-भंग और प्रमाद दोषों का विसर्जन कर आत्मा निर्मल हुई है। सकल जीव सृष्टि कल्याण युक्त हो।
              </p>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] px-5 py-3.5 rounded-2xl flex items-center gap-6 justify-center w-full max-w-sm mt-2">
              <div className="text-center border-r border-[var(--border-color)] pr-6">
                <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Total Steps</span>
                <span className="text-lg font-black text-[var(--text-spiritual)]">{STEPS_DATA[justCompletedMode]?.length || 11}</span>
              </div>
              <div className="text-center">
                <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Sync Status</span>
                <span className="text-xs font-bold text-emerald-600 block mt-1">
                  {user ? (isSaving ? "Syncing..." : "Saved to Cloud") : "Local Guest Completed"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setJustCompletedMode(null)}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all mt-2 active:scale-95 shadow-md shadow-emerald-500/10"
            >
              मुख्य पृष्ठ पर लौटें
            </button>
          </motion.div>
        )}

        {/* GUIDED STEP-BY-STEP VIEW */}
        {guidedStepIndex !== null && currentStep && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-5 sm:p-6 shadow-sm flex flex-col gap-6 relative"
            key="guided-step"
          >
            {/* Top status: index indicator & Quit option */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[10px] font-black py-1 px-3 rounded-full">
                  सूत्र {guidedStepIndex + 1} / {steps.length}
                </span>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                  {MODE_LABELS[activeMode]}
                </span>
              </div>

              <button
                onClick={quitGuidedMode}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded-xl transition-all"
              >
                Quit Session
              </button>
            </div>

            {/* Middle: Centered beautiful display panel */}
            <div className="text-center py-4 flex flex-col gap-4">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-spiritual)] serif-text tracking-wide">
                {currentStep.name}
              </h3>
              
              <div className="bg-black/[0.01] dark:bg-white/[0.01] border border-[var(--border-color)] rounded-2xl p-4 max-h-[180px] sm:max-h-[220px] overflow-y-auto font-medium text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-200 serif-text text-center select-text scrollbar-thin">
                {currentStep.text}
              </div>

              <div className="flex items-start gap-2 justify-center max-w-xl mx-auto text-left bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-500/10">
                <HelpCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={14} />
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                  <strong>सत्र अर्थ / प्रयोजन:</strong> {currentStep.purpose}
                </p>
              </div>
            </div>

            {/* Progress-bar indicator */}
            <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${((guidedStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Bottom Actions and Integrated Circular Timer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 border-t border-[var(--border-color)] pt-5">
              
              {/* Left back */}
              <button
                onClick={handlePrevStep}
                disabled={guidedStepIndex === 0}
                className={`flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest py-3 px-4 rounded-xl transition-all border ${
                  guidedStepIndex === 0
                    ? 'text-gray-300 border-gray-100 dark:text-gray-700 dark:border-gray-800 pointer-events-none'
                    : 'text-gray-500 dark:text-gray-400 border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                }`}
              >
                <ChevronLeft size={16} />
                पिछला सूत्र (Back)
              </button>

              {/* Center: Timer circular controller */}
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  
                  {/* Progress Path */}
                  <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                    <circle
                      stroke="currentColor"
                      fill="transparent"
                      strokeWidth={stroke}
                      r={normalizedRadius}
                      cx={radius + stroke}
                      cy={radius + stroke}
                      className="text-black/5 dark:text-white/5 width-full height-full"
                    />
                    <circle
                      stroke="currentColor"
                      fill="transparent"
                      strokeWidth={stroke}
                      strokeDasharray={circumference + ' ' + circumference}
                      style={{ strokeDashoffset }}
                      strokeLinecap="round"
                      r={normalizedRadius}
                      cx={radius + stroke}
                      cy={radius + stroke}
                      className="text-emerald-600 transition-all duration-1000"
                    />
                  </svg>

                  <div className="text-center z-10">
                    <span className="text-sm font-black text-[var(--text-spiritual)]">
                      {Math.floor(timerLeft / 60)}:{(timerLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Pause/Play switch */}
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-3 rounded-full shadow-md text-white transition-all active:scale-90 ${
                    isTimerRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                  title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>

              {/* Right next */}
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-500/10"
              >
                {guidedStepIndex === steps.length - 1 ? 'प्रतिक्रमण सम्पन्न' : 'अगला सूत्र (Next)'}
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STATIC OVERVIEW MODE */}
        {guidedStepIndex === null && !justCompletedMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
            key="overview-pane"
          >
            {/* Overview Quick Stats banner */}
            <div className="bg-gradient-to-r from-emerald-600/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-sm shadow-emerald-500/10">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-emerald-800 dark:text-emerald-300 serif-text">
                    {MODE_LABELS[activeMode]}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Total sequence logs: <strong>{steps.length} holy Sutras</strong> • Approximated Duration: <strong>{totalDurationMinutes} mins</strong>.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 items-center sm:justify-end">
                <button
                  onClick={() => setIsPrintCustomizerOpen(!isPrintCustomizerOpen)}
                  className={`font-extrabold text-[11px] uppercase tracking-widest px-5 py-3.5 rounded-2xl transition-all active:scale-95 shrink-0 flex items-center gap-2 shadow-sm border ${
                    isPrintCustomizerOpen
                      ? 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:border-emerald-600'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:border-white/10'
                  }`}
                >
                  <Printer size={14} />
                  प्रिंट सेटअप (Print Options)
                </button>
                <button
                  onClick={startGuidedMode}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] uppercase tracking-widest px-5 py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-500/10 active:scale-95 shrink-0"
                >
                  प्रारम्भ करें (Start Guided)
                </button>
              </div>
            </div>

            {/* Highly Polished Booklet Customizer Card */}
            <AnimatePresence>
              {isPrintCustomizerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[var(--card-bg)] border border-emerald-500/30 rounded-3xl p-6 shadow-md overflow-hidden space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl mt-0.5">🖨️</span>
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400">
                          साधना पुस्तिका प्रिंट विन्यास (Physical Booklet Configuration)
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Configure layout, fonts, and contents prior to generating your high-fidelity physical booklet.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest px-4.5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                    >
                      <Printer size={12} />
                      प्रिंट / PRINT NOW
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Layout & Orientation Option */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                        पृष्ठ अभिविन्यास (Page Orientation)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPrintOrientation('portrait')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                            printOrientation === 'portrait'
                              ? 'bg-emerald-600/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                              : 'bg-transparent border-[var(--border-color)] text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          📄 खड़े पृष्ठ (Portrait)
                        </button>
                        <button
                          onClick={() => setPrintOrientation('landscape')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                            printOrientation === 'landscape'
                              ? 'bg-emerald-600/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                              : 'bg-transparent border-[var(--border-color)] text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          📖 आड़े पृष्ठ (Landscape)
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                        * Landscape is optimized for tables, wider booklets, or dual-column spreads.
                      </p>
                    </div>

                    {/* Font Size Option */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block flex justify-between items-center">
                        <span>अक्षर का आकार (Font Size)</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-black">
                          {printFontSize}pt
                        </span>
                      </label>
                      <div className="flex items-center gap-3 pt-1">
                        <input
                          type="range"
                          min="10"
                          max="24"
                          step="1"
                          value={printFontSize}
                          onChange={(e) => setPrintFontSize(parseInt(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                        <span>10pt (Small)</span>
                        <span>14pt (Regular)</span>
                        <span>24pt (Large)</span>
                      </div>
                    </div>

                    {/* Section Toggles Option */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                        पुस्तिका खंड (Included Sections)
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--border-color)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <input
                            type="checkbox"
                            checked={printSections.cover}
                            onChange={(e) => setPrintSections({ ...printSections, cover: e.target.checked })}
                            className="rounded border-gray-300 dark:border-white/10 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Cover Page</span>
                        </label>
                        <label className="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--border-color)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <input
                            type="checkbox"
                            checked={printSections.intro}
                            onChange={(e) => setPrintSections({ ...printSections, intro: e.target.checked })}
                            className="rounded border-gray-300 dark:border-white/10 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Rules Intro</span>
                        </label>
                        <label className="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--border-color)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <input
                            type="checkbox"
                            checked={printSections.sutras}
                            onChange={(e) => setPrintSections({ ...printSections, sutras: e.target.checked })}
                            className="rounded border-gray-300 dark:border-white/10 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Sutras</span>
                        </label>
                        <label className="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--border-color)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <input
                            type="checkbox"
                            checked={printSections.glossary}
                            onChange={(e) => setPrintSections({ ...printSections, glossary: e.target.checked })}
                            className="rounded border-gray-300 dark:border-white/10 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Glossary</span>
                        </label>
                        <div className="col-span-2">
                          <label className="flex items-center gap-2 p-1.5 rounded-xl border border-[var(--border-color)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <input
                              type="checkbox"
                              checked={printSections.colophon}
                              onChange={(e) => setPrintSections({ ...printSections, colophon: e.target.checked })}
                              className="rounded border-gray-300 dark:border-white/10 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Colophon / Conclusion</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List of steps to be chanted */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4 border-b border-[var(--border-color)] pb-2">
                Sequence of Chanting Sutras
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="pratikraman-steps-grid">
                {steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="flex justify-between items-start gap-4 p-3 bg-black/[0.01] dark:bg-white/[0.01] border border-[var(--border-color)] rounded-xl"
                  >
                    <div className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-[9px] font-black text-gray-400 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-[var(--text-spiritual)]">
                          {step.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">
                          {step.purpose}
                        </p>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                      <Clock size={10} />
                      {step.duration < 60 ? `${step.duration}s` : `${Math.ceil(step.duration / 60)}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* User logs histories subcollection */}
            {user && historyLogs.length > 0 && (
              <div className="flex flex-col gap-3 mt-2" id="pratikraman-logs-list">
                <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
                  <History className="text-emerald-600 dark:text-emerald-400" size={14} />
                  <h5 className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Your Practiced completions ({historyLogs.length}/7)
                  </h5>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {historyLogs.map((log) => {
                    const dt = log.completedAt?.toDate?.() || (log.completedAt ? new Date(log.completedAt) : new Date());
                    const dtStr = dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    return (
                      <div
                        key={log.id}
                        className="bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-3 rounded-2xl flex justify-between items-center gap-4 shadow-sm"
                      >
                        <div className="flex gap-3 items-center">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/15 flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <h6 className="text-[12px] font-extrabold text-[var(--text-spiritual)]">
                              {getLogModeLabel(log.mode)}
                            </h6>
                            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{dtStr}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block bg-black/5 dark:bg-white/5 py-1 px-2.5 rounded-full">
                            {log.stepsCompleted || steps.length} steps • {Math.ceil((log.totalDuration || totalDurationSeconds) / 60)} mins
                          </span>

                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/25 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Remove log entry"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Floating Print Button */}
      <button
        onClick={() => window.print()}
        className="fixed bottom-24 right-6 z-50 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center gap-2 group print:hidden"
        title="Print Sacred Guide (प्रिंट करें)"
        id="floating-print-btn"
      >
        <Printer size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-xs uppercase tracking-wider whitespace-nowrap">
          प्रिंट / Print
        </span>
      </button>

      {/* 
        ========================================
        BEAUTIFUL SACRED TEXT PRINT BOOKLET VIEW
        ========================================
        Visible ONLY during print layout. It implements standard physical booklet 
        conventions, with double-borders, elegant Noto/Georgia typography, 
        and automatic page breaks avoiding orphan headings.
      */}
      <div className="hidden print:block w-full bg-white text-black p-8 font-serif" id="pratikraman-print-booklet">
        {/* Style block for specialized print media overrides */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
              font-family: "Noto Serif", "Georgia", "Times New Roman", serif !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              counter-reset: page;
            }
            /* Hide everything in the body except the printable booklet */
            body > *:not(#pratikraman-print-booklet) {
              display: none !important;
            }
            #root, #root > *, header, footer, nav, aside, button, .no-print, #pratikraman-guide-module, #floating-print-btn, #floating-print-btn * {
              display: none !important;
            }
            #pratikraman-print-booklet {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              visibility: visible !important;
            }
            #pratikraman-print-booklet * {
              visibility: visible !important;
              color: #000000 !important;
            }
            @page {
              size: A4 ${printOrientation};
              margin: 20mm 20mm 25mm 20mm;
            }
            
            /* Cover Page Styling */
            .booklet-cover {
              page-break-after: always;
              break-after: page;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 90vh;
              text-align: center;
              border: 8px double #059669 !important;
              padding: 60px 30px;
              margin: 40px auto;
              box-sizing: border-box;
            }

            .booklet-divider {
              width: 50%;
              height: 3px;
              background-color: #059669 !important;
              margin: 30px auto;
            }

            .sutra-card {
              page-break-inside: avoid;
              break-inside: avoid;
              border-bottom: 2px solid #e2e8f0;
              padding: 30px 0;
              margin-bottom: 24px;
            }

            .sutra-title {
              font-size: ${printFontSize + 4}pt !important;
              font-weight: bold;
              color: #047857 !important;
              margin-bottom: 12px;
              page-break-after: avoid;
              break-after: avoid;
            }

            .sutra-purpose {
              font-size: ${printFontSize - 2}pt !important;
              font-style: italic;
              color: #374151 !important;
              margin-bottom: 16px;
              page-break-after: avoid;
              break-after: avoid;
              border-left: 4px solid #059669 !important;
              padding-left: 12px;
            }

            .sutra-text {
              font-size: ${printFontSize}pt !important;
              line-height: 2.0 !important;
              color: #000000 !important;
              text-align: justify !important;
              text-justify: inter-word !important;
              font-weight: 500;
            }

            .booklet-intro {
              font-size: ${printFontSize - 1}pt !important;
              text-align: justify !important;
            }

            .sacred-om {
              font-size: 42pt !important;
              color: #047857 !important;
              margin-bottom: 24px;
            }

            /* Repeating Watermark */
            .booklet-page-watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 72pt !important;
              font-weight: 900 !important;
              color: rgba(5, 150, 105, 0.04) !important;
              text-transform: uppercase !important;
              letter-spacing: 0.1em !important;
              white-space: nowrap !important;
              pointer-events: none !important;
              z-index: -1000 !important;
              font-family: sans-serif !important;
            }

            /* Repeating Footer for Page Numbers (Page X of Y) */
            .booklet-footer {
              position: fixed;
              bottom: -15mm;
              left: 0;
              right: 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9pt !important;
              color: #4b5563 !important;
              font-family: "Noto Serif", "Georgia", serif !important;
              border-top: 1px solid #e5e7eb;
              padding-top: 6px;
            }

            .page-number-text::after {
              counter-increment: page;
              content: "पृष्ठ / Page " counter(page) " of " counter(pages);
              font-weight: bold;
            }
          }
        `}} />

        {/* REPEATING WATERMARK ON EACH PRINT PAGE */}
        <div className="booklet-page-watermark">Terapanth AI</div>

        {/* COVER PAGE */}
        {printSections.cover && (
          <div className="booklet-cover">
            <div className="sacred-om">ॐ</div>
            <h1 className="text-4xl font-extrabold text-emerald-800 leading-tight mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              प्रतिक्रमण साधना पुस्तिका
            </h1>
            <p className="text-lg uppercase tracking-widest text-emerald-600 font-bold mb-4">
              {MODE_LABELS[activeMode]}
            </p>
            <div className="booklet-divider"></div>
            <p className="text-sm text-gray-700 max-w-lg mx-auto leading-relaxed italic mb-8 booklet-intro" style={{ textAlign: 'justify' }}>
              "खामेमि सव्वजीवे, सव्वे जीवा खमंतु मे, मित्ती मे सव्वभूएसु, वेरं मज्झं न केणइ।"<br />
              संसार के समस्त चर-अचर प्राणियों से क्षमायाचना और जीव-कल्याण की पावनतम साधना।
            </p>
            <div className="mt-12 text-xs text-gray-500 uppercase tracking-widest font-semibold">
              जैन श्वेतांबर तेरापंथ धर्म संघ • आध्यात्मिक स्वाध्याय एवं आत्म-विशुद्धि पुस्तिका
            </div>
          </div>
        )}

        {/* BRIEF INTRODUCTION SECTION */}
        {printSections.intro && (
          <div className="py-6 border-b-2 border-emerald-600 mb-8" style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
            <h2 className="text-2xl font-bold text-emerald-800 mb-3" style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>प्रतिक्रमण विधि एवं नियम</h2>
            <p className="text-sm leading-relaxed text-gray-800 mb-4 booklet-intro">
              प्रतिक्रमण का अर्थ है पीछे लौटना। दिनभर या निश्चित समय में की गई भूलों, मर्यादाओं के अतिक्रमण और कषायों के पश्चाताप हेतु गुरु-निर्देशानुसार या शुद्ध आसन पर बैठकर एकाग्र चित्त से मंत्रोच्चार करें।
            </p>
            <ul className="list-disc pl-5 text-xs text-gray-700 space-y-2">
              <li><strong>आसन:</strong> शांत, पवित्र स्थान पर पूर्व या उत्तर की ओर मुख करके बैठें।</li>
              <li><strong>उच्चारण:</strong> प्रत्येक प्राकृत एवं संस्कृत सूत्रों का शुद्ध व स्पष्ट स्वर में वाचन करें।</li>
              <li><strong>मनोभाव:</strong> हृदय में पूर्ण क्षमाशीलता, मैत्री भाव और राग-द्वेष रहित वीतराग भाव रखें।</li>
            </ul>
          </div>
        )}

        {/* SACRED SUTRAS */}
        {printSections.sutras && (
          <div className="sutras-list">
            {steps.map((step, idx) => (
              <div key={idx} className="sutra-card">
                <h3 className="sutra-title">
                  {idx + 1}. {step.name}
                </h3>
                <div className="sutra-purpose">
                  <strong>प्रयोजन व अर्थ:</strong> {step.purpose}
                </div>
                <div className="sutra-text">
                  {step.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GLOSSARY SECTION */}
        {printSections.glossary && (
          <div className="py-8 border-t border-emerald-600 mt-8" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
            <h2 className="text-2xl font-bold text-emerald-800 mb-6" style={{ pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>पारिभाषिक शब्दावली (Glossary)</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="border-b border-gray-200 pb-3" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-base font-bold text-emerald-700">प्रतिक्रमण (Pratikraman)</h4>
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">पीछे लौटना - भूलों का परिमार्जन व आत्म-विशुद्धि की आध्यात्मिक प्रक्रिया।</p>
                </div>
                <div className="border-b border-gray-200 pb-3" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-base font-bold text-emerald-700">अतिचार (Atichara)</h4>
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">व्रतों में लगने वाले सूक्ष्म दोष या सीमाओं का अनजाने में उल्लंघन।</p>
                </div>
                <div className="border-b border-gray-200 pb-3" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-base font-bold text-emerald-700">कायोत्सर्ग (Kayotsarga)</h4>
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">शरीर के प्रति ममत्व का त्याग कर स्थिर ध्यानलीन होने की मुद्रा।</p>
                </div>
                <div className="border-b border-gray-200 pb-3" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-base font-bold text-emerald-700">मिच्छामि दुक्कडं (Michchhami Dukkadam)</h4>
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">मेरा दुष्कृत्य मिथ्या हो - प्राणी मात्र से हृदयपूर्वक क्षमायाचना।</p>
                </div>
                <div className="border-b border-gray-200 pb-3" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-base font-bold text-emerald-700">सामायिक (Samayika)</h4>
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">समभाव की साधना - नियत समय के लिए समस्त पापकारी प्रवृत्तियों का त्याग।</p>
                </div>
                <div className="border-b border-gray-200 pb-3" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <h4 className="text-base font-bold text-emerald-700">तस्स मिच्छामि दुक्कडं (Tassa Michchhami Dukkadam)</h4>
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">सारे पापमय आचरणों के कुप्रभाव का पूर्णतया विसर्जन होना।</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COLOPHON / CONCLUSION */}
        {printSections.colophon && (
          <div className="text-center mt-12 pt-8 border-t border-gray-300 mb-16" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <p className="text-base font-bold text-emerald-800">
              तस्स मिच्छामि दुक्कडं ॥
            </p>
            <p className="text-xs text-gray-500 mt-2">
              प्रतिक्रमण साधना पुस्तिका • जैन तेरापंथ एआई हब
            </p>
          </div>
        )}

        {/* Repeating Footer for Page Numbers (automatically repeated on print via fixed positioning) */}
        <div className="booklet-footer hidden print:flex">
          <span className="text-xs text-gray-500 font-sans">जैन तेरापंथ धर्म संघ</span>
          <span className="page-number-text font-serif text-xs text-emerald-800"></span>
        </div>
      </div>
    </div>
  );
}
