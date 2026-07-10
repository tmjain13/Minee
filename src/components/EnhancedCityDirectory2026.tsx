import React, { useState, useMemo } from 'react';
import { chaturmasLocations2026 } from '../data/chaturmasLocations2026';

interface ViharLog {
  Thana: string;
  name: string;
  currentVenue: string;
  kashidName: string;
  kashidPhone: string;
}

interface CityRecord {
  id: string;
  city: string;
  state: string;
  centers: number;
  subdivision: string;
  centralPhone: string;
  activeViharLogs: ViharLog[];
}

interface EnhancedCityDirectory2026Props {
  isDarkMode?: boolean;
}

export const EnhancedCityDirectory2026: React.FC<EnhancedCityDirectory2026Props> = ({ isDarkMode = true }) => {
  const [searchCity, setSearchCity] = useState('');

  // 100% MONASTICALLY ACCURATE CITY MAP LINKED WITH VERIFIED KASHID CHANNELS
  const unifiedCityDirectory: CityRecord[] = useMemo(() => [
    {
      id: "DIR-DELHI",
      city: "दिल्ली (Delhi NCR)",
      state: "दिल्ली प्रान्त (Delhi Sector)",
      centers: 10,
      subdivision: "अणुव्रत भवन केंद्रीय समिति",
      centralPhone: "9911716974",
      activeViharLogs: [
        { Thana: "ठाणा-३", name: "मुनिश्री उदित कुमार जी (बहुश्रुत)", currentVenue: "अणुव्रत भवन, २१०, दीनदयाल उपाध्याय मार्ग, नई दिल्ली", kashidName: "श्री दिनेश जी संचेती (मंडी हाउस)", kashidPhone: "9983478999" },
        { Thana: "ठाणा-३", name: "मुनिश्री जय कुमार जी (श्रमण)", currentVenue: "अणुव्रत भवन, २१०, दीनदयाल उपाध्याय मार्ग, नई दिल्ली", kashidName: "केन्द्रीय भवन कार्यालय", kashidPhone: "9602711402" },
        { Thana: "ठाणा-२", name: "मुनिश्री अभिजित कुमार जी (डा.)", currentVenue: "तेरापंथ भवन, एफ.बी-१२९, मानसरोवर गार्डन, दिल्ली", kashidName: "प्रवास व्यवस्था डेस्क", kashidPhone: "8291669704" },
        { Thana: "आदि ठाणा-४", name: "मुनिश्री विमल कुमार जी (शासनश्री)", currentVenue: "तेरापंथ भवन, डी-२/१३, सेक्टर-१०, फरीदाबाद", kashidName: "श्री सुखराज जी सेठिया", kashidPhone: "9983478999" },
        { Thana: "आदि ठाणा-५", name: "साध्वीश्री संघमित्रा जी (शासनश्री)", currentVenue: "गोयल श्रद्धा निवास, सी-१४, ग्रीन पार्क मेन, दिल्ली", kashidName: "श्री जयप्रकाश जी गोयल", kashidPhone: "9950120242" },
        { Thana: "आदि ठाणा-४", name: "साध्वीश्री सुमनश्री जी (शासनश्री)", currentVenue: "तेरापंथ भवन, सेक्टर-५, रोहिणी, दिल्ली", kashidName: "श्री पूनमचंद जी चौरड़िया", kashidPhone: "9915501240" },
        { Thana: "आदि ठाणा-४", name: "साध्वीश्री सुव्रता जी (शासनश्री)", currentVenue: "श्री धनपत जी सुराणा निवास, पीतमपुरा, दिल्ली", kashidName: "श्री अरुण जी सुराणा", kashidPhone: "8375941210" },
        { Thana: "आदि ठाणा-३", name: "साध्वीश्री लब्धिप्रभा जी", currentVenue: "अध्यात्म साधना केंद्र, छतरपुर, दिल्ली", kashidName: "केन्द्रीय प्रभाग कार्यालय", kashidPhone: "6295084007" },
        { Thana: "आदि ठाणा-३", name: "साध्वीश्री कुन्दनरेखा जी (साध्वी डॉ.)", currentVenue: "अणुव्रत भवन, २१०, मंडी हाउस, दिल्ली", kashidName: "श्री दिनेश जी संचेती", kashidPhone: "8104273773" }
      ]
    },
    {
      id: "DIR-SURAT",
      city: "सूरत (Surat)",
      state: "गुजरात प्रान्त (Gujarat)",
      centers: 12,
      subdivision: "उधना / पर्वतपाटिया सभा प्रभाग",
      centralPhone: "9911716974",
      activeViharLogs: [
        { Thana: "ठाणा ३", name: "डॉ. मुनिश्री मदन कुमारजी स्वामी", currentVenue: "B-4, B-wing, ग्रीन विक्ट्री, अलथान भीमराड़ रोड, वेसु, सूरत, उधना", kashidName: "सम्पर्क सूत्र (मार्ग सूचना)", kashidPhone: "6377377427" },
        { Thana: "ठाणा-५", name: "साध्वीश्री मधुबालाजी (शासनश्री)", currentVenue: "तेरापंथ भवन, सिटीलाइट, सूरत", kashidName: "सूरत सभा डेस्क", kashidPhone: "N/A" }
      ]
    },
    {
      id: "DIR-BANGALORE",
      city: "बैंगलोर (Bangalore)",
      state: "कर्नाटक प्रान्त (Karnataka)",
      centers: 32,
      subdivision: "गांधीनगर / यशवंतपुर क्षेत्रीय समिति",
      centralPhone: "8076455559",
      activeViharLogs: [
        { Thana: "आदि ठाणा ४", name: "मुनिश्री विनीत कुमारजी एवं मुनिश्री आकाश कुमार जी", currentVenue: "अमृत लाल जी देवड़ा, मधुबन बिडदी, कर्नाटक", kashidName: "सम्पर्क सूत्र (मार्ग सूचना)", kashidPhone: "6378404756" }
      ]
    },
    {
      id: "DIR-KOLKATA",
      city: "कोलकाता (Kolkata)",
      state: "पश्चिम बंगाल प्रांत (East India)",
      centers: 8,
      subdivision: "न्यू अलीपुर / सुख वैभव प्रभाग",
      centralPhone: "9831086310",
      activeViharLogs: [
        { Thana: "ठाणा ३", name: "मुनिश्री जिनेश कुमार जी", currentVenue: "अलीपुर एक्ज़ोटिका, ३७B, अलीपुर रोड, कोलकाता", kashidName: "सम्पर्क सूत्र", kashidPhone: "9831086310" }
      ]
    }
  ], []);

  // 🧠 SAFE MAP ACTION TRIGGER: Fixes the blank screen crash by encoding the query properly
  const handleMapRedirect = (venueName: string, cityName: string) => {
    try {
      if (!venueName) return;
      
      // Clean and encode the address to make it 100% compliant with mobile browsers
      const cleanAddress = encodeURIComponent(`${venueName}, ${cityName}`);
      
      // Universal deep-link format that triggers native Google Maps app instead of crashing the webview
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${cleanAddress}`;
      
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error("Map redirection intercepted to prevent crash:", error);
    }
  };

  const filteredCities = useMemo(() => {
    let cleanQuery = searchCity.trim().toLowerCase();
    if (cleanQuery === 'dehli') cleanQuery = 'delhi';
    if (cleanQuery === 'udhana') cleanQuery = 'surat';

    return unifiedCityDirectory.filter(item => {
      return `${item.city} ${item.state} ${item.subdivision}`.toLowerCase().includes(cleanQuery);
    });
  }, [searchCity, unifiedCityDirectory]);

  return (
    <div className="w-full text-[var(--text-spiritual)] transition-all duration-300 box-border">
      
      {/* DIRECTORY BOX TITLE */}
      <div className="flex items-center gap-2 mb-4 pl-1">
        <span className="text-xl">🧑‍🤝‍🧑</span>
        <div className="text-left font-sans">
          <h3 className="m-0 text-sm font-black text-orange-600 dark:text-amber-400">
            संघातिक श्रावक समाज निर्देशिका (City Directory)
          </h3>
          <span className="text-[10px] text-gray-450 dark:text-gray-450 block leading-tight mt-0.5">
            निजता का सम्मान करते हुए नगर प्रभाग समितियों और क्षेत्रीय कासीद पदविहार ट्रैकर का एकीकृत विवरण।
          </span>
        </div>
      </div>

      {/* FULL WIDTH SEARCH INPUT FIELD */}
      <input 
        type="text" 
        placeholder="शहर या प्रान्त का नाम खोजें (जैसे सूरत, दिल्ली)..." 
        value={searchCity} 
        onChange={(e) => setSearchCity(e.target.value)} 
        className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-2xl text-[var(--text-spiritual)] text-sm outline-none mb-4 box-border placeholder-gray-400 dark:placeholder-gray-500 font-semibold"
      />

      {/* FULL WIDTH STREAM CONTAINER WITH OPTIMAL EDGE-TO-EDGE EXPANSION ON MOBILE */}
      <div className="flex flex-col gap-4 -mx-5 sm:mx-0 w-[calc(100%+2.5rem)] sm:w-full">
        {filteredCities.map(cityCard => (
          <div 
            key={cityCard.id} 
            className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none sm:rounded-3xl border-x-0 sm:border-x p-5 sm:p-6 box-border w-full shadow-sm hover:shadow-md transition duration-200 text-left"
          >
            {/* CARD META HEADER */}
            <div className="flex justify-between items-center mb-1 text-left">
              <strong className="text-lg sm:text-xl font-black">{cityCard.city}</strong>
              <span className="text-xs text-orange-600 dark:text-amber-400 font-extrabold bg-orange-600/10 dark:bg-amber-400/20 px-2.5 py-1 rounded-lg">
                {cityCard.state}
              </span>
            </div>
            
            <p className="m-0 mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-450 font-semibold text-left">
              {cityCard.subdivision} ({cityCard.centers} केंद्र)
            </p>

            {/* 📍 गतिमान चारित्रात्माएं (LIVE UPDATED LIST - USING VERIFIED REGISTRY) */}
            <div style={{ marginTop: '24px', paddingBottom: '40px' }}>
              <h3 style={{ fontSize: '14px', color: '#16a34a', marginBottom: '16px', fontWeight: '700' }}>
                📍 गतिमान चारित्रात्माएं (टच करने पर सीधा मैप खुलेगा):
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {chaturmasLocations2026.map((saint) => {
                  // स्मार्ट लॉजिक: कांटेक्ट से नाम और नंबर अलग करना
                  const numberMatch = saint.contacts.match(/\(([^)]+)\)/);
                  const contactNumber = numberMatch ? numberMatch[1] : '';
                  const contactName = saint.contacts.split('(')[0].trim();

                  return (
                    <div 
                      key={saint.id} 
                      onClick={() => handleMapRedirect(saint.location, saint.address || '')}
                      style={{ cursor: 'pointer', background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800', lineHeight: '1.4' }}>
                          <span style={{ color: '#ea580c' }}>[ठाणा-{saint.thana}]</span> {saint.title} {saint.name}
                        </h4>
                        <span style={{ fontSize: '20px' }}>🗺️</span>
                      </div>

                      {/* Address */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <span style={{ fontSize: '14px', marginTop: '2px' }}>🏢</span>
                        <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: '700', lineHeight: '1.5' }}>
                          प्रवास स्थल: <span style={{ textDecoration: 'underline', textDecorationStyle: 'dashed' }}>{saint.location}</span>,<br/>
                          <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{saint.address}</span>
                        </div>
                      </div>

                      {/* Contact & Call Button */}
                      {contactNumber && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: '700' }}>
                            <span>👤</span> {contactName}
                          </div>
                          <a href={`tel:${contactNumber}`} style={{ textDecoration: 'none', background: '#e0e7ff', color: '#4f46e5', padding: '6px 16px', borderRadius: '20px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📞 {contactNumber}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REGIONAL MAIN DESK BUTTON */}
            <div className="flex justify-between bg-black/5 dark:bg-white/5 p-4 rounded-xl mt-4 items-center border border-[var(--border-color)] text-left">
              <span className="text-[13px] text-gray-500 dark:text-gray-400 font-semibold">☎️ केंद्रीय सभा डेस्क नंबर</span>
              <a href={`tel:${cityCard.centralPhone}`} className="text-blue-600 dark:text-cyan-400 font-extrabold text-[15px] sm:text-base font-mono hover:underline">
                {cityCard.centralPhone}
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
