const CACHE_NAME = "expense-cache-v1";
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
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
    event.waitUntil(
        caches.keys().then(cacheNames =>{
            return Promise.all(
                cacheNames
                .filter(name=> name!==CACHE_NAME)
                .map(name => caches.delete(name))
                );
        })
        );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if(event.request.method !== "GET")return;
    event.respondWith(
        fetch(event.request).then(networkResponse => {
            const responseClone=networkResponse.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request,responseClone);
        });
        return networkResponse;
    })
        .catch(()=>
            caches.match(event.request)
               .then(response=>response||caches.match("./index.html"))
               )
        );
});
