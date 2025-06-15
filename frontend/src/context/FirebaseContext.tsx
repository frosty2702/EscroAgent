import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { app, auth, db, signInWithToken } from '@/lib/firebase';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  db: any;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  db: null,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Try to sign in with the initial token if available
    if (window.__initial_auth_token) {
      signInWithToken(window.__initial_auth_token);
    }

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, db }}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
}; 