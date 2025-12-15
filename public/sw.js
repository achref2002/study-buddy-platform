const PRECACHE_VERSION = 'v1'
const PRECACHE = `study-buddy-precache-${PRECACHE_VERSION}`
const RUNTIME = 'study-buddy-runtime'
const STATIC_CACHE = 'study-buddy-static'

const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/placeholder-logo.png',
  '/offline.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== PRECACHE && key !== RUNTIME && key !== STATIC_CACHE) return caches.delete(key)
        }),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => caches.match(request)),
    )
    return
  }

  // Cache-first for Next.js generated static files
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/image')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request)
            .then((response) => {
              cache.put(request, response.clone())
              return response
            })
            .catch(() => caches.match('/offline.html'))
        }),
      ),
    )
    return
  }

  // Navigation requests: network-first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/offline.html'))),
    )
    return
  }

  // For assets (images/styles/scripts/fonts): cache-first then network, store runtime cache
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        caches.open(RUNTIME).then((cache) => cache.put(request, response.clone()))
        return response
      }).catch(() => caches.match('/offline.html'))),
    )
    return
  }

  // Default: try cache then network
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)))
})
