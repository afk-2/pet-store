let cacheName = "petstore-v1";
self.addEventListener("activate", (e) => {
    console.log("[Service Worker] Activate");
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== cacheName) {
                        console.log("[Service Worker] Deleting old cache:", name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

let cacheFiles = [
    "index.html",
    "products.js",
    "petstore.webmanifest",
    "imgs/6-piece-white-dinner-plate-set.jpg",
    "imgs/adults-plain-cotton-tshirt-2-pack-teal.jpg",
    "imgs/athletic-cotton-socks-6-pairs.jpg",
    "imgs/backpack.jpg",
    "imgs/calculator.png",
    "imgs/cat-food.png",
    "imgs/cat.jpg",
    "imgs/icon-store-512.png",
];

self.addEventListener("install", (e) => {
    console.log("[Service Worker] Install");
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log("[Service Worker] caching all the files");
            return cache.addAll(cacheFiles);
        })
    );
});

// self.addEventListener("fetch", function (e) {
//     e.respondWith(
//         // check if the cache has the file
//         caches.match(e.request).then(function (r) {
//             console.log("[Service Worker] Fetching resource: " + e.request.url);
//             // r is the matching file if it exists in the cache
//             return r
//         })
//     )
// })

self.addEventListener("fetch", function (e) {
    // Ignore requests with unsupported schemes
    if (e.request.url.startsWith("chrome-extension://")) {
        console.warn("[Service Worker] Ignoring request to unsupported scheme:", e.request.url);
        return;
    }
    e.respondWith(
        caches.match(e.request).then(function (r) {
            // Download the file if it is not in the cache
            return r || fetch(e.request).then(function (response) {
                // add the new file to cache
                return caches.open(cacheName).then(function (cache) {
                    cache.put(e.request, response.clone());
                    return response; // returns response to the browser
                });
            });
        })
    )
});