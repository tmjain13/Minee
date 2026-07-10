import { useState, useEffect } from 'react';
import SunCalc from 'suncalc';

export default function ChauviharAlert() {
  const [sunsetTime, setSunsetTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('कैलकुलेट कर रहे हैं...');
  const [isChauviharDone, setIsChauviharDone] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('लोकेशन ढूँढ रहे हैं 📍');

  // 1. You can access the position coords and calculate sunset with SunCalc
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationStatus('लोकेशन सेट ✔️');
          
          try {
            // SunCalc values estimation
            const times = SunCalc.getTimes(new Date(), latitude, longitude);
            if (times && times.sunset) {
              setSunsetTime(times.sunset);
            } else {
              throw new Error('Invalid calculation');
            }
          } catch (e) {
            const times = SunCalc.getTimes(new Date(), 28.6139, 77.2090);
            setSunsetTime(times.sunset);
          }
        },
        () => {
          setLocationStatus('लोकेशन एक्सेस नहीं मिला (Default: Delhi) ⚠️');
          // Default to Delhi coordinates if user denies GPS or if nested iframe blocks it
          const times = SunCalc.getTimes(new Date(), 28.6139, 77.2090);
          setSunsetTime(times.sunset);
        }
      );
    } else {
      setLocationStatus('GPS अनुपलब्ध (Default: Delhi) ⚠️');
      const times = SunCalc.getTimes(new Date(), 28.6139, 77.2090);
      setSunsetTime(times.sunset);
    }
  }, []);

  // 2. Real-time timer update loop
  useEffect(() => {
    if (!sunsetTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      // Chauvihar limit is exactly 48 minutes before sunset
      const chauviharLimitTime = new Date(sunsetTime.getTime() - 48 * 60000);
      const diff = chauviharLimitTime.getTime() - now.getTime();

      if (diff <= 0) {
        setIsChauviharDone(true);
        setTimeLeft('चौविहार का समय समाप्त (सूर्यास्त से 48 मिनट पूर्व) 🙏');
        clearInterval(timer);
      } else {
        // Convert milliseconds to hours, minutes and seconds
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours > 0 ? `${hours} घंटे ` : ''}${minutes} मिनट ${seconds} सेकंड`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sunsetTime]);

  // Format time in 12-hour format
  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div 
      id="chauvihar_alert_wrapper_card"
      className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-500 ${
        isChauviharDone ? 'bg-gradient-to-r from-gray-700 to-gray-900' : 'bg-gradient-to-r from-orange-500 to-red-500'
      }`}
    >
      <div id="chauvihar_inner_content" className="relative z-10">
        <div id="chauvihar_badge_container" className="flex justify-between items-center mb-3">
          <span id="chauvihar_main_badge" className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/30">
            जैन चौविहार
          </span>
          <span id="chauvihar_location_status" className="text-xs font-medium bg-black/20 px-2 py-1 rounded-md">
            {locationStatus}
          </span>
        </div>
        
        <h3 id="chauvihar_headline_title" className="text-3xl font-black mb-1 shadow-sm">
          {isChauviharDone ? 'जय जिनेन्द्र' : 'चौविहार अलर्ट'}
        </h3>
        
        <p id="chauvihar_sunset_details" className="text-orange-50 text-sm mb-5 font-bold">
          सूर्यास्त: {formatTime(sunsetTime)} | चौविहार सीमा: {sunsetTime ? formatTime(new Date(sunsetTime.getTime() - 48 * 60000)) : '--:--'}
        </p>
        
        <div 
          id="chauvihar_timer_display_pill"
          className={`font-black tracking-tight px-4 py-3 rounded-xl inline-block shadow-md ${
            isChauviharDone ? 'bg-gray-800 text-gray-300' : 'bg-white text-orange-600'
          }`}
        >
          {isChauviharDone ? 'अब जल और अन्न का त्याग है' : `⏳ शेष: ${timeLeft}`}
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div id="decor_blur_ring_large" className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div id="decor_blur_ring_small" className="absolute top-0 right-0 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl"></div>
    </div>
  );
}
