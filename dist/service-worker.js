const CACHE = "paulmanac-v1";

const FILES = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./manifest.json",

    "./icons/icon-192.png",
    "./icons/icon-512.png",

    "./engine/calendarEngine.js",
    "./engine/calendarDatabase.js",
    "./engine/constants.js",
    "./engine/dateUtils.js",
    "./engine/skyEvents.js",
    "./engine/skyToday.js"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE)
            .then(cache => cache.addAll(FILES))

    );

});

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(response => response || fetch(event.request))

    );

});