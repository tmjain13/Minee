// src/data/viharPravasToday.ts

export interface AcharyaVihar {
  name: string;
  location: string;
  map_link: string;
  contact: string;
}

export interface RegionSainthood {
  name: string;
  location: string;
  contact: string | null;
  thana?: number;
  contact_person?: string;
  contacts?: Record<string, string>;
}

export interface OtherRegions {
  Orissa?: string[];
  WestBengal?: string[];
  Assam?: string[];
  Bihar?: string[];
  Haryana?: string[];
  [key: string]: string[] | undefined;
}

export interface RegionsData {
  Rajasthan: RegionSainthood[];
  Gujarat: RegionSainthood[];
  Maharashtra: RegionSainthood[];
  Karnataka: RegionSainthood[];
  TamilNadu: RegionSainthood[];
  Delhi_NCR: RegionSainthood[];
  Other_Regions: OtherRegions;
}

export interface ViharPravasTodayDataset {
  date: string;
  acharya_vihar: AcharyaVihar;
  regions: RegionsData;
  delhi_sabha_general_contact: string[];
  note: string;
}

export const viharPravasTodayData: ViharPravasTodayDataset = {
  "date": "2026-07-15",
  "acharya_vihar": {
    "name": "Acharya Shri Mahashramanji",
    "location": "Jain Vishwa Bharati, Ladnun, Rajasthan",
    "map_link": "https://maps.app.goo.gl/DLhgkEoSfbfPv2uZ9?g_st=aw",
    "contact": "Hemant Baid: 7044448888"
  },
  "regions": {
    "Rajasthan": [
      { "name": "Munishri Munivrat ji", "location": "Mahapragya Bhavan, Siriyari", "contact": null },
      { "name": "Munishri Amritkumar ji", "location": "Bothra Bhavan, Gangashahar", "contact": null },
      { "name": "Munishri Tatvaruchi ji", "location": "Malviya Nagar, Jaipur", "contact": "9588273303" },
      { "name": "Munishri Sudhakar ji", "location": "Mahapragya School, Nirman Nagar, Jaipur", "contact": null },
      { "name": "Sadhvishri Jaswati ji", "location": "Terapanth Bhavan, Asind", "contact": "9251316471" },
      { "name": "Sadhvishri Dhanshri ji", "location": "Terapanth Bhavan, Gulab Bari, Kota", "contact": "9649509233" },
      { "name": "Sadhvishri Manju Prabha ji", "location": "Duggar Bhavan, Bikaner", "contact": null },
      { "name": "Sadhvishri Satyaprabha ji", "location": "Terapanth Bhavan, Agarwal Colony, Balotra", "contact": null }
    ],
    "Gujarat": [
      { "name": "Munishri Munisuvrat Kumar ji", "location": "Arham Kunj, Shahibaug, Ahmedabad", "contact": "7021591184" },
      { "name": "Munishri Sanjaykumar ji", "location": "Patel Bhavan, Navrangpura, Ahmedabad", "contact": "9819063015" },
      { "name": "Dr. Munishri Madan Kumar ji", "location": "Surya Complex, City Light, Surat", "contact": "6377377427" },
      { "name": "Sadhvishri Ramkumari ji", "location": "Terapanth Bhavan, Kankaria, Ahmedabad", "contact": "9408472957" },
      { "name": "Sadhvishri Anima Shri ji", "location": "Terapanth Bhavan, Ahmedabad North (Motera), Ahmedabad", "contact": null },
      { "name": "Sadhvishri Premlata ji", "location": "Bhikshu Nilayam, Shahibaug, Ahmedabad", "contact": null },
      { "name": "Sadhvishri Madhubala ji", "location": "Shubham Height-1, Surat", "contact": "8128559659" },
      { "name": "Dr. Sadhvishri Paramyasha ji", "location": "Ashirwad Palace, Bhattar Road, Surat", "contact": null }
    ],
    "Maharashtra": [
      { "name": "Sadhvishri Vidyawati ji (II)", "location": "Terapanth Bhavan, Kandivali (E), Mumbai", "contact": "8850280148" },
      { "name": "Sadhvishri Rakesh Kumari ji", "location": "Goyal Niwas, Vile Parle (E), Mumbai", "contact": "7972375908" },
      { "name": "Sadhvishri Nirwanshri ji", "location": "Terapanth Sabha Bhavan, Ghatkopar (W), Mumbai", "contact": "7891817906" }
    ],
    "Karnataka": [
      { "name": "Munishri Anant Kumar ji", "location": "Vasu Pujya Nutan Bhavan, Hubli", "contact": "8755109325" },
      { "name": "Munishri Vineet Kumar ji", "location": "New Guddadahalli, Bengaluru", "contact": "9448083803" },
      { "name": "Munishri Akash Kumar ji", "location": "Rajarajeshwari Nagar, Bengaluru", "contact": "9844970100" },
      { "name": "Sadhvishri Pawanprabha ji", "location": "Sheshadripuram, Bengaluru", "contact": null }
    ],
    "TamilNadu": [
      { "name": "Dr. Munishri Pulkit Kumar ji", "location": "Gautam Ji Khivansara, Chennai", "contact": "9104006286" },
      { "name": "Sadhvishri Uditayasha ji", "location": "Kilpauk, Chennai", "contact": "9898502684" },
      { "name": "Sadhvishri Sanyamlata ji", "location": "Veer Kushal Dham 1", "contact": "8624960514" },
      { "name": "Sadhvishri Somayasha ji", "location": "Erode", "contact": "9442600853" }
    ],
    "Delhi_NCR": [
      { 
        "name": "Munishri Vimal Kumar ji", "thana": 4, 
        "location": "30/55A, Gali No.-8, Vishwas Nagar, Shahdara, Delhi-110092", 
        "contact_person": "Rajesh", "contact": "7827509290" 
      },
      { 
        "name": "Munishri Udit Kumar ji", "thana": 3, 
        "location": "B-115, Pushpanjali Enclave, Pitampura, Delhi-110034", 
        "contact_person": "Lakshman", "contact": "9983478999" 
      },
      { 
        "name": "Munishri Jay Kumar ji", "thana": 3, 
        "location": "17/21, Telephone Exchange Road, Samalkha, Delhi-110037", 
        "contact_person": "Anil", "contact": "8340297415" 
      },
      { 
        "name": "Dr. Munishri Abhijit Kumar ji", "thana": 2, 
        "location": "Niwas-164, A/1, 3rd Floor, Rajgarh Colony, Delhi-110031", 
        "contact_person": "Devesh/Vinay", "contact": null,
        "contacts": { "Devesh_Kumar": "8291669704", "Vinay": "9721168623" }
      },
      { 
        "name": "Sadhvishri Sanghmitra ji", "thana": 5, 
        "location": "Goyal Shraddha Niwas, C-14, Green Park Main, Delhi-110016", 
        "contact_person": "Lalram", "contact": "9950120242" 
      },
      { 
        "name": "Sadhvishri Suvrata ji", "thana": 4, 
        "location": "Anuvrat Bhavan, 210, DDU Marg, New Delhi-110002", 
        "contact_person": "Arun", "contact": "8375941210" 
      },
      { 
        "name": "Sadhvishri Sumanshri ji", "thana": 4, 
        "location": "Terapanth Bhavan, Sector-05, Rohini, Delhi-110085", 
        "contact_person": "Puran", "contact": "9915501240" 
      },
      { 
        "name": "Sadhvishri Raviprabha ji", "thana": 5, 
        "location": "D-09, Ramprastha, Ghaziabad UP-201011", 
        "contact_person": "Dinesh", "contact": "9599060813" 
      },
      { 
        "name": "Sadhvishri Dr. Kundanrekha ji", "thana": 3, 
        "location": "Terapanth Bhavan, K-13, Model Town-2, Delhi-110009", 
        "contact_person": "Jaydev", "contact": "8104273773" 
      },
      { 
        "name": "Sadhvishri Labdhiprabha ji", "thana": 3, 
        "location": "Makan-173, Sector-09, Faridabad-121006", 
        "contact_person": "N/A", "contact": "9810035137" 
      }
    ],
    "Other_Regions": {
      "Orissa": ["Munishri Mohajit Kumar ji (Cuttack)", "Munishri Himanshu Kumar ji (Utkela)"],
      "WestBengal": ["Dr. Munishri Gyanendra Kumar ji", "Munishri Ramesh Kumar ji"],
      "Assam": ["Munishri Anandkumar ji 'Kalu' (Guwahati)"],
      "Bihar": ["Munishri Prashantkumar ji (Gulabbagh)"],
      "Haryana": ["Sadhvishri Rajkumari ji (Hisar)", "Sadhvishri Yashodhara ji (Hisar)", "Sadhvishri Prashamrati ji (Hisar)", "Sadhvishri Bhagyawati ji (Hansi)", "Sadhvishri Sanyamprabha ji (Sirsa)"]
    }
  },
  "delhi_sabha_general_contact": ["9868206966", "9911716974"],
  "note": "प्रवास स्थल में अपेक्षानुसार परिवर्तन संभावित है।"
};

export interface ViharPravas {
  id: string;
  region: string;
  name: string;
  thana: number;
  address: string;
  contactNumber?: string;
}

export const acharyaMahashramanLocation = {
  name: viharPravasTodayData.acharya_vihar.name,
  location: viharPravasTodayData.acharya_vihar.location,
  contactNumber: viharPravasTodayData.acharya_vihar.contact.split(':')[1]?.trim() || "7044448888"
};

const mapRegionsToViharPravas = (): ViharPravas[] => {
  const flatList: ViharPravas[] = [];
  let index = 1;

  const standardRegions = ["Rajasthan", "Gujarat", "Maharashtra", "Karnataka", "TamilNadu", "Delhi_NCR"] as const;
  
  standardRegions.forEach(regionName => {
    const list = viharPravasTodayData.regions[regionName];
    list.forEach(saint => {
      let contactNumber = saint.contact || undefined;
      if (!contactNumber && saint.contacts) {
        contactNumber = Object.values(saint.contacts)[0];
      }
      flatList.push({
        id: `${regionName.substring(0, 2).toUpperCase()}_${String(index++).padStart(2, '0')}`,
        region: regionName === "Delhi_NCR" ? "Delhi" : regionName,
        name: saint.name,
        thana: saint.thana || 3,
        address: saint.location,
        contactNumber: contactNumber
      });
    });
  });

  // Map other regions
  const otherRegions = viharPravasTodayData.regions.Other_Regions;
  Object.entries(otherRegions).forEach(([subRegion, saintNames]) => {
    if (Array.isArray(saintNames)) {
      saintNames.forEach(name => {
        flatList.push({
          id: `OTH_${String(index++).padStart(2, '0')}`,
          region: subRegion,
          name: name,
          thana: 2,
          address: `${subRegion} Province`,
          contactNumber: undefined
        });
      });
    }
  });

  return flatList;
};

export const panIndiaViharData2026: ViharPravas[] = mapRegionsToViharPravas();
