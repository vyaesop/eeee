'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { getTierFromDeposit, tiers } from "@/lib/constants";
import { UserData } from "@/lib/types";
import {
  Banknote,
  Gem,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DepositCard } from "./deposit-card";
import { ReferralProgramCard } from "./referral-card";

interface DashboardClientProps {
  userData: UserData;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ userData }) => {
  const { user } = useAuth();
  const router = useRouter();
  
  const totalDeposit = userData?.totalDeposit ?? 0;
  const autoCompounding = userData?.autoCompounding ?? false;
  const earningsBalance = userData?.earningsBalance ?? 0;

  const [earnings, setEarnings] = useState(earningsBalance);
  const [apy, setApy] = useState(0);

  const currentTierName = getTierFromDeposit(totalDeposit);
  const currentTier = tiers.find(tier => tier.name === currentTierName);

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
      setEarnings((prev) => {
        if (autoCompounding) {
          const newTotal = totalDeposit + prev;
          return prev + newTotal * dailyRate / (24 * 60 * 60 / 2);
        } else {
          return prev + totalDeposit * dailyRate / (24 * 60 * 60 / 2);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [userData, currentTier, totalDeposit, autoCompounding, earningsBalance]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
                <CardDescription>
                  Welcome back, {user?.displayName || user?.email}!
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
                    <Gem className="w-4 h-4 mr-2" />
                    Investment Package
                  </CardTitle>
                  <p className="text-xl font-bold">{currentTierName}</p>
                </div>
                <div>
                  <CardTitle className="flex items-center text-sm font-medium text-muted-foreground">
                    <Zap className="w-4 h-4 mr-2" />
                    Auto-Compounding
                  </CardTitle>
                  <p className="text-xl font-bold">
                    {autoCompounding ? "Active" : "Inactive"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <DepositCard />

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Live Market Data</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">
                      Br {earnings.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Live Earnings Balance
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Banknote className="w-8 h-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">
                      Br {totalDeposit.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Principal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>APY Meter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Annual Percentage Yield (APY)</p>
                  <p className="font-bold text-primary">{apy.toFixed(2)}%</p>
                </div>
                <Progress value={apy} className="w-full" />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Based on your {currentTierName} package at{" "}
                  {currentTier?.dailyReturn
                    ? (currentTier.dailyReturn * 100).toFixed(2)
                    : 0}% daily return.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <ReferralProgramCard />
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>All Investment Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                   <li className="grid grid-cols-3 items-center text-sm font-semibold">
                      <span className="text-muted-foreground col-span-1">Package</span>
                      <span className="text-muted-foreground text-right col-span-1">Daily Return</span>
                      <span className="text-muted-foreground text-right col-span-1">Price</span>
                  </li>
                  {tiers
                    .filter((tier) => tier.name !== 'Observer')
                    .map((tier) => (
                      <li key={tier.name} className="grid grid-cols-3 items-center text-sm border-t pt-2">
                        <span className="text-muted-foreground col-span-1">{tier.name}</span>
                        <span className="font-semibold text-right col-span-1 text-primary">
                          {(tier.dailyReturn * 100).toFixed(1)}%
                        </span>
                        <span className="font-semibold text-right col-span-1">
                          Br {tier.minDeposit.toLocaleString()}
                        </span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-card-alt">
                  <div>
                    <p className="font-semibold">Auto-Compounding</p>
                    <p className="text-sm text-muted-foreground">
                      Reinvest earnings for exponential growth.
                    </p>
                  </div>
                  <Switch
                    checked={autoCompounding}
                    // onCheckedChange={handleAutoCompoundingToggle}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
