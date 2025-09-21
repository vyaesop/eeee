'use client';

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Gem } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/membership", label: "Membership" },
];

export const Header = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="bg-background text-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Gem className="h-6 w-6 text-primary" />
          <span className="font-headline">ApexVest</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Button onClick={() => router.push('/dashboard')} variant="secondary">Dashboard</Button>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </>
          ) : (
            <>
              <Button onClick={() => router.push('/')} variant="secondary">Login</Button>
              <Button onClick={() => router.push('/register')}>Sign Up</Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <Link href={link.href} key={link.href} className="text-lg hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-border">
              {user ? (
                <div className="flex flex-col gap-4">
                  <Button onClick={() => router.push('/dashboard')} variant="secondary" className="w-full">Dashboard</Button>
                  <Button onClick={handleLogout} variant="outline" className="w-full">Logout</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button onClick={() => router.push('/')} variant="secondary" className="w-full">Login</Button>
                  <Button onClick={() => router.push('/register')} className="w-full">Sign Up</Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  );
};
