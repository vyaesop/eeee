
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, getDoc } from "firebase/firestore";
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
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

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
  const { logIn } = useAuth();

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

    if (values.invitationCode !== VALID_INVITATION_CODE) {
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
                title: "Username Exists",
                description: "This username is taken. Trying to log in instead.",
            });
            // Try to log in if user exists
            router.push(`/login?username=${values.username}`);
            setIsLoading(false);
            return;
        }
        
        // New user, redirect to registration page
        const params = new URLSearchParams();
        params.set('username', values.username);
        if(referrer) {
            params.set('ref', referrer);
        }

        router.push(`/register?${params.toString()}`);

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
          Start your journey to premier financial opportunities.
        </p>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Get Started</CardTitle>
          <CardDescription>
            {referrer 
                ? `You've been referred by ${referrer}. Enter your details to join.` 
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
                {isLoading ? "Processing..." : "Continue"}
              </Button>
            </form>
          </Form>
           <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
