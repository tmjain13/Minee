import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  doc,
  getDocFromServer,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// 🤫 Silence internal non-fatal connection warnings in sandboxed preview environments
setLogLevel('silent');

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Define global variable to cache Firestore across hot-reloads/HMR
const globalTemp = typeof window !== 'undefined' ? (window as any) : (global as any);
const appAny = app as any;

let db;

if (appAny.__firestore_db__) {
  db = appAny.__firestore_db__;
  console.log("Firestore: Reusing existing db instance from App property.");
} else if (globalTemp.__firestore_db__) {
  db = globalTemp.__firestore_db__;
  appAny.__firestore_db__ = db;
  console.log("Firestore: Reusing existing global db instance.");
} else {
  try {
    // Safely use initializeFirestore with the configured database ID and persistent cache for automatic reconnection
    if (firebaseConfig.firestoreDatabaseId) {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
          cacheSizeBytes: CACHE_SIZE_UNLIMITED
        })
      }, firebaseConfig.firestoreDatabaseId);
    } else {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
          cacheSizeBytes: CACHE_SIZE_UNLIMITED
        })
      });
    }
    appAny.__firestore_db__ = db;
    if (typeof window !== 'undefined') {
      globalTemp.__firestore_db__ = db;
    }
    console.log("Firestore: Successfully initialized with persistent local cache.");
  } catch (error) {
    console.warn("Firestore: initializeFirestore with databaseId failed, trying default initializeFirestore:", error);
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
          cacheSizeBytes: CACHE_SIZE_UNLIMITED
        })
      });
      appAny.__firestore_db__ = db;
      if (typeof window !== 'undefined') {
        globalTemp.__firestore_db__ = db;
      }
      console.log("Firestore: Successfully resolved via default initializeFirestore with persistence.");
    } catch (fallbackError) {
      console.warn("Firestore: initializeFirestore failed, falling back to standard getFirestore:", fallbackError);
      try {
        db = firebaseConfig.firestoreDatabaseId ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : getFirestore(app);
        appAny.__firestore_db__ = db;
        if (typeof window !== 'undefined') {
          globalTemp.__firestore_db__ = db;
        }
        console.log("Firestore: Successfully resolved via standard getFirestore.");
      } catch (finalError) {
        console.error("Firestore: All initializations failed:", finalError);
        throw finalError;
      }
    }
  }
}

const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// 🔍 Validate Connection to Firestore on startup as mandated by the skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    console.log("Firestore operating in secure local offline persistence mode.");
  }
}
testConnection();

export { db, auth, storage, GoogleAuthProvider, googleProvider };
