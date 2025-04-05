self.addEventListener("install", event => {
    event.waitUntil(
        caches.open("expense-cache").then(cache => {
            return cache.addAll([
                "./",
                "./index.html",
                "./style.css",
                "./script.js",
                "./manifest.json"
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