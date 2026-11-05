import type { Metadata, Viewport } from "next";
import { Chivo_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";
import { Contact } from "@/components/contact";
import { Cursor } from "@/components/cursor";
import { Nav } from "@/components/nav";
import { SmoothScroll } from "@/components/smooth-scroll";
import "lenis/dist/lenis.css";
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

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

// Chạy trước khi vẽ để chưa kịp lộ hero tĩnh. Hết 9 giây thì gỡ lớp, phòng khi bundle JS hỏng.
const introScript = `try{var h=document.documentElement;if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){h.classList.add("hero-pending");if(!location.hash&&!sessionStorage.getItem("demi-intro-seen"))h.classList.add("intro-pending");setTimeout(function(){h.classList.remove("hero-pending","intro-pending")},9000)}}catch(e){}`;

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
    <html lang="en" className={`${interTight.variable} ${chivoMono.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <SmoothScroll />
        <Cursor />
        <Nav />
        <main id="main">{children}</main>
        <Contact />
      </body>
    </html>
  );
}
