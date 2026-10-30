import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { getProductHandles } from "@/lib/shopify/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl;
  const now = new Date();
  const pages: MetadataRoute.Sitemap = ["/", "/shelf", "/abc", "/about", "/privacy", "/crisis"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "/" || p === "/shelf" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : p === "/shelf" ? 0.9 : 0.5,
  }));
  const handles = await getProductHandles();
  for (const h of handles) pages.push({ url: `${base}/products/${h}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
  return pages;
}
