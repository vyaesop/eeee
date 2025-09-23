'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Landmark } from 'lucide-react';
import { useUserData } from '../layout';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const withdrawalSchema = z.object({
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("Amount must be positive").min(300, "Minimum withdrawal is 300 Br.")
  ),
});

export default function WithdrawalPage() {
  const { user } = useAuth();
  const userData = useUserData();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const earningsBalance = userData?.earningsBalance ?? 0;

  const form = useForm<z.infer<typeof withdrawalSchema>>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 300,
    },
  });

  async function onSubmit(values: z.infer<typeof withdrawalSchema>) {
    if (!user || !user.displayName) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    if (values.amount > earningsBalance) {
        form.setError('amount', { type: 'manual', message: 'Withdrawal amount cannot exceed your earnings balance.' });
        return;
    }

    setIsProcessing(true);
    const userRef = doc(db, "users", user.displayName);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document not found.");
        }
        
        const currentBalance = userDoc.data().earningsBalance || 0;
        if (values.amount > currentBalance) {
            throw new Error("Insufficient funds.");
        }

        const newBalance = currentBalance - values.amount;
        transaction.update(userRef, { earningsBalance: newBalance });
      });

      toast({
        title: "Withdrawal Successful",
        description: `${formatCurrency(values.amount)} has been withdrawn from your account.`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Withdrawal failed: ", error);
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: error.message || "There was a problem processing your withdrawal. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex justify-center items-start pt-10">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>Withdraw Earnings</CardTitle>
                    <CardDescription>Transfer funds from your earnings balance.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground">Available for Withdrawal</p>
                <p className="text-2xl font-bold">{formatCurrency(earningsBalance)}</p>
            </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (in Br)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : "Confirm Withdrawal"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
