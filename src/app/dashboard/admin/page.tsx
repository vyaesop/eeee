"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { ShieldCheck, Users, DollarSign, Activity, MoreHorizontal, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TIERS } from "@/lib/constants";
import { db } from "@/lib/firebase";

type User = {
    id: string;
    username: string;
    totalDeposit: number;
    tier: string;
    earnings: number;
    joined: string;
};

const chartConfig = {
  users: {
    label: "Users",
  },
} satisfies ChartConfig

export default function AdminPage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsClient(true);
        const storedUser = sessionStorage.getItem("apexvest_user");
        if (storedUser !== 'admin') {
            router.replace("/dashboard");
        } else {
            fetchUsers();
        }
    }, [router]);

    const fetchUsers = async () => {
        try {
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users: ", error);
        } finally {
            setLoading(false);
        }
    };
    
    if (!isClient || loading) {
        return (
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex items-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">{!isClient ? "Verifying credentials..." : "Loading data..."}</p>
            </div>
          </div>
        );
    }

    const tierCounts = users.reduce((acc, user) => {
        const tierName = user.tier || "Observer";
        acc[tierName] = (acc[tierName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = [
      { tier: "Silver", users: tierCounts.Silver || 0, fill: TIERS.SILVER.color },
      { tier: "Gold", users: tierCounts.Gold || 0, fill: TIERS.GOLD.color },
      { tier: "Platinum", users: tierCounts.Platinum || 0, fill: TIERS.PLATINUM.color },
    ]

    const totalUsers = users.length;
    const totalInvested = users.reduce((sum, user) => sum + user.totalDeposit, 0);


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
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Live data from Firestore</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
                        <p className="text-xs text-muted-foreground">Live data from Firestore</p>
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
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                            An overview of all platform members.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead className="text-right">Principal</TableHead>
                                    <TableHead className="text-right">Earnings</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell>
                                                <Badge style={{ backgroundColor: TIERS[user.tier.toUpperCase()]?.color || '#ccc', color: '#000' }} variant="outline">{user.tier}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(user.totalDeposit)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(user.earnings)}</TableCell>
                                            <TableCell>{user.joined}</TableCell>
                                            <TableCell><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No users found in database.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tier Distribution</CardTitle>
                        <CardDescription>User count by membership tier.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartContainer config={chartConfig} className="h-[280px] w-full">
                            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, left: -20, right: 20 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                dataKey="tier"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                />
                                <YAxis hide={true}/>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <Bar dataKey="users" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

        </div>
    )

    