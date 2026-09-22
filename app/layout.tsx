import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vaniedge.vercel.app"),
  title: "VaniEdge Voice Platform — Sub-Second Edge Voice AI & Telephony",
  description:
    "Autonomous 24/7 multi-lingual AI phone answering and voice dispatch for clinics, restaurants, and local businesses.",
  keywords: [
    "voice AI",
    "telephony",
    "AI receptionist",
    "local business voice agent",
    "sub-second latency",
    "SutraDB",
    "ElevenLabs",
  ],
  authors: [{ name: "Samarth Nimangre", url: "https://sam-codes.vercel.app" }],
  icons: {
    icon: "/vaniedge-logo.png",
    shortcut: "/vaniedge-logo.png",
    apple: "/vaniedge-logo.png",
  },
  openGraph: {
    title: "VaniEdge Voice Platform — Enterprise Voice AI & Telephony",
    description:
      "Instant multi-lingual customer answering with sub-second latency, zero dropped calls, and direct carrier phone support.",
    url: "https://vaniedge.vercel.app",
    siteName: "VaniEdge Voice Platform",
    images: [
      {
        url: "/vaniedge-logo.png",
        width: 1024,
        height: 1024,
        alt: "VaniEdge Voice Platform Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VaniEdge AI — Edge-Native Voice AI Telephony",
    description: "Multi-lingual 24/7 phone answering agent for local businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#070b12] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
