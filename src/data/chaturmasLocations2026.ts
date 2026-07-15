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
    "munishrivimalkumarji": { title: "शासनश्री", nameHi: "मुनिश्री विमल कुमारजी" },
    "munishriuditkumarji": { title: "बहुश्रुत", nameHi: "मुनिश्री उदित कुमार जी" },
    "munishrijaykumarji": { title: "", nameHi: "मुनिश्री जय कुमार जी" },
    "drmunishriabhijitkumarji": { title: "डा.", nameHi: "मुनिश्री अभिजित कुमार जी" },
    "sadhvishrisanghmitraji": { title: "शासनश्री", nameHi: "साध्वीश्री संघमित्राजी" },
    "sadhvishrisuvrataji": { title: "शासनश्री", nameHi: "साध्वीश्री सुव्रता जी" },
    "sadhvishrisumanshriji": { title: "शासनश्री", nameHi: "साध्वीश्री सुमनश्री जी" },
    "sadhvishriraviprabhaji": { title: "शासनश्री", nameHi: "साध्वीश्री रविप्रभाजी" },
    "sadhvishridrkundanrekhaji": { title: "डा.", nameHi: "साध्वीश्री डा. कुन्दनरेखाजी" },
    "sadhvishrilabdhiprabhaji": { title: "", nameHi: "साध्वीश्री लब्धिप्रभाजी" }
  };

  const normalizedKey = item.name.replace(/\s+/g, '').toLowerCase();
  const mapped = nameMap[normalizedKey] || { title: "", nameHi: item.name };
  const locParts = item.location.split(',');
  const simpleLoc = locParts.length > 2 ? locParts[locParts.length - 2].trim() : locParts[0].trim();

  let contactNum = item.contact || "";
  let contactNm = `कासीद ${item.contact_person || 'प्रभारी'}`;

  if (!contactNum && item.contacts) {
    const contactsEntries = Object.entries(item.contacts);
    if (contactsEntries.length > 0) {
      contactNm = `कासीद ${contactsEntries[0][0].replace(/_/g, ' ')}`;
      contactNum = contactsEntries[0][1];
    }
  }

  return {
    id: `delhi_${idx + 1}`,
    title: mapped.title,
    name: mapped.nameHi,
    thana: item.thana || 3,
    region: "DELHI",
    location: simpleLoc,
    address: item.location,
    contactName: contactNm,
    contactNumber: contactNum
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
