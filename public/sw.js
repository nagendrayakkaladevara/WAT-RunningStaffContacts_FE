// Cache only the offline explanation. Directory/API data always requires the network.
const CACHE = "wat-shell-v1";
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.add("/offline.html"))); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("wat-shell-") && key !== CACHE).map(key => caches.delete(key))))); });
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")));
});
