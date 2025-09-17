'use client';

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, ShieldCheck, User, Cog } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserData } from "@/lib/types";
import { Loader2 } from "lucide-react";

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
    const storedUser = sessionStorage.getItem("apexvest_user");
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
          setUserData(userSnap.data() as UserData);
        } else {
            // If user is 'admin' but not in DB, it's fine.
            // If it's a regular user not in DB, there's an issue.
            if(storedUser !== 'admin') {
                console.error("User document not found in Firestore.");
                // Maybe handle this by logging them out
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
    sessionStorage.removeItem("apexvest_user");
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
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 z-10">
          <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 w-full">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary"
            >
              <ShieldCheck className="h-6 w-6" />
              <span className="font-headline">ApexVest</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-foreground transition-colors hover:text-foreground"
            >
              <LayoutDashboard className="h-5 w-5 inline-block mr-2" />
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="text-foreground transition-colors hover:text-foreground"
              >
                <Cog className="h-5 w-5 inline-block mr-2" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user}`} />
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 dark:text-red-400 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    </UserDataContext.Provider>
  );
}
