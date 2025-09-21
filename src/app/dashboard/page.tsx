'use client';

import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { getTierFromDeposit } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUserData } from './layout'; 

export default function DashboardPage() {
  const userData = useUserData(); 
  const router = useRouter();

  if (!userData) {
    return null;
  }
  
  const currentTierName = getTierFromDeposit(userData.totalDeposit);
  
  if (currentTierName === 'Observer') {
    return (
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">Welcome!</CardTitle>
              <CardDescription>
                Your journey to financial growth starts here. Select a membership plan to begin earning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/membership')} size="lg">
                Choose Your Membership Plan
              </Button>
            </CardContent>
          </Card>
      </div>
    );
  }

  return <DashboardClient initialUserData={userData} />;
}
