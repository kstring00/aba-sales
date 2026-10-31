import type { ProductSummary } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalize";
import { metaFor } from "@/lib/resources";
import { assignShelves, isComingSoon, type ShelfDef } from "@/lib/shelves";
import { SHELF_CONTENT, type DrawerIcon, type ShelfContent } from "@/content/shelf-drawer";

/**
 * The drawer model: what each shelf shows when pulled forward. Live
 * products first (price from Shopify, never invented), then the built-in
 * tool, then coming-soon fillers up to four cards. Pure; built on the server.
 */
export type DrawerCard = {
  key: string;
  title: string;
  blurb: string;
  /** "Free", "$14.99", or "Coming soon". Only live prices come from Shopify. */
  status: "free" | "price" | "soon";
  priceLabel: string | null;
  href: string;
  cta: string;
  icon: DrawerIcon;
  image: { url: string; alt: string; width: number | null; height: number | null } | null;
};

export type DrawerShelf = Omit<ShelfDef, "tool" | "empty"> & ShelfContent & { cards: DrawerCard[]; liveCount: number };

const OBJECT_ICON: Record<string, DrawerIcon> = { binder: "doc", checklist: "clip", calendar: "cal", folder: "folder", booklet: "files" };

function productCard(p: ProductSummary, shelf: ShelfDef): DrawerCard {
  const meta = metaFor(p.handle);
  const soon = isComingSoon(p);
  const price = formatMoney(p.price);
  return {
    key: p.id,
    title: p.title,
    blurb: meta?.task ?? p.benefit,
    status: soon ? "soon" : price === "Free" ? "free" : "price",
    priceLabel: soon ? null : price,
    href: soon ? `/shelf#${shelf.id}` : `/products/${p.handle}`,
    cta: soon ? "Coming soon" : price === "Free" ? "Get it free" : `Buy · ${price}`,
    icon: OBJECT_ICON[meta?.object ?? "folder"] ?? "folder",
    image: p.featuredImage ? { url: p.featuredImage.url, alt: p.featuredImage.altText ?? p.title, width: p.featuredImage.width, height: p.featuredImage.height } : null,
  };
}

/** At most this many coming-soon fillers per shelf (audit F-12). */
export const COMING_SOON_CAP = 3;

export function buildDrawer(catalog: ProductSummary[]): DrawerShelf[] {
  const { shelves } = assignShelves(catalog);
  return shelves.map((s) => {
    const content = SHELF_CONTENT[s.id];
    const live = s.products.filter((p) => !isComingSoon(p)).map((p) => productCard(p, s));
    const taggedSoon = s.products.filter((p) => isComingSoon(p)).map((p) => productCard(p, s));
    const tool: DrawerCard[] = content.tool
      ? [{ key: `tool-${s.id}`, title: content.tool.title, blurb: content.tool.blurb, status: "free", priceLabel: "Free", href: content.tool.href, cta: content.tool.cta, icon: content.tool.icon, image: null }]
      : [];
    // Any Shopify product (live or tagged coming-soon) replaces a same-titled filler.
    const known = new Set([...live, ...taggedSoon].map((c) => c.title.toLowerCase().replace(/^the\s+/, "")));
    const fillers: DrawerCard[] = content.comingSoon
      .filter((c) => !known.has(c.title.toLowerCase()))
      .map((c): DrawerCard => ({ key: `soon-${s.id}-${c.title}`, title: c.title, blurb: c.blurb, status: "soon", priceLabel: null, href: `/shelf#${s.id}`, cta: "Coming soon", icon: c.icon, image: null }))
      .slice(0, Math.max(0, COMING_SOON_CAP - taggedSoon.length));
    const cards = [...live, ...tool, ...taggedSoon, ...fillers];
    const { tool: _tool, empty: _empty, ...def } = s;
    void _tool; void _empty; // ShelfDef.tool/empty are superseded by the content file
    return { ...def, ...content, cards, liveCount: live.length + tool.length };
  });
}
