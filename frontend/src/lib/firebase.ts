import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - these should be set in your environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase config is available
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase only if it hasn't been initialized and config is available
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
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