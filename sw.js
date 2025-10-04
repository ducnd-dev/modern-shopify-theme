// Service Worker for Performance Optimization
// Implements caching strategies for better performance

const CACHE_NAME = 'modern-shopify-theme-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/assets/theme.css',
  '/assets/theme.js',
  '/assets/performance-critical.css',
  '/assets/performance-optimizer.js',
  '/offline.html'
];

// Cache strategies
const CACHE_STRATEGIES = {
  staleWhileRevalidate: ['/', '/collections', '/products'],
  cacheFirst: ['/assets/', '/fonts/', '/icons/'],
  networkFirst: ['/cart', '/checkout', '/account'],
  imageCache: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg']
};

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== IMAGE_CACHE;
            })
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for fonts and images)
  if (url.origin !== location.origin && !isCachableResource(url)) {
    return;
  }

  // Determine cache strategy
  const strategy = getCacheStrategy(url.pathname, url.href);
  
  event.respondWith(
    executeStrategy(strategy, request)
  );
});

// Determine appropriate cache strategy
function getCacheStrategy(pathname, href) {
  // Check for image files
  if (CACHE_STRATEGIES.imageCache.some(ext => href.includes(ext))) {
    return 'imageCache';
  }

  // Check for static assets
  if (CACHE_STRATEGIES.cacheFirst.some(path => pathname.startsWith(path))) {
    return 'cacheFirst';
  }

  // Check for network-first pages
  if (CACHE_STRATEGIES.networkFirst.some(path => pathname.startsWith(path))) {
    return 'networkFirst';
  }

  // Check for stale-while-revalidate pages
  if (CACHE_STRATEGIES.staleWhileRevalidate.some(path => pathname.startsWith(path))) {
    return 'staleWhileRevalidate';
  }

  // Default to network first
  return 'networkFirst';
}

// Execute caching strategy
async function executeStrategy(strategy, request) {
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request);
    case 'networkFirst':
      return networkFirst(request);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);
    case 'imageCache':
      return imageCache(request);
    default:
      return fetch(request);
  }
}

// Cache First strategy
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first failed:', error);
    throw error;
  }
}

// Network First strategy
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch fresh content in background
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.error('Background fetch failed:', error);
    });

  // Return cached response immediately if available, otherwise wait for network
  if (cachedResponse) {
    fetchPromise; // Update cache in background
    return cachedResponse;
  }
  
  return fetchPromise;
}

// Image Cache strategy with format optimization
async function imageCache(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Try to get WebP version if supported
    const webpRequest = getWebPRequest(request);
    let networkResponse;
    
    if (webpRequest && await supportsWebP()) {
      try {
        networkResponse = await fetch(webpRequest);
        if (networkResponse.ok) {
          cache.put(webpRequest, networkResponse.clone());
          cache.put(request, networkResponse.clone()); // Cache for original request too
          return networkResponse;
        }
      } catch (error) {
        // Fall back to original request
      }
    }
    
    networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Image cache failed:', error);
    throw error;
  }
}

// Helper functions
function isCachableResource(url) {
  const cachableOrigins = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.shopify.com'
  ];
  
  return cachableOrigins.some(origin => url.hostname.includes(origin));
}

function getWebPRequest(request) {
  const url = new URL(request.url);
  
  // Check if it's an image that can be converted to WebP
  const imageExtensions = ['.jpg', '.jpeg', '.png'];
  const hasImageExtension = imageExtensions.some(ext => url.pathname.includes(ext));
  
  if (hasImageExtension && url.hostname.includes('cdn.shopify.com')) {
    // Shopify supports WebP transformation
    url.searchParams.set('format', 'webp');
    return new Request(url.href, {
      method: request.method,
      headers: request.headers,
      mode: request.mode,
      credentials: request.credentials,
      cache: request.cache,
      redirect: request.redirect,
      referrer: request.referrer
    });
  }
  
  return null;
}

async function supportsWebP() {
  // Check if the client supports WebP
  try {
    const response = await fetch('data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA');
    return response.ok;
  } catch {
    return false;
  }
}

// Background sync for analytics and form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync any queued analytics data or form submissions
  const cache = await caches.open('sync-cache');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// Push notifications (optional)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: data.url,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Cache cleanup - remove old entries
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(cleanupCaches());
  }
});

async function cleanupCaches() {
  const cacheNames = await caches.keys();
  const cleanupPromises = cacheNames.map(async cacheName => {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    // Remove entries older than 7 days
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (responseDate < sevenDaysAgo) {
            await cache.delete(request);
          }
        }
      }
    }
  });
  
  await Promise.all(cleanupPromises);
}