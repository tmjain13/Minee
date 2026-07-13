import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowLeft, 
  Trash2, 
  Copy, 
  Share2, 
  Mic, 
  MicOff, 
  Check, 
  User,
  BookOpen,
  Calendar,
  Maximize2,
  Search,
  HelpCircle,
  Clock,
  Compass,
  Zap,
  X,
  Activity,
  ChevronRight,
  Home,
  MessageCircle,
  ShieldCheck,
  Monitor,
  Sliders,
  Maximize
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useChatFocus } from '../context/ChatFocusContext';
import { streamGeminiResponse } from '../services/geminiService';
import { SharedFooterNav, getNavConfig } from './SharedFooterNav';
import { KNOWLEDGE_BASE } from '../data/knowledge';
import { jainQuizDatabase, fullJainDatabase, loadQuizDatabase } from '../data/jainQuizDatabase';
import { chaturmasLocations2026 } from '../data/chaturmasLocations2026';
import { viharSearchEngine } from '../utils/viharSearchEngine';
import ReactMarkdown from 'react-markdown';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Helper function to escape special regex characters
const escapeRegExp = (str: string) => {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// Highlights individual terms matching the query inside a text string
function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !query.trim()) return text;

  const trimmed = query.trim();
  // Extract search terms of length > 1, stripped of punctuation, and sort by length descending to match longer terms first
  const terms = trimmed
    .split(/\s+/)
    .map(t => t.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim())
    .filter(t => t.length > 1);

  if (terms.length === 0) {
    // Fallback to complete query if no long words
    const escaped = escapeRegExp(trimmed);
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    if (parts.length <= 1) return text;
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{
            background: 'rgba(251, 146, 60, 0.35)',
            borderBottom: '2px solid #ea580c',
            borderRadius: '2px',
            color: 'inherit',
            fontWeight: 'inherit',
            padding: '0 2px',
          }}
        >
          {part}
        </mark>
      ) : part
    );
  }

  // Create a regex matching any of the terms
  const pattern = terms.map(t => escapeRegExp(t)).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  if (parts.length <= 1) return text;

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        style={{
          background: 'rgba(251, 146, 60, 0.35)',
          borderBottom: '2px solid #ea580c',
          borderRadius: '2px',
          color: 'inherit',
          fontWeight: 'bold',
          padding: '0 2px',
        }}
      >
        {part}
      </mark>
    ) : part
  );
}

function highlightReactElements(children: React.ReactNode, query: string): React.ReactNode {
  if (!query || !query.trim()) return children;

  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return highlightText(child, query);
    }

    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<any>;
      if (element.type === 'code' || element.type === 'pre' || element.type === 'button') {
        return child;
      }

      const props = element.props;
      if (props && props.children) {
        return React.cloneElement(element, {
          ...props,
          children: highlightReactElements(props.children, query)
        });
      }
    }

    return child;
  });
}

const getMarkdownComponents = (query: string) => ({
  p: ({ children, ...props }: any) => <p {...props}>{highlightReactElements(children, query)}</p>,
  li: ({ children, ...props }: any) => <li {...props}>{highlightReactElements(children, query)}</li>,
  h1: ({ children, ...props }: any) => <h1 {...props}>{highlightReactElements(children, query)}</h1>,
  h2: ({ children, ...props }: any) => <h2 {...props}>{highlightReactElements(children, query)}</h2>,
  h3: ({ children, ...props }: any) => <h3 {...props}>{highlightReactElements(children, query)}</h3>,
  h4: ({ children, ...props }: any) => <h4 {...props}>{highlightReactElements(children, query)}</h4>,
  h5: ({ children, ...props }: any) => <h5 {...props}>{highlightReactElements(children, query)}</h5>,
  h6: ({ children, ...props }: any) => <h6 {...props}>{highlightReactElements(children, query)}</h6>,
  span: ({ children, ...props }: any) => <span {...props}>{highlightReactElements(children, query)}</span>,
  strong: ({ children, ...props }: any) => <strong {...props}>{highlightReactElements(children, query)}</strong>,
  em: ({ children, ...props }: any) => <em {...props}>{highlightReactElements(children, query)}</em>,
  td: ({ children, ...props }: any) => <td {...props}>{highlightReactElements(children, query)}</td>,
  th: ({ children, ...props }: any) => <th {...props}>{highlightReactElements(children, query)}</th>,
});

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  type?: 'location' | 'quiz' | 'none';
  locationData?: any;
  relatedQuestions?: string[];
}

interface TerapanthLightChatUIProps {
  onBack?: () => void;
  setActiveTab?: (tab: any) => void;
  setSadhanaSubTab?: (tab: any) => void;
  isDarkMode?: boolean;
  setIsChatInputFocused?: (focused: boolean) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const TerapanthLightChatUI: React.FC<TerapanthLightChatUIProps> = ({ 
  onBack, 
  setActiveTab, 
  setSadhanaSubTab,
  isDarkMode = false,
  setIsChatInputFocused,
  isFocusMode = false,
  onToggleFocusMode
}) => {
  const isDark = isDarkMode;
  const colors = {
    bg: isDark ? '#121212' : '#fafafa',
    headerBg: isDark ? '#1a1a1a' : '#ffffff',
    cardBg: isDark ? '#1e1e1e' : '#ffffff',
    textMain: isDark ? '#f3f4f6' : '#1f2937',
    textSecondary: isDark ? '#e5e7eb' : '#0f172a',
    textMuted: isDark ? '#9ca3af' : '#64748b',
    border: isDark ? '#2a2a2a' : '#e2e8f0',
    accent: '#ea580c',
    accentLight: isDark ? '#291408' : '#fff7ed',
    accentBorder: isDark ? '#4c1d05' : '#ffd8bf',
    inputBg: isDark ? '#2a2a2a' : '#ffffff',
    headerBtnBg: isDark ? '#262626' : '#f1f5f9',
    headerBtnText: isDark ? '#9ca3af' : '#374151',
    settingsBg: isDark ? '#1a1a1a' : '#ffffff',
  };

  const { t } = useLanguage();
  const navConfig = getNavConfig(t);
  const [chatInput, setChatInput] = useState('');
  const [activeSection, setActiveSection] = useState('HOME 🏠');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    loadQuizDatabase().then(() => {
      setIsDbLoaded(true);
    });
  }, []);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [activeNav, setActiveNav] = useState('CHAT');
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  
  const { setIsChatInputFocused: setGlobalChatFocus } = useChatFocus();
  
  const handleFocusChange = (focused: boolean) => {
    if (setIsChatInputFocused) setIsChatInputFocused(focused);
    setGlobalChatFocus(focused);
  };

  const [persona, setPersona] = useState<'scholar' | 'simple'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terapanth_persona');
      return (saved === 'scholar' || saved === 'simple') ? saved : 'scholar';
    }
    return 'scholar';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('Synced ✅');
  const [viewportHeight, setViewportHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.visualViewport ? window.visualViewport.height : window.innerHeight;
    }
    return 800;
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Flush offline queue when coming online
  useEffect(() => {
    if (!isOffline && offlineQueue.length > 0) {
      const msgs = [...offlineQueue];
      setOfflineQueue([]);
      // Send them sequentially
      msgs.forEach(msg => {
         handleSendMessage(msg);
      });
    }
  }, [isOffline, offlineQueue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleViewportResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
      window.visualViewport.addEventListener('scroll', handleViewportResize);
    } else {
      window.addEventListener('resize', handleViewportResize);
    }

    // Run initial measure
    handleViewportResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
        window.visualViewport.removeEventListener('scroll', handleViewportResize);
      } else {
        window.removeEventListener('resize', handleViewportResize);
      }
    };
  }, []);

  const handlePersonaChange = (newPersona: 'scholar' | 'simple') => {
    setSyncStatus('Saving ☁️...');
    setPersona(newPersona);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('terapanth_persona', newPersona);
      }
      setSyncStatus('Synced ✅');
    }, 600);
  };

  // 📚 SMART DISCOVERABILITY TOPICS
  const topicCategories = [
    { id: 'history', icon: '🏛️', title: 'इतिहास', subtitle: 'History', questions: ['तेरापंथ की स्थापना कब हुई?', 'आचार्य भिक्षु का जीवन प्रसंग'] },
    { id: 'acharyas', icon: '🙏', title: 'आचार्य', subtitle: 'Lineage', questions: ['११ आचार्यों के नाम', 'आचार्य महाश्रमण जी का विहार'] },
    { id: 'rituals', icon: '🧘', title: 'अनुष्ठान', subtitle: 'Rituals', questions: ['सामायिक कैसे करें?', 'अष्टमी व्रत के नियम', '३२ दोष क्या हैं?'] },
    { id: 'philosophy', icon: '📖', title: 'दर्शन', subtitle: 'Philosophy', questions: ['नवतत्व क्या हैं?', 'कर्म निर्जरा कैसे होती है?'] },
    { id: 'festivals', icon: '✨', title: 'पर्व', subtitle: 'Festivals', questions: ['पर्युषण का महत्व', 'महावीर जयंती'] },
    { id: 'tpf', icon: '👥', title: 'संस्थाएं', subtitle: 'Community', questions: ['TPF क्या है?', 'अभातेयुप के कार्य'] }
  ];

  const [activeCategory, setActiveCategory] = useState(topicCategories[2]); // Default to Rituals

  const placeholders = [
    "सामायिक की विधि क्या है?",
    "आचार्य महाश्रमण जी का परिचय दें...",
    "अनेकांतवाद क्या है?",
    "जैन दर्शन के विषय में पूछें...",
    "Ask Terapanth AI..."
  ];
  const [phIndex, setPhIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // 📚 Contextual Categories & Suggested Questions
  const contextualData: Record<string, string[]> = {
    'HOME 🏠': [
      "आचार्य भिक्षु के मुख्य जीवन प्रसंग", 
      "आज का पंचांग", 
      "सम्यक् दर्शन क्या है?",
      "Brief overview of Terapanth AI"
    ],
    'SADHANA 🧘': [
      "सामायिक कैसे करें?", 
      "अष्टमी व्रत के नियम", 
      "३२ दोष क्या हैं?",
      "Track my meditation"
    ],
    'PANCHANG 📅': [
      "आज का सूर्योदय/सूर्यास्त", 
      "क्या आज उपवास है?", 
      "आगामी पर्व",
      "List of and rules for fasts"
    ],
    'GYAN 📖': [
      "नवतत्व क्या हैं?", 
      "अनेकांतवाद समझाएं", 
      "६३ शलाका पुरुष कौन हैं?",
      "Story of Acharya Bhikshu"
    ],
    'LINEAGE 📜': [
      "List of 11 Acharyas", 
      "History of Terapanth", 
      "About Acharya Mahashraman"
    ],
  };

  const categories = Object.keys(contextualData);

  // Search filter for 1000+ canonical Jain elements
  const displayQuestions = searchQuery.trim() 
    ? fullJainDatabase.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.explanation && item.explanation.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 50)
    : fullJainDatabase.slice(0, 50);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN'; // Hind-English fallback

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setChatInput(prev => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Set up auto-scroll when a new message is pushed or streamed
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  // Handle Speech Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser or iframe.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Submit User Message
  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = textToSend || chatInput;
    if (!rawQuery.trim()) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35); // standard tactile user feedback
    }

    if (rawQuery.length > 3000) {
      alert("संदेश बहुत लंबा है। कृपया इसे 3000 अक्षरों के भीतर रखें। (Message is too long)");
      return;
    }

    // Reset input box
    if (!textToSend) setChatInput('');

    // Append User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: rawQuery,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    
    if (isOffline) {
      setOfflineQueue(prev => [...prev, rawQuery]);
      return;
    }

    setIsAiLoading(true);

    try {
      // Create fresh response message state placeholder
      const aiMsgId = `ai-${Date.now()}`;
      const aiMsgPlaceholder: Message = {
        id: aiMsgId,
        role: 'model',
        text: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMsgPlaceholder]);

      // 📡 CHECK INTERNET CONNECTION
      if (!navigator.onLine) {
        // 🛑 OFFLINE MODE: Use local RAG search
        const keywords = rawQuery.toLowerCase().split(' ');
        
        const bestMatch = fullJainDatabase.find(qa => 
          keywords.some(word => word.length > 3 && (
            qa.question.toLowerCase().includes(word) || 
            (qa.explanation && qa.explanation.toLowerCase().includes(word))
          ))
        );

        setTimeout(() => {
          if (bestMatch) {
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { 
              ...m, 
              text: `*[Offline Mode]*\n\n${bestMatch.explanation}`,
              isStreaming: false 
            } : m));
          } else {
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { 
              ...m, 
              text: "*[Offline Mode]* \n\nI am currently offline. However, my local Terapanth database is active! Please try asking your question using simpler keywords (e.g., 'Samayik', 'Maryada', 'Tattvas').",
              isStreaming: false 
            } : m));
          }
          setIsAiLoading(false);
        }, 500); // Simulate typing delay
        
        return; // Stop here, do not call Gemini API
      }

      // Compute words/phrases for fallback scoring
      const searchWords = rawQuery.trim().split(/\s+/).filter(w => w.trim().length > 1);

      // Call the abstracted viharSearchEngine helper
      const searchResult = viharSearchEngine(rawQuery, fullJainDatabase, chaturmasLocations2026);

      // Fallback KNOWLEDGE_BASE search
      let bestKnowledge: any = null;
      let maxKbScore = 0;
      KNOWLEDGE_BASE.forEach(kb => {
        let score = 0;
        const titleText = kb.title ? kb.title.toLowerCase() : '';
        const descText = kb.description ? kb.description.toLowerCase() : '';
        
        if (rawQuery.toLowerCase().includes(titleText.slice(0, 10))) {
          score += 5;
        }

        searchWords.forEach(word => {
          if (titleText.includes(word.toLowerCase())) score += 3;
          if (descText.includes(word.toLowerCase())) score += 1;
        });
        if (score > maxKbScore) {
          maxKbScore = score;
          bestKnowledge = kb;
        }
      });

      let localResponse = '';
      let msgType: 'location' | 'quiz' | 'none' = 'none';
      let locationData: any = null;
      let relatedQuestions: string[] = [];

      if (searchResult.type === 'location' && searchResult.data) {
        msgType = 'location';
        locationData = searchResult.data;
        localResponse = `### **📍 प्रवास / चातुर्मास जानकारी**
**${locationData.title || ''} ${locationData.name}** (ठाणा - ${locationData.thana})

* **स्थिति / Status**: ${locationData.status}
* 🏢 **स्थान (Venue)**: ${locationData.location}
* 🗺️ **पता (Address)**: ${locationData.address}
* 📞 **सम्पर्क सूत्र (Contacts)**: ${locationData.contacts}

---
*स्रोत्र: दिल्ली एवं निकटवर्ती क्षेत्र चातुर्मास मार्गदर्शिका २०२६*`;
        relatedQuestions = ['अन्य संतों का प्रवास', 'आचार्य महाश्रमण जी का विहार'];
      } else if (searchResult.type === 'quiz' && searchResult.data) {
        msgType = 'quiz';
        const quizItem = searchResult.data;
        localResponse = `### **📖 तत्त्वज्ञान प्रश्नोत्तरी**
**Q: ${quizItem.question}**

${quizItem.explanation}

${quizItem.options && quizItem.options.length > 0 ? `
**विकल्प:**
${quizItem.options.map((opt: string, oIdx: number) => `${oIdx === quizItem.correctIndex ? '✓' : '•'} ${opt}`).join('\n')}
` : ''}
---
*आगम एवं जैन सिद्धांतों पर आधारित प्रामाणिक उत्तर।*`;
        relatedQuestions = ['अन्य संबंधित प्रश्न', 'सामायिक विधि'];
      } else if (maxKbScore > 1.5 && bestKnowledge) {
        msgType = 'quiz';
        localResponse = `### **📖 ${bestKnowledge.title}** (${bestKnowledge.category})
*${bestKnowledge.description}*

${bestKnowledge.details}

---
*Verified from canonical scriptures & Jain Terapanth records.*`;
        relatedQuestions = ['तेरापंथ इतिहास', 'सामायिक कैसे करें?'];
      }

      let responseStream = '';

      if (localResponse) {
        // Build beautiful styled respond pattern with simulated streaming
        const words = localResponse.split(' ');
        for (let i = 0; i < words.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 8));
          responseStream += (i === 0 ? '' : ' ') + words[i];
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: responseStream, type: msgType, locationData, relatedQuestions } : m));
        }

        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
      } else {
        // Real-time stream with Gemini AI
        const historyContext = messages
          .filter(m => (m.role === 'user' || m.role === 'model') && typeof m.role === 'string' && typeof m.text === 'string')
          .slice(-20)
          .map(m => ({
            role: m.role,
            parts: [{ text: m.text.substring(0, 2000) }]
          }));

        let systemPrompt = `You are Terapanth AI, the official backend query assistant for the Jain Terapanth sect. Depend strictly on authentic Jain Terapanth records (Acharya Bhikshu lineage, Samayik performance guidelines, Ashtami fasting rules). Target right local community wings such as ABTYP and Terapanth Professional Forum. Direct users properly with warm, respectful, literal guidance.`;

        if (persona === 'scholar') {
          systemPrompt += ` Adopt a 'Scholar' tone: provide rich scriptural citations, deep academic philosophical references, and detailed theological insights with correct Sanskrit/Prakrit spiritual vocabulary suited for advanced practitioners.`;
        } else {
          systemPrompt += ` Adopt a 'Simple' tone: explain complex spiritual concepts in highly simplified language suitable for absolute beginners. Avoid over-complicated Sanskrit/Prakrit terms unless explained simply. Use helpful examples so beginners can easily grasp the core values.`;
        }

        const stream = streamGeminiResponse(rawQuery, historyContext);

        for await (const chunk of stream) {
          responseStream += chunk;
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: responseStream } : m));
        }

        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));

        // Sync to cloud Firestore if user available
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            await addDoc(collection(db, `users/${currentUser.uid}/chat_logs`), {
              query: rawQuery,
              reply: responseStream,
              timestamp: serverTimestamp()
            });
          } catch (e) {
            console.warn("Firestore sync skipped:", e);
          }
        }
      }
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Helper to copy content to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Helper to trigger system share dialog
  const handleShare = async (text: string) => {
    const shareText = `${text}\n\nVia Terapanth AI: ${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Terapanth AI Insight',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.warn(err);
      }
    } else {
      handleCopy('share-fallback', shareText);
    }
  };

  // Switch contextual suggestion directly into active conversational state
  const handleSelectSuggested = (q: string) => {
    setChatInput(q);
    handleSendMessage(q);
  };

  // Reset conversation logs
  const clearChatHistory = () => {
    if (window.confirm("Are you sure you want to clear your current conversation history?")) {
      setMessages([]);
    }
  };

  const isKeyboardOpen = typeof window !== 'undefined' && window.visualViewport && window.visualViewport.height < window.innerHeight * 0.85;
  const computedHeight = isKeyboardOpen ? `${viewportHeight}px` : '100%';

  return (
    <div 
      className="flex-1 overflow-hidden flex flex-col w-full h-full"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1,
        height: computedHeight, 
        maxHeight: computedHeight,
        background: colors.bg, 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative', 
        width: '100%', 
        overflow: 'hidden',
      '--chat-bg': colors.bg,
      '--chat-card-bg': colors.cardBg,
      '--chat-header-bg': colors.headerBg,
      '--chat-text-main': colors.textMain,
      '--chat-text-muted': colors.textMuted,
      '--chat-text-sec': colors.textSecondary,
      '--chat-border': colors.border,
      '--chat-accent-light': colors.accentLight,
      '--chat-accent-border': colors.accentBorder,
      '--chat-btn-bg': colors.headerBtnBg,
      '--chat-btn-text': colors.headerBtnText,
      '--chat-input-bg': colors.inputBg,
      '--chat-settings-bg': colors.settingsBg
    } as React.CSSProperties}>
      
      {/* 🔝 OPTIMIZED PREMIUM TOP HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px 14px', 
        background: 'var(--chat-header-bg)', 
        borderBottom: '1px solid var(--chat-border)', 
        zIndex: 30,
        flexShrink: 0,
        gap: '8px'
      }}>
        <button 
          onClick={onBack}
          style={{ 
            border: 'none', 
            background: 'var(--chat-btn-bg)', 
            borderRadius: '50%', 
            width: '38px', 
            height: '38px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            transition: 'all 0.2s' 
          }}
          className="hover:bg-gray-200 active:scale-95"
          title="Back to main dashboard"
        >
          <ArrowLeft size={16} style={{ color: 'var(--chat-btn-text)' }} />
        </button>
        
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '2px',
          minWidth: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontWeight: '800', fontSize: '15px', color: 'var(--chat-text-sec)', letterSpacing: '-0.2px' }}>Terapanth AI</span> 
            <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
          </div>
          <span style={{ 
            fontSize: '9.5px', 
            fontWeight: '800', 
            color: '#ea580c', 
            background: 'var(--chat-accent-light)', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '3px', 
            border: '1px solid var(--chat-accent-border)',
            textTransform: 'uppercase',
            letterSpacing: '0.2px'
          }}>
            {persona === 'scholar' ? '🎓 Scholar Mode' : '🌱 Simple Mode'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {onToggleFocusMode && (
            <button 
              onClick={onToggleFocusMode}
              style={{ 
                border: 'none', 
                background: isFocusMode ? 'var(--chat-accent-light)' : 'var(--chat-btn-bg)', 
                borderRadius: '50%', 
                width: '38px', 
                height: '38px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                transition: 'all 0.2s' 
              }}
              className="active:scale-95"
              title={isFocusMode ? "Disable Focus Mode" : "Enable Focus Mode"}
            >
              <Maximize size={15} style={{ color: isFocusMode ? '#ea580c' : 'var(--chat-btn-text)' }} />
            </button>
          )}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{ 
              border: 'none', 
              background: showSettings ? 'var(--chat-accent-light)' : 'var(--chat-btn-bg)', 
              borderRadius: '50%', 
              width: '38px', 
              height: '38px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              transition: 'all 0.2s' 
            }}
            className="active:scale-95"
            title="Configure Chat Settings"
          >
            <Sliders size={15} style={{ color: showSettings ? '#ea580c' : 'var(--chat-btn-text)' }} />
          </button>
          
          <button 
            onClick={clearChatHistory}
            style={{ 
              border: 'none', 
              background: 'var(--chat-btn-bg)', 
              borderRadius: '50%', 
              width: '38px', 
              height: '38px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              transition: 'all 0.2s' 
            }}
            className="hover:bg-red-50 hover:text-red-500 active:scale-95"
            title="Clear Chat History"
          >
            <Trash2 size={15} style={{ color: 'var(--chat-btn-text)' }} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div style={{
          background: 'var(--chat-settings-bg)',
          borderBottom: '1px solid var(--chat-border)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          zIndex: 25,
          position: 'relative',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--chat-text-main)' }}>Agent Persona / Tone</span>
            <span style={{ fontSize: '10px', color: 'var(--chat-text-muted)' }}>Optimize translation depth and scriptural explanations</span>
            <span style={{ fontSize: '9px', fontWeight: '700', color: syncStatus.includes('Saving') ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: syncStatus.includes('Saving') ? '#f59e0b' : '#10b981' }}></span>
              Sync: {syncStatus}
            </span>
          </div>
          <div style={{ display: 'flex', background: 'var(--chat-btn-bg)', padding: '3px', borderRadius: '12px', border: '1px solid var(--chat-border)' }}>
            <button
              onClick={() => handlePersonaChange('scholar')}
              style={{
                padding: '6px 12px',
                borderRadius: '9px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: persona === 'scholar' ? '#ea580c' : 'transparent',
                color: persona === 'scholar' ? '#fff' : 'var(--chat-text-muted)',
                transition: 'all 0.2s'
              }}
            >
              🎓 Scholar
            </button>
            <button
              onClick={() => handlePersonaChange('simple')}
              style={{
                padding: '6px 12px',
                borderRadius: '9px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: persona === 'simple' ? '#ea580c' : 'transparent',
                color: persona === 'simple' ? '#fff' : 'var(--chat-text-muted)',
                transition: 'all 0.2s'
              }}
            >
              🌱 Simple
            </button>
          </div>
        </div>
      )}

      {/* 🔍 PERSISTENT SEARCH BAR (Always stays sticky at the top when starting a chat) */}
      {messages.length === 0 && (
        <div style={{
          padding: '12px 16px 8px 16px',
          background: 'var(--chat-header-bg)',
          borderBottom: '1px solid var(--chat-border)',
          zIndex: 25,
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          flexShrink: 0
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--chat-card-bg)', 
            border: '1px solid var(--chat-border)', 
            borderRadius: '16px', 
            padding: '10px 14px', 
            gap: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="खोजें (सामायिक, आचार्य भिक्षु, ३२ दोष)..." 
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: 'var(--chat-text-main)' }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'var(--chat-btn-bg)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', color: 'var(--chat-text-muted)' }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* 💬 MAIN CONTENT AREA */}
      <div 
        className="flex-1 overflow-y-auto flex flex-col"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px', 
          paddingBottom: '24px', // Standard clean breathing bottom padding for scroll content inside flex layout
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          background: 'var(--chat-bg)',
          WebkitOverflowScrolling: 'touch'
        }}
      >

        {messages.length === 0 ? (
          /* SEARCH & CATEGORY FIRST ENTRY VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* 💡 FEATURE 5: Knowledge Scope Indicator (acts as onboarding card, only shown when empty) */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '4px', 
              padding: '14px 16px',
              background: 'var(--chat-accent-light)',
              border: '1px solid var(--chat-accent-border)',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.03)',
              flexShrink: 0
            }}>
              <h3 style={{ fontSize: '13.5px', color: 'var(--chat-text-sec)', fontWeight: '900', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span>📖</span> Terapanth AI Knowledge Base
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--chat-text-muted)', margin: 0, lineHeight: '1.4', fontWeight: '600' }}>
                Fully trained on Jain Terapanth history, Acharya lineages, and daily rituals.<br/>
                <span style={{ color: '#ea580c' }}>For full offline registers & scheduling, please check the Panchang tab.</span>
              </p>
            </div>

            {!searchQuery.trim() ? (
              /* 💡 FEATURE 1: Category-First Entry Grid */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '13px', color: 'var(--chat-text-sec)', fontWeight: '800', margin: '0 0 2px 0' }}>⚡ आप क्या जानना चाहते हैं? (Select Category)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {topicCategories.map((cat) => {
                    const isSelected = activeCategory.id === cat.id;
                    return (
                      <div key={cat.id} 
                        onClick={() => setActiveCategory(cat)}
                        style={{ 
                          background: isSelected ? 'var(--chat-accent-light)' : 'var(--chat-card-bg)', 
                          border: isSelected ? '1px solid var(--chat-accent-border)' : '1px solid var(--chat-border)',
                          borderRadius: '16px', 
                          padding: '14px', 
                          cursor: 'pointer', 
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 12px rgba(234, 88, 12, 0.06)' : '0 1px 3px rgba(0,0,0,0.01)'
                        }}
                      >
                        <div style={{ fontSize: '22px', marginBottom: '6px' }}>{cat.icon}</div>
                        <h4 style={{ margin: 0, fontSize: '13.5px', color: 'var(--chat-text-sec)', fontWeight: '800' }}>{cat.title}</h4>
                        <span style={{ fontSize: '9px', color: 'var(--chat-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{cat.subtitle}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Guided Questions Filter List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--chat-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {searchQuery.trim() ? 'खोज परिणाम (Search Results)' : `💡 RECOMMENDED IN ${activeCategory.title}:`}
              </span>
              
              {displayQuestions.filter(item => {
                if (searchQuery.trim()) return true;
                // Match search or fallback filter based on category tags/related names
                const lowerCatSub = activeCategory.title.toLowerCase();
                const lowerCatName = activeCategory.subtitle.toLowerCase();
                return item.question.toLowerCase().includes(lowerCatSub) ||
                       item.question.toLowerCase().includes(lowerCatName) ||
                       (item.explanation && item.explanation.toLowerCase().includes(lowerCatSub)) ||
                       (activeCategory.id === 'rituals' && (item.question.includes('विधि') || item.question.includes('सम्यक्') || item.question.includes('सामायिक') || item.question.includes('व्रत'))) ||
                       (activeCategory.id === 'history' && (item.question.includes('स्थापना') || item.question.includes('भिक्षु') || item.question.includes('इतिहास'))) ||
                       (activeCategory.id === 'acharyas' && (item.question.includes('आचार्य') || item.question.includes('महाश्रमण') || item.question.includes('विहार'))) ||
                       (activeCategory.id === 'philosophy' && (item.question.includes('नवतत्व') || item.question.includes('अनेकांतवाद') || item.question.includes('धर्म'))) ||
                       (activeCategory.id === 'festivals' && (item.question.includes('पर्युषण') || item.question.includes('महावीर') || item.question.includes('पर्व'))) ||
                       (activeCategory.id === 'tpf' && (item.question.includes('TPF') || item.question.includes('परिषद्') || item.question.includes('अभातेयुप')));
              }).slice(0, 10).map((item: any) => {
                const isOpen = expandedId === item.id;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => setExpandedId(isOpen ? null : item.id)}
                    style={{ 
                      background: 'var(--chat-card-bg)', 
                      borderRadius: '16px', 
                      padding: '14px 16px', 
                      border: isOpen ? '1px solid #f97316' : '1px solid var(--chat-border)', 
                      boxShadow: isOpen ? '0 6px 14px rgba(249, 115, 22, 0.05)' : '0 1px 3px rgba(0,0,0,0.01)', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    {/* Meta Row: ID */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ea580c', fontSize: '10px', fontWeight: '800', background: 'var(--chat-accent-light)', padding: '3px 8px', borderRadius: '6px' }}>
                        Q. ID: {item.id}
                      </span>
                    </div>

                    {/* Question Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', color: isOpen ? 'var(--chat-text-sec)' : 'var(--chat-text-main)', fontWeight: '800', lineHeight: '1.4' }}>
                        {highlightText(item.question, searchQuery)}
                      </h4>
                      <div style={{ 
                        color: isOpen ? '#f97316' : 'var(--chat-text-muted)', 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s ease',
                        fontSize: '11px',
                        marginTop: '3px'
                      }}>
                        ▼
                      </div>
                    </div>
                    
                    {/* Accordion Expansion Panel */}
                    {isOpen && (
                      <div style={{ 
                        marginTop: '10px', 
                        paddingTop: '10px', 
                        borderTop: '1px dashed var(--chat-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--chat-text-main)', lineHeight: '1.6', fontWeight: '500' }}>
                          {item.explanation ? highlightText(item.explanation, searchQuery) : "No canonical summary stored inside cache. Requesting live explanations."}
                        </p>

                        {/* Options if exist */}
                        {item.options && item.options.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--chat-btn-bg)', padding: '10px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--chat-text-muted)', textTransform: 'uppercase' }}>Options:</span>
                            {item.options.map((opt, oIdx) => {
                              const isCorrect = oIdx === item.correctIndex;
                              return (
                                <div key={oIdx} style={{ fontSize: '12.5px', color: isCorrect ? '#16a34a' : 'var(--chat-text-main)', fontWeight: isCorrect ? '700' : 'normal', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {isCorrect ? '✓' : '•'} {opt}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Instant AI Explainer button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid triggering parent toggle
                            handleSelectSuggested(item.question);
                          }}
                          style={{
                            marginTop: '2px',
                            alignSelf: 'flex-start',
                            background: 'var(--chat-accent-light)',
                            border: '1px solid var(--chat-accent-border)',
                            borderRadius: '20px',
                            color: '#ea580c',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <Sparkles size={10} /> Live AI Explainer
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ACTIVE STREAMING CHAT LIST */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    gap: '4px'
                  }}
                >
                  {/* Avatar context */}
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    color: isUser ? '#ea580c' : '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}>
                    {isUser ? <User size={10} /> : <Bot size={10} />}
                    {isUser ? 'You' : 'Terapanth AI'}
                  </span>
                  
                  {/* Chat speech balloon */}
                  <div style={{
                    background: isUser ? 'var(--chat-accent-light)' : 'var(--chat-card-bg)',
                    border: isUser ? '1px solid var(--chat-accent-border)' : '1px solid var(--chat-border)',
                    borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    padding: '14px 18px',
                    fontSize: '14px',
                    color: 'var(--chat-text-main)',
                    lineHeight: '1.6',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
                  }} className="markdown-container">
                    <ReactMarkdown components={getMarkdownComponents(searchQuery)}>{msg.text}</ReactMarkdown>

                    {/* 📍 Task 2: BEAUTIFUL LOCATION RICH CARD */}
                    {!isUser && msg.type === 'location' && msg.locationData && (
                      <div style={{ marginTop: '14px', background: 'var(--chat-btn-bg)', borderRadius: '12px', padding: '14px', border: '1px solid var(--chat-border)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.01)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '16px' }}>🗺️</span>
                          <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--chat-text-sec)', fontWeight: '700' }}>{msg.locationData.location}</h4>
                        </div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--chat-text-main)', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.4' }}>
                          <span style={{ fontSize: '13px', marginTop: '2px' }}>📍</span> {msg.locationData.address}
                        </p>
                        <div style={{ background: '#ecfdf5', padding: '8px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '700', fontSize: '12px' }}>
                          <span>📞</span> {msg.locationData.contacts}
                        </div>
                      </div>
                    )}
                    
                    {/* 💡 FEATURE 4: End-of-answer "Related Questions" inside Bubbles */}
                    {!isUser && msg.text && !msg.isStreaming && (
                      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed var(--chat-border)' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#ea580c', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          संबद्ध प्रश्न (Related Questions):
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(msg.relatedQuestions || activeCategory.questions.slice(0, 2)).map((rq, rIdx) => (
                            <button
                              key={rIdx}
                              onClick={() => {
                                handleSendMessage(rq);
                              }}
                              style={{
                                background: 'var(--chat-btn-bg)',
                                color: 'var(--chat-text-main)',
                                border: '1px solid var(--chat-border)',
                                textAlign: 'left',
                                padding: '8px 12px',
                                fontSize: '12.5px',
                                fontWeight: '700',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                width: '100%',
                                display: 'block'
                              }}
                            >
                              ✨ {rq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Flashing streaming indicators */}
                    {msg.isStreaming && !msg.text && (
                      <div style={{ display: 'flex', gap: '4px', padding: '6px 0' }}>
                        <span style={{ width: '6px', height: '6px', background: '#e1701a', borderRadius: '50%', display: 'inline-block', animation: 'subtle-glow 1s infinite' }}></span>
                        <span style={{ width: '6px', height: '6px', background: '#e1701a', borderRadius: '50%', display: 'inline-block', animation: 'subtle-glow 1s infinite', animationDelay: '0.2s' }}></span>
                        <span style={{ width: '6px', height: '6px', background: '#e1701a', borderRadius: '50%', display: 'inline-block', animation: 'subtle-glow 1s infinite', animationDelay: '0.4s' }}></span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar for AI responses */}
                  {!isUser && msg.text && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '2px', opacity: 0.65 }}>
                      <button 
                        onClick={() => handleCopy(msg.id, msg.text)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="text-gray-500 hover:text-orange-500 transition-colors" />}
                      </button>
                      <button 
                        onClick={() => handleShare(msg.text)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        title="Share Response"
                      >
                        <Share2 size={11} className="text-gray-500 hover:text-orange-500 transition-colors" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
            <div className="chat-scroll-spacer" />
            <div ref={messagesEndRef} />
          </div>
        )}

      </div>
      
      {isOffline && (
        <div style={{
          background: '#ef4444',
          color: 'white',
          textAlign: 'center',
          padding: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 9991,
          width: '100%'
        }}>
          You are offline. Messages will be sent when you reconnect.
        </div>
      )}

      {/* 📱 CHAT INPUT CLUSTER (Nested beautifully as a blur-backdropped high-z-index group to avoid clipping and overlay beautifully) */}
      <div className="chat-input-container flex-shrink-0" style={{ 
        position: 'relative',
        background: isDark ? 'rgba(26, 26, 26, 0.85)' : 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--chat-border)', 
        padding: '10px 0 10px 0', // Compact padding because FABs are hidden on the chat tab
        zIndex: 9990, 
        boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        flexShrink: 0
      }}>

        {/* Horizontal scrollable recommended question pills (Sleek, low-height suggestions stream) */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '0 16px', marginBottom: '8px' }}>
          {/* Dynamic recommended questions from current activeCategory styled as ultra-clean modern chips */}
          {activeCategory.questions.map((q, i) => (
            <button 
              key={i} 
              onClick={() => handleSelectSuggested(q)} 
              style={{
                background: isDark ? 'rgba(38, 38, 38, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                color: 'var(--chat-text-main)', 
                border: '1px solid var(--chat-border)',
                fontWeight: '600', 
                fontSize: '11.5px', 
                padding: '6px 12px', 
                borderRadius: '16.5px', 
                cursor: 'pointer', 
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#ea580c';
                e.currentTarget.style.color = '#ea580c';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'var(--chat-border)';
                e.currentTarget.style.color = 'var(--chat-text-main)';
              }}
            >
              ✨ {q}
            </button>
          ))}
          <div style={{ paddingRight: '16px' }} />
        </div>

        {/* 4. The Main Input Bar */}
        <div style={{ padding: '0 16px' }}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: 'var(--chat-btn-bg)', 
              borderRadius: '30px', 
              padding: '6px 6px 6px 16px', 
              gap: '8px' 
            }}
          >
            <input 
              type="text" 
              maxLength={3000}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onFocus={() => handleFocusChange(true)}
              onBlur={() => handleFocusChange(false)}
              placeholder={placeholders[phIndex]} 
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                fontSize: '14px', 
                color: 'var(--chat-text-main)' 
              }}
            />
            
            {/* Quick Speech trigger */}
            <button 
              type="button"
              onClick={toggleListening}
              style={{ 
                background: isListening ? '#f97316' : '#4b5563', 
                border: 'none', 
                borderRadius: '50%', 
                width: '38px', 
                height: '38px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                color: '#fff',
                transition: 'all 0.2s'
              }}
              title={isListening ? "Listening... click to stop" : "Speak Hindi/English"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Submit trigger button */}
            <button 
              type="submit"
              disabled={!chatInput.trim() || isAiLoading}
              style={{ 
                background: chatInput.trim() ? '#ea580c' : '#fdba74', 
                border: 'none', 
                borderRadius: '50%', 
                width: '38px', 
                height: '38px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: chatInput.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ transform: 'rotate(-45deg) translateY(-1px)', color: '#fff', fontSize: '18px' }}>🚀</span>
            </button>
          </form>
        </div>

      </div>



      <AnimatePresence>
        {isQuickActionsOpen && (
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickActionsOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl border border-black/5 text-black mb-2 sm:mb-0 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600" />
              
              <button 
                onClick={() => setIsQuickActionsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors p-1.5 hover:bg-black/5 rounded-full"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                  <Zap size={18} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="serif-text text-lg font-bold text-[#8d1d1d] leading-tight">Quick Spiritual Actions</h2>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Fast Access Utilities</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  {
                    id: 'diary',
                    title: 'Sadhana Diary',
                    desc: 'Record your vows and spiritual reflections easily.',
                    icon: <BookOpen size={18} className="text-emerald-500" />,
                    bg: 'bg-emerald-500/10',
                    action: () => {
                      setSadhanaSubTab?.('diary');
                      setActiveTab?.('sadhana');
                      setIsQuickActionsOpen(false);
                    }
                  },
                  {
                    id: 'counter',
                    title: 'Mantra Counter',
                    desc: 'Count Navkar Mantra chants with visual counter beads.',
                    icon: <Activity size={18} className="text-amber-500" />,
                    bg: 'bg-amber-500/10',
                    action: () => {
                      setActiveTab?.('navkar');
                      setIsQuickActionsOpen(false);
                    }
                  },
                  {
                    id: 'timer',
                    title: 'Meditation Timer',
                    desc: 'Engage in Samayik with automated spiritual bells.',
                    icon: <Clock size={18} className="text-indigo-500" />,
                    bg: 'bg-indigo-500/10',
                    action: () => {
                      setSadhanaSubTab?.('timer');
                      setActiveTab?.('sadhana');
                      setIsQuickActionsOpen(false);
                    }
                  }
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={act.action}
                    className="w-full text-left flex items-start gap-3.5 p-3.5 bg-gray-50 border border-black/5 hover:border-amber-500/30 rounded-xl transition-all shadow-sm group"
                  >
                    <div className={`p-2.5 rounded-lg flex duration-300 group-hover:scale-110 items-center justify-center ${act.bg}`}>
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 flex items-center justify-between">
                        {act.title}
                        <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                      </h4>
                      <p className="text-[10.5px] text-gray-500 leading-normal mt-0.5 font-medium">{act.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="text-[8.5px] text-gray-400 text-center uppercase tracking-widest font-bold mt-5">
                Terapanth Sect Spiritual Tools
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
