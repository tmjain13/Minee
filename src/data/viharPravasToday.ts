export interface ViharPravas {
  id: string;
  region: string;
  name: string;
  thana: number;
  address: string;
  contactNumber?: string;
}

export const acharyaMahashramanLocation = {
  name: "आचार्य श्री महाश्रमणजी",
  location: "जैन विश्व भारती, लाडनूं, राजस्थान",
  contactNumber: "7044448888"
};

export const panIndiaViharData2026: ViharPravas[] = [
  // --- RAJASTHAN ---
  { id: "RJ_01", region: "Rajasthan", name: "मुनिश्री मुनिव्रत जी", thana: 3, address: "महाप्रज्ञ भवन, सिरियारी" },
  { id: "RJ_02", region: "Rajasthan", name: "शासनश्री मुनिश्री सुरेशकुमारजी", thana: 3, address: "जडिया कॉम्प्लेक्स, जल चक्की, कांकरोली" },
  { id: "RJ_03", region: "Rajasthan", name: "मुनिश्री तत्वरुचि जी 'तरुण'", thana: 2, address: "डॉ अनिल जी भंडारी, 273, श्री गोपाल नगर, 80 फीट रोड महेश नगर, जयपुर", contactNumber: "9660692852" },
  { id: "RJ_04", region: "Rajasthan", name: "मुनिश्री सुधाकर जी", thana: 2, address: "श्रीमान बाबूलाल जी बोथरा, बी-101, फर्स्ट फ्लोर, ट्रेज़र बिल्डिंड, सैक्टर 5, विद्याधर नगर, जयपुर", contactNumber: "8870651529" },
  { id: "RJ_05", region: "Rajasthan", name: "मुनिश्री अमृत कुमार जी", thana: 4, address: "बोथरा भवन, गंगाशहर" },
  { id: "RJ_06", region: "Rajasthan", name: "शासनश्री साध्वीश्री जसवती जी", thana: 3, address: "तेरापंथ भवन, आसींद", contactNumber: "9251316471" },
  { id: "RJ_07", region: "Rajasthan", name: "शासनश्री साध्वीश्री धनश्री जी", thana: 4, address: "तेरापंथ भवन, गुलाब बाड़ी (कोटा)", contactNumber: "9649509233" },
  { id: "RJ_08", region: "Rajasthan", name: "शासनश्री मंजु प्रभा जी", thana: 3, address: "दुग्गड़ भवन, बीकानेर" },
  { id: "RJ_09", region: "Rajasthan", name: "शासनश्री साध्वीश्री सत्यप्रभाजी", thana: 3, address: "तेरापंथ भवन, आचार्य श्री महाश्रमण मार्ग, अग्रवाल कॉलोनी, बालोतरा" },
  { id: "RJ_10", region: "Rajasthan", name: "डॉ साध्वीश्री मंगलप्रज्ञा जी", thana: 5, address: "न्यू तेरापंथ भवन, बालोतरा" },

  // --- GUJARAT ---
  { id: "GJ_01", region: "Gujarat", name: "मुनिश्री मुनिसुव्रत कुमार जी स्वामी", thana: 3, address: "अर्हम कुंज, तेरापंथ भवन के पास, शाहीबाग, अहमदाबाद", contactNumber: "7021591184" },
  { id: "GJ_02", region: "Gujarat", name: "मुनिश्री संजयकुमार जी", thana: 4, address: "एस सी जी हारपीटल के पास, मीठाखली गली, पटेल भवन, छः रारता, नवरंगपुरा, अहमदाबाद", contactNumber: "9819063015" },
  { id: "GJ_03", region: "Gujarat", name: "शासनश्री साध्वीश्री रामकुमारीजी", thana: 4, address: "तेरापंथ भवन, कांकरिया, मणिनगर, अहमदाबाद", contactNumber: "9408472957" },
  { id: "GJ_04", region: "Gujarat", name: "साध्वीश्री अणिमा श्री जी", thana: 5, address: "तेरापंथ भवन, अहमदाबाद उत्तर (मोटेरा), अणुव्रत एबोट, नरेंद्र मोदी स्टेडियम के पास, मोटेरा, अहमदाबाद" },
  { id: "GJ_05", region: "Gujarat", name: "साध्वीश्री प्रेमलता जी", thana: 4, address: "भिक्षु नीलयम, जूली बंगलो, शाहीबाग, अहमदाबाद" },
  { id: "GJ_06", region: "Gujarat", name: "शासनश्री साध्वीश्री मधुबाला जी", thana: 5, address: "तेरापंथ भवन, citylight सूरत", contactNumber: "8128559659" },
  { id: "GJ_07", region: "Gujarat", name: "डॉ साध्वीश्री परमयशा जी", thana: 5, address: "आशीर्वाद पैलेस, भट्टार रोड, सूरत" },

  // --- MAHARASHTRA ---
  { id: "MH_01", region: "Maharashtra", name: "मुनिश्री कुलदीप कुमारजी स्वामी", thana: 2, address: "तेरापंथ भवन, हेमलीला अपार्टमेंट महात्मा फुले रोड, चिंतामणि गार्डन के पास, मुलुंड (पूर्व), मुंबई", contactNumber: "9919601313" },
  { id: "MH_02", region: "Maharashtra", name: "शासनश्री साध्वीश्री विद्यावती जी 'द्वितीय'", thana: 5, address: "तेरापंथ भवन, ठाकुर काॅम्प्लेक्स, कांदिवली (पूर्व) मुंबई", contactNumber: "8850280148" },
  { id: "MH_03", region: "Maharashtra", name: "शासनश्री साध्वीश्री कंचन प्रभाजी", thana: 5, address: "तेरापंथ भवन, सन टॉवर, भोईवाड़ा परेल, मुंबई", contactNumber: "7061598749" },
  { id: "MH_04", region: "Maharashtra", name: "साध्वीश्री राकेश कुमारीजी", thana: 4, address: "कल्याण मित्र, गोयल निवास, 201 आयरन बिल्डिंग, कॉसमॉस बैंक के सामने, हनुमान रोड, विलेपार्ले (पूर्व), मुंबई", contactNumber: "7972375908" },
  { id: "MH_05", region: "Maharashtra", name: "साध्वीश्री निर्वाणश्री जी", thana: 6, address: "तेरापंथ सभा भवन, 2रा माला, मनु मार्केट, घाटकोपर (पश्चिम), मुंबई", contactNumber: "7891817906" },

  // --- KARNATAKA ---
  { id: "KA_01", region: "Karnataka", name: "मुनिश्री अनंत कुमार जी", thana: 2, address: "वासु पूज्य नूतन भवन, केशवापुर, हुबली", contactNumber: "8755109325" },
  { id: "KA_02", region: "Karnataka", name: "मुनिश्री विनीत कुमार जी", thana: 2, address: "स्वरूप जी चोपड़ा के निवास स्थान, 234/5-4, तीसरा क्रॉस, दूसरा मेन, SVCK स्कूल के पास, त्यागराज नगर, बेंगलुरु", contactNumber: "9448301565" },
  { id: "KA_03", region: "Karnataka", name: "मुनिश्री आकाश कुमार जी", thana: 2, address: "नवीनजी सतीशजी धारीवाल, #610, णमोकार 13वां क्रॉस, 3 मेन रोड, शास्त्री नगर, केआर रोड, बेंगलुरु", contactNumber: "9535377536" },
  { id: "KA_04", region: "Karnataka", name: "साध्वीश्री पावनप्रभा जी", thana: 4, address: "श्री सुभाष चंद जी वेदमुथा के निवास स्थान, #6, वृद्धी निवास, 6th क्रॉस, मारखम रोड, अशोक नगर, बेंगलुरु", contactNumber: "9886019121" },

  // --- TAMIL NADU ---
  { id: "TN_01", region: "Tamil Nadu", name: "डॉ मुनिश्री पुलकित कुमार जी", thana: 2, address: "श्री मदनलालजी नवलखा, नवलखा निवास, 72 कामराज रोड, चेन्नई", contactNumber: "9104006286" },
  { id: "TN_02", region: "Tamil Nadu", name: "साध्वीश्री उदितयशा जी", thana: 4, address: "श्री रतनलाल जी डोसी के निवास स्थान, किलपॉक, चेन्नई", contactNumber: "9898502684" },
  { id: "TN_03", region: "Tamil Nadu", name: "साध्वीश्री सोमयशा जी", thana: 3, address: "श्री नरेंद्रकुमार जी नखत, NKCM Spining pvt ltd, पढईविडू, सन्यासीपट्टी, सेलम", contactNumber: "9602007283" },
  { id: "TN_04", region: "Tamil Nadu", name: "साध्वीश्री सिद्धप्रभा जी", thana: 4, address: "श्री विकास जी सेठिया के निवास, मंगलम रोड, तिरुपुर", contactNumber: "9363036377" },

  // --- TELANGANA ---
  { id: "TS_01", region: "Telangana", name: "मुनिश्री दीप कुमार जी", thana: 2, address: "श्री पंकज जी हेमा जी मालू के निवास स्थान, फ्लैट नंबर 725, ब्लॉक 3, मानसरोवर हाइट्स, फेस 3, हैदराबाद", contactNumber: "8505098254" },

  // --- ODISHA ---
  { id: "OR_01", region: "Odisha", name: "मुनिश्री हिमांशु कुमार जी", thana: 2, address: "टिटिलागड", contactNumber: "9928663589" },

  // --- WEST BENGAL ---
  { id: "WB_01", region: "West Bengal", name: "डॉ मुनिश्री ज्ञानेन्द्र कुमार जी (ठाणा 2), मुनिश्री रमेश कुमार जी (ठाणा 1)", thana: 3, address: "मारवाड़ी भवन, बेलडांगा", contactNumber: "9445696470" },

  // --- ASSAM ---
  { id: "AS_01", region: "Assam", name: "मुनिश्री आनंदकुमार जी 'कालू'", thana: 2, address: "निर्मल जी ललिता जी सामसुखा के निवास, श्री आरोहण, हाउस न. 3, रघुनाथ चौधरी पथ, लाचित नगर, गुवाहाटी", contactNumber: "9601420513" },

  // --- BIHAR ---
  { id: "BR_01", region: "Bihar", name: "मुनिश्री प्रशांतकुमार जी", thana: 2, address: "तेरापंथ भवन, गुलाबबाग", contactNumber: "6000696420" },

  // --- DELHI ---
  { id: "DL_01", region: "Delhi", name: "बहुश्रुत मुनिश्री उदित कुमार जी", thana: 3, address: "तेरापंथ भवन, ए-875, शास्त्री नगर, दिल्ली", contactNumber: "9983478999" },
  { id: "DL_02", region: "Delhi", name: "शासनश्री साध्वीश्री संघमित्राजी", thana: 5, address: "एक्शन बालाजी हॉस्पिटल, पश्चिम विहार, दिल्ली", contactNumber: "9950120242" },
  { id: "DL_03", region: "Delhi", name: "शासनश्री साध्वीश्री सुव्रताजी", thana: 4, address: "अणुव्रत भवन, 210, दीनदयाल उपाध्याय मार्ग, नई दिल्ली", contactNumber: "8375941210" },
  { id: "DL_04", region: "Delhi", name: "शासनश्री साध्वीश्री सुमनश्री जी", thana: 4, address: "तेरापंथ भवन, सेक्टर-05, रोहिणी, दिल्ली", contactNumber: "9915501240" },
  { id: "DL_05", region: "Delhi", name: "शासनश्री साध्वीश्री रविप्रभाजी", thana: 5, address: "ओसवाल भवन, बी-69, विवेक विहार-2, दिल्ली", contactNumber: "8104273773" },

  // --- HARYANA ---
  { id: "HR_01", region: "Haryana", name: "साध्वीश्री राजकुमारी जी", thana: 3, address: "तुलसी सेवा केंद्र, मॉडल टाउन, हिसार" },
  { id: "HR_02", region: "Haryana", name: "शासनश्री साध्वीश्री यशोधरा जी", thana: 6, address: "तेरापंथ भवन, मॉडल टाउन, हिसार" },
  { id: "HR_03", region: "Haryana", name: "शासनश्री साध्वीश्री प्रशमरतीजी", thana: 4, address: "तुलसी सेवा केंद्र, मॉडल टाउन, हिसार" },
  { id: "HR_04", region: "Haryana", name: "शासनश्री साध्वीश्री भाग्यवतीजी", thana: 4, address: "तेरापंथ भवन, हांसी" },
  { id: "HR_05", region: "Haryana", name: "साध्वीश्री संयमप्रभा जी", thana: 4, address: "तेरापंथ भवन, सिरसा" }
];
