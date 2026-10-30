import type { NextConfig } from "next";

// Architectural decision: Cache Components / PPR stays off. Every authenticated
// page is rendered dynamically per request, which keeps auth and RLS behavior
// predictable for a solo maintainer. Public pages opt into ISR explicitly.
const nextConfig: NextConfig = {
  cacheComponents: false,
  // PDF export reads brand fonts from disk at runtime; make sure Vercel ships them.
  outputFileTracingIncludes: {
    "/app/export/pdf": ["./src/lib/export/fonts/*.ttf"],
    "/api/sample-export": ["./src/lib/export/fonts/*.ttf"],
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
      {
        // Private product surfaces are never indexed.
        source: "/(app|guide)(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
