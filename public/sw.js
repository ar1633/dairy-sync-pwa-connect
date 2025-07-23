console.log('[LOG] Loaded sw.js');

const CACHE_NAME = 'krishi-dairy-sync-v2';
const DATA_CACHE = 'dairy-data-v1';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] install event');
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] activate event');
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  console.log('[ServiceWorker] fetch event:', event.request.url);
  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Cache successful API responses
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached data when offline
            return cache.match(event.request);
          });
      })
    );
  } else {
    // Handle app shell requests
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request).catch(() => {
            // Fallback for offline mode
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
        })
    );
  }
});

// Handle background sync for data
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] sync event:', event.tag);
  
  if (event.tag === 'milk-data-sync') {
    event.waitUntil(syncMilkData());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] push event:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New dairy data available',
    icon: '/icons/icon-96x96.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Krishi DairySync', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] notificationclick event:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Sync milk data function
async function syncMilkData() {
  console.log('[ServiceWorker] Inside syncMilkData');
  try {
    console.log('Syncing milk data...');
    // This would sync with a remote server when implemented
    return Promise.resolve();
  } catch (error) {
    console.error('Error syncing milk data:', error);
    throw error;
  }
}

// Handle file processing messages
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] message event:', event.data);
  if (event.data && event.data.type === 'PROCESS_EIP_FILE') {
    console.log('Processing EIP file in service worker');
    // Handle EIP file processing in background
    processEIPFile(event.data.fileContent);
  }
});

function processEIPFile(fileContent) {
  console.log('[ServiceWorker] Inside processEIPFile');
  // Process EIP file in background
  console.log('Background EIP processing started');
  // This would be handled by the main thread DataService
}
