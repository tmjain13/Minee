import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import SunCalc from 'suncalc';
import { Sun, Moon, MapPin, CalendarDays, Search, Globe, Loader2, Sparkles, ChevronDown, ChevronUp, Info, Check, Clock, Waves, Copy, Timer, RotateCcw, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
const confetti = (...args: any[]) => {};
import { FESTIVALS_2026_2027 } from '../data/panchang';
import { safeStringify } from '../lib/safe-json';

const monthNames = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'];

export default function SunriseSunset() {
  const [date, setDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('default-location');
    try {
        const parsed = saved ? JSON.parse(saved) : null;
        return (parsed && parsed.lat && parsed.lng) ? parsed : { lat: 28.6139, lng: 77.2090, name: 'Delhi' };
    } catch {
        return { lat: 28.6139, lng: 77.2090, name: 'Delhi' };
    }
  });

  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('default-location', safeStringify(location));
  }, [location]);
  const [calendarType, setCalendarType] = useState<'Gregorian' | 'Vikrami'>('Gregorian');
  
  // Timer State
  const [timerTime, setTimerTime] = useState(48 * 60); // 48 mins for Samayik
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerPreset, setTimerPreset] = useState<number | null>(48);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime(prev => prev - 1);
      }, 1000);
    } else if (timerTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ea580c', '#fbbf24']
      });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [timezone, setTimezone] = useState<string>(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    return tz === 'Asia/Calcutta' ? 'Asia/Kolkata' : tz;
  });
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showTithiInfo, setShowTithiInfo] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const allTimezones = useMemo(() => {
    return Intl.supportedValuesOf('timeZone').map(tz => tz === 'Asia/Calcutta' ? 'Asia/Kolkata' : tz);
  }, []);
  const filteredTimezones = useMemo(() => {
    return allTimezones.filter(tz => tz.toLowerCase().includes(timezoneSearch.toLowerCase()));
  }, [allTimezones, timezoneSearch]);
  
  const timezoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timezoneRef.current && !timezoneRef.current.contains(event.target as Node)) {
        setShowTimezoneDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Terapanth Rules: Add 3 mins to sunrise, subtract 3 mins from sunset
  const times = SunCalc.getTimes(date, location.lat, location.lng);
  
  const panchangSunrise = new Date(times.sunrise.getTime() + 3 * 60000);
  const panchangSunset = new Date(times.sunset.getTime() - 3 * 60000);

  // Spiritual Offsets
  const navkarsi = new Date(panchangSunrise.getTime() + 48 * 60000);
  
  const dayLength = panchangSunset.getTime() - panchangSunrise.getTime();
  const paurushi = new Date(panchangSunrise.getTime() + (dayLength / 4));

  // Prahar Calculation
  const calculatePrahar = useCallback(() => {
    const now = currentTime.getTime();
    const sunrise = panchangSunrise.getTime();
    const sunset = panchangSunset.getTime();
    
    const dayLength = sunset - sunrise;
    const dayPraharLength = dayLength / 4;
    
    const nextSunrise = sunrise + 24 * 60 * 60 * 1000;
    const nightLength = nextSunrise - sunset;
    const nightPraharLength = nightLength / 4;

    if (now >= sunrise && now < sunset) {
      // Day Prahars
      const elapsed = now - sunrise;
      const praharNum = Math.floor(elapsed / dayPraharLength) + 1;
      return { type: 'Day', num: praharNum, label: `${praharNum}${praharNum === 1 ? 'st' : praharNum === 2 ? 'nd' : praharNum === 3 ? 'rd' : 'th'} Prahar (Day)` };
    } else {
      // Night Prahars
      let elapsed;
      if (now >= sunset) {
        elapsed = now - sunset;
      } else {
        // Between midnight and sunrise
        const prevSunset = sunset - 24 * 60 * 60 * 1000;
        elapsed = now - prevSunset;
      }
      const praharNum = Math.floor(elapsed / nightPraharLength) + 1;
      return { type: 'Night', num: praharNum, label: `${praharNum}${praharNum === 1 ? 'st' : praharNum === 2 ? 'nd' : praharNum === 3 ? 'rd' : 'th'} Prahar (Night)` };
    }
  }, [currentTime, panchangSunrise, panchangSunset]);

  const currentPrahar = calculatePrahar();

  const formatTime = (d: Date) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: timezone
      }).format(d);
    } catch (e) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setDate(new Date(e.target.value));
    }
  };

  const getTithiInfo = () => {
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const dateString = `${day} ${month} ${year}`;
    
    const festivalsToday = FESTIVALS_2026_2027.filter(f => f.date === dateString);
    if (festivalsToday.length > 0) {
      return { tithi: festivalsToday[0].tithi, name: festivalsToday[0].name, isApprox: false };
    }

    const phase = SunCalc.getMoonIllumination(panchangSunrise).phase;
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

    return { tithi: `${paksha} पक्ष, ${tithiName}`, name: '', isApprox: true };
  };

  const tithiData = getTithiInfo();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`);
          const data = await res.json();
          setSearchResults(data);
          setShowDropdown(true);
        } catch (error) {
          console.error('Error fetching location:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectLocation = (place: any) => {
    const nameParts = [];
    if (place.address) {
      if (place.address.city || place.address.town || place.address.village) {
        nameParts.push(place.address.city || place.address.town || place.address.village);
      } else if (place.address.county) {
        nameParts.push(place.address.county);
      }
      if (place.address.state) nameParts.push(place.address.state);
      if (place.address.country) nameParts.push(place.address.country);
    }
    
    setLocation({
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      name: nameParts.length > 0 ? nameParts.join(', ') : place.display_name.split(',')[0]
    });
    setSearchQuery('');
    setShowDropdown(false);
  };

  const getUserLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location'
          });
        },
        (error) => {
          let msg = "स्थान प्राप्त करने में असमर्थ";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "लोकेशन अनुमति अस्वीकृत है। कृपया मैन्युअल रूप से खोजें।";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = "लोकेशन अनुपलब्ध है। कृपया मैन्युअल रूप से खोजें।";
          } else if (error.code === error.TIMEOUT) {
            msg = "लोकेशन अनुरोध का समय समाप्त।";
          }
          setLocationError(msg);
          console.warn("Could not get location:", error.message || error);
          
          // Auto clear after 4 seconds
          setTimeout(() => {
            setLocationError(null);
          }, 4000);
        },
        { timeout: 8000 }
      );
    } else {
      setLocationError("आपका ब्राउज़र जीपीएस का समर्थन नहीं करता है।");
      setTimeout(() => {
        setLocationError(null);
      }, 4000);
    }
  };

  const generateForecast = () => {
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const forecastDate = new Date(date);
      forecastDate.setDate(date.getDate() + i);
      
      const fTimes = SunCalc.getTimes(forecastDate, location.lat, location.lng);
      const fSunrise = new Date(fTimes.sunrise.getTime() + 3 * 60000);
      const fSunset = new Date(fTimes.sunset.getTime() - 3 * 60000);
      
      const phase = SunCalc.getMoonIllumination(fSunrise).phase;
      const totalPhase = phase * 30;
      let tithiNumber = Math.ceil(totalPhase);
      if (tithiNumber === 0) tithiNumber = 30; 
      const paksha = phase <= 0.5 ? 'शुक्ल' : 'कृष्ण';
      const tithiNameNumber = tithiNumber > 15 ? tithiNumber - 15 : tithiNumber;
      const tithiNames = ['प्रतिपदा (1)', 'द्वितीया (2)', 'तृतीया (3)', 'चतुर्थी (4)', 'पंचमी (5)', 'षष्ठी (6)', 'सप्तमी (7)', 'अष्टमी (8)', 'नवमी (9)', 'दशमी (10)', 'एकादशी (11)', 'द्वादशी (12)', 'त्रयोदशी (13)', 'चतुर्दशी (14)', 'पूर्णिमा / अमावस्या'];
      let tithiName = tithiNames[tithiNameNumber - 1] || '';
      if (tithiNumber === 15) tithiName = 'पूर्णिमा (15)';
      if (tithiNumber === 30) tithiName = 'अमावस्या (30)';

      forecast.push({
        date: formatDateForInput(forecastDate),
        sunrise: fSunrise,
        sunset: fSunset,
        tithi: `${paksha} पक्ष, ${tithiName}`
      });
    }
    return forecast;
  };

  const forecastData = showForecast ? generateForecast() : [];

  return (
    <div className="space-y-4">
      {/* Real-time Master Clock Section */}
      <div className="bg-spiritual shadow-spiritual p-4 sm:p-5 rounded-3xl text-[var(--bg-cream)] flex flex-col items-stretch gap-4 sm:gap-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Clock size={120} />
        </div>

        {/* Sun Path Visualization */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg viewBox="0 0 400 100" className="w-full h-full">
            <path 
              d="M 50 80 Q 200 -20 350 80" 
              fill="none" 
              stroke="white" 
              strokeWidth="0.5" 
              strokeDasharray="2 4"
            />
            {/* Position of indicator based on solar cycle */}
            <motion.circle 
              r="2" 
              fill="orange"
              animate={{ 
                cx: [50, 200, 350],
                cy: [80, 0, 80]
              }}
              transition={{ 
                duration: 24, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-2 justify-center md:justify-start">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Spiritual Chronometer</span>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Sparkles size={8} className="text-amber-400" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">{currentPrahar.label}</span>
              </div>
            </div>
            
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tighter mb-2 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.35)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {new Intl.DateTimeFormat('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: timezone
              }).format(currentTime)}
            </motion.h2>

            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/10 backdrop-blur-sm shrink-0">
                <button 
                  onClick={() => setCalendarType('Gregorian')}
                  className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded transition-all ${calendarType === 'Gregorian' ? 'bg-amber-400 text-black shadow-md shadow-amber-400/10' : 'text-gray-400 hover:text-white'}`}
                >
                  Gregorian
                </button>
                <button 
                  onClick={() => setCalendarType('Vikrami')}
                  className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded transition-all ${calendarType === 'Vikrami' ? 'bg-amber-400 text-black shadow-md shadow-amber-400/10' : 'text-gray-400 hover:text-white'}`}
                >
                  Vikrami
                </button>
              </div>
              <p className="text-[10px] font-bold opacity-90 px-1 italic serif-text">
                {calendarType === 'Gregorian' ? (
                  currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                ) : (
                  `V.S. ${currentTime.getFullYear() + 57}, ${currentTime.toLocaleDateString('hi-IN', { weekday: 'short' })}`
                )}
              </p>
              <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-white/10 px-2 py-1 rounded border border-white/5 opacity-80 hidden sm:inline">{timezone === 'Asia/Kolkata' ? 'IST' : timezone.split('/').pop()?.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Samayik Timer Section */}
          <div className="bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/10 w-full md:w-60 shadow-xl relative overflow-hidden group/timer ring-1 ring-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
               <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: isTimerRunning ? `${(timerTime / (timerPreset ? timerPreset * 60 : 2880)) * 100}%` : "0%" }}
                 className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
               />
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Timer size={14} className="text-orange-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">Sadhana Timer</span>
              </div>
              <button 
                onClick={() => {
                  setTimerTime(48 * 60);
                  setIsTimerRunning(false);
                  setTimerPreset(48);
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                title="Reset to Samayik (48m)"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            <div className="text-center py-1">
               <h3 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-widest">
                 {formatTimer(timerTime)}
               </h3>
               <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                 {timerPreset ? `${timerPreset}m Samayik` : 'Meditation'}
               </p>
            </div>

            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md ${isTimerRunning ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-emerald-500 text-white shadow-emerald-500/10'}`}
              >
                {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                <span className="text-[9px] font-black uppercase tracking-widest">{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-2">
               {[24, 48, 60].map(mins => (
                 <button 
                   key={mins}
                   onClick={() => {
                     setTimerTime(mins * 60);
                     setTimerPreset(mins);
                     setIsTimerRunning(false);
                   }}
                   className={`py-1 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${timerPreset === mins ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-gray-500 hover:text-gray-300'}`}
                 >
                   {mins}m
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Prahars Bar */}
        <div className="relative z-10 bg-black/10 rounded-2xl p-2 border border-white/5 backdrop-blur-sm">
           <div className="grid grid-cols-8 gap-2">
             {[1, 2, 3, 4, 1, 2, 3, 4].map((p, i) => {
               const isDay = i < 4;
               const isActive = isDay ? (currentPrahar.type === 'Day' && currentPrahar.num === p) : (currentPrahar.type === 'Night' && currentPrahar.num === p);
               return (
                 <div key={i} className="flex flex-col items-center gap-1.5">
                   <div 
                     className={`w-full h-1.5 rounded-full transition-all duration-700 ${isActive ? (isDay ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]') : 'bg-white/5'}`}
                   />
                   <span className={`text-[8px] font-bold uppercase transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>{isDay ? 'D' : 'N'}{p}</span>
                 </div>
               );
             })}
           </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="serif-text text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Waves size={16} className="text-spiritual" />
            Solar Lifecycle & Calculation
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <CalendarDays size={14} className="absolute left-3 top-1/2 min-w-max -translate-y-1/2 text-gray-500" />
            <input 
              type="date" 
              value={formatDateForInput(date)}
              onChange={handleDateChange}
              className="pl-8 pr-3 py-1.5 text-xs font-medium rounded-full bg-black/5 dark:bg-white/5 border border-transparent outline-none focus:border-black/20 dark:focus:border-white/20 dark:[color-scheme:dark] transition-colors"
            />
          </div>
          
          <div className="relative" ref={searchRef}>
            <Search size={14} className="absolute left-3 top-1/2 min-w-max -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              className="pl-8 pr-3 py-2 text-xs font-medium rounded-full bg-black/10 dark:bg-white/10 border-2 border-transparent focus:border-spiritual/30 outline-none transition-all w-36 sm:w-48"
            />
            {isSearching && (
              <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
            )}
            
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 max-h-48 overflow-y-auto">
                {searchResults.map((place, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectLocation(place)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/5 truncate transition-colors border-b border-black/5 dark:border-white/5 last:border-0"
                    title={place.display_name}
                  >
                    {place.display_name.split(',')[0]}
                    <span className="block text-[9px] text-gray-500 truncate">{place.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={timezoneRef}>
            <button 
              onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
              className="flex items-center gap-2 group"
              title="Select Timezone"
            >
               <div className="relative">
                 <Globe size={14} className="absolute left-3 top-1/2 min-w-max -translate-y-1/2 text-gray-500 group-hover:text-spiritual transition-colors" />
                 <div className="pl-8 pr-8 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-black/5 dark:bg-white/5 border border-transparent group-hover:border-spiritual/30 transition-all max-w-[120px] truncate text-left">
                   {timezone.split('/').pop()?.replace(/_/g, ' ')}
                 </div>
                 <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-spiritual transition-colors" />
               </div>
            </button>
            
            <AnimatePresence>
              {showTimezoneDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 origin-top-left left-0 right-auto w-64 max-w-[calc(100vw-2rem)] md:max-w-xs overflow-x-hidden shadow-xl rounded-xl border border-stone-200 bg-white dark:bg-gray-800 dark:border-white/10 z-50"
                >
                  <div className="p-3 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                    <div className="relative">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Search timezone..."
                        value={timezoneSearch}
                        onChange={(e) => setTimezoneSearch(e.target.value)}
                        autoFocus
                        className="w-full pl-8 pr-3 py-2 text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-gray-900 border border-black/5 dark:border-white/5 rounded-xl outline-none focus:border-spiritual/30 transition-all"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {filteredTimezones.length > 0 ? (
                      filteredTimezones.map(tz => (
                        <button
                          key={tz}
                          onClick={() => {
                            setTimezone(tz);
                            setShowTimezoneDropdown(false);
                            setTimezoneSearch('');
                          }}
                          className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between group ${timezone === tz ? 'text-spiritual bg-spiritual/5' : 'text-gray-500'}`}
                        >
                          <span className="truncate">{tz.replace(/_/g, ' ')}</span>
                          {timezone === tz && <Check size={10} />}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">
                        No matches found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={getUserLocation}
            className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Use my location"
          >
            <MapPin size={12} />
            <span className="hidden sm:inline">{location.name}</span>
          </button>
          
          <button
              onClick={() => {
                setLocation({ lat: 28.6139, lng: 77.2090, name: 'Delhi' });
                localStorage.removeItem('default-location');
              }}
              className="text-[9px] font-bold uppercase tracking-widest text-spiritual hover:underline"
          >
              Reset to Delhi
          </button>
        </div>

        <AnimatePresence>
          {locationError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 text-center py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs font-semibold overflow-hidden"
            >
              ⚠️ {locationError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <p className="text-xs text-gray-500 mb-4 italic leading-relaxed">
        * As per Terapanth rules, the sunrise is considered 3 minutes after the standard geographical time, and the sunset is considered 3 minutes before the standard geographical time. Timezone: {timezone === 'Asia/Kolkata' ? 'IST' : timezone.split('/').pop()?.replace(/_/g, ' ')}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center justify-center p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
          <Sun className="text-orange-500 mb-2" size={20} />
          <span className="text-[9px] uppercase tracking-[0.2em] font-black text-orange-600/80 mb-1">Sunrise</span>
          <span className="text-lg font-black font-mono text-orange-600 dark:text-orange-400">{formatTime(panchangSunrise)}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <Sparkles className="text-amber-500 mb-2" size={20} />
          <span className="text-[9px] uppercase tracking-[0.2em] font-black text-amber-600/80 mb-1">Navkarsi</span>
          <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">{formatTime(navkarsi)}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
          <Clock className="text-yellow-600 mb-2" size={20} />
          <span className="text-[9px] uppercase tracking-[0.2em] font-black text-yellow-700/80 mb-1">Paurushi</span>
          <span className="text-lg font-black font-mono text-yellow-700 dark:text-yellow-500">{formatTime(paurushi)}</span>
        </div>
        
        <div className="flex flex-col items-center justify-center p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <Moon className="text-indigo-500 mb-2" size={20} />
          <span className="text-[9px] uppercase tracking-[0.2em] font-black text-indigo-600/80 mb-1">Sunset</span>
          <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">{formatTime(panchangSunset)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 relative group">
          <Sparkles className="text-emerald-500 mb-2" size={24} />
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600/80">Approximate Tithi</span>
            <button 
              className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              onMouseEnter={() => setShowTithiInfo(true)}
              onMouseLeave={() => setShowTithiInfo(false)}
              onClick={() => setShowTithiInfo(!showTithiInfo)}
            >
              <Info size={12} />
            </button>
          </div>
          
          <AnimatePresence>
            {showTithiInfo && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] p-2 rounded-lg shadow-xl z-20 pointer-events-none"
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                {tithiData.isApprox 
                  ? "Calculated based on astronomical moon phase proportion." 
                  : "Authenticated data from Terapanth Panchang."}
              </motion.div>
            )}
          </AnimatePresence>

          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 text-center">{tithiData.tithi}</span>
          {tithiData.name && (
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-1 line-clamp-1">{tithiData.name}</span>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-[var(--border-color)] pt-4">
        <button 
          onClick={() => setShowForecast(!showForecast)}
          className="flex flex-row items-center justify-center gap-2 w-full text-sm font-bold text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          {showForecast ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showForecast ? 'Hide 7-Day Forecast' : 'View 7-Day Forecast'}
        </button>

        {showForecast && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-fade-in">
            {forecastData.map((f, i) => (
              <div key={i} className="flex flex-col p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <span className="text-xs font-bold mb-2">{f.date}</span>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gray-500 flex items-center gap-1"><Sun size={10} className="text-orange-500" /> {formatTime(f.sunrise)}</span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1"><Moon size={10} className="text-indigo-500" /> {formatTime(f.sunset)}</span>
                </div>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">{f.tithi}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
