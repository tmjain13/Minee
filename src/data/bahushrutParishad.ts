export interface BahushrutParishadMember {
  rank: number;
  name: string;
  title: string;
}

export interface ChaturmasLedgerEntry {
  samvat: string;
  place: string;
  role?: string;
  association?: string;
}

export interface MonkProfileUditKumar {
  diksha_year_samvat: string;
  diksha_year_gregorian: string;
  diksha_location: string;
  diksha_pre_name: string;
  diksha_order_seniority: string;
  diksha_pradaata: string;
  supreme_command_acharya: string;
  core_chaturmas_ledger: ChaturmasLedgerEntry[];
}

export interface BahushrutParishadData {
  bahushrut_parishad_metadata: {
    total_members: number;
    executive_structure: string;
    official_roster: BahushrutParishadMember[];
  };
  monk_profile_udit_kumar: MonkProfileUditKumar;
}

export const BAHUSHRUT_PARISHAD_DATABASE: BahushrutParishadData = {
  "bahushrut_parishad_metadata": {
    "total_members": 7,
    "executive_structure": "तेरापंथ धर्मसंघ की सर्वोच्च विद्वत परिषद (7 in 1 Elite Matrix)",
    "official_roster": [
      { "rank": 1, "name": "मुनि श्री उदित कुमार जी", "title": "अग्रगण्य / अग्रणी (Group Leader) & केंद्रीय मुख्य प्रभारी - ज्ञानशाला" },
      { "rank": 2, "name": "मुनि श्री दिनेश कुमार जी", "title": "डॉक्टर ऑफ़ फिलॉसफी / वरिष्ठ विद्वान" },
      { "rank": 3, "name": "मुनि श्री महावीर कुमार जी", "title": "वरिष्ठ आगम विशेषज्ञ" },
      { "rank": 4, "name": "साध्वी प्रमुखा विश्रुतविभा जी", "title": "मुख्य नियोजिका एवं साध्वी श्रेणी प्रमुख" },
      { "rank": 5, "name": "साध्वी वर्या संबुद्धयशा जी", "title": "वरिष्ठ साध्वी नेतृत्व" },
      { "rank": 6, "name": "साध्वी राजिमती जी", "title": "विद्वान साध्वी वृन्द" },
      { "rank": 7, "name": "साध्वी कनकश्री जी", "title": "विद्वान साध्वी वृन्द" }
    ]
  },
  "monk_profile_udit_kumar": {
    "diksha_year_samvat": "2031",
    "diksha_year_gregorian": "1974",
    "diksha_location": "सरदारशहर",
    "diksha_pre_name": "मुनि हेमंतकुमार जी",
    "diksha_order_seniority": "पूज्य आचार्य श्री महाश्रमण जी (मुनि मुदित कुमार) के साथ सह-दीक्षित, दीक्षा पर्याय क्रम में ज्येष्ठ (बड़े) हैं।",
    "diksha_pradaata": "मंत्री मुनि श्री सुमेरमल जी स्वामी (लाडनूं)",
    "supreme_command_acharya": "९वें आचार्य श्री तुलसी",
    "core_chaturmas_ledger": [
      { "samvat": "2031", "place": "सरदारशहर", "role": "सह-दीक्षित मुनि (हेमंतकुमार)" },
      { "samvat": "2035", "place": "मुंबई - मरीन ड्राइव", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2036", "place": "बैंगलोर - गांधीनगर", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2037", "place": "मद्रास - साहुकारपेट", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2038", "place": "मद्रास - ट्रिप्लिकेन", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2039", "place": "बैंगलोर - गांधीनगर", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2040", "place": "सरदारशहर", "association": "सहगामी (मुनि मुदितकुमार जी - वर्तमान आचार्यश्री महाश्रमण जी के साथ)" },
      { "samvat": "2047", "place": "कलकत्ता - महासभा भवन", "association": "मुनिश्री विजयकुमार जी सहगामी" },
      { "samvat": "2048", "place": "कलकत्ता - मित्र परिषद भवन", "association": "मुनिश्री विजयकुमार जी सहगामी" },
      { "samvat": "2049", "place": "कलकत्ता - दक्षिण विवेक विहार", "association": "मुनिश्री विजयकुमार जी सहगामी" },
      { "samvat": "2050", "place": "कलकत्ता - हावड़ा", "association": "मुनिश्री विजयकुमार जी सहगामी" },
      { "samvat": "2051", "place": "कलकत्ता - महासभा भवन", "association": "मुनिश्री विजयकुमार जी सहगामी" },
      { "samvat": "2052", "place": "दिल्ली - अणुव्रत भवन", "association": "मुनिश्री विजयकुमार जी सहगामी" },
      { "samvat": "2053", "place": "अहमदाबाद - शाहीबाग", "association": "मुनिश्री विजयकुमार जी सहगामी" },
      { "samvat": "2054", "place": "अहमदाबाद - शाहीबाग", "association": "मुनिश्री विजयकुमार जी सहगामी" },
      { "samvat": "2055", "place": "सूरत - भटार", "association": "मुनिश्री विजयकुमार जी सहगामी" },
      { "samvat": "2056", "place": "सूरत - उधना", "association": "मंत्रीमुनि सुमेरमल जी सहगामी (मुनि अनंतकुमार जी दीक्षा काल)" },
      { "samvat": "2057", "place": "मुंबई - दादर, मरीन ड्राइव", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2058", "place": "मुंबई - घाटकोपर, मरीन ड्राइव", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2059", "place": "मुंबई - घाटकोपर, सांताक्रुज", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2060", "place": "जलगांव", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2061", "place": "हैदराबाद - डी.वी. कॉलोनी", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2062", "place": "हैदराबाद - डी.वी. कॉलोनी", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2063", "place": "इंदौर - न्यू पलासिया", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2064", "place": "दिल्ली - शाहदरा", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2065", "place": "दिल्ली - पीतमपुरा, अणुव्रत भवन", "association": "अग्रणी अवस्था" },
      { "samvat": "2066", "place": "लुधियाना", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2067", "place": "संगरूर", "association": "मंत्रीमुनि सुमेरमल जी सहगामी" },
      { "samvat": "2072", "place": "दिल्ली - शाहदरा", "association": "मंत्रीमुनि सहगामी (मुनि ज्योतिर्माय जी दीक्षा काल)" },
      { "samvat": "2073", "place": "दिल्ली - पीतमपुरा, रोहिणी", "association": "मुनि ज्योतिर्माय कुमार जी के साथ सहगामी" },
      { "samvat": "2074", "place": "जयपुर - अणुविभा", "association": "स्वतंत्र प्रभार" },
      { "samvat": "2075", "place": "जयपुर - श्यामनगर", "association": "मंत्रीमुनि सुमेरमल जी का अंतिम चातुर्मास" },
      { "samvat": "2077", "place": "जलगांव - अणुव्रत भवन", "association": "अग्रगण्य स्वतंत्र प्रभार" },
      { "samvat": "2078", "place": "भीलवाड़ा - तेरापंथ नगर", "association": "अग्रगण्य स्वतंत्र प्रभार" },
      { "samvat": "2079", "place": "सूरत - सिटी लाइट", "association": "अग्रगण्य स्वतंत्र प्रभार" },
      { "samvat": "2080", "place": "सूरत - उधना", "association": "अग्रगण्य स्वतंत्र प्रभार" },
      { "samvat": "2081", "place": "सूरत - भगवान महावीर कॉलेज", "association": "अग्रगण्य स्वतंत्र प्रभार" },
      { "samvat": "2082", "place": "दिल्ली - ओसवाल भवन", "association": "अग्रगण्य स्वतंत्र प्रभार" },
      { "samvat": "2083", "place": "दिल्ली - पीतमपुरा", "association": "वर्तमान सक्रिय चातुर्मास क्षेत्र (2026)" }
    ]
  }
};
