const CACHE = 'qm-pwa-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then((res) => res || fetch(req).then((net) => {
      const url = new URL(req.url);
      const cacheable = APP_SHELL.some(p => url.pathname.endsWith(p.replace('./','/')));
      if (cacheable) {
        const copy = net.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return net;
    }).catch(() => caches.match('./index.html')))
  );
});