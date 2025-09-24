
'use client';

import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { getTierFromDeposit, tiers } from '@/lib/constants';
import { InvestmentPackageCard } from '@/components/dashboard/investment-package-card';
import { useUserData } from './layout';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const userData = useUserData();
  const router = useRouter();

  const handleDeposit = () => {
    // In a real app, you'd refetch the user data
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
