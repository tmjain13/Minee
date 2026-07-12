import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider as RealGoogleAuthProvider } from 'firebase/auth';
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

// Securely resolve config: prioritize process/import.meta.env variables, fall back to JSON config if present
const configs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const firebaseConfigJson = (configs['../../firebase-applet-config.json'] as any)?.default || {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || "",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || ""
};

// 🤫 Silence internal non-fatal connection warnings in sandboxed preview environments
try {
  setLogLevel('silent');
} catch (e) {
  // Ignore in case of loading issues
}

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: any;
let db: any;
let auth: any;
let storage: any;
let GoogleAuthProvider = RealGoogleAuthProvider;
let googleProvider: any;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Define global variable to cache Firestore across hot-reloads/HMR
    const globalTemp = typeof window !== 'undefined' ? (window as any) : (global as any);
    const appAny = app as any;

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

    auth = getAuth(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();

    // 🔍 Validate Connection to Firestore on startup as mandated by the skill guidelines
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        console.log("Firestore operating in secure local offline persistence mode.");
      }
    };
    testConnection();

  } catch (error) {
    console.error("Failed to initialize active Firebase instance, falling back to mock simulator:", error);
    setupMocks();
  }
} else {
  console.warn("Firebase config is unprovisioned or deleted. App running in robust Offline Mock Mode.");
  setupMocks();
}

function setupMocks() {
  app = { name: '[MockApp]', options: {} };
  
  // Mock Auth
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      // Instantly trigger with null or with local cached demo user to support offline simulation
      const localDemo = typeof window !== 'undefined' ? localStorage.getItem('tp_demo_user') : null;
      if (localDemo) {
        try {
          const parsed = JSON.parse(localDemo);
          callback({
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.displayName,
            photoURL: parsed.photoURL,
            metadata: { creationTime: new Date().toISOString() }
          });
        } catch (e) {
          callback(null);
        }
      } else {
        callback(null);
      }
      return () => {}; // unsubscribe noop
    },
    signOut: async () => {
      if (typeof window !== 'undefined') localStorage.removeItem('tp_demo_user');
      return Promise.resolve();
    },
    signInWithPopup: async () => {
      throw new Error("Firebase Auth config is missing. Please restore or provision Firebase settings.");
    },
    signInWithEmailAndPassword: async () => {
      throw new Error("Firebase Auth config is missing. Please restore or provision Firebase settings.");
    },
    createUserWithEmailAndPassword: async () => {
      throw new Error("Firebase Auth config is missing. Please restore or provision Firebase settings.");
    }
  };

  // Mock Firestore proxy
  const dummyPromise = () => Promise.resolve({
    exists: () => false,
    data: () => null,
    id: 'mock-id'
  });
  
  const firestoreProxyHandler: any = {
    get: function(target: any, prop: string): any {
      if (prop === 'then') return undefined;
      if (typeof target[prop] === 'function') {
        return target[prop];
      }
      return () => new Proxy(dummyPromise, firestoreProxyHandler);
    }
  };
  
  db = new Proxy({
    collection: () => new Proxy({}, firestoreProxyHandler),
    doc: () => new Proxy({}, firestoreProxyHandler)
  }, firestoreProxyHandler);

  // Mock Storage proxy
  storage = new Proxy({}, {
    get: () => () => new Proxy({}, { get: () => () => Promise.resolve('') })
  });

  // Mock Providers
  GoogleAuthProvider = class {
    static PROVIDER_ID = 'google.com';
  } as any;
  googleProvider = {};
}

export { db, auth, storage, GoogleAuthProvider, googleProvider };
