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
  title: "TruthPulse - What Do People Really Think of You?",
  description: "AI-powered brutal truth about how strangers perceive you. Paste your bio, get honest first impressions in 8 seconds. Anonymous & free.",
  keywords: [
    "vibe check",
    "first impression",
    "brutal honesty",
    "social perception",
    "what people think",
    "AI analysis",
    "personality test",
    "social media audit",
    "profile analyzer",
    "honest feedback"
  ],
  authors: [{ name: "TruthPulse" }],
  openGraph: {
    title: "TruthPulse - What Do People Really Think of You?",
    description: "AI-powered brutal truth about how strangers perceive you. Get honest first impressions in 8 seconds.",
    type: "website",
    locale: "en_US",
    siteName: "TruthPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "TruthPulse - What Do People Really Think of You?",
    description: "AI-powered brutal truth about how strangers perceive you. Get honest first impressions in 8 seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true} suppressContentEditableWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}