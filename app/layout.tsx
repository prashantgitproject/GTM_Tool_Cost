import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const claritySans = Inter({
  variable: "--font-clarity-sans",
  subsets: ["latin"],
});

const claritySerif = Lora({
  variable: "--font-clarity-serif",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Outreach Tool Cost Calculator | ClarityHQ",
  description:
    "Estimate monthly GTM stack cost by account volume, channel mix, and touch points.",
  icons: {
    icon: "http://www.clarityhq.ai/assets/img/favicon.svg",
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
      className={`${claritySans.variable} ${claritySerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
