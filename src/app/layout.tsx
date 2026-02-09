import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Budget Tracker",
  description: "Make making budgets easy",
  keywords: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Budget Tracking", "React"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://static.vecteezy.com/system/resources/previews/035/690/423/non_2x/budget-icon-with-report-paper-calculator-and-money-svg-vector.jpg",
  },
  openGraph: {
    title: "Personal Budget Trackerd",
    description: "",
    url: "",
    siteName: "",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
