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

  // 2. SEARCH QUIZ (तत्त्वज्ञान प्रश्नोत्तरी)
  let bestQuiz = null;
  let maxQuizScore = 0;

  quizDb.forEach(item => {
    let score = 0;
    const qText = item.question ? item.question.toLowerCase() : '';
    const expText = item.explanation ? item.explanation.toLowerCase() : '';
    const optText = (item.options && Array.isArray(item.options)) ? item.options.join(' ').toLowerCase() : '';

    const searchString = `${qText} ${expText} ${optText}`;

    finalSearchWords.forEach(word => {
      if (searchString.includes(word)) {
        score += 2;
      }
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
  }
  return { type: 'none', data: null };
};

export const masterViharLedger = [
  // DELHI / NCR SECTOR (UPDATED COMPREHENSIVE LIST - NO MISSING MONKS)
  { id: 1, region: "DELHI", zone: "शाहदरा", thana: "ठाना-४", name: "मुनिश्री विमल कुमारजी (शासनश्री)", venue: "श्री पूनमचन्द कमल संतोष मनोज दूगड, 30/55ए, गली न.-8, विश्वास नगर, शाहदरा दिल्ली-110092", contact: "कासीद राजेश", phone: "7827509290" },
  { id: 2, region: "DELHI", zone: "पीतमपुरा", thana: "ठाना-३", name: "मुनिश्री उदित कुमार जी (बहुश्रुत)", venue: "श्री मनोज विमल कमल पटावरी, बी-115, पुष्पांजलि एन्क्लेव, पीतमपुरा दिल्ली-110034", contact: "कासीद लक्ष्मण", phone: "9983478999" },
  { id: 3, region: "DELHI", zone: "समालका", thana: "ठाना-३", name: "मुनिश्री जय कुमार जी", venue: "श्रीमती सायर बैंगानी, 17/21, टेलिफोन एक्सचेंज रोड़, समालका दिल्ली-110037", contact: "कासीद अनिल", phone: "8340297415" },
  { id: 4, region: "DELHI", zone: "राजगढ़ कॉलोनी", thana: "ठाना-२", name: "मुनिश्री अभिजीत कुमार जी (डा.)", venue: "श्री मनोज सांड एवं श्री पुखराज डागा निवास-164, ए/1, तृतीय तल, राजगढ़ कॉलोनी दिल्ली-110031", contact: "कासीद देवेश कुमार / विनय", phone: "8291669704 / 9721168623" },
  { id: 5, region: "DELHI", zone: "ग्रीन पार्क", thana: "ठाना-५", name: "साध्वीश्री संघमित्राजी (शासनश्री)", venue: "गोयल श्रद्धा निवास, सी-14, ग्रीन पार्क मेन, दिल्ली-110016", contact: "कासीद लालराम", phone: "9950120242" },
  { id: 6, region: "DELHI", zone: "मंडी हाउस", thana: "ठाना-४", name: "साध्वीश्री सुव्रता जी (शासनश्री)", venue: "अणुव्रत भवन, 210, दीनदयाल उपाध्याय मार्ग, नई दिल्ली-110002", contact: "कासीद अरूण", phone: "8375941210" },
  { id: 7, region: "DELHI", zone: "रोहिणी", thana: "ठाना-४", name: "साध्वीश्री सुमनश्री जी (शासनश्री)", venue: "तेरापंथ भवन, सैक्टर-05, रोहिणी, दिल्ली-110085", contact: "कासीद पूरन", phone: "9915501240" },
  { id: 8, region: "DELHI", zone: "रामप्रस्थ", thana: "ठाना-५", name: "साध्वीश्री रविप्रभाजी (शासनश्री)", venue: "श्री भारत भूषण सिंघल, डी-09, रामप्रस्थ, गाजियाबाद यू.पी.-201011", contact: "कासीद दिनेश", phone: "9599060813" },
  { id: 9, region: "DELHI", zone: "मॉडल टाउन", thana: "ठाना-३", name: "साध्वीश्री डा. कुन्दनरेखाजी", venue: "तेरापंथ भवन, के-13,  मॉडल टाउन-2, नई दिल्ली-110009", contact: "कासीद जयदेव", phone: "8104273773" },
  { id: 10, region: "DELHI", zone: "फरीदाबाद", thana: "ठाना-३", name: "साध्वीश्री लब्धिप्रभाजी", venue: "श्री रोसन लाल बोरड़, मकान-173, सैक्टर-09, फरीदाबाद-121006", contact: "N/A", phone: "9810035137" },

  // RAJASTHAN
  { id: 11, region: "RAJASTHAN", zone: "राजनगर", thana: "ठाना-३", name: "मुनिश्री संजयकुमार जी", venue: "चंडालिया भवन, गांधी सेवा सदन के सामने, राजनगर, राजस्थान", contact: "सम्पर्क सूत्र (मार्ग सूचना)", phone: "9819063015" },
  { id: 12, region: "RAJASTHAN", zone: "जयपुर", thana: "आदि ठाना-२", name: "मुनिश्री तत्व रुचि जी 'तरुण'", venue: "चौरडिया विला, कमला नेहरू नगर, अजमेर रोड, जयपुर, राजस्थान", contact: "सम्पर्क सूत्र (मार्ग सूचना)", phone: "9660692852" },
  { id: 13, region: "RAJASTHAN", zone: "बालोतरा", thana: "ठाना-३", name: "साध्वीश्री सत्यप्रभाजी (शासनश्री)", venue: "तेरापंथ भवन, अग्रवाल कॉलोनी, बालोतरा, राजस्थान", contact: "बालोतरा प्रभाग प्रभार", phone: "N/A" },

  // GUJARAT
  { id: 14, region: "GUJARAT", zone: "शाहीबाग", thana: "आदि ठाना-३", name: "मुनिश्री मुनिसुव्रत कुमार जी स्वामी", venue: "अर्हम कुंज, तेरापंथ भवन के पास, शाहीबाग, अहमदाबाद, गुजरात", contact: "सम्पर्क सूत्र", phone: "7021591184" },
  { id: 15, region: "GUJARAT", zone: "सूरत / उधना / वेसु", thana: "ठाना-३", name: "डॉ. मुनिश्री मदन कुमारजी स्वामी", venue: "ग्रीन विक्ट्री, B-4, अलथान भीमराड़ रोड, वेसु, सूरत, उधना, गुजरात", contact: "सम्पर्क सूत्र", phone: "6377377427" },
  { id: 16, region: "GUJARAT", zone: "सूरत / सिटीलाइट", thana: "ठाना-५", name: "साध्वीश्री मधुबालाजी (शासनश्री)", venue: "तेरापंथ भवन, सिटीलाइट, सूरत, गुजरात", contact: "सूरत सभा डेस्क", phone: "N/A" },

  // MAHARASHTRA
  { id: 17, region: "MAHARASHTRA", zone: "चेम्बूर", thana: "ठाना-५", name: "साध्वीश्री कंचनप्रभाजी (शासनश्री)", venue: "तेरापंथ भवन, चेम्बुर, मुंबई, महाराष्ट्र", contact: "सम्पर्क सूत्र", phone: "7061598749" },
  { id: 18, region: "MAHARASHTRA", zone: "ठाणे", thana: "ठाना-३", name: "साध्वीश्री शिवमालाजी (शासनश्री)", venue: "कोपरी तेरापंथ भवन, किशोर नगर, ठाणे (पूर्व), महाराष्ट्र", contact: "सम्पर्क सूत्र", phone: "9892302847" }
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
