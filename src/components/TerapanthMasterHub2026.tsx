import React, { useState, useMemo, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';
import { useAuth } from '../context/AuthContext';
import { executeKashidSearch } from '../utils/viharSearchEngine';

interface TerapanthMasterHub2026Props {
  onBack?: () => void;
}

// July 06, 2026 — Master Native Hub Synchronized Database
const MASTER_VIHAR_LOGS = [
  // --- DELHI ---
  { name: "बहुश्रुत मुनिश्री उदित कुमार जी", tag: "ठाना-3", loc: "तेरापंथ भवन, ए-875, शास्त्री नगर, दिल्ली।", contact: "9983478999", state: "DELHI" },
  { name: "आचार्य श्री महाश्रमणजी (धवल सेना सह)", tag: "अधिशास्ता", loc: "महाश्रमण विहार, जैन विश्व भारती, लाडनूं, राजस्थान।", contact: "7044448888", state: "RAJASTHAN" },
  { name: "शासनश्री साध्वीश्री संघमित्राजी", tag: "ठाना-5", loc: "एक्शन बालाजी अस्पताल, पश्चिम विहार, दिल्ली।", contact: "9950120242", state: "DELHI" },
  { name: "शासनश्री साध्वीश्री सुव्रताजी", tag: "ठाना-4", loc: "अणुव्रत भवन, 210, दीनदयाल उपाध्याय मार्ग, नई दिल्ली।", contact: "8375941210", state: "DELHI" },
  { name: "शासनश्री साध्वीश्री सुमनश्री जी", tag: "ठाना-4", loc: "तेरापंथ भवन, सेक्टर-05, रोहिणी, दिल्ली।", contact: "9915501240", state: "DELHI" },
  { name: "शासनश्री साध्वीश्री रविप्रभाजी", tag: "ठाना-5", loc: "ओसवाल भवन, बी-69, विवेक विहार-2, दिल्ली।", contact: "8104273773", state: "DELHI" },

  // --- RAJASTHAN ---
  { name: "मुनिश्री मुनिव्रत जी", tag: "ठाना-3", loc: "महाप्रज्ञ भवन, सिरियारी, राजस्थान।", contact: "ℹ️ ऑन-साइट", state: "RAJASTHAN" },
  { name: "मुनिश्री तत्व रुचि जी 'तरुण'", tag: "ठाना-2", loc: "भिक्षु साधना केंद्र, श्याम नगर, जयपुर।", contact: "9660692852", state: "RAJASTHAN" },
  { name: "मुनिश्री सुधाकर जी", tag: "ठाना-2", loc: "नरेंद्र जी धीरज जी अरविंद बैद निवास, 179, मल्होत्रा नगर, विद्याधर नगर स्टेडियम के पास, जयपुर।", contact: "8870651529", state: "RAJASTHAN" },
  { name: "मुनिश्री अमृत कुमार जी", tag: "ठाना-4", loc: "बोथरा भवन, Ganga शहर, राजस्थान।", contact: "ℹ️ ऑन-साइट", state: "RAJASTHAN" },
  { name: "शासनश्री साध्वीश्री जसवती जी", tag: "ठाना-3", loc: "तेरापंथ भवन, आसींद, राजस्थान।", contact: "9251316471", state: "RAJASTHAN" },
  { name: "शासनश्री साध्वीश्री धनश्री जी", tag: "ठाना-4", loc: "तेरापंथ भवन, गुलाब बाड़ी, कोटा।", contact: "9649509233", state: "RAJASTHAN" },
  { name: "शासनश्री मंजु प्रभा जी", tag: "ठाना-3", loc: "दुग्गड़ भवन, बीकानेर, राजस्थान।", contact: "ℹ️ ऑन-साइट", state: "RAJASTHAN" },

  // --- GUJARAT ---
  { name: "डॉ मुनिश्री मदन कुमारजी स्वामी", tag: "ठाना-3", loc: "क्रिश हाइट्स, संजीव कुमार ऑडिटोरियम के पास, RTO रोड, पाल अडाजण, सूरत।", contact: "6377377427", state: "GUJARAT" },
  { name: "मुनिश्री मुनिसुव्रत कुमार जी स्वामी", tag: "ठाना-3", loc: "अर्हम कुंज, शाहीबाग, अहमदाबाद।", contact: "7021591184", state: "GUJARAT" },
  { name: "मुनिश्री संजयकुमार जी", tag: "ठाना-4", loc: "राहुल हाउस, प्रशांत सोसायटी, नवरंग पुरा, अहमदाबाद।", contact: "7597245913", state: "GUJARAT" },
  { name: "शासनश्री साध्वीश्री रामकुमारीजी", tag: "ठाना-4", loc: "तेरापंथ भवन, कांकरिया, मणिनगर, अहमदाबाद।", contact: "9408472957", state: "GUJARAT" },
  { name: "साध्वीश्री मधुबाला जी (शासनश्री)", tag: "ठाना-5", loc: "तेरापंथ भवन, सिटीलाइट, सूरत, गुजरात।", contact: "8128559659", state: "GUJARAT" },

  // --- KARNATAKA & OTHERS ---
  { name: "मुनिश्री विनीत कुमार जी", tag: "ठाना-2", loc: "नंबर 264, 8वां क्रॉस, शास्त्रीनगर, त्यागराजनगर, बैंगलोर-70।", contact: "ℹ️ मार्ग में", state: "KARNATAKA" },
  { name: "मुनिश्री आकाश कुमार जी", tag: "ठाना-2", loc: "नंबर 264, 8वां क्रॉस, शास्त्रीनगर, त्यागराजनगर, बेंगलुरु - 70।", contact: "8553336928", state: "KARNATAKA" },
  { name: "मुनिश्री दीप कुमार जी", tag: "ठाना-2", loc: "महावीर सिग्नेचर अपार्टमेंट, मानसरोवर हाइट्स, हैदराबाद।", contact: "8505098254", state: "TELANGANA" },
  { name: "साध्वीश्री राजकुमारी जी", tag: "ठाना-3", loc: "तुलसी सेवा केंद्र, मॉडल टाउन, हिसार, हरियाणा।", contact: "ℹ️ ऑन-साइट", state: "HARYANA" }
];

export function TerapanthMasterHub2026({ onBack }: TerapanthMasterHub2026Props) {
  const [searchKey, setSearchKey] = useState('');
  const [selectedTab, setSelectedTab] = useState('VIHAR'); // VIHAR | FAQ | OFFLINE_VOW
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [fastingVow, setFastingVow] = useState('एकासन (Ekasan)');
  
  // ☀️/🌙 LIGHT-DARK MODE SYSTEM INTEGRATION
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { user } = useAuth();

  // NETWORK TRACKER FOR IOS & ANDROID
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  // 🎨 DYNAMIC THEMATIC STYLE MATRIX FOR LIGHT MODE REPAIR
  const theme = {
    bg: isDarkMode 
      ? '#060814' 
      : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)', // Clean Premium Slate-White
    cardBg: isDarkMode 
      ? 'rgba(17, 24, 48, 0.6)' 
      : '#ffffff', // Solid Clean White Card to hide background leakage
    border: isDarkMode 
      ? 'rgba(255, 255, 255, 0.06)' 
      : 'rgba(15, 23, 42, 0.08)',
    textPrimary: isDarkMode ? '#ffffff' : '#0f172a', // Deep slate black for sharp reading
    textSecondary: isDarkMode ? '#c3c9e9' : '#475569',
    textTertiary: isDarkMode ? '#7b88bd' : '#64748b',
    inputBg: isDarkMode ? '#11152b' : '#f1f5f9',
    pillBg: isDarkMode ? '#0f1330' : '#e2e8f0',
  };

  // 100% AUDITED DATA INDEX COMPLIANT WITH ALL PROVIDED COMMUNIQUES
  const masterViharLedger = useMemo(() => {
    return MASTER_VIHAR_LOGS.map((item, index) => ({
      id: index + 1,
      region: item.state,
      zone: item.state,
      thana: item.tag,
      name: item.name,
      venue: item.loc,
      contact: /^\d+$/.test(item.contact.replace(/[\s\-\+\(\)]/g, '')) ? 'सम्पर्क सूत्र' : 'प्रवास स्थिति',
      phone: item.contact
    }));
  }, []);

  const uniqueRegions = useMemo(() => {
    const states = MASTER_VIHAR_LOGS.map(item => item.state);
    const unique = Array.from(new Set(states));
    return ['ALL', ...unique];
  }, []);

  const terapanthFaq = [
    { q: "तेरापंथ धर्मसंघ के वर्तमान अनुशास्ता कौन हैं?", a: "१०वें आचार्य श्री महाप्रज्ञ जी के महाप्रयाण के बाद, वर्तमान में ११वें अधिनायक युगप्रधान आचार्य श्री महाश्रमण जी धर्मसंघ के एकमात्र सर्वोच्च आध्यात्मिक अधिपिता हैं।" },
    { q: "महासभा के अंतर्गत ज्ञानशाला नेटवर्क का क्या रिकॉर्ड है?", a: "केंद्रीय सांख्यिकी के अनुसार, देश के २३ राज्यों में ५71 सक्रिय ज्ञानशाला केंद्र संचालित हैं, जिनमें १८,०९८ से अधिक ज्ञानार्थी बच्चे संस्कार ग्रहण कर रहे हैं।" }
  ];

  // 🧠 INTELLIGENT SEARCH PATTERN MATCHING ENGINE (FIXES "DEHLI" / "DELHI" / CASE-SENSITIVITY BUGS)
  const filteredVihar = useMemo(() => {
    const matchedRecords = executeKashidSearch(searchKey, masterViharLedger);
    return matchedRecords.filter(item => selectedRegion === 'ALL' || item.region === selectedRegion);
  }, [searchKey, selectedRegion, masterViharLedger]);

  const handleVowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("कृपया पचक्खान लॉग दर्ज करने के लिए पहले लॉगिन करें भाईसाहब!");
      return;
    }
    try {
      const fastingRef = collection(db, 'users', user.uid, 'fastingLogs');
      await addDoc(fastingRef, {
        type: fastingVow,
        date: new Date().toISOString().split('T')[0],
        timestamp: serverTimestamp()
      });
      alert(isOnline ? "🟢 तपस्या लॉग फ़ायरबेस पर लाइव सिंक हो गया भाई!" : "🔒 इंटरनेट नहीं है! डेटा लोकल कतार में सुरक्षित हो गया है।");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/fastingLogs`);
      alert("Submission failed.");
    }
  };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', fontFamily: 'sans-serif', color: theme.textPrimary, padding: '16px', boxSizing: 'border-box', transition: 'all 0.3s ease' }}>
      
      {/* Back Button Action Header */}
      {onBack && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            onClick={onBack}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
              border: `1px solid ${theme.border}`,
              color: theme.textPrimary,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            ← पीछे जाएँ / Back to Settings
          </button>
        </div>
      )}

      <div style={{ height: 'env(safe-area-inset-top, 14px)' }}></div>

      {/* CORE CONTROL BANNER LAYER WITH THEME TOGGLES */}
      <div style={{ 
        background: isDarkMode ? 'linear-gradient(135deg, rgba(0, 255, 170, 0.12) 0%, rgba(11, 15, 38, 0.85) 100%)' : '#ffffff', 
        border: `1px solid ${isDarkMode ? 'rgba(0, 255, 170, 0.25)' : 'rgba(0,0,0,0.08)'}`, 
        borderRadius: '24px', 
        padding: '16px', 
        marginBottom: '16px',
        boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: isDarkMode ? '#00ffaa' : '#0b0f26' }}>☸️ Terapanth AI Core Suite</h1>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* THEME TOGGLE SWITCH */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              style={{ 
                background: isDarkMode ? 'rgba(255,255,255,0.08)' : '#0b0f26', 
                border: 'none', 
                padding: '6px 12px', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                color: '#fff', 
                fontSize: '11px', 
                fontWeight: 'bold' 
              }}
            >
              {isDarkMode ? '☀️ लाइट मोड' : '🌙 डार्क मोड'}
            </button>

            <span style={{ fontSize: '10px', background: isOnline ? '#00ffaa' : '#e60023', color: '#060814', padding: '3px 8px', borderRadius: '8px', fontWeight: '800' }}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
        <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: theme.textSecondary, lineHeight: '1.4' }}>
          खोज प्रणाली को अपूर्व अपग्रेड मिल गया है। Dehli (दिल्ली) या Udhana (सूरत) जैसे स्पेलिंग एरर अब स्वतः सुधर जाएँगे।
        </p>
      </div>

      {/* DAILY ANUPREKSHA (DAILY REFLECTION) CARD FIX */}
      <div style={{ 
        background: isDarkMode ? 'rgba(0, 242, 254, 0.05)' : 'rgba(0, 242, 254, 0.08)', 
        border: `1px solid ${isDarkMode ? 'rgba(0, 242, 254, 0.2)' : 'rgba(0, 242, 254, 0.3)'}`, 
        borderRadius: '16px', 
        padding: '12px 14px', 
        marginBottom: '16px' 
      }}>
        <span style={{ fontSize: '10px', color: isDarkMode ? '#00f2fe' : '#0284c7', fontWeight: '800', display: 'block', marginBottom: '4px' }}>
          🔔 दैनिक अनुप्रेक्षा • DAILY REFLECTION
        </span>
        <p style={{ margin: 0, fontSize: '12.5px', color: theme.textPrimary, fontStyle: 'italic', lineHeight: '1.4' }}>
          "जैसे बाज़ार से केवल मीठे आम चुनकर लाते हैं, वैसे ही मस्तिष्क में केवल श्रेष्ठ व सकारात्मक विचारों को प्रवेश दें।" — युगप्रधान आचार्य श्री महाश्रमण जी
        </p>
      </div>

      {/* MODE ROUTER SELECTOR BUTTONS */}
      <div style={{ display: 'flex', background: theme.pillBg, borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '16px', border: `1px solid ${theme.border}` }}>
        {['VIHAR', 'FAQ', 'OFFLINE_VOW'].map(tab => (
          <button key={tab} onClick={() => setSelectedTab(tab)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', background: selectedTab === tab ? (isDarkMode ? '#00ffaa' : '#0b0f26') : 'transparent', color: selectedTab === tab ? (isDarkMode ? '#060814' : '#ffffff') : theme.textTertiary, transition: 'all 0.2s' }}>
            {tab === 'VIHAR' ? '🗺️ पदविहार' : tab === 'FAQ' ? '📖 जिज्ञासा' : '🔒 ऑफलाइन तप'}
          </button>
        ))}
      </div>

      {/* VIEW CANVAS MAIN PORT */}
      {selectedTab === 'VIHAR' && (
        <div>
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', marginBottom: '12px', paddingBottom: '4px' }}>
            {uniqueRegions.map(r => (
              <button key={r} onClick={() => setSelectedRegion(r)} style={{ background: selectedRegion === r ? (isDarkMode ? 'rgba(0,255,170,0.15)' : '#0b0f26') : theme.inputBg, color: selectedRegion === r ? (isDarkMode ? '#00ffaa' : '#ffffff') : theme.textTertiary, border: `1px solid ${theme.border}`, padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', cursor: 'pointer' }}>{r}</button>
            ))}
          </div>

          {/* UPGRADED INTELLIGENT INPUT FIELD SEARCH */}
          <input 
            type="text" 
            placeholder="शहर, क्षेत्र या संत खोजें (जैसे: dehli, surat, उदित कुमार, फरीदाबाद)..." 
            value={searchKey} 
            onChange={(e) => setSearchKey(e.target.value)} 
            style={{ width: '100%', padding: '12px 16px', background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '14px', color: theme.textPrimary, fontSize: '12.5px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box', boxShadow: isDarkMode ? 'none' : 'inset 0 1px 3px rgba(0,0,0,0.05)' }} 
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredVihar.map(item => (
              <div key={item.id} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '18px', padding: '14px', boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '6px', marginBottom: '8px' }}>
                  <div><span style={{ fontSize: '10px', color: isDarkMode ? '#00ffaa' : '#b45309', fontWeight: '700', marginRight: '6px' }}>{item.thana}</span><strong style={{ fontSize: '13.5px', color: theme.textPrimary }}>{item.name}</strong></div>
                  <span style={{ fontSize: '9px', background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', color: theme.textTertiary }}>{item.region}</span>
                </div>
                <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                  <div>🏢 <strong>स्थान प्रभाग:</strong> {item.venue}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', padding: '6px 10px', borderRadius: '8px', marginTop: '6px', alignItems: 'center' }}>
                    <span style={{ color: theme.textTertiary }}>👤 {item.contact}</span>
                    {/^\d+$/.test(item.phone.replace(/[\s\-\+\(\)]/g, '')) ? (
                      <a href={`tel:${item.phone}`} style={{ color: isDarkMode ? '#00f2fe' : '#0284c7', fontWeight: '700', textDecoration: 'none' }}>📞 {item.phone}</a>
                    ) : (
                      <span style={{ color: theme.textTertiary }}>{item.phone}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredVihar.length === 0 && (
              <div style={{ textAlign: 'center', color: theme.textTertiary, fontSize: '12px', padding: '20px' }}>
                कोई परिणाम नहीं मिला भाई साहब। कृपया स्पेलिंग जांचें।
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'FAQ' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {terapanthFaq.map((f, i) => (
            <div key={i} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '14px', boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.02)' }}>
              <strong style={{ fontSize: '13px', color: isDarkMode ? '#ffaa00' : '#b45309', display: 'block', marginBottom: '6px' }}>❓ {f.q}</strong>
              <p style={{ margin: 0, fontSize: '12.5px', color: theme.textSecondary, lineHeight: '1.4' }}>🟢 {f.a}</p>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'OFFLINE_VOW' && (
        <form onSubmit={handleVowSubmit} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.02)' }}>
          <label style={{ fontSize: '12px', color: theme.textTertiary }}>तपस्या लॉग चुनें (Offline persistence check):</label>
          <select value={fastingVow} onChange={(e) => setFastingVow(e.target.value)} style={{ width: '100%', padding: '10px', background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textPrimary, fontSize: '13px', outline: 'none' }}>
            <option value="एकासन (Ekasan)">एकासन (Ekasan)</option>
            <option value="उपवास (Upvas)">उपवास (Upvas)</option>
          </select>
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: isDarkMode ? '#00ffaa' : '#0b0f26', color: isDarkMode ? '#060814' : '#ffffff', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
            {isOnline ? '🛡️ लाइव सिंक करें' : '🔒 ऑफ़लाइन कतार में जोड़ें'}
          </button>
        </form>
      )}

      {/* Removed deleted suites */}

    </div>
  );
};
