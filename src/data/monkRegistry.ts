export interface MonkProfile {
  infoId: number;
  name: string;
  nameEn?: string;
  title: string;
  image?: string;
  category: 'Acharya' | 'Muni' | 'Sadhwi' | 'Saman' | 'Samman' | 'Mumukshu';
  achievements?: string[];
  base?: string;
  details?: string;
  literaryWorks?: string[];
  diksha?: string;
  dikshaBy?: string;
  born?: string;
}

export interface ViharGroup {
  id: string;
  leaderName: string;
  region: string;
  membersCount: number;
  currentStay: string;
  purpose: string;
}

export interface MonasticLiterature {
  id: string;
  title: string;
  author: string;
  language: string;
  category: string;
  description: string;
}

export const MONK_REGISTRY: MonkProfile[] = [
  // ========== ACHARYA ==========
  {
    infoId: 1,
    name: "आचार्य श्री महाश्रमण जी",
    nameEn: "Acharya Shri Mahashraman",
    title: "11वें आचार्य — तेरापंथ धर्मसंघ के सर्वोच्च प्रमुख",
    category: "Acharya",
    diksha: "5 मई 1974, सरदारशहर",
    dikshaBy: "मंत्री मुनि श्री सुमेरमल जी (लाडनूं)",
    born: "13 मई 1962, सरदारशहर, राजस्थान",
    achievements: [
      "तेरापंथ के 11वें एवं वर्तमान आचार्य",
      "त्रि-राष्ट्र अहिंसा यात्रा — 55,000+ किमी पदयात्रा (भारत, नेपाल, भूटान)",
      "अणुव्रत आंदोलन के वर्तमान संचालक",
      "प्रेक्षाध्यान एवं जीवन विज्ञान के प्रसारक"
    ],
    base: "विहारशील — वर्तमान में राजस्थान",
    details: "आचार्यश्री महाश्रमण जी तेरापंथ धर्मसंघ के 11वें आचार्य हैं। उनका जन्म 13 मई 1962 को सरदारशहर में हुआ। मात्र 12 वर्ष की आयु में 5 मई 1974 को दीक्षा ग्रहण की। उनकी त्रि-राष्ट्र अहिंसा पदयात्रा 55,000 किमी से अधिक पूरी हो चुकी है।"
  },

  // ========== MUKHYA NIYOJIKA ==========
  {
    infoId: 2,
    name: "साध्वी प्रमुखा श्री विश्रुतविभा जी",
    nameEn: "Sadhvi Pramukha Vishrutvibha",
    title: "मुख्य नियोजिका — साध्वी श्रेणी प्रमुख",
    category: "Sadhwi",
    diksha: "—",
    dikshaBy: "—",
    born: "—",
    achievements: [
      "तेरापंथ साध्वी श्रेणी की वर्तमान सर्वोच्च नियोजिका",
      "साध्वी प्रमुखा कनकप्रभा जी की उत्तराधिकारी (2022 से)",
      "बहुश्रुत परिषद की वरिष्ठ सदस्या",
      "साध्वी शिक्षण एवं संगठन में अग्रणी"
    ],
    base: "लाडनूं / आचार्यश्री के साथ विहार",
    details: "साध्वी प्रमुखा विश्रुतविभा जी साध्वी प्रमुखा कनकप्रभा जी (17 मार्च 2022 को महाप्रयाण) के बाद तेरापंथ की नवीं एवं वर्तमान मुख्य नियोजिका हैं।"
  },

  // ========== MUNIS (from official Chaturmas list) ==========
  {
    infoId: 3,
    name: "मुनि श्री आलोक कुमार जी",
    nameEn: "Muni Alok Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—",
    dikshaBy: "—",
    born: "—",
    achievements: ["सेवा केंद्र छापर का संचालन", "ग्रामीण क्षेत्रों में धर्म प्रसार"],
    base: "सेवा केंद्र छापर",
    details: "मुनि आलोक कुमार जी सेवा केंद्र छापर में धार्मिक एवं सामाजिक कार्य करते हैं।"
  },
  {
    infoId: 4,
    name: "मुनि श्री राज करण जी",
    nameEn: "Muni Raj Karan",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["गंगाशहर क्षेत्र में धर्म प्रसार"],
    base: "गंगाशहर",
    details: "मुनि राज करण जी गंगाशहर में धार्मिक कार्य करते हैं।"
  },
  {
    infoId: 5,
    name: "मुनि श्री सुव्रत कुमार जी",
    nameEn: "Muni Suvrat Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["बाड़मेर क्षेत्र में साधना एवं प्रवचन"],
    base: "बाड़मेर",
    details: "मुनि सुव्रत कुमार जी बाड़मेर क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 6,
    name: "मुनि श्री संजय कुमार जी",
    nameEn: "Muni Sanjay Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["गोगुंदा क्षेत्र में धर्म प्रसार"],
    base: "गोगुंदा",
    details: "मुनि संजय कुमार जी गोगुंदा क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 7,
    name: "मुनि श्री प्रसन्न कुमार जी",
    nameEn: "Muni Prasanna Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["साधना एवं प्रवचन कार्य"],
    base: "राजस्थान विहार",
    details: "मुनि प्रसन्न कुमार जी राजस्थान क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 8,
    name: "मुनि श्री तारा चंद जी",
    nameEn: "Muni Tarachand",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["दिल्ली पीतमपुरा क्षेत्र में धर्म प्रसार"],
    base: "पीतमपुरा, दिल्ली",
    details: "मुनि तारा चंद जी दिल्ली के पीतमपुरा क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 9,
    name: "मुनि श्री सुमति कुमार जी",
    nameEn: "Muni Sumti Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["साधना एवं प्रवचन"],
    base: "राजस्थान विहार",
    details: "मुनि सुमति कुमार जी राजस्थान में विहरणशील हैं।"
  },
  {
    infoId: 10,
    name: "मुनि श्री सुमेरमल जी (लाडनूं)",
    nameEn: "Muni Sumermal (Ladnun)",
    title: "शासन स्तम्भ — मंत्री मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: [
      "आचार्यश्री महाश्रमण जी के दीक्षा-गुरु",
      "दशकों तक तेरापंथ संघ के मंत्री मुनि",
      "तेरापंथ के प्रशासनिक स्तम्भ"
    ],
    base: "संगरूर / राजस्थान विहार",
    details: "मुनि सुमेरमल जी (लाडनूं) ने आचार्यश्री महाश्रमण जी को दीक्षा प्रदान की। वे मंत्री मुनि के रूप में तेरापंथ संघ के प्रशासन में अत्यंत महत्वपूर्ण भूमिका निभाते हैं।"
  },
  {
    infoId: 697, // Mapped to 697 to preserve custom referencing in layout screens
    name: "मुनि श्री उदित कुमार जी",
    nameEn: "Muni Udit Kumar",
    title: "युवा विद्वान — बहुश्रुत परिषद सदस्य",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: [
      "बहुश्रुत परिषद के प्रमुख सदस्य",
      "युवाओं में आत्मविज्ञान प्रसार",
      "अनेक धार्मिक ग्रंथों का अध्ययन-अध्यापन"
    ],
    base: "राजस्थान विहार",
    details: "मुनि उदित कुमार जी बहुश्रुत परिषद के प्रमुख विद्वान हैं और युवाओं में विशेष लोकप्रिय हैं।"
  },
  {
    infoId: 866, // Maintained as mandated by AGENTS.md rules
    name: "मुनि श्री ज्योतिर्मय कुमार जी",
    nameEn: "Muni Jyotirmay Kumar",
    title: "विद्वान मुनि — हस्तलेखन व शोध विशेषज्ञ",
    category: "Muni",
    diksha: "22 नवंबर 2015, दिल्ली",
    dikshaBy: "मंत्री मुनि श्री सुमेरमल जी (लाडनूं)",
    born: "श्री डूंगरगढ़, राजस्थान",
    achievements: [
      "दशवैकालिक सूत्र आगम के विशिष्ट ज्ञाता",
      "हस्तलिखित पांडुलिपियों के उत्कृष्ट संरक्षण विशेषज्ञ",
      "जापानी मंगा व दर्शन के माध्यम से कर्म सिद्धांत का निरूपण",
      "युवाओं में चरित्र निर्माण एवं आत्मज्ञान प्रसार"
    ],
    base: "पीतमपुरा, दिल्ली",
    details: "मुनि ज्योतिर्मय कुमार जी का जन्म श्री डूंगरगढ़ में श्री जितेंद्र पुगलिया के रूप में हुआ। वह अपनी उच्च रचनात्मक लेखन शैली और युवाओं के साथ वैज्ञानिक दर्शन पर प्रेरक सत्रों के लिए विख्यात हैं।"
  },
  {
    infoId: 12,
    name: "मुनि श्री जय चंद लाल जी",
    nameEn: "Muni Jai Chand Lal",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["साकरी क्षेत्र में धर्म प्रसार"],
    base: "साकरी",
    details: "मुनि जय चंद लाल जी साकरी क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 13,
    name: "मुनि श्री कमल कुमार जी",
    nameEn: "Muni Kamal Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["बुढ़लाडा क्षेत्र में साधना एवं प्रवचन"],
    base: "बुढ़लाडा",
    details: "मुनि कमल कुमार जी बुढ़लाडा क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 14,
    name: "मुनि श्री रवींद्र कुमार जी",
    nameEn: "Muni Ravindra Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["बालोतरा क्षेत्र में धर्म प्रसार"],
    base: "बालोतरा",
    details: "मुनि रवींद्र कुमार जी बालोतरा क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 15,
    name: "मुनि श्री सागरमल जी (श्रमण)",
    nameEn: "Muni Sagarmal (Shraman)",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["सिरियारी — तेरापंथ के जन्मस्थल की सेवा"],
    base: "सिरियारी",
    details: "मुनि सागरमल जी सिरियारी में विहरणशील हैं — तेरापंथ के सबसे पवित्र स्थलों में से एक।"
  },
  {
    infoId: 16,
    name: "मुनि श्री धर्मचंद 'पीयूष' जी",
    nameEn: "Muni Dharamchand Piyush",
    title: "वरिष्ठ मुनि — साहित्यकार",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["जयपुर में धर्म प्रसार", "साहित्यिक रचनाएं"],
    base: "जयपुर",
    details: "मुनि धर्मचंद 'पीयूष' जी साहित्यिक प्रतिभा के धनी मुनि हैं।"
  },
  {
    infoId: 17,
    name: "मुनि श्री राकेश कुमार जी",
    nameEn: "Muni Rakesh Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["दिल्ली क्षेत्र में धर्म प्रसार"],
    base: "दिल्ली",
    details: "मुनि राकेश कुमार जी दिल्ली क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 18,
    name: "मुनि श्री विमल कुमार जी",
    nameEn: "Muni Vimal Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["गंगानगर क्षेत्र में साधना"],
    base: "गंगानगर की ओर",
    details: "मुनि विमल कुमार जी गंगानगर क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 19,
    name: "प्रो. मुनि श्री महेंद्र कुमार जी",
    nameEn: "Prof. Muni Mahendra Kumar",
    title: "प्रोफेसर मुनि — शिक्षाविद",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: [
      "उच्च शिक्षा की अद्भुत पृष्ठभूमि",
      "दक्षिण दिल्ली में धर्म प्रसार",
      "जैन दर्शन पर अनेक शोधपत्र"
    ],
    base: "दक्षिण दिल्ली",
    details: "प्रो. मुनि महेंद्र कुमार जी उच्च शिक्षा प्राप्त विद्वान मुनि हैं।"
  },
  {
    infoId: 20,
    name: "मुनि श्री Suresh कुमार जी",
    nameEn: "Muni Suresh Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["असिंध क्षेत्र में धर्म प्रसार"],
    base: "असिंध",
    details: "मुनि Suresh कुमार जी असिंध क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 21,
    name: "मुनि श्री धर्मेश कुमार जी",
    nameEn: "Muni Dharmesh Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["दक्षिण भारत — चेन्नई में धर्म प्रसार"],
    base: "चेन्नई",
    details: "मुनि धर्मेश कुमार जी दक्षिण भारत में तेरापंथ का प्रचार करते हैं।"
  },
  {
    infoId: 22,
    name: "मुनि श्री बाछराज जी",
    nameEn: "Muni Bachrajji",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["कालू क्षेत्र में साधना"],
    base: "कालू",
    details: "मुनि बाछराज जी कालू क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 23,
    name: "मुनि श्री मोहनलाल जी",
    nameEn: "Muni Mohanlal",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["सरदारशहर क्षेत्र में साधना"],
    base: "सरदारशहर",
    details: "मुनि मोहनलाल जी सरदारशहर में विहरणशील हैं।"
  },
  {
    infoId: 24,
    name: "मुनि श्री विजयराज जी",
    nameEn: "Muni Vijayraj",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["राजगढ़ सादुलपुर में धर्म प्रसार"],
    base: "राजगढ़ सादुलपुर",
    details: "मुनि विजयराज जी राजगढ़ सादुलपुर क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 25,
    name: "मुनि श्री जिनेश कुमार जी",
    nameEn: "Muni Jinesh Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["गांधीनगर / विजयनगर में ऐतिहासिक चातुर्मास (2024)"],
    base: "गांधीनगर / विजयनगर",
    details: "मुनि जिनेश कुमार जी का 2024 का गांधीनगर चातुर्मास ऐतिहासिक रहा।"
  },
  {
    infoId: 26,
    name: "मुनि श्री हर्षलाल जी",
    nameEn: "Muni Harsh Lal",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["गंगापुर क्षेत्र में धर्म प्रसार"],
    base: "गंगापुर",
    details: "मुनि हर्षलाल जी गंगापुर क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 27,
    name: "मुनि श्री मदन कुमार जी",
    nameEn: "Muni Madan Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["शिवांची की ओर विहार"],
    base: "शिवांची क्षेत्र",
    details: "मुनि मदन कुमार जी शिवांची क्षेत्र की ओर विहरणशील हैं।"
  },
  {
    infoId: 28,
    name: "मुनि श्री रमेश कुमार जी",
    nameEn: "Muni Ramesh Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["सुजानगढ़ में धर्म प्रसार"],
    base: "सुजानगढ़",
    details: "मुनि रमेश कुमार जी सुजानगढ़ में विहरणशील हैं।"
  },
  {
    infoId: 29,
    name: "मुनि श्री मुनिव्रत जी",
    nameEn: "Muni Munivrat",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["जयपुर श्यामनगर में धर्म प्रसार"],
    base: "श्यामनगर जयपुर",
    details: "मुनि मुनिव्रत जी जयपुर के श्यामनगर क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 30,
    name: "मुनि श्री वत्सराज जी",
    nameEn: "Muni Vatsraj",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["कालू क्षेत्र में साधना"],
    base: "कालू",
    details: "मुनि वत्सराज जी कालू क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 31,
    name: "मुनि श्री दर्शन कुमार जी",
    nameEn: "Muni Darshan Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["बोराज क्षेत्र में साधना"],
    base: "बोराज",
    details: "मुनि दर्शन कुमार जी बोराज क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 32,
    name: "मुनि श्री प्रशांत कुमार जी",
    nameEn: "Muni Prashant Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["पचपदरा क्षेत्र में साधना"],
    base: "पचपदरा",
    details: "मुनि प्रशांत कुमार जी पचपदरा में विहरणशील हैं।"
  },
  {
    infoId: 33,
    name: "मुनि श्री कुलदीप कुमार जी",
    nameEn: "Muni Kuldeep Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["नरवाना क्षेत्र में धर्म प्रसार"],
    base: "नरवाना",
    details: "मुनि कुलदीप कुमार जी नरवाना क्षेत्र में विहरणशील हैं।"
  },
  {
    infoId: 34,
    name: "मुनि श्री जंबू कुमार जी",
    nameEn: "Muni Jambu Kumar",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["lava सरदारगढ़ में साधना"],
    base: "lava सरदारगढ़",
    details: "मुनि जंबू कुमार जी lava सरदारगढ़ में विहरणशील हैं।"
  },
  {
    infoId: 35,
    name: "मुनि श्री जतनमल जी",
    nameEn: "Muni Jatanmal",
    title: "वरिष्ठ मुनि",
    category: "Muni",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["असवाली क्षेत्र में साधना"],
    base: "असवाली",
    details: "मुनि जतनमल जी असवाली में विहरणशील हैं।"
  },

  // ========== SADHWI (from official Chaturmas list) ==========
  {
    infoId: 36,
    name: "साध्वी श्री प्रमिला कुमारी जी",
    nameEn: "Sadhvi Pramila Kumari",
    category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["बिदासर क्षेत्र में साधना"],
    base: "बिदासर", details: "साध्वी प्रमिला कुमारी जी बिदासर में विहरणशील हैं।"
  },
  {
    infoId: 37,
    name: "साध्वी श्री सुदर्शना जी",
    nameEn: "Sadhvi Sudarshana",
    category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["राजलदेसर में साधना"],
    base: "राजलदेसर", details: "साध्वी सुदर्शना जी राजलदेसर में विहरणशील हैं।"
  },
  {
    infoId: 38, name: "साध्वी श्री ज्योति प्रभा जी",
    nameEn: "Sadhvi Jyoti Prabha", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["साधना एवं प्रवचन कार्य"],
    base: "राजस्थान विहार", details: "साध्वी ज्योति प्रभा जी राजस्थान में विहरणशील हैं।"
  },
  {
    infoId: 39, name: "साध्वी श्री काव्यलता जी",
    nameEn: "Sadhvi Kavyalata", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["लाडनूं में साधना एवं शिक्षण"],
    base: "लाडनूं", details: "साध्वी काव्यलता जी लाडनूं में विहरणशील हैं।"
  },
  {
    infoId: 40, name: "साध्वी श्री अनिमा श्री जी",
    nameEn: "Sadhvi Anima Shri", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["श्री डूंगरगढ़ में साधना"],
    base: "श्री डूंगरगढ़", details: "साध्वी अनिमा श्री जी श्री डूंगरगढ़ में विहरणशील हैं।"
  },
  {
    infoId: 41, name: "साध्वी श्री जसवती जी",
    nameEn: "Sadhvi Jasvati", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["गंगाशहर में साधना"],
    base: "गंगाशहर", details: "साध्वी जसवती जी Gangaशहर में विहरणशील हैं।"
  },
  {
    infoId: 42, name: "साध्वी श्री मोहन कुमारी जी",
    nameEn: "Sadhvi Mohan Kumari", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["बीकानेर में साधना"],
    base: "बीकानेर", details: "साध्वी मोहन कुमारी जी बीकानेर में विहरणशील हैं।"
  },
  {
    infoId: 43, name: "साध्वी श्री राज कुमारी जी (नोहर)",
    nameEn: "Sadhvi Raj Kumari (Nohar)", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["देशनोक में साधना"],
    base: "देशनोक", details: "साध्वी राज कुमारी जी (नोहर) देशनोक में विहरणशील हैं।"
  },
  {
    infoId: 44, name: "साध्वी श्री उज्जवल रेखा जी",
    nameEn: "Sadhvi Ujawal Rekha", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["गंगानगर की ओर विहार"],
    base: "गंगानगर क्षेत्र", details: "साध्वी उज्जवल रेखा जी गंगानगर की ओर विहरणशील हैं।"
  },
  {
    infoId: 45, name: "साध्वी श्री राज कुमारी जी (लाडनूं)",
    nameEn: "Sadhvi Raj Kumari (Ladnun)", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["सुजानगढ़ में साधना"],
    base: "सुजानगढ़", details: "साध्वी राज कुमारी जी (लाडनूं) सुजानगढ़ में विहरणशील हैं।"
  },
  {
    infoId: 46, name: "साध्वी श्री रतन श्री जी",
    nameEn: "Sadhvi Ratan Shri", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["सरदारपुरा जोधपुर में साधना"],
    base: "सरदारपुरा जोधपुर", details: "साध्वी रतन श्री जी जोधपुर में विहरणशील हैं।"
  },
  {
    infoId: 47, name: "साध्वी श्री मधुस्मिता जी",
    nameEn: "Sadhvi Madhusmita", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["जासोल में साधना"],
    base: "जासोल", details: "साध्वी मधुस्मिता जी जासोल में विहरणशील हैं।"
  },
  {
    infoId: 48, name: "साध्वी श्री जय प्रभा जी",
    nameEn: "Sadhvi Jai Prabha", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["भीलवाड़ा में साधना"],
    base: "भीलवाड़ा", details: "साध्वी जय प्रभा जी भीलवाड़ा में विहरणशील हैं।"
  },
  {
    infoId: 49, name: "साध्वी श्री मन कुमारी जी",
    nameEn: "Sadhvi Man Kumari", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["हरियाणा की ओर विहार"],
    base: "हरियाणा विहार", details: "साध्वी मन कुमारी जी हरियाणा में विहरणशील हैं।"
  },
  {
    infoId: 50, name: "साध्वी श्री विनय श्री जी",
    nameEn: "Sadhvi Vinay Shri", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["टोहाना में साधना"],
    base: "टोहाना", details: "साध्वी विनय श्री जी टोहाना में विहरणशील हैं।"
  },
  {
    infoId: 51, name: "साध्वी श्री तेज कुमारी जी",
    nameEn: "Sadhvi Tej Kumari", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["उचाना में साधना"],
    base: "उचाना", details: "साध्वी तेज कुमारी जी उचाना में विहरणशील हैं।"
  },
  {
    infoId: 52, name: "साध्वी श्री सोमलता जी",
    nameEn: "Sadhvi Somlata", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["पंजाब की ओर विहार"],
    base: "पंजाब विहार", details: "साध्वी सोमलता जी पंजाब की ओर विहरणशील हैं।"
  },
  {
    infoId: 53, name: "साध्वी श्री उज्जवल कुमारी जी",
    nameEn: "Sadhvi Ujawal Kumari", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["धूरी में साधना"],
    base: "धूरी", details: "साध्वी उज्जवल कुमारी जी धूरी में विहरणशील हैं।"
  },
  {
    infoId: 54, name: "साध्वी श्री सोहना जी (छापर)",
    nameEn: "Sadhvi Sohna (Chhapar)", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["सुनाम में साधना"],
    base: "सुनाम", details: "साध्वी सोहना जी सुनाम में विहरणशील हैं।"
  },
  {
    infoId: 55, name: "साध्वी श्री कंचन प्रभा जी",
    nameEn: "Sadhvi Kanchan Prabha", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["सूरत-उधना में साधना"],
    base: "सूरत-उधना", details: "साध्वी कंचन प्रभा जी सूरत-उधना में विहरणशील हैं।"
  },
  {
    infoId: 56, name: "साध्वी श्री कुंथु श्री जी",
    nameEn: "Sadhvi Kunthu Shri", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["भुज (गुजरात) में साधना"],
    base: "भुज", details: "साध्वी कुंथु श्री जी भुज में विहरणशील हैं।"
  },
  {
    infoId: 57, name: "साध्वी श्री सरोज कुमारी जी",
    nameEn: "Sadhvi Saroj Kumari", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["इंदौर में साधना"],
    base: "इंदौर", details: "साध्वी सरोज कुमारी जी मध्यप्रदेश के इंदौर में विहरणशील हैं।"
  },
  {
    infoId: 58, name: "साध्वी श्री प्रभाल यशा जी",
    nameEn: "Sadhvi Prabhal Yasha", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["झकनाबाद में साधना"],
    base: "झकनाबाद", details: "साध्वी प्रभाल यशा जी झकनाबाद में विहरणशील हैं।"
  },
  {
    infoId: 59, name: "साध्वी श्री निर्वाण श्री जी",
    nameEn: "Sadhvi Nirwan Shri", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["फारबिसगंज (बिहार) में साधना"],
    base: "फारबिसगंज", details: "साध्वी निर्वाण श्री जी बिहार में विहरणशील हैं।"
  },
  {
    infoId: 60, name: "साध्वी श्री त्रिशला कुमारी जी",
    nameEn: "Sadhvi Trishla Kumari", category: "Sadhwi", title: "वरिष्ठ साध्वी",
    diksha: "—", dikshaBy: "—", born: "—",
    achievements: ["बारपेटा रोड (असम) में साधना"],
    base: "बारपेटा रोड", details: "साध्वी श्री त्रिशला कुमारी जी असम के बारपेटा रोड में तपस्यारत एवं विहरणशील हैं।"
  },

// ===== ADDITIONAL SADHWIS =====
{ infoId: 200, name: "साध्वी श्री यशोमति जी", nameEn: "Sadhvi Yashomati", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["भिवानी में साधना"], base: "भिवानी", details: "साध्वी यशोमति जी भिवानी में विहरणशील हैं।" },
{ infoId: 201, name: "साध्वी श्री यशोधरा जी", nameEn: "Sadhvi Yashodhara", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["शादरा दिल्ली में साधना"], base: "शादरा दिल्ली", details: "साध्वी यशोधरा जी दिल्ली में विहरणशील हैं।" },
{ infoId: 202, name: "साध्वी श्री कनक रेखा जी", nameEn: "Sadhvi Kanak Rekha", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["गुजरात की ओर विहार"], base: "गुजरात विहार", details: "साध्वी कनक रेखा जी गुजरात में विहरणशील हैं।" },
{ infoId: 203, name: "साध्वी श्री प्रमोद श्री जी", nameEn: "Sadhvi Pramod Shri", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["बारडोली गुजरात में साधना"], base: "बारडोली", details: "साध्वी प्रमोद श्री जी गुजरात में विहरणशील हैं।" },
{ infoId: 204, name: "साध्वी श्री गुणमाला जी", nameEn: "Sadhvi Gunmala", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["पेटलावद मध्यप्रदेश में साधना"], base: "पेटलावद", details: "साध्वी गुणमाला जी मध्यप्रदेश में विहरणशील हैं।" },
{ infoId: 205, name: "साध्वी श्री कुंदन रेखा जी", nameEn: "Sadhvi Kundan Rekha", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["टिटिलागढ़ ओडिशा में साधना"], base: "टिटिलागढ़", details: "साध्वी कुंदन रेखा जी ओडिशा में विहरणशील हैं।" },
{ infoId: 206, name: "साध्वी श्री कनक श्री जी", nameEn: "Sadhvi Kanak Shri", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["उत्तर हावड़ा पश्चिम बंगाल में साधना"], base: "उत्तर हावड़ा", details: "साध्वी कनक श्री जी पश्चिम बंगाल में विहरणशील हैं।" },
{ infoId: 207, name: "साध्वी श्री स्वर्ण रेखा जी", nameEn: "Sadhvi Swarna Rekha", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["थाणे मुलुंड महाराष्ट्र में साधना"], base: "थाणे मुलुंड", details: "साध्वी स्वर्ण रेखा जी महाराष्ट्र में विहरणशील हैं।" },
{ infoId: 208, name: "साध्वी श्री जिनबाला जी", nameEn: "Sadhvi Jinbala", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["अहमदाबाद में साधना"], base: "अहमदाबाद", details: "साध्वी जिनबाला जी अहमदाबाद में विहरणशील हैं।" },
{ infoId: 209, name: "साध्वी श्री हुलासजी जी", nameEn: "Sadhvi Hulasji", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["गंगानगर अंचल में साधना"], base: "गंगानगर अंचल", details: "साध्वी हुलासजी जी गंगानगर अंचल में विहरणशील हैं।" },
{ infoId: 210, name: "साध्वी श्री मेनरया जी", nameEn: "Sadhvi Menraya", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["डीडवाना में साधना"], base: "डीडवाना", details: "साध्वी मेनरया जी डीडवाना में विहरणशील हैं।" },
{ infoId: 211, name: "साध्वी श्री ललित प्रभा जी", nameEn: "Sadhvi Lalit Prabha", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["चिकित्सा केंद्र सेवा"], base: "चिकित्सा केंद्र", details: "साध्वी ललित प्रभा जी चिकित्सा केंद्र में सेवारत हैं।" },
{ infoId: 212, name: "साध्वी श्री विशद प्रज्ञा जी", nameEn: "Sadhvi Vishad Pragya", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["ब्यावर में साधना"], base: "ब्यावर", details: "साध्वी विशद प्रज्ञा जी ब्यावर में विहरणशील हैं।" },
{ infoId: 213, name: "साध्वी श्री नगीना जी", nameEn: "Sadhvi Nagina", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["टाडगढ़ में साधना"], base: "टाडगढ़", details: "साध्वी नगीना जी टाडगढ़ में विहरणशील हैं।" },
{ infoId: 214, name: "साध्वी श्री अशोक श्री जी", nameEn: "Sadhvi Ashok Shri", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["उत्तर कर्नाटक में साधना"], base: "उत्तर कर्नाटक", details: "साध्वी अशोक श्री जी दक्षिण भारत में विहरणशील हैं।" },
{ infoId: 215, name: "साध्वी श्री कीर्ति लता जी", nameEn: "Sadhvi Kirti Lata", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["कोयंबटूर तमिलनाडु में साधना"], base: "कोयंबटूर", details: "साध्वी कीर्ति लता जी दक्षिण भारत में विहरणशील हैं।" },
{ infoId: 216, name: "साध्वी श्री संगीत श्री जी", nameEn: "Sadhvi Sangeet Shri", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["सहाडा में साधना"], base: "सहाडा", details: "साध्वी संगीत श्री जी सहाडा में विहरणशील हैं।" },
{ infoId: 217, name: "साध्वी श्री सत्य प्रभा जी", nameEn: "Sadhvi Satya Prabha", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["हैदराबाद में साधना"], base: "हैदराबाद", details: "साध्वी सत्य प्रभा जी हैदराबाद में विहरणशील हैं।" },
{ infoId: 218, name: "साध्वी श्री कमल प्रभा जी", nameEn: "Sadhvi Kamal Prabha", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["जोधपुर में साधना"], base: "जोधपुर", details: "साध्वी कमल प्रभा जी जोधपुर में विहरणशील हैं।" },
{ infoId: 219, name: "साध्वी श्री मधु बाला जी", nameEn: "Sadhvi Madhu Bala", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["किशनगढ़ में साधना"], base: "किशनगढ़", details: "साध्वी मधु बाला जी किशनगढ़ में विहरणशील हैं।" },
{ infoId: 220, name: "साध्वी श्री शांता कुमारी जी", nameEn: "Sadhvi Shanta Kumari", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["केलवा में साधना"], base: "केलवा", details: "साध्वी शांता कुमारी जी तेरापंथ के जन्मस्थान केलवा में विहरणशील हैं।" },
{ infoId: 221, name: "साध्वी श्री लब्धि प्रभा जी", nameEn: "Sadhvi Labdhi Prabha", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["हनुमानगढ़ में साधना"], base: "हनुमानगढ़", details: "साध्वी लब्धि प्रभा जी हनुमानगढ़ में विहरणशील हैं।" },
{ infoId: 222, name: "साध्वी श्री राज प्रभा जी", nameEn: "Sadhvi Raj Prabha", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["सूरतगढ़ में साधना"], base: "सूरतगढ़", details: "साध्वी राज प्रभा जी सूरतगढ़ में विहरणशील हैं।" },
{ infoId: 223, name: "साध्वी श्री रतिप्रभा जी", nameEn: "Sadhvi Ratiprabha", category: "Sadhwi", title: "वरिष्ठ साध्वी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["भगवतगढ़ में साधना"], base: "भगवतगढ़", details: "साध्वी रतिप्रभा जी भगवतगढ़ में विहरणशील हैं।" },

// ===== ALL SAMANI (from official Chaturmas list) =====
{ infoId: 300, name: "समणी श्री मुदित प्रज्ञा जी", nameEn: "Samani Mudit Pragya", category: "Samman", title: "वरिष्ठ समणी — अंतर्राष्ट्रीय प्रतिनिधि", diksha: "—", dikshaBy: "—", born: "—", achievements: ["ऑर्लैंडो अमेरिका में प्रेक्षाध्यान प्रशिक्षण"], base: "ऑर्लैंडो, USA", details: "समणी मुदित प्रज्ञा जी अमेरिका में तेरापंथ दर्शन का प्रचार करती हैं।" },
{ infoId: 301, name: "समणी श्री अक्षय प्रज्ञा जी", nameEn: "Samani Akshay Pragya", category: "Samman", title: "समणी — अंतर्राष्ट्रीय", diksha: "—", dikshaBy: "—", born: "—", achievements: ["ह्यूस्टन अमेरिका में धर्म प्रसार"], base: "ह्यूस्टन, USA", details: "समणी अक्षय प्रज्ञा जी अमेरिका में विहरणशील हैं।" },
{ infoId: 302, name: "समणी श्री संमति प्रज्ञा जी", nameEn: "Samani Sanmati Pragya", category: "Samman", title: "समणी — अंतर्राष्ट्रीय", diksha: "—", dikshaBy: "—", born: "—", achievements: ["न्यू जर्सी अमेरिका में धर्म प्रसार"], base: "न्यू जर्सी, USA", details: "समणी संमति प्रज्ञा जी न्यू जर्सी में विहरणशील हैं।" },
{ infoId: 303, name: "समणी श्री प्रसन्न प्रज्ञा जी", nameEn: "Samani Prasanna Pragya", category: "Samman", title: "समणी — यूरोप प्रतिनिधि", diksha: "—", dikshaBy: "—", born: "—", achievements: ["लंदन यूके में धर्म प्रसार"], base: "लंदन, UK", details: "समणी प्रसन्न प्रज्ञा जी यूरोप में तेरापंथ का प्रचार करती हैं।" },
{ infoId: 304, name: "समणी श्री चारित्र प्रज्ञा जी", nameEn: "Samani Charitra Pragya", category: "Samman", title: "समणी — अमेरिका", diksha: "—", dikshaBy: "—", born: "—", achievements: ["मियामी अमेरिका में धर्म प्रसार"], base: "मियामी, USA", details: "समणी चारित्र प्रज्ञा जी मियामी में विहरणशील हैं।" },
{ infoId: 305, name: "समणी श्री स्थित प्रज्ञा जी", nameEn: "Samani Stith Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["कटिहार में धर्म प्रसार"], base: "कटिहार", details: "समणी स्थित प्रज्ञा जी कटिहार में विहरणशील हैं।" },
{ infoId: 306, name: "समणी श्री निर्मान प्रज्ञा जी", nameEn: "Samani Nirman Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["वाणी में धर्म प्रसार"], base: "वाणी", details: "समणी निर्मान प्रज्ञा जी वाणी में विहरणशील हैं।" },
{ infoId: 307, name: "समणी श्री परम प्रज्ञा जी", nameEn: "Samani Param Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["सिलीगुड़ी में धर्म प्रसार"], base: "सिलीगुड़ी", details: "समणी परम प्रज्ञा जी सिलीगुड़ी में विहरणशील हैं।" },
{ infoId: 308, name: "समणी श्री मंजु प्रज्ञा जी", nameEn: "Samani Manju Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["गुवाहाटी असम में धर्म प्रसार"], base: "गुवाहाटी", details: "समणी मंजु प्रज्ञा जी गुवाहाटी में विहरणशील हैं।" },
{ infoId: 309, name: "समणी श्री मल्लि प्रज्ञा जी", nameEn: "Samani Malli Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["चिकमंगलूर कर्नाटक में धर्म प्रसार"], base: "चिकमंगलूर", details: "समणी मल्लि प्रज्ञा जी दक्षिण भारत में विहरणशील हैं।" },
{ infoId: 310, name: "समणी श्री जयंत प्रज्ञा जी", nameEn: "Samani Jayant Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["कटक ओडिशा में धर्म प्रसार"], base: "कटक", details: "समणी जयंत प्रज्ञा जी ओडिशा में विहरणशील हैं।" },
{ infoId: 311, name: "समणी श्री विनीत प्रज्ञा जी", nameEn: "Samani Vinit Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["भटिंडा पंजाब में धर्म प्रसार"], base: "भटिंडा", details: "समणी विनीत प्रज्ञा जी पंजाब में विहरणशील हैं।" },
{ infoId: 312, name: "समणी श्री कांति प्रज्ञा जी", nameEn: "Samani Kanti Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["जावद मध्यप्रदेश में धर्म प्रसार"], base: "जावद", details: "समणी कांति प्रज्ञा जी मध्यप्रदेश में विहरणशील हैं।" },
{ infoId: 313, name: "समणी श्री प्रतिभा प्रज्ञा जी", nameEn: "Samani Pratibha Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["तामकोर राजस्थान में धर्म प्रसार"], base: "तामकोर", details: "समणी प्रतिभा प्रज्ञा जी तामकोर में विहरणशील हैं।" },
{ infoId: 314, name: "समणी श्री शील प्रज्ञा जी", nameEn: "Samani Sheel Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["भीड़ में धर्म प्रसार"], base: "भीड़", details: "समणी शील प्रज्ञा जी भीड़ में विहरणशील हैं।" },
{ infoId: 315, name: "समणी श्री ज्ञान प्रज्ञा जी", nameEn: "Samani Gyan Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["रायचूर कर्नाटक में धर्म प्रसार"], base: "रायचूर", details: "समणी ज्ञान प्रज्ञा जी कर्नाटक में विहरणशील हैं।" },
{ infoId: 316, name: "समणी श्री ज्योति प्रज्ञा जी", nameEn: "Samani Jyoti Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["गांधीधाम गुजरात में धर्म प्रसार"], base: "गांधीधाम", details: "समणी ज्योति प्रज्ञा जी गुजरात में विहरणशील हैं।" },
{ infoId: 317, name: "समणी श्री परिमल प्रज्ञा जी", nameEn: "Samani Parimal Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["मदुरई तमिलनाडु में धर्म प्रसार"], base: "मदुरई", details: "समणी परिमल प्रज्ञा जी दक्षिण भारत में विहरणशील हैं।" },
{ infoId: 318, name: "समणी श्री मालाई प्रज्ञा जी", nameEn: "Samani Malai Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["राउरकेला ओडिशा में धर्म प्रसार"], base: "राउरकेला", details: "समणी मालाई प्रज्ञा जी ओडिशा में विहरणशील हैं।" },
{ infoId: 319, name: "समणी श्री भावित प्रज्ञा जी", nameEn: "Samani Bhavit Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["भायंदर महाराष्ट्र में धर्म प्रसार"], base: "भायंदर", details: "समणी भावित प्रज्ञा जी महाराष्ट्र में विहरणशील हैं।" },
{ infoId: 320, name: "समणी श्री शारदा प्रज्ञा जी", nameEn: "Samani Sharda Pragya", category: "Samman", title: "समणी", diksha: "—", dikshaBy: "—", born: "—", achievements: ["नवसारी गुजरात में धर्म प्रसार"], base: "नवसारी", details: "समणी शारदा प्रज्ञा जी गुजरात में विहरणशील हैं।" }
];

export const VIHAR_GROUPS: ViharGroup[] = [
  {
    id: "vg-01",
    leaderName: "Muni Udit Kumar Ji",
    region: "Delhi NCR (Pitampura, Rohini, Rohilla)",
    membersCount: 4,
    currentStay: "Pitampura Terapanth Sabha",
    purpose: "Swadhyaya, values classes, Gyanshala training, and local monastic guidance."
  },
  {
    id: "vg-02",
    leaderName: "Sadhvi Vishruta-Vibhushi Ji",
    region: "Rajasthan (Ladnun to Jaipur path)",
    membersCount: 6,
    currentStay: "JVBI Campus, Ladnun",
    purpose: "Higher scholastic curriculum audits and manuscript digitization guidance."
  },
  {
    id: "vg-03",
    leaderName: "Samani Malli Pragna Ji",
    region: "USA East Coast Range",
    membersCount: 2,
    currentStay: "New Jersey Community Center",
    purpose: "Preksha Meditation workshops and summer scholastic values camps."
  }
];

export const MONASTIC_LITERATURE: MonasticLiterature[] = [
  {
    id: "lit-01",
    title: "Anuvrat: A Code of Conduct",
    author: "Acharya Tulsi",
    language: "Hindi / English",
    category: "Ethics",
    description: "The core handbook outlining the 11 miniature vows for a peaceful, moral daily life."
  },
  {
    id: "lit-02",
    title: "Preksha Dhyana: Theory and Practice",
    author: "Acharya Mahapragya",
    language: "Hindi / English / Sanskrit",
    category: "Meditation",
    description: "The exhaustive manual detailing breathing exercises, posture relaxation, and color meditations."
  },
  {
    id: "lit-03",
    title: "Jain Siddhant Deepika",
    author: "Acharya Tulsi",
    language: "Sanskrit / Hindi",
    category: "Philosophy",
    description: "The authoritative textbook used in Gyanshala and JVBI to teach fundamental Jain metaphysics."
  },
  {
    id: "lit-04",
    title: "Bhram Vidhonsan",
    author: "Acharya Bhikshu",
    language: "Rajasthani (Marwari)",
    category: "Scriptures",
    description: "The historic text composed by the founder resolving queries about spiritual versus mundane charity."
  }
];
