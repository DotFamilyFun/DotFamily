import type { Metadata, Viewport } from "next";
import { Figtree, Fredoka } from "next/font/google";
import { BRAND } from "@/config/brand";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { WalletModalProvider } from "@/components/wallet/WalletButton";
import { GazeTracker } from "@/components/GazeTracker";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

const title = `${BRAND.name} | ${BRAND.slogan}`;

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: { default: title, template: `%s | ${BRAND.name}` },
  description: BRAND.tagline + " " + BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title,
    description: BRAND.tagline,
    url: BRAND.url,
    locale: "en_US",
    images: [{ url: "/brand/og.webp", width: 1200, height: 630, type: "image/webp", alt: "The .Dotfamily wordmark on pastel lavender." }],
  },
  twitter: { card: "summary_large_image", title, description: BRAND.tagline, site: BRAND.xHandle, images: ["/brand/og.webp"] },
};

export const viewport: Viewport = { themeColor: "#f2eefb", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${figtree.variable}`}>
      <body>
        <WalletProvider>
          <WalletModalProvider>
            <GazeTracker />
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
