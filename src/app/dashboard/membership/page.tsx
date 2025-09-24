'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tiers } from "@/lib/constants";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const MembershipPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const chartData = tiers.filter(t => t.name !== 'Observer').map(tier => ({
    name: tier.name,
    'Potential Growth (%)': tier.apy * 100,
  }));

  const handleChoosePlan = async (tierName: string, minDeposit: number) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to choose a plan." });
      return;
    }

    try {
      const userRef = doc(db, "users", user.displayName!);
      await updateDoc(userRef, {
        membershipTier: tierName,
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
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Choose Your Investment Package</h1>
      <p className="text-center text-lg text-muted-foreground mb-12">Select the asset package that aligns with your financial strategy.</p>

      <Card className="mb-12 shadow-lg">
        <CardHeader>
          <CardTitle>Investment Package Potential (APY)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="Potential Growth (%)" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
        {tiers.filter(t => t.name !== 'Observer').map(tier => (
          <Card key={tier.name} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-3xl font-bold mb-4">Br {tier.minDeposit.toLocaleString()}</p>
              <p className="text-muted-foreground mb-2">Daily Return: {(tier.dailyReturn * 100).toFixed(2)}%</p>
              <p className="text-muted-foreground mb-4">Annual Potential (APY): {(tier.apy * 100).toFixed(2)}%</p>
            </CardContent>
            <div className="p-6 pt-0">
              <Button onClick={() => handleChoosePlan(tier.name, tier.minDeposit)} className="w-full">Choose Plan</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MembershipPage;
