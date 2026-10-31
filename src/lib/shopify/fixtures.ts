import type { Collection, ProductDetail } from "./types";

/**
 * Local design fixtures mirroring the real catalog by handle and price so
 * the shelf and product pages can be reviewed without a Storefront token.
 * Enabled only by SHOPIFY_FIXTURES=1 and only when no real token is set;
 * never on Vercel. Contents are deliberately thin: no invented pages.
 */
const base = (handle: string, title: string, price: string, tags: string[]): ProductDetail & { collectionHandles: string[] } => ({
  id: `fixture-${handle}`,
  handle,
  title,
  benefit: "",
  featuredImage: null,
  price: { amount: price, currencyCode: "USD" },
  compareAtPrice: null,
  tags,
  availableForSale: true,
  shelf: null,
  descriptionHtml: "<p>Description from Shopify will appear here.</p>",
  description: "Description from Shopify will appear here.",
  images: [],
  variantId: `gid://shopify/ProductVariant/fixture-${handle}`,
  format: null,
  included: [],
  seoTitle: null,
  seoDescription: null,
  collectionHandles: ["the-family-shelf"],
});

export const FIXTURE_PRODUCTS = [
  base("home-abc-printable", "Home ABC Printable", "0.0", ["family-shelf"]),
  base("waitlist-playbook", "The Waitlist Playbook", "0.0", ["family-shelf"]),
  base("care-binder", "The Care Binder", "14.99", ["family-shelf"]),
  base("read-your-childs-treatment-plan", "Read Your Child's Treatment Plan", "9.99", ["family-shelf"]),
];

export const FIXTURE_COLLECTIONS: Collection[] = [
  { id: "fixture-family", handle: "the-family-shelf", title: "The Family Shelf", description: "", products: FIXTURE_PRODUCTS },
  { id: "fixture-clinic", handle: "the-clinic-shelf", title: "The Clinic Shelf", description: "", products: [] },
];

export function fixturesEnabled() {
  // Never on Vercel (it sets VERCEL=1), never when a real token exists.
  return process.env.SHOPIFY_FIXTURES === "1" && !process.env.SHOPIFY_STOREFRONT_TOKEN && !process.env.VERCEL;
}
