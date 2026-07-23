import { useState, useEffect, useRef } from 'react';
import { 
  Book, 
  Search, 
  Filter, 
  Download, 
  BookOpen, 
  Plus, 
  X, 
  SlidersHorizontal, 
  Loader2, 
  ChevronRight, 
  FileText, 
  Trash2, 
  Globe, 
  User, 
  Send, 
  Bot, 
  Sparkles, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Heart,
  Palette,
  Bookmark,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  increment, 
  serverTimestamp,
  where 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import { streamGeminiResponse } from '../lib/gemini-client';

export interface BookInfo {
  id: string;
  title: string;
  author: string;
  category: 'Philosophy' | 'Rituals' | 'Biography' | 'Meditation' | 'History' | 'Children';
  description: string;
  coverImageUrl?: string;
  fileUrl: string;
  fileSize: string;
  language: string;
  downloadCount: number;
  isPublic: boolean;
  uploadedAt?: any;
}

interface DigitalLibraryProps {
  isAdmin: boolean;
  setShareToast?: any;
  setIsLoginModalOpen?: any;
  user?: any;
}

// Fixed Seed Data to fallback to if the collection is empty
const INITIAL_SEED_BOOKS: BookInfo[] = [
  {
    id: "seed_book_1",
    title: "Samayik Sadhana Guide",
    author: "Acharya Bhikshu",
    category: "Rituals",
    description: "An authoritative handbook explaining the step-by-step methods, vows, and deep spiritual significance of performing Samayik in the Terapanth tradition.",
    coverImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "1.2 MB",
    language: "Hindi",
    downloadCount: 42,
    isPublic: true
  },
  {
    id: "seed_book_2",
    title: "Anuvrat: A Path to Self-Discipline",
    author: "Acharya Tulsi",
    category: "Philosophy",
    description: "The official revolutionary treatise detailing small vows for global social reform, personal character improvement, and ethical living.",
    coverImageUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=60",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "2.4 MB",
    language: "English",
    downloadCount: 28,
    isPublic: true
  },
  {
    id: "seed_book_3",
    title: "Preksha Dhyana: Theory and Practice",
    author: "Acharya Mahaprajna",
    category: "Meditation",
    description: "A profound scientific-spiritual handbook detailing the practical dynamics of Preksha Meditation, body relaxation, and color visualization.",
    coverImageUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&auto=format&fit=crop&q=60",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "3.1 MB",
    language: "English",
    downloadCount: 65,
    isPublic: true
  },
  {
    id: "seed_book_4",
    title: "Gyanshala Level 1 Textbook",
    author: "Values Education Board",
    category: "Children",
    description: "The official values primer introducing children to non-violence, truth, respect for living beings, and Navkar recitation.",
    coverImageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop&q=60",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "1.8 MB",
    language: "Hindi",
    downloadCount: 104,
    isPublic: true
  }
];

const BOOK_READING_CONTENT: Record<string, string> = {
  "seed_book_1": `Chapter 1: The Essence of Samayik
Samayik is the cornerstone of Jain spiritual practice. It is a 48-minute vow of equanimity, self-conquest, and complete detachment from worldly affairs. During Samayik, a practitioner steps out of the cycle of attachment (Raga) and aversion (Dvesha) to experience the true nature of the soul. It is a state of spiritual stillness where the soul connects with its pure, unblemished form.

Chapter 2: The Karemi Bhante Sutra
To initiate the Samayik vow, recite the sacred Karemi Bhante Sutra with deep devotion:
"Karemi bhante! samayiyam, savvaham savajjam jogam paccakkhami, java niyammam pajjuvasami, duviham tivihanam - na karemi na karavemi, manasa vayasa kayasa..."

Translation: O Venerable One, I vow to observe equanimity. I renounce all sinful acts for the duration of this practice, by not committing nor causing others to commit, through mind, speech, or body.

Chapter 3: Daily Contemplations
Focus the mind on the four supreme virtues:
* Maitri (Amity to all living beings)
* Pramoda (Appreciation for the virtuous)
* Karuna (Compassion for the suffering)
* Madhyasthya (Equanimity towards the hostile)

Practice deep, slow breathing (Kayotsarga) to dissolve stress and connect with pure consciousness. Maintain complete silence and reflect on the transient nature of worldly life.`,

  "seed_book_2": `Chapter 1: The Vision of Anuvrat
Anuvrat is a movement designed by Acharya Tulsi to promote individual character-building and global ethical awareness. Anuvrat means 'small vows'—accessible, practical commitments that anyone can adopt, regardless of religion, caste, or nationality, to cultivate a harmonious and non-violent society.

Chapter 2: The Eleven Basic Vows
1. I will not kill any innocent creature. I will cultivate a deep respect for all life-forms.
2. I will not attack anyone or support aggression. I will strive to resolve conflicts through dialogue.
3. I will not engage in anti-social or unethical business practices, including bribery, hoarding, or black marketing.
4. I will practice honesty and integrity in all my relationships, avoiding deceit and false testimony.
5. I will limit my desires and possessions to check consumerism and greed.
6. I will avoid drug abuse, smoking, and alcohol, promoting physical and mental health.
7. I will practice electoral integrity, refusing to sell or buy votes.
8. I will not encourage social discriminations or communal bias, treating all humans with equal respect.
9. I will practice environmental mindfulness, protecting nature, water, and trees from unnecessary harm.
10. I will prioritize moral integrity in daily behaviors, setting a virtuous example for my family and community.
11. I will cultivate tolerance, harmony, and peace in daily speech, avoiding slander and hatred.

Chapter 3: Collective Impact
By individual discipline, the collective consciousness of society shifts towards righteousness. Small vows pave the path to large transformations. When each citizen commits to moral self-regulation, laws become simpler and peace prevails.`,

  "seed_book_3": `Chapter 1: Principles of Preksha Meditation
Preksha Dhyana is a scientific, non-sectarian system of meditation formulated by Acharya Mahaprajna. 'Preksha' means 'to perceive deeply'—to observe the inner state of mind, body, and breath without judgment, leading to complete self-transformation and spiritual purification.

Chapter 2: Steps of Kayotsarga (Conscious Relaxation)
1. Posture: Sit in a stable, upright meditative pose or lie down in Shavasana. Keep your spine erect and shoulders completely relaxed.
2. Autosuggestion: Repeat internally, 'My body is becoming relaxed, absolutely relaxed...' Send this feeling of relaxation to every cell of your body.
3. Observation: Direct your attention from the toes up to the crown of the head, experiencing deep relaxation in each muscle group, releasing physical tension and emotional blockages.

Chapter 3: Perception of Breath (Shvasa-Preksha)
Direct the attention to the nostrils. Observe each inhalation and exhalation. Experience the cool air entering and the warm air leaving. Do not try to regulate the breath—simply maintain unbroken, alert awareness of the natural respiratory rhythm. As your awareness deepens, you will notice the breath becoming slower, subtler, and more peaceful, calming the autonomic nervous system.`,

  "seed_book_4": `Chapter 1: Respect for Life (Ahimsa)
Ahimsa is the supreme law of Jainism. Every living being, from tiny insects to large animals, wants to live and be happy. We must never hurt or harm anyone. Speak sweet words, refrain from anger, and show compassion to all creations of nature. Practice kind actions, feed the hungry, and protect the weak.

Chapter 2: Reciting the Navkar Mantra
The Navkar Mantra is the most sacred prayer in Jainism. It bows to the five classes of supreme beings who have attained liberation or are guiding others on the path:
* Namo Arihantanam (I bow to the destroyers of inner enemies)
* Namo Siddhanam (I bow to the liberated souls)
* Namo Ayariyanam (I bow to the spiritual leaders)
* Namo Uvajjhayanam (I bow to the teachers)
* Namo Loe Savva Sahunam (I bow to all spiritual seekers in the world)

Chapter 3: Noble Conduct
Cultivate small daily habits:
* Greet parents with respect every morning.
* Eat food before sunset (Chauvihar) to avoid harming microbes.
* Speak truth, even when it is difficult.
* Help friends in need and keep your promises.

These values build a strong character and bring peace to the mind, sowing the seeds of a moral life.`,

  "fallback": `Chapter 1: Introduction
Welcome to the study of this sacred text. We encourage you to proceed with deep respect, equanimity, and mindfulness. Svadhyaya (self-study) is considered one of the highest forms of internal austerity (tapa).

Chapter 2: Core Philosophy
This book presents valuable insights into traditional Jain Terapanth philosophy, non-violence (Ahimsa), self-discipline, and character development under the guidance of our revered Acharyas. By contemplating these teachings, the soul cleanses its karmic bondages.

Chapter 3: Path of Devotion and Practice
Incorporate the learnings of this book into your daily routines through mindful practice, self-reflection, and compassionate actions. Every small step towards self-regulation is a milestone on the journey to liberation.`
};

export default function DigitalLibrary({ isAdmin, user, setIsLoginModalOpen, setShareToast }: DigitalLibraryProps) {
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Detail & Viewer Modal States
  const [viewingBook, setViewingBook] = useState<BookInfo | null>(null);
  const [distractionFreeMode, setDistractionFreeMode] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState(() => {
    const saved = localStorage.getItem('terapanth_reader_font_size');
    return saved ? parseInt(saved, 10) : 18;
  });

  const [readerBgTheme, setReaderBgTheme] = useState<'sepia' | 'white' | 'dark'>(() => {
    const saved = localStorage.getItem('terapanth_reader_bg_theme');
    return (saved as 'sepia' | 'white' | 'dark') || 'sepia';
  });

  const [savedVerses, setSavedVerses] = useState<{ id: string; bookId: string; bookTitle: string; text: string; timestamp: number }[]>(() => {
    try {
      const saved = localStorage.getItem('terapanth_saved_verses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [selectedText, setSelectedText] = useState('');
  const [showFavoritesTray, setShowFavoritesTray] = useState(false);

  // --- TTS, Scroll Tracking, & Firestore Bookmarks States & Effects ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarkedInFirestore, setIsBookmarkedInFirestore] = useState(false);
  const [isSavingToFirestore, setIsSavingToFirestore] = useState(false);
  const readerScrollerRef = useRef<HTMLDivElement>(null);

  // Scroll position tracking & restoration
  useEffect(() => {
    if (distractionFreeMode && viewingBook) {
      const savedScroll = localStorage.getItem('terapanth_reader_scroll_' + viewingBook.id);
      if (savedScroll && readerScrollerRef.current) {
        const parsedScroll = parseInt(savedScroll, 10);
        const scroller = readerScrollerRef.current;
        const timer = setTimeout(() => {
          if (scroller) {
            scroller.scrollTop = parsedScroll;
            // Calculate initial scroll progress
            const maxScroll = scroller.scrollHeight - scroller.clientHeight;
            if (maxScroll > 0) {
              setScrollProgress((parsedScroll / maxScroll) * 100);
            }
          }
        }, 150);
        return () => clearTimeout(timer);
      } else {
        setScrollProgress(0);
      }
    }
  }, [distractionFreeMode, viewingBook]);

  // Clean up TTS when leaving distraction free mode
  useEffect(() => {
    if (!distractionFreeMode) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [distractionFreeMode]);

  // Sync firestore bookmark status in real-time
  useEffect(() => {
    if (user && viewingBook) {
      const docId = `${user.uid}_${viewingBook.id}`;
      const docRef = doc(db, 'saved_readings', docId);
      const unsubscribe = onSnapshot(docRef, (snap) => {
        setIsBookmarkedInFirestore(snap.exists());
      }, (err) => {
        console.warn("Firestore bookmark error: ", err);
      });
      return () => unsubscribe();
    } else {
      setIsBookmarkedInFirestore(false);
    }
  }, [user, viewingBook]);

  // Adjust TTS speed on the fly if already speaking
  useEffect(() => {
    if (isSpeaking && 'speechSynthesis' in window) {
      const wasSpeaking = isSpeaking;
      const wasPaused = isPaused;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      if (wasSpeaking && !wasPaused) {
        // restart with new speed
        setTimeout(() => {
          startTTS();
        }, 100);
      }
    }
  }, [playbackSpeed]);

  const startTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }
    
    if (!viewingBook) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = BOOK_READING_CONTENT[viewingBook.id] || BOOK_READING_CONTENT['fallback'];
    const cleanedText = textToSpeak.replace(/###/g, '').replace(/##/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    const voices = window.speechSynthesis.getVoices();
    const isHindi = viewingBook.language?.toLowerCase().includes('hindi');
    const langCode = isHindi ? 'hi-IN' : 'en-US';
    
    utterance.lang = langCode;
    const matchedVoice = voices.find(v => v.lang.startsWith(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    
    utterance.rate = playbackSpeed;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const pauseTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const stopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const saveReadingToFirestore = async () => {
    if (!viewingBook) return;

    if (!user) {
      if (setIsLoginModalOpen) {
        setIsLoginModalOpen(true);
      } else {
        alert("Please login to bookmark scriptures in your cloud account.");
      }
      return;
    }
    
    try {
      setIsSavingToFirestore(true);
      const docId = `${user.uid}_${viewingBook.id}`;
      const docRef = doc(db, 'saved_readings', docId);
      
      if (isBookmarkedInFirestore) {
        await deleteDoc(docRef);
        if (setShareToast) {
          setShareToast({
            show: true,
            message: `"${viewingBook.title}" removed from Saved Readings.`,
            type: 'info'
          });
        }
      } else {
        await setDoc(docRef, {
          userId: user.uid,
          bookId: viewingBook.id,
          bookTitle: viewingBook.title,
          author: viewingBook.author,
          category: viewingBook.category,
          language: viewingBook.language,
          coverImageUrl: viewingBook.coverImageUrl || "",
          savedAt: serverTimestamp() || new Date()
        });
        
        if (setShareToast) {
          setShareToast({
            show: true,
            message: `"${viewingBook.title}" added to your Saved Readings!`,
            type: 'success'
          });
        }
      }
    } catch (err) {
      console.error("Error saving reading to Firestore: ", err);
      alert("Failed to update bookmark. Please try again.");
    } finally {
      setIsSavingToFirestore(false);
    }
  };
  // -------------------------------------------------------------

  useEffect(() => {
    localStorage.setItem('terapanth_reader_font_size', readerFontSize.toString());
  }, [readerFontSize]);

  useEffect(() => {
    localStorage.setItem('terapanth_reader_bg_theme', readerBgTheme);
  }, [readerBgTheme]);

  useEffect(() => {
    localStorage.setItem('terapanth_saved_verses', JSON.stringify(savedVerses));
  }, [savedVerses]);

  useEffect(() => {
    if (!viewingBook) {
      setDistractionFreeMode(false);
      setShowFavoritesTray(false);
      setSelectedText('');
    }
  }, [viewingBook]);

  const [activeBookForChat, setActiveBookForChat] = useState<BookInfo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Field States
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState<BookInfo['category']>('Philosophy');
  const [newLanguage, setNewLanguage] = useState('Hindi');
  const [newDescription, setNewDescription] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Chat Section States
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [aiResponding, setAiResponding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch Books from Firestore ordered by uploadedAt desc
  useEffect(() => {
    const booksRef = collection(db, 'books');
    const q = query(booksRef, orderBy('uploadedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookList: BookInfo[] = [];
      snapshot.forEach((doc) => {
        bookList.push({ id: doc.id, ...doc.data() } as BookInfo);
      });

      // If database has no records, we fallback to our highly authentic compiled seed collection
      if (bookList.length === 0) {
        setBooks(INITIAL_SEED_BOOKS);
      } else {
        setBooks(bookList);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore read error for books:", error);
      // Fallback securely so the system doesn't freeze
      setBooks(INITIAL_SEED_BOOKS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set default chat context when selecting/tapping a book
  useEffect(() => {
    if (activeBookForChat) {
      setChatMessages([
        {
          sender: 'ai',
          text: `👋 Greetings! I am **Terapanth AI**, your dedicated companion guides. I can answer any detailed queries about the book **"${activeBookForChat.title}"** by ${activeBookForChat.author}. How may I assist you with this scripture today?`
        }
      ]);
    }
  }, [activeBookForChat]);

  // Handle automatic scrolling in companion chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Categories and Languages derived dynamically
  const categories = ['All', 'Philosophy', 'Rituals', 'Biography', 'Meditation', 'History', 'Children'];
  const languages = ['All', 'Hindi', 'English', 'Rajasthani', 'Sanskrit', 'Prakrit'];

  // Local Search & Filter logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'All' || book.language.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesCategory && matchesLanguage;
  });

  // Increment download count securely
  const registerDownload = async (book: BookInfo) => {
    try {
      // Save to localStorage history first
      const historyStr = localStorage.getItem('terapanth_read_books_history') || '[]';
      let history = [];
      try {
        history = JSON.parse(historyStr);
      } catch (err) {
        history = [];
      }
      if (!history.some((h: any) => h.id === book.id)) {
        history.push({ id: book.id, category: book.category, title: book.title, timestamp: Date.now() });
        localStorage.setItem('terapanth_read_books_history', JSON.stringify(history));
        // Dispatch a custom storage event so other components on the page (like dashboard) can update immediately
        window.dispatchEvent(new Event('terapanth_history_update'));
      }

      if (book.id.startsWith('seed_book_')) return; // skip state count updating for static seeds
      const bookDocRef = doc(db, 'books', book.id);
      await updateDoc(bookDocRef, {
        downloadCount: increment(1)
      });
    } catch (e) {
      console.warn("Skipping real-time download tracking update: ", e);
    }
  };

  // Pre-seed Books directly into database for admin
  const triggerAutoSeed = async () => {
    try {
      setLoading(true);
      for (const item of INITIAL_SEED_BOOKS) {
        const bookDocRef = doc(db, 'books', item.id);
        await setDoc(bookDocRef, {
          title: item.title,
          author: item.author,
          category: item.category,
          description: item.description,
          coverImageUrl: item.coverImageUrl || "",
          fileUrl: item.fileUrl,
          fileSize: item.fileSize,
          language: item.language,
          downloadCount: item.downloadCount,
          isPublic: item.isPublic,
          uploadedAt: serverTimestamp()
        });
      }
      alert("Traditional Terapanth Library successfully seeded!");
    } catch (err) {
      console.error(err);
      alert("Error seeding: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Upload book file to Storage and save details
  const handleAddNewBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim() || !newDescription.trim()) {
      setUploadError("Please populate all required text details!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess(false);

    try {
      let finalFileUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
      let finalFileSize = "1.5 MB";

      if (uploadedFile) {
        finalFileSize = (uploadedFile.size / (1024 * 1024)).toFixed(1) + " MB";
        
        // Try uploading to Storage pathway /books/{fileName}
        const storageRef = ref(storage, `books/${Date.now()}_${uploadedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, uploadedFile);

        // Wait upload resolution synchronously
        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            }, 
            (error) => {
              console.error("Storage upload error:", error);
              reject(error);
            }, 
            async () => {
              finalFileUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } else {
        // Mock Progress for manual links
        for (let i = 0; i <= 100; i += 20) {
          setUploadProgress(i);
          await new Promise(r => setTimeout(r, 60));
        }
      }

      // Format random aesthetic fallback cover if none provided
      const finalCover = newCoverUrl.trim() || `https://images.unsplash.com/photo-${[
        '1544716278-ca5e3f4abd8c',
        '1506880018603-83d5b814b5a6',
        '1518241353330-0f7941c2d9b5',
        '1503676260728-1c00da094a0b'
      ][Math.floor(Math.random() * 4)]}?w=400&auto=format&fit=crop&q=60`;

      // Save record in Firestore
      const booksCollection = collection(db, 'books');
      await addDoc(booksCollection, {
        title: newTitle.trim(),
        author: newAuthor.trim(),
        category: newCategory,
        description: newDescription.trim(),
        coverImageUrl: finalCover,
        fileUrl: finalFileUrl,
        fileSize: finalFileSize,
        language: newLanguage,
        downloadCount: 0,
        isPublic: true,
        uploadedAt: serverTimestamp()
      });

      setUploadSuccess(true);
      // Reset Form State
      setNewTitle('');
      setNewAuthor('');
      setNewDescription('');
      setNewCoverUrl('');
      setUploadedFile(null);
      setTimeout(() => {
        setShowAddForm(false);
        setUploadSuccess(false);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to finalize digital scripture upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Book
  const deleteBook = async (book: BookInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you absolutely sure you want to remove "${book.title}" from the Digital Library?`)) return;
    try {
      if (book.id.startsWith('seed_book_')) {
        setBooks(prev => prev.filter(b => b.id !== book.id));
        return;
      }
      await deleteDoc(doc(db, 'books', book.id));
      alert("Scripture deleted successfully.");
    } catch (err) {
      console.error("Delete error: ", err);
      alert("Failed to delete book.");
    }
  };

  // AI Chat submission
  const dealWithAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !activeBookForChat) return;

    const userMsg = userInput.trim();
    setUserInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiResponding(true);

    try {
      const historyPayload = chatMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const systemPrompt = `You are Terapanth AI, an expert theologian representing the Terapanth Sect of Jainism. 
Your current interaction mode is to provide insights on the classic PDF book titled: "${activeBookForChat.title}" authored by ${activeBookForChat.author}.
The book category is ${activeBookForChat.category}, and language is ${activeBookForChat.language}.

# AUTOMATED LAYOUT COMPATIBILITY MANDATE
Your objective is to ensure your raw text responses never cause overflow, layout compression, or cutoff lines inside the frontend mobile application viewports. Use correct semantic Markdown headers and elements, and never inject any arbitrary inline HTML <style> styles or tags into your text.

# CRITICAL LANGUAGE RULES:
1. Mirror the User's Language: Always respond in the EXACT same language and script the user writes in.
2. Hindi (Devanagari): If the user asks in Hindi (e.g., "नवकार मंत्र क्या है?"), respond in pure, respectful Hindi (Devanagari).
3. Hinglish (Roman Hindi): If the user asks in Hinglish (e.g., "Samayik kaise karein?"), respond in clear, easy-to-read Hinglish.
4. English: If the user asks in English (e.g., "What is the history of Terapanth?"), respond in English.

# TONE & KNOWLEDGE SPECIFICATION:
Greet the user with 'Jai Jinendra' and respectfully address them using 'Bhaisahab'. Base your answers strictly on authentic Jain Agamas, the philosophy of Anekantavada, and Terapanth Dharmasangh history. Maintain a detached (Weetragi) and polite stance.

Book Summary Background:
"${activeBookForChat.description}"

Guidelines:
1. Ground all answers perfectly in classical Jain Terapanth records, non-violence principles, self-conquest, and the instructions of Acharya Bhikshu.
2. If any query asks about quotes or practices mentioned in"${activeBookForChat.title}", contextualize how they align with the 11 Acharyas' history.
3. Keep layout easily scannable and beautiful, using clear structures. Say things strictly, humbly and professionally, fitting traditional monk principles.`;

      setChatMessages(prev => [...prev, { sender: 'ai', text: '' }]);

      let responseBuffer = '';
      const stream = streamGeminiResponse(userMsg, historyPayload);
      for await (const chunk of stream) {
        responseBuffer += chunk;
        setChatMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { sender: 'ai', text: responseBuffer };
          return next;
        });
      }
    } catch (err) {
      console.error("Gemini context streaming error: ", err);
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Forgive me, I encountered a temporary disturbance connecting with the server-side API memory. Please re-state your noble question." }]);
    } finally {
      setAiResponding(false);
    }
  };

  return (
    <div className="w-full bg-slate-50/70 dark:bg-zinc-950/40 rounded-2xl border border-black/5 dark:border-white/5 p-4 sm:p-6 shadow-md transition-colors" id="digital-library-container">
      {/* Dynamic Inline CSS Injection from Rules */}
      <style>{`
        .book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 640px) {
          .book-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>

      {/* Header section with modern display typography */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.06] pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
              <BookOpen size={20} />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100">
              Terapanth Digital Library
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Explore authentic Jain Terapanth scriptures, books, manuals, and read with AI assistance.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {books.length <= 4 && (
            <button 
              onClick={triggerAutoSeed}
              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs text-slate-800 dark:text-slate-200 transition font-medium"
              title="Seed 4 foundational Terapanth scriptures instantly into Firestore"
            >
              Seed Library
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs hover:bg-orange-700 transition"
              id="btn-add-book"
            >
              {showAddForm ? <X size={15} /> : <Plus size={15} />}
              <span>{showAddForm ? "Close Form" : "Upload Manuscript"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Manuscript Form (Admin Only) */}
      <AnimatePresence>
        {showAddForm && isAdmin && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={handleAddNewBook} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/50 dark:bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-orange-200/50 dark:border-zinc-800 shadow-inner">
              <div className="col-span-1 md:col-span-2 flex items-center justify-between border-b border-orange-200/30 dark:border-zinc-800 pb-2 mb-2">
                <span className="text-sm font-semibold text-orange-950 dark:text-orange-400 flex items-center gap-1.5">
                  <SlidersHorizontal size={16} /> Enter Scripture Credentials (Admin Console)
                </span>
                <span className="text-[10px] text-slate-400">Fields marked * are mandatory</span>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Book Title *</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Preksha Dhyana Handbook"
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Author Field */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Author / Publisher *</label>
                <input 
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Acharya Mahaprajna"
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as BookInfo['category'])}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none text-slate-800 dark:text-slate-100"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Language *</label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none text-slate-800 dark:text-slate-100"
                >
                  {languages.slice(1).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Cover Image Source (Optional URL)</label>
                <input 
                  type="url"
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Description field */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Brief Description (Scripture Context) *</label>
                <textarea 
                  rows={2}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Write a clear, inspiring description detailing the lessons and vows in this text..."
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

              {/* Drag & Drop File Upload Pathway */}
              <div 
                className={`md:col-span-2 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-colors ${isDragging ? "border-orange-500 bg-orange-100/30" : "border-slate-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50"}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) {
                    setUploadedFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <UploadCloud size={28} className="text-slate-400 dark:text-slate-600 mb-1.5" />
                <span className="text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
                  {uploadedFile ? `Selected: ${uploadedFile.name}` : "Drag and Drop your PDF Book here, or"}
                </span>
                <label className="mt-1 cursor-pointer text-xs font-semibold text-orange-600 hover:text-orange-700 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-1 rounded shadow-sm hover:scale-105 transition-all">
                  Browse Files
                  <input 
                    type="file" 
                    accept=".pdf"
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
                    }}
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">Accepts PDF files only (Up to 10MB)</p>
              </div>

              {/* Errors/Progress/Success Alerts */}
              {isUploading && (
                <div className="md:col-span-2">
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">
                    <span>Uploading Scripture Manuscript to pathway...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="col-span-1 md:col-span-2 flex items-center gap-1.5 text-red-600 text-[11px] font-medium mt-1">
                  <AlertCircle size={14} />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="col-span-1 md:col-span-2 flex items-center gap-1.5 text-green-600 text-[11px] font-semibold mt-1">
                  <CheckCircle size={14} />
                  <span>Scriptures published to library catalog!</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium flex items-center gap-1"
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Publish Book</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Layout Grid */}
      <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900/45 p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.04] mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-600" size={16} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by book name, author, keywords..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-100 transition-all"
            />
          </div>

          <div className="flex gap-2">
            {/* Category selection */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c} value={c}>Category: {c}</option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                {languages.map(l => (
                  <option key={l} value={l}>Language: {l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Books Catalog */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-orange-600" size={32} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Accessing digital cache...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900/40 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 text-center">
          <FileText size={40} className="text-slate-300 dark:text-slate-700 mb-2" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Manuscripts Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            We couldn't find any scripture matches for your query. Try broadening your keywords or filters.
          </p>
        </div>
      ) : (
        <div className="book-grid" id="book-grid-items">
          {filteredBooks.map((book) => (
            <motion.div
              layout
              key={book.id}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-zinc-900 border border-black/[0.05] dark:border-white/[0.05] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col cursor-pointer group"
              onClick={() => setViewingBook(book)}
            >
              {/* PREMIUM BOOK LISTING IMAGE WRAPPER */}
              <div className="relative w-full h-40 bg-stone-100 rounded-xl overflow-hidden mb-2 border border-stone-200">
                <img 
                  src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80" 
                  alt="Jain Scriptures Collection" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 bg-stone-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
                  Rituals
                </span>
                <span className="absolute bottom-2 left-2 bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Hindi
                </span>
              </div>

              {/* Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-orange-600 transition" title={book.title}>
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                    <User size={10} />
                    <span className="truncate">{book.author}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                    {book.description}
                  </p>
                </div>

                {/* Footer specs */}
                <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-2.5 mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                    {book.fileSize}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-medium text-slate-400">
                      {book.downloadCount} downloads
                    </span>

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button
                        onClick={(e) => deleteBook(book, e)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:scale-110 transition"
                        title="Delete Book Specification"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Book Detailed & Companion AI Q&A Modal */}
      <AnimatePresence>
        {viewingBook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setViewingBook(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`bg-white dark:bg-zinc-900 rounded-2xl w-full ${distractionFreeMode ? 'max-w-2xl' : 'max-w-3xl'} overflow-hidden shadow-2xl flex flex-col md:flex-row relative max-h-[90vh] transition-all duration-300`}
              onClick={(e) => e.stopPropagation()}
            >
              {distractionFreeMode ? (() => {
                const bgThemeStyles = {
                  sepia: {
                    backgroundColor: '#FAF4E8',
                    color: '#433422',
                    borderColor: '#EADEC9'
                  },
                  white: {
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    borderColor: '#E2E8F0'
                  },
                  dark: {
                    backgroundColor: '#09090B',
                    color: '#F4F4F5',
                    borderColor: '#27272A'
                  }
                }[readerBgTheme];

                const isDarkBg = readerBgTheme === 'dark';
                const isSepiaBg = readerBgTheme === 'sepia';
                
                const textTitleColor = isDarkBg ? 'text-zinc-100' : isSepiaBg ? 'text-[#362A1B]' : 'text-slate-900';
                const textSubColor = isDarkBg ? 'text-zinc-400' : isSepiaBg ? 'text-[#7C6244]' : 'text-slate-500';
                const headingColor = isDarkBg ? 'text-orange-400' : isSepiaBg ? 'text-orange-700' : 'text-orange-600';
                const dividerColor = isDarkBg ? 'border-zinc-800' : isSepiaBg ? 'border-[#EADEC9]' : 'border-slate-200';

                const handleTextSelection = () => {
                  const selection = window.getSelection();
                  if (selection) {
                    const text = selection.toString().trim();
                    if (text.length > 0) {
                      setSelectedText(text);
                    }
                  }
                };

                return (
                  /* Immersive Distraction-Free Reader View with fade-in and slide-down animation */
                  <motion.div 
                    initial={{ opacity: 0, y: -25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={bgThemeStyles}
                    className="flex-1 flex flex-col h-[80vh] md:h-[600px] transition-colors relative"
                    id="distraction-free-reader"
                  >
                    {/* Top Header - Controls Bar */}
                    <div 
                      style={{ 
                        backgroundColor: readerBgTheme === 'sepia' ? '#EFE8D9' : readerBgTheme === 'white' ? '#F8FAFC' : '#18181B',
                        borderColor: readerBgTheme === 'sepia' ? '#DFD5C0' : readerBgTheme === 'white' ? '#E2E8F0' : '#27272A'
                      }}
                      className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b shrink-0 z-10 gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-orange-600 text-white rounded-md">
                          READING MODE
                        </span>
                        <h4 className="text-xs font-bold truncate max-w-[120px] sm:max-w-[200px]" style={{ color: bgThemeStyles.color }} title={viewingBook.title}>
                          {viewingBook.title}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Text-to-Speech (TTS) Controls */}
                        <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/10 dark:border-white/10 gap-1.5 shadow-sm">
                          <button
                            onClick={() => {
                              if (isSpeaking) {
                                pauseTTS();
                              } else {
                                startTTS();
                              }
                            }}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-all cursor-pointer text-orange-600 dark:text-orange-400"
                            title={isSpeaking ? "Pause Scripture Audio" : "Listen (TTS)"}
                            aria-label={isSpeaking ? "Pause audio reading" : "Listen to audio reading"}
                          >
                            {isSpeaking ? <Pause size={13} className="fill-orange-600 dark:fill-orange-400" /> : <Play size={13} className="fill-orange-600 dark:fill-orange-400" />}
                          </button>
                          
                          {(isSpeaking || isPaused) && (
                            <button
                              onClick={stopTTS}
                              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-all cursor-pointer text-slate-500 hover:text-red-500"
                              title="Stop Audio"
                              aria-label="Stop audio reading"
                            >
                              <Square size={11} className="fill-current" />
                            </button>
                          )}

                          <div className="flex items-center gap-1 border-l border-black/10 dark:border-white/10 pl-1.5">
                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400">Rate:</span>
                            <select
                              value={playbackSpeed}
                              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                              className="bg-transparent border-none text-[10px] font-bold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-300 pr-0.5"
                              title="Adjust audio playback rate"
                              aria-label="Audio playback speed multiplier"
                            >
                              <option value="0.75" className="dark:bg-zinc-900 text-slate-800 dark:text-slate-200">0.75x</option>
                              <option value="1.0" className="dark:bg-zinc-900 text-slate-800 dark:text-slate-200">1.0x</option>
                              <option value="1.25" className="dark:bg-zinc-900 text-slate-800 dark:text-slate-200">1.25x</option>
                              <option value="1.5" className="dark:bg-zinc-900 text-slate-800 dark:text-slate-200">1.5x</option>
                              <option value="2.0" className="dark:bg-zinc-900 text-slate-800 dark:text-slate-200">2.0x</option>
                            </select>
                          </div>
                        </div>

                        {/* Background Theme Selector */}
                        <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-black/10 dark:border-white/10">
                          {(['white', 'sepia', 'dark'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setReaderBgTheme(t)}
                              className={`px-2 py-1 text-[9px] font-black uppercase rounded cursor-pointer transition-all ${
                                readerBgTheme === t 
                                  ? 'bg-orange-600 text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        {/* Font Size Adjuster slider */}
                        <div className="flex items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-black/10 dark:border-white/10 gap-1.5">
                          <span className="text-[10px] font-bold">Size:</span>
                          <input
                            type="range"
                            min="14"
                            max="32"
                            value={readerFontSize}
                            onChange={(e) => setReaderFontSize(parseInt(e.target.value, 10))}
                            className="w-16 sm:w-20 h-1 bg-slate-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-600 focus:outline-none"
                            title="Adjust font size"
                            aria-label="Adjust font size slider in reader"
                          />
                          <span className="text-[10px] font-mono font-bold">{readerFontSize}px</span>
                        </div>

                        {/* Favorites Toggle Button */}
                        <button
                          onClick={() => setShowFavoritesTray(!showFavoritesTray)}
                          className="relative p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                          style={{ color: bgThemeStyles.color }}
                          title="View Saved Verses & Highlights"
                          aria-label="View Saved Verses"
                        >
                          <Heart size={15} className={savedVerses.some(v => v.bookId === viewingBook.id) ? "fill-orange-600 text-orange-600" : ""} />
                          {savedVerses.filter(v => v.bookId === viewingBook.id).length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                              {savedVerses.filter(v => v.bookId === viewingBook.id).length}
                            </span>
                          )}
                        </button>

                        {/* Firestore Bookmark Button */}
                        <button
                          onClick={saveReadingToFirestore}
                          disabled={isSavingToFirestore}
                          className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer relative ${isSavingToFirestore ? 'opacity-50' : ''}`}
                          style={{ color: bgThemeStyles.color }}
                          title={isBookmarkedInFirestore ? "Remove from Cloud Saved Readings" : "Save to Cloud Saved Readings"}
                          aria-label="Save to Cloud Saved Readings"
                        >
                          {isSavingToFirestore ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Bookmark size={15} className={isBookmarkedInFirestore ? "fill-orange-600 text-orange-600" : ""} />
                          )}
                        </button>

                        {/* Exit Distraction Free Toggle */}
                        <button
                          onClick={() => {
                            setDistractionFreeMode(false);
                            setShowFavoritesTray(false);
                            setSelectedText('');
                            stopTTS();
                          }}
                          className="flex items-center gap-1 py-1 px-2.5 bg-orange-600 hover:bg-orange-700 text-white text-[9px] font-black uppercase tracking-wider rounded transition-all active:scale-95 cursor-pointer shadow-sm"
                          title="Return to standard book companion mode"
                        >
                          Exit
                        </button>
                      </div>
                    </div>

                    {/* Subtle scroll progress bar */}
                    <div className="h-0.5 w-full bg-black/10 dark:bg-white/10 shrink-0 z-20 overflow-hidden">
                      <div 
                        className="h-full bg-orange-600 transition-all duration-75 ease-out" 
                        style={{ width: `${scrollProgress}%` }}
                      />
                    </div>

                    {/* Sacred Text Body Matter */}
                    <div 
                      ref={readerScrollerRef}
                      onScroll={(e) => {
                        const target = e.currentTarget;
                        if (viewingBook) {
                          localStorage.setItem('terapanth_reader_scroll_' + viewingBook.id, target.scrollTop.toString());
                        }
                        const maxScroll = target.scrollHeight - target.clientHeight;
                        const progress = maxScroll > 0 ? (target.scrollTop / maxScroll) * 100 : 0;
                        setScrollProgress(progress);
                      }}
                      className="flex-1 p-6 sm:p-10 overflow-y-auto select-text scroll-smooth relative" 
                      id="reader-body-scroller"
                      onMouseUp={handleTextSelection}
                      onTouchEnd={handleTextSelection}
                    >
                      <div className="max-w-xl mx-auto space-y-6 pb-24">
                        <div className={`text-center border-b pb-6 mb-6 ${dividerColor}`}>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded">
                            {viewingBook.category} • {viewingBook.language}
                          </span>
                          <h2 className={`serif-text font-black text-2xl sm:text-3xl leading-tight mt-4 ${textTitleColor}`}>
                            {viewingBook.title}
                          </h2>
                          <p className={`text-xs font-bold mt-1.5 ${textSubColor}`}>
                            Author: {viewingBook.author}
                          </p>
                        </div>

                        <div 
                          style={{ fontSize: `${readerFontSize}px` }}
                          className="leading-relaxed font-serif space-y-6 whitespace-pre-line select-text"
                          id="reader-rich-text-content"
                        >
                          {((BOOK_READING_CONTENT[viewingBook.id] || BOOK_READING_CONTENT['fallback'])
                            .split('\n\n')
                            .map((block, bIdx) => {
                              if (block.trim().startsWith('Chapter ')) {
                                return (
                                  <h3 key={bIdx} className={`text-base sm:text-lg font-bold font-sans mt-8 mb-4 border-b pb-1.5 ${headingColor} ${dividerColor}`}>
                                    {block}
                                  </h3>
                                );
                              }
                              
                              const isSaved = savedVerses.some(v => v.text === block && v.bookId === viewingBook.id);
                              
                              return (
                                <div key={bIdx} className="group relative pr-8">
                                  <p className="leading-relaxed font-serif select-text" style={{ color: bgThemeStyles.color }}>
                                    {block}
                                  </p>
                                  <button
                                    onClick={() => {
                                      if (isSaved) {
                                        setSavedVerses(prev => prev.filter(v => !(v.text === block && v.bookId === viewingBook.id)));
                                      } else {
                                        setSavedVerses(prev => [
                                          {
                                            id: Date.now().toString() + '-' + bIdx,
                                            bookId: viewingBook.id,
                                            bookTitle: viewingBook.title,
                                            text: block,
                                            timestamp: Date.now()
                                          },
                                          ...prev
                                        ]);
                                      }
                                    }}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                                    title={isSaved ? "Remove paragraph from Favorites" : "Bookmark paragraph to Favorites"}
                                    aria-label={isSaved ? "Remove paragraph from Favorites" : "Bookmark paragraph to Favorites"}
                                  >
                                    <Heart size={14} className={isSaved ? "fill-orange-600 text-orange-600" : "text-slate-400"} />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Floating Selection Tooltip/Pop-up */}
                      <AnimatePresence>
                        {selectedText && (
                          <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            className="sticky bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-100 p-3 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col gap-2 max-w-sm mx-auto z-30"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                <Sparkles size={11} /> Selected Scripture Passage
                              </span>
                              <button 
                                type="button"
                                onClick={() => {
                                  setSelectedText('');
                                  window.getSelection()?.removeAllRanges();
                                }} 
                                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <p className="text-[11px] leading-relaxed italic line-clamp-3 select-none text-slate-600 dark:text-slate-300">
                              "{selectedText}"
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                const isDuplicate = savedVerses.some(v => v.text === selectedText && v.bookId === viewingBook.id);
                                if (!isDuplicate) {
                                  setSavedVerses(prev => [
                                    {
                                      id: Date.now().toString(),
                                      bookId: viewingBook.id,
                                      bookTitle: viewingBook.title,
                                      text: selectedText,
                                      timestamp: Date.now()
                                    },
                                    ...prev
                                  ]);
                                }
                                setSelectedText('');
                                window.getSelection()?.removeAllRanges();
                              }}
                              className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Heart size={12} className="fill-white" />
                              <span>Save Highlighted Passage</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Saved Favorites & Highlights Overlay Side-Panel */}
                    <AnimatePresence>
                      {showFavoritesTray && (
                        <motion.div
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          className="absolute top-[60px] right-4 bottom-4 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col z-20 overflow-hidden text-slate-800 dark:text-slate-100"
                        >
                          <div className="p-3 border-b border-black/5 dark:border-white/5 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between">
                            <h5 className="text-[11px] font-black uppercase text-orange-600 dark:text-orange-400 flex items-center gap-1">
                              <Heart size={12} className="fill-orange-600 text-orange-600" />
                              <span>Saved Highlights ({savedVerses.filter(v => v.bookId === viewingBook.id).length})</span>
                            </h5>
                            <button
                              onClick={() => setShowFavoritesTray(false)}
                              className="p-1 rounded-full text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {savedVerses.filter(v => v.bookId === viewingBook.id).length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <Heart size={24} className="text-slate-300 dark:text-zinc-700 mb-2" />
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                  Drag selection over scripture text, or tap the heart next to a paragraph to save your favorite verses.
                                </p>
                              </div>
                            ) : (
                              savedVerses
                                .filter(v => v.bookId === viewingBook.id)
                                .map((verse) => (
                                  <div 
                                    key={verse.id} 
                                    className="p-2.5 rounded-lg bg-orange-50/40 dark:bg-zinc-950/40 border border-orange-500/10 hover:border-orange-500/30 transition flex flex-col gap-1.5 group/v text-left"
                                  >
                                    <p className="text-xs text-stone-800 dark:text-zinc-200 font-serif leading-relaxed line-clamp-4">
                                      "{verse.text}"
                                    </p>
                                    <div className="flex items-center justify-between border-t border-black/[0.03] dark:border-white/[0.03] pt-1.5 mt-1">
                                      <span className="text-[8px] text-slate-400">
                                        {new Date(verse.timestamp).toLocaleDateString()}
                                      </span>
                                      <div className="flex items-center gap-1.5 opacity-60 group-hover/v:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(verse.text);
                                          }}
                                          className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200 transition"
                                          title="Copy verse text"
                                        >
                                          Copy
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSavedVerses(prev => prev.filter(v => v.id !== verse.id));
                                          }}
                                          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                          title="Delete saved verse"
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Minimal Reading Footer */}
                    <div 
                      style={{ 
                        backgroundColor: readerBgTheme === 'sepia' ? '#EFE8D9' : readerBgTheme === 'white' ? '#F8FAFC' : '#18181B',
                        borderColor: readerBgTheme === 'sepia' ? '#DFD5C0' : readerBgTheme === 'white' ? '#E2E8F0' : '#27272A'
                      }}
                      className="px-6 py-2.5 border-t text-center select-none shrink-0"
                    >
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        Spiritual Svadhyaya • Terapanth AI Hub • Sacred Reading
                      </span>
                    </div>
                  </motion.div>
                );
              })() : (
                <>
                  {/* Left Column - Book Presentation details */}
                  <div className="md:w-5/12 bg-slate-50 dark:bg-zinc-950 p-6 flex flex-col justify-between border-r border-black/[0.05] dark:border-white/[0.05]">
                    <div>
                      <div className="relative w-full h-48 sm:h-56 bg-slate-200 dark:bg-zinc-900 rounded-xl overflow-hidden shadow-inner mb-4">
                        <img 
                          src={viewingBook.coverImageUrl} 
                          alt={viewingBook.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-orange-600 text-white">
                          {viewingBook.category}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight leading-snug">
                        {viewingBook.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                        <User size={12} /> {viewingBook.author}
                      </p>

                      <div className="flex gap-2 flex-wrap items-center mt-3">
                        <span className="text-[10px] shrink-0 font-bold bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Globe size={10} /> {viewingBook.language}
                        </span>
                        <span className="text-[10px] shrink-0 font-mono bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded font-bold">
                          {viewingBook.fileSize}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans mt-4 max-h-[120px] overflow-y-auto pr-1">
                        {viewingBook.description}
                      </p>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex flex-col gap-3 mt-6 border-t border-black/[0.05] dark:border-white/[0.05] pt-4">
                      
                      {/* Distraction-Free Reading Mode Toggle Container with integrated font size slider */}
                      <div className="bg-orange-50/50 dark:bg-orange-950/15 p-3 rounded-xl border border-orange-500/10 flex flex-col gap-2.5">
                        <button
                          onClick={() => setDistractionFreeMode(true)}
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow shadow-orange-600/10 transition cursor-pointer active:scale-[0.98]"
                          title="Open immersive reading mode for viewing scriptures"
                          id="btn-distraction-free-reading"
                        >
                          <BookOpen size={14} />
                          <span>Read (Distraction-Free)</span>
                        </button>
                        
                        {/* Integrated Font size controller slider */}
                        <div className="flex flex-col gap-1 px-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            <span>Scripture Text Size:</span>
                            <span className="font-mono text-orange-600 dark:text-orange-400">
                              {readerFontSize}px
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black text-slate-400">A-</span>
                            <input
                              type="range"
                              min="14"
                              max="32"
                              step="1"
                              value={readerFontSize}
                              onChange={(e) => setReaderFontSize(parseInt(e.target.value, 10))}
                              className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-600 focus:outline-none"
                              aria-label="Scripture Font Size Slider"
                              title="Scripture Font Size Slider"
                            />
                            <span className="text-[9px] font-black text-slate-400">A+</span>
                          </div>
                        </div>
                      </div>

                      {/* PDF Document and AI Companion Actions Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={viewingBook.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            registerDownload(viewingBook);
                          }}
                          className="flex items-center justify-center gap-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border border-black/5 dark:border-white/5 transition text-center"
                          title="Open raw PDF file in new browser tab"
                        >
                          <Download size={12} />
                          <span>PDF Link</span>
                        </a>

                        <button
                          onClick={() => {
                            setActiveBookForChat(viewingBook);
                          }}
                          className="flex items-center justify-center gap-1 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[11px] font-semibold transition cursor-pointer"
                          title="Open AI Companion to ask questions"
                        >
                          <Sparkles size={12} />
                          <span>Ask AI</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setViewingBook(null)}
                        className="w-full py-1 text-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-[10px] transition font-medium cursor-pointer"
                      >
                        Close info
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Ask AI Chat Interface (Selected book specific) */}
                  <div className="flex-1 p-6 flex flex-col justify-between max-h-[50vh] md:max-h-none h-[420px] md:h-auto">
                    <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3 shrink-0">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-orange-600 flex items-center gap-0.5">
                          <Sparkles size={10} /> Powered by Gemini
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          Ask AI about "{viewingBook.title}"
                        </h4>
                      </div>
                      <button 
                        onClick={() => setViewingBook(null)}
                        className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Sub Panel: Inactive Setup / Active chat dialogue */}
                    {activeBookForChat?.id !== viewingBook.id ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <Sparkles size={36} className="text-orange-500/70 mb-2" />
                        <h5 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Scripture AI Companion</h5>
                        <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-relaxed">
                          Initialize the AI Companion to ask detailed philosophical or structural questions about this text's verses and traditional context.
                        </p>
                        <button
                          onClick={() => setActiveBookForChat(viewingBook)}
                          className="mt-3 px-3 py-1.5 text-xs font-semibold rounded bg-orange-600 text-white hover:bg-orange-700 transition flex items-center gap-1.5 shadow"
                        >
                          <Sparkles size={11} /> Launch AI Companion
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Chat Messages Container */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 my-1">
                          {chatMessages.map((msg, idx) => (
                            <div 
                              key={idx}
                              className={`flex items-start gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                            >
                              <span className={`p-1.5 rounded-full shrink-0 ${msg.sender === 'user' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-orange-600'}`}>
                                {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                              </span>
                              <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-tl-none font-sans'}`}>
                                {msg.text ? msg.text : <Loader2 size={12} className="animate-spin text-orange-600 py-1" />}
                              </div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input form */}
                        <form onSubmit={dealWithAiChat} className="flex gap-1.5 border-t border-black/[0.05] dark:border-white/[0.05] pt-3 shrink-0">
                          <input 
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={`Ask anything about ${viewingBook.title}...`}
                            className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-slate-100"
                            disabled={aiResponding}
                          />
                          <button
                            type="submit"
                            className="p-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-55 transition shrink-0"
                            disabled={aiResponding || !userInput.trim()}
                          >
                            <Send size={14} />
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
