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
import { LocationProvider } from './context/LocationContext';
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
      fallback={({ error, resetError }) => {
        const errStr = error ? error.toString() : '';
        const errName = error && typeof error === 'object' && 'name' in error ? String((error as any).name) : '';
        const errMessage = error && typeof error === 'object' && 'message' in error ? String((error as any).message) : '';
        const isChunkError = 
          errName === 'ChunkLoadError' ||
          /chunk|loading|fetch|dynamically/i.test(errMessage || '') ||
          /failed to fetch/i.test(errStr);

        return (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#FAF8F4",
              padding: "24px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "22px",
                padding: "40px",
                maxWidth: "460px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(122, 31, 43, 0.08)",
                border: "1px solid #E8E2DD"
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                {isChunkError ? "🌐" : "🙏"}
              </div>
              <h2
                style={{
                  color: "#7A1F2B",
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "12px",
                  lineHeight: 1.4,
                }}
              >
                {isChunkError 
                  ? "कनेक्शन या अपडेट त्रुटि (चंक लोड विफलता)" 
                  : "क्षमा करें, कुछ गलत हो गया (रनटाइम विफलता)"}
              </h2>
              <p
                style={{
                  color: "#6B6B6B",
                  fontSize: "14px",
                  marginBottom: "24px",
                  lineHeight: 1.6,
                }}
              >
                {isChunkError ? (
                  <>
                    <strong>नेटवर्क कनेक्शन में समस्या आई है।</strong> कृपया अपने इंटरनेट कनेक्शन की जांच करें या पेज को फिर से लोड करें।
                    <br />
                    <span style={{ display: 'block', marginTop: '8px', fontSize: '13px', color: '#7A1F2B' }}>
                      A network issue or application update occurred while loading this section. Please check your internet connection.
                    </span>
                  </>
                ) : (
                  <>
                    <strong>सिस्टम में एक अनपेक्षित त्रुटि आई है।</strong> कृपया डेवलपर टीम को रिपोर्ट करने के लिए पेज रिफ्रेश करें।
                    <br />
                    <span style={{ display: 'block', marginTop: '8px', fontSize: '13px', color: '#7A1F2B' }}>
                      An unexpected application runtime error occurred. Our diagnostics have been recorded.
                    </span>
                  </>
                )}
              </p>
              <button
                onClick={() => {
                  resetError();
                  window.location.reload();
                }}
                style={{
                  background: "#7A1F2B",
                  color: "white",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(122, 31, 43, 0.2)",
                }}
              >
                Refresh Page / पेज रिफ्रेश करें
              </button>
              
              {error && (
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
                    maxHeight: "150px",
                    border: "1px solid #f5f5f4"
                  }}
                >
                  Code: {errName || 'Error'}
                  {"\n"}Message: {errMessage || errStr}
                </pre>
              )}
            </div>
          </div>
        );
      }}
    >
      <AuthProvider>
        <LanguageProvider>
          <LocationProvider>
            <ChatFocusProvider>
              {/* Removed ParyushanaMode from root to prevent global crashes */}
              <App />
            </ChatFocusProvider>
          </LocationProvider>
        </LanguageProvider>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
