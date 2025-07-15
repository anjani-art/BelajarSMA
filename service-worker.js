const CACHE_NAME = 'jejak-ilmu-cache-v1';
const urlsToCache = [
  '/',
  '/index.html', // Asumsi file HTML utama Anda bernama index.html
  '/icon-192x192.png', // Ikon yang Anda sediakan
  '/icon-512x512.png', // Ikon yang Anda sediakan
  '/manifest.json' // Manifest file
  // Tambahkan aset lain yang ingin di-cache di sini, misalnya file CSS jika dipisah
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing and caching assets...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak ada di cache, fetch dari jaringan
        return fetch(event.request)
          .then(networkResponse => {
            // Coba cache respons jaringan untuk penggunaan di masa mendatang
            return caches.open(CACHE_NAME).then(cache => {
              // Hanya cache respons yang valid (status 200)
              if (networkResponse.ok || networkResponse.type === 'opaque') {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          })
          .catch(error => {
            console.error('Service Worker: Fetch failed', error);
            // Anda bisa mengembalikan halaman offline di sini jika diperlukan
          });
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating and cleaning old caches...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


