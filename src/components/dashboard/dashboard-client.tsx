"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTier, TIERS, MOCK_REFERRALS } from "@/lib/constants";
import type { Tier } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import StatCard from "./stat-card";
import ApyMeter from "./apy-meter";
import DepositCard from "./deposit-card";
import ReferralCard from "./referral-card";
import { TrendingUp, DollarSign, Users, Award, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const REFERRAL_BONUS_RATE = 0.05;

export default function DashboardClient() {
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [earningsBalance, setEarningsBalance] = useState(0);
  const [isCompounding, setIsCompounding] = useState(true);
  const [tier, setTier] = useState<Tier>(TIERS.OBSERVER);
  const [user, setUser] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const referralBonus = MOCK_REFERRALS.reduce((acc, referral) => acc + referral.deposit * REFERRAL_BONUS_RATE, 0);

  useEffect(() => {
    setIsClient(true);
    const storedUser = sessionStorage.getItem("apexvest_user");
    if(storedUser) {
        setUser(storedUser);
        const savedData = localStorage.getItem(`apexvest_data_${storedUser}`);
        if (savedData) {
            const { totalDeposit, earningsBalance, isCompounding } = JSON.parse(savedData);
            setTotalDeposit(totalDeposit);
            setEarningsBalance(earningsBalance);
            setIsCompounding(isCompounding);
        }
    }
  }, []);

  useEffect(() => {
    if (isClient && user) {
      const dataToSave = JSON.stringify({ totalDeposit, earningsBalance, isCompounding });
      localStorage.setItem(`apexvest_data_${user}`, dataToSave);
    }
    setTier(getTier(totalDeposit));
  }, [totalDeposit, earningsBalance, isCompounding, isClient, user]);

  const calculateAndAddInterest = useCallback(() => {
    if (tier.monthlyRate > 0) {
      const principal = isCompounding ? totalDeposit + earningsBalance : totalDeposit;
      const dailyRate = Math.pow(1 + tier.monthlyRate, 1 / 30) - 1;
      const dailyEarnings = principal * dailyRate;
      setEarningsBalance(prev => prev + dailyEarnings);
    }
  }, [totalDeposit, earningsBalance, isCompounding, tier]);

  useEffect(() => {
    const interval = setInterval(calculateAndAddInterest, 2000); // Update every 2 seconds for a "live" feel
    return () => clearInterval(interval);
  }, [calculateAndAddInterest]);

  const handleDeposit = (amount: number) => {
    setTotalDeposit(prev => prev + amount);
  };
  
  if (!isClient) return null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
            title="Membership Tier"
            value={tier.name}
            icon={<Award className="h-5 w-5 text-muted-foreground" />}
            description="Based on your total deposit"
        >
            <div className="w-full h-2 rounded-full mt-2 bg-muted">
                <div style={{width: `${tier.apy / TIERS.PLATINUM.apy * 100}%`, backgroundColor: tier.color}} className="h-2 rounded-full transition-all duration-500"></div>
            </div>
        </StatCard>
        <StatCard
            title="Total Principal"
            value={formatCurrency(totalDeposit)}
            icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
            description="Your total deposited amount"
        />
        <StatCard
            title="Earnings Balance"
            value={formatCurrency(earningsBalance)}
            icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
            description="Live compounded returns"
        />
        <StatCard
            title="Referral Bonus"
            value={formatCurrency(referralBonus)}
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            description={`From ${MOCK_REFERRALS.length} successful referrals`}
        />
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-8">
        <div className="xl:col-span-2 grid gap-4 md:gap-8">
          <DepositCard 
            currentTier={tier} 
            handleDeposit={handleDeposit} 
            isCompounding={isCompounding} 
            setIsCompounding={setIsCompounding}
            />
          {user && <ReferralCard username={user} referrals={MOCK_REFERRALS} />}
        </div>
        <Card className="flex flex-col items-center justify-center p-6 row-start-1 lg:row-start-auto">
            <CardContent className="flex flex-col items-center justify-center text-center p-0">
                <Zap className="h-8 w-8 text-amber-500 mb-2" />
                <h3 className="text-lg font-semibold mb-2">Current APY</h3>
                <ApyMeter apy={tier.apy} />
                <p className="text-sm text-muted-foreground mt-4">
                    Your Annual Percentage Yield increases with your membership tier.
                </p>
                <Separator className="my-4"/>
                <div className="text-sm text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Silver:</span> {Math.round(TIERS.SILVER.apy * 100)}% APY</p>
                    <p><span className="font-semibold text-foreground">Gold:</span> {Math.round(TIERS.GOLD.apy * 100)}% APY</p>
                    <p><span className="font-semibold text-foreground">Platinum:</span> {Math.round(TIERS.PLATINUM.apy * 100)}% APY</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
