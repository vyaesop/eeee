
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
import { doc, updateDoc, increment, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { getTierFromDeposit, tiers } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const depositSchema = z.object({
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("Amount must be positive")
  ),
});

interface InvestmentPackageCardProps {
    tier: typeof tiers[number];
    onDeposit: () => void;
}

export const InvestmentPackageCard = ({ tier, onDeposit }: InvestmentPackageCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: tier.minDeposit,
    },
  });

  async function onSubmit(values: z.infer<typeof depositSchema>) {
    if (!user || !user.displayName) return;
    setIsDepositing(true);

    const userRef = doc(db, "users", user.displayName);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw "Document does not exist!";
        }

        const newTotalDeposit = (userDoc.data().totalDeposit || 0) + values.amount;
        const newTier = getTierFromDeposit(newTotalDeposit);

        transaction.update(userRef, {
          totalDeposit: increment(values.amount),
          membershipTier: newTier,
        });
        
        const referrerId = userDoc.data().referredBy;
        if (referrerId) {
            const referrerRef = doc(db, "users", referrerId);
            const referrerDoc = await transaction.get(referrerRef);
            if (referrerDoc.exists()) {
                const referralBonus = values.amount * 0.05; // 5% bonus
                transaction.update(referrerRef, { earningsBalance: increment(referralBonus) });
                
                const referralSubcollectionRef = doc(db, `users/${referrerId}/referrals`, user.displayName! );
                transaction.set(referralSubcollectionRef, { deposit: values.amount }, { merge: true });
            }
        }
      });

      toast({
        title: "Deposit Successful",
        description: `${formatCurrency(values.amount)} has been added to your account.`,
      });
      if(onDeposit) onDeposit(); 
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Deposit failed: ", error);
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
        <Card className="shadow-lg w-full max-w-sm">
            <CardHeader>
                <CardTitle style={{ color: tier.color }}>{tier.name}</CardTitle>
                <CardDescription>{formatCurrency(tier.minDeposit)} - {tier.maxDeposit === Infinity ? 'Unlimited' : formatCurrency(tier.maxDeposit)}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className='text-green-500 font-bold'>{(tier.apy * 100).toFixed(2)}% APY</p>
                <p>Daily Return: {(tier.dailyReturn * 100).toFixed(2)}%</p>
                <DialogTrigger asChild>
                    <Button className="w-full mt-4" style={{ backgroundColor: tier.color }}>Choose Plan</Button>
                </DialogTrigger>
            </CardContent>
        </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit for {tier.name}</DialogTitle>
          <DialogDescription>
            You are about to deposit funds for the {tier.name} package.
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
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isDepositing}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isDepositing}>
                {isDepositing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : "Confirm Deposit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
