'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tiers } from "@/lib/constants";
import { useRouter } from 'next/navigation';
import { useUserData } from "@/app/dashboard/layout";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from '@/lib/utils';
import { getTierFromDeposit } from '@/lib/constants';

const MembershipPage = () => {
  const router = useRouter();
  const userData = useUserData();
  const { toast } = useToast();

  const chartData = tiers.filter(t => t.name !== 'Observer').map(tier => ({
    name: tier.name,
    'APY (%)': tier.apy ? Math.round(tier.apy * 100) : 0,
    fill: tier.color,
  }));

  const handleChoosePlan = async (tierName: string, minDeposit: number) => {
    if (!userData?.username) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to choose a plan." });
      return;
    }

    try {
      const userRef = doc(db, "users", userData.username);
      await updateDoc(userRef, {
        membershipTier: getTierFromDeposit(minDeposit),
        totalDeposit: minDeposit
      });
      toast({ title: "Success", description: `You have successfully chosen the ${tierName} plan.` });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating user tier: ", error);
      toast({ variant: "destructive", title: "Error", description: "There was an error updating your plan. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">Choose Your Membership</h1>
            <p className="text-lg text-muted-foreground">Select the investment tier that best suits your financial goals.</p>
        </div>

        <Card className="mb-12 shadow-lg">
            <CardHeader>
            <CardTitle>Annual Percentage Yield (APY) Potential</CardTitle>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} interval={0} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="APY (%)" />
                </BarChart>
            </ResponsiveContainer>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tiers.filter(t => t.name !== 'Observer').map(tier => (
            <Card key={tier.name} className="flex flex-col shadow-lg hover:shadow-primary/20 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary">
                <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline" style={{color: tier.color}}>{tier.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between text-center">
                  <div>
                    <p className="text-3xl font-bold mb-2">{formatCurrency(tier.minDeposit)} - {tier.maxDeposit === Infinity ? 'Unlimited' : formatCurrency(tier.maxDeposit)}</p>
                    <p className="text-muted-foreground mb-4">Principal Investment</p>
                    <p className="text-lg font-semibold text-accent mb-1">{(tier.dailyReturn * 100).toFixed(3)}% Daily Return</p>
                    <p className="text-sm text-muted-foreground mb-6">~{tier.apy ? (tier.apy * 100).toFixed(2) : 0}% APY</p>
                  </div>
                  <Button onClick={() => handleChoosePlan(tier.name, tier.minDeposit)} className="w-full mt-auto">Choose Plan</Button>
                </CardContent>
            </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
