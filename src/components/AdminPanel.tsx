import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Save, BookOpen, Quote as QuoteIcon, CheckCircle, Trash2, Pen, MessageCircle, ThumbsUp, ThumbsDown, Clock, BarChart2, ShieldAlert, Map, Database, RefreshCw, CloudUpload, Eye } from 'lucide-react';
import { db, auth, storage } from '../lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, setDoc, deleteDoc, query, orderBy, onSnapshot, writeBatch, limit, getCountFromServer } from 'firebase/firestore';
import { KnowledgeItem } from '../data/knowledge';
import { safeStringify } from '../lib/safe-json';
import { CHATURMAS_MASTER_2026 } from '../data/chaturmas2026';

import AdminGuard from './AdminGuard';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeItems: KnowledgeItem[];
  isAdmin: boolean;
}

export default function AdminPanel({ isOpen, onClose, knowledgeItems, isAdmin }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'quote' | 'feedback' | 'polls' | 'security' | 'chaturmas' | 'books' | 'analytics'>('knowledge');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [pollCounts, setPollCounts] = useState<Record<string, number>>({});
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);

  // Analytics States
  const [tabVisits, setTabVisits] = useState<Record<string, number>>({});
  const [generalAnalytics, setGeneralAnalytics] = useState<any>({});
  const [queryLogs, setQueryLogs] = useState<any[]>([]);

  // Books Upload Form States
  const [bTitle, setBTitle] = useState('');
  const [bAuthor, setBAuthor] = useState('');
  const [bCategory, setBCategory] = useState('Philosophy');
  const [bDesc, setBDesc] = useState('');
  const [bLang, setBLang] = useState('Hindi');
  const [bPages, setBPages] = useState(48);
  const [bIsPublic, setBIsPublic] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingBooks, setExistingBooks] = useState<any[]>([]);

  // Dynamic Q&A Form
  const [dynQuestion, setDynQuestion] = useState('');
  const [dynExplanation, setDynExplanation] = useState('');
  const [dynCategory, setDynCategory] = useState('Doctrine');
  const [dynStatus, setDynStatus] = useState('');

  // Quote Form
  const [qText, setQText] = useState('');
  const [qAuthor, setQAuthor] = useState('');
  const [qDate, setQDate] = useState('');

  // Poll Form
  const [pQuestion, setPQuestion] = useState('');
  const [pOptions, setPOptions] = useState(['', '']);

  // Chaturmas Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; error?: string; count?: number }>({});

  const handleAddDynamicQA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dynQuestion.trim() || !dynExplanation.trim()) return;

    setIsSubmitting(true);
    setDynStatus('');

    try {
      await addDoc(collection(db, 'dynamic_qas'), {
        id: `q_dynamic_${Date.now()}`,
        question: dynQuestion,
        explanation: dynExplanation,
        category: dynCategory,
        createdAt: serverTimestamp()
      });

      setDynStatus('✅ Successfully added to the Terapanth Knowledge Base!');
      setDynQuestion('');
      setDynExplanation('');
      triggerSuccess();
    } catch (error) {
      console.error(error);
      setDynStatus('❌ Error uploading. Ensure you have admin permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChaturmasSync = async () => {
    setIsSyncing(true);
    setSyncStatus({});
    try {
      const batch = writeBatch(db);
      CHATURMAS_MASTER_2026.forEach((item) => {
        const itemRef = doc(db, 'chaturmas_registry_2026', String(item.id));
        batch.set(itemRef, item, { merge: true });
      });
      await batch.commit();
      setSyncStatus({ success: true, count: CHATURMAS_MASTER_2026.length });
      triggerSuccess();
    } catch (err: any) {
      console.error("Chaturmas sync error: ", err);
      setSyncStatus({ error: err.message || String(err) });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !isAdmin) return;
    
    // Fetch Knowledge Feedback
    const qF = query(collection(db, 'knowledge_feedback'), orderBy('timestamp', 'desc'));
    const unsubF = onSnapshot(qF, (snapshot) => {
      setFeedback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Error fetching feedback:', err);
    });

    // Fetch Polls
    const qP = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    const unsubP = onSnapshot(qP, (snapshot) => {
      setPolls(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Error fetching polls:', err);
    });

    // Fetch Security Logs
    const qS = query(collection(db, 'security_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubS = onSnapshot(qS, (snapshot) => {
      setSecurityLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Error fetching security logs:', err);
    });

    // Fetch Books
    const qB = query(collection(db, 'books'), orderBy('uploadedAt', 'desc'));
    const unsubB = onSnapshot(qB, (snapshot) => {
      setExistingBooks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Error fetching books:', err);
    });

    // Fetch Tab Visits Analytics
    const unsubTabs = onSnapshot(doc(db, 'app_analytics', 'tab_visits'), (docSnap) => {
      if (docSnap.exists()) {
        setTabVisits(docSnap.data() as Record<string, number>);
      }
    }, (err) => {
      console.warn('Error fetching tab visits analytics:', err);
    });

    // Fetch General Analytics
    const unsubGeneral = onSnapshot(doc(db, 'app_analytics', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setGeneralAnalytics(docSnap.data());
      }
    }, (err) => {
      console.warn('Error fetching general analytics:', err);
    });

    // Fetch FAQ Queries Logs
    const qQueries = query(collection(db, 'faq_queries_logs'), orderBy('timestamp', 'desc'), limit(30));
    const unsubQueries = onSnapshot(qQueries, (snapshot) => {
      setQueryLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.warn('Error fetching faq queries logs:', err);
    });
    
    return () => {
      unsubF();
      unsubP();
      unsubS();
      unsubB();
      unsubTabs();
      unsubGeneral();
      unsubQueries();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || polls.length === 0) return;

    let isMounted = true;
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      for (const poll of polls) {
        try {
          const totalSnapshot = await getCountFromServer(collection(db, `polls/${poll.id}/votes`));
          counts[poll.id] = totalSnapshot.data().count;
        } catch (error) {
          console.error(`Error fetching votes count for admin poll ${poll.id}:`, error);
        }
      }
      if (isMounted) {
        setPollCounts(counts);
      }
    };

    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, [polls, isOpen]);

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'quotes'), {
        text: qText,
        author: qAuthor,
        date: qDate || new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      setQText('');
      setQAuthor('');
      setQDate('');
      triggerSuccess();
    } catch (err: any) {
      console.error(err?.message || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Please choose a valid PDF book file.");
      return;
    }
    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      let coverUrl = "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=60"; // fallback
      let fileUrl = "";

      // 1. Upload Cover Image, if provided
      if (coverFile) {
        const coverRef = storageRef(storage, `books_metadata/covers/${Date.now()}_${coverFile.name}`);
        const coverUploadTask = uploadBytesResumable(coverRef, coverFile);
        await coverUploadTask;
        coverUrl = await getDownloadURL(coverUploadTask.snapshot.ref);
        setUploadProgress(40);
      }

      // 2. Upload PDF Document file
      const pdfRef = storageRef(storage, `books_metadata/pdfs/${Date.now()}_${pdfFile.name}`);
      const pdfUploadTask = uploadBytesResumable(pdfRef, pdfFile);

      // Track progress
      pdfUploadTask.on('state_changed', 
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 50) + 40;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error("PDF upload error: ", error);
        }
      );

      await pdfUploadTask;
      fileUrl = await getDownloadURL(pdfUploadTask.snapshot.ref);
      setUploadProgress(95);

      // 3. Create document in Firestore
      const fileSizeStr = `${(pdfFile.size / 1024 / 1024).toFixed(1)} MB`;
      const bookData = {
        title: bTitle,
        author: bAuthor,
        category: bCategory,
        description: bDesc,
        language: bLang,
        coverImageUrl: coverUrl,
        fileUrl: fileUrl,
        fileSize: fileSizeStr,
        totalPages: Number(bPages),
        downloadCount: 0,
        isPublic: bIsPublic,
        uploadedAt: serverTimestamp(),
        chapters: ["Invocation & Significance", "Historical Context", "Spiritual Teachings", "Practical Integration", "Summary Conclusion"]
      };

      await addDoc(collection(db, 'books'), bookData);

      // Reset
      setBTitle('');
      setBAuthor('');
      setBDesc('');
      setBPages(48);
      setBIsPublic(true);
      setCoverFile(null);
      setPdfFile(null);
      setUploadProgress(100);
      triggerSuccess();
    } catch (err: any) {
      console.error(err);
      alert("Failed creating book: " + (err.message || String(err)));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleSeedBooks = async () => {
    setIsSubmitting(true);
    try {
      const SEED_DATA = [
        {
          title: "Navkar Mahamantra",
          author: "Acharya Mahaprajna",
          category: "Philosophy",
          description: "An in-depth scientific and spiritual exploration of the healing vibrations and supreme divinity of chanting the Navkar Mahamantra.",
          coverImageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=60",
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          fileSize: "1.2 MB",
          totalPages: 48,
          language: "Hindi",
          downloadCount: 420,
          isPublic: true,
          uploadedAt: serverTimestamp(),
          chapters: ["Invocation & Significance", "Chanting Vibrations", "Cosmic Resonance", "Scientific Realization", "Daily Sadhana Practice", "Conclusion"]
        },
        {
          title: "Terapanth Shasan",
          author: "Acharya Tulsi",
          category: "History",
          description: "The historical lineage, central operational rules, constitutional tenets, and structural progression of the Jain Terapanth path.",
          coverImageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60",
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          fileSize: "2.8 MB",
          totalPages: 112,
          language: "English",
          downloadCount: 310,
          isPublic: true,
          uploadedAt: serverTimestamp(),
          chapters: ["Establishment (1760)", "Constitutional Maryada", "Anuvrat Foundation", "Monastic Training", "Sectarian Harmony", "Global Outreach"]
        },
        {
          title: "Preksha Meditation Manual",
          author: "Acharya Mahaprajna",
          category: "Meditation",
          description: "Comprehensive step-by-step instructions on practicing Kayotsarga, Dirgha Swas Preksha, and actively cleansing the psychic centers.",
          coverImageUrl: "https://i.postimg.cc/vBQqgYTT/IMG-20260516-WA0007.jpg",
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          fileSize: "3.5 MB",
          totalPages: 76,
          language: "Hindi",
          downloadCount: 840,
          isPublic: true,
          uploadedAt: serverTimestamp(),
          chapters: ["Origins of Preksha", "Kayotsarga (Relaxation)", "Shwas Preksha (Perception of Breathing)", "Anupreksha (Contemplation)", "Leshya Dhyana (Color Meditation)", "Psychic Center Activation"]
        }
      ];

      for (const b of SEED_DATA) {
        await addDoc(collection(db, 'books'), b);
      }
      triggerSuccess();
      alert("Succesfully seeded 3 comprehensive books into Granthalay!");
    } catch (err: any) {
      console.error(err);
      alert("Failed seeding books: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pOptions.some(opt => !opt.trim())) return;
    setIsSubmitting(true);
    try {
      const options = pOptions.map((text, i) => ({
        id: `opt-${i}`,
        text,
        votes: 0
      }));

      await addDoc(collection(db, 'polls'), {
        question: pQuestion,
        options,
        isActive: true,
        totalVotes: 0,
        createdAt: serverTimestamp()
      });

      setPQuestion('');
      setPOptions(['', '']);
      triggerSuccess();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-[var(--bg-cream)] rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-saffron/20 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-8 bg-saffron text-white flex items-center justify-between">
          <div>
            <h2 className="serif-text text-3xl font-bold">Admin Sanctuary</h2>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Preserving Spiritual Accuracy</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-saffron/10 px-8 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'knowledge' ? 'border-saffron text-saffron' : 'border-transparent text-gray-400'}`}
          >
            <div className="flex items-center gap-2">
              <Database size={16} /> Knowledge Base
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('books')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'books' ? 'border-saffron text-saffron' : 'border-transparent text-gray-400'}`}
          >
            <div className="flex items-center gap-2">
              <CloudUpload size={16} /> Upload Book
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('quote')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'quote' ? 'border-saffron text-saffron' : 'border-transparent text-gray-400'}`}
          >
            <div className="flex items-center gap-2">
              <QuoteIcon size={16} /> Daily Quote
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'feedback' ? 'border-saffron text-saffron' : 'border-transparent text-gray-400'}`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={16} /> User Feedback
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('polls')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'polls' ? 'border-saffron text-saffron' : 'border-transparent text-gray-400'}`}
          >
            <div className="flex items-center gap-2">
              <BarChart2 size={16} /> Polls
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'security' ? 'border-saffron text-saffron' : 'border-transparent text-gray-400'}`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} /> Security Logs
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('chaturmas')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'chaturmas' ? 'border-saffron text-saffron' : 'border-transparent text-gray-400'}`}
          >
            <div className="flex items-center gap-2">
              <Database size={16} /> Chaturmas Sync
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-6 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'analytics' ? 'border-saffron text-saffron' : 'border-transparent text-gray-400'}`}
          >
            <div className="flex items-center gap-2">
              <BarChart2 size={16} /> Usage Analytics
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-2xl flex items-center gap-3 text-sm font-bold"
            >
              <CheckCircle size={18} />
              Entry added successfully to the sacred records.
            </motion.div>
          )}

          {activeTab === 'knowledge' ? (
            <AdminGuard>
              <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-xl">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Terapanth Knowledge Manager</h1>
                  <p className="text-sm text-gray-500">Add new verified Q&As to the global database. These will automatically sync to all users' offline modes.</p>
                </div>

                <form onSubmit={handleAddDynamicQA} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select 
                      value={dynCategory} 
                      onChange={(e) => setDynCategory(e.target.value)}
                      className="w-full p-3 border border-saffron/20 rounded-xl focus:ring-2 focus:ring-saffron/20 bg-white dark:bg-zinc-800"
                    >
                      <option value="Doctrine">Doctrine & Philosophy</option>
                      <option value="Daily Practice">Daily Practice</option>
                      <option value="Meditation">Preksha Meditation</option>
                      <option value="History">History & Lineage</option>
                      <option value="General">General / Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Question</label>
                    <input 
                      type="text" 
                      value={dynQuestion} 
                      onChange={(e) => setDynQuestion(e.target.value)} 
                      className="w-full p-3 border border-saffron/20 rounded-xl focus:ring-2 focus:ring-saffron/20"
                      placeholder="e.g., What is the significance of Bhikshu Swami's charitra?"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Verified Answer (Explanation)</label>
                    <textarea 
                      value={dynExplanation} 
                      onChange={(e) => setDynExplanation(e.target.value)} 
                      className="w-full p-3 border border-saffron/20 rounded-xl h-32 focus:ring-2 focus:ring-saffron/20"
                      placeholder="Enter the canonical answer here..."
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-saffron hover:bg-saffron/90 shadow-md'}`}
                  >
                    {isSubmitting ? 'Syncing to Global Database...' : <><CloudUpload size={18} /> Deploy to Application</>}
                  </button>

                  {dynStatus && <p className="text-center font-medium mt-4 text-sm text-saffron">{dynStatus}</p>}
                </form>
              </div>
            </AdminGuard>
          ) : activeTab === 'books' ? (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Header with Seed trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
              <div>
                <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-200">Shasan Granthalay Management</h4>
                <p className="text-xs text-emerald-800/60 dark:text-emerald-200/50 mt-0.5">Configure authorized PDF scriptures, textbooks, and metadata with active storage links.</p>
              </div>
              <button
                type="button"
                onClick={handleSeedBooks}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer whitespace-nowrap"
              >
                {isSubmitting ? "Processing..." : "Seed Primary Books (1-Click)"}
              </button>
            </div>

            {/* Main Flex columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form container */}
              <form onSubmit={handleAddBook} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 border-b pb-3 mb-4">Add Celestial Book</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1 block mb-1">Book Title *</label>
                    <input 
                      type="text" 
                      required 
                      value={bTitle}
                      onChange={e => setBTitle(e.target.value)}
                      placeholder="e.g. Navkar Mahamantra"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1 block mb-1">Author *</label>
                      <input 
                        type="text" 
                        required 
                        value={bAuthor}
                        onChange={e => setBAuthor(e.target.value)}
                        placeholder="e.g. Acharya Mahaprajna"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1 block mb-1">Estimated Pages *</label>
                      <input 
                        type="number" 
                        required 
                        min={1}
                        value={bPages}
                        onChange={e => setBPages(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1 block mb-1">Syllabus Category *</label>
                      <select 
                        value={bCategory}
                        onChange={e => setBCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-saffron"
                      >
                        <option value="Philosophy">Philosophy (दर्शन)</option>
                        <option value="Meditation">Meditation (ध्यान)</option>
                        <option value="History">History (इतिहास)</option>
                        <option value="Biography">Biography (जीवनी)</option>
                        <option value="Rituals">Rituals & Guidelines (मर्यादा)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1 block mb-1">Language *</label>
                      <select 
                        value={bLang}
                        onChange={e => setBLang(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-saffron"
                      >
                        <option value="Hindi">Hindi</option>
                        <option value="English">English</option>
                        <option value="Rajasthani">Rajasthani</option>
                        <option value="Sanskrit">Sanskrit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1 block mb-1">Description Brief *</label>
                    <textarea 
                      required 
                      rows={3}
                      value={bDesc}
                      onChange={e => setBDesc(e.target.value)}
                      placeholder="Add an overview explaining the spiritual importance and target age group..."
                      className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1 block mb-2">Cover Thumbnail</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setCoverFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-900 file:text-gray-750 hover:file:bg-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1 block mb-2">Book PDF Document *</label>
                      <input 
                        type="file" 
                        accept=".pdf"
                        required
                        onChange={e => setPdfFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="py-2">
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-600 mb-1">
                        <span>Uploading Sacred Book Asset...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-saffron hover:bg-saffron/90 disabled:bg-gray-300 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-saffron/10 transition-all cursor-pointer"
                  >
                    {isSubmitting ? "Uploading Materials..." : "Upload & Deploy Granth"}
                  </button>
                </div>
              </form>

              {/* Books List Grid */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 border-b pb-3">Existing Scriptures ({existingBooks.length})</h3>
                </div>

                {existingBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <BookOpen size={48} className="stroke-[1] mb-3" />
                    <p className="text-xs font-bold text-gray-500">No books registered in Firestore books library yet.</p>
                    <p className="text-[10px] opacity-75 mt-1">Click the seed button above or fill the form to register one.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {existingBooks.map((bk) => (
                      <div key={bk.id} className="flex gap-4 p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-gray-900 hover:border-saffron/15 transition-all">
                        <img 
                          src={bk.coverImageUrl} 
                          alt={bk.title} 
                          className="w-12 h-16 object-cover rounded shadow-md shrink-0 border"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{bk.title}</h4>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete ${bk.title}?`)) {
                                  try {
                                    await deleteDoc(doc(db, 'books', bk.id));
                                    alert("Scripture removed successfully.");
                                  } catch (er: any) {
                                    alert("Failure: " + er.message);
                                  }
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-500/5 transition-colors shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate">by {bk.author}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                              {bk.category}
                            </span>
                            <span className="text-[9px] font-black uppercase bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md">
                              {bk.language}
                            </span>
                            <span className="text-[9px] font-mono text-gray-400">
                              {bk.fileSize} • {bk.totalPages} pgs
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'quote' ? (

            <form onSubmit={handleAddQuote} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">The Divine Quote</label>
                <textarea 
                  required
                  rows={4}
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  placeholder="Paste the Acharya's words here..."
                  className="w-full p-6 bg-white dark:bg-zinc-800 border border-saffron/10 dark:border-saffron/20 rounded-2xl focus:ring-2 focus:ring-saffron/20 transition-all font-serif text-xl italic text-spiritual resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Author (Acharya)</label>
                  <input 
                    required
                    value={qAuthor}
                    onChange={e => setQAuthor(e.target.value)}
                    placeholder="Acharya Shri..."
                    className="w-full p-4 bg-white dark:bg-zinc-800 border border-saffron/10 dark:border-saffron/20 rounded-2xl focus:ring-2 focus:ring-saffron/20 transition-all font-medium text-spiritual"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Display Date (Optional)</label>
                  <input 
                    type="date"
                    value={qDate}
                    onChange={e => setQDate(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-zinc-800 border border-saffron/10 dark:border-saffron/20 rounded-2xl focus:ring-2 focus:ring-saffron/20 transition-all font-medium text-spiritual"
                  />
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-5 bg-saffron text-white rounded-3xl font-bold shadow-xl shadow-saffron/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                 {isSubmitting ? "Storing Divine Words..." : <><Save size={20} /> Add Daily Quote</>}
              </button>

              <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-saffron/10">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Quick Seed Utility</h5>
                <button 
                  type="button"
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      await addDoc(collection(db, 'quotes'), {
                        text: "Purity of character and conduct is the highest wealth a human can possess.",
                        author: "Acharya Mahashraman",
                        date: "2026-05-24", // Tomorrow's Date
                        createdAt: serverTimestamp()
                      });
                      triggerSuccess();
                    } catch (err: any) {
                      console.error(err);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-spiritual/10 text-spiritual rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-spiritual/20 transition-all border-2 border-spiritual/20"
                >
                  Seed Tomorrow's Teaching (May 24)
                </button>
              </div>
              
              <div className="pt-8 opacity-40 italic text-[10px] text-center px-10">
                Quotes added here will be rotated based on the day of the month or assigned specifically by date.
              </div>
            </form>
          ) : activeTab === 'polls' ? (
            <div className="space-y-8">
               <form onSubmit={handleCreatePoll} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Poll Question</label>
                   <input 
                     required
                     value={pQuestion}
                     onChange={e => setPQuestion(e.target.value)}
                     placeholder="e.g. Which community event should we host next month?"
                     className="w-full p-4 bg-white dark:bg-zinc-800 border border-saffron/10 dark:border-saffron/20 rounded-2xl focus:ring-2 focus:ring-saffron/20 transition-all font-bold text-spiritual"
                   />
                 </div>

                 <div className="space-y-4">
                   <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Options</label>
                   {pOptions.map((opt, i) => (
                     <div key={i} className="flex gap-2">
                       <input 
                         required
                         value={opt}
                         onChange={e => {
                           const newOpts = [...pOptions];
                           newOpts[i] = e.target.value;
                           setPOptions(newOpts);
                         }}
                         placeholder={`Option ${i + 1}`}
                         className="flex-1 p-3 bg-white dark:bg-zinc-800 border border-saffron/10 dark:border-saffron/20 rounded-xl text-xs font-medium text-spiritual"
                       />
                       {pOptions.length > 2 && (
                         <button 
                           type="button"
                           onClick={() => setPOptions(pOptions.filter((_, idx) => idx !== i))}
                           className="p-3 text-red-400 hover:bg-red-50 rounded-xl"
                         >
                           <Trash2 size={16} />
                         </button>
                       )}
                     </div>
                   ))}
                   <button 
                    type="button"
                    onClick={() => setPOptions([...pOptions, ''])}
                    className="flex items-center gap-2 text-[10px] font-bold text-saffron uppercase tracking-widest hover:bg-saffron/5 px-4 py-2 rounded-lg transition-all"
                   >
                     <Plus size={14} /> Add Option
                   </button>
                 </div>

                 <button 
                   disabled={isSubmitting}
                   className="w-full py-5 bg-saffron text-white rounded-3xl font-bold shadow-xl shadow-saffron/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isSubmitting ? "Launching Poll..." : "Create Community Poll"}
                 </button>
               </form>

               <div className="border-t border-saffron/10 pt-6">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-spiritual mb-4">Past Polls</h4>
                 <div className="grid grid-cols-1 gap-4">
                   {polls.map(poll => (
                     <div key={poll.id} className="p-4 bg-white dark:bg-zinc-800 border border-saffron/10 dark:border-saffron/20 rounded-2xl flex items-center justify-between">
                       <div>
                         <p className="font-bold text-spiritual text-xs">{poll.question}</p>
                         <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">
                           {pollCounts[poll.id] ?? poll.totalVotes} Votes • {poll.isActive ? 'Active' : 'Closed'}
                         </p>
                       </div>
                       <div className="flex gap-2">
                         <button 
                          onClick={() => setDoc(doc(db, 'polls', poll.id), { isActive: !poll.isActive }, { merge: true })}
                          className={`p-2 rounded-full transition-colors ${poll.isActive ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                         >
                           {poll.isActive ? <Clock size={16} /> : <CheckCircle size={16} />}
                         </button>
                         <button 
                          onClick={() => deleteDoc(doc(db, 'polls', poll.id))}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          ) : activeTab === 'security' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-spiritual">Security Monitor</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">Live integrity Check</span>
                </div>
              </div>

              <div className="space-y-3">
                {securityLogs.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 italic text-xs">
                    No security threats or suspicious activities matching filters.
                  </div>
                ) : (
                  securityLogs.map(log => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={14} className="text-red-500" />
                          <span className="text-sm font-bold text-red-700">{log.type}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold">
                          {log.timestamp?.toDate().toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        <p className="line-clamp-1">User Agent: {log.userAgent}</p>
                        <p className="mt-1 font-bold text-[var(--text-spiritual)]">User: {log.userEmail || 'Unknown'}</p>
                        <p className="mt-1 font-mono text-[9px] bg-black/5 p-1 rounded">ID: {log.id}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === 'chaturmas' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#d97706] dark:text-amber-500">Chaturmas 2026 Global Sync</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">VS 2083 Registry</span>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/10 text-[#d97706] dark:text-amber-500 rounded-2xl">
                    <Database size={24} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-gray-800 dark:text-gray-100">Synchronize Master Declarations</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Upload and align all 10 verified 2026 Chaturmas declarations from the master config into Firestore. This ensures absolute real-time coordination across all users of Terapanth AI.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs text-gray-400 font-mono">
                    TargetPath: /chaturmas_registry_2026/{`{id}`}
                  </div>
                  <button
                    onClick={handleChaturmasSync}
                    disabled={isSyncing}
                    className="bg-[#d97706] hover:bg-amber-600 active:scale-95 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-md cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Syncing..." : "Trigger Live Sync"}
                  </button>
                </div>

                {syncStatus.success && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 rounded-2xl text-xs font-bold flex items-center gap-2"
                  >
                    <CheckCircle size={14} />
                    Sync Successful! Uploaded {syncStatus.count} verified chaturmas announcements to the cloud database.
                  </motion.div>
                )}

                {syncStatus.error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs font-bold"
                  >
                    Failed to sync: {syncStatus.error}
                  </motion.div>
                )}
              </div>

              {/* Small preview table */}
              <div className="space-y-3">
                <h6 className="text-[10px] font-black uppercase tracking-wider text-gray-500">Registry Items to Sync ({CHATURMAS_MASTER_2026.length})</h6>
                <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/5">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-black/5 dark:bg-white/5 text-gray-505 font-bold uppercase tracking-wider text-[9px]">
                        <th className="p-3">ID</th>
                        <th className="p-3">Monk (मुनि / साध्वी)</th>
                        <th className="p-3">Venue (स्थल)</th>
                        <th className="p-3">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {CHATURMAS_MASTER_2026.map(item => (
                        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="p-3 font-mono font-bold text-gray-400">{item.id}</td>
                          <td className="p-3 font-bold text-gray-700 dark:text-gray-200">{item.monkEn}</td>
                          <td className="p-3 text-gray-500 dark:text-gray-450">{item.venueEn}</td>
                          <td className="p-3 font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">{item.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'analytics' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9] dark:text-cyan-400">System Usage & FAQ Analytics</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-sky-100 dark:bg-sky-950/40 text-sky-600 px-3 py-1 rounded-full font-bold">Real-time Monitor</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl">
                    <BarChart2 size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total AI & FAQ Queries</div>
                    <div className="text-xl font-bold font-mono text-gray-800 dark:text-gray-100">{generalAnalytics.total_faq_queries || queryLogs.length || 0}</div>
                  </div>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <Eye size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Tab Visits</div>
                    <div className="text-xl font-bold font-mono text-gray-800 dark:text-gray-100">
                      {Object.values(tabVisits).reduce((a, b) => a + b, 0)}
                    </div>
                  </div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Database size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Indexed Topics</div>
                    <div className="text-xl font-bold font-mono text-gray-800 dark:text-gray-100">{knowledgeItems.length}</div>
                  </div>
                </div>
              </div>

              {/* Tab Traffic Bars */}
              <div className="bg-white dark:bg-black/10 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500">Distribution of Traffic per Tab Section</h5>
                <div className="space-y-3">
                  {['home', 'sadhana', 'panchang', 'knowledge', 'acharya', 'media', 'gallery', 'profile'].map(tabId => {
                    const count = tabVisits[tabId] || 0;
                    const maxCount = Math.max(...Object.values(tabVisits), 1);
                    const percentage = Math.min((count / maxCount) * 100, 100);
                    return (
                      <div key={tabId} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="capitalize text-gray-700 dark:text-gray-200 font-bold">{tabId}</span>
                          <span className="font-mono text-gray-400">{count} visits</span>
                        </div>
                        <div className="w-full bg-black/5 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-sky-400 to-sky-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Raw Search Keywords */}
              <div className="bg-white dark:bg-black/10 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500">Recent User Searches & FAQ Queries</h5>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-black/5 dark:divide-white/5 pr-2 custom-scrollbar">
                  {queryLogs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 italic text-xs">
                      No search query footprints recorded yet.
                    </div>
                  ) : (
                    queryLogs.map((log, index) => (
                      <div key={log.id || index} className="py-3 flex justify-between items-center text-xs gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-gray-400 font-bold">#{queryLogs.length - index}</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-200 truncate pr-2">"{log.query}"</span>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0 font-bold">
                          {log.timestamp && typeof log.timestamp.toDate === 'function' ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-spiritual">Community Feedback</h4>
                <span className="text-[9px] bg-saffron/10 text-saffron px-3 py-1 rounded-full font-bold">{feedback.length} Entries</span>
              </div>
              
              <div className="space-y-4">
                {feedback.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 italic text-xs">
                    No feedback received from the community yet.
                  </div>
                ) : (
                  feedback.map(item => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white dark:bg-zinc-800 border border-saffron/10 dark:border-saffron/20 rounded-[1.5rem] p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${item.type === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {item.type === 'up' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                          </div>
                          <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">
                             {item.type === 'up' ? 'Helpful' : 'Unhelpful'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold">
                           <Clock size={10} />
                           {item.timestamp?.toDate().toLocaleString()}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-bold text-spiritual text-sm">{item.itemTitle}</h5>
                        <p className="text-[10px] text-gray-400 mt-1">ID: {item.itemId}</p>
                      </div>
                      
                      <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                         <div className="text-[9px] font-medium text-gray-500 bg-black/5 px-2 py-0.5 rounded-full italic">
                            By: {item.userEmail || 'Anonymous'}
                         </div>
                         <button 
                           onClick={async () => {
                             if(confirm('Delete this feedback entry?')) {
                               await deleteDoc(doc(db, 'knowledge_feedback', item.id));
                             }
                           }}
                           className="text-red-400 hover:text-red-600 transition-colors"
                         >
                           <Trash2 size={12} />
                         </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
