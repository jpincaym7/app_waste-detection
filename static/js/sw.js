const CACHE_NAME = 'smartwaste-v1';
const urlsToCache = [
    '/',
    'https://s3-srd-project.s3.us-east-2.amazonaws.com/css/styles.css',
    'https://s3-srd-project.s3.us-east-2.amazonaws.com/js/main.js',
    'https://s3-srd-project.s3.us-east-2.amazonaws.com/icons/android-launchericon-192-192.png',
    'https://s3-srd-project.s3.us-east-2.amazonaws.com/icons/android-launchericon-512-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11.7.3/dist/sweetalert2.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
    );
  });
  
  // Fetch Event Strategy
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached version or fetch new
          return response || fetch(event.request)
            .then(response => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
  
              // Clone the response
              const responseToCache = response.clone();
  
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
  
              return response;
            });
        })
    );
  });
  
  // Activate Event (Clean up old caches)
  self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });
