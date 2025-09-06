"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { ShieldCheck, Users, DollarSign, Activity, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TIERS } from "@/lib/constants";

// Mock data for demonstration
const mockUsers = [
    { id: 'user-001', username: 'janesmith', totalDeposit: 25000, tier: 'Gold', earnings: 4500.12, joined: '2023-05-12' },
    { id: 'user-002', username: 'alex.p', totalDeposit: 5000, tier: 'Silver', earnings: 600.50, joined: '2023-08-20' },
    { id: 'user-003', username: 'sara.k', totalDeposit: 12000, tier: 'Gold', earnings: 1850.75, joined: '2023-09-01' },
    { id: 'user-004', username: 'mike.r', totalDeposit: 2500, tier: 'Silver', earnings: 250.00, joined: '2024-01-15' },
    { id: 'user-005', username: 'cryptoKing', totalDeposit: 75000, tier: 'Platinum', earnings: 15320.40, joined: '2022-11-30' },
    { id: 'user-006', username: 'investorG', totalDeposit: 1500, tier: 'Silver', earnings: 95.23, joined: '2024-02-10' },
];

const tierCounts = mockUsers.reduce((acc, user) => {
    acc[user.tier] = (acc[user.tier] || 0) + 1;
    return acc;
}, {} as Record<string, number>);

const chartData = [
  { tier: "Silver", users: tierCounts.Silver || 0, fill: TIERS.SILVER.color },
  { tier: "Gold", users: tierCounts.Gold || 0, fill: TIERS.GOLD.color },
  { tier: "Platinum", users: tierCounts.Platinum || 0, fill: TIERS.PLATINUM.color },
]

const chartConfig = {
  users: {
    label: "Users",
  },
} satisfies ChartConfig

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

    const totalUsers = mockUsers.length;
    const totalInvested = mockUsers.reduce((sum, user) => sum + user.totalDeposit, 0);


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
                        <p className="text-xs text-muted-foreground">+2 since last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
                        <p className="text-xs text-muted-foreground">+15.2% since last month</p>
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
                                {mockUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>
                                            <Badge style={{ backgroundColor: TIERS[user.tier.toUpperCase()]?.color, color: '#000' }} variant="outline">{user.tier}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(user.totalDeposit)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(user.earnings)}</TableCell>
                                        <TableCell>{user.joined}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                                    </TableRow>
                                ))}
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

    