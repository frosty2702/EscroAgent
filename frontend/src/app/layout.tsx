import type { Metadata } from "next";
import { Geist, Geist_Mono, Tilt_Warp, Doppio_One } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tiltWarp = Tilt_Warp({
  variable: "--font-tilt-warp",
  subsets: ["latin"],
});

const doppioOne = Doppio_One({
  variable: "--font-doppio-one",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "TrustFlow - Decentralized Escrow & Conditional Payments",
  description: "Secure Every Deal. Automate Every Outcome. Decentralized escrow with autonomous agent behavior.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tiltWarp.variable} ${doppioOne.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
