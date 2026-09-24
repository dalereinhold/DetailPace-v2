const CACHE_NAME = "DetailPace-v2"

// Derives the base path where the service worker is hosted (e.g., "/" or "/DetailPace-v2/")
const SW_PATH = new URL(self.registration.scope).pathname

const APP_SHELL = [
  SW_PATH,
  `${SW_PATH}index.html`,
  `${SW_PATH}manifest.json`,
  `${SW_PATH}favicon.png`,
  `${SW_PATH}icons/icon-192x192-maskable.png`,
  `${SW_PATH}icons/icon-512x512-maskable.png`,
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

  // SPA Navigation fallback handling
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        // Always match the exact cached root index.html regardless of deep sub-route navigation
        caches.match(`${SW_PATH}index.html`).then(response => {
          if (!response) {
            throw new Error("The cached app shell is unavailable.")
          }
          return response
        })
      )
    )
    return
  }

  // Cache-first asset handling
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
