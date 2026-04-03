import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketHub — Premium Marketing Resources & Services",
  description: "Access battle-tested playbooks, templates, toolkits, and expert services crafted by marketing leaders. Save 100+ hours and drive measurable growth.",
  keywords: ["marketing", "playbook", "templates", "email marketing", "growth", "content strategy", "marketing tools"],
  openGraph: {
    title: "MarketHub — Premium Marketing Resources",
    description: "Battle-tested playbooks, templates, and tools for marketing professionals.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
