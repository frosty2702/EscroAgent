import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - these should be set in your environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
};

// Check if Firebase config is available (not using demo values)
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                            process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-key';

// Initialize Firebase only if it hasn't been initialized and config is available
let app: any = null;
let auth: any = null;
let db: any = null;

// Only initialize Firebase on the client side and when properly configured
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// Authentication functions
export const signInWithToken = async (token: string) => {
  if (!isFirebaseConfigured || !auth) {
    console.warn('Firebase not configured, skipping authentication');
    return;
  }
  try {
    await signInWithCustomToken(auth, token);
  } catch (error) {
    console.error('Error signing in with custom token:', error);
    // Fallback to anonymous auth
    await firebaseSignInAnonymously(auth);
  }
};

// Sign in anonymously (for demo purposes)
export const signInAnonymously = async () => {
  if (!isFirebaseConfigured || !auth) {
    console.warn('Firebase not configured, skipping authentication');
    return;
  }
  try {
    await firebaseSignInAnonymously(auth);
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
};

export { app, auth, db }; 