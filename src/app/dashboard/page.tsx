'use client';

import { useState, useEffect } from 'react';
import { useUserData } from './layout';
import StatCard from '@/components/dashboard/stat-card';
import { InvestmentPackageCard } from '@/components/dashboard/investment-package-card';
import { DepositCard } from '@/components/dashboard/deposit-card';
import { WithdrawCard } from '@/components/dashboard/withdraw-card';
import { ReferralProgramCard } from '@/components/dashboard/referral-card';
import ApyMeter from '@/components/dashboard/apy-meter';
import { SupportChat } from '@/components/dashboard/support-chat';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/lib/types';
import { tiers } from '@/lib/constants';
import { DollarSign, TrendingUp, Zap, Gift } from 'lucide-react';
import { MembershipStatus } from '@/components/dashboard/membership-status';

export default function DashboardPage() {
  const initialUserData = useUserData();
  const [userData, setUserData] = useState<UserData | null>(initialUserData);
  const [animatedEarnings, setAnimatedEarnings] = useState(0);

  const fetchUserData = async () => {
    if (initialUserData?.username) {
      const userRef = doc(db, 'users', initialUserData.username);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const basicData = userSnap.data() as Omit<UserData, 'username' | 'referrals'>;
        const referralsRef = collection(db, `users/${initialUserData.username}/referrals`);
        const referralsSnap = await getDocs(referralsRef);
        const referrals = referralsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string, deposit: number }));
        setUserData({ ...basicData, username: initialUserData.username, referrals });
      }
    }
  };

  useEffect(() => {
    setUserData(initialUserData);
  }, [initialUserData]);

  useEffect(() => {
    if (!userData) {
      return;
    }

    if (userData.totalDeposit <= 0) {
      setAnimatedEarnings(userData.earningsBalance);
      return;
    }

    const dailyRate = 0.015;
    const ratePerSecond = dailyRate / 86400;

    const calculateEarnings = () => {
      const { lastEarningsUpdate, earningsBalance, totalDeposit } = userData;
      let lastUpdateDate: Date;

      if (!lastEarningsUpdate) {
        lastUpdateDate = new Date();
      } else if (typeof (lastEarningsUpdate as any).toDate === 'function') {
        lastUpdateDate = (lastEarningsUpdate as any).toDate();
      } else if (typeof (lastEarningsUpdate as any).seconds === 'number') {
        lastUpdateDate = new Date((lastEarningsUpdate as any).seconds * 1000);
      } else if (typeof lastEarningsUpdate === 'string') {
        lastUpdateDate = new Date(lastEarningsUpdate);
      } else {
        lastUpdateDate = new Date();
      }

      const now = new Date();
      const elapsedSeconds = Math.max(0, (now.getTime() - lastUpdateDate.getTime()) / 1000);
      const accruedEarnings = totalDeposit * ratePerSecond * elapsedSeconds;
      
      return earningsBalance + accruedEarnings;
    };

    setAnimatedEarnings(calculateEarnings());

    const interval = setInterval(() => {
      setAnimatedEarnings(calculateEarnings());
    }, 120000);

    return () => clearInterval(interval);
  }, [userData]);

  const handleDeposit = () => {
    fetchUserData();
  };

  const handleWithdraw = () => {
    fetchUserData();
  };

  if (!userData) {
    return <div>Loading user data...</div>; 
  }

  const totalBalance = userData.totalDeposit + animatedEarnings;
  const apy = (Math.pow(1 + 0.015, 365) - 1) * 100;
  const currentTier = tiers.find(tier => userData.totalDeposit >= tier.minDeposit && userData.totalDeposit <= tier.maxDeposit);

  return (
    <>
      <MembershipStatus tier={currentTier?.name} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Principal Balance" value={userData.totalDeposit} icon={<div><DollarSign className="h-4 w-4 text-muted-foreground" /></div>} />
        <StatCard title="Earnings Balance" value={animatedEarnings} icon={<div><TrendingUp className="h-4 w-4 text-muted-foreground" /></div>} />
        <StatCard title="Total Deposit" value={userData.totalDeposit} icon={<div><Zap className="h-4 w-4 text-muted-foreground" /></div>} />
        <StatCard title="Total Earnings" value={totalBalance} icon={<div><Gift className="h-4 w-4 text-muted-foreground" /></div>} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <div className="lg:col-span-5">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <DepositCard onDeposit={handleDeposit} userData={userData} />
              <WithdrawCard onWithdraw={handleWithdraw} totalBalance={totalBalance} />
            </div>
            <ReferralProgramCard userData={userData} />
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Investment Packages</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tiers.map(tier => (
                      <InvestmentPackageCard key={tier.name} tier={tier} onDeposit={handleDeposit}/>
                  ))}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
}
