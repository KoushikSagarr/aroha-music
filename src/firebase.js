import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'

// Firebase configuration for AROHA Music
// Uses environment variables for security
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Check if Firebase config is properly set
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId

let app = null
let db = null
let auth = null
let analytics = null

if (isConfigValid) {
    try {
        // Initialize Firebase
        app = initializeApp(firebaseConfig)

        // Initialize Firestore
        db = getFirestore(app)
        auth = getAuth(app)

        // Analytics (only in browser)
        if (typeof window !== 'undefined') {
            analytics = getAnalytics(app)
        }
    } catch (error) {
        console.error('Firebase initialization error:', error)
    }
} else {
    console.warn('Firebase config is missing. Please check your environment variables.')
}

export { db, auth, analytics }
export default app
