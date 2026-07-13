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

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ChatFocusProvider } from './context/ChatFocusContext';
import { auth } from './lib/firebase';

// ─── SENTRY INITIALIZATION (Production Only) ───
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (import.meta.env.PROD && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || "1.0.0",
    beforeSend(event) {
      // Attach Firebase user context if available
      const user = auth?.currentUser;
      if (user) {
        event.user = {
          id: user.uid,
          email: user.email || undefined,
        };
      }
      return event;
    },
  });
}

// Safely register PWA Service Worker with update detection
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Add updatefound listener
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available, notify the app UI
                window.dispatchEvent(new CustomEvent('sw-update-available', { detail: registration }));
              }
            }
          });
        }
      });

      // If a service worker is already waiting, trigger update event
      if (registration.waiting) {
        window.dispatchEvent(new CustomEvent('sw-update-available', { detail: registration }));
      }
    }).catch((err) => {
      console.warn('PWA service worker registration failed/skipped:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(234, 88, 12, 0.15)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🙏</div>
            <h2
              style={{
                color: "#c2410c",
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "8px",
                lineHeight: 1.4,
              }}
            >
              क्षमा करें, कुछ गलत हो गया
            </h2>
            <p
              style={{
                color: "#78716c",
                fontSize: "14px",
                marginBottom: "20px",
                lineHeight: 1.6,
              }}
            >
              Something went wrong. Please refresh the page.
              <br />
              <span style={{ fontSize: "12px", opacity: 0.7 }}>
                यदि समस्या बनी रहती है, कृपया ऐप पुनः खोलें।
              </span>
            </p>
            <button
              onClick={() => {
                resetError();
                window.location.reload();
              }}
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                color: "white",
                border: "none",
                padding: "12px 32px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
              }}
            >
              Refresh Page / पेज रिफ्रेश करें
            </button>
            {import.meta.env.DEV && error && (
              <pre
                style={{
                  marginTop: "20px",
                  textAlign: "left",
                  fontSize: "11px",
                  color: "#a8a29e",
                  background: "#fafaf9",
                  padding: "12px",
                  borderRadius: "8px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                {error.toString()}
              </pre>
            )}
          </div>
        </div>
      )}
    >
      <AuthProvider>
        <LanguageProvider>
          <ChatFocusProvider>
            {/* Removed ParyushanaMode from root to prevent global crashes */}
            <App />
          </ChatFocusProvider>
        </LanguageProvider>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
