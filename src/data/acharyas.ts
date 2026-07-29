export interface Acharya {
  id: number;
  name: string;
  aliases?: string[];
  tenureStart: number;
  tenureEnd: number | null;
  birthYear: number | null;
  deathYear: number | null;
  vikramSamvatStart?: number;
  vikramSamvatEnd?: number | null;
  keyContributions: string[];
  initiatesMale?: number;
  initiatesFemale?: number;
  birthName?: string;
  secularName?: string;
  isCurrent: boolean;
  isYuvacharya?: boolean;
  appointedDate?: string;
  appointedBy?: string;
  appointedLocation?: string;
  eventName?: string;

  // Backward-compatibility fields
  nr?: number;
  title?: string;
  period?: string;
  startYear?: number;
  endYear?: number | null;
  description?: string;
  desc?: string;
  achievements?: string[];
  notableWorks?: string[];
  img?: string;
  quote?: string;
  tags?: string[];
  chaturmas?: { year: number; loc: string }[];
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
  stats?: { label: string; value: string }[];
  teachings?: string[];
  fullBio?: string;
  contributions?: string[];
}

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
  12: "https://prakrit.org.in/prakrit_dev/files/acharya_images/acharya_982.JPG"
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
  12: "Spiritual discipline and inner dedication are the true foundation of leadership in the Dharmasangh."
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

export const rawAcharyas: Acharya[] = [
  {
    id: 1,
    name: "Acharya Bhikshu",
    aliases: ["Bhikhanji", "Bhikhamji", "Bhikhu", "Swamiji"],
    tenureStart: 1760,
    tenureEnd: 1803,
    birthYear: 1726,
    deathYear: 1803,
    keyContributions: [
      "Founder of Terapanth at Kelwa, Rajasthan",
      "Established 13 core principles (Tera-pantha)",
      "Ideology of one Acharya, one principle, one thought",
      "Ended concept of self-discipleship",
      "Revolutionized principles that had become meaningless"
    ],
    isCurrent: false,
    secularName: "भीखणजी",
    birthDetails: { date: "वि.सं. 1783 (1726 ई.) आषाढ़ शुक्ला त्रयोदशी", place: "कंटालिया, मारवाड़", parents: "पिता: बल्लूजी, माता: दीपां बाई" },
    dikshaDetails: { date: "वि.सं. 1808 (1751 ई.)", place: "मारवाड़", age: 25, dikshaGuru: "आचार्य रघुनाथ जी" },
    samadhiDetails: { date: "वि.सं. 1860 (1803 ई.) भाद्रपद शुक्ला त्रयोदशी", place: "सिरियारी, पाली" }
  },
  {
    id: 2,
    name: "Acharya Bharimal",
    tenureStart: 1803,
    tenureEnd: 1821,
    birthYear: 1747,
    deathYear: 1821,
    vikramSamvatStart: 1860,
    vikramSamvatEnd: 1878,
    keyContributions: [
      "Deep scriptural memorization",
      "Rewrote all of Swamiji's works — considered authentic copies",
      "Wrote ~5 lakh poems in lifetime",
      "First to test all new codes of conduct",
      "Extremely courageous and poised"
    ],
    initiatesMale: 38,
    initiatesFemale: 44,
    isCurrent: false,
    secularName: "भारीमल",
    birthDetails: { date: "वि.सं. 1803 (1747 ई.)", place: "मुहां ग्राम, मेवाड़", parents: "पिता: किशनोजी, माता: धारिणी" },
    dikshaDetails: { date: "वि.सं. 1813 (1756 ई.)", place: "मेवाड़", age: 10, dikshaGuru: "आचार्य भिक्षु" },
    samadhiDetails: { date: "वि.सं. 1878 (1821 ई.) माघ कृष्णा अष्टमी", place: "राजनगर, राजसमंद" }
  },
  {
    id: 3,
    name: "Acharya Raichand",
    tenureStart: 1821,
    tenureEnd: 1851,
    birthYear: 1790,
    deathYear: 1851,
    vikramSamvatStart: 1878,
    vikramSamvatEnd: 1908,
    keyContributions: [
      "First Acharya to visit Gujarat, Saurashtra, and Kutch",
      "Sweet, melodious voice — could be heard in nearby villages",
      "Expert in giving religious sermons",
      "Fearless personality — confronted robbers with courage"
    ],
    initiatesMale: 77,
    initiatesFemale: 168,
    isCurrent: false,
    secularName: "रायचंद",
    birthDetails: { date: "वि.सं. 1847 (1790 ई.)", place: "बड़ी रावलिया, मेवाड़", parents: "पिता: चंतराजी, माता: कुशलां जी" },
    dikshaDetails: { date: "वि.सं. 1857 (1801 ई.) चैत्र शुक्ला पूर्णिमा", place: "बड़ी रावलिया", age: 11, dikshaGuru: "आचार्य भिक्षु" },
    samadhiDetails: { date: "वि.सं. 1908 (1852 ई.) माघ कृष्णा चतुर्दशी", place: "छोटी रावलिया" }
  },
  {
    id: 4,
    name: "Acharya Jeetmal",
    aliases: ["Jayacharya"],
    tenureStart: 1851,
    tenureEnd: 1881,
    birthYear: 1803,
    deathYear: 1881,
    vikramSamvatStart: 1908,
    vikramSamvatEnd: 1938,
    keyContributions: [
      "Prolific writer — 'Jayacharya's revolution'",
      "Equal distribution reform (socialistic outlook)",
      "Translated Pannavana in Rajasthani at age 19",
      "Created Bhagavati ki Jod (5th part of Bharati)",
      "Wrote 3+ lakh verses on philosophy, meditation, grammar",
      "Called 'Second Bhikshu' for dedication to Bhikshu's philosophy"
    ],
    initiatesMale: 105,
    initiatesFemale: 224,
    isCurrent: false,
    secularName: "जीतमल गोलछा",
    birthDetails: { date: "वि.सं. 1860 (1803 ई.) आश्विन शुक्ला चतुर्दशी", place: "रोयट, पाली", parents: "पिता: ऐदान जी, माता: कल्लू जी" },
    dikshaDetails: { date: "वि.सं. 1869 (1813 ई.) माघ कृष्णा सप्तमी", place: "जयपुर", age: 9, dikshaGuru: "युवाचार्य रायचंद जी" },
    samadhiDetails: { date: "वि.सं. 1938 (1881 ई.) भाद्रपद कृष्णा द्वादशी", place: "रामनिवास बाग, जयपुर" }
  },
  {
    id: 5,
    name: "Acharya Maghraj",
    tenureStart: 1881,
    tenureEnd: 1892,
    birthYear: 1840,
    deathYear: 1892,
    vikramSamvatStart: 1938,
    vikramSamvatEnd: 1948,
    keyContributions: [
      "Most tender-hearted of all Terapanth Acharyas",
      "Never gave strong reproach — unique non-violent discipline",
      "Extremely polite in disciplining the sect",
      "Appointed as head arbitrator at age 14"
    ],
    initiatesMale: 36,
    initiatesFemale: 83,
    isCurrent: false,
    secularName: "मघराज बेंगानी",
    birthDetails: { date: "वि.सं. 1897 (1840 ई.) चैत्र शुक्ला एकादशी", place: "बीदासर", parents: "पिता: पूरणमल जी, माता: गुलाबां जी" },
    dikshaDetails: { date: "वि.सं. 1908 (1851 ई.)", place: "लाडनूं", age: 11, dikshaGuru: "युवाचार्य जीतमल जी" },
    samadhiDetails: { date: "वि.सं. 1949 (1892 ई.) चैत्र कृष्णा पंचमी", place: "सरदारशहर" }
  },
  {
    id: 6,
    name: "Acharya Manaklal",
    tenureStart: 1892,
    tenureEnd: 1897,
    birthYear: 1855,
    deathYear: 1897,
    vikramSamvatStart: 1949,
    vikramSamvatEnd: 1945,
    keyContributions: [
      "First Acharya to visit Haryana",
      "Preferred long journeys to expand the sect",
      "Fair skinned, tall, fragile with loud sweet voice",
      "Died young at 42 — no successor nominated"
    ],
    initiatesMale: 15,
    initiatesFemale: 25,
    isCurrent: false,
    secularName: "माणकलाल श्रीमाल",
    birthDetails: { date: "वि.सं. 1912 (1855 ई.) भाद्रपद कृष्णा चतुर्थी", place: "जयपुर", parents: "पिता: हुकमीचंद जी, माता: छोटां जी" },
    dikshaDetails: { date: "वि.सं. 1928 (1872 ई.) फाल्गुन शुक्ला एकादशी", place: "लाडनूं", age: 16, dikshaGuru: "आचार्य जीतमल जी" },
    samadhiDetails: { date: "वि.सं. 1954 (1897 ई.) कार्तिक कृष्णा तृतीया", place: "सुजानगढ़" }
  },
  {
    id: 7,
    name: "Acharya Dalchand",
    tenureStart: 1897,
    tenureEnd: 1909,
    birthYear: 1852,
    deathYear: 1909,
    keyContributions: [
      "First non-nominated succession in Terapanth history",
      "Unanimously elected by leading saints at Ladnun",
      "Steered Terapanth for ~12 years effectively",
      "Fearless attitude solved many challenging situations",
      "Died at age 59 at Bidasar"
    ],
    isCurrent: false,
    secularName: "डालचंद पीपड़ा",
    birthDetails: { date: "वि.सं. 1909 (1852 ई.) आषाढ़ शुक्ला चतुर्थी", place: "उज्जैन", parents: "पिता: कानीराम जी, माता: जड़ाव जी" },
    dikshaDetails: { date: "वि.सं. 1923 (1866 ई.) भाद्रपद कृष्णा द्वादशी", place: "इंदौर", age: 14, dikshaGuru: "मुनि हीरालाल जी" },
    samadhiDetails: { date: "वि.सं. 1966 (1909 ई.) भाद्रपद शुक्ला द्वादशी", place: "लाडनूं" }
  },
  {
    id: 8,
    name: "Acharya Kalugani",
    birthName: "Kaluram",
    tenureStart: 1909,
    tenureEnd: 1936,
    birthYear: 1877,
    deathYear: 1936,
    keyContributions: [
      "Heavy focus on education and scriptural training of monks",
      "Born Kaluram — name changed to Kalugani",
      "Family moved close to Sangh after father's early death",
      "Mother and cousin also embraced sainthood"
    ],
    isCurrent: false,
    secularName: "कालूराम चोपड़ा",
    birthDetails: { date: "वि.सं. 1933 (1877 ई.) फाल्गुन शुक्ला द्वितीया", place: "छापर", parents: "पिता: मूलचंद जी चोपड़ा, माता: चोगां जी" },
    dikshaDetails: { date: "वि.सं. 1944 (1887 ई.) आश्विन कृष्णा तृतीया", place: "बीदासर", age: 10, dikshaGuru: "आचार्य मघराज जी" },
    samadhiDetails: { date: "वि.सं. 1993 (1936 ई.) भाद्रपद शुक्ला षष्ठी", place: "गंगापुर, भीलवाड़ा" }
  },
  {
    id: 9,
    name: "Acharya Tulsi",
    tenureStart: 1936,
    tenureEnd: 1997,
    birthYear: 1914,
    deathYear: 1997,
    keyContributions: [
      "Anuvrat Movement founder (1949)",
      "776+ monks/nuns initiated",
      "Created Saman/Samani rank (overseas travel permitted)",
      "Established Jain Vishva Bharati institute at Ladnun",
      "Called 'Yuga-Pradhan' by President V.V. Giri (1971)",
      "Dr. Radhakrishnan included in world's 15 great persons",
      "Proponent of Jain unity regardless of sectarian differences"
    ],
    isCurrent: false,
    secularName: "तुलसी खटेड़",
    birthDetails: { date: "वि.सं. 1971 (20 अक्टूबर 1914) कार्तिक शुक्ला द्वितीया", place: "लाडनूं", parents: "पिता: झूमरमल खटेड़, माता: वदनां जी" },
    dikshaDetails: { date: "वि.सं. 1982 (5 दिसंबर 1925)", place: "लाडनूं", age: 11, dikshaGuru: "आचार्य कालूगणी" },
    samadhiDetails: { date: "वि.सं. 2054 (23 जून 1997)", place: "गंगाशहर, बीकानेर" }
  },
  {
    id: 10,
    name: "Acharya Mahapragya",
    birthName: "Nathmal",
    aliases: ["Mahaprajna", "Yuvacharya Mahaprajna"],
    tenureStart: 1997,
    tenureEnd: 2010,
    birthYear: 1920,
    deathYear: 2010,
    keyContributions: [
      "Formulated Preksha Meditation (Perceptive meditation)",
      "Led historic 10,000 km Ahimsa Yatra on foot",
      "Jeevan Vigyan (Science of Living) founder",
      "Called 'Second Vivekananda of India' by Ramdhari Singh Dinkar",
      "Mobile encyclopedia — scholar of Jain Agamas",
      "Coordinator of science and spiritualism",
      "Nominated Yuvacharya 4 Feb 1979 at Rajaldesar"
    ],
    isCurrent: false,
    secularName: "नथमल चोरड़िया",
    birthDetails: { date: "वि.सं. 1977 (14 जून 1920) आषाढ़ कृष्णा त्रयोदशी", place: "टमकोर", parents: "पिता: तोलाराम चोरड़िया, माता: बालू जी" },
    dikshaDetails: { date: "वि.सं. 1987 (29 जनवरी 1931)", place: "सरदारशहर", age: 10, dikshaGuru: "आचार्य कालूगणी" },
    samadhiDetails: { date: "वि.सं. 2067 (9 मई 2010) वैशाख कृष्णा एकादशी", place: "सरदारशहर" }
  },
  {
    id: 11,
    name: "Acharya Mahashraman",
    birthName: "Mudit",
    tenureStart: 2010,
    tenureEnd: null,
    birthYear: 1962,
    deathYear: null,
    keyContributions: [
      "Current Acharya of Terapanth",
      "Became Yuvacharya in 1997 at age 35",
      "Scientific and rational outlook",
      "Guides youth wings morally and emotionally",
      "Extraordinary genius with minute insight and intuition"
    ],
    isCurrent: true,
    secularName: "मोहन दूगड़",
    birthDetails: { date: "वि.सं. 2019 (13 मई 1962) वैशाख शुक्ला नवमी", place: "सरदारशहर", parents: "पिता: झूमरमल दूगड़, माता: नेमा देवी" },
    dikshaDetails: { date: "वि.सं. 2031 (5 मई 1974)", place: "सरदारशहर", age: 11, dikshaGuru: "आचार्य तुलसी" }
  }
];

export const YUVACHARYA: Acharya = {
  id: 12,
  name: "Yuvacharya Mahaveer Kumar",
  tenureStart: 2026,
  tenureEnd: null,
  birthYear: null,
  deathYear: null,
  keyContributions: [
    "Appointed as successor-designate to Acharya Mahashraman",
    "Previous position: Mukhya Muni",
    "First Yuvacharya appointment since Mahapragya (1979)"
  ],
  isCurrent: true,
  isYuvacharya: true,
  appointedDate: "2026-07-27",
  appointedBy: "Acharya Mahashraman",
  appointedLocation: "Aapaon, Ladnun, Rajasthan",
  eventName: "Sampannata Samaroh",
  nr: 12,
  title: "भावी उत्तराधिकारी (युवाचार्य)",
  period: "2026 – वर्तमान",
  startYear: 2026,
  endYear: null,
  img: imagesMap[12],
  description: "27 जुलाई 2026 को आचार्य श्री महाश्रमण जी द्वारा लाडनूँ में तेरापंथ धर्मसंघ के युवाचार्य पद पर नियुक्त।",
  desc: "27 जुलाई 2026 को आचार्य श्री महाश्रमण जी द्वारा लाडनूँ में तेरापंथ धर्मसंघ के युवाचार्य पद पर नियुक्त।",
  achievements: [
    "आचार्य महाश्रमण जी के उत्तराधिकारी घोषित (27 जुलाई 2026)",
    "पूर्व पद: मुख्य मुनि",
    "लाडनूँ में भिक्षु जन्म त्रिशताब्दी वर्ष संपन्नता समारोह पर नियुक्ति"
  ],
  notableWorks: ["संघीय अनुशासन एवं धर्मसंघ दिशा-निर्देशन"]
};

export const ACHARYAS: Acharya[] = rawAcharyas.map(a => {
  const period = `${a.tenureStart} – ${a.tenureEnd ? a.tenureEnd : 'वर्तमान'}`;
  const title = a.id === 1 ? "प्रवर्तक / प्रथम आचार्य" : a.isCurrent ? "वर्तमान अनुशास्ता" : `आचार्य (${a.id})`;
  const desc = a.keyContributions.join(". ");
  const stats: { label: string; value: string }[] = [];

  if (a.birthDetails?.date) {
    stats.push({ label: "Date of Birth", value: a.birthDetails.date + (a.birthDetails.place ? ` in ${a.birthDetails.place}` : "") });
  }
  if (a.dikshaDetails?.date) {
    stats.push({ label: "Date of Initiation", value: a.dikshaDetails.date });
  }
  stats.push({ label: "Headship Period", value: period });
  if (a.samadhiDetails?.date) {
    stats.push({ label: "Heavenly Abode", value: a.samadhiDetails.date + (a.samadhiDetails.place ? ` in ${a.samadhiDetails.place}` : "") });
  }

  return {
    ...a,
    nr: a.id,
    title,
    period,
    startYear: a.tenureStart,
    endYear: a.tenureEnd,
    description: desc,
    desc,
    achievements: a.keyContributions,
    notableWorks: a.keyContributions,
    img: imagesMap[a.id] || "",
    quote: quotesMap[a.id] || desc,
    tags: ["acharya"],
    chaturmas: chaturmasMap[a.id] || [],
    stats,
    teachings: a.keyContributions,
    fullBio: desc,
    contributions: a.keyContributions
  };
});

// Alias export for backward compatibility
export const acharyas = ACHARYAS;

// Helper functions
export const getCurrentAcharya = (): Acharya =>
  ACHARYAS.find((a) => a.isCurrent && !a.isYuvacharya)!;

export const getYuvacharya = (): Acharya | undefined =>
  YUVACHARYA.isYuvacharya ? YUVACHARYA : undefined;

export const getAcharyaById = (id: number): Acharya | undefined => {
  if (id === 12) return YUVACHARYA;
  return ACHARYAS.find((a) => a.id === id);
};

export const getAcharyaByName = (name: string): Acharya | undefined => {
  if (name.toLowerCase().includes("mahaveer") || name.toLowerCase().includes("yuvacharya")) {
    return YUVACHARYA;
  }
  return ACHARYAS.find(
    (a) =>
      a.name.toLowerCase().includes(name.toLowerCase()) ||
      a.aliases?.some((alias) =>
        alias.toLowerCase().includes(name.toLowerCase())
      )
  );
};

export const getTotalAcharyas = (): number => ACHARYAS.length;

export const getAcharyaTimeline = (): string[] =>
  ACHARYAS.map(
    (a) =>
      `${a.id}. ${a.name} (${a.tenureStart}–${a.tenureEnd ?? "present"})`
  );

export default ACHARYAS;
