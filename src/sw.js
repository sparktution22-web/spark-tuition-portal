import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { clientsClaim } from 'workbox-core'

self.skipWaiting()
clientsClaim()

// Precaches every built file — this replaces what generateSW used to
// do automatically. __WB_MANIFEST is replaced at build time by
// vite-plugin-pwa with the real list of files to precache, matching the
// same globPatterns from vite.config.js.
precacheAndRoute(self.__WB_MANIFEST)

// Same runtime caching rule for Apps Script API calls that generateSW's
// config provided automatically before — reimplemented here by hand,
// since injectManifest mode needs this written explicitly rather than
// generated from config. Network-first so data stays fresh, falling
// back to cache when offline — identical settings to before (8 second
// timeout, 50 entries max, 6 hour max age).
registerRoute(
  ({ url }) => url.origin === 'https://script.google.com',
  new NetworkFirst({
    cacheName: 'spark-api-cache',
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 6 })
    ]
  })
)

// ================= PUSH NOTIFICATIONS =================
// Displays a real system notification when a push arrives while the app
// is closed or in the background. This is the actual reason this file
// exists instead of the old auto-generated service worker — generateSW
// has no way to add a custom event listener like this one.
self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { notification: { title: 'SPARK', body: event.data ? event.data.text() : '' } }
  }
  const title = (payload.notification && payload.notification.title) || 'SPARK'
  const body = (payload.notification && payload.notification.body) || ''
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/spark-logo.png',
      badge: '/spark-logo.png'
    })
  )
})

// Tapping the notification focuses an already-open SPARK tab if one
// exists, or opens a new one — standard expected behavior.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    })
  )
})
