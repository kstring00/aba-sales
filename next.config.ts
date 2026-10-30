import type { NextConfig } from "next";

// Architectural decision: Cache Components / PPR stays off. Every authenticated
// page is rendered dynamically per request, which keeps auth and RLS behavior
// predictable for a solo maintainer. Public pages opt into ISR explicitly.
const nextConfig: NextConfig = {
  cacheComponents: false,
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
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
