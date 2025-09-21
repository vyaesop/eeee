'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AboutPage = () => {
  const teamMembers = [
    { name: "Alex 'The Strategist' Sterling", role: "Founder & CEO", imageUrl: "/avatars/alex.jpg" },
    { name: "Beatrice 'The Analyst' Vance", role: "Head of Research", imageUrl: "/avatars/beatrice.jpg" },
    { name: "Caleb 'The Futurist' Reed", role: "Lead Technical Analyst", imageUrl: "/avatars/caleb.jpg" },
    { name: "Diana 'The Networker' Hayes", role: "Head of Investor Relations", imageUrl: "/avatars/diana.jpg" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-12 px-4">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-headline text-primary mb-4">About Ethiopian Investment Group</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We are a forward-thinking investment firm dedicated to democratizing wealth creation through innovative, data-driven strategies.
          </p>
        </section>

        <section className="mb-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                To empower individuals from all walks of life to achieve financial independence. We believe that with the right tools, expert guidance, and a supportive community, anyone can build a prosperous future. We are committed to transparency, integrity, and putting our clients' success at the heart of everything we do.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-headline text-center mb-10">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We constantly explore new technologies and market trends to provide our clients with a competitive edge.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We operate with unwavering honesty and transparency, building lasting relationships based on trust.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Empowerment</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We provide the knowledge and tools to help our clients make informed investment decisions with confidence.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        
      </main>
    </div>
  );
};

export default AboutPage;
