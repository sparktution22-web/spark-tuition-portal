import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { app, isFirebaseConfigured } from '../services/firebase/config.js'
import { savePushToken } from '../services/api/sheetsApi.js'

// The "Web Push certificate" key from Firebase Console → Project
// Settings → Cloud Messaging → Web configuration. This is DIFFERENT
// from the regular Firebase API key already in config.js — it's
// specific to enabling push for this project. Add it to your .env as
// VITE_FIREBASE_VAPID_KEY.
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

// Call this once, after login — asks the browser for notification
// permission (shows the native "Allow notifications?" prompt) and, if
// granted, registers this device/browser with Firebase Messaging and
// saves the resulting token against this login's email. Safe to call
// every time someone logs in — if permission was already granted or
// already denied, the browser just returns immediately without asking
// again, and re-saving the same token is harmless.
export async function registerForPushNotifications(email) {
  if (!isFirebaseConfigured || !VAPID_KEY) return { registered: false, reason: 'not-configured' }
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return { registered: false, reason: 'unsupported' }
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { registered: false, reason: 'denied' }

    const registration = await navigator.serviceWorker.ready
    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
    if (!token) return { registered: false, reason: 'no-token' }

    await savePushToken(email, token)
    return { registered: true, token }
  } catch (err) {
    console.error('Push notification registration failed:', err)
    return { registered: false, reason: 'error', error: err.message }
  }
}

// Shows a foreground notification when a push arrives WHILE the app is
// already open in a tab — Firebase Messaging doesn't do this
// automatically (only background/closed-app notifications are handled
// by the service worker), so this fills that gap with a simple native
// browser Notification. Call this once, e.g. in App.jsx on mount.
export function listenForForegroundPushNotifications() {
  if (!isFirebaseConfigured || !VAPID_KEY) return
  try {
    const messaging = getMessaging(app)
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'SPARK'
      const body = payload.notification?.body || ''
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/pwa-192x192.png' })
      }
    })
  } catch (err) {
    console.error('Could not set up foreground push listener:', err)
  }
}
