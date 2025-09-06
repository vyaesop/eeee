"use client";

import { useEffect, useState } from "react";
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedUser = sessionStorage.getItem("apexvest_user");
    if (!storedUser) {
      router.replace("/");
    } else {
      setUser(storedUser);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("apexvest_user");
    router.replace("/");
  };

  if (!isClient || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg">Securing connection...</p>
        </div>
      </div>
    );
  }

  const userInitial = user ? user.charAt(0).toUpperCase() : "?";
  const isAdmin = user === 'admin';

  return (
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
  );
}
