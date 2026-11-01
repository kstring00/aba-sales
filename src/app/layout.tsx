import type { Metadata, Viewport } from "next";
import { Caveat, Figtree, Fraunces } from "next/font/google";
import "./globals.css";
import { publicEnv } from "@/lib/env";
import { ToastProvider } from "@/components/ui/Toast";
import { OfflineRegister } from "@/components/site/OfflineRegister";
import { WelcomeOffer } from "@/components/site/WelcomeOffer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  style: ["normal", "italic"],
  weight: "variable",
  display: "swap",
  // The tuned fallback lives in globals.css: Next's automatic one is sized for
  // text optical sizes, and our headlines run at opsz 144, 7% narrower.
  adjustFontFallback: false,
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false, // tuned fallback in globals.css
});

// One handwritten line per page, at most. Swap display so it never blocks text.
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["500"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: "The Support Shelf",
    template: "%s · The Support Shelf",
  },
  description:
    "Practical, printable tools for parents and caregivers of kids in ABA therapy, plus a free ABC observation logger that stays on your phone.",
  applicationName: "The Support Shelf",
  // "./" resolves to each page's own path against metadataBase (audit F-24).
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: "The Support Shelf",
    title: "The Support Shelf",
    description: "Practical tools. Kinder days. Brighter tomorrows.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Support Shelf" }],
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F8F5EE",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${publicEnv.siteUrl}/#org`,
      name: "The Support Shelf",
      url: publicEnv.siteUrl,
      logo: `${publicEnv.siteUrl}/icons/icon-512.png`,
      founder: { "@type": "Person", name: "Kyle Stringham", jobTitle: "Registered Behavior Technician" },
      email: publicEnv.contactEmail,
    },
    {
      "@type": "WebSite",
      "@id": `${publicEnv.siteUrl}/#site`,
      url: publicEnv.siteUrl,
      name: "The Support Shelf",
      publisher: { "@id": `${publicEnv.siteUrl}/#org` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} ${caveat.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-paper focus:px-4 focus:py-2 focus:shadow-soft"
        >
          Skip to content
        </a>
        <ToastProvider>
          {children}
          <WelcomeOffer />
        </ToastProvider>
        <OfflineRegister />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
