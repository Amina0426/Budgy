self.addEventListener("install", event => {
    event.waitUntil(
        caches.open("expense-cache").then(cache => {
            return cache.addAll([
                "./",
                "./index.html",
                "./style-v1.css",
                "./script.js",
                "./manifest.json",
                "./icons/icon-192x192.png",
                "./icons/icon-512x512.png",
                "./icons/favicon.ico"
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate",event=>{
    self.clients.claim();
})

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(()=>
            caches.match("./index.html"));
        })
    );
});