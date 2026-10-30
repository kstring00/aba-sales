import { describe, expect, it } from "vitest";
import { formatMoney, toCart, toDetail, toSummary, type RawCart, type RawProductDetail } from "@/lib/shopify/normalize";

const rawProduct: RawProductDetail = {
  id: "gid://shopify/Product/1",
  handle: "test-cards",
  title: "TEST — Morning Routine Cards",
  description: "A printable set of cards. Format: PDF, 18 pages. What's included: cards · notes.",
  tags: ["family-shelf", "TEST"],
  availableForSale: true,
  featuredImage: { url: "https://cdn.shopify.com/x.png", altText: "cards", width: 800, height: 1000 },
  priceRange: { minVariantPrice: { amount: "12.0", currencyCode: "USD" } },
  compareAtPriceRange: { minVariantPrice: { amount: "0.0", currencyCode: "USD" } },
  benefit: null,
  descriptionHtml: "<p>A printable set of cards.</p>",
  images: { edges: [{ node: { url: "https://cdn.shopify.com/x.png", altText: "cards", width: 800, height: 1000 } }] },
  variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/9", availableForSale: true } }] },
  format: { value: "PDF, 18 pages, US Letter" },
  included: { value: "24 cards\n- 2 blank sheets\n• a note" },
  seo: { title: null, description: null },
  collections: { edges: [{ node: { handle: "the-family-shelf" } }] },
};

describe("product normalization", () => {
  it("derives a one-line benefit from the first sentence when no metafield is set", () => {
    expect(toSummary(rawProduct).benefit).toBe("A printable set of cards.");
    expect(toSummary(rawProduct).compareAtPrice).toBeNull();
  });
  it("reads format and included from metafields and the first variant id for the cart", () => {
    const d = toDetail(rawProduct);
    expect(d.format).toBe("PDF, 18 pages, US Letter");
    expect(d.included).toEqual(["24 cards", "2 blank sheets", "a note"]);
    expect(d.variantId).toBe("gid://shopify/ProductVariant/9");
    expect(d.collectionHandles).toEqual(["the-family-shelf"]);
  });
  it("formats money without cents for whole amounts", () => {
    expect(formatMoney({ amount: "12.0", currencyCode: "USD" })).toBe("$12");
    expect(formatMoney({ amount: "7.5", currencyCode: "USD" })).toBe("$7.50");
  });
});

describe("cart handoff", () => {
  it("carries Shopify's checkoutUrl through untouched and totals lines", () => {
    const raw: RawCart = {
      id: "gid://shopify/Cart/abc",
      checkoutUrl: "https://vgb9f2-eg.myshopify.com/cart/c/abc?key=123",
      totalQuantity: 2,
      cost: { subtotalAmount: { amount: "24.0", currencyCode: "USD" }, totalAmount: { amount: "24.0", currencyCode: "USD" } },
      lines: {
        edges: [
          {
            node: {
              id: "gid://shopify/CartLine/1",
              quantity: 2,
              cost: { totalAmount: { amount: "24.0", currencyCode: "USD" } },
              merchandise: {
                id: "gid://shopify/ProductVariant/9",
                title: "Default Title",
                price: { amount: "12.0", currencyCode: "USD" },
                image: null,
                product: { title: "TEST — Morning Routine Cards", handle: "test-cards", featuredImage: { url: "https://cdn.shopify.com/x.png", altText: null, width: 1, height: 1 } },
              },
            },
          },
        ],
      },
    };
    const cart = toCart(raw);
    expect(cart.checkoutUrl).toBe(raw.checkoutUrl);
    expect(cart.lines[0]).toMatchObject({ quantity: 2, productHandle: "test-cards", merchandiseId: "gid://shopify/ProductVariant/9" });
    expect(cart.lines[0].image?.url).toBe("https://cdn.shopify.com/x.png");
    expect(formatMoney(cart.total)).toBe("$24");
  });
});
