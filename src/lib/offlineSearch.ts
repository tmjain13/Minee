import { openDB } from 'idb';

const DB_NAME = 'terapanth_knowledge_db';
const INVERTED_INDEX_STORE = 'inverted_index';
const DOCS_STORE = 'knowledge_docs';

// Initialize the database
export const initSearchDB = async () => {
  return openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains('knowledge_index')) {
          db.deleteObjectStore('knowledge_index');
        }
      }
      if (!db.objectStoreNames.contains(INVERTED_INDEX_STORE)) {
        db.createObjectStore(INVERTED_INDEX_STORE, { keyPath: 'term' });
      }
      if (!db.objectStoreNames.contains(DOCS_STORE)) {
        db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
      }
    },
  });
};

const tokenize = (text: string) => {
  if (!text) return [];
  return Array.from(new Set(
    text.toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/gi, ' ') // Include Devanagari range
      .split(/\s+/)
      .filter(w => w.length > 2)
  ));
};

// Store an array of knowledge items and build the inverted index
export const cacheKnowledgeForOffline = async (items: any[]) => {
  try {
    const db = await initSearchDB();
    const tx = db.transaction([DOCS_STORE, INVERTED_INDEX_STORE], 'readwrite');
    const docsStore = tx.objectStore(DOCS_STORE);
    const indexStore = tx.objectStore(INVERTED_INDEX_STORE);
    
    await docsStore.clear();
    await indexStore.clear();
    
    const indexMap = new Map<string, Set<string>>();

    for (const item of items) {
      await docsStore.put(item);
      
      const combinedText = `${item.title || ''} ${item.description || ''} ${item.details || ''} ${item.tags?.join(' ') || ''}`;
      const tokens = tokenize(combinedText);
      
      for (const token of tokens) {
        if (!indexMap.has(token)) {
          indexMap.set(token, new Set());
        }
        indexMap.get(token)!.add(item.id);
      }
    }
    
    // Store inverted index
    for (const [term, docIds] of Array.from(indexMap.entries())) {
      await indexStore.put({ term, docIds: Array.from(docIds) });
    }
    
    await tx.done;
    return true;
  } catch (error) {
    console.error('Failed to cache knowledge:', error);
    return false;
  }
};

// Search the cached knowledge items using the inverted index
export const searchOfflineKnowledge = async (query: string) => {
  try {
    if (!query || query.trim() === '') return [];
    
    const tokens = tokenize(query);
    if (tokens.length === 0) return [];
    
    const db = await initSearchDB();
    
    let resultDocIds: Set<string> | null = null;
    
    // For each token, find matching documents and intersect them (AND operation)
    for (const token of tokens) {
      const indexEntry = await db.get(INVERTED_INDEX_STORE, token);
      
      if (!indexEntry) {
        // If any token has no matches in an AND search, return empty
        return [];
      }
      
      const docIds = new Set<string>(indexEntry.docIds);
      
      if (resultDocIds === null) {
        resultDocIds = docIds;
      } else {
        const intersection = new Set<string>();
        for (const id of Array.from(resultDocIds)) {
          if (docIds.has(id)) {
            intersection.add(id);
          }
        }
        resultDocIds = intersection;
      }
      
      if (resultDocIds.size === 0) break;
    }
    
    if (!resultDocIds || resultDocIds.size === 0) return [];
    
    // Fetch actual documents
    const results = [];
    for (const id of Array.from(resultDocIds)) {
      const doc = await db.get(DOCS_STORE, id);
      if (doc) results.push(doc);
    }
    
    return results;
  } catch (error) {
    console.error('Failed to search offline knowledge:', error);
    return [];
  }
};

// Get all offline knowledge items
export const getOfflineKnowledge = async () => {
  try {
    const db = await initSearchDB();
    return await db.getAll(DOCS_STORE);
  } catch (error) {
    console.error('Failed to get offline knowledge:', error);
    return [];
  }
};

