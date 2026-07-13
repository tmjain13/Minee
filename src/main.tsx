// Global fallback/protection against circular JSON serialization issues
(function() {
  const originalStringify = JSON.stringify;
  JSON.stringify = function (value: any, replacer?: any, space?: string | number): string {
    try {
      return originalStringify(value, replacer, space);
    } catch (err) {
      if (err instanceof TypeError && (err.message.includes('circular') || err.message.includes('Circular'))) {
        const cache = new WeakSet();
        const safeReplacer = function (this: any, key: string, val: any): any {
          if (typeof val === 'object' && val !== null) {
            if (cache.has(val)) {
              return '[Circular]';
            }
            cache.add(val);
            // Handle Firebase/Firestore or other minified objects safely
            const cName = val.constructor?.name || '';
            if (
              ['DocumentReference', 'Query', 'Firestore', 'DocumentSnapshot', 'QuerySnapshot', 'Y2', 'Ka', 'Xi', 'Si'].includes(cName) || 
              val.type === 'document' || 
              val.type === 'collection' || 
              val._delegate || 
              val.firestore
            ) {
              return `[FirebaseObject:${cName || 'Complex'}]`;
            }
          }
          if (typeof replacer === 'function') {
            return replacer.call(this, key, val);
          } else if (Array.isArray(replacer)) {
            if (key !== '' && !replacer.includes(key)) {
              return undefined;
            }
          }
          return val;
        };
        try {
          return originalStringify(value, safeReplacer, space);
        } catch (innerErr) {
          return '"[Unserializable Circular Structure]"';
        }
      }
      throw err;
    }
  };

  // Safely disable all console.log calls in production environments
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    const noop = () => {};
    console.log = noop;
    // Keep warn and error for diagnostics, but silence verbose logs
    console.debug = noop;
    console.info = noop;
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ChatFocusProvider } from './context/ChatFocusContext';

// Safely register PWA Service Worker dynamically to avoid Cloud Preview resolution issues
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch((err) => {
      console.warn('PWA dynamic registration skipped in dev/preview mode:', err);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <ChatFocusProvider>
          {/* Removed ParyushanaMode from root to prevent global crashes */}
          <App />
        </ChatFocusProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);
