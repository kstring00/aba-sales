import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` }) }));

import { claimOffer } from "@/app/actions/email";
import { resetResendCache } from "@/lib/email/resend";

type Call = { url: string; method: string; body: Record<string, unknown> | null };
let calls: Call[] = [];
beforeEach(() => {
  calls = [];
  resetResendCache();
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("RESEND_SEGMENT_ID", "seg_123");
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit = {}) => {
    calls.push({ url, method: init.method ?? "GET", body: init.body ? JSON.parse(String(init.body)) : null });
    return new Response("{}", { status: 200 });
  }));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const form = (email: string) => {
  const f = new FormData();
  f.set("email", email);
  return f;
};

describe("claimOffer", () => {
  it("adds the address to the list, emails the code, and returns it", async () => {
    const res = await claimOffer(null, form("Parent@Example.com"));
    expect(res).toEqual({ ok: true, code: "WELCOME15", emailed: true });
    const contact = calls.find((c) => c.url.endsWith("/contacts") && c.method === "POST");
    expect(contact?.body?.email).toBe("parent@example.com");
    const sent = calls.find((c) => c.url.endsWith("/emails"));
    expect(String(sent?.body?.text)).toContain("WELCOME15");
  });

  it("uses WELCOME_OFFER_CODE when set", async () => {
    vi.stubEnv("WELCOME_OFFER_CODE", "HELLO15");
    const res = await claimOffer(null, form("other@example.com"));
    expect(res && "code" in res ? res.code : null).toBe("HELLO15");
  });

  it("rejects a bad address without touching Resend", async () => {
    const res = await claimOffer(null, form("not-an-email"));
    expect(res).toEqual({ error: "That email doesn't look right." });
    expect(calls).toHaveLength(0);
  });

  it("refuses when the list isn't configured", async () => {
    vi.stubEnv("RESEND_SEGMENT_ID", "");
    const res = await claimOffer(null, form("x@example.com"));
    expect(res && "error" in res).toBe(true);
  });
});
