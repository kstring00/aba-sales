import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { publicEnv } from "@/lib/env";
import { ToastProvider } from "@/components/ui/Toast";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
  weight: "variable",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: "The Support Shelf",
    template: "%s · The Support Shelf",
  },
  description:
    "Thoughtfully made tools for the people who care. Printable and editable downloads for ABA families and clinics, plus a free ABC observation logger.",
  applicationName: "The Support Shelf",
  openGraph: {
    type: "website",
    siteName: "The Support Shelf",
    title: "The Support Shelf",
    description: "Thoughtfully made tools for the people who care.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Support Shelf" }],
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-paper focus:px-4 focus:py-2 focus:shadow-soft"
        >
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
