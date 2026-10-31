import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/abc/email-export/route";
import { resetResendCache } from "@/lib/email/resend";

let urls: string[] = [];
beforeEach(() => {
  urls = [];
  resetResendCache();
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("RESEND_SEGMENT_ID", "seg_123");
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    urls.push(url);
    return new Response("{}", { status: 200 });
  }));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const entry = {
  id: "e1", behaviorIds: ["b1"], behaviorLabels: ["Hitting"], occurredAt: "2026-10-30T15:00:00.000Z",
  antecedentCode: null, antecedentNote: null, consequenceCode: null, consequenceNote: null,
  durationSeconds: null, intensity: null, note: null, createdAt: "2026-10-30T15:00:00.000Z", updatedAt: "2026-10-30T15:00:00.000Z",
};
// Each test uses its own IP so the per-IP limiter never trips.
const send = (keepInTouch: boolean, ip: string) =>
  POST(new NextRequest("http://localhost/api/abc/email-export", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
    body: JSON.stringify({ email: "parent@example.org", keepInTouch, nickname: "Sam", tz: "America/Chicago", from: "2026-10-30", to: "2026-10-30", entries: [entry] }),
  }));

describe("email export consent", () => {
  it("sends the export without touching contacts when the box is off", async () => {
    const res = await send(false, "10.0.0.1");
    expect(res.status).toBe(200);
    expect(urls).toEqual(["https://api.resend.com/emails"]);
  });

  it("adds the contact to the segment only when the box is ticked", async () => {
    const res = await send(true, "10.0.0.2");
    expect(res.status).toBe(200);
    expect(urls[0]).toBe("https://api.resend.com/emails");
    expect(urls).toContain("https://api.resend.com/contacts");
  });
});
