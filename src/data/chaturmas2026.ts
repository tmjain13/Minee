export interface ChaturmasDeclaration {
  id: number;
  date: string;
  dateEn: string;
  monk: string;
  monkEn: string;
  thana: string;
  thanaEn: string;
  venue: string;
  venueEn: string;
  state: 'MAHARASHTRA' | 'GUJARAT' | 'RAJASTHAN' | 'DELHI';
  zone: string;
  zoneEn: string;
  era: string;
  eraEn: string;
  source: string;
  sourceEn: string;
  lat?: number;
  lng?: number;
}

export const CHATURMAS_MASTER_2026: ChaturmasDeclaration[] = [
  // --- MUMBAI / MAHARASHTRA REGION ---
  { 
    id: 1, 
    date: "31 जनवरी २०२६", 
    dateEn: "31 January 2026",
    monk: "साध्वी श्री कंचनप्रभाजी", 
    monkEn: "Sadhvi Sri Kanchanprabha Ji",
    thana: "आदि ठाना-५", 
    thanaEn: "Adi Thana-5",
    venue: "कालबादेवी (मुम्बई, महाराष्ट्र)", 
    venueEn: "Kalbadevi, Mumbai, Maharashtra",
    zone: "मुम्बई प्रभाग", 
    zoneEn: "Mumbai Division",
    state: "MAHARASHTRA",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 18.9515,
    lng: 72.8291
  },
  { 
    id: 2, 
    date: "08 फ़रवरी २०२६", 
    dateEn: "08 February 2026",
    monk: "साध्वीश्री निर्वाणश्रीजी", 
    monkEn: "Sadhvi Sri Nirvanshri Ji",
    thana: "ठाना अनुक्रम", 
    thanaEn: "Thana Family",
    venue: "चेम्बूर (मुम्बई, महाराष्ट्र)", 
    venueEn: "Chembur, Mumbai, Maharashtra",
    zone: "मुम्बई प्रभाग", 
    zoneEn: "Mumbai Division",
    state: "MAHARASHTRA",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 19.0622,
    lng: 72.9024
  },
  { 
    id: 3, 
    date: "08 फ़रवरी २०२६", 
    dateEn: "08 February 2026",
    monk: "\"शासनश्री\" साध्वी श्री शिवमाला जी", 
    monkEn: "\"Shasan Shri\" Sadhvi Sri Shivmala Ji",
    thana: "ठाना अनुक्रम", 
    thanaEn: "Thana Family",
    venue: "वाशी (नवी मुम्बई, महाराष्ट्र)", 
    venueEn: "Vashi, Navi Mumbai, Maharashtra",
    zone: "मुम्बई प्रभाग", 
    zoneEn: "Mumbai Division",
    state: "MAHARASHTRA",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 19.0745,
    lng: 72.9978
  },
  
  // --- GUJARAT REGION ---
  { 
    id: 4, 
    date: "30 मई २०२६", 
    dateEn: "30 May 2026",
    monk: "मुनि श्री मुनि सुव्रत कुमार जी स्वामी", 
    monkEn: "Muni Sri Muni Suvrat Kumar Ji Swami",
    thana: "आदि ठाना ३", 
    thanaEn: "Adi Thana 3",
    venue: "पश्चिम अहमदाबाद नवरंगपुरा", 
    venueEn: "West Ahmedabad Navrangpura, Gujarat",
    zone: "अहमदाबाद प्रभाग", 
    zoneEn: "Ahmedabad Division",
    state: "GUJARAT",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 23.0360,
    lng: 72.5610
  },
  { 
    id: 5, 
    date: "11 फ़रवरी २०२६", 
    dateEn: "11 February 2026",
    monk: "\"शासनश्री\" साध्वी श्री मधुबालाजी", 
    monkEn: "\"Shasan Shri\" Sadhvi Sri Madhubala Ji",
    thana: "ठाना अनुक्रम", 
    thanaEn: "Thana Family",
    venue: "पर्वतपाटिया, सूरत (गुजरात)", 
    venueEn: "Parvat Patiya, Surat, Gujarat",
    zone: "सूरत प्रभाग", 
    zoneEn: "Surat Division",
    state: "GUJARAT",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 21.1969,
    lng: 72.8596
  },
  
  // --- RAJASTHAN REGION ---
  { 
    id: 6, 
    date: "07 जून २०२६", 
    dateEn: "07 June 2026",
    monk: "शासनश्री साध्वी श्री सत्यप्रभा जी", 
    monkEn: "Shasan Shri Sadhvi Sri Satyaprabha Ji",
    thana: "ठाना ३", 
    thanaEn: "Thana 3",
    venue: "पचपदरा (राजस्थान)", 
    venueEn: "Pachpadra, Rajasthan",
    zone: "बाड़मेर प्रभाग", 
    zoneEn: "Barmer Division",
    state: "RAJASTHAN",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 25.9220,
    lng: 72.2560
  },
  { 
    id: 7, 
    date: "31 मई २०२६", 
    dateEn: "31 May 2026",
    monk: "शासनश्री मुनिश्री सुरेशकुमारजी 'हरनावां'", 
    monkEn: "Shasan Shri Muni Suresh Kumar Ji 'Harnawa'",
    thana: "ठाना अनुक्रम", 
    thanaEn: "Thana Family",
    venue: "कांकरोली (राजसमंद, राजस्थान)", 
    venueEn: "Kankroli, Rajsamand, Rajasthan",
    zone: "मेवाड़ प्रभाग", 
    zoneEn: "Mewar Division",
    state: "RAJASTHAN",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 25.0740,
    lng: 73.8820
  },
  { 
    id: 8, 
    date: "09 मार्च २०२६", 
    dateEn: "09 March 2026",
    monk: "साध्वी श्री मंगलप्रज्ञाजी", 
    monkEn: "Sadhvi Sri Mangal Pragya Ji",
    thana: "ठाना अनुक्रम", 
    thanaEn: "Thana Family",
    venue: "बालोतरा (राजस्थान)", 
    venueEn: "Balotra, Rajasthan",
    zone: "मारवाड़ प्रभाग", 
    zoneEn: "Marwar Division",
    state: "RAJASTHAN",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 25.8340,
    lng: 72.2350
  },
  { 
    id: 9, 
    date: "10 फ़रवरी २०२६", 
    dateEn: "10 February 2026",
    monk: "साध्वी कुंदन प्रभाजी", 
    monkEn: "Sadhvi Kundan Prabha Ji",
    thana: "ठाना अनुक्रम", 
    thanaEn: "Thana Family",
    venue: "जसोल (राजस्थान)", 
    venueEn: "Jasol, Rajasthan",
    zone: "मारवाड़ प्रभाग", 
    zoneEn: "Marwar Division",
    state: "RAJASTHAN",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 25.7550,
    lng: 72.2420
  },
  
  // --- DELHI / NCR REGION ---
  { 
    id: 10, 
    date: "06 फ़रवरी २०२६", 
    dateEn: "06 February 2026",
    monk: "मुनिश्री विमल कुमार जी", 
    monkEn: "Muni Sri Vimal Kumar Ji",
    thana: "ठाना-४", 
    thanaEn: "Thana-4",
    venue: "शाहदरा (दिल्ली-NCR) [वर्तमान प्रवास: फरीदाबाद]", 
    venueEn: "Shahdara, Delhi-NCR [Current Stay: Faridabad]",
    zone: "दिल्ली-NCR", 
    zoneEn: "Delhi-NCR Division",
    state: "DELHI",
    era: "वर्ष २०२६ (वि.सं. २०८३)",
    eraEn: "Year 2026 (V.S. 2083)",
    source: "ABTYP Jain Terapanth News",
    sourceEn: "ABTYP Jain Terapanth News",
    lat: 28.6730,
    lng: 77.2940
  }
];
