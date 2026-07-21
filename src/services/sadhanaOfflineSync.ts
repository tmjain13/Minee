import { openDB, IDBPDatabase } from 'idb';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  setDoc,
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  writeBatch
} from 'firebase/firestore';

const DB_NAME = 'terapanth-ai-sadhana-v2';
const DB_VERSION = 1;

export interface OfflineLog {
  id: string;
  storeName: 'fastingLogs' | 'mantraLogs' | 'diary' | 'meditationLogs';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Fasting records local store
        if (!db.objectStoreNames.contains('fastingLogs')) {
          db.createObjectStore('fastingLogs', { keyPath: 'id' });
        }
        // Mantra records local store
        if (!db.objectStoreNames.contains('mantraLogs')) {
          db.createObjectStore('mantraLogs', { keyPath: 'id' });
        }
        // Diary entries local store
        if (!db.objectStoreNames.contains('diary')) {
          db.createObjectStore('diary', { keyPath: 'id' });
        }
        // Meditation sessions local store
        if (!db.objectStoreNames.contains('meditationLogs')) {
          db.createObjectStore('meditationLogs', { keyPath: 'id' });
        }
        // Pending queue for sync when offline
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// Helper to determine online state
export function isOnline(): boolean {
  if (typeof window !== 'undefined' && window.localStorage.getItem('terapanth_offline_simulation') === 'true') {
    return false;
  }
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Generic getter from IndexedDB
 */
export async function getLocalData(storeName: 'fastingLogs' | 'mantraLogs' | 'diary' | 'meditationLogs'): Promise<any[]> {
  try {
    const database = await getDB();
    return await database.getAll(storeName);
  } catch (error) {
    console.error(`[IndexedDB] Error fetching from ${storeName}:`, error);
    return [];
  }
}

/**
 * Save data locally
 */
export async function saveLocalData(storeName: 'fastingLogs' | 'mantraLogs' | 'diary' | 'meditationLogs', data: any): Promise<void> {
  try {
    const database = await getDB();
    await database.put(storeName, data);
    console.log(`[IndexedDB] Cached item locally in ${storeName}:`, data.id);
  } catch (error) {
    console.error(`[IndexedDB] Error caching to ${storeName}:`, error);
  }
}

/**
 * Add a record to the synchronization queue
 */
export async function enqueueSync(
  storeName: 'fastingLogs' | 'mantraLogs' | 'diary' | 'meditationLogs',
  action: 'create' | 'update' | 'delete',
  id: string,
  data: any
): Promise<void> {
  try {
    const database = await getDB();
    const syncItem: OfflineLog = {
      id,
      storeName,
      action,
      data,
      timestamp: Date.now()
    };
    await database.put('syncQueue', syncItem);
    console.warn(`[Offline Sync] Restored offline queue. Enqueued ${action} for ${storeName} (ID: ${id})`);
  } catch (error) {
    console.error('[Offline Sync] Failed to enqueue item:', error);
  }
}

/**
 * General purpose offline-aware creator
 */
export async function createSadhanaRecord(
  userId: string,
  storeName: 'fastingLogs' | 'mantraLogs' | 'diary' | 'meditationLogs',
  recordData: any
): Promise<string> {
  const generatedId = recordData.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const finalRecord = {
    ...recordData,
    id: generatedId,
    userId,
    timestamp: recordData.timestamp || Date.now()
  };

  // 1. Save to local IndexedDB instantly for immediate UX responsiveness
  await saveLocalData(storeName, finalRecord);

  // 2. Sync / Queue choice
  if (isOnline()) {
    try {
      console.log(`[Sadhana Sync] Online. Saving ${storeName} to Firestore...`);
      const collectionPath = `users/${userId}/${storeName}`;
      
      // Remove local client-side prefix from ID before syncing if present, or let Firestore generate it
      const { id, ...dataToSync } = finalRecord;
      
      // Map timestamps correctly for Firestore
      const firestoreData = {
        ...dataToSync,
        timestamp: serverTimestamp()
      };

      if (id.startsWith('local_')) {
        const docRef = await addDoc(collection(db, collectionPath), firestoreData);
        // Update local store with the real Firestore ID
        const realId = docRef.id;
        const updatedLocal = { ...finalRecord, id: realId };
        
        const database = await getDB();
        await database.delete(storeName, id);
        await database.put(storeName, updatedLocal);
        console.log(`[Sadhana Sync] Successfully written to Firestore. Updated ID from ${id} -> ${realId}`);
        return realId;
      } else {
        await setDoc(doc(db, collectionPath, id), firestoreData);
        return id;
      }
    } catch (error) {
      console.error(`[Sadhana Sync] Error saving to Firestore. Falling back to syncQueue:`, error);
      await enqueueSync(storeName, 'create', generatedId, finalRecord);
    }
  } else {
    // We are offline. Queue the record to sync later
    await enqueueSync(storeName, 'create', generatedId, finalRecord);
  }

  return generatedId;
}

/**
 * General purpose offline-aware updater (Diary entries primarily)
 */
export async function updateSadhanaRecord(
  userId: string,
  storeName: 'diary',
  id: string,
  updatedFields: any
): Promise<void> {
  const database = await getDB();
  const existing = await database.get(storeName, id);
  if (!existing) return;

  const merged = { ...existing, ...updatedFields, updatedAt: Date.now() };
  await database.put(storeName, merged);

  if (isOnline()) {
    try {
      console.log(`[Sadhana Sync] Online. Updating ${storeName} in Firestore...`);
      const docPath = `users/${userId}/${storeName}/${id}`;
      await updateDoc(doc(db, `users/${userId}/${storeName}`, id), {
        ...updatedFields,
        updatedAt: serverTimestamp()
      });
      console.log(`[Sadhana Sync] Updated record ${id} in Firestore.`);
    } catch (error) {
      console.error(`[Sadhana Sync] Firestore update failed. Queueing offline sync:`, error);
      await enqueueSync(storeName, 'update', id, merged);
    }
  } else {
    await enqueueSync(storeName, 'update', id, merged);
  }
}

/**
 * General purpose offline-aware deleter
 */
export async function deleteSadhanaRecord(
  userId: string,
  storeName: 'fastingLogs' | 'mantraLogs' | 'diary' | 'meditationLogs',
  id: string
): Promise<void> {
  const database = await getDB();
  await database.delete(storeName, id);

  if (isOnline()) {
    try {
      console.log(`[Sadhana Sync] Online. Deleting ${storeName} from Firestore...`);
      await deleteDoc(doc(db, `users/${userId}/${storeName}`, id));
      console.log(`[Sadhana Sync] Deleted record ${id} from Firestore.`);
    } catch (error) {
      console.error(`[Sadhana Sync] Firestore delete failed. Queueing offline deletion:`, error);
      await enqueueSync(storeName, 'delete', id, { id });
    }
  } else {
    await enqueueSync(storeName, 'delete', id, { id });
  }
}

/**
 * Sync all pending writes to Firestore once connection is established
 */
export async function syncPendingRecords(userId: string): Promise<{ successCount: number; failedCount: number }> {
  if (!isOnline()) {
    console.log('[Offline Sync] Sync aborted. Device is offline.');
    return { successCount: 0, failedCount: 0 };
  }

  const database = await getDB();
  const queue: OfflineLog[] = await database.getAll('syncQueue');
  if (queue.length === 0) {
    console.log('[Offline Sync] No pending records to sync.');
    return { successCount: 0, failedCount: 0 };
  }

  console.log(`[Offline Sync] Found ${queue.length} pending records to synchronize.`);
  let successCount = 0;
  let failedCount = 0;

  // Process in chronological order
  const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);

  for (const item of sortedQueue) {
    try {
      const collectionPath = `users/${userId}/${item.storeName}`;
      
      if (item.action === 'create') {
        const { id, userId: uId, ...syncData } = item.data;
        const firestoreData = {
          ...syncData,
          timestamp: serverTimestamp()
        };

        if (id.startsWith('local_')) {
          // Add to Firestore and get actual ID
          const docRef = await addDoc(collection(db, collectionPath), firestoreData);
          const realId = docRef.id;

          // Replace local ID record with real Firestore ID record in IndexedDB
          await database.delete(item.storeName, id);
          await database.put(item.storeName, { ...item.data, id: realId });
          console.log(`[Offline Sync] Synced creation. Replaced local ID ${id} with real Firestore ID ${realId}`);
        } else {
          await setDoc(doc(db, collectionPath, id), firestoreData);
          console.log(`[Offline Sync] Synced creation for ID ${id}`);
        }
      } else if (item.action === 'update') {
        const docRef = doc(db, collectionPath, item.id);
        const { id, userId: uId, ...syncData } = item.data;
        await updateDoc(docRef, {
          ...syncData,
          updatedAt: serverTimestamp()
        });
        console.log(`[Offline Sync] Synced update for ID ${item.id}`);
      } else if (item.action === 'delete') {
        await deleteDoc(doc(db, collectionPath, item.id));
        console.log(`[Offline Sync] Synced deletion for ID ${item.id}`);
      }

      // Dequeue item upon successful sync
      await database.delete('syncQueue', item.id);
      successCount++;
    } catch (error) {
      console.error(`[Offline Sync] Error syncing record ${item.id}:`, error);
      failedCount++;
    }
  }

  console.log(`[Offline Sync] Completed. Success: ${successCount}, Failures: ${failedCount}`);
  return { successCount, failedCount };
}

/**
 * Pre-populate local cache from Firestore on initial login/app load
 * to ensure that everything is available offline right from the start
 */
export async function prepopulateLocalCache(
  userId: string,
  serverFastingLogs: any[],
  serverMantraLogs: any[],
  serverDiaryEntries: any[]
): Promise<void> {
  try {
    const database = await getDB();
    
    // Clear old records first to avoid stales, or simply overwrite them
    const tx = database.transaction(['fastingLogs', 'mantraLogs', 'diary'], 'readwrite');
    
    for (const log of serverFastingLogs) {
      await tx.objectStore('fastingLogs').put({
        ...log,
        id: log.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      });
    }

    for (const log of serverMantraLogs) {
      await tx.objectStore('mantraLogs').put({
        ...log,
        id: log.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      });
    }

    for (const entry of serverDiaryEntries) {
      await tx.objectStore('diary').put({
        ...entry,
        id: entry.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      });
    }

    await tx.done;
    console.log('[Offline Cache] Successfully synchronized server data to local IndexedDB cache.');
  } catch (error) {
    console.error('[Offline Cache] Prepopulation failed:', error);
  }
}

/**
 * Get the size of the sync queue
 */
export async function getSyncQueueSize(): Promise<number> {
  try {
    const database = await getDB();
    const queue = await database.getAll('syncQueue');
    return queue?.length || 0;
  } catch (error) {
    console.error('[Offline Sync] Error getting sync queue size:', error);
    return 0;
  }
}
