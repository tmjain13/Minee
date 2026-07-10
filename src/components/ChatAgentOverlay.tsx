import React, { useState } from 'react';
import { Send, Mic, X, RotateCcw, Download, Sparkles, BookOpen, Heart } from 'lucide-react';

interface ChatAgentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_QUERY_SETS = [
  ["आचार्य श्री महाश्रमण जी का अगला प्रवास स्थल?", "लाडनूं जैन विश्व भारती का इतिहास", "सामायिक साधना की विधि और नियम", "आज का आषाढ़ कृष्ण पक्ष पंचांग"],
  ["अनुव्रत आंदोलन के मुख्य उद्देश्य", "प्रेक्षा ध्यान की तकनीक", "अणुव्रत गीत का अर्थ", "पर्युषण पर्व के नियम"]
];

export default function ChatAgentOverlay({ isOpen, onClose }: ChatAgentOverlayProps) {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'acharya' | 'spiritual'>('acharya');
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuerySetIndex, setCurrentQuerySetIndex] = useState(0);

  const exportConversation = () => {
    const chatContent = "CHAT EXPORT:\n\n" + "Jai Jinendra! 🙏 मैं तेरापंथ एआई हूँ। मैं जैन श्वेतांबर तेरापंथ धर्मसंघ, पूज्य आचार्यों के इतिहास, पंचांग, साधना नियम तथा लाडनूं जैन विश्व भारती के विषय में प्रामाणिक मार्गदर्शन प्रदान कर सकता हूँ। पूछिए, मैं आपकी क्या सहायता करूँ?";
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terapanth-ai-chat.txt';
    a.click();
  };

  return (
    <div className="fixed inset-0 top-[56px] bottom-[72px] w-full max-w-md mx-auto bg-[#FCF8F2] z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
      
      {/* 1. FIXED SOLID HEADER */}
      <div className="w-full bg-white border-b border-stone-200/60 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-serif text-sm font-bold text-stone-900">Terapanth AI Chat Assistant</h3>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[9px] text-orange-600 font-bold tracking-wider uppercase">
              {mode === 'acharya' ? 'Acharya Knowledge Base' : 'General Spiritual Guidance'}
            </p>
            <button 
                onClick={() => setMode(mode === 'acharya' ? 'spiritual' : 'acharya')}
                className="text-[9px] font-bold bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 hover:bg-stone-200"
            >
                Toggle Mode
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={exportConversation} className="p-1 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700">
                <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* 2. INDEPENDENT SCROLLABLE MESSAGE FEED */}
      <div className="flex-1 w-full overflow-y-auto p-4 flex flex-col gap-3 min-h-[150px] scroll-smooth">
        <div className="w-full bg-white p-3.5 rounded-2xl border border-stone-150 shadow-sm">
          <p className="text-xs font-medium text-stone-800 leading-relaxed">
            Jai Jinendra! 🙏 मैं तेरापंथ एआई हूँ। मैं जैन श्वेतांबर तेरापंथ धर्मसंघ, पूज्य आचार्यों के इतिहास, पंचांग, साधना नियम तथा लाडनूं जैन विश्व भारती के विषय में प्रामाणिक मार्गदर्शन प्रदान कर सकता हूँ। पूछिए, मैं आपकी क्या सहायता करूँ?
          </p>
          <span className="text-[9px] text-stone-400 block text-right mt-1 font-mono">14:27</span>
        </div>
      </div>

      {/* 3. COMPACT SUGGESTED QUERIES DECK */}
      <div className="w-full px-4 py-2 border-t border-stone-150 bg-white/60 shrink-0">
        <div className="text-[9px] font-bold text-stone-400 tracking-wider uppercase mb-1.5 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Suggested Queries • त्वरित प्रश्नोत्तरी
          </div>
          <button onClick={() => setCurrentQuerySetIndex((prev) => (prev + 1) % ALL_QUERY_SETS.length)} className="p-1 hover:bg-stone-200 rounded-full text-stone-500">
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ALL_QUERY_SETS[currentQuerySetIndex].map((query, idx) => (
            <button key={idx} className="bg-white border border-stone-200 rounded-xl p-2 text-left text-[11px] font-medium text-stone-700 hover:border-orange-400 active:scale-98 transition-all leading-tight shadow-2xs line-clamp-1">
              ❓ {query}
            </button>
          ))}
        </div>
      </div>

      {/* 4. SOLID INPUT FORM ANCHOR */}
      <div className="w-full bg-white border-t border-stone-200 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 focus-within:border-orange-500 transition-colors">
          <input 
            type="text" 
            placeholder="आचार्य प्रवर के बारे में या सामायिक विधि पूछें..." 
            className="flex-1 bg-transparent text-xs text-stone-800 outline-none placeholder-stone-400 py-1"
          />
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`p-1 transition-all ${isRecording ? 'text-red-500 animate-pulse' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button className="bg-orange-500 text-white p-1.5 rounded-lg active:scale-95 transition-transform shrink-0 shadow-sm"><Send className="w-3.5 h-3.5" /></button>
        </div>
        <p className="text-center text-[9px] text-stone-400 mt-1.5">
          प्रतिक्रियाएं जैन श्वेतांबर तेरापंथ आगमों व प्रामाणिक इतिहास पर आधारित हैं।
        </p>
      </div>

    </div>
  );
}
