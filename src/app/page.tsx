
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
import { UserPlus } from "lucide-react";
import { getTierFromDeposit } from "@/lib/constants";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  invitationCode: z.string().min(1, "Invitation code is required."),
});

const VALID_INVITATION_CODE = "APEX2024";
const ADMIN_INVITATION_CODE = "ADMIN2024";

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferrer(ref);
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      invitationCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const isAdminLogin = values.username === 'admin' && values.invitationCode === ADMIN_INVITATION_CODE;

    if (values.invitationCode !== VALID_INVITATION_CODE && !isAdminLogin) {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: "Invalid invitation code. Please check your code and try again.",
        });
        setIsLoading(false);
        return;
    }

    try {
        if(isAdminLogin) {
            sessionStorage.setItem("apexvest_user", 'admin');
            router.push("/dashboard");
            return;
        }

        const userRef = doc(db, "users", values.username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "This username is already taken. If this is you, please log in.",
            });
            setIsLoading(false);
            return;
        }
        
        // This is a new user registration.
        const initialDeposit = 0;
        const newUser = {
            username: values.username,
            totalDeposit: initialDeposit,
            earningsBalance: 0,
            autoCompounding: true,
            joined: new Date().toISOString(),
            referredBy: referrer || null,
            tier: getTierFromDeposit(initialDeposit),
        };
        await setDoc(userRef, newUser);
        
        toast({ title: "Account Created!", description: "Welcome to ApexVest, your journey starts now." });

        if (typeof window !== "undefined") {
            sessionStorage.setItem("apexvest_user", values.username);
        }
        router.push("/dashboard");

    } catch (error) {
        console.error("Firestore operation failed:", error);
        toast({ variant: "destructive", title: "Operation Failed", description: "Could not connect to the database." });
        setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center mb-8">
        <UserPlus className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-5xl font-headline font-bold text-primary">
          Join ApexVest
        </h1>
        <p className="text-muted-foreground mt-2">
          Create your account to access premier financial opportunities.
        </p>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create Your Account</CardTitle>
          <CardDescription>
            {referrer 
                ? `You've been referred by ${referrer}. Complete the form to join.` 
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
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. janesmith" {...field} />
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
                      <Input placeholder="Enter your exclusive code" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Join / Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
