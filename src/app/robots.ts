import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/guide", "/auth", "/sign-in", "/setup"] }],
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
