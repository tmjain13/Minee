import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Info, Clock, CalendarDays, Link2, Check, Bell, BellRing, Loader2, Sparkles, ChevronRight, MapPin, Download, Sun, Moon, Trash2 } from 'lucide-react';
import { FESTIVALS_2026_2027 } from '../data/panchang';
import SunCalc from 'suncalc';
import { safeStringify } from '../lib/safe-json';
import * as ics from 'ics';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

// Moon Phase Interface and Details Getter
export interface MoonPhaseDetails {
  nameHi: string;
  nameEn: string;
  phaseCode: string;
  illumination: number;
  paksha: 'शुक्ल' | 'कृष्ण' | 'अमावस्या' | 'पूर्णिमा';
  significance: string;
  significanceHi: string;
  color: string;
}

export const getMoonPhaseDetails = (phase: number, fraction: number): MoonPhaseDetails => {
  const pct = Math.round(fraction * 100);
  
  if (phase < 0.03 || phase > 0.97) {
    return {
      nameHi: 'अमावस्या (New Moon)',
      nameEn: 'New Moon',
      phaseCode: 'new-moon',
      illumination: pct,
      paksha: 'अमावस्या',
      significance: 'Night of profound silence & deep meditation. Recommended for self-contemplation and reciting Samayik.',
      significanceHi: 'गहन आत्म-निरीक्षण और मौन साधना की रात्रि। सामायिक और जप साधना के लिए सर्वोत्तम समय।',
      color: 'text-stone-500'
    };
  } else if (phase >= 0.03 && phase < 0.22) {
    return {
      nameHi: 'शुक्ल प्रतिपदा - पंचमी',
      nameEn: 'Waxing Crescent',
      phaseCode: 'waxing-crescent',
      illumination: pct,
      paksha: 'शुक्ल',
      significance: 'The energy of growth begins. Excellent period for embarking on spiritual resolutions and learning new sutras.',
      significanceHi: 'ऊर्जा के विकास का प्रारंभ। नए धार्मिक संकल्पों, स्वाध्याय और सूत्र याद करने के लिए अनुकूल काल।',
      color: 'text-amber-300'
    };
  } else if (phase >= 0.22 && phase < 0.28) {
    return {
      nameHi: 'शुक्ल अष्टमी (अर्ध चंद्र)',
      nameEn: 'First Quarter',
      phaseCode: 'first-quarter',
      illumination: pct,
      paksha: 'शुक्ल',
      significance: 'Auspicious Ashtami Tithi. Traditionally observed with fasting (Upvas) or Ekasana, avoiding green vegetables (सचित्त त्याग).',
      significanceHi: 'पवित्र अष्टमी तिथि। तप (उपवास/एकासन) के लिए उत्तम। हरी सब्जी त्याग (सचित्त परिहार) का दिवस।',
      color: 'text-amber-400'
    };
  } else if (phase >= 0.28 && phase < 0.47) {
    return {
      nameHi: 'शुक्ल नवमी - चतुर्दशी',
      nameEn: 'Waxing Gibbous',
      phaseCode: 'waxing-gibbous',
      illumination: pct,
      paksha: 'शुक्ल',
      significance: 'High spiritual receptivity. Preparing for the Full Moon with increased mindfulness and evening Pratikraman.',
      significanceHi: 'उच्च आध्यात्मिक संवेदनशीलता का समय। मन की स्थिरता, ध्यान और रात्रि प्रतिक्रमण द्वारा पूर्णिमा की पूर्व तैयारी।',
      color: 'text-amber-200'
    };
  } else if (phase >= 0.47 && phase < 0.53) {
    return {
      nameHi: 'पूर्णिमा (Full Moon)',
      nameEn: 'Full Moon',
      phaseCode: 'full-moon',
      illumination: pct,
      paksha: 'पूर्णिमा',
      significance: 'Peak spiritual energy. Highly recommended to observe complete Upvas, continuous chanting, and Preksha meditation.',
      significanceHi: 'पराकाष्ठा की चैतन्य ऊर्जा। अखंड सामायिक, जप साधना, और प्रेक्षाध्यान के लिए अत्यंत प्रभावशाली दिन।',
      color: 'text-yellow-400'
    };
  } else if (phase >= 0.53 && phase < 0.72) {
    return {
      nameHi: 'कृष्ण प्रतिपदा - सप्तमी',
      nameEn: 'Waning Gibbous',
      phaseCode: 'waning-gibbous',
      illumination: pct,
      paksha: 'कृष्ण',
      significance: 'Period of emotional calmness and internalization. Good for intensive scriptural study (Swadhyay).',
      significanceHi: 'भावनात्मक शांतता और अंतर्मुखता का काल। आगम ग्रंथों के गहन स्वाध्याय और चिंतन के लिए सर्वश्रेष्ठ समय।',
      color: 'text-amber-200'
    };
  } else if (phase >= 0.72 && phase < 0.78) {
    return {
      nameHi: 'कृष्ण अष्टमी (अर्ध चंद्र)',
      nameEn: 'Third Quarter',
      phaseCode: 'third-quarter',
      illumination: pct,
      paksha: 'कृष्ण',
      significance: 'Auspicious Krishna Ashtami. Conducive for fasting, giving up sensory attachments, and seeking forgiveness.',
      significanceHi: 'कृष्ण पक्ष की अष्टमी तिथि। तपस्या, कषाय विजय (गुस्सा/अहंकार शांत करने) और प्रतिक्रमण के लिए पावन दिन।',
      color: 'text-amber-400'
    };
  } else {
    return {
      nameHi: 'कृष्ण नवमी - चतुर्दशी',
      nameEn: 'Waning Crescent',
      phaseCode: 'waning-crescent',
      illumination: pct,
      paksha: 'कृष्ण',
      significance: 'Auspicious Chaturdashi period leading to Amavasya. Recommended for rigorous kashay-control and self-discipline.',
      significanceHi: 'अमावस्या की ओर बढ़ती तिथियां (चतुर्दशी)। कठिन तप, कषाय संवर और आत्म-संयम की साधना के लिए उपयुक्त काल।',
      color: 'text-amber-300'
    };
  }
};

const MoonPhaseViz = ({ phase, size = 48 }: { phase: number; size?: number }) => {
  let phaseCode = 'new-moon';
  
  if (phase < 0.03 || phase > 0.97) {
    phaseCode = 'new-moon';
  } else if (phase >= 0.03 && phase < 0.22) {
    phaseCode = 'waxing-crescent';
  } else if (phase >= 0.22 && phase < 0.28) {
    phaseCode = 'first-quarter';
  } else if (phase >= 0.28 && phase < 0.47) {
    phaseCode = 'waxing-gibbous';
  } else if (phase >= 0.47 && phase < 0.53) {
    phaseCode = 'full-moon';
  } else if (phase >= 0.53 && phase < 0.72) {
    phaseCode = 'waning-gibbous';
  } else if (phase >= 0.72 && phase < 0.78) {
    phaseCode = 'third-quarter';
  } else {
    phaseCode = 'waning-crescent';
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      className="drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] dark:drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] transition-all duration-350"
    >
      {/* Deep night sky backing circle */}
      <circle cx="24" cy="24" r="20" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      
      {/* Glowing atmospheric outer ring */}
      <circle cx="24" cy="24" r="20.5" fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.15" />

      {/* Subtle background craters */}
      <circle cx="14" cy="18" r="2.5" fill="#1e293b" opacity="0.3" />
      <circle cx="32" cy="16" r="3" fill="#1e293b" opacity="0.3" />
      <circle cx="22" cy="32" r="2" fill="#1e293b" opacity="0.3" />

      {/* Render the illuminated part */}
      {phaseCode === 'new-moon' && (
        <circle cx="24" cy="24" r="20" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
      )}
      {phaseCode === 'waxing-crescent' && (
        <path d="M 24,4 A 20,20 0 0,1 24,44 A 10,20 0 0,1 24,4 Z" fill="#f59e0b" />
      )}
      {phaseCode === 'first-quarter' && (
        <path d="M 24,4 A 20,20 0 0,1 24,44 Z" fill="#fbbf24" />
      )}
      {phaseCode === 'waxing-gibbous' && (
        <path d="M 24,4 A 20,20 0 0,1 24,44 A 10,20 0 0,0 24,4 Z" fill="#fbbf24" />
      )}
      {phaseCode === 'full-moon' && (
        <>
          <circle cx="24" cy="24" r="20" fill="#fbbf24" />
          <circle cx="24" cy="24" r="19.5" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
          <circle cx="16" cy="18" r="2" fill="#d97706" opacity="0.15" />
          <circle cx="30" cy="16" r="2.5" fill="#d97706" opacity="0.15" />
          <circle cx="24" cy="30" r="1.5" fill="#d97706" opacity="0.15" />
        </>
      )}
      {phaseCode === 'waning-gibbous' && (
        <path d="M 24,4 A 20,20 0 0,0 24,44 A 10,20 0 0,1 24,4 Z" fill="#fbbf24" />
      )}
      {phaseCode === 'third-quarter' && (
        <path d="M 24,4 A 20,20 0 0,0 24,44 Z" fill="#fbbf24" />
      )}
      {phaseCode === 'waning-crescent' && (
        <path d="M 24,4 A 20,20 0 0,0 24,44 A 10,20 0 0,0 24,4 Z" fill="#f59e0b" />
      )}
    </svg>
  );
};

const FILTERS = [
  { id: 'All', label: 'All Events' },
  { id: 'Upcoming7', label: 'Next 7 Days' },
  { id: 'Upcoming30', label: 'Next 30 Days' },
  { id: 'Acharya', label: 'Acharya Events' },
  { id: 'Kalyanak', label: 'Kalyanak' },
  { id: 'Pakakhi', label: 'Pakakhi (Closures)' }
];

const HINDI_MONTHS: Record<string, number> = {
  'जनवरी': 0, 'फरवरी': 1, 'मार्च': 2, 'अप्रैल': 3, 'मई': 4, 'जून': 5, 
  'जुलाई': 6, 'अगस्त': 7, 'सितम्बर': 8, 'अक्टूबर': 9, 'नवम्बर': 10, 'दिसम्बर': 11
};

const monthNames = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'];

const ACHARYAS_LIST = ["भिक्षु", "भारमल", "रायचंद", "जयाचार्य", "मघवागणी", "माणकगणी", "डालगणी", "कालुगणी", "तुलसी", "महाप्रज्ञ", "महाश्रमण"];

const parseHindiDate = (dateString: string) => {
  const parts = dateString.split(' ');
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const year = parseInt(parts[2], 10);
    const month = HINDI_MONTHS[monthStr] ?? 0;
    return new Date(year, month, day);
  }
  return new Date();
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};

const isToday = (dateString: string) => {
  const d = parseHindiDate(dateString);
  const today = new Date();
  return isSameDay(d, today);
};

// --- Calendar & ICS Export Helpers ---
const formatToGoogleCalendarDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

const formatToGoogleCalendarEndDate = (date: Date) => {
  // All day events in Google Calendar need the end date to be the next day
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  const yyyy = nextDay.getFullYear();
  const mm = String(nextDay.getMonth() + 1).padStart(2, '0');
  const dd = String(nextDay.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

const generateICSContent = (festival: any, date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  const endNext = new Date(date);
  endNext.setDate(date.getDate() + 1);
  const endYyyy = endNext.getFullYear();
  const endMm = String(endNext.getMonth() + 1).padStart(2, '0');
  const endDd = String(endNext.getDate()).padStart(2, '0');

  const now = new Date();
  const stampStr = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PROID:-//Terapanth AI//NONSGML Event Calendar//EN',
    'BEGIN:VEVENT',
    `UID:festival-${festival.id}-${yyyy}@terapanth.ai`,
    `DTSTAMP:${stampStr}`,
    `DTSTART;VALUE=DATE:${yyyy}${mm}${dd}`,
    `DTEND;VALUE=DATE:${endYyyy}${endMm}${endDd}`,
    `SUMMARY:${festival.name}`,
    `DESCRIPTION:Terapanth Spiritual Event\\n\\nTithi: ${festival.tithi}\\nDate: ${festival.date}\\nDay: ${festival.day}`,
    'LOCATION:Terapanth Community',
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

const PanchangSection = React.memo(function PanchangSection() {
  const { user } = useAuth();
  const [fastingLogs, setFastingLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      // Offline fallback to localStorage
      const saved = localStorage.getItem('fasting_logs');
      if (saved) {
        try {
          setFastingLogs(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    const fastingPath = `users/${user.uid}/fastingLogs`;
    const fastingQ = query(collection(db, fastingPath));
    const unsubscribeFasting = onSnapshot(fastingQ, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFastingLogs(logs);
      localStorage.setItem('fasting_logs', JSON.stringify(logs));
    }, (err) => {
      console.warn("Fasting logs listener failed in PanchangSection:", err);
    });

    return () => {
      unsubscribeFasting();
    };
  }, [user]);

  const handleAddFastingDay = async (type: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    const newLog = {
      type,
      date: dateStr,
      duration: 1,
      timestamp: new Date().toISOString()
    };

    if (!user) {
      const updated = [...fastingLogs, { id: `local-${Date.now()}`, ...newLog }];
      setFastingLogs(updated);
      localStorage.setItem('fasting_logs', JSON.stringify(updated));
      return;
    }

    const fastingPath = `users/${user.uid}/fastingLogs`;
    try {
      await addDoc(collection(db, fastingPath), {
        ...newLog,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error adding fasting day in PanchangSection:", err);
    }
  };

  const handleRemoveFastingDay = async (id: string) => {
    if (!user) {
      const updated = fastingLogs.filter(log => log.id !== id);
      setFastingLogs(updated);
      localStorage.setItem('fasting_logs', JSON.stringify(updated));
      return;
    }

    const fastingPath = `users/${user.uid}/fastingLogs`;
    try {
      await deleteDoc(doc(db, fastingPath, id));
    } catch (err) {
      console.error("Error deleting fasting day in PanchangSection:", err);
    }
  };

  const [activeFilter, setActiveFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeExportDropdownId, setActiveExportDropdownId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedAcharya, setSelectedAcharya] = useState('All');

  const downloadPanchangPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);

    try {
      // Create a hidden, beautifully-designed print-spec wrapper container
      const printContainer = document.createElement('div');
      printContainer.id = 'temporary-panchang-report-container';
      printContainer.style.width = '790px';
      printContainer.style.padding = '45px';
      printContainer.style.backgroundColor = '#ffffff';
      printContainer.style.color = '#1f2937';
      printContainer.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      printContainer.style.boxSizing = 'border-box';
      
      // Top colored highlight branding band (Orange)
      const topBand = document.createElement('div');
      topBand.style.height = '6px';
      topBand.style.backgroundColor = '#f97316';
      topBand.style.marginBottom = '28px';
      printContainer.appendChild(topBand);

      // Header component
      const headerSection = document.createElement('div');
      headerSection.style.display = 'flex';
      headerSection.style.justifyContent = 'space-between';
      headerSection.style.alignItems = 'flex-end';
      headerSection.style.borderBottom = '2px solid #eae2d5';
      headerSection.style.paddingBottom = '18px';
      headerSection.style.marginBottom = '25px';

      const logoTitleBlock = document.createElement('div');
      
      const smallSub = document.createElement('span');
      smallSub.innerText = 'OFFICIAL SPIRITUAL OBSERVED MATRIX';
      smallSub.style.fontSize = '8.5px';
      smallSub.style.fontWeight = '900';
      smallSub.style.letterSpacing = '0.2em';
      smallSub.style.color = '#f97316';
      smallSub.style.display = 'block';
      smallSub.style.marginBottom = '6px';
      logoTitleBlock.appendChild(smallSub);

      const titleNode = document.createElement('h1');
      titleNode.innerText = 'तेरापंथ जैन जय तिथि पंचांग (2026 - 2027)';
      titleNode.style.fontSize = '24px';
      titleNode.style.fontWeight = '900';
      titleNode.style.color = '#7c2d12';
      titleNode.style.margin = '0';
      logoTitleBlock.appendChild(titleNode);

      const subtitleNode = document.createElement('p');
      subtitleNode.innerText = 'Lineages of the Acharyas, core historic events, kalyanaks, and fast observations';
      subtitleNode.style.fontSize = '11.5px';
      subtitleNode.style.color = '#4b5563';
      subtitleNode.style.marginTop = '4.5px';
      subtitleNode.style.margin = '0';
      logoTitleBlock.appendChild(subtitleNode);

      headerSection.appendChild(logoTitleBlock);

      const rightBrandBlock = document.createElement('div');
      rightBrandBlock.style.textAlign = 'right';

      const appLabelNode = document.createElement('h2');
      appLabelNode.innerText = 'TERAPANTH AI';
      appLabelNode.style.fontSize = '14px';
      appLabelNode.style.fontWeight = '900';
      appLabelNode.style.letterSpacing = '0.05em';
      appLabelNode.style.color = '#111827';
      appLabelNode.style.margin = '0';
      rightBrandBlock.appendChild(appLabelNode);

      const dateIssuedNode = document.createElement('p');
      dateIssuedNode.innerText = `Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      dateIssuedNode.style.fontSize = '9.5px';
      dateIssuedNode.style.color = '#6b7280';
      dateIssuedNode.style.marginTop = '4px';
      dateIssuedNode.style.margin = '0';
      rightBrandBlock.appendChild(dateIssuedNode);

      headerSection.appendChild(rightBrandBlock);
      printContainer.appendChild(headerSection);

      // Data Grid Table
      const gridTable = document.createElement('table');
      gridTable.style.width = '100%';
      gridTable.style.borderCollapse = 'collapse';
      gridTable.style.fontSize = '11.5px';
      gridTable.style.lineHeight = '1.4';

      // Table Header Set
      const tableHead = document.createElement('thead');
      const tableHeadRow = document.createElement('tr');
      tableHeadRow.style.backgroundColor = '#fbf7f0';
      tableHeadRow.style.borderBottom = '2.5px solid #dcd3c1';

      const gridColumns = ['Index', 'Date', 'Day', 'Mudra Lunar Tithi', 'Auspicious Event / festival Name'];
      gridColumns.forEach((cLabel, cIdx) => {
        const columnHeaderCell = document.createElement('th');
        columnHeaderCell.innerText = cLabel;
        columnHeaderCell.style.padding = '12px 10px';
        columnHeaderCell.style.textAlign = cIdx === 0 ? 'center' : 'left';
        columnHeaderCell.style.fontSize = '9.5px';
        columnHeaderCell.style.fontWeight = '900';
        columnHeaderCell.style.letterSpacing = '0.05em';
        columnHeaderCell.style.textTransform = 'uppercase';
        columnHeaderCell.style.color = '#431407';
        tableHeadRow.appendChild(columnHeaderCell);
      });
      tableHead.appendChild(tableHeadRow);
      gridTable.appendChild(tableHead);

      // Table Body Set
      const tableBody = document.createElement('tbody');
      FESTIVALS_2026_2027.forEach((item, index) => {
        const dataRow = document.createElement('tr');
        dataRow.style.borderBottom = '1px solid #f3f4f6';
        if (index % 2 === 1) {
          dataRow.style.backgroundColor = '#faf9f6';
        }

        // 1. Index
        const indexCell = document.createElement('td');
        indexCell.innerText = (index + 1).toString();
        indexCell.style.padding = '10px 8px';
        indexCell.style.textAlign = 'center';
        indexCell.style.fontWeight = '700';
        indexCell.style.color = '#9ca3af';
        dataRow.appendChild(indexCell);

        // 2. English Date Representation
        const engDateCell = document.createElement('td');
        engDateCell.innerText = item.date;
        engDateCell.style.padding = '10px 8px';
        engDateCell.style.fontWeight = '700';
        engDateCell.style.color = '#111827';
        dataRow.appendChild(engDateCell);

        // 3. Day of week
        const dayCell = document.createElement('td');
        dayCell.innerText = item.day;
        dayCell.style.padding = '10px 8px';
        dayCell.style.color = '#4b5563';
        dataRow.appendChild(dayCell);

        // 4. Lunar Tithi
        const tithiCell = document.createElement('td');
        tithiCell.innerText = item.tithi;
        tithiCell.style.padding = '10px 8px';
        tithiCell.style.fontWeight = '700';
        tithiCell.style.color = '#ea580c';
        dataRow.appendChild(tithiCell);

        // 5. Name description
        const nameCell = document.createElement('td');
        nameCell.innerText = item.name;
        nameCell.style.padding = '10px 8px';
        nameCell.style.fontWeight = '600';
        nameCell.style.color = '#1f2937';
        dataRow.appendChild(nameCell);

        tableBody.appendChild(dataRow);
      });
      gridTable.appendChild(tableBody);
      printContainer.appendChild(gridTable);

      // Quote Bottom Callout Section
      const calloutDiv = document.createElement('div');
      calloutDiv.style.marginTop = '35px';
      calloutDiv.style.padding = '18px';
      calloutDiv.style.backgroundColor = '#fffbf0';
      calloutDiv.style.borderRadius = '16px';
      calloutDiv.style.border = '1px solid #fef3c7';
      calloutDiv.style.textAlign = 'center';

      const sanskritQuoteText = document.createElement('p');
      sanskritQuoteText.innerText = '"अहिंसा, संयम और तप ही सर्वोत्कृष्ट मंगल है जिनका मन सदा धार्मिक कार्यों में लगा रहता है उन्हें देवगण भी नमस्कार करते हैं।"';
      sanskritQuoteText.style.fontStyle = 'italic';
      sanskritQuoteText.style.fontSize = '12px';
      sanskritQuoteText.style.fontWeight = '700';
      sanskritQuoteText.style.color = '#7c2d12';
      sanskritQuoteText.style.margin = '0';
      calloutDiv.appendChild(sanskritQuoteText);

      const footerLabelNode = document.createElement('p');
      footerLabelNode.innerText = 'Jain Terapanth Sect • Deep Spiritual Preservation Engine';
      footerLabelNode.style.fontSize = '9px';
      footerLabelNode.style.fontWeight = '900';
      footerLabelNode.style.letterSpacing = '0.1em';
      footerLabelNode.style.color = '#b45309';
      footerLabelNode.style.marginTop = '8.5px';
      footerLabelNode.style.margin = '0';
      calloutDiv.appendChild(footerLabelNode);

      printContainer.appendChild(calloutDiv);

      document.body.appendChild(printContainer);

      // Run html2canvas engine capture sequence
      const renderedCanvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const elementImgData = renderedCanvas.toDataURL('image/png');
      const pdfDoc = new jsPDF('p', 'mm', 'a4');
      const elementImgProps = pdfDoc.getImageProperties(elementImgData);
      const outputPdfWidth = pdfDoc.internal.pageSize.getWidth();
      const outputPdfHeight = (elementImgProps.height * outputPdfWidth) / elementImgProps.width;

      const singlePageMaxHeight = 295; // mm standard A4 height
      let remHeightLeft = outputPdfHeight;
      let verticalOffsetShift = 0;

      pdfDoc.addImage(elementImgData, 'PNG', 0, verticalOffsetShift, outputPdfWidth, outputPdfHeight);
      remHeightLeft -= singlePageMaxHeight;

      while (remHeightLeft >= 0) {
        verticalOffsetShift = remHeightLeft - outputPdfHeight;
        pdfDoc.addPage();
        pdfDoc.addImage(elementImgData, 'PNG', 0, verticalOffsetShift, outputPdfWidth, outputPdfHeight);
        remHeightLeft -= singlePageMaxHeight;
      }

      pdfDoc.save('Terapanth_Panchang_2026_2027.pdf');
      document.body.removeChild(printContainer);
    } catch (eError) {
      console.error('Panchang PDF compiling aborted:', eError);
    } finally {
      setIsExportingPDF(false);
    }
  };
  
  const [reminders, setReminders] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('panchang_reminders') || '[]');
    } catch {
      return [];
    }
  });

  const [subscribedTithis, setSubscribedTithis] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('panchang_subscribed_tithis') || '[]');
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<{id: string, text: string}[]>([]);

  // Past Ritual Notifications Log State
  interface PastNotification {
    id: string;
    type: 'chauvihar' | 'navkarsi';
    title: string;
    time: string;
    date: string;
    status: 'Observed' | 'Missed' | 'Pending';
    details: string;
  }

  const [pastAlerts, setPastAlerts] = useState<PastNotification[]>(() => {
    try {
      const saved = localStorage.getItem('past_ritual_notifications_log');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'p1',
        type: 'chauvihar',
        title: 'Chauvihar Sunset Cessation',
        time: '07:11 PM (-3M offsets)',
        date: 'June 13, 2026',
        status: 'Observed',
        details: 'Sunset absolute cessation. Verified adherence to zero food/water post-sunset.'
      },
      {
        id: 'p2',
        type: 'navkarsi',
        title: 'Navkarsi Sunrise Activation',
        time: '06:12 AM (+48M offsets)',
        date: 'June 13, 2026',
        status: 'Observed',
        details: 'Commenced oral intake 48 minutes post sunrise.'
      },
      {
        id: 'p3',
        type: 'chauvihar',
        title: 'Chauvihar Sunset Cessation',
        time: '07:10 PM (-3M offsets)',
        date: 'June 12, 2026',
        status: 'Observed',
        details: 'Observed complete fasting post sunset.'
      },
      {
        id: 'p4',
        type: 'navkarsi',
        title: 'Navkarsi Sunrise Activation',
        time: '06:11 AM (+48M offsets)',
        date: 'June 12, 2026',
        status: 'Missed',
        details: 'Meal/water intake observed prior to 48 minutes threshold.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('past_ritual_notifications_log', JSON.stringify(pastAlerts));
  }, [pastAlerts]);

  const toggleAlertStatus = (id: string) => {
    setPastAlerts(prev => prev.map(alert => {
      if (alert.id === id) {
        const nextStatus = alert.status === 'Observed' ? 'Missed' : 'Observed';
        return { ...alert, status: nextStatus };
      }
      return alert;
    }));
  };

  const addSimulatedAlert = (type: 'chauvihar' | 'navkarsi') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const newAlert: PastNotification = {
      id: `sim-${Date.now()}`,
      type,
      title: type === 'chauvihar' ? 'Chauvihar Sunset Cessation' : 'Navkarsi Sunrise Activation',
      time: `${timeStr} (Calculated Time)`,
      date: dateStr,
      status: 'Pending',
      details: type === 'chauvihar' 
        ? 'Awaiting evening fasting confirmation. Confirm below to observe.' 
        : 'Awaiting 48-minute morning water cessation confirmation.'
    };
    setPastAlerts(prev => [newAlert, ...prev]);
  };

  useEffect(() => {
    // Check reminders & subscribed Tithis on mount
    const todayFestivals = FESTIVALS_2026_2027.filter(f => isToday(f.date));
    const list: {id: string, text: string}[] = [];
    
    // Check traditional user reminders
    const todayReminders = todayFestivals.filter(f => reminders.includes(f.id));
    todayReminders.forEach(f => {
      list.push({ id: f.id, text: `Reminder: Today is ${f.name} (${f.tithi})` });
    });

    // Check subscribed Tithi triggers
    subscribedTithis.forEach(sub => {
      let tithiTerm = '';
      if (sub === 'ashtami') tithiTerm = 'अष्टमी';
      if (sub === 'chaturdashi') tithiTerm = 'चतुर्दशी';
      if (sub === 'paryushan') tithiTerm = 'पर्युषण';
      if (sub === 'pakakhi') tithiTerm = 'पाक्खी';

      if (tithiTerm) {
        todayFestivals.forEach(fest => {
          if (fest.tithi.includes(tithiTerm) || fest.name.includes(tithiTerm)) {
            list.push({ id: `sub-${sub}-${fest.id}`, text: `Auspicious alert: Subscribed ${tithiTerm} Tithi is here! Observation: ${fest.name} (${fest.tithi})` });
          }
        });
      }
    });

    setNotifications(list);
  }, [reminders, subscribedTithis]);

  useEffect(() => {
    // Simulate loading on filter change
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [activeFilter, selectedMonth, selectedAcharya]);

  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090 });

  useEffect(() => {
    const savedPermission = localStorage.getItem('perm_location');
    if (savedPermission === 'denied') {
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          localStorage.setItem('perm_location', 'granted');
        },
        (error) => {
          console.warn("Could not get location, defaulting to Delhi.", error);
          if (error.code === error.PERMISSION_DENIED) {
            localStorage.setItem('perm_location', 'denied');
          }
        }
      );
    }
  }, []);

  const toggleReminder = (id: string, name: string) => {
    let newReminders;
    if (reminders.includes(id)) {
      newReminders = reminders.filter(r => r !== id);
    } else {
      newReminders = [...reminders, id];
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
    setReminders(newReminders);
    localStorage.setItem('panchang_reminders', safeStringify(newReminders));
  };

  const getTithiInfo = (d: Date) => {
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const dateString = `${day} ${month} ${year}`;
    
    const sunTimes = SunCalc.getTimes(d, location.lat, location.lon);
    const moonIllum = SunCalc.getMoonIllumination(sunTimes.sunrise);
    const phase = moonIllum.phase;
    const fraction = moonIllum.fraction;

    const festivalsFound = FESTIVALS_2026_2027.filter(f => f.date === dateString);
    if (festivalsFound.length > 0) {
      return { 
        tithi: festivalsFound[0].tithi, 
        name: festivalsFound[0].name, 
        isApprox: false,
        sunrise: sunTimes.sunrise,
        sunset: sunTimes.sunset,
        phase,
        fraction
      };
    }

    const totalPhase = phase * 30;
    let tithiNumber = Math.ceil(totalPhase);
    if (tithiNumber === 0) tithiNumber = 30; 

    const paksha = phase <= 0.5 ? 'शुक्ल' : 'कृष्ण';
    const tithiNameNumber = tithiNumber > 15 ? tithiNumber - 15 : tithiNumber;
    
    const tithiNames = [
      'प्रतिपदा (1)', 'द्वितीया (2)', 'तृतीया (3)', 'चतुर्थी (4)', 'पंचमी (5)',
      'षष्ठी (6)', 'सप्तमी (7)', 'अष्टमी (8)', 'नवमी (9)', 'दशमी (10)',
      'एकादशी (11)', 'द्वादशी (12)', 'त्रयोदशी (13)', 'चतुर्दशी (14)', 'पूर्णिमा / अमावस्या'
    ];

    let tithiName = tithiNames[tithiNameNumber - 1] || '';
    if (tithiNumber === 15) tithiName = 'पूर्णिमा (15)';
    if (tithiNumber === 30) tithiName = 'अमावस्या (30)';

    return { 
      tithi: `${paksha} पक्ष, ${tithiName}`, 
      name: '', 
      isApprox: true,
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset,
      phase,
      fraction
    };
  };

  const selectedTithiData = useMemo(() => getTithiInfo(selectedDate), [selectedDate]);

  const filteredFestivals = useMemo(() => {
    return FESTIVALS_2026_2027.filter(f => {
      // Month Filter
      if (selectedMonth !== 'All' && !f.date.includes(selectedMonth)) return false;
      
      // Acharya Filter
      if (selectedAcharya !== 'All' && !f.name.includes(selectedAcharya)) return false;

      if (activeFilter === 'All') return true;
      if (activeFilter === 'Upcoming7' || activeFilter === 'Upcoming30') {
        const eventDate = parseHindiDate(f.date);
        const baseDate = new Date(selectedDate);
        baseDate.setHours(0, 0, 0, 0);
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.floor((eventDate.getTime() - baseDate.getTime()) / msPerDay);
        if (activeFilter === 'Upcoming7') {
           return diffDays >= 0 && diffDays <= 7;
        }
        if (activeFilter === 'Upcoming30') {
           return diffDays >= 0 && diffDays <= 30;
        }
      }
      if (activeFilter === 'Acharya') return f.name.includes('आचार्यश्री') || f.name.includes('श्रीमद्') || f.name.includes('भिक्षु');
      if (activeFilter === 'Kalyanak') return f.name.includes('कल्याणक') || f.name.includes('जयन्ती') || f.name.includes('महावीर');
      if (activeFilter === 'Pakakhi') return f.name.includes('पाक्खी');
      
      return true;
    });
  }, [activeFilter, selectedMonth, selectedAcharya]);

  const groupedFestivals = useMemo(() => {
    return filteredFestivals.reduce((acc, festival) => {
      const parts = festival.date.split(' ');
      const monthYear = parts.slice(1).join(' ');
      
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(festival);
      return acc;
    }, {} as Record<string, typeof FESTIVALS_2026_2027>);
  }, [filteredFestivals]);

  const handleCopyLink = (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'panchang');
    url.searchParams.set('event', id);
    navigator.clipboard.writeText(url.toString());
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getGoogleCalendarUrl = (festival: typeof FESTIVALS_2026_2027[0]) => {
    const date = parseHindiDate(festival.date);
    const startDateStr = formatToGoogleCalendarDate(date);
    const endDateStr = formatToGoogleCalendarEndDate(date);
    const title = encodeURIComponent(festival.name);
    const details = encodeURIComponent(`Spiritual Event: ${festival.name}\nTithi: ${festival.tithi}\nDate: ${festival.date}\nDay: ${festival.day}`);
    const location = encodeURIComponent('Terapanth Community');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${details}&location=${location}`;
  };

  const downloadICSFile = (festival: typeof FESTIVALS_2026_2027[0]) => {
    const date = parseHindiDate(festival.date);
    const content = generateICSContent(festival, date);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${festival.name.replace(/\s+/g, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 animate-fade-in relative">
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col gap-2 mb-4"
          >
            {notifications.map((n, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-full">
                  <BellRing size={20} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Today's Reminder</h4>
                  <p className="text-xs font-medium opacity-90">{n.text}</p>
                </div>
                <button 
                  onClick={() => setNotifications(prev => prev.filter((_, i) => i !== idx))}
                  className="p-2 hover:bg-emerald-200/50 dark:hover:bg-emerald-700/50 rounded-full transition-colors"
                >
                  <Check size={16} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* REFACTOR TO DEFEND AGAINST HORIZONTAL VIEWPORT BLEED */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 w-full max-w-full">
        <div className="flex-1 flex items-start gap-3 bg-[var(--bg-cream)] p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] w-full max-w-full overflow-hidden">
          <div className="p-3 bg-white dark:bg-black rounded-2xl shadow-sm border border-black/5 dark:border-white/5 shrink-0 hidden sm:block">
            <CalendarDays size={24} className="text-spiritual dark:text-white" />
          </div>
          <div className="flex-1 min-w-0 w-full">
            <h2 className="serif-text text-xl sm:text-2xl font-bold text-[var(--text-spiritual)] mb-1 truncate">Terapanth Jay Tithi Panchang</h2>
            <div className="w-full flex flex-wrap items-center gap-2 mt-3">
              <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
                <input 
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-spiritual transition-all shadow-sm dark:[color-scheme:dark]"
                />
              </div>
              <button 
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today);
                  setActiveFilter('All');
                  setTimeout(() => {
                    const todayEl = document.querySelector('.bg-orange-50.dark\\:bg-orange-900\\/20');
                    if (todayEl) {
                      todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      todayEl.classList.add('ring-2', 'ring-orange-500', 'ring-offset-2');
                      setTimeout(() => todayEl.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-2'), 2000);
                    }
                  }, 500);
                }}
                className="whitespace-nowrap px-3 py-2 text-[10px] font-black uppercase tracking-wider bg-stone-900 dark:bg-stone-850 text-white rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                JUMP TO TODAY
              </button>
              
              <button 
                onClick={downloadPanchangPDF}
                disabled={isExportingPDF}
                className="whitespace-nowrap px-3 py-2 text-[10px] font-black uppercase tracking-wider border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-stone-100 rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 size={11} className="animate-spin text-spiritual" />
                    <span>PREPARING...</span>
                  </>
                ) : (
                  <>
                    <Download size={11} />
                    <span>DOWNLOAD PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tithi Alert Subscription Manager */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-500/15 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-[pulse_2s_infinite]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-spiritual">Tithi Subscription Hub</span>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Subscribe for Auspicious Day Alerts</h3>
          <p className="text-[10px] text-gray-550 leading-relaxed max-w-xl">
            Get instant home alerts for chosen Tithis. Select key days to stay mindful of special rituals, penances, or fast timings like Ashtami.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { id: 'ashtami', label: 'अष्टमी (Ashtami)' },
            { id: 'chaturdashi', label: 'चतुर्दशी (Chaturdashi)' },
            { id: 'paryushan', label: 'पर्युषण (Paryushan)' },
            { id: 'pakakhi', label: 'पाक्खी (Pakakhi)' }
          ].map(opt => {
            const isSubscribed = subscribedTithis.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  let nextSubs;
                  if (isSubscribed) {
                    nextSubs = subscribedTithis.filter(s => s !== opt.id);
                  } else {
                    nextSubs = [...subscribedTithis, opt.id];
                    if ('Notification' in window && Notification.permission !== 'granted') {
                      Notification.requestPermission();
                    }
                  }
                  setSubscribedTithis(nextSubs);
                  localStorage.setItem('panchang_subscribed_tithis', JSON.stringify(nextSubs));
                }}
                className={`px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  isSubscribed
                    ? 'bg-orange-500 text-white border-transparent'
                    : 'bg-white dark:bg-gray-800 border-gray-255 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                {isSubscribed ? <BellRing size={11} className="animate-bounce" /> : <Bell size={11} />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
              activeFilter === filter.id 
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm' 
                : 'bg-[var(--card-bg)] text-gray-500 border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between bg-[var(--card-bg)] p-3 sm:p-4 rounded-2xl border border-[var(--border-color)]">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-transparent rounded-full px-4 py-2 text-xs font-bold outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors"
          >
            <option value="All">All Months</option>
            {Object.keys(HINDI_MONTHS).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          
          <select 
            value={selectedAcharya} 
            onChange={(e) => setSelectedAcharya(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border border-transparent rounded-full px-4 py-2 text-xs font-bold outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors"
          >
            <option value="All">All Acharyas</option>
            {ACHARYAS_LIST.map(a => <option key={a} value={a}>आचार्य {a}</option>)}
          </select>
        </div>

        <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-xl p-1">
          <button 
            onClick={() => setViewType('list')}
            className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white dark:bg-black shadow-sm text-spiritual' : 'text-gray-400'}`}
            title="List View"
          >
            <CalendarDays size={18} />
          </button>
          <button 
            onClick={() => setViewType('calendar')}
            className={`p-2 rounded-lg transition-all ${viewType === 'calendar' ? 'bg-white dark:bg-black shadow-sm text-spiritual' : 'text-gray-400'}`}
            title="Calendar View"
          >
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {viewType === 'calendar' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-black/5 dark:border-white/5 p-4 sm:p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="serif-text text-2xl font-bold text-spiritual">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <button 
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
              const day = i + 1;
              const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
              const dateStr = `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
              const festivals = FESTIVALS_2026_2027.filter(f => f.date === dateStr);
              const isSelected = isSameDay(date, selectedDate);
              const currentTithi = getTithiInfo(date);

              // Format date in YYYY-MM-DD
              const monthPadded = String(date.getMonth() + 1).padStart(2, '0');
              const dayPadded = String(day).padStart(2, '0');
              const isoDateStr = `${date.getFullYear()}-${monthPadded}-${dayPadded}`;
              const dayFasting = fastingLogs.find(log => log.date === isoDateStr);

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(date)}
                  className={`relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all p-1 group border ${
                    isSelected 
                      ? 'bg-spiritual text-[var(--bg-cream)] border-transparent shadow-lg z-10' 
                      : dayFasting
                        ? 'bg-emerald-550/15 dark:bg-emerald-900/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : festivals.length > 0 
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400' 
                          : 'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10 dark:text-white'
                  }`}
                >
                  <span className={`text-xs sm:text-base font-bold ${isSelected ? 'text-[var(--bg-cream)]' : 'group-hover:scale-110 transition-transform'}`}>{day}</span>
                  {dayFasting && (
                    <div className="absolute top-1 left-1 px-1 py-0.5 bg-emerald-500 text-white rounded text-[7px] font-black uppercase leading-none scale-90 z-10">
                      {dayFasting.type === 'chauvihar_upvas' ? 'CU' : dayFasting.type[0].toUpperCase()}
                    </div>
                  )}
                  {festivals.length > 0 && !isSelected && !dayFasting && (
                    <div className="absolute top-1 right-1">
                      {festivals[0].category === 'maryada' ? (
                        <Award size={8} className="text-amber-500 animate-pulse" />
                      ) : festivals[0].category === 'anniversary' ? (
                        <Sparkles size={8} className="text-blue-500 animate-pulse" />
                      ) : (
                        <Sparkles size={8} className="text-orange-500 animate-pulse" />
                      )}
                    </div>
                  )}
                  <div className={`text-[6px] sm:text-[8px] font-medium leading-tight mt-1 hidden sm:block ${isSelected ? 'opacity-70' : 'text-gray-400'}`}>
                    {currentTithi.tithi.split(',')[1] || currentTithi.tithi}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gradient-to-br from-spiritual/5 to-orange-500/5 dark:from-spiritual/20 dark:to-orange-500/10 rounded-3xl border border-spiritual/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                   <h4 className="text-spiritual font-black text-[10px] uppercase tracking-widest mb-1">Detailed View</h4>
                   <p className="serif-text text-2xl font-bold text-spiritual">{selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="p-3 bg-white dark:bg-black rounded-2xl shadow-sm">
                   <Sparkles size={20} className="text-orange-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-black/40 rounded-2xl border border-black/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-spiritual/10 flex items-center justify-center text-spiritual">
                      <Clock size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tithi & Time</span>
                  </div>
                  <p className="font-bold text-spiritual">{selectedTithiData.tithi}</p>
                  <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
                    <span>Sunrise: {selectedTithiData.sunrise?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span>Sunset: {selectedTithiData.sunset?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  {selectedTithiData.isApprox && <p className="text-[9px] text-gray-500 mt-1 italic">Note: Approximate based on moon phase</p>}
                </div>

                {/* Moon Phase Widget */}
                <div className="p-4 bg-white dark:bg-black/40 rounded-2xl border border-black/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Moon size={12} className="text-orange-500" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Moon Phase (चन्द्र कला)</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex-shrink-0">
                        <MoonPhaseViz phase={selectedTithiData.phase ?? 0} size={48} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-gray-950 dark:text-gray-100 leading-tight">
                          {getMoonPhaseDetails(selectedTithiData.phase ?? 0, selectedTithiData.fraction ?? 0).nameHi}
                        </p>
                        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider leading-none mt-1">
                          {getMoonPhaseDetails(selectedTithiData.phase ?? 0, selectedTithiData.fraction ?? 0).nameEn}
                        </p>
                        <p className="text-[9px] text-orange-600 dark:text-orange-400 mt-1.5 font-mono font-bold">
                          Illumination: {Math.round((selectedTithiData.fraction ?? 0) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                    <p className="text-[9px] text-gray-550 dark:text-gray-400 leading-relaxed italic">
                      <span className="font-bold text-orange-500">Significance:</span> {getMoonPhaseDetails(selectedTithiData.phase ?? 0, selectedTithiData.fraction ?? 0).significanceHi}
                    </p>
                  </div>
                </div>

                {FESTIVALS_2026_2027.some(f => f.date === `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`) ? (
                  <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                        <CalendarDays size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">Festival & Notes</span>
                    </div>
                    {FESTIVALS_2026_2027.filter(f => f.date === `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`).map(f => (
                      <div key={f.id} className="space-y-1">
                        <p className="font-black text-orange-600 dark:text-orange-400">{f.name}</p>
                        <p className="text-[10px] text-orange-800/60 dark:text-orange-200/60 leading-relaxed">
                          {f.sadhanaTip || "Important spiritual observation day. Check with local mandal for specific session timings and Guru Darshan details."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 flex items-center justify-center text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No major festivals on this date</p>
                  </div>
                )}

                {/* Fasting Calendar Tracker Widget */}
                <div className="p-4 bg-white dark:bg-black/40 rounded-2xl border border-black/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Calendar size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fasting Day Tracker</span>
                    </div>
                    {(() => {
                      const monthPadded = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const dayPadded = String(selectedDate.getDate()).padStart(2, '0');
                      const isoDateStr = `${selectedDate.getFullYear()}-${monthPadded}-${dayPadded}`;
                      const todayFast = fastingLogs.find(log => log.date === isoDateStr);
                      
                      if (todayFast) {
                        return (
                          <div className="space-y-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                              You have marked this day as <span className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">{todayFast.type.replace('_', ' ')}</span>.
                            </p>
                            <button
                              onClick={() => handleRemoveFastingDay(todayFast.id)}
                              className="w-full py-1.5 px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-500/10"
                            >
                              <Trash2 size={13} /> Remove Fasting Day
                            </button>
                          </div>
                        );
                      } else {
                        return (
                          <div className="space-y-3">
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Mark this date as a monthly fasting day (Tithi) to track your tapasya.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {['upvas', 'chauvihar_upvas', 'ekasana', 'beasana', 'ayambil'].map((type) => (
                                <button
                                  key={type}
                                  onClick={() => handleAddFastingDay(type)}
                                  className="py-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all border border-emerald-500/10 cursor-pointer"
                                >
                                  {type.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {viewType === 'list' && (
        <div className="space-y-8 relative min-h-[200px]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--bg-cream)]/50 backdrop-blur-sm rounded-3xl">
             <Loader2 size={32} className="text-orange-500 animate-spin" />
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedFestivals).length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 text-gray-500 font-medium text-sm"
            >
              No events found for this filter.
            </motion.div>
          )}
          {Object.entries(groupedFestivals).map(([monthYear, festivals], groupIndex) => (
            <motion.div 
              key={monthYear}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: groupIndex * 0.05 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)] px-6 py-4 sticky top-0 z-10 backdrop-blur-md">
                <h3 className="serif-text text-xl font-bold text-[var(--text-spiritual)]">{monthYear}</h3>
              </div>
              
              <div className="divide-y divide-[var(--border-color)]">
                {festivals.map((festival, index) => {
                  const isCurrentDay = isToday(festival.date);
                  return (
                  <motion.div 
                    key={festival.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ delay: index * 0.05 }}
                    className={`group flex flex-col sm:flex-row sm:items-center justify-between p-6 transition-colors relative ${isCurrentDay ? 'bg-orange-50/50 dark:bg-orange-900/20 border-l-4 border-orange-500' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
                    id={`festival-${festival.id}`}
                  >
                    <div className="mb-3 sm:mb-0 sm:pr-4 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 text-[10px] uppercase font-bold tracking-wider">
                          <Clock size={10} />
                          {festival.tithi}
                        </span>
                        {isCurrentDay && (
                          <span className="inline-flex items-center px-2 py-1 rounded sm text-white bg-orange-500 text-[10px] uppercase font-bold tracking-wider animate-pulse">
                            Today
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-[var(--text-spiritual)] group-hover:text-black dark:group-hover:text-white transition-colors pr-16 sm:pr-0">{festival.name}</h4>
                    </div>
                    
                    <div className="flex flex-col sm:items-end p-3 bg-[var(--bg-cream)] rounded-2xl sm:min-w-[140px] shrink-0 border border-[var(--border-color)] group-hover:border-black/10 dark:group-hover:border-white/10 transition-colors">
                      <span className="text-sm font-bold whitespace-nowrap mb-0.5">{festival.date}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{festival.day}</span>
                    </div>

                    <div className="absolute top-6 right-6 sm:relative sm:top-auto sm:right-auto sm:ml-4 flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setActiveExportDropdownId(activeExportDropdownId === festival.id ? null : festival.id)}
                          className={`p-2 border rounded-full shadow-sm transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 ${
                            activeExportDropdownId === festival.id 
                              ? 'bg-orange-500 text-white border-orange-500' 
                              : 'bg-white dark:bg-black border-black/10 dark:border-white/10 text-gray-500 hover:text-orange-500 hover:border-orange-500'
                          }`}
                          title="Export to Calendar"
                          id={`export-btn-${festival.id}`}
                        >
                          <Download size={14} />
                        </button>
                        {activeExportDropdownId === festival.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-35" 
                              onClick={() => setActiveExportDropdownId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 border border-black/10 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-40 animate-fade-in text-left">
                              <a
                                href={getGoogleCalendarUrl(festival)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setActiveExportDropdownId(null)}
                                className="flex items-center gap-2 px-3.5 py-2 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                                </svg>
                                Add to Google Calendar
                              </a>
                              <button
                                onClick={() => {
                                  downloadICSFile(festival);
                                  setActiveExportDropdownId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left"
                              >
                                <Calendar size={12} className="text-orange-500 shrink-0" />
                                Download iCal (.ics) File
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                       <button
                        onClick={() => toggleReminder(festival.id, festival.name)}
                         className={`p-2 rounded-full shadow-sm transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 ${reminders.includes(festival.id) ? 'bg-orange-500 text-white' : 'bg-white dark:bg-black border border-black/10 dark:border-white/10 text-gray-500 hover:text-black dark:hover:text-white'}`}
                        title={reminders.includes(festival.id) ? "Remove reminder" : "Set reminder"}
                      >
                        {reminders.includes(festival.id) ? <BellRing size={14} /> : <Bell size={14} />}
                      </button>
                      <button
                        onClick={() => handleCopyLink(festival.id)}
                        className="p-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-full text-gray-500 hover:text-black dark:hover:text-white shadow-sm transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                        title="Copy direct link"
                      >
                        {copiedId === festival.id ? <Check size={14} className="text-green-500" /> : <Link2 size={14} />}
                      </button>
                    </div>
                  </motion.div>
                )})}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )}

      {/* Past Ritual Notifications Log Panel */}
      <div id="past-ritual-log" className="bg-[var(--card-bg)] p-6 rounded-[2.5rem] border border-[var(--border-color)] space-y-4 shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="serif-text text-xl font-bold text-[var(--text-spiritual)] flex items-center gap-2">
              <Clock className="text-orange-500 shrink-0" size={18} />
              Past Ritual Notifications Log
            </h3>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-xl font-sans">
              Strict ecological history logs of triggered Chauvihar and Navkarsi alerts. Tap to toggle your status to enforce spiritual self-control and personal accountability.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => addSimulatedAlert('chauvihar')}
              className="py-1.5 px-3 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all active:scale-95 border border-orange-200/50 cursor-pointer text-center"
            >
              + Log Chauvihar
            </button>
            <button
              onClick={() => addSimulatedAlert('navkarsi')}
              className="py-1.5 px-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all active:scale-95 border border-amber-200/50 cursor-pointer text-center"
            >
              + Log Navkarsi
            </button>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {pastAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.status === 'Observed' 
                  ? 'bg-emerald-500/5 border-emerald-500/15 dark:border-emerald-500/10' 
                  : alert.status === 'Missed'
                    ? 'bg-rose-500/5 border-rose-500/15 dark:border-rose-500/10'
                    : 'bg-zinc-500/5 border-zinc-500/15 dark:border-zinc-500/10 animate-pulse'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-2xl shrink-0 ${
                  alert.type === 'chauvihar' 
                    ? 'bg-orange-500/10 text-orange-500' 
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {alert.type === 'chauvihar' ? (
                    <Moon size={18} />
                  ) : (
                    <Sun size={18} />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-xs text-[var(--text-spiritual)]">{alert.title}</h4>
                    <span className="text-[9px] text-gray-400 font-mono">{alert.date} • {alert.time}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-sans">{alert.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto font-sans">
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  alert.status === 'Observed' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : alert.status === 'Missed'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {alert.status === 'Observed' ? '🟢 Observed' : alert.status === 'Missed' ? '🔴 Missed' : '🟡 Pending'}
                </span>
                
                <button
                  type="button"
                  onClick={() => toggleAlertStatus(alert.id)}
                  className="py-1 px-3 bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 hover:border-black/30 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer text-center"
                >
                  Toggle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default PanchangSection;
