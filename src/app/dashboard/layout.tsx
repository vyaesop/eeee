
'use client';

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Cog, User, PanelLeft, Home, Landmark } from "lucide-react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { EIGLogo } from "@/components/eig-logo";
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
          const basicData = userSnap.data() as UserData;
          const referralsRef = collection(db, `users/${storedUser}/referrals`);
          const referralsSnap = await getDocs(referralsRef);
          const referrals = referralsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string, deposit: number }));
          
          setUserData({ ...basicData, referrals });

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

  const handleLogout = () => {
    sessionStorage.removeItem("eig_user");
    router.replace("/");
  };

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

  const userInitial = user ? user.charAt(0).toUpperCase() : "?";
  const isAdmin = user === 'admin';

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
