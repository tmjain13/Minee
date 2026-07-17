export interface PravasData {
  id: string;
  name: string;
  type: 'Acharya' | 'Muni' | 'Sadhvi';
  thana: number;
  region: string;
  location: string;
  contact: string;
  contactPerson?: string; // कासीद का नाम
  date: string; // YYYY-MM-DD
  mapLink?: string;
}

export const VIHAR_DATA: PravasData[] = [
  // --- ACHARYA SHREE ---
  {
    id: "1",
    name: "आचार्य श्री महाश्रमणजी",
    type: "Acharya",
    thana: 1,
    region: "Rajasthan",
    location: "जैन विश्व भारती, लाडनूं",
    contact: "7044448888",
    contactPerson: "हेमन्त बैद (शिविर कार्यालय)",
    date: "2026-07-17",
    mapLink: "https://maps.app.goo.gl/DLhgkEoSfbfPv2uZ9?g_st=aw"
  },
  
  // --- DELHI NCR (From 15th July Image & 17th July Text) ---
  {
    id: "2",
    name: "बहुश्रुत मुनिश्री उदित कुमार जी",
    type: "Muni",
    thana: 3,
    region: "Delhi",
    location: "जम्मड़ गेस्ट हाउस, E-856, सरस्वती विहार, पीतमपुरा (विहार फ्रॉम तरुण एंक्लेव)",
    contact: "9983478999",
    contactPerson: "कासीद लक्ष्मण",
    date: "2026-07-17"
  },
  {
    id: "3",
    name: "शासनश्री साध्वीश्री सुव्रताजी",
    type: "Sadhvi",
    thana: 4,
    region: "Delhi",
    location: "अणुव्रत भवन, 210, दीनदयाल उपाध्याय मार्ग, नई दिल्ली",
    contact: "8375941210",
    contactPerson: "कासीद अरुण",
    date: "2026-07-17"
  },
  {
    id: "4",
    name: "शासनश्री साध्वीश्री सुमनश्री जी",
    type: "Sadhvi",
    thana: 4,
    region: "Delhi",
    location: "तेरापंथ भवन, सैक्टर-05, रोहिणी, दिल्ली",
    contact: "9915501240",
    contactPerson: "कासीद पूरन",
    date: "2026-07-17"
  },
  {
    id: "5",
    name: "शासनश्री साध्वीश्री रविप्रभाजी",
    type: "Sadhvi",
    thana: 5,
    region: "Delhi NCR",
    location: "श्री भारत भूषण सिंघल, डी-09, रामप्रस्थ, गाजियाबाद",
    contact: "9599060813",
    contactPerson: "कासीद दिनेश",
    date: "2026-07-15"
  },
  
  // --- GUJARAT ---
  {
    id: "6",
    name: "डॉ मुनि श्री मदनकुमारजी स्वामी",
    type: "Muni",
    thana: 3,
    region: "Gujarat",
    location: "बंगला नंबर 19-20 अटलांटा एलाइट बंगलो, केपिटल ग्रीन बिल्डिंग के सामने वेसु, सूरत",
    contact: "6377377427",
    date: "2026-07-17"
  }
];
