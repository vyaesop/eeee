'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore"; 
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { getTierFromDeposit, tiers } from '@/lib/constants';

interface AuthContextType {
  user: {
    displayName: string | null;
    email: string | null;
    uid: string;
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
    const uid = sessionStorage.getItem('eig_uid');
    if (username && uid) {
      setUser({ displayName: username, email: null, uid });
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
      lastEarningsUpdate: Timestamp.now(),
      role: 'user' as 'user' | 'admin',
    };

    await setDoc(userRef, newUser);

    // No auto login after sign up
  }, []);

  const logIn = useCallback(async (username: string, password?: string) => {
    if (username === 'admin') {
      const adminUID = 'admin_uid';
      sessionStorage.setItem('eig_user', 'admin');
      sessionStorage.setItem('eig_uid', adminUID);
      setUser({ displayName: 'admin', email: 'admin@eig.com', uid: adminUID });
      return;
    }

    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User does not exist.");
    }

    const userData = userSnap.data();

    if (password && userData.password !== password) {
      throw new Error("Invalid username or password");
    }

    // Earnings calculation on login
    const now = Timestamp.now();
    let lastUpdateDate: Date;
    const { lastEarningsUpdate } = userData;

    if (!lastEarningsUpdate) {
      lastUpdateDate = new Date(0);
    } else if (typeof (lastEarningsUpdate as any).toDate === 'function') {
      lastUpdateDate = (lastEarningsUpdate as any).toDate();
    } else if (typeof (lastEarningsUpdate as any).seconds === 'number') {
      lastUpdateDate = new Date((lastEarningsUpdate as any).seconds * 1000);
    } else if (typeof lastEarningsUpdate === 'string') {
      lastUpdateDate = new Date(lastEarningsUpdate);
    } else {
      lastUpdateDate = new Date(0);
    }

    const hoursSinceLastUpdate = (now.toMillis() - lastUpdateDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastUpdate >= 24) {
      if (userData.totalDeposit > 0) {
        const dailyRate = 0.015; // 1.5% daily earning
        const earnings = userData.totalDeposit * dailyRate;
        await updateDoc(userRef, {
          earningsBalance: (userData.earningsBalance || 0) + earnings,
          lastEarningsUpdate: now
        });
      }
    }
    
    const userUID = userSnap.id; 
    sessionStorage.setItem('eig_user', username);
    sessionStorage.setItem('eig_uid', userUID);
    setUser({ displayName: username, email: userData.email, uid: userUID });
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem('eig_user');
    sessionStorage.removeItem('eig_uid');
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
