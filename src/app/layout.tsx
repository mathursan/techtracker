import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechTracker — Technical Analysis Dashboard",
  description:
    "Technical analysis dashboard for S&P 500 stocks, sector ETFs, industry ETFs, and country ETFs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
