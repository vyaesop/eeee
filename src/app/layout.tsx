
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Ethiopian Investment Group",
  description: "Next-gen investment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <Header />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
