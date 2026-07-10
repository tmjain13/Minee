// src/utils/viharSearchEngine.ts

export interface SearchResult {
  type: 'location' | 'quiz' | 'none';
  data: any | null;
}

export const viharSearchEngine = (
  query: string,
  quizDb: any[],
  locationDb: any[]
): SearchResult => {
  // Transliteration bridge to support typing in Hinglish / English
  const HINGLISH_MAP: Record<string, string> = {
    "vinay": "विनय",
    "vimal": "विमल",
    "udit": "उदित",
    "jay": "जय",
    "jai": "जय",
    "abhijit": "अभिजित",
    "abhijeet": "अभिजित",
    "sanghamitra": "संघमित्रा",
    "sanghmitra": "संघमित्रा",
    "suvrata": "सुव्रता",
    "subrata": "सुव्रता",
    "sumanshri": "सुमनश्री",
    "sumansri": "सुमनश्री",
    "raviprabha": "रविप्रभा",
    "kundanrekha": "कुन्दनरेखा",
    "kundan": "कुन्दनरेखा",
    "labdhiprabha": "लब्धिप्रभा",
    "labdhi": "लब्धिप्रभा",
    "delhi": "दिल्ली",
    "faridabad": "फरीदाबाद",
    "rohini": "रोहिणी",
    "pitampura": "पीतमपुरा",
    "samayik": "सामायिक",
    "samayika": "सामायिक",
    "pratikraman": "प्रतिक्रमण",
    "maryada": "मर्यादा",
    "paryushan": "पर्युषण",
    "anuvrat": "अणुव्रत",
    "ashtami": "अष्टमी",
    "upvas": "उपवास",
    "upwas": "उपवास"
  };

  const cleanQuery = query.trim().toLowerCase();
  const searchWords = cleanQuery.split(/\s+/).filter(w => w.length > 1);

  // Extend query and words with Hindi translations if matching Hinglish was typed
  const translatedWords: string[] = [];
  searchWords.forEach(word => {
    for (const [key, value] of Object.entries(HINGLISH_MAP)) {
      if (word.includes(key) || key.includes(word)) {
        if (!translatedWords.includes(value)) {
          translatedWords.push(value);
        }
      }
    }
  });

  const finalSearchWords = [...searchWords, ...translatedWords];
  const effectiveQuery = cleanQuery + " " + translatedWords.join(" ");

  if (finalSearchWords.length === 0) {
    return { type: 'none', data: null };
  }

  // 1. SEARCH LOCATIONS (प्रवास-स्थल)
  let bestLocation = null;
  let maxLocScore = 0;

  locationDb.forEach(saint => {
    let score = 0;
    const saintName = saint.name ? saint.name.toLowerCase() : '';
    const saintLocation = saint.location ? saint.location.toLowerCase() : '';
    const saintAddress = saint.address ? saint.address.toLowerCase() : '';
    const saintStatus = saint.status ? saint.status.toLowerCase() : '';
    const saintTitle = saint.title ? saint.title.toLowerCase() : '';

    const searchString = `${saintName} ${saintLocation} ${saintAddress} ${saintStatus} ${saintTitle}`;

    // Direct name substring matches (e.g., matching 'सुमनश्री जी')
    const cleanSaintName = saintName.replace(/जी/g, '').trim();
    if (effectiveQuery.includes(cleanSaintName) && cleanSaintName.length > 2) {
      score += 15;
    }

    // Direct location word match checks
    finalSearchWords.forEach(word => {
      if (searchString.includes(word)) {
        score += 3;
      }
    });

    if (score > maxLocScore) {
      maxLocScore = score;
      bestLocation = saint;
    }
  });

  // 2. SEARCH QUIZ (तत्त्वज्ञान)
  let bestQuiz = null;
  let maxQuizScore = 0;

  quizDb.forEach(item => {
    let score = 0;
    const qText = item.question ? item.question.toLowerCase() : '';
    const ansText = item.explanation ? item.explanation.toLowerCase() : '';

    if (effectiveQuery.includes(qText.slice(0, 15)) && qText.length > 10) {
      score += 10;
    }

    finalSearchWords.forEach(word => {
      if (qText.includes(word)) score += 3;
      if (ansText.includes(word)) score += 1;
    });

    if (score > maxQuizScore) {
      maxQuizScore = score;
      bestQuiz = item;
    }
  });

  // 3. DECISION LOGIC
  const threshold = 1.5;
  if (maxLocScore >= maxQuizScore && maxLocScore > threshold && bestLocation) {
    return { type: 'location', data: bestLocation };
  } else if (maxQuizScore > threshold && bestQuiz) {
    return { type: 'quiz', data: bestQuiz };
  } else {
    return { type: 'none', data: null };
  }
};

// Monastic helpline records (Kashids) for unified searching across tabs
export const masterViharLedger = [
  // CENTRAL COMMAND
  { id: 1, region: "RAJASTHAN", zone: "लाडनूं", thana: "धवल सेना", name: "आचार्य श्री महाश्रमणजी (धवल सेना सह)", venue: "महाश्रमण विहार, जैन विश्व भारती, लाडनूं, राजस्थान", contact: "केन्द्रीय शिविर कार्यालय", phone: "7044448888" },
  
  // DELHI / NCR SECTOR (UPDATED COMPREHENSIVE LIST - NO MISSING MONKS)
  { id: 2, region: "DELHI", zone: "मॉडल टाउन", thana: "ठाणा-२", name: "मुनिश्री विनय कुमार जी (आलोक)", venue: "तेरापंथ भवन, के-13, मॉडल टाउन-2, दिल्ली-110009", contact: "कासीद अशोक / संतोष कुमार", phone: "9216024300" },
  { id: 3, region: "DELHI", zone: "नोएडा", thana: "ठाणा-४", name: "मुनिश्री विमल कुमारजी (शासनश्री)", venue: "श्री सुरेन्द्र नाहटा, ए-713, सैक्टर-19, नोएडा, उत्तर प्रदेश-201301", contact: "कासीद राजेश", phone: "7827509290" },
  { id: 4, region: "DELHI", zone: "शालीमार बाग", thana: "ठाणा-३", name: "मुनिश्री उदित कुमार जी (बहुश्रुत)", venue: "गोयल आस्था भवन, ए.जी.-21, शालीमार बाग, दिल्ली-110088", contact: "कासीद लक्ष्मण", phone: "9983478999" },
  { id: 5, region: "DELHI", zone: "लाजपत नगर", thana: "ठाणा-३", name: "मुनिश्री जय कुमार जी", venue: "गेल्डा प्रेक्षा सदन, ओ-62, लाजपत नगर, दिल्ली-110024", contact: "कासीद अनिल", phone: "8340297415" },
  { id: 6, region: "DELHI", zone: "आर. के. पुरम", thana: "ठाणा-२", name: "मुनिश्री अभिजीत कुमार जी (डा.)", venue: "श्री कैलाश गोयल, 41, आराधना एन्क्लेव, आर. के. पुरम, सैक्टर-13, दिल्ली-110066", contact: "कासीद विनय", phone: "9721168623" },
  { id: 7, region: "DELHI", zone: "ग्रीन पार्क", thana: "ठाणा-५", name: "साध्वीश्री संघमित्राजी (शासनश्री)", venue: "गोयल श्रद्धा निवास, सी-14, ग्रीन पार्क मेन, दिल्ली-110016", contact: "कासीद लालराम", phone: "9950120242" },
  { id: 8, region: "DELHI", zone: "मंडी हाउस", thana: "ठाणा-४", name: "साध्वीश्री सुव्रता जी (शासनश्री)", venue: "अणुव्रत भवन, 210, दीनदयाल उपाध्याय मार्ग, नई दिल्ली-110002", contact: "कासीद अरूण", phone: "8375941210" },
  { id: 9, region: "DELHI", zone: "रोहिणी", thana: "ठाणा-४", name: "साध्वीश्री सुमनश्री जी (शासनश्री)", venue: "तेरापंथ भवन, सैक्टर-05, रोहिणी, दिल्ली-110085", contact: "कासीद पूरन", phone: "9915501240" },
  { id: 10, region: "DELHI", zone: "विवेक विहार", thana: "ठाणा-५", name: "साध्वीश्री रविप्रभाजी (शासनश्री)", venue: "ओसवाल भवन, बी-69, विवेक विहार-2, दिल्ली-110095", contact: "कासीद जयदेव", phone: "8104273773" },
  { id: 11, region: "DELHI", zone: "मॉडल टाउन", thana: "ठाणा-३", name: "साध्वीश्री डा. कुन्दनरेखाजी", venue: "श्री अमरदीप जैन, बी-2/7,  मॉडल टाउन-2, नई दिल्ली-110009", contact: "कासीद दिनेश", phone: "9599060813" },
  { id: 12, region: "DELHI", zone: "छतरपुर", thana: "ठाणा-३", name: "साध्वीश्री लब्धिप्रभाजी", venue: "अध्यात्म साधना केन्द्र (महाश्रमण सदन), छतरपुर रोड़, दिल्ली-110074", contact: "राजू", phone: "9310563356" },

  // RAJASTHAN
  { id: 11, region: "RAJASTHAN", zone: "राजनगर", thana: "ठाणा ३", name: "मुनिश्री संजयकुमार जी", venue: "चंडालिया भवन, गांधी सेवा सदन के सामने, राजनगर, राजस्थान", contact: "सम्पर्क सूत्र (मार्ग सूचना)", phone: "9819063015" },
  { id: 12, region: "RAJASTHAN", zone: "जयपुर", thana: "आदि ठाणा २", name: "मुनिश्री तत्व रुचि जी 'तरुण'", venue: "चौरडिया विला, कमला नेहरू नगर, अजमेर रोड, जयपुर, राजस्थान", contact: "सम्पर्क सूत्र (मार्ग सूचना)", phone: "9660692852" },
  { id: 13, region: "RAJASTHAN", zone: "बालोतरा", thana: "ठाणा ३", name: "साध्वीश्री सत्यप्रभाजी (शासनश्री)", venue: "तेरापंथ भवन, अग्रवाल कॉलोनी, बालोतरा, राजस्थान", contact: "बालोतरा प्रभाग प्रभार", phone: "N/A" },

  // GUJARAT
  { id: 14, region: "GUJARAT", zone: "शाहीबाग", thana: "आदि ठाणा-३", name: "मुनिश्री मुनिसुव्रत कुमार जी स्वामी", venue: "अर्हम कुंज, तेरापंथ भवन के पास, शाहीबाग, अहमदाबाद, गुजरात", contact: "सम्पर्क सूत्र", phone: "7021591184" },
  { id: 15, region: "GUJARAT", zone: "सूरत / उधना / वेसु", thana: "ठाणा ३", name: "डॉ. मुनिश्री मदन कुमारजी स्वामी", venue: "ग्रीन विक्ट्री, B-4, अलथान भीमराड़ रोड, वेसु, सूरत, उधना, गुजरात", contact: "सम्पर्क सूत्र", phone: "6377377427" },
  { id: 16, region: "GUJARAT", zone: "सूरत / सिटीलाइट", thana: "ठाणा-५", name: "साध्वीश्री मधुबालाजी (शासनश्री)", venue: "तेरापंथ भवन, सिटीलाइट, सूरत, गुजरात", contact: "सूरत सभा डेस्क", phone: "N/A" },

  // MAHARASHTRA
  { id: 17, region: "MAHARASHTRA", zone: "चेम्बूर", thana: "ठाणा-५", name: "साध्वीश्री कंचनप्रभाजी (शासनश्री)", venue: "तेरापंथ भवन, चेम्बुर, मुंबई, महाराष्ट्र", contact: "सम्पर्क सूत्र", phone: "7061598749" },
  { id: 18, region: "MAHARASHTRA", zone: "ठाणे", thana: "ठाणा-३", name: "साध्वीश्री शिवमालाजी (शासनश्री)", venue: "कोपरी तेरापंथ भवन, किशोर नगर, ठाणे (पूर्व), महाराष्ट्र", contact: "सम्पर्क सूत्र", phone: "9892302847" }
];

export const executeKashidSearch = (query: string, ledger: any[] = masterViharLedger): any[] => {
  if (!query || !query.trim()) return ledger;
  const qClean = query.trim().toLowerCase();
  return ledger.filter(item => {
    return (
      (item.name && item.name.toLowerCase().includes(qClean)) ||
      (item.venue && item.venue.toLowerCase().includes(qClean)) ||
      (item.zone && item.zone.toLowerCase().includes(qClean)) ||
      (item.region && item.region.toLowerCase().includes(qClean)) ||
      (item.thana && item.thana.toLowerCase().includes(qClean))
    );
  });
};
