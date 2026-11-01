import { describe, expect, it } from "vitest";
import { offerAllowedOn } from "@/lib/welcomeOffer";
import { welcomeOfferEmail } from "@/lib/email/templates";
import { freeDownloadFor, FREE_DOWNLOADS } from "@/lib/freeDownloads";
import { existsSync } from "node:fs";
import path from "node:path";

describe("welcome offer placement", () => {
  it("never shows on hard-moment or mid-task pages", () => {
    for (const p of ["/right-now", "/crisis", "/for-you/breathe", "/for-you/ground/", "/abc", "/cart", "/thanks", "/unsubscribe"]) {
      expect(offerAllowedOn(p)).toBe(false);
    }
  });
  it("can show on browsing pages", () => {
    for (const p of ["/", "/shelf", "/products/the-care-binder", "/learn", "/for-you", "/find-care"]) {
      expect(offerAllowedOn(p)).toBe(true);
    }
  });
});

describe("welcome offer email", () => {
  it("carries the code, the percent and an unsubscribe link", () => {
    const m = welcomeOfferEmail({ code: "WELCOME15", percent: 15, shopUrl: "https://x.test/shelf", unsubscribeUrl: "https://x.test/u" });
    expect(m.subject).toContain("15%");
    expect(m.text).toContain("WELCOME15");
    expect(m.html).toContain("WELCOME15");
    expect(m.html).toContain("https://x.test/u");
  });
});

describe("free downloads", () => {
  it("only applies to free products", () => {
    expect(freeDownloadFor("visual-schedules", "Free")).not.toBeNull();
    expect(freeDownloadFor("visual-schedules", "$6.99")).toBeNull();
    expect(freeDownloadFor("not-a-product", "Free")).toBeNull();
  });
  it("every listed PDF exists in public/", () => {
    for (const { file } of Object.values(FREE_DOWNLOADS)) {
      expect(existsSync(path.join(process.cwd(), "public", file))).toBe(true);
    }
  });
});
