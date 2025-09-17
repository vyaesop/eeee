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
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface DashboardClientProps {
  userData: UserData;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ userData: initialUserData }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData>(initialUserData);

  const { totalDeposit, autoCompounding, earningsBalance, username } = userData;
  
  const [apy, setApy] = useState(0);

  const currentTierName = getTierFromDeposit(totalDeposit);
  const currentTier = tiers.find(tier => tier.name === currentTierName);

  useEffect(() => {
    if (!username) return;
    const unsub = onSnapshot(doc(db, "users", username), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as UserData);
      }
    });
    return () => unsub();
  }, [username]);

  useEffect(() => {
    if (!currentTier || currentTier.name === 'Observer') {
      setApy(0);
      return;
    }

    const dailyRate = currentTier.dailyReturn ?? 0;
    const compoundedApy = Math.pow(1 + dailyRate, 365) - 1;
    setApy(compoundedApy * 100);

  }, [currentTier]);

  const handleAutoCompoundingToggle = async (checked: boolean) => {
    if (!username) return;
    const userRef = doc(db, "users", username);
    try {
      await updateDoc(userRef, { autoCompounding: checked });
      toast({
        title: "Settings Updated",
        description: `Auto-compounding has been ${checked ? 'enabled' : 'disabled'}.`
      });
    } catch (error) {
      console.error("Failed to update auto-compounding", error);
      toast({
        variant: 'destructive',
        title: "Update Failed",
        description: "Could not update your settings. Please try again."
      });
    }
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, {username}</h1>
          <p className="text-muted-foreground">Here is your financial overview for today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Principal</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDeposit)}</div>
              <p className="text-xs text-muted-foreground">Your initial investment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earningsBalance)}</div>
              <p className="text-xs text-muted-foreground">Profits generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Gem className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDeposit + earningsBalance)}</div>
              <p className="text-xs text-muted-foreground">Principal + Earnings</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>
              Your estimated annual yield based on your current tier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Annual Percentage Yield (APY)</p>
              <p className="font-bold text-primary">{apy.toFixed(2)}%</p>
            </div>
            <Progress value={apy} className="w-full" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Based on your {currentTierName} tier at{" "}
              {currentTier?.dailyReturn
                ? (currentTier.dailyReturn * 100).toFixed(2)
                : 0}% daily return.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your investment preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-semibold">Auto-Compounding</p>
                <p className="text-sm text-muted-foreground">
                  Reinvest earnings for exponential growth.
                </p>
              </div>
              <Switch
                checked={autoCompounding}
                onCheckedChange={handleAutoCompoundingToggle}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-semibold">Membership Tier</p>
                <p className="text-sm text-muted-foreground">
                  Your current investment level.
                </p>
              </div>
              <div className="font-bold text-primary">{currentTierName}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
