import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, BookOpen, Sparkles, ChevronRight, ArrowLeft, Hash, Tag, FileText } from "lucide-react";
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

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSearchQuery("");
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

        // Check each term
        let matchesAll = true;
        for (const term of queryTerms) {
          let termScore = 0;

          if (titleLower.includes(term)) {
            // High priority: title match
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
  }, [searchQuery, knowledgeItems]);

  // Get categorized suggestions when query is empty
  const suggestions = useMemo(() => {
    // Return some prominent Acharyas, major Rituals, or key FAQs
    const defaultSuggestions = [
      { term: "Acharya Bhikshu", label: "आचार्य भिक्षु", type: "acharya" },
      { term: "Samayik", label: "सामायिक विधि", type: "ritual" },
      { term: "Maryada Mahotsav", label: "मर्यादा महोत्सव", type: "event" },
      { term: "Anuvrat", label: "अनुव्रत नियम", type: "philosophy" },
      { term: "Pratikraman", label: "प्रतिक्रमण", type: "ritual" },
    ];
    return defaultSuggestions;
  }, []);

  // Standardize categories as requested: 'Acharyas', 'Rituals', 'Knowledge'
  const getStandardizedCategory = (category: string) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("acharya") || cat.includes("lineage")) {
      return "Acharyas";
    }
    if (cat.includes("ritual") || cat.includes("rule") || cat.includes("fast")) {
      return "Rituals";
    }
    return "Knowledge";
  };

  // Category Colors
  const getCategoryColor = (category: string) => {
    const standardized = getStandardizedCategory(category).toLowerCase();
    if (standardized === "acharyas") {
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-300 border-amber-200/40";
    }
    if (standardized === "rituals") {
      return "bg-orange-100 text-orange-800 dark:bg-orange-950/45 dark:text-orange-300 border-orange-200/40";
    }
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-300 border-emerald-200/40";
  };

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
                  placeholder="खोजें: आचार्य, सामायिक, व्रत नियम, आदि..."
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
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md border ${getCategoryColor(selectedItem.category)}`}>
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
                      <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? "text-stone-300" : "text-stone-700"}`}>
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

                    {/* Quick navigation to related tab if appropriate */}
                    <div className="pt-4 border-t border-dashed dark:border-stone-800 border-orange-100">
                      <button
                        onClick={() => {
                          const cat = selectedItem.category.toLowerCase();
                          if (cat.includes("ritual")) {
                            setActiveTab("pratikraman");
                          } else if (cat.includes("acharya")) {
                            setActiveTab("acharya");
                          } else if (cat.includes("quiz") || cat.includes("faq")) {
                            setActiveTab("quiz");
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
                ) : searchQuery.trim() ? (
                  /* SEARCH RESULTS VIEW */
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2.5"
                  >
                    <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                      खोज परिणाम / Search Results ({searchResults.length})
                    </div>

                    {searchResults.length > 0 ? (
                      searchResults.map((item) => (
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
                              isDarkMode
                                ? "bg-stone-900 border-stone-800 group-hover:bg-orange-950/20 group-hover:border-orange-950/30"
                                : "bg-orange-50 border-orange-100 group-hover:bg-orange-100 group-hover:border-orange-200"
                            }`}
                          >
                            <BookOpen size={18} className="text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`px-2 py-0.5 text-[8px] uppercase font-bold tracking-widest rounded-md border ${getCategoryColor(item.category)}`}>
                                {getStandardizedCategory(item.category)}
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
                      ))
                    ) : (
                      <div className="text-center py-12 space-y-3">
                        <div className="text-orange-400 flex justify-center">
                          <X size={36} className="stroke-[1.5]" />
                        </div>
                        <div className="text-sm font-bold text-stone-500">कोई परिणाम नहीं मिला / No matches found</div>
                        <p className="text-xs text-stone-400 max-w-[280px] mx-auto leading-relaxed">
                          कृपया अन्य कीवर्ड खोजें जैसे "Bhikshu", "Samayik", "Ahimsayatra", "Fast" या "Panchang"।
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* SUGGESTIONS VIEW */
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-stone-400">
                        <Sparkles size={14} className="text-amber-500" /> त्वरित सुझाव / Popular Searches
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(sug.term)}
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
                          ज्ञानकोश खोज इंजन / Unified Search
                        </h4>
                        <p className="text-xs leading-relaxed font-medium">
                          यह सर्च इंजन जैन तेरापंथ संप्रदाय के इतिहास, आचार्यों की जीवनी, दैनिक सामायिक एवं प्रतिक्रमण विधि, और सामान्य धार्मिक जिज्ञासाओं (Q&A) के माध्यम से त्वरित परिणाम प्रदान करता है।
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
