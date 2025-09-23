'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { getTierFromDeposit, tiers } from "@/lib/constants";
import { UserData } from "@/lib/types";
import {
  Banknote,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DepositCard } from "./deposit-card";
import { ReferralProgramCard } from "./referral-card";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Content } from "@radix-ui/react-dropdown-menu";
import { formatCurrency } from "@/lib/utils";


interface DashboardClientProps {
  initialUserData: UserData;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ initialUserData }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(initialUserData);
  
  const totalDeposit = userData?.totalDeposit ?? 0;
  const earningsBalance = userData?.earningsBalance ?? 0;

  const [earnings, setEarnings] = useState(earningsBalance);
  const [apy, setApy] = useState(0);

  const currentTierName = getTierFromDeposit(totalDeposit);
  const currentTier = tiers.find(tier => tier.name === currentTierName);

  useEffect(() => {
    if (user?.displayName) {
      const unsub = onSnapshot(doc(db, "users", user.displayName), (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as UserData);
        }
      });
      return () => unsub();
    }
  }, [user?.displayName]);
  
  useEffect(() => {
    setEarnings(earningsBalance);

    if (!currentTier || currentTier.name === 'Observer') {
      setApy(0);
      return;
    }

    const dailyRate = currentTier.dailyReturn ?? 0;
    const annualRate = Math.pow(1 + dailyRate, 365) - 1;
    setApy(annualRate * 100);

    const interval = setInterval(() => {
      setEarnings((prev) => prev + totalDeposit * dailyRate / (24 * 60 * 60 / 2));
    }, 2000);

    return () => clearInterval(interval);
  }, [userData, currentTier, totalDeposit, earningsBalance]);

  const fetchUserData = useCallback(async () => {
    if (!user?.displayName) return;
    const unsub = onSnapshot(doc(db, "users", user.displayName), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as UserData);
      }
    });
    return () => unsub();
  }, [user?.displayName]);

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
                <CardDescription>Live Earnings</CardDescription>
                <CardTitle className="text-4xl">{formatCurrency(earnings)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">+{(currentTier?.dailyReturn ?? 0) * 100}% from yesterday</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Principal</CardDescription>
                <CardTitle className="text-4xl">{formatCurrency(totalDeposit)}</CardTitle>
              </CardHeader>
               <CardContent>
                <div className="text-xs text-muted-foreground">Your total deposited amount</div>
              </CardContent>
            </Card>
        </div>

        <DepositCard onDeposit={fetchUserData} />

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                 <CardHeader>
                    <CardTitle>APY Meter</CardTitle>
                    <CardDescription>Annual Percentage Yield based on your current package.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">APY</p>
                    <p className="font-bold text-primary">{apy.toFixed(2)}%</p>
                    </div>
                    <Progress value={apy} className="w-full" />
                </CardContent>
            </Card>
            <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
              <ReferralProgramCard />
            </div>
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
