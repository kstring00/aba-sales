import fs from "node:fs";
import path from "node:path";
import { parseFrontMatter, splitSections, type FrontMatter } from "./frontmatter";

/**
 * Long-form content: Markdown files under content/. Read on the server only;
 * the files ship with every route via outputFileTracingIncludes.
 *
 * Visibility rule (one place): published pages show everywhere; pending and
 * draft pages show on local and preview builds with a banner and 404 on the
 * production deployment (VERCEL_ENV=production).
 */
export type ContentPage = FrontMatter & {
  slug: string;
  file: string;
  sections: ReturnType<typeof splitSections>;
};

const ROOT = path.join(process.cwd(), "content");
const cache = new Map<string, ContentPage | null>();

import { isProductionDeploy } from "./deploy";
export { isProductionDeploy };

export function isPublished(page: Pick<ContentPage, "status"> | null | undefined): boolean {
  return page?.status === "published";
}

/** Shown on this deployment: published, or any status outside production. */
export function isVisible(page: Pick<ContentPage, "status"> | null | undefined): boolean {
  return Boolean(page) && (isPublished(page) || !isProductionDeploy());
}

/** slug is relative to content/, without .md (e.g. "pages/right-now", "learn/tantrum-or-meltdown"). */
export function readPage(slug: string): ContentPage | null {
  if (cache.has(slug)) return cache.get(slug)!;
  const file = path.join(ROOT, `${slug}.md`);
  let page: ContentPage | null = null;
  if (fs.existsSync(file)) {
    const { data, body } = parseFrontMatter(path.relative(process.cwd(), file), fs.readFileSync(file, "utf8"));
    page = { ...data, slug, file: path.relative(process.cwd(), file), sections: splitSections(body) };
  }
  cache.set(slug, page);
  return page;
}

export function listPages(dir: string): ContentPage[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => readPage(`${dir}/${f.replace(/\.md$/, "")}`))
    .filter((p): p is ContentPage => Boolean(p));
}

/** The hub's four sections, in door order, with their routes and content files. */
export const HUB_SECTIONS = [
  { key: "right-now", href: "/right-now", page: "pages/right-now" },
  { key: "learn", href: "/learn", page: "pages/learn" },
  { key: "find-care", href: "/find-care", page: "pages/find-care" },
  { key: "for-you", href: "/for-you", page: "pages/for-you" },
] as const;

export type HubKey = (typeof HUB_SECTIONS)[number]["key"];

export function hubSections() {
  return HUB_SECTIONS.map((s) => {
    const page = readPage(s.page);
    return { ...s, title: page?.title ?? s.key, status: page?.status ?? "pending", visible: isVisible(page), published: isPublished(page) };
  });
}
