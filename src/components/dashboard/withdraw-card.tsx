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
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { getTierFromDeposit } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface WithdrawCardProps {
  onWithdraw: () => void;
  totalBalance: number;
}

const createWithdrawSchema = (maxAmount: number) => z.object({
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number()
      .positive("Amount must be positive")
      .max(maxAmount, `Withdrawal amount cannot exceed your total balance of ${formatCurrency(maxAmount)}`)
  ),
});

export const WithdrawCard = ({ onWithdraw, totalBalance }: WithdrawCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const withdrawSchema = createWithdrawSchema(totalBalance);

  const form = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof withdrawSchema>) {
    if (!user || !user.displayName) return;
    setIsWithdrawing(true);

    const userRef = doc(db, "users", user.displayName);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document not found");
        }

        const data = userDoc.data();
        const currentEarnings = data.earningsBalance || 0;
        const currentPrincipal = data.totalDeposit || 0;
        const availableBalance = currentPrincipal + currentEarnings;
        const withdrawAmount = values.amount;

        if (withdrawAmount > availableBalance) {
          throw new Error("Insufficient funds for this withdrawal.");
        }

        let newEarnings = currentEarnings;
        let newPrincipal = currentPrincipal;

        if (withdrawAmount <= currentEarnings) {
          newEarnings -= withdrawAmount;
        } else {
          const fromPrincipal = withdrawAmount - currentEarnings;
          newEarnings = 0;
          newPrincipal -= fromPrincipal;
        }

        const newTier = getTierFromDeposit(newPrincipal);

        transaction.update(userRef, {
          totalDeposit: newPrincipal,
          earningsBalance: newEarnings,
          membershipTier: newTier,
        });
      });

      toast({
        title: "Withdrawal Successful",
        description: `${formatCurrency(values.amount)} has been withdrawn from your account.`,
      });
      if(onWithdraw) onWithdraw();
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Withdrawal failed: ", error);
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: (error as Error).message || "There was a problem processing your withdrawal. Please try again.",
      });
    } finally {
      setIsWithdrawing(false);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>Move funds from your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">Withdraw</Button>
          </DialogTrigger>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make a Withdrawal</DialogTitle>
          <DialogDescription>
            Your total available balance is {formatCurrency(totalBalance)}. Enter the amount you wish to withdraw.
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
                    <Input type="number" placeholder="e.g., 5000" {...field} onChange={(e) => field.onChange(e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="flex justify-end">
                <Button type="button" variant="link" className="p-0 h-auto" onClick={() => form.setValue('amount', totalBalance)}>
                    Withdraw Max
                </Button>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isWithdrawing}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isWithdrawing}>
                {isWithdrawing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : "Confirm Withdrawal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
