import type { Cart, CartLine, Collection, Image, Money, ProductDetail, ProductSummary } from "./types";

/** Shapes raw Storefront GraphQL payloads into the small types the UI uses. */

type Edges<T> = { edges: Array<{ node: T }> };
type RawImage = { url: string; altText: string | null; width: number | null; height: number | null } | null;
type RawMoney = { amount: string; currencyCode: string };

export type RawProductSummary = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: RawImage;
  priceRange: { minVariantPrice: RawMoney };
  compareAtPriceRange: { minVariantPrice: RawMoney | null };
  benefit: { value: string } | null;
  shelf?: { value: string } | null;
};

export type RawProductDetail = RawProductSummary & {
  descriptionHtml: string;
  images: Edges<NonNullable<RawImage>>;
  variants: Edges<{ id: string; availableForSale: boolean }>;
  format: { value: string } | null;
  included: { value: string } | null;
  seo: { title: string | null; description: string | null } | null;
  collections: Edges<{ handle: string }>;
};

export type RawCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  products: Edges<RawProductSummary>;
};

export type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: RawMoney; totalAmount: RawMoney };
  lines: Edges<{
    id: string;
    quantity: number;
    cost: { totalAmount: RawMoney };
    merchandise: {
      id: string;
      title: string;
      price: RawMoney;
      image: RawImage;
      product: { title: string; handle: string; featuredImage: RawImage };
    };
  }>;
};

const nodes = <T>(e: Edges<T> | undefined | null): T[] => e?.edges.map((x) => x.node) ?? [];

function firstSentence(text: string): string {
  const m = text.trim().match(/^(.+?[.!?])(\s|$)/);
  return (m ? m[1] : text.trim()).slice(0, 160);
}

function compareAt(raw: RawProductSummary): Money | null {
  const c = raw.compareAtPriceRange?.minVariantPrice;
  if (!c || Number(c.amount) <= Number(raw.priceRange.minVariantPrice.amount)) return null;
  return c;
}

export function toSummary(raw: RawProductSummary): ProductSummary {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    benefit: raw.benefit?.value?.trim() || firstSentence(raw.description ?? ""),
    featuredImage: raw.featuredImage,
    price: raw.priceRange.minVariantPrice,
    compareAtPrice: compareAt(raw),
    tags: raw.tags ?? [],
    availableForSale: raw.availableForSale,
    shelf: raw.shelf?.value?.trim() || null,
  };
}

export function toDetail(raw: RawProductDetail): ProductDetail & { collectionHandles: string[] } {
  const variant = nodes(raw.variants)[0];
  return {
    ...toSummary(raw),
    descriptionHtml: raw.descriptionHtml,
    description: raw.description,
    images: nodes(raw.images) as Image[],
    variantId: variant?.id ?? "",
    availableForSale: raw.availableForSale && Boolean(variant?.availableForSale),
    format: raw.format?.value?.trim() || null,
    included: (raw.included?.value ?? "")
      .split(/\r?\n|;/)
      .map((s) => s.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean),
    seoTitle: raw.seo?.title || null,
    seoDescription: raw.seo?.description || null,
    collectionHandles: nodes(raw.collections).map((c) => c.handle),
  };
}

export function toCollection(raw: RawCollection): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    products: nodes(raw.products).map(toSummary),
  };
}

export function toCart(raw: RawCart): Cart {
  const lines: CartLine[] = nodes(raw.lines).map((l) => ({
    id: l.id,
    quantity: l.quantity,
    merchandiseId: l.merchandise.id,
    title: l.merchandise.product.title,
    productHandle: l.merchandise.product.handle,
    image: l.merchandise.image ?? l.merchandise.product.featuredImage,
    price: l.merchandise.price,
    lineTotal: l.cost.totalAmount,
  }));
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: raw.cost.subtotalAmount,
    total: raw.cost.totalAmount,
    lines,
  };
}

export function formatMoney(m: Money): string {
  const n = Number(m.amount);
  if (n === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currencyCode,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}
