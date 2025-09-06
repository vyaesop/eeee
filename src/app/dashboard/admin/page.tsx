"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Users, DollarSign, Activity } from "lucide-react";

export default function AdminPage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const storedUser = sessionStorage.getItem("apexvest_user");
        if (storedUser !== 'admin') {
            router.replace("/dashboard");
        }
    }, [router]);

    if (!isClient) {
        return (
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex items-center space-x-2">
                <ShieldCheck className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">Verifying credentials...</p>
            </div>
          </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Administrator Dashboard</h1>
                    <p className="text-muted-foreground">Platform overview and management tools.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,257</div>
                        <p className="text-xs text-muted-foreground">+20 since last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$4,832,192.00</div>
                        <p className="text-xs text-muted-foreground">+12.5% since last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform APY</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">118.7%</div>
                        <p className="text-xs text-muted-foreground">Average across all tiers</p>
                    </CardContent>
                </Card>
                 <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                         <ShieldCheck className="h-4 w-4 text-primary-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">All Systems Normal</div>
                         <p className="text-xs text-primary-foreground/80">Last check: 1 minute ago</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Management Tools</CardTitle>
                    <CardDescription>
                        This is where admin-specific components for managing users, viewing detailed analytics, and configuring platform settings would go.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground">Future admin components will be placed here.</p>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
