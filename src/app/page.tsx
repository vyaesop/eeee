
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { ShieldCheck } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().optional(), // In a real app, you'd validate this
});

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "ADMIN2024"; // Using the old invitation code as password for admin

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    // Admin login check
    if (values.username === ADMIN_USERNAME && values.password === ADMIN_PASSWORD) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("apexvest_user", values.username);
      }
      toast({ title: "Login Successful", description: "Welcome back, Admin!" });
      router.push("/dashboard/admin");
      setIsLoading(false);
      return;
    }

    // Regular user login check
    try {
      const userRef = doc(db, "users", values.username);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // In a real app, you'd check a password here.
        // For this demo, we'll just log them in if the user exists.
        toast({ title: "Login Successful", description: `Welcome back, ${values.username}!` });
        if (typeof window !== "undefined") {
          sessionStorage.setItem("apexvest_user", values.username);
        }
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "User not found. If you're new, please join first.",
        });
      }
    } catch (error) {
      console.error("Firestore operation failed:", error);
      toast({ variant: "destructive", title: "Login Failed", description: "Could not connect to the database." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center mb-8">
        <ShieldCheck className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-5xl font-headline font-bold text-primary">
          ApexVest
        </h1>
        <p className="text-muted-foreground mt-2">
          Exclusive Access to Premier Financial Opportunities
        </p>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Member Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Secure Login"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">New to ApexVest?</p>
            <Link
              href="/join"
              className="font-medium text-primary hover:underline"
            >
              Join the club
            </Link>
          </div>
           <div className="mt-4 text-center text-sm">
             <Link
              href="/membership"
              className="text-xs text-muted-foreground hover:underline"
            >
              Learn about membership benefits
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
