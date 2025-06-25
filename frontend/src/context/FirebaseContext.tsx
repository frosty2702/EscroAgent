'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, updateDoc, doc, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { auth, db, signInAnonymously } from '../lib/firebase';

// Types for our agreement data
export interface AgreementData {
  id?: string;
  payerAddress: string;
  payeeAddress: string;
  amount: number;
  conditionType: number;
  description: string;
  status: 'pending' | 'funded' | 'settled' | 'disputed';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  contractAddress?: string;
  transactionHash?: string;
  
  // Condition-specific fields
  settlementDate?: Timestamp;
  taskName?: string;
  githubPrUrl?: string;
  apiEndpoint?: string;
  expectedValue?: string;
  customEventName?: string;
  
  // Condition status flags (for agent monitoring)
  conditionMet?: boolean;
  taskCompleted?: boolean;
  prMerged?: boolean;
  apiConditionMet?: boolean;
  customEventTriggered?: boolean;
  
  // Settlement info
  settledAt?: Timestamp;
  settlementTx?: string;
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  
  // Agreement operations
  createAgreement: (agreementData: Omit<AgreementData, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateAgreement: (agreementId: string, updates: Partial<AgreementData>) => Promise<void>;
  getUserAgreements: (userAddress: string) => AgreementData[];
  
  // Real-time data
  agreements: AgreementData[];
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreements, setAgreements] = useState<AgreementData[]>([]);

  // Initialize authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Sign in anonymously for demo purposes
        try {
          await signInAnonymously();
        } catch (error) {
          console.error('Failed to sign in anonymously:', error);
        }
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set up real-time listener for agreements
  useEffect(() => {
    if (!user) return;

    const agreementsRef = collection(db, 'agreements');
    const q = query(
      agreementsRef,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agreementsList: AgreementData[] = [];
      snapshot.forEach((doc) => {
        agreementsList.push({
          id: doc.id,
          ...doc.data()
        } as AgreementData);
      });
      setAgreements(agreementsList);
    }, (error) => {
      console.error('Error listening to agreements:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Create a new agreement in Firestore
  const createAgreement = async (agreementData: Omit<AgreementData, 'id' | 'createdAt' | 'status'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'agreements'), {
        ...agreementData,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating agreement:', error);
      throw error;
    }
  };

  // Update an existing agreement
  const updateAgreement = async (agreementId: string, updates: Partial<AgreementData>): Promise<void> => {
    try {
      const agreementRef = doc(db, 'agreements', agreementId);
      await updateDoc(agreementRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating agreement:', error);
      throw error;
    }
  };

  // Get agreements for a specific user
  const getUserAgreements = (userAddress: string): AgreementData[] => {
    return agreements.filter(
      agreement => 
        agreement.payerAddress.toLowerCase() === userAddress.toLowerCase() ||
        agreement.payeeAddress.toLowerCase() === userAddress.toLowerCase()
    );
  };

  const value: FirebaseContextType = {
    user,
    loading,
    createAgreement,
    updateAgreement,
    getUserAgreements,
    agreements
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}; 