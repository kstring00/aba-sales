import { describe, expect, it } from "vitest";
import { privateEvent } from "@/components/site/SiteAnalytics";

describe("analytics privacy", () => {
  it("sends the path only", () => {
    expect(privateEvent({ type: "pageview", url: "https://www.thesupportshelf.org/find-care?age=3-5&coverage=medicaid&state=TX" })).toEqual({ type: "pageview", url: "https://www.thesupportshelf.org/find-care" });
    expect(privateEvent({ type: "pageview", url: "https://www.thesupportshelf.org/learn#x" })?.url).toBe("https://www.thesupportshelf.org/learn");
  });
  it("never counts unsubscribe links, which carry an email address", () => {
    expect(privateEvent({ type: "pageview", url: "https://www.thesupportshelf.org/unsubscribe?e=a%40b.co&t=abc" })).toBeNull();
  });
});
