
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";

interface Referral {
  id: string;
  deposit: number;
}

interface ReferralCardProps {
    userData: UserData | null;
}

export const ReferralProgramCard = ({ userData }: ReferralCardProps) => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (userData?.referralCode) {
      setReferralLink(`${window.location.origin}/?ref=${userData.referralCode}`);
    }
  }, [userData]);

  useEffect(() => {
    if (!user || !user.displayName) return;

    const referralsCol = collection(db, "users", user.displayName, "referrals");
    const unsubscribe = onSnapshot(referralsCol, (snapshot) => {
      const fetchedReferrals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Referral[];
      setReferrals(fetchedReferrals);
    });

    return () => unsubscribe();
  }, [user]);

  const copyToClipboard = useCallback(() => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [referralLink]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Referral Program</CardTitle>
        <CardDescription>Earn a 8% bonus on the first deposit of users you refer.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">Your Unique Referral Link</p>
          <div className="flex items-center gap-2">
            <Input 
              readOnly 
              value={referralLink} 
              className="flex-grow p-2 bg-muted rounded-md text-sm font-mono select-all overflow-x-auto" 
            />
            <Button onClick={copyToClipboard} size="sm">
              {isCopied ? 'Copied!' : 'Copy'}
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
