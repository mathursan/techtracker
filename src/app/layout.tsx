import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { Disclaimer } from "@/components/shell/disclaimer";
import { ThemeBootstrapScript } from "@/components/shell/theme-provider";
import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TechTracker — Technical Analysis Dashboard",
  description:
    "Technical analysis dashboard for S&P 500 stocks, sector ETFs, industry ETFs, and country ETFs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Must render FIRST so the `.dark` class lands before any painted
            content — prevents light-to-dark flash on first paint. */}
        <ThemeBootstrapScript />
        <div className="flex flex-1 flex-col">{children}</div>
        <Disclaimer />
      </body>
    </html>
  );
}
