
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { getTierFromDeposit, tiers } from '@/lib/constants';
import { InvestmentPackageCard } from '@/components/dashboard/investment-package-card';
import { useUserData } from './layout';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();
  const userData = useUserData();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.displayName) {
        if(user.displayName === 'admin') {
           router.replace('/admin');
           return;
        }
        const userRef = doc(db, 'users', user.displayName);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().role === 'admin') {
          router.replace('/admin');
        }
      }
    };
    checkAdmin();
  }, [user, router]);

  const handleDeposit = () => {
    window.location.reload();
  };

  if (!userData) {
    return null; 
  }

  const currentTierName = getTierFromDeposit(userData.totalDeposit);

  if (currentTierName === 'Observer') {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-headline">Choose Your Investment Package</h1>
              <p className="text-muted-foreground">
                Select a package to start your investment journey.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tiers.filter(t => t.name !== 'Observer').map(tier => (
                    <InvestmentPackageCard key={tier.name} tier={tier} onDeposit={handleDeposit} />
                ))}
            </div>
      </div>
    );
  }

  return <DashboardClient initialUserData={userData} />;
}
