// Paulmanac service worker
//
// Network-first: always try to fetch the latest build so phones never
// get stuck on an old version; fall back to the cache only when offline.
// Bump CACHE whenever the caching strategy changes — old caches are
// deleted on activate.

const CACHE = "paulmanac-v2";

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const req = event.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);
    // Only handle our own files (not geocoding / fonts / other APIs)
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(req)
            .then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE).then(cache => cache.put(req, copy));
                }
                return response;
            })
            .catch(() =>
                caches.match(req).then(hit =>
                    hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error())
                )
            )
    );
});
