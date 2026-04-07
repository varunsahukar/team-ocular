import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import BottomNav from "@/components/layout/bottom-nav";
import SiteHeader from "@/components/layout/site-header";
import { SocketProvider } from "@/components/providers/socket-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Helix",
  description:
    "A live finance dashboard for balance, spending runway, and safer payment decisions.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} bg-background font-sans text-foreground antialiased`}
      >
        <SocketProvider>
          <div className="relative min-h-screen">
            <SiteHeader />
            {children}
            <BottomNav />
          </div>
        </SocketProvider>
      </body>
    </html>
  );
}
