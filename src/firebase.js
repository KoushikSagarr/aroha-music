import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration for AROHA Music
const firebaseConfig = {
    apiKey: "AIzaSyBsEJXTSh_yNeXgCbs2HpdBHYnXTvHids8",
    authDomain: "aroha-music.firebaseapp.com",
    projectId: "aroha-music",
    storageBucket: "aroha-music.firebasestorage.app",
    messagingSenderId: "871085207848",
    appId: "1:871085207848:web:c9b6e32935a98effe3601d",
    measurementId: "G-WZHK6CF9XK"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const db = getFirestore(app)

// Analytics (only in browser)
let analytics = null
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app)
}
export { analytics }

export default app
