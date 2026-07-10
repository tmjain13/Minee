import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, CheckCircle2, XCircle, Flame, ArrowRight, BookOpen, RotateCcw } from 'lucide-react';
import { quizMaster } from '../data/quizMaster'; // Centralized consolidated quiz bank

// Strict Type Definitions matching the architecture constraints
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function UnifiedQuizEngine() {
  // Core State Engine
  const [dailyQuestions, setDailyQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);

  // 1. Deterministic Daily Seed Generation
  useEffect(() => {
    // Note: quizMaster is an object, access the database appropriately
    const allQuestions = (quizMaster as any).jainQuizDatabase || [];
    if (!allQuestions || allQuestions.length === 0) return;

    // Generate a simple hash seed from the current date string
    const dateString = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
      seed = dateString.charCodeAt(i) + ((seed << 5) - seed);
    }

    // Pseudo-random selection algorithm based on the day's seed
    const shuffled = [...allQuestions];
    const selected: QuizQuestion[] = [];
    
    // Seeded selection loop to pull exactly 5 questions uniformly for all users
    for (let i = 0; i < 5; i++) {
      if (shuffled.length === 0) break;
      const pseudoRandomIndex = Math.abs(seed + i) % shuffled.length;
      selected.push(shuffled.splice(pseudoRandomIndex, 1)[0]);
    }

    setDailyQuestions(selected);

    // Sync streak numbers dynamically out of device local storage safely
    const savedStreak = localStorage.getItem('terapanth_quiz_streak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }
  }, []);

  const currentQuestion = useMemo(() => {
    return dailyQuestions[currentIndex] || null;
  }, [dailyQuestions, currentIndex]);

  // 2. Option Selection Validation Layer
  const handleOptionSelect = (optionIndex: number) => {
    if (isLocked) return; // Prevent double trigger interactions

    setSelectedOption(optionIndex);
    setIsLocked(true);

    const isCorrect = optionIndex === currentQuestion?.correctAnswerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  // 3. Sequential Route Control Flow
  const handleNext = () => {
    if (currentIndex < dailyQuestions.length - 1) {
      // Advance to next active array index position
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsLocked(false);
    } else {
      // Complete routine reached: Process reward values and freeze logs
      setQuizComplete(true);
      
      // Calculate and append the continuous day-streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('terapanth_quiz_streak', newStreak.toString());
      
      // Accumulate score metrics directly into general spiritual credit banks
      const currentPoints = parseInt(localStorage.getItem('terapanth_sadhana_pts') || '0', 10);
      const earnedPoints = score * 20;
      localStorage.setItem('terapanth_sadhana_pts', (currentPoints + earnedPoints).toString());
    }
  };

  // Reset helper for offline continuous study modes
  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsLocked(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (dailyQuestions.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#FCF8F2] flex items-center justify-center p-4">
        <div className="animate-pulse text-stone-500 font-medium text-sm">क्विज़ लोड हो रहा है...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FCF8F2] p-4 pb-24 font-sans text-stone-800 flex flex-col justify-between">
      
      {/* Dynamic Upper Dashboard Frame */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-950">ज्ञान परीक्षा Hub</h2>
            <p className="text-xs text-stone-500 mt-0.5">Daily Doctrinal Challenge & Assessment</p>
          </div>
          
          {/* Active Fire Streak Ticker */}
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-full shadow-sm">
            <Flame className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold font-mono">{streak} Days</span>
          </div>
        </div>

        {/* Progress Metrics Strip */}
        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mb-6 flex">
          {dailyQuestions.map((_, idx) => (
            <div 
              key={idx}
              className={`h-full flex-1 border-r border-[#FCF8F2] last:border-0 transition-all duration-300 ${
                idx < currentIndex ? 'bg-orange-500' : idx === currentIndex ? 'bg-orange-400 animate-pulse' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!quizComplete ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col"
            >
              {/* Question Metadata Container */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-stone-200 text-stone-600 rounded">
                  {currentQuestion?.category}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  currentQuestion?.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' : 
                  currentQuestion?.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {currentQuestion?.difficulty}
                </span>
              </div>

              {/* Central Core Question Area */}
              <h3 className="font-serif text-lg font-bold text-stone-950 mb-6 leading-snug">
                <span className="text-orange-600 font-sans mr-1">Q{currentIndex + 1}.</span>
                {currentQuestion?.question}
              </h3>

              {/* Interactive Multi-Choice Option Cards Stack */}
              <div className="flex flex-col gap-3 w-full">
                {currentQuestion?.options.map((option, idx) => {
                  const isThisSelected = selectedOption === idx;
                  const isThisCorrect = idx === currentQuestion.correctAnswerIndex;
                  
                  // Tailwind Dynamic Styling Map based on explicit selection locks
                  let optionStyle = 'bg-white border-stone-200 text-stone-800 hover:border-stone-300';
                  if (isLocked) {
                    if (isThisCorrect) {
                      optionStyle = 'bg-emerald-50/60 border-emerald-500 text-emerald-900 font-medium shadow-sm shadow-emerald-100';
                    } else if (isThisSelected && !isThisCorrect) {
                      optionStyle = 'bg-rose-50/60 border-rose-500 text-rose-900';
                    } else {
                      optionStyle = 'bg-stone-50/40 border-stone-100 text-stone-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isLocked}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {isLocked && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {isLocked && isThisSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Premium Scorecard Overview Screen Layout */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-2xl border border-stone-200 text-center flex flex-col items-center shadow-sm w-full my-4"
            >
              <div className="p-4 bg-orange-50 rounded-full border border-orange-100 mb-4 text-orange-600">
                <Award className="w-12 h-12" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-stone-950">चैलेंज पूरा हुआ!</h3>
              <p className="text-xs text-stone-500 mt-1">Excellent spiritual evaluation completed for today.</p>

              {/* Statistics Grid Matrix */}
              <div className="grid grid-cols-2 gap-4 w-full my-6">
                <div className="bg-[#FCF8F2] p-4 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Final Score</span>
                  <span className="text-2xl font-mono font-bold text-stone-900">{score} / 5</span>
                </div>
                <div className="bg-[#FCF8F2] p-4 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Points Earned</span>
                  <span className="text-2xl font-mono font-bold text-emerald-600">+{score * 20} Pts</span>
                </div>
              </div>

              {/* Educational Suggestion Message Block */}
              <div className="w-full bg-stone-50 p-3.5 rounded-xl border border-stone-150 flex items-start gap-2.5 text-left mb-2">
                <BookOpen className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <p className="text-xs text-stone-600 leading-relaxed">
                  स्वाध्याय और निरंतर चिंतन से तत्वों का ज्ञान गहरा होता है। अपने संशयों के विस्तृत निवारण के लिए ऐप के <span className="font-semibold text-stone-900">चैट टैब</span> में हमारे एआई मित्र से आगम संदर्भों के साथ चर्चा करें।
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent Static Operational Control Layer at Bottom Frame */}
      <div className="w-full pt-4">
        {isLocked && !quizComplete && (
          <button
            onClick={handleNext}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {currentIndex === dailyQuestions.length - 1 ? 'स्कोरकार्ड देखें' : 'अगला प्रश्न'}
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </button>
        )}

        {quizComplete && (
          <button
            onClick={handleReset}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-stone-200 shadow-sm"
          >
            पुनः प्रयास करें (Study Mode)
            <RotateCcw className="w-4 h-4 text-stone-500" />
          </button>
        )}
      </div>

    </div>
  );
}
