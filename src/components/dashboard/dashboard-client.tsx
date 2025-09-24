
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getTierFromDeposit, tiers } from "@/lib/constants";
import { UserData } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { DepositCard } from "./deposit-card";
import { WithdrawCard } from "./withdraw-card";
import { ReferralProgramCard } from "./referral-card";
import { doc, onSnapshot, runTransaction, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatCurrency } from "@/lib/utils";


interface DashboardClientProps {
  initialUserData: UserData;
}

const generateReferralCode = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ initialUserData }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(initialUserData);
  const [liveEarnings, setLiveEarnings] = useState(userData.earningsBalance);

  const calculateAndApplyEarnings = useCallback(async () => {
    if (!user?.displayName) return;

    const userRef = doc(db, "users", user.displayName);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User not found");
            }

            const data = userDoc.data() as UserData;
            const lastUpdate = new Date(data.lastEarningsUpdate || data.joined);
            const now = new Date();
            const secondsSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / 1000;
            
            const currentTier = tiers.find(t => t.name === data.membershipTier);
            if (!currentTier || currentTier.dailyReturn === 0 || data.totalDeposit === 0) {
                transaction.update(userRef, { lastEarningsUpdate: now.toISOString() });
                return;
            }

            const dailyRate = currentTier.dailyReturn;
            const earningsPerSecond = data.totalDeposit * dailyRate / 86400; // 86400 seconds in a day
            const newEarnings = earningsPerSecond * secondsSinceLastUpdate;
            
            if (newEarnings > 0) {
                const newEarningsBalance = (data.earningsBalance || 0) + newEarnings;
                transaction.update(userRef, {
                    earningsBalance: newEarningsBalance,
                    lastEarningsUpdate: now.toISOString()
                });
            } else {
                 transaction.update(userRef, { lastEarningsUpdate: now.toISOString() });
            }
        });
    } catch (error) {
        console.error("Error calculating earnings:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.displayName && !userData.referralCode) {
      const generatedCode = generateReferralCode(6);
      const userRef = doc(db, "users", user.displayName);
      updateDoc(userRef, { referralCode: generatedCode }).then(() => {
        setUserData(prev => ({ ...prev, referralCode: generatedCode }));
      });
    }
  }, [user?.displayName, userData.referralCode]);

  useEffect(() => {
    if (user?.displayName) {
      calculateAndApplyEarnings(); // Run once on mount to capture offline earnings
      const unsubscribe = onSnapshot(doc(db, "users", user.displayName), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData;
          setUserData(data);
          setLiveEarnings(data.earningsBalance); // Reset live earnings with DB value
        }
      });
      return () => unsubscribe();
    }
  }, [user?.displayName, calculateAndApplyEarnings]);
  
  useEffect(() => {
    const currentTier = tiers.find(tier => tier.name === userData.membershipTier);
    if (!currentTier || userData.totalDeposit <= 0 || currentTier.dailyReturn <= 0) {
      return; 
    }

    const earningsPerSecond = userData.totalDeposit * currentTier.dailyReturn / 86400;
    
    const intervalId = setInterval(() => {
        setLiveEarnings(prevEarnings => prevEarnings + earningsPerSecond);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [userData.totalDeposit, userData.membershipTier]);
  
  const fetchUserData = useCallback(async () => {
    if (!user?.displayName) return;
    await calculateAndApplyEarnings();
  }, [user?.displayName, calculateAndApplyEarnings]);
  
  const totalBalance = userData.totalDeposit + liveEarnings;
  const currentTierName = userData.membershipTier;
  
  return (
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="sm:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Account Overview</CardTitle>
                <CardDescription className="max-w-lg text-balance leading-relaxed">
                  Welcome back, {user?.displayName || user?.email}!
                </CardDescription>
              </CardHeader>
               <CardContent>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Investment Package
                  </p>
                  <p className="text-xl font-bold text-primary">{currentTierName}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Balance</CardDescription>
                <CardTitle className="text-4xl">{formatCurrency(totalBalance)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Principal + Real-time Earnings</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="pb-2">
                <CardDescription>Principal</CardDescription>
                <CardTitle className="text-4xl">{formatCurrency(userData.totalDeposit)}</CardTitle>
              </CardHeader>
               <CardContent>
                <div className="text-xs text-muted-foreground">Your total deposited amount</div>
              </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DepositCard onDeposit={fetchUserData} />
          <WithdrawCard onWithdraw={fetchUserData} totalBalance={totalBalance} />
          <ReferralProgramCard userData={userData}/>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Card className="md:col-span-2 lg:col-span-1 xl:col-span-2">
            <CardHeader>
              <CardTitle>All Investment Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                 <li className="hidden sm:grid grid-cols-3 items-center text-sm font-semibold text-muted-foreground px-4">
                    <span>Package</span>
                    <span className="text-right">Daily Return</span>
                    <span className="text-right">Price (Br)</span>
                </li>
                {tiers
                  .filter((tier) => tier.name !== 'Observer')
                  .map((tier) => (
                    <li key={tier.name} className="border-t sm:border-0 sm:grid sm:grid-cols-3 items-center text-sm py-3 sm:px-4 rounded-lg sm:hover:bg-muted/50">
                        <div className="flex justify-between sm:block">
                           <span className="text-muted-foreground sm:hidden">Package</span>
                           <span className="font-semibold">{tier.name}</span>
                        </div>
                        <div className="flex justify-between sm:block sm:text-right">
                            <span className="text-muted-foreground sm:hidden">Daily Return</span>
                            <span className="font-semibold text-primary">{(tier.dailyReturn * 100).toFixed(1)}%</span>
                        </div>
                         <div className="flex justify-between sm:block sm:text-right">
                            <span className="text-muted-foreground sm:hidden">Price</span>
                            <span className="font-semibold">{tier.minDeposit.toLocaleString()}</span>
                        </div>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};
