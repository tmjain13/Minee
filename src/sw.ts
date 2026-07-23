/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v2';
const PRECACHE_NAME = `terapanth-precache-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `terapanth-spiritual-${CACHE_VERSION}`;

// Precache resources
precacheAndRoute(self.__WB_MANIFEST || []);

// Runtime caching routes
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: `google-fonts-cache-${CACHE_VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

registerRoute(
  /\/api\/.*$/i,
  new NetworkFirst({
    cacheName: `api-cache-${CACHE_VERSION}`,
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that does not match the current version suffix
          if (!cacheName.includes(CACHE_VERSION)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message event for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background Sync event listener for offline queue sync
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sadhana-sync') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_BACKGROUND_SYNC' });
        });
      })
    );
  }
});

// Push notification validation
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    // Validate payload
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    const body = typeof data.body === 'string' ? data.body.trim() : '';
    const url = typeof data.url === 'string' ? data.url.trim() : '';

    // Must have non-empty title and body
    if (!title || !body) {
      return;
    }

    // Truncate to reasonable lengths (100/200)
    const truncatedTitle = title.length > 100 ? title.substring(0, 97) + '...' : title;
    const truncatedBody = body.length > 200 ? body.substring(0, 197) + '...' : body;

    // Validate URL - must start with '/' (absolute/spoofed URLs rejected)
    if (url && !url.startsWith('/')) {
      return; // Reject spoofed notifications
    }

    const options: NotificationOptions = {
      body: truncatedBody,
      icon: '/assets/logos/icon-192x192.png',
      badge: '/assets/logos/icon-192x192.png',
      data: {
        url: url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(truncatedTitle, options)
    );
  } catch (err) {
    // If not JSON or other parsing issue, skip silently
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
