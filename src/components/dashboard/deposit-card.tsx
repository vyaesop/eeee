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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/lib/types';
import { getTierFromDeposit } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

const depositSchema = z.object({
  amount: z.coerce.number().min(1, { message: "Amount must be at least Br 1."}),
});

export const DepositCard = ({ onDeposit, userData }: { onDeposit: () => void, userData: UserData | null }) => {
  const { toast } = useToast();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof depositSchema>) {
    if (!userData) {
        toast({
            variant: "destructive",
            title: "Deposit Failed",
            description: "Your user data could not be loaded. Please try again later.",
        });
        return;
    }
    setIsDepositing(true);

    const userRef = doc(db, "users", userData.username);

    try {
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw "Document does not exist!";
      }

      const newTotalDeposit = (userDoc.data().totalDeposit || 0) + values.amount;
      const newTier = getTierFromDeposit(newTotalDeposit);

      await updateDoc(userRef, {
        totalDeposit: increment(values.amount),
        membershipTier: newTier,
      });
      
      const referrerId = userDoc.data().referredBy;
      if (referrerId) {
          const referrerRef = doc(db, "users", referrerId);
          const referrerDoc = await getDoc(referrerRef);
          if (referrerDoc.exists()) {
              const referralBonus = values.amount * 0.05;
              await updateDoc(referrerRef, { earningsBalance: increment(referralBonus) });
              
              const referralSubcollectionRef = doc(db, `users/${referrerId}/referrals`, userData.username );
              await setDoc(referralSubcollectionRef, { deposit: values.amount }, { merge: true });
          }
      }

      toast({
        title: "Deposit Successful",
        description: `${formatCurrency(values.amount)} has been added to your account.`,
      });
      if(onDeposit) onDeposit(); 
      form.reset();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Deposit failed: ", error);
       if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'update',
                requestResourceData: { totalDeposit: `increment(${values.amount})`},
            });
            errorEmitter.emit('permission-error', permissionError);
       }
      toast({
        variant: "destructive",
        title: "Deposit Failed",
        description: "There was a problem processing your deposit. Please try again.",
      });
    } finally {
      setIsDepositing(false);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Deposit Funds</CardTitle>
                <CardDescription>Add money to your account to start earning.</CardDescription>
            </CardHeader>
            <CardContent>
                <DialogTrigger asChild>
                    <Button className="w-full">Deposit</Button>
                </DialogTrigger>
            </CardContent>
        </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make a Deposit</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to deposit. The funds will be added to your principal balance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (in Br)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isDepositing}>Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="default" disabled={isDepositing || !userData}>
                {isDepositing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : "Confirm Deposit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
