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
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { EIGLogo } from "@/components/eig-logo";

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
          setUserData(userSnap.data() as UserData);
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
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col gap-6 text-lg font-medium p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold text-primary"
            >
              <EIGLogo className="h-8 w-8" />
              <span className="font-headline">Ethiopian Investment Group</span>
            </Link>
            <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-5 w-5" />
                Home
            </Link>
             <Link
                href="/dashboard/withdrawal"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Landmark className="h-5 w-5" />
                Withdraw
            </Link>
            
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Cog className="h-5 w-5" />
                Admin
              </Link>
            )}
          </nav>
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                  <nav className="grid gap-6 text-lg font-medium">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-lg font-semibold text-primary"
                    >
                      <EIGLogo className="h-8 w-8" />
                      <span className="font-headline">Ethiopian Investment Group</span>
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                      <Home className="h-5 w-5" />
                      Home
                    </Link>
                    <Link href="/dashboard/withdrawal" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                      <Landmark className="h-5 w-5" />
                      Withdraw
                    </Link>
                    {isAdmin && (
                      <Link href="/dashboard/admin" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                        <Cog className="h-5 w-5" />
                        Admin
                      </Link>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>

            <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 ml-auto">
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
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                {children}
            </main>
        </div>
      </div>
    </UserDataContext.Provider>
  );
}
