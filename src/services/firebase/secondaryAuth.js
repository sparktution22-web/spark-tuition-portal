import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const SECONDARY_APP_NAME = 'spark-account-creation'

// Reuses the existing secondary app if one's already been created (e.g.
// on re-render) instead of throwing a "duplicate app" error.
function getSecondaryApp() {
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME)
  return existing || initializeApp(firebaseConfig, SECONDARY_APP_NAME)
}

// A completely independent Auth instance from the app's main one — has
// its own session, so signing a new user in/out here never touches
// whichever admin account is logged into the primary app.
export const secondaryAuth = getAuth(getSecondaryApp())
