'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Referral {
  id: string;
  deposit: number;
}

export const ReferralProgramCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (user && user.displayName) {
      setReferralLink(`${window.location.origin}/register?ref=${user.displayName}`);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !user.displayName) return;

    const referralsCol = collection(db, "users", user.displayName, "referrals");
    const unsubscribe = onSnapshot(referralsCol, (snapshot) => {
      const fetchedReferrals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Referral[];
      setReferrals(fetchedReferrals);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Referral Program</CardTitle>
        <CardDescription>Earn a 5% bonus on the first deposit of users you refer.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">Your Unique Referral Link</p>
          <div className="flex items-center gap-2">
             <div className="flex-grow p-2 bg-muted rounded-md text-sm font-mono select-all overflow-x-auto">
               {referralLink}
             </div>
             <Button onClick={handleCopy} size="icon" variant="ghost">
               {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
             </Button>
           </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Your Referrals</p>
          {referrals.length > 0 ? (
            <ul className="mt-1 space-y-2">
              {referrals.map(r => (
                <li key={r.id} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-md">
                  <span>{r.id}</span>
                  <span className="font-semibold">Br {r.deposit.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">You have no referrals yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
