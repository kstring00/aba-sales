import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": `10.1.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` }) }));

import { joinList, unsubscribe } from "@/app/actions/email";
import { confirmationEmail, shelfTitleFromSource } from "@/lib/email/templates";
import { unsubscribeToken, verifyUnsubscribe, listUnsubscribeHeaders } from "@/lib/email/unsubscribe";
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

const form = (email: string, source = "shelf-plan-soon") => {
  const f = new FormData();
  f.set("email", email);
  f.set("source", source);
  f.set("website", "");
  return f;
};

describe("sign-up confirmation", () => {
  it("adds the contact, then sends one confirmation with unsubscribe headers", async () => {
    expect(await joinList(null, form("new@example.org"))).toEqual({ ok: true });
    const sends = calls.filter((c) => c.url.endsWith("/emails"));
    expect(sends).toHaveLength(1);
    const body = sends[0].body!;
    expect(body.to).toEqual(["new@example.org"]);
    expect(body.subject).toBe("You're on the list");
    expect(String(body.text)).toContain("Make a Plan");
    expect(String(body.text)).toContain("/unsubscribe?e=new%40example.org&t=");
    expect((body.headers as Record<string, string>)["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(calls.findIndex((c) => c.url.endsWith("/contacts"))).toBeLessThan(calls.findIndex((c) => c.url.endsWith("/emails")));
  });

  it("doesn't send a second confirmation to the same address the same day", async () => {
    await joinList(null, form("twice@example.org"));
    await joinList(null, form("twice@example.org"));
    expect(calls.filter((c) => c.url.endsWith("/emails"))).toHaveLength(1);
  });

  it("still counts the sign-up when the confirmation fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => new Response("{}", { status: url.endsWith("/emails") ? 500 : 200 })));
    expect(await joinList(null, form("fail@example.org"))).toEqual({ ok: true });
  });
});

describe("unsubscribe links", () => {
  it("only verify for the address they were made for", () => {
    const t = unsubscribeToken("a@b.co");
    expect(verifyUnsubscribe("a@b.co", t)).toBe(true);
    expect(verifyUnsubscribe("A@B.co", t)).toBe(true);
    expect(verifyUnsubscribe("other@b.co", t)).toBe(false);
    expect(verifyUnsubscribe("a@b.co", "nope")).toBe(false);
    expect(listUnsubscribeHeaders("a@b.co")["List-Unsubscribe"]).toContain("/api/unsubscribe?e=a%40b.co");
  });

  it("the unsubscribe action marks the contact unsubscribed", async () => {
    const f = new FormData();
    f.set("e", "a@b.co");
    f.set("t", unsubscribeToken("a@b.co"));
    expect(await unsubscribe(null, f)).toEqual({ done: true });
    expect(calls[0]).toMatchObject({ url: "https://api.resend.com/contacts/a%40b.co", method: "PATCH", body: { unsubscribed: true } });
    f.set("t", "forged");
    expect((await unsubscribe(null, f))?.error).toBeTruthy();
  });
});

it("names the shelf when it can", () => {
  expect(shelfTitleFromSource("shelf-home")).toBe("Support at Home");
  expect(shelfTitleFromSource("abc-export")).toBeNull();
  expect(confirmationEmail({ source: "site", unsubscribeUrl: "https://x/u" }).text).toContain("when new downloads reach the shelf");
});
