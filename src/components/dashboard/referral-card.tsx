"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift } from "lucide-react";
import { formatCurrency } from '@/lib/utils';

type Referral = {
    name: string;
    deposit: number;
}

type ReferralCardProps = {
  username: string;
  referrals: Referral[];
};

export default function ReferralCard({ username, referrals }: ReferralCardProps) {
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState('');

  useState(() => {
    if (typeof window !== 'undefined') {
        const link = `${window.location.origin}/join?ref=${username}`;
        setReferralLink(link);
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied to clipboard!",
      description: "Your referral link is ready to be shared.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Program
        </CardTitle>
        <CardDescription>
            Earn a 5% bonus on the initial deposit of every member you refer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center space-x-2 mb-6">
          <Input value={referralLink} readOnly />
          <Button type="button" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <h4 className="font-semibold mb-2 text-sm">Your Referrals</h4>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Deposit</TableHead>
                    <TableHead className="text-right">Your Bonus</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {referrals.map((ref, i) => (
                        <TableRow key={i}>
                            <TableCell className="font-medium">{ref.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(ref.deposit)}</TableCell>
                            <TableCell className="text-right text-accent font-medium">{formatCurrency(ref.deposit * 0.05)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
