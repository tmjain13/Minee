import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cacheKnowledgeForOffline } from '../lib/offlineSearch';
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
              localStorage.setItem('terapanth_dynamic_qas', JSON.stringify(dynamicQAs));
              localStorage.setItem('knowledge_base_sync_progress', '30');
            } catch (firestoreError) {
              console.warn("Firestore sync deferred or offline:", firestoreError);
            }
          } else {
            // Load previously saved dynamic QAs from localStorage if offline
            try {
              const localQAs = localStorage.getItem('terapanth_dynamic_qas');
              if (localQAs) {
                dynamicQAs = JSON.parse(localQAs);
              }
            } catch (e) {
              console.error("Failed to parse cached dynamic QAs:", e);
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
