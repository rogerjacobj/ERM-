import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, off } from 'firebase/database'

// Firebase config — replace with your project's config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'erm-notifications-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

let app = null
let database = null

try {
  if (firebaseConfig.databaseURL) {
    app = initializeApp(firebaseConfig)
    database = getDatabase(app)
    console.log('Firebase initialized')
  } else {
    console.log('Firebase skipped — no databaseURL configured')
  }
} catch (err) {
  console.log('Firebase init error:', err.message)
}

export { database, ref, onValue, off }
export default app
