'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Gem } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

const passwordResetSchema = z.object({
  resetEmail: z.string().email("Invalid email address"),
});

export default function LoginPage() {
  const { signIn, sendPasswordReset } = useAuth();
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetForm = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      resetEmail: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signIn(values.email, values.password);
  }

  async function handlePasswordReset(values: z.infer<typeof passwordResetSchema>) {
    await sendPasswordReset(values.resetEmail);
    setResetDialogOpen(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Gem className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold mt-4 font-headline">Welcome to ApexVest</h1>
          <p className="text-muted-foreground">Securely log in to your account</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
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
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="underline">
            Sign Up
          </Link>
        </p>
        <Dialog open={isResetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="link" className="w-full">Forgot Password?</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Your Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4 py-4">
                <FormField
                  control={resetForm.control}
                  name="resetEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Send Reset Link</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
