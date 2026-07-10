import React, { useState, useEffect } from 'react';
import { fullJainDatabase, loadQuizDatabase } from '../data/jainQuizDatabase';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export default function DailyQuizChallenge() {
  const [questionData, setQuestionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchDailyQuestion = async () => {
      setIsLoading(true);
      await loadQuizDatabase();

      if (fullJainDatabase.length > 0) {
        // Use the current date to select a daily question deterministically
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        // Simple seeded random index
        const index = seed % fullJainDatabase.length;
        const qData = fullJainDatabase[index];
        setQuestionData(qData);
        
        // Generate pseudo-options if not multiple choice natively
        if (qData.options && Array.isArray(qData.options)) {
          setOptions(qData.options);
        } else {
          // If the DB only has 'question' and 'answer', let's just make it a reveal-type challenge
          // or try to find some random answers
          const randomAnswers = new Set<string>();
          randomAnswers.add(qData.answer);
          
          let attempts = 0;
          while(randomAnswers.size < 4 && attempts < 50) {
            const randIdx = (seed + attempts * 31) % fullJainDatabase.length;
            const randAns = fullJainDatabase[randIdx]?.answer;
            if (randAns && randAns.length < 100 && randAns !== qData.answer) {
              randomAnswers.add(randAns);
            }
            attempts++;
          }
          
          const optionsArray = Array.from(randomAnswers);
          // Shuffle deterministically based on seed
          optionsArray.sort((a, b) => {
            const hashA = a.length + (a.charCodeAt(0) || 0);
            const hashB = b.length + (b.charCodeAt(0) || 0);
            return hashA - hashB;
          });
          setOptions(optionsArray);
        }
      }
      setIsLoading(false);
    };

    fetchDailyQuestion();
  }, []);

  const handleOptionSelect = (option: string) => {
    if (showAnswer) return;
    
    setSelectedOption(option);
    setShowAnswer(true);
    setIsCorrect(option === questionData.answer);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100/80 animate-pulse">
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!questionData) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 shadow-sm border border-indigo-100/80 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 text-indigo-100 opacity-50 transform rotate-12 pointer-events-none">
        <Sparkles size={80} />
      </div>

      <div className="flex items-center gap-2 mb-3 relative z-10">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="font-extrabold text-indigo-900 text-lg tracking-tight">आज का ज्ञान-क्विज़</h3>
      </div>
      
      <div className="relative z-10">
        <p className="text-gray-800 font-medium mb-4 leading-relaxed">
          {questionData.question}
        </p>

        <div className="space-y-2">
          {options.length > 1 ? (
            options.map((option, idx) => {
              let btnClass = "w-full text-left p-3 rounded-xl border transition-all duration-200 ";
              let icon = null;

              if (!showAnswer) {
                btnClass += "bg-white border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer text-gray-700";
              } else {
                if (option === questionData.answer) {
                  btnClass += "bg-green-50 border-green-200 text-green-800 font-medium shadow-sm";
                  icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
                } else if (option === selectedOption) {
                  btnClass += "bg-red-50 border-red-200 text-red-800";
                  icon = <XCircle className="w-5 h-5 text-red-500" />;
                } else {
                  btnClass += "bg-white border-gray-100 text-gray-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showAnswer}
                  className={btnClass}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{option}</span>
                    {icon}
                  </div>
                </button>
              );
            })
          ) : (
            <div>
              {!showAnswer ? (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors text-sm"
                >
                  उत्तर देखें
                </button>
              ) : (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                  <p className="text-sm font-medium text-green-800">उत्तर:</p>
                  <p className="text-sm text-green-700 mt-1">{questionData.answer}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showAnswer && isCorrect !== null && options.length > 1 && (
          <div className={`mt-4 text-center text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {isCorrect ? 'अद्भुत! आपका उत्तर सही है। 🎉' : 'कोई बात नहीं! आपने कुछ नया सीखा।'}
          </div>
        )}
      </div>
    </div>
  );
}
