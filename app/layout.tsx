import type { Metadata, Viewport } from "next";
import { Chivo_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

const chivoMono = Chivo_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-chivo-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://demiphan.com"),
  title: {
    default: "Demi Phan — Creative · Video Editor · Motion",
    template: "%s — Demi Phan",
  },
  description:
    "Portfolio of Demi Phan, a creative video editor working across video, motion and VFX for event campaigns and social.",
  openGraph: {
    title: "Demi Phan — Creative · Video Editor · Motion",
    description:
      "I turn messages into rhythm, then use VFX and motion to push how far video can carry them.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#101010",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${interTight.variable} ${chivoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
