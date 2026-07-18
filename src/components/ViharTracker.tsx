import { useState, useEffect, useMemo } from 'react';
import { chaturmasLocations2026 } from '../data/chaturmasLocations2026';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';
import { viharPravasTodayData } from '../data/viharPravasToday';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Share2, Check, MapPin, Filter, Locate } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import ViharDirectory from './ViharDirectory';

// --- Offline Map Caching Logic (IndexedDB) ---
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ViharMapTilesDB', 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('tiles')) {
        db.createObjectStore('tiles', { keyPath: 'url' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const cacheTile = async (url: string, blob: Blob) => {
  try {
    const db = await initDB();
    const tx = db.transaction('tiles', 'readwrite');
    tx.objectStore('tiles').put({ url, blob });
  } catch (err) {
    console.error('Failed to cache map tile', err);
  }
};

const getCachedTile = async (url: string): Promise<Blob | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tiles', 'readonly');
      const request = tx.objectStore('tiles').get(url);
      request.onsuccess = () => resolve(request.result?.blob || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get cached tile', err);
    return null;
  }
};

// --- Static Historical Data for Recharts Map Visualizer ---
const ahimsaYatraData = [
  { year: 2015, location: 'Kathmandu', lat: 27.7, lng: 85.3 },
  { year: 2016, location: 'Siliguri', lat: 26.7, lng: 88.4 },
  { year: 2017, location: 'Kolkata', lat: 22.5, lng: 88.3 },
  { year: 2018, location: 'Chennai', lat: 13.0, lng: 80.2 },
  { year: 2019, location: 'Bengaluru', lat: 12.9, lng: 77.5 },
  { year: 2020, location: 'Hyderabad', lat: 17.3, lng: 78.4 },
  { year: 2021, location: 'New Delhi', lat: 28.6, lng: 77.2 },
  { year: 2022, location: 'Jaipur', lat: 26.9, lng: 75.7 },
  { year: 2023, location: 'Mumbai', lat: 19.0, lng: 72.8 },
  { year: 2024, location: 'Surat', lat: 21.1, lng: 72.8 },
  { year: 2025, location: 'Pune', lat: 18.5, lng: 73.8 },
  { year: 2026, location: 'Kelwa', lat: 25.1, lng: 73.8 },
  { year: 2027, location: 'Delhi', lat: 28.6, lng: 77.2 }
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-lg border border-emerald-100 dark:border-emerald-900/30 text-sm">
        <p className="font-bold text-emerald-800">{data.year || 'Point Info'}</p>
        <p className="text-gray-700 font-medium">{data.location}</p>
        {data.distanceKm !== undefined && (
          <p className="text-orange-500 font-bold mt-1">📏 {data.distanceKm.toFixed(1)} km</p>
        )}
      </div>
    );
  }
  return null;
};

// --- Acharya Vihar Timeline Dataset ---
const acharyaViharTimeline = [
  {
    location: "लाडनूं, राजस्थान (Jain Vishva Bharati)",
    year: "2026 - वर्तमान चतुर्मास (Current Stay)",
    status: "Active",
    event: "धवल सेना सह चातुर्मास प्रवास। युगप्रधान आचार्यश्री के पावन सान्निध्य में संघ की विविध गतिविधियाँ और आध्यात्मिक संगोष्ठियों का आयोजन हो रहा है।",
    coordinates: "27.65° N, 74.39° E"
  },
  {
    location: "केलावा, राजस्थान (Kelwa Base)",
    year: "2026 (विहार प्रवास)",
    status: "Completed",
    event: "तेरापंथ धर्मसंघ के उद्गम स्थल केलवा में मर्यादा पत्र लेखन दिवस के अवसर पर ऐतिहासिक प्रवास एवं मर्यादा महोत्सव की पावन शुरुआत।",
    coordinates: "25.13° N, 73.81° E"
  },
  {
    location: "पुणे, महाराष्ट्र",
    year: "2025 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "पुणे महानगर में ऐतिहासिक चातुर्मास। आईटी प्रोफेशनल्स, युवाओं और व्यावसायिक वर्ग के लिए विशेष अणुव्रत आचार संहिता और नैतिक मूल्य प्रशिक्षण।",
    coordinates: "18.52° N, 73.85° E"
  },
  {
    location: "सूरत, गुजरात (Diamond Hub)",
    year: "2024 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "व्यापारिक नैतिकता और ईमानदारी के संकल्पों पर केंद्रित ऐतिहासिक चातुर्मास। सूरत के हीरा उद्योगपति एवं व्यवसायियों द्वारा व्यसन मुक्ति संकल्प।",
    coordinates: "21.17° N, 72.83° E"
  },
  {
    location: "मुम्बई, महाराष्ट्र (नंदनवन)",
    year: "2023 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "महानगर मुम्बई में विराट चातुर्मास। व्यसन मुक्ति अभियान, पर्यावरण चेतना और अहिंसा यात्रा के विशेष प्रवचनों से लाखों लोगों में वैचारिक शुद्धि का संचार।",
    coordinates: "19.07° N, 72.87° E"
  },
  {
    location: "जयपुर, राजस्थान (Royal City)",
    year: "2022 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "राजस्थान की राजधानी जयपुर में भव्य आध्यात्मिक प्रवास। अहिंसा यात्रा के समापन समारोह के साथ विराट धर्मसभा का भव्य आयोजन।",
    coordinates: "26.91° N, 75.78° E"
  },
  {
    location: "नई दिल्ली (अध्यात्म साधना केंद्र)",
    year: "2021 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "राष्ट्र की राजधानी दिल्ली में अहिंसा यात्रा सह चातुर्मास प्रवास। राष्ट्रपति, प्रधानमंत्री और संसद सदस्यों सहित उच्च गणमान्य जनों से भेंटवार्ता।",
    coordinates: "28.61° N, 77.20° E"
  },
  {
    location: "हैदराबाद, तेलंगाना",
    year: "2020 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "दक्षिण भारत की ऐतिहासिक विरासत वाले शहर हैदराबाद में महामारी काल के नियमों के तहत संयमित, ऑनलाइन एवं डिजिटल संप्रसारित प्रवचन माला।",
    coordinates: "17.38° N, 78.48° E"
  },
  {
    location: "बेंगलुरु, कर्नाटक (IT City)",
    year: "2019 (चातुर्मास प्रवास)",
    status: "Completed",
    event: "आईटी हब बेंगलुरु में भव्य चातुर्मास। 'जीवन विज्ञान' एवं 'नैतिकता' का कॉरपोरेट जगत में समाकलन एवं युवाओं के लिए विशेष साधना शिविर।",
    coordinates: "12.97° N, 77.59° E"
  }
];

export default function ViharTracker() {
  const { activeCity } = useLocation();
  const [filterByActiveCity, setFilterByActiveCity] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'monk' | 'nun'>('all');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'timeline' | 'directory'>('list');
  const [cachedMapUrl, setCachedMapUrl] = useState<string | null>(null);
  const [mapDomain, setMapDomain] = useState({ x: [70, 90], y: [10, 32] });
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-15');
  const [viharData, setViharData] = useState<any>(viharPravasTodayData);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [sharedId, setSharedId] = useState<string | null>(null);

  const nearestViharPoint = useMemo(() => {
    if (!activeCity) return null;
    let closestPoint = null;
    let minDistance = Infinity;

    for (const point of ahimsaYatraData) {
      const dist = calculateDistance(activeCity.lat, activeCity.lng, point.lat, point.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = { ...point, distanceKm: dist };
      }
    }
    return closestPoint;
  }, [activeCity]);

  const connectionLineData = useMemo(() => {
    if (!activeCity || !nearestViharPoint) return [];
    return [
      { lat: activeCity.lat, lng: activeCity.lng, location: `📍 ${activeCity.name}`, distanceKm: 0, isUser: true },
      { lat: nearestViharPoint.lat, lng: nearestViharPoint.lng, location: `🏁 ${nearestViharPoint.location}`, distanceKm: nearestViharPoint.distanceKm, isTarget: true }
    ];
  }, [activeCity, nearestViharPoint]);

  const activeCityPointData = useMemo(() => {
    if (!activeCity) return [];
    return [{
      lat: activeCity.lat,
      lng: activeCity.lng,
      location: activeCity.name,
      year: 'My Location',
      isUser: true
    }];
  }, [activeCity]);

  const handleShare = (ascetic: any) => {
    let contactText = 'N/A';
    if (ascetic.contactsList && ascetic.contactsList.length > 0) {
      contactText = ascetic.contactsList.map((c: any) => `${c.name}: ${c.phone}`).join(', ');
    } else if (ascetic.contacts) {
      contactText = ascetic.contacts;
    } else if (ascetic.phone) {
      contactText = ascetic.phone;
    }
    
    const shareText = `📍 जैन श्वेतांबर तेरापंथ विहार अपडेट (${selectedDate})\n\nसाधु/साध्वी: ${ascetic.title ? ascetic.title + ' ' : ''}${ascetic.name}\nठाणा: ${ascetic.thana}\nस्थान: ${ascetic.location}\nक्षेत्र: ${ascetic.regionLabel}\nसंपर्क सूत्र: ${contactText}\n\nतेरापंथ एआई ऐप के माध्यम से साझा किया गया।`;
    
    if (navigator.share) {
      navigator.share({
        title: 'तेरापंथ विहार अपडेट',
        text: shareText,
        url: window.location.href
      })
      .then(() => {
        setSharedId(ascetic.id);
        setTimeout(() => setSharedId(null), 2000);
      })
      .catch(err => {
        console.warn('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          setSharedId(ascetic.id);
          setTimeout(() => setSharedId(null), 2000);
        })
        .catch(err => {
          console.error('Failed to copy share text: ', err);
        });
    }
  };

  useEffect(() => {
    const fetchViharData = async () => {
      setLoadingData(true);
      try {
        const docRef = doc(db, "vihar_records", selectedDate);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setViharData(docSnap.data());
        } else {
          // Fallback to local static dataset with simulated modifications if the date is different from 2026-07-15
          if (selectedDate === '2026-07-15') {
            setViharData(viharPravasTodayData);
          } else {
            // Construct a dynamic dataset derived from 2026-07-15 but customized for the selected date
            const simulatedData = JSON.parse(JSON.stringify(viharPravasTodayData));
            simulatedData.date = selectedDate;
            
            // Compute days difference to simulate progression
            const daysDiff = Math.round((new Date(selectedDate).getTime() - new Date('2026-07-15').getTime()) / (1000 * 3600 * 24));
            
            if (!isNaN(daysDiff) && daysDiff !== 0) {
              const regions = simulatedData.regions;
              Object.keys(regions).forEach(regionKey => {
                if (regionKey === 'Other_Regions') return;
                const saintsList = regions[regionKey];
                if (Array.isArray(saintsList)) {
                  saintsList.forEach((monk: any) => {
                    const direction = daysDiff > 0 ? "विहार प्रगतिशील" : "पूर्व ठहराव";
                    const magnitude = Math.abs(daysDiff);
                    // Dynamic location simulation
                    monk.location = `${monk.location} (${direction} ${magnitude > 1 ? magnitude + ' दिन' : '१ दिन'})`;
                  });
                }
              });
              // Also simulate Acharya location change if applicable
              if (simulatedData.acharya_vihar) {
                const direction = daysDiff > 0 ? "आगे विहार" : "पिछला पड़ाव";
                const magnitude = Math.abs(daysDiff);
                simulatedData.acharya_vihar.location = `${simulatedData.acharya_vihar.location} (${direction} ${magnitude} दिन)`;
              }
            }
            setViharData(simulatedData);
          }
        }
      } catch (error) {
        console.warn("Error fetching Vihar data from Firestore, falling back to local dataset:", error);
        // On error, construct the simulated or standard fallback
        if (selectedDate === '2026-07-15') {
          setViharData(viharPravasTodayData);
        } else {
          const simulatedData = JSON.parse(JSON.stringify(viharPravasTodayData));
          simulatedData.date = selectedDate;
          const daysDiff = Math.round((new Date(selectedDate).getTime() - new Date('2026-07-15').getTime()) / (1000 * 3600 * 24));
          if (!isNaN(daysDiff) && daysDiff !== 0) {
            const regions = simulatedData.regions;
            Object.keys(regions).forEach(regionKey => {
              if (regionKey === 'Other_Regions') return;
              const saintsList = regions[regionKey];
              if (Array.isArray(saintsList)) {
                saintsList.forEach((monk: any) => {
                  const direction = daysDiff > 0 ? "विहार प्रगतिशील" : "पूर्व ठहराव";
                  const magnitude = Math.abs(daysDiff);
                  monk.location = `${monk.location} (${direction} ${magnitude > 1 ? magnitude + ' दिन' : '१ दिन'})`;
                });
              }
            });
            if (simulatedData.acharya_vihar) {
              const direction = daysDiff > 0 ? "आगे विहार" : "पिछला पड़ाव";
              const magnitude = Math.abs(daysDiff);
              simulatedData.acharya_vihar.location = `${simulatedData.acharya_vihar.location} (${direction} ${magnitude} दिन)`;
            }
          }
          setViharData(simulatedData);
        }
      } finally {
        setLoadingData(false);
      }
    };
    fetchViharData();
  }, [selectedDate]);

  const handleZoomCurrent = () => {
    if (activeCity && nearestViharPoint) {
      const minLng = Math.min(activeCity.lng, nearestViharPoint.lng) - 1.5;
      const maxLng = Math.max(activeCity.lng, nearestViharPoint.lng) + 1.5;
      const minLat = Math.min(activeCity.lat, nearestViharPoint.lat) - 1.5;
      const maxLat = Math.max(activeCity.lat, nearestViharPoint.lat) + 1.5;
      setMapDomain({ x: [minLng, maxLng], y: [minLat, maxLat] });
    } else {
      setMapDomain({ x: [71, 78], y: [24, 30] });
    }
  };

  const handleZoomFull = () => {
    setMapDomain({ x: [70, 90], y: [10, 32] });
  };

  // Automatically frame the map to show the connection between activeCity and nearestViharPoint
  useEffect(() => {
    if (activeCity && nearestViharPoint) {
      const minLng = Math.min(activeCity.lng, nearestViharPoint.lng) - 2.5;
      const maxLng = Math.max(activeCity.lng, nearestViharPoint.lng) + 2.5;
      const minLat = Math.min(activeCity.lat, nearestViharPoint.lat) - 2.5;
      const maxLat = Math.max(activeCity.lat, nearestViharPoint.lat) + 2.5;
      setMapDomain({ x: [minLng, maxLng], y: [minLat, maxLat] });
    }
  }, [activeCity, nearestViharPoint]);

  const masterPravasInfo = useMemo(() => {
    const activeData = viharData || viharPravasTodayData;
    const acharyaName = activeData.acharya_vihar?.name || viharPravasTodayData.acharya_vihar.name;
    const acharyaLocation = activeData.acharya_vihar?.location || viharPravasTodayData.acharya_vihar.location;
    const acharyaContact = activeData.acharya_vihar?.contact || viharPravasTodayData.acharya_vihar.contact;
    return {
      date: activeData.date || selectedDate,
      title: "भारतवर्ष में विराजित चारित्रात्माएं",
      acharyashriLocation: `परम पूज्य युगप्रधान ${acharyaName} अपनी धवलसेना के साथ ${acharyaLocation} में सानन्द सुखसातापूर्वक विराजमान हैं।`,
      shivirOfficeContact: {
        name: acharyaContact.split(':')[0]?.trim() || "हेमन्त बैद",
        phone: acharyaContact.split(':')[1]?.trim() || "7044448888"
      },
      organization: "जैन श्वेताम्बर तेरापंथी सभा, दिल्ली",
      headquarters: "अणुव्रत भवन, 210 दीनदयाल उपाध्याय मार्ग, नई दिल्ली-110002",
      orgContacts: activeData.delhi_sabha_general_contact || viharPravasTodayData.delhi_sabha_general_contact
    };
  }, [viharData, selectedDate]);

  useEffect(() => {
    const mapTileUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/India_location_map.svg/500px-India_location_map.svg.png';
    const initMapTile = async () => {
      const cachedBlob = await getCachedTile(mapTileUrl);
      if (cachedBlob) {
        setCachedMapUrl(URL.createObjectURL(cachedBlob));
      } else {
        try {
          const response = await fetch(mapTileUrl);
          const blob = await response.blob();
          await cacheTile(mapTileUrl, blob);
          setCachedMapUrl(URL.createObjectURL(blob));
        } catch (e) {
          console.error("Offline tile fetch failed, using fallback mode");
        }
      }
    };
    initMapTile();
  }, []);

  const allAscetics = useMemo(() => {
    const list: any[] = [];
    let index = 1;

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

    const formatName = (enName: string) => {
      if (nameMap[enName]) return nameMap[enName];
      let title = "";
      let nameHi = enName;
      if (enName.startsWith("Munishri ")) {
        nameHi = "मुनिश्री " + enName.replace("Munishri ", "").replace(" ji", " जी");
      } else if (enName.startsWith("Sadhvishri ")) {
        nameHi = "साध्वीश्री " + enName.replace("Sadhvishri ", "").replace(" ji", " जी");
      } else if (enName.startsWith("Dr. Munishri ")) {
        title = "डा.";
        nameHi = "मुनिश्री " + enName.replace("Dr. Munishri ", "").replace(" ji", " जी");
      } else if (enName.startsWith("Dr. Sadhvishri ")) {
        title = "डा.";
        nameHi = "साध्वीश्री " + enName.replace("Dr. Sadhvishri ", "").replace(" ji", " जी");
      }
      return { title, nameHi };
    };

    const standardRegions = ["Rajasthan", "Gujarat", "Maharashtra", "Karnataka", "TamilNadu", "Delhi_NCR"] as const;
    const regionLabels: Record<string, string> = {
      "Rajasthan": "राजस्थान",
      "Gujarat": "गुजरात",
      "Maharashtra": "महाराष्ट्र",
      "Karnataka": "कर्नाटक",
      "TamilNadu": "तमिलनाडु",
      "Delhi_NCR": "दिल्ली-NCR"
    };

    const activeViharData = viharData || viharPravasTodayData;

    standardRegions.forEach(regionKey => {
      const regionList = activeViharData.regions?.[regionKey] || [];
      regionList.forEach((saint: any) => {
        const { title, nameHi } = formatName(saint.name);
        
        let contactsList: Array<{ name: string; phone: string }> = [];
        if (saint.contacts) {
          contactsList = Object.entries(saint.contacts).map(([person, phone]) => ({
            name: person.replace(/_/g, ' '),
            phone: phone as string
          }));
        } else if (saint.contact) {
          contactsList = [{
            name: saint.contact_person || "प्रभारी",
            phone: saint.contact
          }];
        }

        let contactString = "कासीद विवरण अनुपलब्ध";
        if (contactsList.length > 0) {
          contactString = contactsList.map(c => `कासीद ${c.name} (${c.phone})`).join(", ");
        }

        list.push({
          id: `saint_${index++}`,
          title,
          name: nameHi,
          nameEn: saint.name,
          thana: saint.thana || 3,
          location: saint.location,
          address: saint.location,
          contacts: contactString,
          contactsList,
          phone: contactsList[0]?.phone || "",
          regionKey,
          regionLabel: regionLabels[regionKey],
          status: saint.location.includes("हॉस्पिटल") || saint.location.includes("स्वास्थ्य") ? "स्वास्थ्य लाभ हेतु" : "सक्रिय"
        });
      });
    });

    const otherRegions = activeViharData.regions?.Other_Regions || {};
    Object.entries(otherRegions).forEach(([subRegion, names]) => {
      if (Array.isArray(names)) {
        names.forEach(enName => {
          const { title, nameHi } = formatName(enName);
          list.push({
            id: `saint_${index++}`,
            title,
            name: nameHi,
            nameEn: enName,
            thana: 2,
            location: `${subRegion} प्रांत`,
            address: `${subRegion} प्रांत`,
            contacts: "कासीद विवरण अनुपलब्ध",
            contactsList: [],
            phone: "",
            regionKey: "Other_Regions",
            regionLabel: `अन्य (${subRegion})`,
            status: "सक्रिय"
          });
        });
      }
    });

    return list;
  }, [viharData]);

  const filteredAscetics = useMemo(() => {
    return allAscetics.filter(ascetic => {
      if (filterByActiveCity && activeCity) {
        const cityName = activeCity.name.toLowerCase();
        const cityRegion = activeCity.region.toLowerCase();
        
        const locMatch = 
          ascetic.location.toLowerCase().includes(cityName) || 
          ascetic.regionLabel.toLowerCase().includes(cityName) ||
          ascetic.location.toLowerCase().includes(cityRegion) ||
          ascetic.regionLabel.toLowerCase().includes(cityRegion) ||
          (cityName === 'delhi' && (ascetic.location.toLowerCase().includes('दिल्ली') || ascetic.regionLabel.toLowerCase().includes('दिल्ली'))) ||
          (cityRegion === 'delhi' && (ascetic.location.toLowerCase().includes('दिल्ली') || ascetic.regionLabel.toLowerCase().includes('दिल्ली')));
                         
        if (!locMatch) return false;
      }

      if (selectedState !== 'All' && ascetic.regionKey !== selectedState) {
        return false;
      }

      const matchesSearch = 
        ascetic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ascetic.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ascetic.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ascetic.regionLabel.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeFilter === 'monk') {
        return matchesSearch && (ascetic.name.includes('मुनि') || ascetic.name.includes('मुनिश्री'));
      }
      if (activeFilter === 'nun') {
        return matchesSearch && (ascetic.name.includes('साध्वी') || ascetic.name.includes('साध्वीश्री'));
      }
      return matchesSearch;
    });
  }, [allAscetics, selectedState, searchQuery, activeFilter, activeCity, filterByActiveCity]);

  const openInGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const regionsList = [
    { id: 'All', label: 'संपूर्ण भारत' },
    { id: 'Delhi_NCR', label: 'दिल्ली-NCR' },
    { id: 'Rajasthan', label: 'राजस्थान' },
    { id: 'Gujarat', label: 'गुजरात' },
    { id: 'Maharashtra', label: 'महाराष्ट्र' },
    { id: 'Karnataka', label: 'कर्नाटक' },
    { id: 'TamilNadu', label: 'तमिलनाडु' },
    { id: 'Other_Regions', label: 'अन्य क्षेत्र' }
  ];

  return (
    <div id="vihar_tracker_viewport" className="flex flex-col bg-gray-50 dark:bg-zinc-950">
      
      {/* 1. TOP HEADER INFOBAR */}
      <div id="vihar_header_container" className="bg-white dark:bg-zinc-900 p-4 shadow-sm border-b dark:border-zinc-800 shrink-0 space-y-3">
        <div id="vihar_header_row" className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 id="vihar_header_title" className="text-base sm:text-lg font-black text-gray-800 dark:text-zinc-100 flex items-center gap-2">
              <span>🗺️</span> {masterPravasInfo.title}
            </h2>
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold flex items-center gap-1.5 mt-0.5">
              <span>तिथि चयन करें:</span>
              <span className="font-mono bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-350 px-1.5 py-0.5 rounded text-[9px]">{masterPravasInfo.date} अपडेट</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Custom Interactive Date Picker Input */}
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
            />

            {/* Quick Select Chips */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedDate('2026-07-14')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                  selectedDate === '2026-07-14'
                    ? 'bg-stone-700 text-white border-stone-700 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-850 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:bg-stone-50'
                }`}
                title="१४ जुलाई २०२६ (विगत)"
              >
                विगत
              </button>
              <button
                onClick={() => setSelectedDate('2026-07-15')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                  selectedDate === '2026-07-15'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-zinc-850 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:bg-stone-50'
                }`}
                title="१५ जुलाई २०२६ (आज)"
              >
                आज
              </button>
              <button
                onClick={() => setSelectedDate('2026-07-16')}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                  selectedDate === '2026-07-16'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white dark:bg-zinc-850 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:bg-stone-50'
                }`}
                title="१६ जुलाई २०२६ (आगामी)"
              >
                आगामी
              </button>
            </div>
          </div>
        </div>
        <p id="vihar_acharyashri_location_text" className="text-xs text-amber-600 dark:text-amber-400 font-semibold leading-normal mb-2">
          📢 {masterPravasInfo.acharyashriLocation}
        </p>
        
        {/* 🏢 Organization & Contacts info box */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-1 text-[11px] text-gray-500 dark:text-zinc-400">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-extrabold text-gray-700 dark:text-zinc-300">🏛️ {masterPravasInfo.organization}</span>
            <span className="text-gray-400 dark:text-zinc-400 select-all font-medium sm:text-right">मुख्यालय: {masterPravasInfo.headquarters}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
            <span className="font-bold text-gray-650 dark:text-zinc-300">📞 सभा संपर्क:</span>
            {masterPravasInfo.orgContacts.map((phone, idx) => (
              <a key={phone} href={`tel:${phone}`} className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-black select-all">
                {phone}{idx < masterPravasInfo.orgContacts.length - 1 ? "," : ""}
              </a>
            ))}
            <span className="text-gray-300 dark:text-zinc-700 hidden sm:inline">|</span>
            <span className="font-bold text-gray-650 dark:text-zinc-300">शिविर प्रभारी:</span>
            <a href={`tel:${masterPravasInfo.shivirOfficeContact.phone}`} className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-black">
              {masterPravasInfo.shivirOfficeContact.name} ({masterPravasInfo.shivirOfficeContact.phone})
            </a>
          </div>
        </div>
      </div>

      {/* 2. LIVE SEARCH & FILTER CONTROLS */}
      <div id="vihar_controls_container" className="bg-white dark:bg-zinc-900 p-3 border-b dark:border-zinc-800 shrink-0 space-y-3 z-10 shadow-sm">
        {/* Search Bar */}
        <div id="vihar_search_wrapper" className="relative">
          <input
            id="vihar_search_input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाम, प्रांत या क्षेत्र खोजें (जैसे: उदित कुमार, गुजरात)..."
            className="w-full p-3 pl-10 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-emerald-500 dark:text-zinc-100 transition-colors"
          />
          <span id="vihar_search_icon_marker" className="absolute left-3 top-3.5 text-gray-400 text-sm">🔍</span>
          {searchQuery && (
            <button 
              id="vihar_search_clear_btn"
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* State Selector Chip Row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0 border-t dark:border-zinc-800 pt-2.5 mt-1 -mx-3 px-3">
          {regionsList.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setSelectedState(reg.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedState === reg.id 
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300 dark:border-amber-900/50' 
                  : 'bg-stone-50 border border-stone-200 text-stone-600 dark:bg-zinc-850 dark:border-zinc-700 dark:text-zinc-350 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Active City Filter Toggle */}
        {activeCity && (
          <div className="flex items-center justify-between p-3 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-900/20 rounded-2xl gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-950/40 rounded-lg text-orange-500">
                <MapPin size={14} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                  {activeCity.name} विहार अपडेट्स
                </span>
                <span className="text-[9px] text-stone-500 dark:text-stone-400">
                  {filterByActiveCity ? "केवल आपके शहर/प्रांत के विहार दिखाए जा रहे हैं" : "सभी अखिल भारतीय विहार प्रदर्शित हैं"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setFilterByActiveCity(!filterByActiveCity)}
              className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer shrink-0 ${
                filterByActiveCity 
                  ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600' 
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200'
              }`}
            >
              {filterByActiveCity ? "सभी दिखाएं" : "लोकल फ़िल्टर"}
            </button>
          </div>
        )}

        {/* Tab Filters */}
        <div id="vihar_filter_tabs_row" className="flex gap-2">
          <button
            id="vihar_filter_btn_all"
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeFilter === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200/60'
            }`}
          >
            सभी ({filteredAscetics.length})
          </button>
          <button
            id="vihar_filter_btn_monks"
            onClick={() => setActiveFilter('monk')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeFilter === 'monk' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200/60'
            }`}
          >
            मुनिश्री
          </button>
          <button
            id="vihar_filter_btn_nuns"
            onClick={() => setActiveFilter('nun')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeFilter === 'nun' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200/60'
            }`}
          >
            साध्वीश्री
          </button>
        </div>
        {/* View Mode Toggle */}
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`py-2 text-[9px] sm:text-[10px] font-black rounded-lg transition-all cursor-pointer text-center ${
              viewMode === 'list' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
            }`}
          >
            📋 सूची (List)
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`py-2 text-[9px] sm:text-[10px] font-black rounded-lg transition-all cursor-pointer text-center ${
              viewMode === 'map' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
            }`}
          >
            🗺️ नक़्शा (Map)
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`py-2 text-[9px] sm:text-[10px] font-black rounded-lg transition-all cursor-pointer text-center ${
              viewMode === 'timeline' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
            }`}
          >
            📈 यात्रा (Path)
          </button>
          <button
            onClick={() => setViewMode('directory')}
            className={`py-2 text-[9px] sm:text-[10px] font-black rounded-lg transition-all cursor-pointer text-center ${
              viewMode === 'directory' ? 'bg-orange-600 text-white shadow-xs' : 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100/50'
            }`}
          >
            📖 प्रवास (July 26)
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div id="vihar_scroll_list_main" className="flex-1 bg-gray-50 dark:bg-zinc-950 relative pb-28">
        {viewMode === 'map' ? (
          <div className="w-full h-[500px] p-4 flex flex-col relative">
            <h3 className="font-bold text-gray-800 dark:text-zinc-100 mb-2">Ahimsa Yatra Historical Path (2015-2027)</h3>
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 relative overflow-hidden">
              {/* Render Offline Map Background if cached */}
              {cachedMapUrl && (
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `url(${cachedMapUrl})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              )}
              
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" dataKey="lng" name="Longitude" domain={mapDomain.x} hide />
                  <YAxis type="number" dataKey="lat" name="Latitude" domain={mapDomain.y} hide />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter 
                    name="Path" 
                    data={ahimsaYatraData} 
                    line={{stroke: '#10b981', strokeWidth: 2}} 
                    shape="circle" 
                    fill="#047857"
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  >
                    <LabelList dataKey="location" position="top" style={{fontSize: '11px', fill: '#374151', fontWeight: 'bold'}} />
                  </Scatter>

                  {connectionLineData.length > 0 && (
                    <Scatter 
                      name="Distance Connection" 
                      data={connectionLineData} 
                      line={{ stroke: '#ea580c', strokeDasharray: '6 4', strokeWidth: 2 }} 
                      shape="circle" 
                      fill="#ea580c"
                    />
                  )}

                  {activeCityPointData.length > 0 && (
                    <Scatter 
                      name="Your Location" 
                      data={activeCityPointData} 
                      shape="circle" 
                      fill="#ea580c"
                    >
                      <LabelList dataKey="location" position="bottom" style={{ fontSize: '11px', fill: '#ea580c', fontWeight: 'extrabold' }} />
                    </Scatter>
                  )}
                </ScatterChart>
              </ResponsiveContainer>

              {/* Nearest Path Info Overlay Card */}
              {activeCity && nearestViharPoint && (
                <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-orange-200/40 dark:border-orange-900/20 z-20 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400 font-extrabold text-[11px] tracking-wide uppercase">
                    <span className="p-1 bg-orange-100 dark:bg-orange-950/40 rounded-lg">
                      🗺️
                    </span>
                    <span>विहार पथ दूरी (Vihar Distance)</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-850 dark:text-stone-150">
                    {activeCity.name} से निकटतम विहार मार्ग
                  </h4>
                  <div className="mt-2 space-y-1 text-[11px]">
                    <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                      <span>निकटतम स्थल:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {nearestViharPoint.location} ({nearestViharPoint.year})
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                      <span>हवाई दूरी:</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {nearestViharPoint.distanceKm.toFixed(1)} किमी (km)
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-[9px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-zinc-800/50 p-1.5 rounded-xl">
                    युगप्रधान आचार्यश्री महाश्रमणजी की अहिंसा यात्रा के ऐतिहासिक पड़ाव से आपके वर्तमान शहर की दूरी दर्शाई गई है।
                  </div>
                </div>
              )}
              
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={handleZoomCurrent}
                  className="bg-white/90 dark:bg-zinc-850/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-200 dark:border-zinc-700 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  📍 Zoom to Current
                </button>
                <button
                  onClick={handleZoomFull}
                  className="bg-white/90 dark:bg-zinc-850/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  🗺️ Zoom to Full Path
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-3 text-center">
              Note: Offline map tiles are automatically cached via IndexedDB.
            </p>
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="p-4 space-y-4">
            {/* Acharya Timeline Header Card */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-serif">ॐ</div>
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md"> Barefoot Journey (अहिंसा यात्रा) </span>
              <h3 className="font-serif text-xl font-extrabold mt-1.5">आचार्यश्री महाश्रमणजी विहार पथ</h3>
              <p className="text-xs opacity-90 mt-1 leading-normal">
                परम पूज्य आचार्यश्री द्वारा अहिंसा, नैतिकता और नशामुक्ति के दिव्य संदेश के साथ की गई 50,000+ कि.मी. की पावन पदयात्रा एवं उसके उपरान्त के प्रवास स्थलों का प्रामाणिक विवरण।
              </p>
            </div>

            {/* Vertical Step Timeline Container */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-xs relative">
              <div className="absolute left-[29px] top-8 bottom-8 w-0.5 border-l-2 border-dashed border-stone-250 dark:border-zinc-700"></div>

              <div className="space-y-6 relative">
                {acharyaViharTimeline.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start relative">
                    <div className="relative z-10 flex items-center justify-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        step.status === 'Active'
                          ? 'bg-orange-500 text-white animate-pulse ring-4 ring-orange-100 dark:ring-orange-950/40'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {idx + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 bg-stone-50/50 dark:bg-zinc-850/50 hover:bg-stone-50/80 dark:hover:bg-zinc-800/80 transition-colors p-4 rounded-xl border border-stone-100 dark:border-zinc-800">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-extrabold text-stone-500 dark:text-zinc-400 uppercase tracking-wider bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          {step.year}
                        </span>
                        {step.status === 'Active' && (
                          <span className="text-[9px] font-black bg-orange-500 text-white px-1.5 py-0.2 rounded-md uppercase tracking-wider animate-pulse shrink-0">
                            CURRENT STAY
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-stone-900 dark:text-zinc-100 leading-snug">
                        {step.location}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-zinc-350 leading-relaxed mt-1.5">
                        {step.event}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-400 dark:text-zinc-500 font-mono">
                        <span>🗺️ Coordinates: {step.coordinates}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'directory' ? (
          <ViharDirectory />
        ) : (
          <div className="p-4 space-y-4">
            {filteredAscetics.length > 0 ? (
              filteredAscetics.map((ascetic) => (
                <div 
                  id={`ascetic_card_${ascetic.id}`}
                  key={ascetic.id} 
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-between hover:shadow-md dark:hover:bg-zinc-850/80 transition-shadow relative overflow-hidden"
                >
                  {/* Status Ribbon if medically applicable or special */}
                  {ascetic.status && ascetic.status.includes('स्वास्थ्य') && (
                    <div 
                      id={`ascetic_status_ribbon_${ascetic.id}`}
                      className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow-sm"
                    >
                      ❤️ {ascetic.status}
                    </div>
                  )}

                  <div>
                    <div id={`ascetic_thana_heading_${ascetic.id}`} className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        <span className={`w-1.5 h-1.5 rounded-full ${ascetic.status && ascetic.status.includes('स्वास्थ्य') ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                        ठाणा: {ascetic.thana}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {ascetic.regionLabel}
                      </span>
                    </div>

                    <h3 id={`ascetic_name_title_${ascetic.id}`} className="text-lg font-black text-gray-800 dark:text-zinc-100">
                      {ascetic.title && (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold block mb-0.5">{ascetic.title}</span>
                      )}
                      {ascetic.name}
                    </h3>

                    <div id={`ascetic_info_grid_${ascetic.id}`} className="mt-3 space-y-2 text-sm text-gray-600 dark:text-zinc-350">
                      <p className="flex items-start gap-2 font-bold text-gray-800 dark:text-zinc-200">
                        <span className="shrink-0 text-base">🏢</span>
                        <span>{ascetic.location}</span>
                      </p>
                      <p className="flex items-start gap-2 text-xs text-gray-500 dark:text-zinc-400 leading-normal">
                        <span className="shrink-0 text-[14px]">📍</span>
                        <span>{ascetic.address}</span>
                      </p>
                      
                      {ascetic.contactsList && ascetic.contactsList.length > 0 ? (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                          <p className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span>📞</span> स्थान संपर्क सूत्र (Kaseed / Contact)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ascetic.contactsList.map((contact, cIdx) => (
                              <div 
                                key={cIdx} 
                                className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-zinc-850/60 border border-gray-100 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-colors"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-extrabold text-gray-700 dark:text-zinc-200 truncate capitalize">
                                    {contact.name}
                                  </p>
                                  <p className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                                    {contact.phone}
                                  </p>
                                </div>
                                <a 
                                  href={`tel:${contact.phone}`}
                                  className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shrink-0"
                                  title={`कॉल करें: ${contact.name}`}
                                >
                                  📞
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="flex items-start gap-2 text-xs text-gray-500 dark:text-zinc-400">
                          <span className="shrink-0 text-[14px]">📞</span>
                          <span className="select-all font-mono">संपर्क: {ascetic.contacts}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div id={`ascetic_action_buttons_${ascetic.id}`} className="mt-5 pt-3 border-t border-gray-100 dark:border-zinc-800 flex gap-2">
                    <button 
                      id={`ascetic_maps_nav_btn_${ascetic.id}`}
                      onClick={() => openInGoogleMaps(`${ascetic.location}, ${ascetic.address}`)}
                      className="flex-1 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      📍 मैप पर देखें
                    </button>
                    {ascetic.phone && (
                      <a 
                        id={`ascetic_call_driver_btn_${ascetic.id}`}
                        href={`tel:${ascetic.phone}`}
                        className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center transition-colors px-4 cursor-pointer"
                      >
                        📞 कॉल संपर्क
                      </a>
                    )}
                    <button 
                      id={`ascetic_share_btn_${ascetic.id}`}
                      onClick={() => handleShare(ascetic)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer border shrink-0 ${
                        sharedId === ascetic.id
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/20" 
                          : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border-transparent hover:bg-gray-200 dark:hover:bg-zinc-700"
                      }`}
                      title="विवरण साझा करें"
                    >
                      {sharedId === ascetic.id ? <Check size={14} className="animate-pulse" /> : <Share2 size={14} />}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div id="no_ascetic_results_alert" className="text-center py-12 text-gray-400 dark:text-zinc-500 text-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-dashed border-gray-200 dark:border-zinc-850">
                ☀️ इस खोज के अनुकूल कोई चारित्रात्मा नहीं मिली।
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
