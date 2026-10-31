import type { ProductSummary } from "@/lib/shopify/types";

/**
 * The four shelves. Each has a Shopify tag that places a product on it; when
 * a product carries none of the four tags, its handle decides, so the shelf
 * works before the tags are added in Shopify and keeps working after.
 */
export type ShelfId = "organized" | "plan" | "everyday" | "home";
export type Tint = "sky" | "mint" | "butter" | "blush";

export type ShelfDef = {
  id: ShelfId;
  number: 1 | 2 | 3 | 4;
  title: string;
  /** The binder's one-line blurb: who/what it's for. */
  blurb: string;
  /** One line under the title. */
  description: string;
  /** Shopify tag that places a product here (also accepted: `shelf:<slug>`, `shelf-<slug>`, metafield custom.shelf = slug). */
  tag: string;
  /** Public slug used by the `custom.shelf` metafield and `shelf:<slug>` tags. */
  slug: string;
  tint: Tint;
  /** Handles that belong here until Shopify tags exist. */
  fallbackHandles: string[];
  /** Shown when the shelf has no products: an honest "being made" card. */
  empty: { title: string; body: string } | null;
  /** A built-in free tool that lives on this shelf, independent of the catalog. */
  tool: { title: string; body: string; href: string; label: string } | null;
};

export const SHELVES: ShelfDef[] = [
  {
    id: "organized",
    number: 1,
    title: "Get Organized",
    blurb: "Track, plan, and keep everything in one place.",
    slug: "get-organized",
    description: "Simple tools to help you keep track of what matters, so you can breathe a little easier.",
    tag: "shelf-organized",
    tint: "sky",
    fallbackHandles: ["care-binder", "home-abc-printable"],
    empty: null,
    tool: null,
  },
  {
    id: "plan",
    number: 2,
    title: "Make a Plan",
    blurb: "Know what to expect and take the next step.",
    slug: "make-a-plan",
    description: "Understand what's in front of you and keep track of the next step while you wait.",
    tag: "shelf-plan",
    tint: "mint",
    fallbackHandles: ["read-your-childs-treatment-plan", "waitlist-playbook"],
    empty: null,
    tool: null,
  },
  {
    id: "everyday",
    number: 3,
    title: "Everyday Life",
    blurb: "Simple strategies for common challenges.",
    slug: "everyday-life",
    description: "Mornings, bedtimes, transitions, and the moments in between.",
    tag: "shelf-everyday",
    tint: "butter",
    fallbackHandles: [],
    empty: {
      title: "Routines and visual tools are being made.",
      body: "Leave your email and you'll be first.",
    },
    tool: null,
  },
  {
    id: "home",
    number: 4,
    title: "Support at Home",
    blurb: "Tools for you, your child, and your whole family.",
    slug: "support-at-home",
    description: "Notice what happens, write it down, and bring something useful to your next meeting.",
    tag: "shelf-home",
    tint: "blush",
    fallbackHandles: [],
    empty: null,
    tool: {
      title: "The free ABC logger",
      body: "Three taps to record what happened, what came right before, and what came right after. Exports a clean PDF for your BCBA.",
      href: "/abc",
      label: "Free · works on your phone · nothing leaves your device",
    },
  },
];

export function shelfById(id: string): ShelfDef | null {
  return SHELVES.find((s) => s.id === id) ?? null;
}

const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");

/**
 * Which shelf a product belongs on. In order: `custom.shelf` metafield
 * (slug), a tag (`shelf-organized`, `shelf:get-organized`, `shelf-get-organized`),
 * then the handle fallback, else null.
 */
export function shelfFor(product: Pick<ProductSummary, "handle" | "tags"> & { shelf?: string | null }): ShelfDef | null {
  if (product.shelf) {
    const v = norm(product.shelf);
    const byMeta = SHELVES.find((s) => v === s.slug || v === s.id || v === s.tag);
    if (byMeta) return byMeta;
  }
  const tags = new Set((product.tags ?? []).map(norm));
  const byTag = SHELVES.find((s) => tags.has(s.tag) || tags.has(`shelf:${s.slug}`) || tags.has(`shelf-${s.slug}`));
  if (byTag) return byTag;
  return SHELVES.find((s) => s.fallbackHandles.includes(product.handle)) ?? null;
}

/** A published product tagged `coming-soon` is shown but not yet openable. */
export function isComingSoon(product: Pick<ProductSummary, "tags" | "availableForSale">): boolean {
  return (product.tags ?? []).some((t) => norm(t) === "coming-soon") || !product.availableForSale;
}

export type ShelfView = ShelfDef & { products: ProductSummary[] };

/**
 * Places every product on its shelf, in shelf order. Products that match no
 * shelf are returned separately so they are never silently dropped.
 */
export function assignShelves(catalog: ProductSummary[]): { shelves: ShelfView[]; unshelved: ProductSummary[] } {
  const buckets = new Map<ShelfId, ProductSummary[]>(SHELVES.map((s) => [s.id, []]));
  const unshelved: ProductSummary[] = [];
  for (const p of catalog) {
    const s = shelfFor(p);
    if (s) buckets.get(s.id)!.push(p);
    else unshelved.push(p);
  }
  // Within a shelf, keep the fallback order (paid binder first, then the free sheet) when tags don't say otherwise.
  const shelves = SHELVES.map((s) => {
    const items = buckets.get(s.id)!;
    const rank = (p: ProductSummary) => {
      const i = s.fallbackHandles.indexOf(p.handle);
      return i === -1 ? 99 : i;
    };
    return { ...s, products: [...items].sort((a, b) => rank(a) - rank(b)) };
  });
  return { shelves, unshelved };
}

export const TINT_BG: Record<Tint, string> = {
  sky: "bg-sky",
  mint: "bg-mint",
  butter: "bg-butter",
  blush: "bg-blush",
};

export const TINT_TEXT: Record<Tint, string> = {
  sky: "text-sky-deep",
  mint: "text-mint-deep",
  butter: "text-butter-deep",
  blush: "text-blush-deep",
};
