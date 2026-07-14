// src/data/chaturmasLocations2026.ts
import { viharPravasTodayData } from './viharPravasToday';

export interface ChaturmasLocation {
  id: number | string;
  title: string;
  name: string;
  thana: number;
  status: string;
  location: string;
  address: string;
  contacts: string;
  region?: string;
  contactName?: string;
  contactNumber?: string;
}

export const delhiNcrLocations2026 = viharPravasTodayData.regions.Delhi_NCR.map((item, idx) => {
  const nameMap: Record<string, { title: string, nameHi: string }> = {
    "Munishri Vimal Kumar ji": { title: "शासनश्री", nameHi: "मुनिश्री विमल कुमारजी" },
    "Munishri Udit Kumar ji": { title: "बहुश्रुत", nameHi: "मुनिश्री उदित कुमार जी" },
    "Munishri Jay Kumar ji": { title: "", nameHi: "मुनिश्री जय कुमार जी" },
    "Dr. Munishri Abhijit Kumar ji": { title: "डा.", nameHi: "मुनिश्री अभिजित कुमार जी" },
    "Sadhvishri Sanghmitra ji": { title: "शासनश्री", nameHi: "साध्वीश्री संघमित्राजी" },
    "Sadhvishri Suvrata ji": { title: "शासनश्री", nameHi: "साध्वीश्री सुव्रता जी" },
    "Sadhvishri Sumanshri ji": { title: "शासनश्री", nameHi: "साध्वीश्री सुमनश्री जी" },
    "Sadhvishri Raviprabha ji": { title: "शासनश्री", nameHi: "साध्वीश्री रविप्रभाजी" },
    "Sadhvishri Dr. Kundanrekhaji": { title: "डा.", nameHi: "साध्वीश्री डा. कुन्दनरेखाजी" },
    "Sadhvishri Labdhiprabhaji": { title: "", nameHi: "साध्वीश्री लब्धिप्रभाजी" }
  };

  const mapped = nameMap[item.name] || { title: "", nameHi: item.name };
  const locParts = item.location.split(',');
  const simpleLoc = locParts.length > 2 ? locParts[locParts.length - 2].trim() : locParts[0].trim();

  return {
    id: `delhi_${idx + 1}`,
    title: mapped.title,
    name: mapped.nameHi,
    thana: item.thana || 3,
    region: "DELHI",
    location: simpleLoc,
    address: item.location,
    contactName: `कासीद ${item.contact_person || 'प्रभारी'}`,
    contactNumber: item.contact || ""
  };
});

export const chaturmasLocations2026: ChaturmasLocation[] = delhiNcrLocations2026.map((item, index) => {
  const isHealth = item.address.includes("स्वास्थ्य लाभ") || item.location.includes("हॉस्पिटल") || item.address.includes("हॉस्पिटल") || item.address.includes("Hospital");
  return {
    id: index + 1,
    title: item.title,
    name: item.name,
    thana: item.thana,
    status: isHealth ? "स्वास्थ्य लाभ हेतु" : "सक्रिय",
    location: item.location,
    address: item.address,
    contacts: item.contactName && item.contactNumber ? `${item.contactName} (${item.contactNumber})` : (item.contactNumber || ""),
    region: item.region,
    contactName: item.contactName,
    contactNumber: item.contactNumber
  };
});
