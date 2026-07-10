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

export const delhiNcrLocations2026 = [
  {
    id: "delhi_1",
    title: "शासनश्री",
    name: "मुनिश्री विमल कुमारजी",
    thana: 4,
    region: "DELHI NCR",
    location: "नोएडा",
    address: "श्री राजकरण बोथरा, सी-99, सैक्टर-23, नोएडा, उत्तर प्रदेश-201301",
    contactName: "कासीद राजेश",
    contactNumber: "7827509290"
  },
  {
    id: "delhi_2",
    title: "बहुश्रुत",
    name: "मुनिश्री उदित कुमार जी",
    thana: 3,
    region: "DELHI",
    location: "घंटाघर",
    address: "श्री राजेश कठोतिया, कठोतिया भवन- 1532, चन्द्रावल रोड़, घंटाघर, दिल्ली-110007",
    contactName: "कासीद लक्ष्मण",
    contactNumber: "9983478999"
  },
  {
    id: "delhi_3",
    title: "",
    name: "मुनिश्री जय कुमार जी",
    thana: 3,
    region: "DELHI",
    location: "सिद्धार्थ एन्क्लेव",
    address: "श्री कमल सेठिया, 15, सिद्धार्थ एन्क्लेव, दिल्ली-110014",
    contactName: "कासीद अनिल",
    contactNumber: "8340297415"
  },
  {
    id: "delhi_4",
    title: "डा.",
    name: "मुनिश्री अभिजित कुमार जी",
    thana: 2,
    region: "DELHI",
    location: "आर. के. पुरम",
    address: "श्री कैलाश गोयल, 41, आराधना एन्क्लेव, आर. के. पुरम, सैक्टर-13, दिल्ली-110066",
    contactName: "कासीद विनय",
    contactNumber: "9721168623"
  },
  {
    id: "delhi_5",
    title: "शासनश्री",
    name: "साध्वीश्री संघमित्राजी",
    thana: 5,
    region: "DELHI",
    location: "पश्चिम विहार",
    address: "एक्शन बालाजी हॉस्पिटल, पश्चिम विहार, दिल्ली-110063 (स्वास्थ्य लाभ हेतु)",
    contactName: "कासीद लालराम",
    contactNumber: "9950120242"
  },
  {
    id: "delhi_6",
    title: "शासनश्री",
    name: "साध्वीश्री सुव्रता जी",
    thana: 4,
    region: "DELHI",
    location: "नई दिल्ली",
    address: "अणुव्रत भवन, 210, दीनदयाल उपाध्याय मार्ग, नई दिल्ली-110002",
    contactName: "कासीद अरूण",
    contactNumber: "8375941210"
  },
  {
    id: "delhi_7",
    title: "शासनश्री",
    name: "साध्वीश्री सुमनश्री जी",
    thana: 4,
    region: "DELHI",
    location: "रोहिणी",
    address: "तेरापंथ भवन, सैक्टर-05, रोहिणी, दिल्ली-110085",
    contactName: "कासीद पूरन",
    contactNumber: "9915501240"
  },
  {
    id: "delhi_8",
    title: "शासनश्री",
    name: "साध्वीश्री रविप्रभाजी",
    thana: 5,
    region: "DELHI",
    location: "विवेक विहार-2",
    address: "ओसवाल भवन, बी-69, विवेक विहार-2, दिल्ली-110095",
    contactName: "कासीद जयदेव",
    contactNumber: "8104273773"
  },
  {
    id: "delhi_9",
    title: "डा.",
    name: "साध्वीश्री कुन्दनरेखाजी",
    thana: 3,
    region: "DELHI",
    location: "मॉडल टाउन-2",
    address: "श्री अमरदीप जैन, बी-2/7, मॉडल टाउन-2, नई दिल्ली-110009",
    contactName: "कासीद दिनेश",
    contactNumber: "9599060813"
  },
  {
    id: "delhi_10",
    title: "",
    name: "साध्वीश्री लब्धिप्रभाजी",
    thana: 3,
    region: "DELHI NCR",
    location: "फरीदाबाद",
    address: "श्री नरेन्द्र गिड़िया, बी-100, अशोका एन्क्लेव-2, सैक्टर-37, फरीदाबाद-121003",
    contactName: "राजू",
    contactNumber: "9310563356"
  }
];

export const chaturmasLocations2026: ChaturmasLocation[] = delhiNcrLocations2026.map((item, index) => {
  const isHealth = item.address.includes("स्वास्थ्य लाभ हेतु") || item.location.includes("हॉस्पिटल");
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
