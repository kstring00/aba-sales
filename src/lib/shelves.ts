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
  /** One line under the title. */
  description: string;
  tag: string;
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

/** Which shelf a product belongs on: tag first, handle second, null if neither. */
export function shelfFor(product: Pick<ProductSummary, "handle" | "tags">): ShelfDef | null {
  const tags = new Set((product.tags ?? []).map((t) => t.trim().toLowerCase()));
  const byTag = SHELVES.find((s) => tags.has(s.tag));
  if (byTag) return byTag;
  return SHELVES.find((s) => s.fallbackHandles.includes(product.handle)) ?? null;
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
