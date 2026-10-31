import type { NextConfig } from "next";

// Architectural decision: Cache Components / PPR stays off. Every authenticated
// page is rendered dynamically per request, which keeps auth and RLS behavior
// predictable for a solo maintainer. Public pages opt into ISR explicitly.
const storeDomain = (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "vgb9f2-eg.myshopify.com";

/**
 * Content-Security-Policy (audit F-14). script-src allows 'unsafe-inline'
 * because Next.js emits inline bootstrap scripts and the JSON-LD block; a
 * nonce would force every page to render per request and lose ISR. No
 * third-party scripts exist, so the remaining surface is first-party only.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' https://cdn.shopify.com data: blob:`,
  `connect-src 'self' https://${storeDomain}`,
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
  // PDF export reads brand fonts from disk at runtime; make sure Vercel ships them.
  outputFileTracingIncludes: {
    "/api/abc/email-export": ["./public/fonts/*.ttf"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    // The audit expects product pages under /shelf/<handle>; the built route is /products/<handle>.
    return [{ source: "/shelf/:handle", destination: "/products/:handle", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
