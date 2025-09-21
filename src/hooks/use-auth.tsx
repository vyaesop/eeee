'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore"; 
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: {
    displayName: string | null;
    email: string | null;
  } | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, referredBy?: string) => Promise<void>;
  logIn: (username: string, password: string) => Promise<void>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const FullPageLoader = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const username = sessionStorage.getItem('apexvest_user');
    if (username) {
      setUser({ displayName: username, email: `${username}@example.com` });
    }
    setLoading(false);
    setIsAuthReady(true);
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string, referredBy?: string) => {
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      throw new Error("Username already exists.");
    }

    const batch = writeBatch(db);

    const newUser = {
      email,
      password, // In a real app, hash this!
      username,
      totalDeposit: 0,
      earningsBalance: 0,
      autoCompounding: false,
      referredBy: referredBy || null,
      createdAt: new Date(),
    };

    batch.set(userRef, newUser);

    if (referredBy) {
      const referrerRef = doc(db, "users", referredBy, "referrals", username);
      batch.set(referrerRef, { id: username, deposit: 0 });
    }
    
    await batch.commit();

    sessionStorage.setItem('apexvest_user', username);
    setUser({ displayName: username, email });
  }, []);

  const logIn = useCallback(async (username: string, password: string) => {
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().password !== password) {
      throw new Error("Invalid username or password");
    }

    sessionStorage.setItem('apexvest_user', username);
    setUser({ displayName: username, email: userSnap.data().email });
  }, []);

  const logOut = useCallback(() => {
    sessionStorage.removeItem('apexvest_user');
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut }}>
      {isAuthReady ? children : <FullPageLoader />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
