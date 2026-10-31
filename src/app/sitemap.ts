import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { getProductHandles } from "@/lib/shopify/catalog";
import { hubSections, isPublished, listPages, readPage } from "@/lib/content/pages";
import { glossary } from "@/lib/content/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl;
  const now = new Date();
  const pages: MetadataRoute.Sitemap = ["/", "/shelf", "/abc", "/about", "/privacy", "/crisis"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "/" || p === "/shelf" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : p === "/shelf" ? 0.9 : 0.5,
  }));
  // The two calming tools are generic and complete; they are listed once For you is published.
  if (hubSections().some((x) => x.key === "for-you" && x.published)) for (const t of ["breathe", "ground"]) pages.push({ url: `${base}/for-you/${t}`, lastModified: now, changeFrequency: "yearly", priority: 0.5 });
  // Hub sections only once published; pending pages never reach the sitemap.
  for (const s of hubSections().filter((x) => x.published)) pages.push({ url: `${base}${s.href}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
  if (hubSections().some((x) => x.key === "learn" && x.published)) {
    for (const l of listPages("learn").filter(isPublished)) pages.push({ url: `${base}/${l.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
    if (glossary.some((t) => t.status === "published")) {
      if (isPublished(readPage("pages/glossary"))) pages.push({ url: `${base}/learn/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
      pages.push({ url: `${base}/learn/decode`, lastModified: now, changeFrequency: "yearly", priority: 0.5 });
    }
  }
  if (isPublished(readPage("pages/for-you-research"))) pages.push({ url: `${base}/for-you/research`, lastModified: now, changeFrequency: "yearly", priority: 0.5 });
  const handles = await getProductHandles();
  for (const h of handles) pages.push({ url: `${base}/products/${h}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
  return pages;
}
