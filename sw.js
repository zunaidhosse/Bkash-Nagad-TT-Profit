// ক্যাশের নাম এবং ক্যাশে রাখার জন্য ফাইলের তালিকা
const CACHE_NAME = 'bkash-nagad-profit-v1';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icon-192x192.png',
  'icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap'
];

// --- ইনস্টল ইভেন্ট ---
// সার্ভিস ওয়ার্কার ইনস্টল হওয়ার সময় এই কোডটি রান হবে
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// --- ফেচ ইভেন্ট ---
// অ্যাপ যখন কোনো ফাইল বা ডেটার জন্য রিকোয়েস্ট পাঠাবে, তখন এই কোডটি রান হবে
self.addEventListener('fetch', event => {
  event.respondWith(
    // প্রথমে ক্যাশে খোঁজা হবে রিকোয়েস্ট করা ফাইলটি আছে কিনা
    caches.match(event.request)
      .then(response => {
        // যদি ক্যাশে পাওয়া যায়, তবে সেখান থেকেই দেওয়া হবে
        if (response) {
          return response;
        }
        // যদি ক্যাশে না পাওয়া যায়, তবে নেটওয়ার্ক থেকে আনা হবে
        return fetch(event.request);
      }
    )
  );
});

// --- অ্যাক্টিভেট ইভেন্ট ---
// নতুন সার্ভিস ওয়ার্কার অ্যাক্টিভেট হওয়ার সময় পুরনো ক্যাশে পরিষ্কার করা
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

