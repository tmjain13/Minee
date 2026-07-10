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
  ExternalLink 
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
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import { streamGeminiResponse } from '../services/geminiService';

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

export default function DigitalLibrary({ isAdmin }: DigitalLibraryProps) {
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
      const stream = streamGeminiResponse(userMsg, historyPayload, systemPrompt);
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
              className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
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
                <div className="flex flex-col gap-2 mt-6 border-t border-black/[0.05] dark:border-white/[0.05] pt-4">
                  {/* Read PDF link */}
                  <a
                    href={viewingBook.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      registerDownload(viewingBook);
                    }}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow shadow-orange-600/10 transition"
                  >
                    <BookOpen size={14} />
                    <span>Read Manuscript</span>
                    <ExternalLink size={10} className="opacity-70" />
                  </a>

                  {/* Companion AI Toggle */}
                  <button
                    onClick={() => {
                      setActiveBookForChat(viewingBook);
                    }}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/10 text-xs font-semibold transition"
                  >
                    <Sparkles size={14} className="animate-pulse" />
                    <span>Consult Terapanth AI Companion</span>
                  </button>

                  <button
                    onClick={() => setViewingBook(null)}
                    className="w-full py-1 text-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-[10px] transition font-medium"
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
                      Ask AI about "${viewingBook.title}"
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

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
