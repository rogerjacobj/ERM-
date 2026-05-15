import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, off } from 'firebase/database'

// Firebase config — replace with your project's config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCVFf1UhfF1ovjgabq7N25ZhzuPFKSdh_E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'erm-system-8ca20.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://erm-system-8ca20-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'erm-system-8ca20',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'erm-system-8ca20.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '486576149553',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:486576149553:web:488917ad6356dd8007b110',
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
