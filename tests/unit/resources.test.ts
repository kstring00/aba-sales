import { describe, expect, it } from "vitest";
import { PATHWAYS, PRODUCT_META, resolvePathway, ORGS } from "@/lib/resources";
import type { ProductSummary } from "@/lib/shopify/types";

const product = (handle: string): ProductSummary => ({
  id: handle,
  handle,
  title: handle,
  benefit: "",
  featuredImage: null,
  price: { amount: "0.0", currencyCode: "USD" },
  compareAtPrice: null,
  tags: [],
  availableForSale: true,
});

describe("resource finder", () => {
  it("every pathway references only handles that have editorial metadata", () => {
    for (const p of PATHWAYS) for (const h of p.handles) expect(PRODUCT_META[h], `${p.id} → ${h}`).toBeTruthy();
  });

  it("shows only products that exist in the catalog, never planned ones", () => {
    const catalog = [product("care-binder")];
    const r = resolvePathway(PATHWAYS.find((p) => p.id === "appointment")!, catalog);
    expect(r.products.map((p) => p.handle)).toEqual(["care-binder"]);
    expect(r.notYet).toBeNull(); // something real exists, so no "not yet" banner
  });

  it("says 'not yet' honestly when a pathway has nothing real behind it", () => {
    const r = resolvePathway(PATHWAYS.find((p) => p.id === "routines")!, []);
    expect(r.products).toHaveLength(0);
    expect(r.notYet).toMatch(/planned/i);
  });

  it("the observation pathway always has the free logger even with an empty catalog", () => {
    const r = resolvePathway(PATHWAYS.find((p) => p.id === "observe")!, []);
    expect(r.tools[0].href).toBe("/abc");
    expect(r.notYet).toBeNull();
  });

  it("copy never implies outcomes or diagnoses", () => {
    const text = JSON.stringify({ PATHWAYS, PRODUCT_META }).toLowerCase();
    for (const banned of ["cure", "fix your child", "unlock", "transform", "potential", "never feel overwhelmed", "diagnos"]) expect(text).not.toContain(banned);
  });

  it("directory entries are https and national", () => {
    for (const o of ORGS) expect(o.url.startsWith("https://")).toBe(true);
    expect(ORGS.length).toBeGreaterThanOrEqual(5);
  });
});
