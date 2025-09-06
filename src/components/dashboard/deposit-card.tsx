"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TIERS } from "@/lib/constants";
import type { Tier } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive.").min(1, "Minimum deposit is $1."),
});

type DepositCardProps = {
  currentTier: Tier;
  handleDeposit: (amount: number) => void;
  isCompounding: boolean;
  setIsCompounding: (value: boolean) => void;
};

const tiers = [TIERS.SILVER, TIERS.GOLD, TIERS.PLATINUM];

export default function DepositCard({ handleDeposit, isCompounding, setIsCompounding }: DepositCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 1000,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTimeout(() => {
      handleDeposit(values.amount);
      toast({
        title: "Deposit Successful",
        description: `${formatCurrency(values.amount)} has been added to your principal.`,
      });
      form.reset();
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Your Portfolio</CardTitle>
        <CardDescription>
          Deposit funds to increase your principal and unlock higher tiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Deposit Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Depositing..." : "Deposit"}
            </Button>
          </form>
        </Form>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="compound-switch">Automatic Compounding</Label>
            <p className="text-xs text-muted-foreground">
              Automatically re-invest your earnings to maximize growth.
            </p>
          </div>
          <Switch
            id="compound-switch"
            checked={isCompounding}
            onCheckedChange={setIsCompounding}
            aria-label="Toggle automatic compounding"
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <h4 className="font-semibold">Tier Breakdowns</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {tiers.map((tier) => (
                <div key={tier.name} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-bold text-sm">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{`$${tier.minDeposit / 1000}k+`}</p>
                    <p className="text-xs font-semibold text-accent">{tier.monthlyRate * 100}% Monthly</p>
                </div>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}
