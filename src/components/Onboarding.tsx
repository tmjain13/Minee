import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, MessageSquare, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Spiritual Companion",
      description: "तेरापंथ दर्शन, दैनिक साधना और पंचांग को अपने मोबाइल पर एक बेहद आधुनिक और साफ-सुथरे इंटरफेस में अनुभव करें।",
      icon: <Compass className="w-16 h-16 text-orange-600" />,
      color: "from-orange-500/10 to-amber-500/10"
    },
    {
      title: "Ask Terapanth Mitra",
      description: "हमारा सुरक्षित, हार्डकोडेड एआई इंजन (Gemini API द्वारा संचालित) जैन दर्शन, आगमों और आचार्य परंपरा से जुड़े आपके हर जिज्ञासु सवाल का सही जवाब देगा।",
      icon: <MessageSquare className="w-16 h-16 text-emerald-600" />,
      color: "from-emerald-500/10 to-teal-500/10"
    },
    {
      title: "Track Your Sadhana",
      description: "सामयिक, जप काउंटर और दैनिक व्रतों को आसानी से लॉग करें। जैसे-जैसे आपके नियम पूरे होंगे, आपकी प्रोग्रेस रिंग्स भरती जाएंगी।",
      icon: <Award className="w-16 h-16 text-blue-600" />,
      color: "from-blue-500/10 to-indigo-500/10"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // localStorage की-वैल्यू सेट करके ऑनबोर्डिंग को हमेशा के लिए पूरा करें
      localStorage.setItem('terapanth_hub_onboarded', 'true');
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FCF8F2] z-[9999] flex flex-col justify-between p-6 font-sans select-none overflow-hidden">
      {/* Decorative Atmosphere Filter */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none z-0" />

      {/* Dynamic Watermark of Flower patterns, Sakura (Cherry Blossoms), Mount Fuji, and Jain Terapanth Emblem 🌸 */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <svg 
          viewBox="0 0 1000 1000" 
          preserveAspectRatio="xMidYMid slice" 
          className="w-full h-full text-orange-600/10 dark:text-amber-500/5 fill-none stroke-current" 
          strokeWidth="1.5"
        >
          {/* Concentric outer geometric flower/mandala circles extending across full screen */}
          <circle cx="500" cy="500" r="480" strokeDasharray="5 10" />
          <circle cx="500" cy="500" r="420" />
          <circle cx="500" cy="500" r="350" strokeDasharray="3 6" />
          <circle cx="500" cy="500" r="280" />
          <circle cx="500" cy="500" r="220" strokeDasharray="2 4" />
          <circle cx="500" cy="500" r="160" />
          
          {/* Floral/Sakura Petals radiating out (representing traditional sakura flower pattern / flower mandala) */}
          <g transform="translate(500, 500)">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
              <path 
                key={angle} 
                d="M 0 0 C -25 -60, 25 -60, 0 0" 
                transform={`rotate(${angle}) translate(0, -160)`} 
                className="opacity-70"
              />
            ))}
            {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
              <circle
                key={angle}
                cx="0"
                cy="-210"
                r="4.5"
                transform={`rotate(${angle})`}
                className="fill-current opacity-50"
              />
            ))}
          </g>

          {/* Majestic Mountain Fuji Peak Silhouette in background */}
          <g transform="translate(250, 320) scale(1.8)" className="opacity-30">
            <path 
              d="M 10 180 Q 90 150, 110 50 Q 115 35, 120 35 L 130 35 Q 135 35, 140 50 Q 160 150, 240 180 Z" 
              strokeWidth="2" 
            />
            {/* Fuji Snow Cap */}
            <path 
              d="M 94 95 Q 110 108, 120 98 Q 128 112, 138 102 Q 148 110, 153 95 L 130 35 L 120 35 Z" 
              className="fill-current opacity-20" 
              strokeWidth="1.5"
            />
          </g>

          {/* Central Elegant Terapanth Emblem/Logo Layer */}
          <g transform="translate(500, 500)">
            {/* Center medallion circles */}
            <circle cx="0" cy="0" r="110" strokeWidth="2" className="bg-stone-50/50" />
            <circle cx="0" cy="0" r="102" strokeDasharray="4 2" strokeWidth="1" />
            <circle cx="0" cy="0" r="82" strokeWidth="1" />

            {/* Radiant Sun Rays/Aura from center */}
            <g className="opacity-40">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line 
                  key={angle}
                  x1="0" y1="0"
                  x2="0" y2="-96"
                  transform={`rotate(${angle})`}
                  strokeWidth="1"
                  strokeDasharray="5 5"
                />
              ))}
            </g>

            {/* Sacred Lotus Flower at base of center */}
            <g transform="translate(0, 52) scale(1.1)" className="opacity-80">
              {/* Center petal */}
              <path d="M 0,-15 C -8,-35 8,-35 0,-15 Z" className="fill-current" />
              {/* Left petals */}
              <path d="M 0,-15 C -20,-28 -15,-5 -3,-12 Z" />
              <path d="M 0,-15 C -35,-15 -20,5 -5,-10 Z" />
              {/* Right petals */}
              <path d="M 0,-15 C 20,-28 15,-5 3,-12 Z" />
              <path d="M 0,-15 C 35,-15 20,5 5,-10 Z" />
              {/* Bottom stem/leaves */}
              <path d="M -25,-5 Q 0,15 25,-5" strokeWidth="2" />
            </g>

            {/* Large Calligraphic Devanagari "तेरापंथ" text in center */}
            <text 
              x="0" 
              y="12" 
              textAnchor="middle" 
              className="fill-current font-bold text-[22px]" 
              style={{ fontFamily: 'Inter, "Noto Sans Devanagari", sans-serif', letterSpacing: '1px' }}
              stroke="none"
            >
              तेरापंथ
            </text>

            {/* Secondary text curved or simple below the main text */}
            <text 
              x="0" 
              y="34" 
              textAnchor="middle" 
              className="fill-current font-medium text-[11px] uppercase tracking-[2px]" 
              style={{ fontFamily: 'Inter, sans-serif' }}
              stroke="none"
            >
              WEETRAGI
            </text>

            {/* Three Dots (Ratnatraya) above text */}
            <g transform="translate(0, -32)">
              <circle cx="-16" cy="0" r="4.5" className="fill-current" />
              <circle cx="0" cy="0" r="4.5" className="fill-current" />
              <circle cx="16" cy="0" r="4.5" className="fill-current" />
            </g>

            {/* Crescent Moon (Siddhashila) & Single Dot (Siddha) on top */}
            <g transform="translate(0, -58)">
              {/* Crescent */}
              <path d="M -22,-6 Q 0,14 22,-6 Q 0,0 -22,-6" className="fill-current" stroke="none" />
              {/* Single Dot */}
              <circle cx="0" cy="-10" r="5" className="fill-current" />
            </g>
          </g>

          {/* Elegant 5-Petal Sakura Flowers 🌸 distributed dynamically in FULL SCREEN */}
          {/* Top-Left Corner */}
          <g transform="translate(150, 150) scale(1.8)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2.5" className="fill-current" />
          </g>
          <g transform="translate(280, 200) scale(1.2)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2" className="fill-current" />
          </g>

          {/* Top-Right Corner */}
          <g transform="translate(850, 150) scale(1.8)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2.5" className="fill-current" />
          </g>
          <g transform="translate(720, 220) scale(1.3)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2" className="fill-current" />
          </g>

          {/* Bottom-Left Corner */}
          <g transform="translate(150, 850) scale(1.8)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2.5" className="fill-current" />
          </g>
          <g transform="translate(250, 750) scale(1.2)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2" className="fill-current" />
          </g>

          {/* Bottom-Right Corner */}
          <g transform="translate(850, 850) scale(1.9)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2.5" className="fill-current" />
          </g>
          <g transform="translate(730, 780) scale(1.4)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2" className="fill-current" />
          </g>

          {/* Left/Right Middle edges */}
          <g transform="translate(100, 500) scale(1.5)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2.2" className="fill-current" />
          </g>
          <g transform="translate(900, 500) scale(1.5)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M 0 0 C -8 -20, 8 -20, 0 0" transform={`rotate(${angle})`} strokeWidth="1.2" />
            ))}
            <circle cx="0" cy="0" r="2.2" className="fill-current" />
          </g>

          {/* Soft drifting Sakura Petals distributed all across the screen */}
          <path d="M 200,320 C 195,310 205,305 210,315 C 215,325 205,330 200,320 Z" className="fill-current opacity-40" />
          <path d="M 350,150 C 345,140 355,135 360,145 C 365,155 355,160 350,150 Z" className="fill-current opacity-30" />
          <path d="M 650,120 C 645,110 655,105 660,115 C 665,125 655,130 660,120 Z" className="fill-current opacity-35" />
          <path d="M 800,280 C 795,270 805,265 810,275 C 815,285 805,290 800,280 Z" className="fill-current opacity-45" />
          <path d="M 120,680 C 115,670 125,665 130,675 C 135,685 125,690 120,680 Z" className="fill-current opacity-35" />
          <path d="M 300,880 C 295,870 305,865 310,875 C 315,885 305,890 300,880 Z" className="fill-current opacity-40" />
          <path d="M 700,850 C 695,840 705,835 710,845 C 715,855 705,860 700,850 Z" className="fill-current opacity-30" />
          <path d="M 880,680 C 875,670 885,665 890,675 C 895,685 885,690 880,680 Z" className="fill-current opacity-40" />
        </svg>
      </div>

      {/* Top Slide Tracker Indicators */}
      <div className="flex gap-2 w-full max-w-md mx-auto pt-4 relative z-10">
        {slides.map((_, index) => (
          <div 
            key={index}
            className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${index === currentSlide ? 'bg-orange-600 w-8' : 'bg-stone-200'}`}
          />
        ))}
      </div>

      {/* Main Content Animation Shell */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center px-4"
          >
            {/* Soft Ambient Vector Frame */}
            <div className={`p-8 rounded-full bg-gradient-to-br ${slides[currentSlide].color} mb-8 shadow-inner border border-stone-100`}>
              {slides[currentSlide].icon}
            </div>
            
            <h2 className="text-3xl font-serif font-bold text-stone-950 tracking-tight mb-4">
              {slides[currentSlide].title}
            </h2>
            
            <p className="text-sm text-stone-600 leading-relaxed max-w-xs">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Control Action Button Tray */}
      <div className="w-full max-w-md mx-auto pb-6 relative z-10">
        <button
          onClick={handleNext}
          className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-stone-950/10"
        >
          {currentSlide === slides.length - 1 ? (
            <>
              आध्यात्मिक यात्रा शुरू करें <CheckCircle2 className="w-4 h-4 text-orange-400" />
            </>
          ) : (
            <>
              आगे बढ़ें <ArrowRight className="w-4 h-4 text-stone-400" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
