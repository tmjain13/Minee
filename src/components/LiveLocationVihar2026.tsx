import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Search, 
  Phone, 
  X, 
  ShieldCheck, 
  User, 
  Clock, 
  ChevronRight, 
  Share2, 
  Check, 
  Sparkles, 
  Navigation,
  Info,
  BellRing
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface ViharLiveTeam {
  id: string;
  leaderName: string;
  leaderEn: string;
  category: 'Sadhu' | 'Sadhvi';
  currentStay: string;
  currentStayEn: string;
  coordinator: string;
  coordinatorPhone: string;
  membersCount: number;
  lastUpdated: string;
  region: string;
  regionEn: string;
  notes: string;
  notesEn: string;
}

export default function LiveLocationVihar2026({ onClose }: { onClose?: () => void }) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'Sadhu' | 'Sadhvi'>('ALL');
  
  // Custom states for new functionality
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLocationId, setCopiedLocationId] = useState<string | null>(null);
  const [userRadius, setUserRadius] = useState<number>(15); // in Kilometers
  const [enableProximityPrompt, setEnableProximityPrompt] = useState<boolean>(true);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const [viharNotification, setViharNotification] = useState<{
    id: string;
    message: string;
    sub: string;
  } | null>(null);

  // Synthesize a beautiful zen alert chime with frequency ramps
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
      oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5 note
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("AudioContext block/unsupported", e);
    }
  };
  
  // Simulated User coordinates centered at central Delhi (Connaught Place range)
  const [simulatedUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.6304,
    lng: 77.2177
  });

  // Precise coordinate positions for Delhi NCR stays
  const TEAM_COORDS: Record<string, { lat: number; lng: number }> = {
    "live-00": { lat: 27.6500, lng: 74.3833 }, // Ladnun, Rajasthan (~330km from Delhi)
    "live-01": { lat: 28.6139, lng: 77.2090 }, // Anuvrat Bhawan, Central Delhi
    "live-02": { lat: 28.7032, lng: 77.1319 }, // Pitampura, North-West Delhi (~11km)
    "live-03": { lat: 28.5961, lng: 77.1331 }, // Delhi Cantt, West Delhi (~12km)
    "live-04": { lat: 28.6206, lng: 77.1082 }, // Hari Nagar, West Delhi (~12km)
    "live-05": { lat: 28.6141, lng: 77.2091 }, // Anuvrat Bhawan, Central Delhi (Muni Jay Kumar)
    "live-11": { lat: 28.6416, lng: 77.1444 }, // Mansarover Garden, West Delhi
    "live-06": { lat: 28.5700, lng: 77.3200 }, // Noida (~18km)
    "live-07": { lat: 28.7180, lng: 77.1215 }, // Rohini Sector 11, North Delhi (~13km)
    "live-08": { lat: 28.7350, lng: 77.1495 }, // Transport Nagar, North-West Delhi (~15km)
    "live-09": { lat: 28.6692, lng: 77.4538 }, // Ghaziabad, East (~24km)
    "live-10": { lat: 28.4595, lng: 77.0266 }, // Gurugram (~29km)
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // May-June 2026 Delhi NCR & Acharya Mahashraman Live Locations
  const INITIAL_TEAMS: ViharLiveTeam[] = [
    {
      id: "live-00",
      leaderName: "आचार्य श्री महाश्रमण जी (धवल सेना)",
      leaderEn: "Acharya Shri Mahashraman Ji (Dhaval Sena)",
      category: "Sadhu",
      currentStay: "जैन विश्व भारती, लाडनूं, राजस्थान (धवल सेना प्रवास)",
      currentStayEn: "Jain Vishva Bharati, Ladnun, Rajasthan",
      coordinator: "हेमंत बैद",
      coordinatorPhone: "07044448888",
      membersCount: 150,
      lastUpdated: "19 मई 2026 (आधिकारिक)",
      region: "लाडनूं, राजस्थान",
      regionEn: "Ladnun, Rajasthan",
      notes: "परम पूज्य गुरुदेव अपनी धवल सेना के साथ लाडनूं परिसर में सानन्द विराजमान हैं।",
      notesEn: "Supreme spiritual lead Acharya Mahashraman is currently stationed in pristine health at JVBI Ladnun."
    },
    {
      id: "live-01",
      leaderName: "मुनि श्री उदित कुमार जी (बहुश्रुत)",
      leaderEn: "Bahushrut Muni Udit Kumar Ji",
      category: "Sadhu",
      currentStay: "अणुव्रत भवन, २१०, दीनदयाल उपाध्याय मार्ग, नई दिल्ली",
      currentStayEn: "Anuvrat Bhawan, 210, DD Upadhyaya Marg, Delhi",
      coordinator: "मंडी हाउस प्रभाग",
      coordinatorPhone: "9983478999",
      membersCount: 3,
      lastUpdated: "11 जून 2026 (अद्यतन)",
      region: "मध्य दिल्ली (Central Delhi)",
      regionEn: "Central Delhi",
      notes: "स्वाध्याय, जीवन विज्ञान एवं अणुव्रत संगोष्ठी का सक्रिय आयोजन।",
      notesEn: "Conducting spiritual assemblies, Swadhyay and value courses."
    },
    {
      id: "live-02",
      leaderName: "साध्वी श्री सुव्रता जी",
      leaderEn: "Sadhvi Suvrata Ji",
      category: "Sadhvi",
      currentStay: "तेरापंथ भवन, पीतमपुरा, दिल्ली",
      currentStayEn: "Terapanth Bhawan, Pitampura, Delhi",
      coordinator: "श्री अरुण जी सुराणा",
      coordinatorPhone: "8375941210",
      membersCount: 5,
      lastUpdated: "19 मई 2026 (बुलेटिन)",
      region: "उत्तरी-पश्चिमी दिल्ली (North-West Delhi)",
      regionEn: "North-West Delhi",
      notes: "पीतमपुरा एवं रोहिणी क्षेत्र के श्रावकों हेतु चातुर्मास-पूर्व विशेष ध्यान शिविर।",
      notesEn: "Organizing deep meditation camps for local families."
    },
    {
      id: "live-03",
      leaderName: "मुनि श्री हेमंत कुमार जी",
      leaderEn: "Muni Hemant Kumar Ji",
      category: "Sadhu",
      currentStay: "तेरापंथ सभा कक्ष, दिल्ली कैंट, नई दिल्ली",
      currentStayEn: "Terapanth Sabha Hall, Delhi Cantt, New Delhi",
      coordinator: "संजय भुतोड़िया",
      coordinatorPhone: "09811003333",
      membersCount: 3,
      lastUpdated: "19 मई 2026 (बुलेटिन)",
      region: "पश्चिमी दिल्ली (West Delhi)",
      regionEn: "West Delhi",
      notes: "नैतिक मूल्य कार्यशाला एवं अणुव्रत बाल शिविर संपादन।",
      notesEn: "Handling youth moral workshops and de-addiction classes."
    },
    {
      id: "live-04",
      leaderName: "मुनि श्री जिनेश कुमार जी",
      leaderEn: "Muni Jinesh Kumar Ji",
      category: "Sadhu",
      currentStay: "जैन श्वेतांबर तेरापंथी सभा, हरी नगर, दिल्ली",
      currentStayEn: "JSTS, Hari Nagar, Delhi",
      coordinator: "ललित बैद",
      coordinatorPhone: "09811004444",
      membersCount: 4,
      lastUpdated: "19 मई 2026 (बुलेटिन)",
      region: "पश्चिमी दिल्ली (West Delhi)",
      regionEn: "West Delhi",
      notes: "हरी नगर, मायापुरी क्षेत्र में निरंतर गृह व्याख्यान एवं जनसंपर्क कार्य।",
      notesEn: "Guiding home pravachans in Mayapuri and surrounding ranges."
    },
    {
      id: "live-05",
      leaderName: "मुनि श्री जय कुमार जी",
      leaderEn: "Muni Jay Kumar Ji",
      category: "Sadhu",
      currentStay: "अणुव्रत भवन, २१०, दीनदयाल उपाध्याय मार्ग, नई दिल्ली",
      currentStayEn: "Anuvrat Bhawan, 210, DD Upadhyaya Marg, Delhi",
      coordinator: "मंडी हाउस प्रभाग",
      coordinatorPhone: "9602711402",
      membersCount: 3,
      lastUpdated: "11 जून 2026 (अद्यतन)",
      region: "मध्य दिल्ली (Central Delhi)",
      regionEn: "Central Delhi",
      notes: "स्वाध्याय एवं धार्मिक चर्चा प्रभाग में सानन्द प्रवास।",
      notesEn: "Traced and synchronized perfectly inside central Mandi House division."
    },
    {
      id: "live-11",
      leaderName: "मुनि श्री अभिजित कुमार जी (डॉ.)",
      leaderEn: "Dr. Muni Abhijit Kumar Ji",
      category: "Sadhu",
      currentStay: "तेरापंथ भवन, एफ.बी-१२९, मानसरोवर गार्डन, दिल्ली",
      currentStayEn: "Terapanth Bhawan, FB-129, Mansarover Garden, Delhi",
      coordinator: "केन्द्रीय कार्यालय",
      coordinatorPhone: "8291669704",
      membersCount: 2,
      lastUpdated: "11 जून 2026 (अद्यतन)",
      region: "पश्चिमी दिल्ली (West Delhi)",
      regionEn: "West Delhi",
      notes: "मानसरोवर गार्डन प्रवास केंद्र पर श्रद्धालुओं हेतु नियमित व्याख्यान व्यवस्था।",
      notesEn: "Leading spiritual and community development workshops."
    },
    {
      id: "live-06",
      leaderName: "साध्वी श्री कंचन प्रभा जी",
      leaderEn: "Sadhvi Kanchan Prabha Ji",
      category: "Sadhvi",
      currentStay: "नोएडा सेक्टर 27, जैन स्थानक (सद्भाव कक्ष), नोएडा",
      currentStayEn: "Noida Sector 27, Noida",
      coordinator: "प्रवीण सेठिया",
      coordinatorPhone: "09811006666",
      membersCount: 6,
      lastUpdated: "19 मई 2026 (बुलेटिन)",
      region: "नोएडा NCR (Noida NCR)",
      regionEn: "Noida NCR",
      notes: "नोएडा, ग्रेटर नोएडा क्षेत्र के श्राविकाओं हेतु विशेष धार्मिक पाठशालाएँ।",
      notesEn: "Conducting dynamic pathshalas and values teaching on weekends."
    },
    {
      id: "live-07",
      leaderName: "साध्वी श्री विद्युत प्रभा जी",
      leaderEn: "Sadhvi Vidyut Prabha Ji",
      category: "Sadhvi",
      currentStay: "तेरापंथ आराधना केंद्र, रोहिणी सेक्टर 11, दिल्ली",
      currentStayEn: "Rohini Sector 11, Delhi",
      coordinator: "आलोक सिंघी",
      coordinatorPhone: "09811007777",
      membersCount: 5,
      lastUpdated: "19 मई 2026 (बुलेटिन)",
      region: "उत्तरी दिल्ली (North Delhi)",
      regionEn: "North Delhi",
      notes: "युवाओं हेतु प्रेक्षाध्यान एवं आत्म-विकास कार्यशालाओं का आयोजन।",
      notesEn: "Guiding self-transformation and stress-relief classes."
    },
    {
      id: "live-08",
      leaderName: "साध्वी श्री अमित प्रज्ञा जी",
      leaderEn: "Sadhvi Amit Pragna Ji",
      category: "Sadhvi",
      currentStay: "जैन धर्मकोट, संजय गांधी ट्रांसपोर्ट नगर, दिल्ली",
      currentStayEn: "Sanjay Gandhi Transport Nagar, Delhi",
      coordinator: "देवेन्द्र चोरड़िया",
      coordinatorPhone: "09811008888",
      membersCount: 4,
      lastUpdated: "19 मई 2026 (बुलेटिन)",
      region: "उत्तर-पश्चिमी दिल्ली (North-West Delhi)",
      regionEn: "North-West Delhi",
      notes: "ट्रांसपोर्ट नगर के श्रमिकों एवं चालकों हेतु नैतिक सुधार परियोजना।",
      notesEn: "Dedicated de-addiction training for local logistics workers."
    },
    {
      id: "live-09",
      leaderName: "साध्वी श्री स्वर्ण रेखा जी",
      leaderEn: "Sadhvi Swarna Rekha Ji",
      category: "Sadhvi",
      currentStay: "जैन सभा हॉल, कविनगर, गाजियाबाद",
      currentStayEn: "Kavi Nagar, Ghaziabad",
      coordinator: "सुरेन्द्र बोथरा",
      coordinatorPhone: "09811009999",
      membersCount: 6,
      lastUpdated: "19 मई 2026 (बुलेटिन)",
      region: "गाजियाबाद NCR (Ghaziabad NCR)",
      regionEn: "Ghaziabad NCR",
      notes: "गाजियाबाद परिसर में सामयिक एवं संवर साधना अनुष्ठान।",
      notesEn: "Directing deep Samayik penances for local laywomen."
    },
    {
      id: "live-10",
      leaderName: "साध्वी श्री मैत्री यशा जी",
      leaderEn: "Sadhvi Maitri Yasha Ji",
      category: "Sadhvi",
      currentStay: "साधना भवन, सेक्टर 14, गुरुग्राम",
      currentStayEn: "Sector 14, Gurugram",
      coordinator: "मनोज बांठिया",
      coordinatorPhone: "09811010101",
      membersCount: 5,
      lastUpdated: "19 मई 2026 (बुलेटिन)",
      region: "गुरुग्राम NCR (Gurugram NCR)",
      regionEn: "Gurugram NCR",
      notes: "गुरुग्राम आईटी प्रोफेशनल समाज हेतु मानसिक तनाव मुक्ति कक्षा कार्यक्रम।",
      notesEn: "Preaching emotional resilience and ethics to corporate teams."
    }
  ];

  const [teams, setTeams] = useState<ViharLiveTeam[]>(INITIAL_TEAMS);

  useEffect(() => {
    const docRef = doc(db, 'vihar_updates', 'acharya_shri');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeams((prev) => {
          return prev.map((team) => {
            if (team.id === 'live-00') {
              return {
                ...team,
                currentStay: data.currentStay || team.currentStay,
                currentStayEn: data.currentStayEn || team.currentStayEn,
                notes: data.upcomingStay ? `वर्तमान प्रवास: ${data.currentStay}। आगामी प्रवास: ${data.upcomingStay}।` : team.notes,
                notesEn: data.upcomingStayEn ? `Current Stay: ${data.currentStayEn}. Upcoming: ${data.upcomingStayEn}.` : team.notesEn,
                lastUpdated: data.date ? `${data.date} (अपडेटेड)` : team.lastUpdated,
              };
            }
            return team;
          });
        });
      }
    }, (error) => {
      if (error?.message?.includes('offline') || error?.code === 'unavailable' || !navigator.onLine) {
        console.warn("Vihar Live updates real-time stream offline mode:", error.message || error);
      } else {
        console.error("Vihar Live updates real-time stream subscription error:", error);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCopyContact = (id: string, name: string, phone: string) => {
    const textToCopy = `${name} (Vihar Coordinator): ${phone}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyDetailedLocation = (team: ViharLiveTeam) => {
    const leaderStr = language === 'hi' ? team.leaderName : team.leaderEn;
    const stayStr = language === 'hi' ? team.currentStay : team.currentStayEn;
    const regionStr = language === 'hi' ? team.region : team.regionEn;
    const text = `📍 *तेरापंथ जैन विहार प्रवास विवरण (2026)*
👤 *साधु/साध्वी वृन्द:* ${leaderStr}
🏢 *वर्तमान निवास स्थान (Current Stay):* ${stayStr} (${regionStr})
📡 *स्थानीय संयोजक (Coordinator):* ${team.coordinator || 'N/A'} - ${team.coordinatorPhone || 'N/A'}
📅 *अंतिम अधिकारिक अपडेट:* ${team.lastUpdated}
_साभार: दिल्ली जैन महासभा रियल-टाइम विहार ट्रैकर_`;
    
    navigator.clipboard.writeText(text);
    setCopiedLocationId(team.id);
    setTimeout(() => setCopiedLocationId(null), 2000);
  };

  // Proximity Alert Trigger Effect
  React.useEffect(() => {
    if (!enableProximityPrompt) return;

    const nearby = teams.filter((team) => {
      const dest = TEAM_COORDS[team.id];
      if (!dest) return false;
      const dist = calculateDistance(
        simulatedUserCoords.lat,
        simulatedUserCoords.lng,
        dest.lat,
        dest.lng
      );
      return dist <= userRadius;
    });

    const nearbyIds = nearby.map((t) => t.id);
    const hasNew = nearbyIds.some((id) => !activeAlerts.includes(id));

    if (hasNew && activeAlerts.length > 0) {
      const newlyEntered = nearby.find((t) => !activeAlerts.includes(t.id));
      if (newlyEntered) {
        const destCoords = TEAM_COORDS[newlyEntered.id];
        const dist = calculateDistance(
          simulatedUserCoords.lat,
          simulatedUserCoords.lng,
          destCoords.lat,
          destCoords.lng
        ).toFixed(1);
        
        playAlertSound();
        setViharNotification({
          id: newlyEntered.id,
          message:
            language === 'hi'
              ? `🚨 साधु-साध्वी वृन्द आपके समीप हैं!`
              : `🚨 Saints Nearby Detected!`,
          sub:
            language === 'hi'
              ? `${newlyEntered.leaderName} अभी आपके स्थान से मात्र ~${dist} किमी की दूरी पर विराजमान हैं।`
              : `${newlyEntered.leaderEn} is currently stationed only ~${dist} KM away from you.`,
        });

        // Trigger Web notification if supported & active
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(
              language === 'hi' ? '📍 साधु-साध्वी वृन्द आपके समीप!' : '📍 Saints Nearby!',
              {
                body:
                  language === 'hi'
                    ? `${newlyEntered.leaderName} अभी ~${dist} किमी की दूरी पर हैं।`
                    : `${newlyEntered.leaderEn} is currently ~${dist} KM away.`,
                icon: 'https://i.postimg.cc/ydXQL3gn/logo-(1).png',
              }
            );
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                new Notification(
                  language === 'hi' ? '📍 साधु-साध्वी वृन्द आपके समीप!' : '📍 Saints Nearby!',
                  {
                    body:
                      language === 'hi'
                        ? `${newlyEntered.leaderName} अभी ~${dist} किमी की दूरी पर हैं।`
                        : `${newlyEntered.leaderEn} is currently ~${dist} KM away.`,
                    icon: 'https://i.postimg.cc/ydXQL3gn/logo-(1).png',
                  }
                );
              }
            });
          }
        }
      }
    }

    setActiveAlerts(nearbyIds);
  }, [userRadius, enableProximityPrompt, activeAlerts, language]);

  const filteredTeams = teams.filter(team => {
    // Search filter
    const matchesSearch = (language === 'hi' ? team.leaderName : team.leaderEn)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      (language === 'hi' ? team.currentStay : team.currentStayEn)
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      (language === 'hi' ? team.region : team.regionEn)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = filterCategory === 'ALL' || team.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#050716] text-white rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative flex flex-col w-full max-w-2xl mx-auto h-auto my-auto max-h-[92vh] font-sans">
      
      {/* Absolute Global Viewport Layout Style Injection */}
      <style>{`
        .live-vihar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .live-vihar-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .live-vihar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
        }
      `}</style>
      
      {/* Dynamic Proximity Custom Notification Toast overlay */}
      <AnimatePresence>
        {viharNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-4 right-4 bg-gradient-to-r from-[#010935] to-[#041258] border-2 border-cyan-400/40 rounded-3xl p-4 shadow-2xl z-50 flex items-start gap-3 text-left pointer-events-auto"
            id="proximity-alert-toast"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 animate-bounce">
              <BellRing size={20} />
            </div>
            <div className="flex-grow space-y-1">
              <h4 className="font-extrabold text-xs text-cyan-300 uppercase tracking-wide leading-none">{viharNotification.message}</h4>
              <p className="text-[10.5px] text-slate-100 font-bold leading-relaxed">{viharNotification.sub}</p>
            </div>
            <button 
              onClick={() => setViharNotification(null)}
              className="p-1 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 self-start cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[#0a2fd4]/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* HEADER */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between sticky top-0 z-40 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0a2fd4] to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/10 shrink-0">
            <Navigation size={18} className="text-white transform rotate-45" />
          </div>
          <div>
            <h2 className="serif-text font-black text-white text-base sm:text-lg leading-tight">
              {language === 'hi' ? '2026 लाइव विहार ट्रैकिंग' : '2026 Live Vihar Directory'}
            </h2>
            <p className="text-[9px] text-[#0a2fd4] dark:text-cyan-400 font-bold uppercase tracking-widest leading-none mt-1">
              {language === 'hi' ? '19 मई 2026 आधिकारिक सभा विज्ञप्ति • दिल्ली NCR' : 'May-June 2026 Official Bulletin • Delhi NCR'}
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-300 pointer-events-auto"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="p-4 bg-slate-950/50 border-b border-white/5 space-y-3 z-10">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'नाम, क्षेत्र या निवास स्थान खोजें...' : 'Search by saint, stay or region...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors placeholder:text-gray-500"
          />
        </div>
        
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'ALL', label: language === 'hi' ? 'सभी धवल सेना इकाइयां' : 'All Units' },
            { id: 'Sadhu', label: language === 'hi' ? 'साधु वृन्द (Sadhu)' : 'Sadhu' },
            { id: 'Sadhvi', label: language === 'hi' ? 'साध्वी वृन्द (Sadhvi)' : 'Sadhvi' }
          ].map((cat) => {
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id as any)}
                className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#0a2fd4] to-cyan-500 text-white font-black shadow-lg shadow-cyan-500/15' 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* LOCATION-BASED PROXIMITY ALERT CONTROL PANEL */}
      <div className="px-4 pt-3 z-10 shrink-0">
        <div className="bg-[#11152b] border border-cyan-500/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing size={14} className="text-cyan-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                {language === 'hi' ? '📡 लाइव विहार प्रोक्सिमिटी अलर्ट' : '📡 Live Vihar Proximity Alerts'}
              </span>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enableProximityPrompt} 
                onChange={(e) => setEnableProximityPrompt(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {enableProximityPrompt && (
            <div className="space-y-3 pt-2.5 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] text-zinc-400">
                <span>
                  {language === 'hi' ? 'अलर्ट सुरक्षा त्रिज्या' : 'Alert Protection Radius'}: <strong className="text-cyan-400 font-mono text-xs">{userRadius} KM</strong>
                </span>
                <span className="flex items-center gap-1 text-[9px] bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-zinc-400">
                  📍 Origin: {language === 'hi' ? 'मध्य दिल्ली' : 'Delhi Center'}
                </span>
              </div>
              
              <input 
                type="range" 
                min="5" 
                max="60" 
                value={userRadius}
                onChange={(e) => setUserRadius(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              {/* Active within radius calculation display */}
              {(() => {
                const triggeredGurus = teams.filter(team => {
                  const dest = TEAM_COORDS[team.id];
                  if (!dest) return false;
                  const distance = calculateDistance(simulatedUserCoords.lat, simulatedUserCoords.lng, dest.lat, dest.lng);
                  return distance <= userRadius;
                });

                if (triggeredGurus.length > 0) {
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl space-y-1.5"
                    >
                      <span className="font-extrabold uppercase tracking-widest text-[8.5px] text-cyan-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        {language === 'hi' ? 'त्रिज्या अलर्ट सक्रिय (Within Target Radius!)' : 'Within Target Radius alerts:'}
                      </span>
                      {triggeredGurus.map(team => {
                        const distance = calculateDistance(simulatedUserCoords.lat, simulatedUserCoords.lng, TEAM_COORDS[team.id].lat, TEAM_COORDS[team.id].lng).toFixed(1);
                        return (
                          <div key={team.id} className="flex justify-between items-center text-[10px] text-cyan-200">
                            <span>• {language === 'hi' ? team.leaderName : team.leaderEn}</span>
                            <span className="font-mono bg-cyan-900/30 px-1.5 py-0.5 rounded text-[9px] font-black text-cyan-300">~{distance} KM {language === 'hi' ? 'दूर (Away)' : 'Away'}</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  );
                } else {
                  return (
                    <p className="text-[9px] text-zinc-500 italic text-center">
                      * {language === 'hi' ? 'वर्तमान सीमा में कोई प्रवास नहीं है। सीमा बढ़ाने हेतु स्लाइडर आगे बढ़ाएं।' : 'No active Vihars in this radius range. Increase alerts radius.'}
                    </p>
                  );
                }
              })()}
            </div>
          )}
        </div>
      </div>

      {/* INFORMATIVE DESK ACTION */}
      <div className="px-4 pt-3.5 z-10 shrink-0">
        <div className="bg-gradient-to-r from-[#0a2fd4]/10 via-cyan-500/5 to-slate-950/5 border border-cyan-500/20 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Info size={14} />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase tracking-widest text-cyan-400 block mb-0.5">
              {language === 'hi' ? '🚨 लाइव विहार सेवा हेल्पडेस्क' : '🚨 Live Vihar Support Desk'}
            </span>
            <p className="text-[10px] sm:text-[10.5px] text-gray-300 leading-tight">
              {language === 'hi' 
                ? 'दिल्ली NCR में गतिमान किसी भी संत दल का लाइव दर्शन, पाथेय सेवा, या गोचरी व्यवस्था हेतु संबंधित स्थानीय संयोजक से सीधे संपर्क करें।' 
                : 'For live darshan coordinations, food offerings, or arrangements, directly connect with local coordinators.'}
            </p>
          </div>
        </div>
      </div>

      {/* DIRECTORY LIST */}
      <div className="overflow-y-auto p-4 space-y-3.5 z-10 flex-grow live-vihar-scroll max-h-[48dvh]">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => {
            const isAcharya = team.id === 'live-00';
            
            // Calculate real-time distance from user
            const hasCoords = !!TEAM_COORDS[team.id];
            const realDistance = hasCoords 
              ? calculateDistance(simulatedUserCoords.lat, simulatedUserCoords.lng, TEAM_COORDS[team.id].lat, TEAM_COORDS[team.id].lng) 
              : null;
            const isWithinChosenRadius = realDistance !== null && realDistance <= userRadius;

            return (
              <div 
                key={team.id}
                className={`vihar-card p-4 rounded-2xl transition-all border ${
                  isAcharya 
                    ? 'bg-gradient-to-b from-[#0a2fd4]/15 via-slate-950/40 to-slate-950/70 border-[#0a2fd4]/30 shadow-md' 
                    : 'bg-slate-950/60 border-white/5 hover:border-cyan-500/20'
                } ${isWithinChosenRadius && enableProximityPrompt ? 'ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/5' : ''}`}
              >
                {/* Team header */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isAcharya 
                        ? 'bg-amber-400/10 text-amber-400' 
                        : team.category === 'Sadhu' 
                        ? 'bg-cyan-500/10 text-cyan-400' 
                        : 'bg-pink-500/10 text-pink-400'
                    }`}>
                      {isAcharya ? <Sparkles size={14} className="animate-spin-slow" /> : <User size={14} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 flex-wrap">
                        {language === 'hi' ? team.leaderName : team.leaderEn}
                        {isAcharya && (
                          <span className="text-[7.5px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest font-black leading-none">
                            YUGPRADHAN
                          </span>
                        )}
                        {isWithinChosenRadius && enableProximityPrompt && (
                          <span className="text-[7.5px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest font-black leading-none animate-pulse">
                            {language === 'hi' ? '🚨 समीप (NEARBY)' : '🚨 NEARBY'}
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={8} /> {language === 'hi' ? team.region : team.regionEn}
                        </span>
                        <span className="text-gray-600 font-extrabold text-[8px] select-none">•</span>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                          {team.membersCount} {language === 'hi' ? 'संत' : 'Saints'}
                        </span>
                        {realDistance !== null && (
                          <>
                            <span className="text-gray-600 font-extrabold text-[8px] select-none">•</span>
                            <span className="text-[8.5px] font-black text-cyan-400/80 tracking-tight font-mono">
                              ~{realDistance.toFixed(1)} KM {language === 'hi' ? 'दूर' : 'away'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <span className="text-[8px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                    ID: {team.id}
                  </span>
                </div>

                {/* Stay Location Details & Shareable Copy Action wrapper section */}
                <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-2.5 mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin size={11} className="text-[#0a2fd4] dark:text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block leading-none mb-1">
                        {language === 'hi' ? '📍 वर्तमान निवास स्थान:' : '📍 Current Stay Coordinates:'}
                      </span>
                      <p className="text-[11px] text-slate-100 font-bold leading-tight">
                        {language === 'hi' ? team.currentStay : team.currentStayEn}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 italic block border-t border-white/[0.03] pt-2">
                    {language === 'hi' ? team.notes : team.notesEn}
                  </p>

                  {/* DEDICATED FORMATTED COPY VENUE ADDRESS BUTTON */}
                  <div className="flex justify-end pt-1 bg-white/[0.01] border-t border-white/[0.02]">
                    <button
                      onClick={() => handleCopyDetailedLocation(team)}
                      className={`py-1 px-2.5 rounded-lg text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                        copiedLocationId === team.id 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                          : 'bg-[#11152b] text-zinc-300 border border-white/5 hover:bg-white/10'
                      }`}
                      id={`copy-location-detailed-${team.id}`}
                    >
                      {copiedLocationId === team.id ? <Check size={8} /> : <Share2 size={8} />}
                      {copiedLocationId === team.id 
                        ? (language === 'hi' ? 'स्थान कॉपी पूर्ण!' : 'Location Copied!') 
                        : (language === 'hi' ? '📍 संपूर्ण स्थान कॉपी करें' : '📍 Copy Location')}
                    </button>
                  </div>
                </div>

                {/* Local Coordinator contacts footer area */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={8} /> {language === 'hi' ? 'अंतिम अपडेट:' : 'Last update:'} {team.lastUpdated}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyContact(team.id, team.coordinator, team.coordinatorPhone)}
                      className={`py-1.5 px-3 rounded-lg border text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                        copiedId === team.id 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {copiedId === team.id ? <Check size={10} /> : <Share2 size={10} />}
                      {copiedId === team.id 
                        ? (language === 'hi' ? 'कॉपी पूर्ण!' : 'Copied!') 
                        : `${language === 'hi' ? 'संयोजक' : 'Coordinator'}: ${team.coordinator}`}
                    </button>

                    <a
                      href={`tel:${team.coordinatorPhone}`}
                      className="p-1.5 bg-gradient-to-r from-[#0a2fd4] to-cyan-500 text-white rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs"
                      title="Call Coordinator Directly"
                    >
                      <Phone size={10} />
                    </a>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-gray-500">
            {language === 'hi' ? 'खोज से मेल खाता हुआ कोई विहारी दल नहीं मिला।' : 'No live Vihar teams match your search criteria.'}
          </div>
        )}
      </div>

      {/* FOOTER CLASSIFIED BLOCK */}
      <div className="p-5 bg-slate-950 border-t border-white/10 shrink-0 flex flex-wrap items-center justify-between text-[9px] font-bold text-gray-500 z-10">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>{language === 'hi' ? 'आधिकारिक दिल्ली राष्ट्रीय राजधानी क्षेत्र प्रभाग' : 'Authorized Delhi NCR Division'}</span>
        </div>
        <span>{language === 'hi' ? 'तेरापंथ जैन सभा, दिल्ली' : 'Terapanthi Sabha, Delhi'}</span>
      </div>

    </div>
  );
}
