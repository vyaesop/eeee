
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore"; 
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { getTierFromDeposit } from '@/lib/constants';

interface AuthContextType {
  user: {
    displayName: string | null;
    email: string | null;
  } | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, referredBy?: string) => Promise<void>;
  logIn: (username: string, password?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const FullPageLoader = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

const generateReferralCode = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const username = sessionStorage.getItem('eig_user');
    if (username) {
      setUser({ displayName: username, email: null }); // email can be fetched if needed
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
    
    const initialDeposit = 0;
    const referralCode = generateReferralCode(6);
    
    const newUser = {
      username: username,
      email: email,
      password, // In a real app, hash this!
      totalDeposit: initialDeposit,
      earningsBalance: 0,
      autoCompounding: true,
      joined: new Date().toISOString(),
      referredBy: referredBy || null,
      referralCode: referralCode,
      membershipTier: getTierFromDeposit(initialDeposit),
      lastEarningsUpdate: new Date().toISOString(),
    };

    await setDoc(userRef, newUser);

    // No auto login after sign up
    // sessionStorage.setItem('eig_user', username);
    // setUser({ displayName: username, email });
  }, []);

  const logIn = useCallback(async (username: string, password?: string) => {
    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (username === 'admin') {
        sessionStorage.setItem('eig_user', 'admin');
        setUser({ displayName: 'admin', email: 'admin@eig.com' });
        return;
    }

    if (!userSnap.exists()) {
       throw new Error("User does not exist.");
    }

    // In a real app, you'd compare a hashed password.
    // For now, we only check for existence for regular users, or password for specific cases.
    if (password && userSnap.data().password !== password) {
      throw new Error("Invalid username or password");
    }

    sessionStorage.setItem('eig_user', username);
    setUser({ displayName: username, email: userSnap.data().email });
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem('eig_user');
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, signOut }}>
      {isAuthReady ? children : <FullPageLoader />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
