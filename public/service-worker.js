const StaticCache = "static-cache-v4"
const DataCache = "data-cache-v3"

const CachedFiles = [
    "/",
    "/index.html",
    "/styles.css",
    "/db.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/manifest.json",
    "/index.js"
]

// install
self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(StaticCache).then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(CachedFiles);   
      })
    );
  
    self.skipWaiting();
  });

  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== StaticCache && key !== DataCache) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });

// fetch
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DataCache).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              
            });
        }).catch(err => {
          console.log(err)
        })
      );
  
      return;
    }
  
    evt.respondWith(
      caches.open(StaticCache).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  });