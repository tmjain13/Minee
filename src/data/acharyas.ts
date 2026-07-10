export interface Acharya {
  id: number;
  name: string;
  secularName?: string; 
  title: string;
  period: string;
  startYear: number;
  endYear: number | null;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  notableWorks: string[];
  birthDetails?: {
    date?: string;
    place?: string;
    parents?: string;
  };
  dikshaDetails?: {
    date?: string;
    place?: string;
    age?: number;
    dikshaGuru?: string;
  };
  samadhiDetails?: { 
    date?: string;
    place?: string;
  };

  // Backwards compatibility fields
  nr?: number;
  img?: string;
  desc?: string;
  stats?: { label: string; value: string }[];
  teachings?: string[];
  quote?: string;
  tags?: string[];
  chaturmas?: { year: number; loc: string }[];
  fullBio?: string;
  contributions?: string[];
}

export const acharyas: Acharya[] = [
  {
    id: 1,
    name: "आचार्य भिक्षु",
    secularName: "भीखणजी",
    title: "प्रवर्तक / प्रथम आचार्य",
    period: "1760 – 1803",
    startYear: 1760,
    endYear: 1803,
    isCurrent: false,
    description: "वि.सं. 1817 (1760 ई.) आषाढ़ शुक्ला पूर्णिमा को केलवा में तेरापंथ धर्मसंघ की स्थापना की। उन्होंने दया-दान के सूक्ष्म दर्शन को स्पष्ट कर श्रमण परंपरा में क्रांति ला दी।",
    achievements: [
      "तेरापंथ धर्मसंघ की स्थापना (वि.सं. 1817, केलवा)",
      "'एक गुरु, एक विधान' (एक आचार्य की व्यवस्था) का सिद्धांत प्रतिपादित किया",
      "संघ की आचार संहिता और 'मर्यादा' की आधारशिला रखी",
      "धर्म और समाज सेवा (लौकिक और लोकोत्तर) के बीच का भेद स्पष्ट किया"
    ],
    notableWorks: [
      "राजस्थानी भाषा में लगभग 38,000 पद्यों की रचना",
      "'नव पदार्थ' सिद्धांत का प्रतिपादन",
      "भिक्षु विचार दर्शन"
    ],
    birthDetails: {
      date: "वि.सं. 1783 (1726 ई.) आषाढ़ शुक्ला त्रयोदशी",
      place: "कंटालिया, मारवाड़ (राजस्थान)",
      parents: "पिता: बल्लूजी, माता: दीपां बाई"
    },
    dikshaDetails: {
      date: "वि.सं. 1808 (1751 ई.)",
      place: "मारवाड़",
      age: 25,
      dikshaGuru: "आचार्य रघुनाथ जी (बाद में वैचारिक मतभेद के कारण स्वतंत्र विहार किया)"
    },
    samadhiDetails: {
      date: "वि.सं. 1860 (1803 ई.) भाद्रपद शुक्ला त्रयोदशी",
      place: "सिरियारी, पाली (राजस्थान)"
    }
  },
  {
    id: 2,
    name: "आचार्य भारीमल जी",
    secularName: "भारीमल",
    title: "द्वितीय आचार्य",
    period: "1803 – 1821",
    startYear: 1803,
    endYear: 1821,
    isCurrent: false,
    description: "आचार्य भिक्षु के अत्यंत निष्ठावान शिष्य, जिन्होंने नवस्थापित तेरापंथ संघ की जड़ों को सींचा और मर्यादाओं को कठोरता से लागू किया।",
    achievements: [
      "संघ की प्रारंभिक मर्यादाओं को सुदृढ़ किया",
      "आचार्य भिक्षु के विचारों का संरक्षण और प्रसार",
      "संघ की सदस्य संख्या में वृद्धि"
    ],
    notableWorks: [
      "विभिन्न आध्यात्मिक एवं सैद्धांतिक ढालों (प्रकरण) की रचना, लगभग 5 लाख गाथाओं का लिपिकरण"
    ],
    birthDetails: {
      date: "वि.सं. 1803 (1747 ई.)",
      place: "मुहां ग्राम, मेवाड़ (राजस्थान)",
      parents: "पिता: कृष्णो जी (किशनोजी), माता: धारिणी"
    },
    dikshaDetails: {
      date: "वि.सं. 1813 (1756 ई.)",
      place: "मेवाड़",
      age: 10,
      dikshaGuru: "आचार्य भिक्षु"
    },
    samadhiDetails: {
      date: "वि.सं. 1878 (1821 ई.) माघ कृष्णा अष्टमी",
      place: "राजनगर, राजसमंद (राजस्थान)"
    }
  },
  {
    id: 3,
    name: "आचार्य रायचंद जी",
    secularName: "रायचंद",
    title: "तृतीय आचार्य",
    period: "1821 – 1851",
    startYear: 1821,
    endYear: 1851,
    isCurrent: false,
    description: "प्रखर वैराग्य और कठोर अनुशासन के धनी आचार्य, जिनके नेतृत्व में तेरापंथ का विस्तार मारवाड़ से मेवाड़ और मालवा तक हुआ।",
    achievements: [
      "विहार क्षेत्रों का विस्तार, गुजरात और कच्छ की यात्रा करने वाले प्रथम आचार्य",
      "साधु-साध्वियों के ज्ञानार्जन एवं आगम-अध्ययन को बढ़ावा दिया",
      "संघीय अनुशासन को नई ऊँचाइयाँ दीं"
    ],
    notableWorks: [
      "आध्यात्मिक पत्राचार एवं उपदेशों का संग्रह"
    ],
    birthDetails: {
      date: "वि.सं. 1847 (1790 ई.)",
      place: "बड़ी रावलिया, मेवाड़ (राजस्थान)",
      parents: "पिता: चतुर जी (चंतराजी), माता: कुशलां जी"
    },
    dikshaDetails: {
      date: "वि.सं. 1857 (1801 ई.) चैत्र शुक्ला पूर्णिमा",
      place: "बड़ी रावलिया",
      age: 11,
      dikshaGuru: "आचार्य भिक्षु"
    },
    samadhiDetails: {
      date: "वि.सं. 1908 (1852 ई.) माघ कृष्णा चतुर्दशी",
      place: "छोटी रावलिया / थाली (राजस्थान)"
    }
  },
  {
    id: 4,
    name: "आचार्य जीतमल जी",
    secularName: "जीतमल गोलछा",
    title: "जयाचार्य (चतुर्थ आचार्य)",
    period: "1851 – 1881",
    startYear: 1851,
    endYear: 1881,
    isCurrent: false,
    description: "तेरापंथ के 'संविधान निर्माता' और महान साहित्यकार। उन्होंने संघीय व्यवस्था को लिखित रूप (मर्यादा पत्र) दिया और विपुल साहित्य सृजन किया।",
    achievements: [
      "तेरापंथ के अलिखित नियमों को 'मर्यादा पत्र' (संघीय संविधान) के रूप में लिपिबद्ध किया",
      "आगमों का राजस्थानी पद्य में अनुवाद (विशेषकर भगवती सूत्र)",
      "शास्त्रार्थ (वाद-विवाद) में अत्यंत निपुण, अनेक भ्रांतियों का निवारण किया",
      "साध्वी प्रमुखा व्यवस्था को सुव्यवस्थित किया (1853 ई.)"
    ],
    notableWorks: [
      "'भगवती जोड़' (सबसे बड़ा पद्यानुवाद)",
      "लगभग 3 लाख श्लोक-प्रमाण साहित्य (60 से अधिक ग्रंथ)",
      "'भ्रम विध्वंसन'"
    ],
    birthDetails: {
      date: "वि.सं. 1860 (1803 ई.) आश्विन शुक्ला चतुर्दशी",
      place: "रोयट, पाली (राजस्थान)",
      parents: "पिता: ऐदान जी, माता: कल्लू जी"
    },
    dikshaDetails: {
      date: "वि.सं. 1869 (1813 ई.) माघ कृष्णा सप्तमी",
      place: "जयपुर (राजस्थान)",
      age: 9,
      dikshaGuru: "युवाचार्य रायचंद जी (आचार्य भारीमल जी की आज्ञा से)"
    },
    samadhiDetails: {
      date: "वि.सं. 1938 (1881 ई.) भाद्रपद कृष्णा द्वादशी",
      place: "रामनिवास बाग, जयपुर (राजस्थान)"
    }
  },
  {
    id: 5,
    name: "आचार्य मघराज जी",
    secularName: "मघराज बेंगानी",
    title: "मघवागणी (पंचम आचार्य)",
    period: "1881 – 1892",
    startYear: 1881,
    endYear: 1892,
    isCurrent: false,
    description: "अत्यंत कम आयु में आचार्य पद का दायित्व संभालने वाले, विशुद्ध आचार और सरलता की प्रतिमूर्ति।",
    achievements: [
      "जयाचार्य द्वारा निर्मित संघीय व्यवस्थाओं का सुचारू संचालन",
      "अपनी सादगी और निरहंकारिता से जैन समाज में व्यापक प्रभाव छोड़ा"
    ],
    notableWorks: [
      "विविध आध्यात्मिक आलेख एवं ढालें"
    ],
    birthDetails: {
      date: "वि.सं. 1897 (1840 ई.) चैत्र शुक्ला एकादशी",
      place: "बीदासर (राजस्थान)",
      parents: "पिता: पूरणमल जी, माता: गुलाबां जी"
    },
    dikshaDetails: {
      date: "वि.सं. 1908 (1851 ई.)",
      place: "लाडनूं (राजस्थान)",
      age: 11,
      dikshaGuru: "युवाचार्य जीतमल जी"
    },
    samadhiDetails: {
      date: "वि.सं. 1949 (1892 ई.) चैत्र कृष्णा पंचमी",
      place: "सरदारशहर (राजस्थान)"
    }
  },
  {
    id: 6,
    name: "आचार्य माणकलाल जी",
    secularName: "माणकलाल श्रीमाल",
    title: "माणकगणी (षष्ठम आचार्य)",
    period: "1892 – 1897",
    startYear: 1892,
    endYear: 1897,
    isCurrent: false,
    description: "बहुत ही संक्षिप्त कार्यकाल वाले आचार्य, जिन्होंने लंबी पदयात्राएं कीं और तेरापंथ को नई भौगोलिक सीमाएँ दीं।",
    achievements: [
      "हरियाणा और अन्य दूरस्थ क्षेत्रों की यात्रा करने वाले प्रथम आचार्य",
      "संघ में नव-ऊर्जा का संचार"
    ],
    notableWorks: [
      "धर्मोपदेश एवं नीति वाक्य"
    ],
    birthDetails: {
      date: "वि.सं. 1912 (1855 ई.) भाद्रपद कृष्णा चतुर्थी",
      place: "जयपुर (राजस्थान)",
      parents: "पिता: हुकमीचंद जी (लाला लिछमनदास जी के पौत्र), माता: छोटां जी"
    },
    dikshaDetails: {
      date: "वि.सं. 1928 (1872 ई.) फाल्गुन शुक्ला एकादशी",
      place: "लाडनूं (राजस्थान)",
      age: 16,
      dikshaGuru: "आचार्य जीतमल जी (जयाचार्य)"
    },
    samadhiDetails: {
      date: "वि.सं. 1954 (1897 ई.) कार्तिक कृष्णा तृतीया",
      place: "सुजानगढ़ (राजस्थान)"
    }
  },
  {
    id: 7,
    name: "आचार्य डालचंद जी",
    secularName: "डालचंद पीपड़ा",
    title: "डालगणी (सप्तम आचार्य)",
    period: "1897 – 1909",
    startYear: 1897,
    endYear: 1909,
    isCurrent: false,
    description: "आगमों के प्रकांड विद्वान, जिनके शांत और गंभीर व्यक्तित्व ने तेरापंथ में ज्ञान-आराधना का नया युग शुरू किया।",
    achievements: [
      "संस्कृत और प्राकृत के अध्ययन को विशेष प्रोत्साहन",
      "कालूगणी जैसे महान शिष्य का निर्माण",
      "संघ में बौद्धिक विकास की नींव रखी"
    ],
    notableWorks: [
      "आगमिक व्याख्यान साहित्य"
    ],
    birthDetails: {
      date: "वि.सं. 1909 (1852 ई.) आषाढ़ शुक्ला चतुर्थी",
      place: "उज्जैन (मध्य प्रदेश)",
      parents: "पिता: कानीराम जी, माता: जड़ाव जी"
    },
    dikshaDetails: {
      date: "वि.सं. 1923 (1866 ई.) भाद्रपद कृष्णा द्वादशी",
      place: "इंदौर (मध्य प्रदेश)",
      age: 14,
      dikshaGuru: "मुनि हीरालाल जी"
    },
    samadhiDetails: {
      date: "वि.सं. 1966 (1909 ई.) भाद्रपद शुक्ला द्वादशी",
      place: "लाडनूं (राजस्थान)"
    }
  },
  {
    id: 8,
    name: "आचार्य कालूगणी",
    secularName: "कालूराम चोपड़ा",
    title: "अष्टम आचार्य / युगप्रधान",
    period: "1909 – 1936",
    startYear: 1909,
    endYear: 1936,
    isCurrent: false,
    description: "आधुनिक तेरापंथ के वास्तुकार। उन्होंने परमार्थिक शिक्षण संस्था की स्थापना की और संघ को शैक्षिक रूप से अत्यंत मजबूत किया।",
    achievements: [
      "संस्कृत व्याकरण (कालू कौमुदी) और न्याय शास्त्र के पठन-पाठन की व्यवस्था",
      "'परमार्थिक शिक्षण संस्था' की स्थापना",
      "300 से अधिक मुनि-साध्वियों को दीक्षा प्रदान की (संघ का अभूतपूर्व विस्तार)",
      "आचार्य तुलसी जैसे युग-दृष्टा शिष्य का निर्माण"
    ],
    notableWorks: [
      "'कालू कौमुदी' (संस्कृत व्याकरण)",
      "विभिन्न पूजा एवं स्तोत्र रचनाएँ"
    ],
    birthDetails: {
      date: "वि.सं. 1933 (1877 ई.)  फाल्गुन शुक्ला द्वितीया",
      place: "छापर (राजस्थान)",
      parents: "पिता: मूलचंद जी चोपड़ा, माता: चोगां जी"
    },
    dikshaDetails: {
      date: "वि.सं. 1944 (1887 ई.) आश्विन कृष्णा तृतीया",
      place: "बीदासर (राजस्थान)",
      age: 10,
      dikshaGuru: "आचार्य मघराज जी (मघवागणी)"
    },
    samadhiDetails: {
      date: "वि.सं. 1993 (1936 ई.) भाद्रपद शुक्ला षष्ठी",
      place: "गंगापुर, भीलवाड़ा (राजस्थान)"
    }
  },
  {
    id: 9,
    name: "आचार्य तुलसी",
    secularName: "तुलसी खटेड़",
    title: "नवम आचार्य / युगप्रधान / गणाधिपति",
    period: "1936 – 1994",
    startYear: 1936,
    endYear: 1994,
    isCurrent: false,
    description: "विश्व विख्यात संत, जिन्होंने 'अणुव्रत आंदोलन' के माध्यम से जैन धर्म की सीमाओं को पार कर वैश्विक नैतिकता की अलख जगाई। 20वीं सदी के महानतम आध्यात्मिक विचारकों में से एक।",
    achievements: [
      "अणुव्रत आंदोलन का सूत्रपात (1 मार्च 1949)",
      "जैन विश्व भारती (JVB), लाडनूं की स्थापना (1970)",
      "'समण श्रेणी' (Saman Order) की स्थापना कर विदेश यात्रा की बाधा को दूर किया (1980)",
      "आगमों का संपादन (आगम संपदा) एवं 'नया मोड़' कार्यक्रम",
      "अपने जीवनकाल में ही आचार्य पद का त्याग कर युवाचार्य महाप्रज्ञ को आचार्य बनाया (1994)"
    ],
    notableWorks: [
      "'जैन सिद्धांत दीपिका'",
      "'मनोनुशासनम्'",
      "'भिक्षु स्मृति ग्रंथ'",
      "सैकड़ों अणुव्रत गीत और साहित्य"
    ],
    birthDetails: {
      date: "वि.सं. 1971 (20 अक्टूबर 1914) कार्तिक शुक्ला द्वितीया",
      place: "लाडनूं (राजस्थान)",
      parents: "पिता: झूमरमल खटेड़, माता: वदनां जी"
    },
    dikshaDetails: {
      date: "वि.सं. 1982 (5 दिसंबर 1925)",
      place: "लाडनूं (राजस्थान)",
      age: 11,
      dikshaGuru: "आचार्य कालूगणी"
    },
    samadhiDetails: {
      date: "वि.सं. 2054 (23 जून 1997)",
      place: "गंगाशहर, बीकानेर (राजस्थान)"
    }
  },
  {
    id: 10,
    name: "आचार्य महाप्रज्ञ जी",
    secularName: "नथमल चोरड़िया",
    title: "दशम आचार्य / युगप्रधान",
    period: "1994 – 2010",
    startYear: 1994,
    endYear: 2010,
    isCurrent: false,
    description: "अध्यात्म और विज्ञान के अद्भुत समन्वयक। 'प्रेक्षा ध्यान' के प्रणेता, जिन्होंने पूर्व राष्ट्रपति डॉ. ए.पी.जे. अब्दुल कलाम के साथ मिलकर देश को दिशा दी।",
    achievements: [
      "'प्रेक्षा ध्यान' (Preksha Meditation) और 'जीवन विज्ञान' (Science of Living) की स्थापना",
      "अहिंसा समवाय (Ahimsa Samavaya) का विचार",
      "आगमों का हिंदी अनुवाद एवं आधुनिक संपादन",
      "राष्ट्रीय एकता के लिए 'कम्युनल हार्मनी अवार्ड' और 'इंदिरा गांधी पुरस्कार' से सम्मानित"
    ],
    notableWorks: [
      "'प्रेक्षा ध्यान: आधार और प्रयोग'",
      "'आपा में आपाणौ'",
      "'The Family and the Nation' (सह-लेखक: डॉ. ए.पी.जे. अब्दुल कलाम)",
      "300 से अधिक मौलिक पुस्तकें"
    ],
    birthDetails: {
      date: "वि.सं. 1977 (14 जून 1920) आषाढ़ कृष्णा त्रयोदशी",
      place: "टमकोर (राजस्थान)",
      parents: "पिता: तोलाराम चोरड़िया, माता: बालू जी"
    },
    dikshaDetails: {
      date: "वि.सं. 1987 (29 जनवरी 1931)",
      place: "सरदारशहर (राजस्थान)",
      age: 10,
      dikshaGuru: "आचार्य कालूगणी"
    },
    samadhiDetails: {
      date: "वि.सं. 2067 (9 मई 2010) वैशाख कृष्णा एकादशी",
      place: "सरदारशहर (राजस्थान)"
    }
  },
  {
    id: 11,
    name: "आचार्य महाश्रमण जी",
    secularName: "मोहन दूगड़",
    title: "एकादशम आचार्य / वर्तमान अनुशास्ता",
    period: "2010 – वर्तमान",
    startYear: 2010,
    endYear: null, 
    isCurrent: true,
    description: "महातपस्वी and वर्तमान अनुशास्ता। 'अहिंसा यात्रा' के माध्यम से भारत, नेपाल और भूटान के गाँव-गाँव में नशामुक्ति और सद्भावना का संदेश दे रहे हैं।",
    achievements: [
      "अहिंसा यात्रा (Ahimsa Yatra): 3 देशों, 20 राज्यों में 55,000+ किमी की ऐतिहासिक पदयात्रा (2014-2022)",
      "ज्ञानशालाओं (Gyanshala) के विशाल नेटवर्क का सुदृढ़ीकरण",
      "साधना और आध्यात्मिक अभ्यास पर अत्यधिक जोर",
      "लाखों लोगों को नशामुक्त और शाकाहारी बनने का संकल्प दिलाया"
    ],
    notableWorks: [
      "'अहिंसा यात्रा' से जुड़े वृत्तांत",
      "आगम साहित्य एवं दार्शनिक ग्रंथों का दिशा-निर्देशन",
      "अनेक प्रेरणादायी प्रवचन शृंखलाएँ"
    ],
    birthDetails: {
      date: "वि.सं. 2019 (13 मई 1962) वैशाख शुक्ला नवमी",
      place: "सरदारशहर (राजस्थान)",
      parents: "पिता: झूमरमल दूगड़, माता: नेमा देवी"
    },
    dikshaDetails: {
      date: "वि.सं. 2031 (5 मई 1974)",
      place: "सरदारशहर (राजस्थान)",
      age: 11,
      dikshaGuru: "आचार्य तुलसी"
    }
  }
];

const imagesMap: Record<number, string> = {
  1: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_972.JPG",
  2: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_973.JPG",
  3: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_974.JPG",
  4: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_975.JPG",
  5: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_976.JPG",
  6: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_977.JPG",
  7: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_978.JPG",
  8: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_979.JPG",
  9: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_980.JPG",
  10: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_981.JPG",
  11: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_982.JPG",
};

const quotesMap: Record<number, string> = {
  1: "Truth is singular, and when guarded by uncompromised personal rules, it elevates the soul to absolute liberation.",
  2: "The strength of a community lies not in numbers, but in its quiet commitment to corporate discipline.",
  3: "Seek the peace of the soul within; the external noise is merely an illusion that fades with light.",
  4: "Knowledge must flow directly into ethical action. An idle mind with scriptural knowledge is still in bondage.",
  5: "A quiet, steady mind is the ultimate fortress. No social storm can penetrate a heart filled with equanimity.",
  6: "Devotion is the essential track. Without deep love for the Guru and the Agams, scholarship is dry matter.",
  7: "Ignorance is a source of slips. Let study be your constant duty alongside absolute detachment.",
  8: "The refinement of the inner self through sustained study is the gateway to spiritual evolution.",
  9: "Self-purification is the core of religion. Unless the individual improves, society cannot improve.",
  10: "True peace is observed inside deep silence. In coordination with scientific laws, our ancient Yoga is proven.",
  11: "Let us walk together in harmony. Universal love is the greatest light that dispels the darkness of greed and competition.",
};

const tagsMap: Record<number, string[]> = {
  1: ['founder', 'reformer', 'author'],
  2: ['early', 'consolidator'],
  3: ['early', 'preacher'],
  4: ['author', 'poet', 'administrator'],
  5: ['saintly', 'discipline'],
  6: ['saintly', 'devotional'],
  7: ['education', 'scholarship'],
  8: ['education', 'literary'],
  9: ['reformer', 'anuvrat', 'global'],
  10: ['preksha', 'scientist', 'author'],
  11: ['ahimsa', 'marches', 'living-guru'],
};

const chaturmasMap: Record<number, { year: number; loc: string }[]> = {
  11: [
    { year: 2015, loc: "Nepal" },
    { year: 2016, loc: "Guwahati" },
    { year: 2017, loc: "Kolkata" },
    { year: 2018, loc: "Chennai" },
    { year: 2019, loc: "Bengaluru" },
    { year: 2020, loc: "Hyderabad" },
    { year: 2021, loc: "Bhilwara" },
    { year: 2022, loc: "Chhapar" },
    { year: 2023, loc: "Mumbai" },
    { year: 2024, loc: "Delhi" },
    { year: 2025, loc: "Udhna (Surat)" },
    { year: 2026, loc: "Rajarhat (Kolkata)" },
  ]
};

export const ACHARYAS: Acharya[] = acharyas.map(item => {
  const stats: { label: string; value: string }[] = [];
  if (item.birthDetails?.date) {
    stats.push({ label: "Date of Birth", value: item.birthDetails.date + (item.birthDetails.place ? ` in ${item.birthDetails.place}` : "") });
  }
  if (item.dikshaDetails?.date) {
    stats.push({ label: "Date of Initiation", value: item.dikshaDetails.date });
  }
  stats.push({ label: "Headship Period", value: item.period });
  if (item.samadhiDetails?.date) {
    stats.push({ label: "Heavenly Abode", value: item.samadhiDetails.date + (item.samadhiDetails.place ? ` in ${item.samadhiDetails.place}` : "") });
  }

  return {
    ...item,
    nr: item.id,
    img: imagesMap[item.id] || "",
    desc: item.description,
    stats,
    teachings: item.achievements,
    quote: quotesMap[item.id] || item.description,
    tags: tagsMap[item.id] || ["acharya"],
    chaturmas: chaturmasMap[item.id] || [],
    fullBio: item.description,
    contributions: item.achievements
  };
});
