
'use client';

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserData } from "@/lib/types";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";

const UserDataContext = createContext<UserData | null>(null);

export const useUserData = () => useContext(UserDataContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedUser = sessionStorage.getItem("eig_user");
    if (!storedUser) {
      router.replace("/");
      return;
    }
    setUser(storedUser);

    const fetchUserData = async () => {
      if (!storedUser) return;
      try {
        const userRef = doc(db, 'users', storedUser);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const basicData = userSnap.data() as Omit<UserData, 'username' | 'referrals'>;
          const referralsRef = collection(db, `users/${storedUser}/referrals`);
          const referralsSnap = await getDocs(referralsRef);
          const referrals = referralsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string, deposit: number }));
          
          setUserData({ ...basicData, username: storedUser, referrals });

        } else {
            if(storedUser !== 'admin') {
                console.error("User document not found in Firestore.");
            }
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (!isClient || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <UserDataContext.Provider value={userData}>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="container mx-auto grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
            {children}
        </main>
      </div>
    </UserDataContext.Provider>
  );
}
