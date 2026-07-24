import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  X,
  BookOpen,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Tag,
  FileText,
  Crown,
  Flame,
  Compass,
  Filter,
  Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { KnowledgeItem } from "../hooks/useSyncKnowledgeBase";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeItems: KnowledgeItem[];
  isDarkMode: boolean;
  setActiveTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  knowledgeItems = [],
  isDarkMode,
  setActiveTab,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCloseOrBack = () => {
    if (selectedItem) {
      setSelectedItem(null);
    } else {
      onClose();
    }
  };

  const modalRef = useFocusTrap(isOpen, handleCloseOrBack);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSearchQuery("");
      setSelectedCategory("All");
      setSelectedItem(null);
    }
  }, [isOpen]);

  const [offlineResults, setOfflineResults] = useState<KnowledgeItem[]>([]);

  useEffect(() => {
    const fetchOfflineResults = async () => {
      if (!searchQuery.trim()) {
        setOfflineResults([]);
        return;
      }
      try {
        const { searchKnowledgeOffline } = await import("../hooks/useSyncKnowledgeBase");
        const results = await searchKnowledgeOffline(searchQuery);
        setOfflineResults(results);
      } catch (err) {
        console.error("Offline search failed:", err);
      }
    };

    const debounceTimer = setTimeout(fetchOfflineResults, 150);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Standardize categories into 'Philosophy', 'Acharyas', and 'Rituals'
  const getStandardizedCategory = (category: string) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("acharya") || cat.includes("lineage") || cat.includes("guru") || cat.includes("pattadhar")) {
      return "Acharyas";
    }
    if (
      cat.includes("ritual") ||
      cat.includes("rule") ||
      cat.includes("fast") ||
      cat.includes("samayik") ||
      cat.includes("pratikraman") ||
      cat.includes("vidhi") ||
      cat.includes("vrat") ||
      cat.includes("ashtami")
    ) {
      return "Rituals";
    }
    if (
      cat.includes("philosophy") ||
      cat.includes("anuvrat") ||
      cat.includes("dharma") ||
      cat.includes("tattva") ||
      cat.includes("gyan") ||
      cat.includes("siddhant") ||
      cat.includes("quiz") ||
      cat.includes("faq") ||
      cat.includes("history")
    ) {
      return "Philosophy";
    }
    return "Philosophy";
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: knowledgeItems.length, Philosophy: 0, Acharyas: 0, Rituals: 0 };
    knowledgeItems.forEach((item) => {
      const std = getStandardizedCategory(item.category);
      if (std === "Philosophy") counts.Philosophy++;
      else if (std === "Acharyas") counts.Acharyas++;
      else if (std === "Rituals") counts.Rituals++;
    });
    return counts;
  }, [knowledgeItems]);

  // Simple and highly effective scoring fuzzy-search logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    // If we have offline IndexedDB cached results, prefer them!
    if (offlineResults && offlineResults.length > 0) {
      return offlineResults;
    }

    const queryTerms = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    if (queryTerms.length === 0) return [];

    return knowledgeItems
      .map((item) => {
        let score = 0;
        const titleLower = (item.title || "").toLowerCase();
        const categoryLower = (item.category || "").toLowerCase();
        const descriptionLower = (item.description || "").toLowerCase();
        const detailsLower = (item.details || "").toLowerCase();
        const tagsLower = (item.tags || []).map((t) => t.toLowerCase());

        let matchesAll = true;
        for (const term of queryTerms) {
          let termScore = 0;

          if (titleLower.includes(term)) {
            termScore += titleLower.startsWith(term) ? 100 : 50;
          }
          if (categoryLower.includes(term)) {
            termScore += 30;
          }
          if (tagsLower.some((tag) => tag.includes(term))) {
            termScore += 40;
          }
          if (descriptionLower.includes(term)) {
            termScore += 20;
          }
          if (detailsLower.includes(term)) {
            termScore += 10;
          }

          if (termScore === 0) {
            matchesAll = false;
            break;
          }
          score += termScore;
        }

        return { item, score, matchesAll };
      })
      .filter((res) => res.matchesAll && res.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((res) => res.item);
  }, [searchQuery, knowledgeItems, offlineResults]);

  // Filtered display items combining Search + Category selection
  const activeDisplayItems = useMemo(() => {
    if (searchQuery.trim()) {
      if (selectedCategory === "All") return searchResults;
      return searchResults.filter(
        (item) => getStandardizedCategory(item.category) === selectedCategory
      );
    }
    // When no search query, if a specific category is chosen, display all items in that category
    if (selectedCategory !== "All") {
      return knowledgeItems.filter(
        (item) => getStandardizedCategory(item.category) === selectedCategory
      );
    }
    return [];
  }, [searchQuery, selectedCategory, searchResults, knowledgeItems]);

  // Suggestions for quick search
  const suggestions = useMemo(() => {
    return [
      { term: "Acharya Bhikshu", label: "आचार्य भिक्षु", type: "Acharyas" },
      { term: "Samayik", label: "सामायिक विधि", type: "Rituals" },
      { term: "Maryada Mahotsav", label: "मर्यादा महोत्सव", type: "Rituals" },
      { term: "Anuvrat", label: "अणुव्रत नियम", type: "Philosophy" },
      { term: "Pratikraman", label: "प्रतिक्रमण", type: "Rituals" },
    ];
  }, []);

  // Category Colors
  const getCategoryColor = (category: string) => {
    const std = getStandardizedCategory(category);
    if (std === "Acharyas") {
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-300 border-amber-200/40";
    }
    if (std === "Rituals") {
      return "bg-orange-100 text-orange-800 dark:bg-orange-950/45 dark:text-orange-300 border-orange-200/40";
    }
    return "bg-purple-100 text-purple-800 dark:bg-purple-950/45 dark:text-purple-300 border-purple-200/40";
  };

  const CATEGORIES = [
    { id: "All", label: "सभी / All", icon: Hash },
    { id: "Philosophy", label: "दर्शन / Philosophy", icon: Compass },
    { id: "Acharyas", label: "आचार्य / Acharyas", icon: Crown },
    { id: "Rituals", label: "अनुष्ठान / Rituals", icon: Flame },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 m-0 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef as React.RefObject<HTMLDivElement>}
            role="dialog"
            aria-modal="true"
            aria-label="Global Search"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-md h-[100dvh] sm:h-[85vh] sm:max-h-[700px] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl border ${
              isDarkMode
                ? "bg-stone-900 border-stone-800 text-white"
                : "bg-orange-50/95 border-orange-100 text-stone-900"
            }`}
          >
            {/* Header / Input Panel */}
            <div
              className={`p-4 border-b shrink-0 flex items-center gap-3 ${
                isDarkMode ? "border-stone-850 bg-stone-900" : "border-orange-100 bg-white"
              }`}
            >
              {selectedItem ? (
                <button
                  onClick={() => setSelectedItem(null)}
                  className={`p-2 rounded-lg transition-all active:scale-95 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800`}
                >
                  <ArrowLeft size={20} className="text-orange-500" />
                </button>
              ) : (
                <div className="text-orange-500">
                  <Search size={22} />
                </div>
              )}

              {!selectedItem ? (
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="खोजें: दर्शन, आचार्य, सामायिक, व्रत नियम..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 text-base font-medium outline-none border-none bg-transparent ${
                    isDarkMode ? "placeholder-stone-500 text-white" : "placeholder-stone-400 text-stone-850"
                  }`}
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider">
                    {getStandardizedCategory(selectedItem.category)}
                  </div>
                  <div className="text-base font-bold truncate">{selectedItem.title}</div>
                </div>
              )}

              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all active:scale-95 cursor-pointer ${
                  isDarkMode ? "hover:bg-stone-800 text-stone-400" : "hover:bg-orange-100/50 text-stone-500"
                }`}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Navigation Pills */}
            {!selectedItem && (
              <div
                className={`px-3 py-2 border-b shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
                  isDarkMode ? "border-stone-800 bg-stone-900/90" : "border-orange-100/80 bg-orange-50/50"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1 shrink-0">
                  <Filter size={11} /> श्रेणियां:
                </span>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  const count = categoryCounts[cat.id as keyof typeof categoryCounts] || 0;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm"
                          : isDarkMode
                          ? "bg-stone-850 border-stone-800 text-stone-300 hover:bg-stone-800"
                          : "bg-white border-orange-100 text-stone-700 hover:bg-orange-100/50"
                      }`}
                    >
                      <Icon size={12} className={isSelected ? "text-white" : "text-orange-500"} />
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : isDarkMode
                            ? "bg-stone-800 text-stone-400"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence mode="wait">
                {selectedItem ? (
                  /* DETAILS VIEW */
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-wrap gap-2 items-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md border ${getCategoryColor(
                          selectedItem.category
                        )}`}
                      >
                        {getStandardizedCategory(selectedItem.category)}
                      </span>
                      {(selectedItem.tags || []).map((tag, idx) => (
                        <span
                          key={idx}
                          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md border ${
                            isDarkMode
                              ? "bg-stone-800 text-stone-300 border-stone-700"
                              : "bg-white text-stone-600 border-stone-200"
                          }`}
                        >
                          <Tag size={8} /> {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xl font-extrabold text-orange-600 dark:text-orange-400 leading-snug">
                        {selectedItem.title}
                      </h2>
                      <p
                        className={`text-sm leading-relaxed font-medium ${
                          isDarkMode ? "text-stone-300" : "text-stone-700"
                        }`}
                      >
                        {selectedItem.description}
                      </p>
                    </div>

                    {selectedItem.details && (
                      <div
                        className={`p-4 rounded-2xl border space-y-2 ${
                          isDarkMode
                            ? "bg-stone-950/40 border-stone-800/80 text-stone-300"
                            : "bg-white border-orange-100 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider">
                          <FileText size={14} /> विस्तृत विवरण / Details
                        </div>
                        <div className="text-xs leading-relaxed whitespace-pre-wrap font-medium font-sans">
                          {selectedItem.details}
                        </div>
                      </div>
                    )}

                    {/* Quick navigation to related tab */}
                    <div className="pt-4 border-t border-dashed dark:border-stone-800 border-orange-100">
                      <button
                        onClick={() => {
                          const std = getStandardizedCategory(selectedItem.category);
                          if (std === "Rituals") {
                            setActiveTab("pratikraman");
                          } else if (std === "Acharyas") {
                            setActiveTab("acharya");
                          } else {
                            setActiveTab("knowledge");
                          }
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <span>संबंधित विभाग देखें / View Sector</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ) : searchQuery.trim() || selectedCategory !== "All" ? (
                  /* RESULTS OR CATEGORY FILTERED VIEW */
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                      <span>
                        {searchQuery.trim()
                          ? `खोज परिणाम / Search Results (${activeDisplayItems.length})`
                          : `${selectedCategory} सूची / Items (${activeDisplayItems.length})`}
                      </span>
                      {selectedCategory !== "All" && (
                        <span className="text-[10px] text-orange-500 lowercase font-medium">
                          फ़िल्टर: {selectedCategory}
                        </span>
                      )}
                    </div>

                    {activeDisplayItems.length > 0 ? (
                      activeDisplayItems.map((item) => {
                        const stdCat = getStandardizedCategory(item.category);
                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 active:scale-[0.99] cursor-pointer flex items-start gap-3.5 group ${
                              isDarkMode
                                ? "bg-stone-850 border-stone-800 hover:border-orange-500/40 hover:bg-stone-800/80 text-white"
                                : "bg-white border-orange-100 hover:border-orange-300 hover:bg-orange-50/40 text-stone-900 shadow-xs"
                            }`}
                          >
                            <div
                              className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                                stdCat === "Acharyas"
                                  ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400"
                                  : stdCat === "Rituals"
                                  ? "bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-400"
                                  : "bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/30 dark:border-purple-900/50 dark:text-purple-400"
                              }`}
                            >
                              {stdCat === "Acharyas" ? (
                                <Crown size={18} />
                              ) : stdCat === "Rituals" ? (
                                <Flame size={18} />
                              ) : (
                                <Compass size={18} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`px-2 py-0.5 text-[8px] uppercase font-bold tracking-widest rounded-md border ${getCategoryColor(
                                    item.category
                                  )}`}
                                >
                                  {stdCat}
                                </span>
                                <ChevronRight
                                  size={14}
                                  className="text-stone-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all"
                                />
                              </div>
                              <h3 className="font-bold text-sm leading-snug truncate group-hover:text-orange-500 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 space-y-3">
                        <div className="text-orange-400 flex justify-center">
                          <X size={36} className="stroke-[1.5]" />
                        </div>
                        <div className="text-sm font-bold text-stone-500">कोई परिणाम नहीं मिला / No matches found</div>
                        <p className="text-xs text-stone-400 max-w-[280px] mx-auto leading-relaxed">
                          कृपया अन्य कीवर्ड खोजें या श्रेणी बदलें।
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* SUGGESTIONS VIEW + CATEGORY CARDS */
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Featured Category Quick Browse Cards */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1">
                        <Filter size={13} className="text-orange-500" /> मुख्य विषय श्रेणियां / Key Categories
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          onClick={() => setSelectedCategory("Philosophy")}
                          className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between gap-2 group ${
                            isDarkMode
                              ? "bg-purple-950/20 border-purple-900/30 hover:border-purple-700/50"
                              : "bg-purple-50/70 border-purple-100 hover:border-purple-200"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                              <Compass size={18} />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                              {categoryCounts.Philosophy} items
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-xs text-purple-900 dark:text-purple-200 group-hover:text-purple-600 transition-colors">
                              दर्शन / Philosophy
                            </div>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5 line-clamp-2">
                              अणुव्रत, प्रेक्षाध्यान एवं जैन सिद्धांत
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={() => setSelectedCategory("Acharyas")}
                          className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between gap-2 group ${
                            isDarkMode
                              ? "bg-amber-950/20 border-amber-900/30 hover:border-amber-700/50"
                              : "bg-amber-50/70 border-amber-100 hover:border-amber-200"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
                              <Crown size={18} />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                              {categoryCounts.Acharyas} items
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-xs text-amber-900 dark:text-amber-200 group-hover:text-amber-600 transition-colors">
                              आचार्य / Acharyas
                            </div>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5 line-clamp-2">
                              आचार्य भिक्षु से महाश्रमण जी तक 11 आचार्य
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={() => setSelectedCategory("Rituals")}
                          className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between gap-2 group ${
                            isDarkMode
                              ? "bg-orange-950/20 border-orange-900/30 hover:border-orange-700/50"
                              : "bg-orange-50/70 border-orange-100 hover:border-orange-200"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300">
                              <Flame size={18} />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-200/60 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200">
                              {categoryCounts.Rituals} items
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-xs text-orange-900 dark:text-orange-200 group-hover:text-orange-600 transition-colors">
                              अनुष्ठान / Rituals
                            </div>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5 line-clamp-2">
                              सामायिक, प्रतिक्रमण एवं दैनिक व्रत नियम
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Popular Searches */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-stone-400">
                        <Sparkles size={14} className="text-amber-500" /> त्वरित खोज सुझाव / Popular Searches
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearchQuery(sug.term);
                              if (sug.type) setSelectedCategory(sug.type);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                              isDarkMode
                                ? "bg-stone-850 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800"
                                : "bg-white border-orange-100 text-stone-700 hover:text-orange-700 hover:bg-orange-50/50 shadow-xs"
                            }`}
                          >
                            <Search size={10} className="text-orange-500" />
                            <span>{sug.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Card */}
                    <div
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                        isDarkMode
                          ? "bg-orange-950/10 border-orange-900/30 text-stone-300"
                          : "bg-orange-50/50 border-orange-100/60 text-stone-700"
                      }`}
                    >
                      <BookOpen size={20} className="text-orange-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                          ज्ञानकोश खोज इंजन / Unified Search Engine
                        </h4>
                        <p className="text-xs leading-relaxed font-medium">
                          दर्शन (Philosophy), आचार्यों (Acharyas) और अनुष्ठानों (Rituals) के अंतर्गत वर्गीकृत जानकारी प्राप्त करने के लिए ऊपर दिए गए फ़िल्टर टैब या खोज बार का उपयोग करें।
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
