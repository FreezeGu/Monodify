// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase config
// Can be overridden via environment variables for different environments
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAWThotvLQIdxMWM_D0IQDR-rM49XtbNFQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'monody-nasheeds.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'monody-nasheeds',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'monody-nasheeds.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '966959805436',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:966959805436:web:f1002b9f115e5cb898b879',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-C0Z8ESC3VB',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
// Temporarily disabled if network issues occur
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    // Only initialize analytics if we can reach Firebase
    // This prevents errors during development with network issues
    if (navigator.onLine) {
      analytics = getAnalytics(app);
    }
  } catch (err) {
    console.warn('Analytics initialization failed:', err);
  }
}

export { analytics };
export default app;
