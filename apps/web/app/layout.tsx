import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/auth-provider";
import { QueryProvider } from "../providers/query-provider";
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#08090b",
};

export const metadata: Metadata = {
  title: "MotoTribe — Built by Riders, for Riders",
  description:
    "India's largest motorcycle marketplace and community. Buy, sell, review accessories and parts with verified fitment for your bike.",
  keywords: [
    "motorcycle accessories",
    "bike parts India",
    "motorcycle community",
    "rider marketplace",
    "bike fitment",
  ],
  openGraph: {
    title: "MotoTribe — Built by Riders, for Riders",
    description:
      "India's largest motorcycle marketplace and community.",
    type: "website",
    locale: "en_IN",
    siteName: "MotoTribe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen overflow-x-hidden selection:bg-orange-500 selection:text-foreground" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
