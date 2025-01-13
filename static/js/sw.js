const CACHE_NAME = 'smartwaste-v1';

// Rutas S3 que necesitan modo no-cors
const S3_URLS = [
    'https://s3-srd-project.s3.us-east-2.amazonaws.com/css/styles.css',
    'https://s3-srd-project.s3.us-east-2.amazonaws.com/js/main.js',
    'https://s3-srd-project.s3.us-east-2.amazonaws.com/icons/android-launchericon-192-192.png',
    'https://s3-srd-project.s3.us-east-2.amazonaws.com/icons/android-launchericon-512-512.png'
];

// CDN recursos (estos ya tienen CORS configurado)
const CDN_URLS = [
    'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11.7.3/dist/sweetalert2.min.css'
];

// Función para hacer fetch con no-cors para recursos de S3
const fetchS3Resource = (url) => {
    return fetch(url, { mode: 'no-cors' })
        .then(response => response)
        .catch(error => {
            console.error('Error fetching S3 resource:', error);
            throw error;
        });
};

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('Caching CDN resources...');
                await cache.addAll(CDN_URLS);

                console.log('Caching S3 resources...');
                const s3Promises = S3_URLS.map(url => 
                    fetchS3Resource(url)
                        .then(response => cache.put(url, response))
                        .catch(error => console.error(`Failed to cache ${url}:`, error))
                );

                return Promise.all(s3Promises);
            })
            .catch((error) => {
                console.error('Error en la instalación del service worker:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                // Check if this is an S3 resource
                const isS3Resource = S3_URLS.some(url => event.request.url.includes('s3-srd-project'));
                
                if (isS3Resource) {
                    return fetchS3Resource(event.request.url)
                        .then(response => {
                            // Clone the response
                            const responseToCache = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });

                            return response;
                        });
                }

                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        if (event.request.mode === 'navigate') {
                            return caches.match('/');
                        }
                    });
            })
    );
});

self.addEventListener('activate', (event) => {
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
