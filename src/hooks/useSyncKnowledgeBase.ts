import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cacheKnowledgeForOffline, getCachedDynamicQAs, saveDynamicQAsToIndexedDB } from '../lib/offlineSearch';
import { KNOWLEDGE_BASE } from '../data/knowledge';
import { quizMaster } from '../data/quizMaster';
import { devLog } from '../lib/devLog';

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string;
  tags: string[];
}

/**
 * Silently runs in the background when the app opens.
 * Fetches newly added Admin Q&As and saves them locally for the Offline AI,
 * and rebuilds the inverted search index in a non-blocking background thread.
 * Returns the loaded knowledge items for dashboard search integration.
 */
export const useSyncKnowledgeBase = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(() => {
    // Initial static items to ensure zero lag on mount
    const quizItems = (quizMaster.jainQuizDatabase || []).map((q: any) => ({
      id: `quiz-${q.id}`,
      title: q.question,
      category: 'Philosophy',
      description: q.explanation || '',
      details: q.options?.join(', ') || '',
      tags: ['Quiz', 'FAQ']
    }));
    return [...KNOWLEDGE_BASE, ...quizItems];
  });

  // On mount, load cached dynamic QAs from IndexedDB to quickly update state
  useEffect(() => {
    const loadCachedOnMount = async () => {
      try {
        const cachedDynamic = await getCachedDynamicQAs();
        if (cachedDynamic && cachedDynamic.length > 0) {
          const quizItems = (quizMaster.jainQuizDatabase || []).map((q: any) => ({
            id: `quiz-${q.id}`,
            title: q.question,
            category: 'Philosophy',
            description: q.explanation || '',
            details: q.options?.join(', ') || '',
            tags: ['Quiz', 'FAQ']
          }));
          const allItems = [
            ...KNOWLEDGE_BASE,
            ...cachedDynamic,
            ...quizItems
          ];
          setKnowledgeItems(allItems);
          devLog("Initial load of dynamic QAs from IndexedDB successful.");
        }
      } catch (err) {
        console.warn("Failed to load cached dynamic QAs from IndexedDB on mount:", err);
      }
    };
    loadCachedOnMount();
  }, []);

  useEffect(() => {
    const syncDynamicData = async () => {
      // Defer execution entirely to a background timeout to ensure instant UI rendering
      setTimeout(async () => {
        try {
          localStorage.setItem('knowledge_base_sync_progress', '0');
          localStorage.setItem('knowledge_base_sync_status', 'indexing');

          let dynamicQAs: any[] = [];
          if (navigator.onLine) {
            try {
              const snapshot = await getDocs(collection(db, 'dynamic_qas'));
              dynamicQAs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              // Save to IndexedDB (as primary storage) and localStorage (as secondary backup)
              await saveDynamicQAsToIndexedDB(dynamicQAs);
              localStorage.setItem('terapanth_dynamic_qas', JSON.stringify(dynamicQAs));
              localStorage.setItem('knowledge_base_sync_progress', '30');
            } catch (firestoreError) {
              console.warn("Firestore sync deferred or offline, falling back to IndexedDB:", firestoreError);
              // If we are online but Firestore fails, try loading from IndexedDB first
              const cached = await getCachedDynamicQAs();
              if (cached && cached.length > 0) {
                dynamicQAs = cached;
              } else {
                try {
                  const localQAs = localStorage.getItem('terapanth_dynamic_qas');
                  if (localQAs) {
                    dynamicQAs = JSON.parse(localQAs);
                  }
                } catch (e) {
                  console.error("Failed to parse cached dynamic QAs from localStorage:", e);
                }
              }
            }
          } else {
            // Load previously saved dynamic QAs from IndexedDB (primary) or localStorage (backup) if offline
            try {
              const cached = await getCachedDynamicQAs();
              if (cached && cached.length > 0) {
                dynamicQAs = cached;
                devLog("Loaded dynamic QAs from IndexedDB while offline.");
              } else {
                const localQAs = localStorage.getItem('terapanth_dynamic_qas');
                if (localQAs) {
                  dynamicQAs = JSON.parse(localQAs);
                  devLog("Loaded dynamic QAs from localStorage fallback while offline.");
                }
              }
            } catch (e) {
              console.error("Failed to read cached dynamic QAs while offline:", e);
            }
          }

          // Build index items from static knowledge and quizMaster questions
          const quizItems = (quizMaster.jainQuizDatabase || []).map((q: any) => ({
            id: `quiz-${q.id}`,
            title: q.question,
            category: 'Philosophy',
            description: q.explanation || '',
            details: q.options?.join(', ') || '',
            tags: ['Quiz', 'FAQ']
          }));

          const allItems = [
            ...KNOWLEDGE_BASE,
            ...dynamicQAs,
            ...quizItems
          ];

          setKnowledgeItems(allItems);
          localStorage.setItem('knowledge_base_sync_progress', '60');

          // Build inverted index asynchronously via helper
          const success = await cacheKnowledgeForOffline(allItems);
          
          if (success) {
            localStorage.setItem('knowledge_base_sync_progress', '100');
            localStorage.setItem('knowledge_base_sync_status', 'completed');
            devLog("Offline Knowledge Base indexing complete!");
          } else {
            localStorage.setItem('knowledge_base_sync_status', 'failed');
          }
        } catch (error) {
          console.error("Failed to sync dynamic knowledge base and build index:", error);
          localStorage.setItem('knowledge_base_sync_status', 'failed');
        }
      }, 500); // Wait 500ms for app layout to finish mounting
    };

    syncDynamicData();
  }, []);

  return knowledgeItems;
};
