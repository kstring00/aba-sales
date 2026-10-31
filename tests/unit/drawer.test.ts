import { describe, expect, it } from "vitest";
import { buildDrawer } from "@/lib/drawer";
import { isComingSoon, shelfFor } from "@/lib/shelves";
import type { ProductSummary } from "@/lib/shopify/types";

const product = (handle: string, extra: Partial<ProductSummary> = {}): ProductSummary => ({
  id: handle,
  handle,
  title: handle.replace(/-/g, " "),
  benefit: "",
  featuredImage: null,
  price: { amount: "0.0", currencyCode: "USD" },
  compareAtPrice: null,
  tags: [],
  availableForSale: true,
  ...extra,
});

describe("shelf placement", () => {
  it("prefers the custom.shelf metafield, then shelf tags in either spelling, then the handle", () => {
    expect(shelfFor(product("x", { shelf: "make-a-plan" }))?.id).toBe("plan");
    expect(shelfFor(product("x", { tags: ["shelf:everyday-life"] }))?.id).toBe("everyday");
    expect(shelfFor(product("x", { tags: ["shelf-support-at-home"] }))?.id).toBe("home");
    expect(shelfFor(product("x", { tags: ["shelf-organized"] }))?.id).toBe("organized");
    expect(shelfFor(product("care-binder"))?.id).toBe("organized");
    expect(shelfFor(product("mystery"))).toBeNull();
  });
  it("marks coming-soon by tag or unavailability", () => {
    expect(isComingSoon(product("x", { tags: ["Coming-Soon"] }))).toBe(true);
    expect(isComingSoon(product("x", { availableForSale: false }))).toBe(true);
    expect(isComingSoon(product("x"))).toBe(false);
  });
});

describe("drawer model", () => {
  it("renders four shelves with four cards each, never an empty drawer", () => {
    const d = buildDrawer([]);
    expect(d).toHaveLength(4);
    for (const s of d) expect(s.cards.length).toBeGreaterThanOrEqual(2);
    expect(d.find((s) => s.id === "everyday")!.cards.every((c) => c.status === "soon")).toBe(true);
  });
  it("puts live Shopify products first with their live price, then the free tool, then coming-soon fillers", () => {
    const d = buildDrawer([product("care-binder", { title: "The Care Binder", price: { amount: "14.99", currencyCode: "USD" } }), product("home-abc-printable", { title: "Home ABC Printable" })]);
    const s = d.find((x) => x.id === "organized")!;
    expect(s.cards.map((c) => c.status)).toEqual(["price", "free", "free", "soon", "soon"]);
    expect(s.cards[0]).toMatchObject({ priceLabel: "$14.99", cta: "Buy · $14.99", href: "/products/care-binder" });
    expect(s.cards[1]).toMatchObject({ priceLabel: "Free", cta: "Get it free", href: "/products/home-abc-printable" });
    expect(s.cards[2]).toMatchObject({ title: "ABC Tracker", href: "/abc", cta: "Open ABC Tracker" });
    expect(s.cards[3]).toMatchObject({ status: "soon", priceLabel: null });
  });
  it("caps coming-soon fillers at three per shelf and keeps the ABC Tracker on Shelf 1 only", async () => {
    const { COMING_SOON_CAP } = await import("@/lib/drawer");
    const d = buildDrawer([]);
    for (const s of d) expect(s.cards.filter((c) => c.status === "soon").length).toBeLessThanOrEqual(COMING_SOON_CAP);
    expect(d.filter((s) => s.cards.some((c) => c.href === "/abc")).map((s) => s.id)).toEqual(["organized"]);
  });
  it("never shows a price for a coming-soon product and drops a filler that a live product replaces", () => {
    const d = buildDrawer([product("appointment-notes", { title: "Appointment Notes", tags: ["shelf-organized", "coming-soon"], price: { amount: "5.00", currencyCode: "USD" } })]);
    const s = d.find((x) => x.id === "organized")!;
    const notes = s.cards.filter((c) => c.title === "Appointment Notes");
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ status: "soon", priceLabel: null });
  });
});
