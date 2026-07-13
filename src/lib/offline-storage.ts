import { KnowledgeItem } from '../data/knowledge';
import { safeStringify } from './safe-json';
import { devLog } from './devLog';

const OFFLINE_KEY = 'terapanth_ai_offline_knowledge';
const BOOKMARKS_KEY = 'terapanth_ai_bookmarks';

// IndexedDB core database engine
class IndexedDBHelper {
  private dbName = 'terapanth_ai_db';
  private storeName = 'knowledge_base';
  private version = 1;

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      // Safe check for node/server-side environments during packaging compile
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported on this platform/environment'));
        return;
      }
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  public async getItems(): Promise<KnowledgeItem[]> {
    try {
      const db = await this.openDB();
      return new Promise<KnowledgeItem[]>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result as KnowledgeItem[]);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('IndexedDB recovery fallback used:', e);
      return [];
    }
  }

  public async saveItems(items: KnowledgeItem[]): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          if (items.length === 0) {
            resolve();
            return;
          }
          let completed = 0;
          let failed = false;

          items.forEach(item => {
            const req = store.put(item);
            req.onsuccess = () => {
              completed++;
              if (completed === items.length && !failed) {
                resolve();
              }
            };
            req.onerror = () => {
              if (!failed) {
                failed = true;
                reject(req.error);
              }
            };
          });
        };
        clearRequest.onerror = () => reject(clearRequest.error);
      });
    } catch (e) {
      console.error('IndexedDB write aborted:', e);
    }
  }
}

const idbHelper = new IndexedDBHelper();

export interface OfflineState {
  isOffline: boolean;
  isReadyForOffline: boolean;
}

// Memory caching layer to completely avoid layout paint cycles reading from disk/localStore
let memoryCache: KnowledgeItem[] | null = null;

export const OfflineStorage = {
  // Helper to safely stringify objects
  safeStringify: (obj: any, space?: string | number): string => {
    return safeStringify(obj, undefined, space);
  },

  // Asynchronously synchronize IndexedDB data with local synchronous cache state on startup
  warmupCache: async (): Promise<KnowledgeItem[]> => {
    try {
      // Warm up monastic helpline records (Kashids) using executeKashidSearch
      const { masterViharLedger, executeKashidSearch } = await import('../utils/viharSearchEngine');
      const allIndexedHelplineRecords = executeKashidSearch('', masterViharLedger);
      localStorage.setItem('terapanth_ai_offline_vihar_ledger', OfflineStorage.safeStringify(allIndexedHelplineRecords));
    } catch (err) {
      console.warn('Failed to pre-warm monastic helpline cache during OfflineStorage.warmupCache:', err);
    }

    try {
      const items = await idbHelper.getItems();
      if (items && items.length > 0) {
        memoryCache = items;
        // Mirror to localstorage for instant synchronous access before react loading renders
        localStorage.setItem(OFFLINE_KEY, OfflineStorage.safeStringify(items));
        return items;
      }
    } catch (err) {
      console.error('Failed to warmup Cache from IndexedDB:', err);
    }
    return OfflineStorage.getOfflineCache();
  },

  // Save specific knowledge items to multi-tiered storage (sync + async IndexedDB)
  saveToOfflineCache: (items: KnowledgeItem[]) => {
    try {
      const nowStr = new Date().toISOString();
      const timestamped = items.map(item => ({
        ...item,
        lastSyncedAt: (item as any).lastSyncedAt || nowStr
      }));
      
      // Tier 1: Update in-memory synchronous reference for active render loops
      memoryCache = timestamped;

      // Tier 2: Update synchronous LocalStorage reference for offline initialization
      localStorage.setItem(OFFLINE_KEY, OfflineStorage.safeStringify(timestamped));
      
      // Tier 3: Aggressively persist to high-scale asynchronous Structured IndexedDB
      idbHelper.saveItems(timestamped)
        .then(() => {
          devLog(`Aggressive IndexedDB cache populated successfully with ${timestamped.length} items.`);
        })
        .catch(err => {
          console.error('Core IndexedDB write transactional failure:', err);
        });

    } catch (e) {
      console.error('Failed to save to offline cache tiers:', e);
    }
  },

  getOfflineCache: (): KnowledgeItem[] => {
    try {
      // Highly optimized: Return from RAM cache first
      if (memoryCache && memoryCache.length > 0) {
        return memoryCache;
      }
      
      const data = localStorage.getItem(OFFLINE_KEY);
      if (data) {
        memoryCache = JSON.parse(data);
        return memoryCache || [];
      }
      return [];
    } catch (e) {
      console.error('Failed to parse offline cache:', e);
      return [];
    }
  },

  getItemSyncStatus: (itemId: string): { lastSyncedAt?: string; isOutOfSync: boolean } => {
    try {
      const cached = OfflineStorage.getOfflineCache();
      const item = cached.find((k: any) => k.id === itemId);
      if (!item) {
        return { isOutOfSync: true };
      }
      const syncTimeStr = (item as any).lastSyncedAt;
      if (!syncTimeStr) {
        return { isOutOfSync: true };
      }
      const lastSynced = new Date(syncTimeStr).getTime();
      const ageMs = Date.now() - lastSynced;
      const isOutOfSync = ageMs > 24 * 60 * 60 * 1000; // Stale if older than 24 hours
      return { lastSyncedAt: syncTimeStr, isOutOfSync };
    } catch {
      return { isOutOfSync: true };
    }
  },

  // Bookmark management (retains normal fast localstorage storage key)
  toggleBookmark: (itemId: string) => {
    const bookmarks = OfflineStorage.getBookmarks();
    const index = bookmarks.indexOf(itemId);
    if (index > -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(itemId);
    }
    localStorage.setItem(BOOKMARKS_KEY, OfflineStorage.safeStringify(bookmarks));
    return bookmarks;
  },

  getBookmarks: (): string[] => {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  isBookmarked: (itemId: string): boolean => {
    return OfflineStorage.getBookmarks().includes(itemId);
  },

  isSynced: (currentItems: KnowledgeItem[]): boolean => {
    const cached = OfflineStorage.getOfflineCache();
    // Synchronous checking loop helper
    return cached.length === currentItems.length;
  }
};
