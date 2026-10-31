import { describe, expect, it } from "vitest";
import { PRODUCT_META } from "@/lib/resources";
import { SHELVES, assignShelves, shelfFor } from "@/lib/shelves";
import type { ProductSummary } from "@/lib/shopify/types";

const product = (handle: string, tags: string[] = []): ProductSummary => ({
  id: handle,
  handle,
  title: handle,
  benefit: "",
  featuredImage: null,
  price: { amount: "0.0", currencyCode: "USD" },
  compareAtPrice: null,
  tags,
  availableForSale: true,
});

describe("shelves", () => {
  it("has four shelves in order with distinct tints and tags", () => {
    expect(SHELVES.map((s) => s.number)).toEqual([1, 2, 3, 4]);
    expect(new Set(SHELVES.map((s) => s.tint)).size).toBe(4);
    expect(new Set(SHELVES.map((s) => s.tag)).size).toBe(4);
  });

  it("every fallback handle has editorial metadata", () => {
    for (const s of SHELVES) for (const h of s.fallbackHandles) expect(PRODUCT_META[h], `${s.id} → ${h}`).toBeTruthy();
  });

  it("places products by Shopify tag first", () => {
    expect(shelfFor(product("care-binder", ["shelf-plan"]))?.id).toBe("plan");
    expect(shelfFor(product("anything", ["Shelf-Everyday"]))?.id).toBe("everyday");
  });

  it("falls back to the handle when tags are missing", () => {
    expect(shelfFor(product("care-binder"))?.id).toBe("organized");
    expect(shelfFor(product("home-abc-printable"))?.id).toBe("organized");
    expect(shelfFor(product("read-your-childs-treatment-plan"))?.id).toBe("plan");
    expect(shelfFor(product("waitlist-playbook"))?.id).toBe("plan");
  });

  it("never drops a product it can't place", () => {
    const { shelves, unshelved } = assignShelves([product("care-binder"), product("mystery-item")]);
    expect(shelves.find((s) => s.id === "organized")?.products.map((p) => p.handle)).toEqual(["care-binder"]);
    expect(unshelved.map((p) => p.handle)).toEqual(["mystery-item"]);
  });

  it("keeps the empty shelf honest and places the free tracker on Shelf 1 in the content file", async () => {
    const { SHELF_CONTENT } = await import("@/content/shelf-drawer");
    const { shelves } = assignShelves([]);
    expect(shelves.find((s) => s.id === "everyday")?.empty?.title).toMatch(/being made/i);
    expect(SHELF_CONTENT.organized.tool?.href).toBe("/abc");
    expect(SHELF_CONTENT.home.tool).toBeNull();
  });

  it("copy never implies outcomes or diagnoses", () => {
    const text = JSON.stringify({ SHELVES, PRODUCT_META }).toLowerCase();
    for (const banned of ["cure", "fix your child", "unlock", "transform", "potential", "never feel overwhelmed", "diagnos"]) expect(text).not.toContain(banned);
  });
});
