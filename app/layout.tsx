import type { Metadata } from "next";
import { Josefin_Sans, Inter } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/providers/LenisProvider";
import Stage from "@/components/Stage/Stage";
import OceanBackdrop from "@/components/site/OceanBackdrop";
import StaticWaterBackdrop from "@/components/site/StaticWaterBackdrop";
import UnderwaterCH01 from "@/components/site/UnderwaterCH01";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "600"],
  variable: "--font-display",
  display: "swap",
});

// Neutral grotesk — used ONLY for small labels / data / interface text, where
// Josefin's thin geometric glyphs lose legibility. Hero wordmarks stay on the
// display face. Loaded via next/font (no package install).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anchor Point",
  description: "The intelligence layer for global shipping.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${josefin.variable} ${inter.variable}`}
      style={{ fontFamily: "var(--font-display), sans-serif" }}
    >
      <body>
        <LenisProvider>
          {/* CH00 ocean-atmosphere (Step 0) — static still behind the canvas; homepage + CH00 only */}
          <OceanBackdrop />
          {/* Static route water test — route-gated; homepage CH00 water remains owned by OceanBackdrop. */}
          <StaticWaterBackdrop />
          {/* WebGL canvas — fixed behind everything, persists across route changes */}
          <Stage />
          {/* CH01 underwater — descent plunge + submerged volume; homepage only.
              Sits above Stage (z:0, source-order on top) and below DOM (z:1). */}
          <UnderwaterCH01 />
          {/* Site shell — fixed header floats above; footer closes every route. */}
          <Header />
          {/* DOM content — z-index above canvas */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {children}
            <Footer />
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
