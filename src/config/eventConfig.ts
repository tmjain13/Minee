export interface MajorEvent {
  id: string;
  title: string;
  hindiTitle: string;
  tithi: string;
  date: string; // ISO format string YYYY-MM-DD
  description: string;
}

export const MAJOR_EVENTS: MajorEvent[] = [
  {
    id: 'mahapragya_jayanti',
    title: 'Acharya Mahapragya Jayanti',
    hindiTitle: 'आचार्य महाप्रज्ञ जयंती',
    tithi: 'आषाढ़ कृष्ण त्रयोदशी',
    date: '2026-07-11T00:00:00',
    description: '106th birth anniversary celebration of great philosopher-saint Acharya Mahapragya.'
  },
  {
    id: 'paryushan_aarambh',
    title: 'Paryushan Parva Aarambh',
    hindiTitle: 'पर्युषण पर्व आरंभ',
    tithi: 'भाद्रपद कृष्ण द्वादशी',
    date: '2026-09-07T00:00:00',
    description: 'Commencement of the 8-day holy spiritual festival of reflection and self-purification.'
  },
  {
    id: 'maryada_lekhan',
    title: 'Maryada Patra Lekhan Divas',
    hindiTitle: 'मर्यादा पत्र लेखन दिवस',
    tithi: 'भाद्रपद शुक्ल तृतीया',
    date: '2026-09-14T00:00:00',
    description: 'Commemoration of the written ethical code of conduct of the Terapanth order.'
  },
  {
    id: 'samvatsari',
    title: 'Samvatsari Parva',
    hindiTitle: 'संवत्सरी पर्व',
    tithi: 'भाद्रपद शुक्ल चतुर्थी',
    date: '2026-09-15T00:00:00',
    description: 'The supreme day of forgiveness, introspection, and absolute spiritual orientation.'
  },
  {
    id: 'kshamapana',
    title: 'Kshamapana Divas (Forgiveness)',
    hindiTitle: 'क्षमापना दिवस',
    tithi: 'भाद्रपद शुक्ल पंचमी',
    date: '2026-09-16T00:00:00',
    description: 'The global day of seeking and granting forgiveness (Michhami Dukkadam) to all living beings.'
  },
  {
    id: 'bhikshu_nirvan',
    title: 'Acharya Bhikshu Nirvan Divas',
    hindiTitle: 'आचार्य भिक्षु निर्वाण दिवस',
    tithi: 'भाद्रपद शुक्ल एकादशी',
    date: '2026-09-21T00:00:00',
    description: 'Commemoration of the ultimate liberation anniversary of founder Acharya Bhikshu at Siriyari.'
  },
  {
    id: 'anuvrat_sthapana',
    title: 'Anuvrat Sthapana Divas',
    hindiTitle: 'अणुव्रत स्थापना दिवस',
    tithi: 'कार्तिक कृष्ण द्वितीया',
    date: '2026-10-27T00:00:00',
    description: 'Foundation day of the global ethic movement initiated by Acharya Tulsi in 1949.'
  },
  {
    id: 'diwali_nirvan',
    title: 'Diwali (Mahavir Nirvan)',
    hindiTitle: 'दीपावली (महावीर निर्वाण)',
    tithi: 'कार्तिक अमावस्या',
    date: '2026-11-09T00:00:00',
    description: 'The holy day celebrating Bhagwan Mahavira achieving ultimate liberation (Moksha).'
  },
  {
    id: 'gyan_panchami',
    title: 'Gyan Panchami',
    hindiTitle: 'ज्ञान पंचमी',
    tithi: 'कार्तिक शुक्ल पंचमी',
    date: '2026-11-14T00:00:00',
    description: 'The auspicious day dedicated to worshipping holy scriptures, knowledge, and inner learning.'
  },
  {
    id: 'kartik_purnima',
    title: 'Kartiky Purnima',
    hindiTitle: 'कार्तिकी पूर्णिमा',
    tithi: 'कार्तिक पूर्णिमा',
    date: '2026-11-24T00:00:00',
    description: 'A major day of spiritual vows, ending of the Chaturmas austerity periods.'
  },
  {
    id: 'maun_ekadashi',
    title: 'Maun Ekadashi',
    hindiTitle: 'मौन एकादशी',
    tithi: 'मार्गशीर्ष शुक्ल एकादशी',
    date: '2026-12-20T00:00:00',
    description: 'The profound day of absolute silence (Mauna), fasting, and chanting the holy Navkar mantra.'
  },
  {
    id: 'parshvanath_jayanti',
    title: 'Paush Dashami (Parshvanath Jayanti)',
    hindiTitle: 'पौष दशमी (पार्श्वनाथ जयंती)',
    tithi: 'पौष कृष्ण दशमी',
    date: '2027-01-02T00:00:00',
    description: 'Birth anniversary celebrations of the 23rd Tirthankara, Bhagwan Parshvanath.'
  },
  {
    id: 'tulsi_diksha',
    title: 'Acharya Tulsi Deeksha Divas',
    hindiTitle: 'आचार्य तुलसी दीक्षा दिवस',
    tithi: 'पौष शुक्ल द्वितीया',
    date: '2027-01-09T00:00:00',
    description: 'Commemoration of the monastic initiation anniversary of the 9th head, Acharya Tulsi.'
  },
  {
    id: 'maryada_mahotsav',
    title: 'Maryada Mahotsav',
    hindiTitle: 'मर्यादा महोत्सव',
    tithi: 'माघ शुक्ल सप्तमी',
    date: '2027-02-13T00:00:00',
    description: 'The grand annual ethical convention of Shvetambar Terapanth order, reinforcing core vows.'
  },
  {
    id: 'ahimsa_anniversary',
    title: 'Ahimsa Yatra Anniversary',
    hindiTitle: 'अहिंसा यात्रा वार्षिकोत्सव',
    tithi: 'चैत्र कृष्ण नवमी',
    date: '2027-03-31T00:00:00',
    description: 'Anniversary celebration of Acharya Mahashraman Ji\'s historic 50,000+ km barefoot foot-journey.'
  },
  {
    id: 'mahavir_jayanti',
    title: 'Mahavir Jayanti',
    hindiTitle: 'महावीर जयंती',
    tithi: 'चैत्र शुक्ल त्रयोदशी',
    date: '2027-04-19T00:00:00',
    description: 'The supreme birth anniversary festival of the 24th Tirthankara, Bhagwan Mahavir.'
  },
  {
    id: 'akshaya_tritiya',
    title: 'Akshaya Tritiya (Varsitap Parna)',
    hindiTitle: 'अक्षय तृतीया (वरसीतप पारणा)',
    tithi: 'वैशाख शुक्ल तृतीया',
    date: '2027-05-08T00:00:00',
    description: 'The auspicious day of breaking the year-long alternate-day fasts (Varsitap) with sugarcane juice.'
  }
];
