// ক্যাশের নতুন ভার্সন এবং রিপোজিটরির নাম
const CACHE_NAME = 'bkash-nagad-profit-v2';
const GITHUB_REPO_NAME = '/Bkash-Nagad-TT-Profit';

// ক্যাশে রাখার জন্য ফাইলের সঠিক তালিকা
const urlsToCache = [
  `${GITHUB_REPO_NAME}/`,
  `${GITHUB_REPO_NAME}/index.html`,
  `${GITHUB_REPO_NAME}/manifest.json`,
  `${GITHUB_REPO_NAME}/icon-192x192.png`,
  `${GITHUB_REPO_NAME}/icon-512x512.png`
];

// সার্ভিস ওয়ার্কার ইনস্টল করা
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache files:', error);
      })
  );
});

// কন্টেন্ট ফেচ করা
self.addEventListener('fetch', event => {
  // শুধুমাত্র GET রিকোয়েস্ট হ্যান্ডেল করা হবে
  if (event.request.method !== 'GET') {
    return;
  }

  // নেটওয়ার্ক-ফার্স্ট স্ট্র্যাটেজি ব্যবহার করা
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // সফলভাবে নেটওয়ার্ক থেকে পেলে, ক্যাশে সেভ করে রাখা
        if (networkResponse) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              // শুধুমাত্র নিজের ডোমেইনের রিসোর্স ক্যাশ করা হবে
              if (event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, responseToCache);
              }
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // নেটওয়ার্ক ফেইল করলে, ক্যাশ থেকে দেখানোর চেষ্টা করা
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || caches.match(`${GITHUB_REPO_NAME}/index.html`);
          });
      })
  );
});

// পুরনো ক্যাশ মুছে ফেলা
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

