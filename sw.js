var cacheName = 'hello-pwa';
var filesToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/css/style.css',
    '/images/icon/manifest-icon-192.png',
    '/images/icon/manifest-icon-512.png'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});