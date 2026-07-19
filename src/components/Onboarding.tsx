import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, MessageSquare, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import SakuraWatermark from './SakuraWatermark';

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
      <SakuraWatermark />

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
