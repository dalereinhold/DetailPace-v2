const CACHE_NAME = "DetailPace-v2"
const APP_SHELL = [
  "/DetailPace-v2/",
  "/DetailPace-v2/index.html",
  "/DetailPace-v2/manifest.json",
  "/DetailPace-v2/favicon.png",
  "/DetailPace-v2/icons/icon-192x192-maskable.png",
  "/DetailPace-v2/icons/icon-512x512-maskable.png",
]

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        )
      )
  )
  self.clients.claim()
})

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return

  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) return

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/DetailPace-v2/index.html").then(response => {
          if (!response) {
            throw new Error("The cached app shell is unavailable.")
          }
          return response
        })
      )
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse.ok) return networkResponse

        const responseForCache = networkResponse.clone()
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseForCache)
        })
        return networkResponse
      })
    })
  )
})
