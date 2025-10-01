
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  username: z.string().min(3, "Phone number must be at least 10 characters."),
  invitationCode: z.string().min(1, "Invitation code is required."),
});

const VALID_INVITATION_CODE = "APEX2024";
const ADMIN_INVITATION_CODE = "ADMIN2024";

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { logIn, user, loading: authLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      invitationCode: "",
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      form.setValue("invitationCode", ref);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const isAdminLogin = values.username === 'admin' && values.invitationCode === ADMIN_INVITATION_CODE;

    if (isAdminLogin) {
        try {
            await logIn(values.username, 'admin'); // Using a dummy password for admin
            router.push("/dashboard");
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Admin Login Failed",
                description: "There was an issue logging in the admin.",
            });
            setIsLoading(false);
        }
        return;
    }

    if (values.invitationCode !== VALID_INVITATION_CODE && !referralCode) {
        toast({
            variant: "destructive",
            title: "Invalid Invitation Code",
            description: "Please check your code and try again.",
        });
        setIsLoading(false);
        return;
    }

    try {
        const userRef = doc(db, "users", values.username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            toast({
                title: "Phone number Exists",
                description: "This Phone number is taken. Trying to log in instead.",
            });
            // Try to log in if user exists
            router.push(`/login?username=${values.username}`);
            setIsLoading(false);
            return;
        }
        
        let referrerUsername: string | null = null;
        if (referralCode) {
             const usersRef = collection(db, "users");
             const q = query(usersRef, where("referralCode", "==", referralCode));
             const querySnapshot = await getDocs(q);
             if (!querySnapshot.empty) {
                 referrerUsername = querySnapshot.docs[0].id;
             } else {
                 toast({ variant: "destructive", title: "Invalid Referral", description: "The referral code used is not valid." });
                 setIsLoading(false);
                 return;
             }
        }

        // New user, redirect to registration page
        const params = new URLSearchParams();
        params.set('username', values.username);
        if(referrerUsername) {
            params.set('ref', referrerUsername);
        }

        router.push(`/register?${params.toString()}`);

    } catch (error) {
        console.error("Firestore operation failed:", error);
        toast({ variant: "destructive", title: "Operation Failed", description: "Could not connect to the database." });
        setIsLoading(false);
    }
  }

  if (authLoading || user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center mb-8">
        <UserPlus className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-5xl font-headline font-bold text-foreground">
          Join Ethiopian Investment Group
        </h1>
        <p className="text-muted-foreground mt-2">
          Start your journey to premier financial opportunities.
        </p>
      </div>
      <Card className="w-full max-w-sm shadow-2xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Get Started</CardTitle>
          <CardDescription>
            {referralCode 
                ? `You've been referred. Enter your details to join.` 
                : "Enter your desired username and invitation code."
            }
        </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 0911223344" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="invitationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invitation Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your exclusive code" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Continue"}
              </Button>
            </form>
          </Form>
           <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-primary">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
