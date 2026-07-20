import type { Metadata } from "next";
import { Share_Tech_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
});

const orbitron = Orbitron({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "VentureForge - AI Business Planning Platform",
  description: "The gold standard platform for entrepreneurs, incubators, and institutions. Blending creativity, compliance, and integration in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shareTechMono.variable} ${orbitron.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-[var(--background,#000000)] antialiased">{children}</body>
    </html>
  );
}
