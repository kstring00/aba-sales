import { storefront, shopifyConfigured, ShopifyError } from "./client";
import { COLLECTION_QUERY, PRODUCT_HANDLES_QUERY, PRODUCT_QUERY } from "./queries";
import { toCollection, toDetail, type RawCollection, type RawProductDetail } from "./normalize";
import type { Collection, ProductDetail } from "./types";
import { FIXTURE_COLLECTIONS, FIXTURE_PRODUCTS, fixturesEnabled } from "./fixtures";

/**
 * The shelves. Only published products ever come back from the Storefront
 * API, so drafts are hidden with no extra code. Interactive stays off the
 * site until it has products.
 */
export const SHELVES = [
  { handle: "the-family-shelf", short: "Family", blurb: "For home: routines, transitions, and the everyday moments." },
  { handle: "the-clinic-shelf", short: "Clinic", blurb: "For practices: onboarding, communication, and the paperwork that sets a tone." },
] as const;

export type ShelfHandle = (typeof SHELVES)[number]["handle"];

export function isShelfHandle(h: string): h is ShelfHandle {
  return SHELVES.some((s) => s.handle === h);
}

export async function getCollection(handle: string): Promise<Collection | null> {
  if (fixturesEnabled()) return FIXTURE_COLLECTIONS.find((c) => c.handle === handle) ?? null;
  if (!shopifyConfigured()) return null;
  try {
    const data = await storefront<{ collection: RawCollection | null }>(COLLECTION_QUERY, { handle }, { revalidate: 300, tags: ["shopify"] });
    return data.collection ? toCollection(data.collection) : null;
  } catch (e) {
    if (e instanceof ShopifyError) return null;
    throw e;
  }
}

export async function getShelves(): Promise<Collection[]> {
  const all = await Promise.all(SHELVES.map((s) => getCollection(s.handle)));
  return all.filter((c): c is Collection => Boolean(c));
}

export async function getProduct(handle: string): Promise<(ProductDetail & { collectionHandles: string[] }) | null> {
  if (fixturesEnabled()) return FIXTURE_PRODUCTS.find((p) => p.handle === handle) ?? null;
  if (!shopifyConfigured()) return null;
  try {
    const data = await storefront<{ product: RawProductDetail | null }>(PRODUCT_QUERY, { handle }, { revalidate: 300, tags: ["shopify"] });
    return data.product ? toDetail(data.product) : null;
  } catch (e) {
    if (e instanceof ShopifyError) return null;
    throw e;
  }
}

export async function getProductHandles(): Promise<string[]> {
  if (fixturesEnabled()) return FIXTURE_PRODUCTS.map((p) => p.handle);
  if (!shopifyConfigured()) return [];
  try {
    const data = await storefront<{ products: { edges: Array<{ node: { handle: string } }> } }>(PRODUCT_HANDLES_QUERY, {}, { revalidate: 300 });
    return data.products.edges.map((e) => e.node.handle);
  } catch {
    return [];
  }
}

/** Another product from the same shelf, for the "you might also like" slot. */
export async function getRelated(handle: string, collectionHandles: string[]): Promise<Collection["products"][number] | null> {
  for (const ch of collectionHandles) {
    const c = await getCollection(ch);
    const other = c?.products.find((p) => p.handle !== handle);
    if (other) return other;
  }
  return null;
}
