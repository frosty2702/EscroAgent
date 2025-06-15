import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  // @ts-ignore - These will be provided by the environment
  ...window.__firebase_config
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const signInWithToken = async (token: string) => {
  try {
    await signInWithCustomToken(auth, token);
  } catch (error) {
    console.error('Error signing in with custom token:', error);
    // Fallback to anonymous auth
    await signInAnonymously(auth);
  }
};

export { app, auth, db }; 