import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, ShieldCheck } from "lucide-react";

const benefits = [
  "Access to exclusive, high-yield investment tiers.",
  "State-of-the-art platform with real-time earnings tracking.",
  "Opportunities for automatic compounding to maximize returns.",
  "Lucrative referral program to boost your portfolio.",
  "Dedicated support from financial experts.",
  "Invitations to exclusive networking events and webinars.",
];

const tiers = [
    { name: "Silver", range: "$1k - $10k", rate: "4% Monthly Yield" },
    { name: "Gold", range: "$10k - $50k", rate: "6.5% Monthly Yield" },
    { name: "Platinum", range: "$50k+", rate: "9% Monthly Yield" },
];

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                <ShieldCheck className="w-8 h-8" />
                <span className="text-2xl font-headline font-bold">ApexVest</span>
            </Link>
            <Button asChild variant="ghost">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                </Link>
            </Button>
        </div>
      </header>
      <main className="container mx-auto py-12 px-4">
        <section className="text-center">
            <h1 className="text-5xl font-headline font-bold text-primary">Unlock Your Financial Potential</h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
                ApexVest is an invitation-only financial club dedicated to providing our members with premier investment opportunities and unparalleled growth.
            </p>
        </section>

        <section className="mt-16">
            <h2 className="text-3xl font-headline font-bold text-center mb-8">Membership Tiers</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {tiers.map((tier) => (
                    <Card key={tier.name} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline text-primary">{tier.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{tier.rate}</p>
                            <p className="text-muted-foreground mt-2">Deposit Range: {tier.range}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

        <section className="mt-16">
            <h2 className="text-3xl font-headline font-bold text-center mb-8">Exclusive Benefits</h2>
             <Card className="max-w-2xl mx-auto shadow-lg">
                <CardContent className="p-6">
                    <ul className="space-y-4">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                                <CheckCircle className="h-6 w-6 text-accent mr-3 mt-0.5 flex-shrink-0" />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </section>

        <section className="mt-16 text-center bg-card p-8 rounded-lg shadow-xl">
             <h2 className="text-3xl font-headline font-bold">How to Join</h2>
             <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Membership to ApexVest is currently by invitation only. Invitations are extended by existing members. If you believe you are a good fit for our community, you may be able to acquire an invitation through financial networking forums.
             </p>
             <Button asChild className="mt-6">
                <Link href="/">Return to Login</Link>
             </Button>
        </section>
      </main>
    </div>
  );
}
