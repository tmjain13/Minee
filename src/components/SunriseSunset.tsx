import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import SunCalc from 'suncalc';
import { 
  Sun, Moon, MapPin, CalendarDays, Search, Globe, Loader2, 
  Sparkles, ChevronDown, ChevronUp, Info, Check, Clock, 
  Timer, RotateCcw, Play, Pause, Star, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const confetti = (...args: any[]) => {};
import { FESTIVALS_2026_2027 } from '../data/panchang';
import { safeStringify } from '../lib/safe-json';
import { searchCities } from '../data/cities';
import { useLocation } from '../context/LocationContext';

const monthNames = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 
  'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'
];

export interface City {
  name: string;
  lat: number;
  lng: number;
  region: string;
  country: string;
}

const DELHI_DEFAULT: City = {
  name: "Delhi",
  lat: 28.6139,
  lng: 77.2090,
  region: "Delhi",
  country: "India"
};

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type ChoghadiyaName = 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Udveg' | 'Rog' | 'Kaal';
export type ChoghadiyaCategory = 'Auspicious' | 'Neutral' | 'Inauspicious';

export interface ChoghadiyaSlot {
  name: ChoghadiyaName;
  category: ChoghadiyaCategory;
  startTime: Date;
  endTime: Date;
  isDay: boolean;
}

// ==========================================
// 2. METADATA & CATEGORIZATION
// ==========================================

const CHOGHADIYA_CATEGORIES: Record<ChoghadiyaName, ChoghadiyaCategory> = {
  Amrit: 'Auspicious',
  Shubh: 'Auspicious',
  Labh: 'Auspicious',
  Char: 'Neutral',
  Udveg: 'Inauspicious',
  Rog: 'Inauspicious',
  Kaal: 'Inauspicious',
};

const CHOGHADIYA_DISPLAY_MAP: Record<ChoghadiyaName, { label: string; status: 'good' | 'neutral' | 'bad' }> = {
  Amrit: { label: 'अमृत (Amrit)', status: 'good' },
  Shubh: { label: 'शुभ (Shubh)', status: 'good' },
  Labh: { label: 'लाभ (Labh)', status: 'good' },
  Char: { label: 'चल (Char)', status: 'neutral' },
  Udveg: { label: 'उद्वेग (Udveg)', status: 'bad' },
  Rog: { label: 'रोग (Rog)', status: 'bad' },
  Kaal: { label: 'काल (Kaal)', status: 'bad' },
};

// ==========================================
// 3. SEQUENCE MATRICES
// Rows = Day of week (0 = Sunday, 1 = Monday, etc.)
// Columns = The 8 consecutive slots for that day/night
// ==========================================

const DAY_SEQUENCE: ChoghadiyaName[][] = [
  ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // 0: Sunday
  ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // 1: Monday
  ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],   // 2: Tuesday
  ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],  // 3: Wednesday
  ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // 4: Thursday
  ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],  // 5: Friday
  ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal']   // 6: Saturday
];

// This matches the exact sequence provided in your reference image (612270.jpg)
const NIGHT_SEQUENCE: ChoghadiyaName[][] = [
  ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // 0: Sunday
  ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],  // 1: Monday
  ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],  // 2: Tuesday
  ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'], // 3: Wednesday
  ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], // 4: Thursday
  ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],   // 5: Friday
  ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh']   // 6: Saturday
];

// ==========================================
// 4. GENERATOR ENGINE
// ==========================================

/**
 * Generates the full 24-hour Choghadiya schedule for a given date and location.
 * 
 * @param sunrise - Date object representing today's sunrise
 * @param sunset - Date object representing today's sunset
 * @param nextSunrise - Date object representing tomorrow's sunrise
 * @returns Array of 16 Choghadiya slots
 */
export function generateDailyChoghadiya(
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date
): ChoghadiyaSlot[] {
  const slots: ChoghadiyaSlot[] = [];
  
  // Calculate the total duration of daylight and nighttime in milliseconds
  const dayDurationMs = sunset.getTime() - sunrise.getTime();
  const nightDurationMs = nextSunrise.getTime() - sunset.getTime();
  
  // Each slot is precisely 1/8th of the respective period duration
  const daySlotDurationMs = dayDurationMs / 8;
  const nightSlotDurationMs = nightDurationMs / 8;

  // JavaScript `getDay()` returns 0 for Sunday, matching our matrix index
  const dayOfWeek = sunrise.getDay();

  // Generate the 8 Day Slots
  for (let i = 0; i < 8; i++) {
    const slotStartTime = new Date(sunrise.getTime() + i * daySlotDurationMs);
    const slotEndTime = new Date(sunrise.getTime() + (i + 1) * daySlotDurationMs);
    const name = DAY_SEQUENCE[dayOfWeek][i];

    slots.push({
      name,
      category: CHOGHADIYA_CATEGORIES[name],
      startTime: slotStartTime,
      endTime: slotEndTime,
      isDay: true
    });
  }

  // Generate the 8 Night Slots
  for (let i = 0; i < 8; i++) {
    const slotStartTime = new Date(sunset.getTime() + i * nightSlotDurationMs);
    const slotEndTime = new Date(sunset.getTime() + (i + 1) * nightSlotDurationMs);
    const name = NIGHT_SEQUENCE[dayOfWeek][i];

    slots.push({
      name,
      category: CHOGHADIYA_CATEGORIES[name],
      startTime: slotStartTime,
      endTime: slotEndTime,
      isDay: false
    });
  }

  return slots;
}

export default function SunriseSunset() {
  const [date, setDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const { activeCity, setActiveCity, isDefault, setDefaultCity } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [isTithiExpanded, setIsTithiExpanded] = useState(false);
  const [weather, setWeather] = useState<{
    temp: number;
    description: string;
    icon: string;
    humidity?: number;
    windSpeed?: number;
    loading: boolean;
    error: boolean;
  } | null>(null);

  // Weather fetcher based on activeCity coordinates
  useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      setWeather(prev => prev ? { ...prev, loading: true, error: false } : { temp: 0, description: '', icon: '', loading: true, error: false });
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${activeCity.lat}&longitude=${activeCity.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        if (!active) return;
        if (data && data.current) {
          const code = data.current.weather_code;
          let desc = "Clear";
          let icon = "☀️";
          if (code === 0) { desc = "Clear Sky"; icon = "☀️"; }
          else if ([1, 2, 3].includes(code)) { desc = "Partly Cloudy"; icon = "⛅"; }
          else if ([45, 48].includes(code)) { desc = "Foggy"; icon = "🌫️"; }
          else if ([51, 53, 55, 56, 57].includes(code)) { desc = "Drizzle"; icon = "🌧️"; }
          else if ([61, 63, 65, 66, 67].includes(code)) { desc = "Rainy"; icon = "🌧️"; }
          else if ([71, 73, 75, 77].includes(code)) { desc = "Snowy"; icon = "❄️"; }
          else if ([80, 81, 82].includes(code)) { desc = "Rain Showers"; icon = "🌦️"; }
          else if ([95, 96, 99].includes(code)) { desc = "Thunderstorm"; icon = "⛈️"; }

          setWeather({
            temp: Math.round(data.current.temperature_2m),
            description: desc,
            icon: icon,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            loading: false,
            error: false
          });
        } else {
          setWeather(prev => prev ? { ...prev, loading: false, error: true } : null);
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
        if (active) {
          setWeather(prev => prev ? { ...prev, loading: false, error: true } : null);
        }
      }
    };

    fetchWeather();
    return () => {
      active = false;
    };
  }, [activeCity.lat, activeCity.lng]);

  const [calendarType, setCalendarType] = useState<'Gregorian' | 'Vikrami'>('Gregorian');
  
  // Timer State
  const [timerTime, setTimerTime] = useState(48 * 60); // 48 mins for Samayik
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerPreset, setTimerPreset] = useState<number | null>(48);

  const [timezone, setTimezone] = useState<string>(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    return tz === 'Asia/Calcutta' ? 'Asia/Kolkata' : tz;
  });
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showTithiInfo, setShowTithiInfo] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showSadhanaTimer, setShowSadhanaTimer] = useState(true);

  const searchRef = useRef<HTMLDivElement>(null);
  const timezoneRef = useRef<HTMLDivElement>(null);

  const allTimezones = useMemo(() => {
    return Intl.supportedValuesOf('timeZone').map(tz => tz === 'Asia/Calcutta' ? 'Asia/Kolkata' : tz);
  }, []);

  const filteredTimezones = useMemo(() => {
    return allTimezones.filter(tz => tz.toLowerCase().includes(timezoneSearch.toLowerCase()));
  }, [allTimezones, timezoneSearch]);



  // Clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer interval
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

  // Location selector click outside
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
  const times = SunCalc.getTimes(date, activeCity.lat, activeCity.lng);
  
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
      const elapsed = now - sunrise;
      const praharNum = Math.floor(elapsed / dayPraharLength) + 1;
      return { 
        type: 'Day', 
        num: praharNum, 
        label: `${praharNum}${praharNum === 1 ? 'st' : praharNum === 2 ? 'nd' : praharNum === 3 ? 'rd' : 'th'} Prahar (Day)` 
      };
    } else {
      let elapsed;
      if (now >= sunset) {
        elapsed = now - sunset;
      } else {
        const prevSunset = sunset - 24 * 60 * 60 * 1000;
        elapsed = now - prevSunset;
      }
      const praharNum = Math.floor(elapsed / nightPraharLength) + 1;
      return { 
        type: 'Night', 
        num: praharNum, 
        label: `${praharNum}${praharNum === 1 ? 'st' : praharNum === 2 ? 'nd' : praharNum === 3 ? 'rd' : 'th'} Prahar (Night)` 
      };
    }
  }, [currentTime, panchangSunrise, panchangSunset]);

  const currentPrahar = calculatePrahar();

  const getChoghadiyaData = useCallback((isDay: boolean) => {
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    const tomorrowTimes = SunCalc.getTimes(tomorrow, activeCity.lat, activeCity.lng);
    const nextSunrise = new Date(tomorrowTimes.sunrise.getTime() + 3 * 60000);

    const slots = generateDailyChoghadiya(panchangSunrise, panchangSunset, nextSunrise);
    const currentMs = currentTime.getTime();

    return slots
      .filter(slot => slot.isDay === isDay)
      .map(slot => {
        const displayInfo = CHOGHADIYA_DISPLAY_MAP[slot.name];
        const isActive = currentMs >= slot.startTime.getTime() && currentMs < slot.endTime.getTime();
        return {
          name: displayInfo.label,
          status: displayInfo.status,
          meaning: slot.category,
          start: slot.startTime,
          end: slot.endTime,
          isActive
        };
      });
  }, [panchangSunrise, panchangSunset, date, currentTime, activeCity.lat, activeCity.lng]);

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

  // Unified Offline / Online Search
  useEffect(() => {
    if (searchQuery.length > 1) {
      // 1. Instant offline matches
      const offlineMatches = searchCities(searchQuery, 8).map(city => ({
        lat: String(city.lat),
        lon: String(city.lng),
        display_name: `${city.name}, ${city.region}, ${city.country}`,
        address: {
          city: city.name,
          state: city.region,
          country: city.country
        },
        isOffline: true
      }));

      setSearchResults(offlineMatches);

      // 2. Online search fallback
      const delayDebounceFn = setTimeout(async () => {
        if (searchQuery.length > 2) {
          setIsSearching(true);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`);
            const onlineData = await res.json();
            
            setSearchResults(prev => {
              const existingNames = new Set(prev.map(p => p.display_name.toLowerCase()));
              const filteredOnline = onlineData.filter((place: any) => {
                const fullName = place.display_name.toLowerCase();
                return !existingNames.has(fullName);
              });
              return [...prev, ...filteredOnline];
            });
          } catch (error) {
            console.error('Error fetching online locations:', error);
          } finally {
            setIsSearching(false);
          }
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleCitySelect = (place: any) => {
    let selected: City;
    if (place.isOffline) {
      selected = {
        name: place.address.city,
        lat: Number(place.lat),
        lng: Number(place.lon),
        region: place.address.state || '',
        country: place.address.country || ''
      };
    } else {
      const nameParts = place.display_name.split(',');
      const cityName = nameParts[0]?.trim() || 'Unknown';
      const countryName = nameParts[nameParts.length - 1]?.trim() || 'Unknown';
      const regionName = nameParts[nameParts.length - 2]?.trim() || '';
      selected = {
        name: cityName,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        region: regionName,
        country: countryName
      };
    }
    setActiveCity(selected);
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const handleSetDefault = () => {
    setDefaultCity(activeCity);
  };

  const getUserLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setActiveCity({
            name: 'GPS Location',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            region: 'Current',
            country: 'Local'
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
          setTimeout(() => setLocationError(null), 4000);
        },
        { timeout: 8000 }
      );
    } else {
      setLocationError("आपका ब्राउज़र जीपीएस का समर्थन नहीं करता है।");
      setTimeout(() => setLocationError(null), 4000);
    }
  };

  const generateForecast = () => {
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const forecastDate = new Date(date);
      forecastDate.setDate(date.getDate() + i);
      
      const fTimes = SunCalc.getTimes(forecastDate, activeCity.lat, activeCity.lng);
      const fSunrise = new Date(fTimes.sunrise.getTime() + 3 * 60000);
      const fSunset = new Date(fTimes.sunset.getTime() - 3 * 60000);
      
      const phase = SunCalc.getMoonIllumination(fSunrise).phase;
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

  // Parse AM/PM for layout split
  const timeStr = formatTime(currentTime);
  const amPmMatch = timeStr.match(/(AM|PM|am|pm)/i);
  const amPmStr = amPmMatch ? amPmMatch[0] : '';
  const cleanTimeStr = timeStr.replace(/(AM|PM|am|pm)/i, '').trim();

  // Create full dates string
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const dayNum = date.getDate();
  const yearVal = date.getFullYear();
  const vikramiYear = yearVal + 57;

  return (
    <main className="pt-16 px-4 pb-24 w-full max-w-md mx-auto">
      
      {/* --- FIX 2: LOCATION & SEARCH BAR (यह आपका सर्च बटन है जो गायब हो गया था) --- */}
      <div className="flex items-center justify-between px-1 mb-3">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-1.5 px-3.5 py-1.5 bg-[#403d38] text-orange-400 hover:bg-[#4d4943] hover:text-orange-300 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 rounded-full text-xs font-semibold shadow-md border border-[#524f48] cursor-pointer"
        >
          {isSearching || (weather && weather.loading) ? (
            <Loader2 size={13} className="animate-spin text-orange-400" />
          ) : (
            <MapPin size={13} className="transition-transform duration-200 group-hover:translate-y-[-1px] group-hover:scale-110" />
          )}
          <span>{activeCity.name}, {activeCity.country}</span>
        </button>

        {!isDefault && (
          <button 
            onClick={handleSetDefault}
            className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#ff9900] font-bold bg-[#403d38] border border-[#ff9900]/30 px-2 py-1.5 rounded-md hover:bg-[#ff9900]/10 transition-colors"
          >
            <Star size={12} className="fill-[#ff9900]" />
            Set Default
          </button>
        )}
      </div>

      {/* --- SOLAR LIFECYCLE CARD (आपका डार्क कार्ड यहाँ से शुरू होता है) --- */}
      <div className="bg-[#46433e] rounded-[24px] p-5 shadow-lg border border-[#524f48] relative overflow-hidden group">
        
        {/* Background Subtle Path */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg viewBox="0 0 400 100" className="w-full h-full">
            <path 
              d="M 50 80 Q 200 -20 350 80" 
              fill="none" 
              stroke="white" 
              strokeWidth="1" 
              strokeDasharray="2 4"
            />
          </svg>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCity.name}-${activeCity.lat}-${activeCity.lng}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-4 relative z-10"
          >
            {/* Header Row */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 bg-[#2c2a26] px-3 py-1.5 rounded-full text-xs font-bold text-orange-400 border border-[#3d3a35]">
                <Clock size={12} className="animate-pulse" />
                <span className="uppercase">{currentPrahar.label}</span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400">
                Solar Lifecycle
              </span>
            </div>
            
            {/* Main Time Display */}
            <div className="bg-[#3b3833] rounded-2xl p-6 flex flex-col items-center justify-center border border-[#48453f] relative">
              <div className="text-orange-400 text-5xl font-mono font-bold tracking-tight flex items-baseline gap-2">
                {cleanTimeStr} <span className="text-3xl font-sans font-medium uppercase text-orange-500">{amPmStr}</span>
              </div>
              <p className="text-center text-[11px] text-stone-300 mt-2 font-medium">
                {dayOfWeek}, {monthName} {dayNum} • {tithiData.tithi} ({vikramiYear})
              </p>
              {weather && (
                <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400">
                  {weather.loading ? (
                    <span className="flex items-center gap-1 animate-pulse">🌤️ Weather syncing...</span>
                  ) : weather.error ? (
                    <span className="text-stone-500">Weather unavailable</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span>{weather.icon}</span>
                      <span className="font-semibold text-stone-300">{weather.temp}°C</span>
                      <span>•</span>
                      <span className="capitalize">{weather.description}</span>
                      {weather.humidity !== undefined && (
                        <>
                          <span>•</span>
                          <span>💧 {weather.humidity}%</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* 2x2 Grid for Sunrise/Sunset */}
            <div className="grid grid-cols-2 gap-3">
              {/* Sunrise */}
              <div className="bg-[#4a3e31] border border-[#5c4a39] rounded-2xl p-3">
                <div className="text-[10px] text-orange-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <Sun size={12} /> Sunrise
                </div>
                <div className="text-orange-400 font-mono text-lg font-bold">{formatTime(panchangSunrise)}</div>
              </div>
              
              {/* Navkarsi */}
              <div className="bg-[#4a3e31] border border-[#5c4a39] rounded-2xl p-3">
                <div className="text-[10px] text-orange-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <Sparkles size={11} /> Navkarsi
                </div>
                <div className="text-orange-400 font-mono text-lg font-bold">{formatTime(navkarsi)}</div>
              </div>
              
              {/* Paurushi */}
              <div className="bg-[#4a3e31] border border-[#5c4a39] rounded-2xl p-3">
                <div className="text-[10px] text-orange-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <Clock size={11} /> Paurushi
                </div>
                <div className="text-orange-400 font-mono text-lg font-bold">{formatTime(paurushi)}</div>
              </div>
              
              {/* Sunset (Purple Tint) */}
              <div className="bg-[#3e3146] border border-[#4d3a5a] rounded-2xl p-3">
                <div className="text-[10px] text-[#b388d5] font-bold uppercase mb-1 flex items-center gap-1">
                  <Moon size={11} /> Sunset
                </div>
                <div className="text-[#b388d5] font-mono text-lg font-bold">{formatTime(panchangSunset)}</div>
              </div>
            </div>

            {/* Bottom Tithi Pill */}
            <div className="bg-[#2c3d36] border border-[#3a5046] rounded-xl overflow-hidden transition-colors duration-200">
              <button 
                onClick={() => setIsTithiExpanded(!isTithiExpanded)}
                className="w-full p-3 text-left flex items-center justify-between text-xs font-bold text-[#6bba96] hover:bg-[#32453e] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>✨</span> 
                  <span>APPROXIMATE TITHI: {tithiData.tithi}</span>
                </div>
                <div className="flex items-center gap-2">
                  {tithiData.name && (
                    <span className="text-[9px] bg-[#3a5046] px-2 py-0.5 rounded text-white tracking-wider truncate max-w-[120px]">
                      {tithiData.name}
                    </span>
                  )}
                  {isTithiExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isTithiExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-3 pb-3 border-t border-[#3a5046] bg-[#22302a] text-[#a4d4bc] text-[11px] space-y-2.5 pt-3 overflow-hidden"
                  >
                    {/* Paksha End details */}
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-stone-300 font-medium">Paksha Lunar Phase</span>
                      <span className="font-semibold">{tithiData.isApprox ? 'Approx. Calculated' : 'Panchang Verified'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-stone-300 font-medium">Moon Phase Angle</span>
                      <span className="font-mono">{(SunCalc.getMoonIllumination(panchangSunrise).phase * 360).toFixed(1)}°</span>
                    </div>

                    {/* Day Choghadiya Header */}
                    <div className="border-t border-[#3a5046] pt-2">
                      <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>☀️</span> Day Choghadiya Timings (दिन का चौघड़िया)
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {getChoghadiyaData(true).map((ch, idx) => {
                          let statusBg = 'bg-[#3b3833] border-[#48453f] text-gray-400';
                          if (ch.status === 'good') {
                            statusBg = 'bg-[#1e3a1e]/40 border-[#2d5c2d]/40 text-emerald-400';
                          } else if (ch.status === 'bad') {
                            statusBg = 'bg-[#3d1e1e]/40 border-[#5c2d2d]/40 text-red-400';
                          }

                          return (
                            <div 
                              key={`day-${idx}`} 
                              className={`p-1.5 rounded-lg border text-[9px] flex flex-col justify-between ${statusBg} ${ch.isActive ? 'ring-1 ring-orange-500' : ''}`}
                            >
                              <div className="flex justify-between items-center font-bold">
                                <span>{ch.name}</span>
                                {ch.isActive && <span className="bg-orange-500 text-white text-[8px] px-1 py-0.2 rounded font-black animate-pulse">NOW</span>}
                              </div>
                              <div className="text-[8px] text-stone-300 font-mono mt-1">
                                {ch.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {ch.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Night Choghadiya Header */}
                    <div className="border-t border-[#3a5046] pt-2">
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>🌙</span> Night Choghadiya Timings (रात्रि का चौघड़िया)
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {getChoghadiyaData(false).map((ch, idx) => {
                          let statusBg = 'bg-[#3b3833] border-[#48453f] text-gray-400';
                          if (ch.status === 'good') {
                            statusBg = 'bg-[#1e3a1e]/40 border-[#2d5c2d]/40 text-emerald-400';
                          } else if (ch.status === 'bad') {
                            statusBg = 'bg-[#3d1e1e]/40 border-[#5c2d2d]/40 text-red-400';
                          }

                          return (
                            <div 
                              key={`night-${idx}`} 
                              className={`p-1.5 rounded-lg border text-[9px] flex flex-col justify-between ${statusBg} ${ch.isActive ? 'ring-1 ring-orange-500' : ''}`}
                            >
                              <div className="flex justify-between items-center font-bold">
                                <span>{ch.name}</span>
                                {ch.isActive && <span className="bg-orange-500 text-white text-[8px] px-1 py-0.2 rounded font-black animate-pulse">NOW</span>}
                              </div>
                              <div className="text-[8px] text-stone-300 font-mono mt-1">
                                {ch.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {ch.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. SETTINGS & ADJUSTMENT CONTROLS */}
      <div className="bg-[#3b3833] border border-[#48453f] rounded-2xl p-3 shadow-md">
        <button 
          onClick={() => setShowControls(!showControls)}
          className="w-full flex items-center justify-between px-2 py-1 text-stone-300 hover:text-white transition-colors"
        >
          <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            🔧 Parameters & Adjustments
          </span>
          {showControls ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-[#48453f] space-y-3 px-1"
            >
              {/* Date & GPS Selector */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Target Date</label>
                  <div className="relative">
                    <CalendarDays size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-orange-400" />
                    <input 
                      type="date" 
                      value={formatDateForInput(date)}
                      onChange={handleDateChange}
                      className="w-full bg-[#2c2a26] text-[11px] font-semibold text-white pl-8 pr-2 py-2 rounded-lg border border-[#48453f] focus:border-orange-400/40 outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-gray-400">GPS Sync</label>
                  <button 
                    onClick={getUserLocation}
                    className="w-full bg-[#2c2a26] hover:bg-[#34322e] text-[11px] font-bold text-white py-2 rounded-lg border border-[#48453f] hover:border-orange-400/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MapPin size={12} className="text-orange-400" />
                    Locate GPS
                  </button>
                </div>
              </div>

              {/* Timezone & Reset Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1 relative" ref={timezoneRef}>
                  <label className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Timezone</label>
                  <button 
                    onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                    className="w-full bg-[#2c2a26] hover:bg-[#34322e] text-[11px] font-bold text-white px-2 py-2 rounded-lg border border-[#48453f] hover:border-orange-400/30 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate flex items-center gap-1">
                      <Globe size={11} className="text-orange-400" />
                      {timezone.split('/').pop()?.replace(/_/g, ' ')}
                    </span>
                    <ChevronDown size={10} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showTimezoneDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full mb-1 left-0 right-0 max-h-48 overflow-y-auto bg-[#2c2a26] border border-[#48453f] rounded-lg shadow-xl z-50 py-1"
                      >
                        <div className="px-2 py-1 border-b border-[#48453f] sticky top-0 bg-[#2c2a26]">
                          <input 
                            type="text"
                            placeholder="Search..."
                            value={timezoneSearch}
                            onChange={(e) => setTimezoneSearch(e.target.value)}
                            className="w-full bg-[#3b3833] text-[10px] px-2 py-1.5 rounded border border-[#48453f] text-white outline-none focus:border-orange-400/40"
                          />
                        </div>
                        {filteredTimezones.map(tz => (
                          <button
                            key={tz}
                            onClick={() => {
                              setTimezone(tz);
                              setShowTimezoneDropdown(false);
                              setTimezoneSearch('');
                            }}
                            className={`w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-[#34322e] transition-colors flex items-center justify-between ${timezone === tz ? 'text-orange-400' : 'text-stone-300'}`}
                          >
                            <span className="truncate">{tz.replace(/_/g, ' ')}</span>
                            {timezone === tz && <Check size={10} />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Quick Reset</label>
                  <button 
                    onClick={() => {
                      setActiveCity(DELHI_DEFAULT);
                      localStorage.removeItem('panchangDefaultCity');
                    }}
                    className="w-full bg-[#2c2a26] hover:bg-[#34322e] text-[11px] font-bold text-orange-400 hover:text-orange-300 py-2 rounded-lg border border-[#48453f] transition-all flex items-center justify-center gap-1.5"
                  >
                    Reset to Delhi
                  </button>
                </div>
              </div>

              {locationError && (
                <div className="py-2 px-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 text-[10px] font-semibold text-center">
                  ⚠️ {locationError}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. SADHANA / SAMAYIK TIMER MODULE */}
      <div className="bg-[#3b3833] border border-[#48453f] rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Timer size={14} className="text-orange-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Sadhana Samayik Timer</span>
          </div>
          <button 
            onClick={() => {
              setTimerTime(48 * 60);
              setIsTimerRunning(false);
              setTimerPreset(48);
            }}
            className="p-1 hover:bg-[#2c2a26] rounded transition-colors text-gray-400 hover:text-white"
            title="Reset to 48m"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="h-1 bg-[#2c2a26] rounded-full overflow-hidden mb-3">
          <motion.div 
            className="h-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
            initial={{ width: "0%" }}
            animate={{ width: isTimerRunning ? `${(timerTime / (timerPreset ? timerPreset * 60 : 2880)) * 100}%` : "0%" }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-left flex-1">
            <h3 className="text-3xl font-black font-mono text-white tracking-widest leading-none">
              {formatTimer(timerTime)}
            </h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">
              {timerPreset ? `${timerPreset} Minutes preset` : 'Custom Study Session'}
            </p>
          </div>

          <div className="flex gap-2">
            {[24, 48, 60].map(mins => (
              <button 
                key={mins}
                onClick={() => {
                  setTimerTime(mins * 60);
                  setTimerPreset(mins);
                  setIsTimerRunning(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${timerPreset === mins ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-[#2c2a26] border-[#48453f] text-gray-400 hover:text-white'}`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsTimerRunning(!isTimerRunning)}
          className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md font-bold text-[10px] uppercase tracking-widest mt-4 ${isTimerRunning ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/15'}`}
        >
          {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
          <span>{isTimerRunning ? 'Pause Session' : 'Begin Samayik'}</span>
        </button>
      </div>

      {/* 5. 7-DAY FORECAST ACCORDION */}
      <div className="bg-[#3b3833] border border-[#48453f] rounded-2xl p-3 shadow-md">
        <button 
          onClick={() => setShowForecast(!showForecast)}
          className="w-full flex items-center justify-between px-2 py-1 text-stone-300 hover:text-white transition-colors"
        >
          <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            📅 View 7-Day Forecast
          </span>
          {showForecast ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {showForecast && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-[#48453f] space-y-2"
            >
              {forecastData.map((f, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 bg-[#2c2a26] rounded-xl border border-[#48453f] text-[10px] font-medium text-stone-300">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-white">{f.date}</span>
                    <span className="text-[9px] text-[#6bba96]">{f.tithi}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-orange-400 font-mono"><Sun size={11} /> {formatTime(f.sunrise)}</span>
                    <span className="flex items-center gap-1 text-[#b388d5] font-mono"><Moon size={11} /> {formatTime(f.sunset)}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Legal Disclaimer */}
      <p className="text-[10px] text-stone-500 text-center leading-relaxed italic mt-2 px-2">
        * As per authentic Terapanth rules, Sunrise is calculated 3 minutes after standard geographical dawn, and Sunset 3 minutes before standard geographical dusk for absolute safety in fasts.
      </p>

      {/* 6. CITY SEARCH MODAL (MODAL PATTERN FOR CLEAN ACCESSIBILITY) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-150/70 dark:bg-[#120601]/85 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-stone-900 border border-orange-200/50 dark:border-stone-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[70vh]"
            >
              {/* Header Input */}
              <div className="flex items-center gap-3 p-4 border-b border-orange-100 dark:border-stone-800 bg-[#faf8f5] dark:bg-[#1a1816]">
                <Search size={18} className="text-orange-500" />
                <input 
                  type="text"
                  autoFocus
                  placeholder="Search city for Panchang..."
                  className="flex-1 bg-transparent text-xs outline-none text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-300 hover:text-stone-800"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable list of results */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {isSearching && searchQuery.length > 2 && (
                  <div className="p-8 text-center text-orange-500 text-xs flex flex-col items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-orange-500" />
                    <span>Searching global database...</span>
                  </div>
                )}
                
                {searchQuery.length > 1 && searchResults.length === 0 && !isSearching ? (
                  <div className="p-8 text-center text-stone-500 text-xs">
                    No matching city found in offline database
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {searchResults.map((place, idx) => (
                      <li key={`${place.lat}-${place.lon}-${idx}`}>
                        <button 
                          onClick={() => handleCitySelect(place)}
                          className="w-full text-left flex items-center justify-between p-3 rounded-xl bg-stone-50/80 dark:bg-stone-850 hover:bg-orange-50/50 dark:hover:bg-stone-800 border border-stone-100 dark:border-stone-800/60 transition-all group"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-stone-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {place.address?.city || place.display_name.split(',')[0]}
                            </span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 truncate max-w-[260px]">
                              {place.address?.state || place.display_name.split(',')[1]?.trim()}, {place.address?.country || place.display_name.split(',')[2]?.trim()}
                            </span>
                          </div>
                          {place.isOffline ? (
                            <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-[#6bba96] border border-emerald-500/20 px-2 py-0.5 rounded">
                              Offline
                            </span>
                          ) : (
                            <span className="text-[8px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded">
                              Global
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
