import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addToList, cleanSource, listConfigured, resetResendCache, sendEmail } from "@/lib/email/resend";

type Call = { url: string; method: string; body: Record<string, unknown> | null };
let calls: Call[] = [];

function mockFetch(responder: (url: string) => { status: number; body?: string }) {
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit = {}) => {
    calls.push({ url, method: init.method ?? "GET", body: init.body ? JSON.parse(String(init.body)) : null });
    const r = responder(url);
    return new Response(r.body ?? "{}", { status: r.status });
  }));
}

beforeEach(() => {
  calls = [];
  resetResendCache();
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("RESEND_SEGMENT_ID", "seg_123");
  vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "person@example.org");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("addToList", () => {
  it("creates the contact in the segment with the form as a property", async () => {
    mockFetch(() => ({ status: 200 }));
    await addToList("a@b.co", "shelf-family");
    const create = calls.find((c) => c.url.endsWith("/contacts"))!;
    expect(create.method).toBe("POST");
    expect(create.body).toEqual({ email: "a@b.co", unsubscribed: false, segments: [{ id: "seg_123" }], properties: { signup_source: "shelf-family" } });
    expect(calls.some((c) => c.url.includes("/audiences"))).toBe(false);
  });

  it("treats an existing contact as success and adds it to the segment", async () => {
    mockFetch((url) => (url.endsWith("/contacts") ? { status: 409, body: '{"message":"Contact already exists"}' } : { status: 200 }));
    await expect(addToList("a@b.co", "abc-export")).resolves.toBeUndefined();
    expect(calls.at(-1)!.url).toBe("https://api.resend.com/contacts/a%40b.co/segments/seg_123");
  });

  it("also accepts 'already in segment' on the second call", async () => {
    mockFetch((url) => (url.endsWith("/contact-properties") ? { status: 200 } : { status: 422, body: '{"message":"Contact already exists in this segment"}' }));
    await expect(addToList("a@b.co", "site")).resolves.toBeUndefined();
  });

  it("does not hide a 409 that isn't a duplicate", async () => {
    mockFetch((url) => (url.endsWith("/contacts") ? { status: 409, body: '{"message":"concurrent_idempotent_requests"}' } : { status: 200 }));
    await expect(addToList("a@b.co", "site")).rejects.toThrow("409");
  });

  it("still saves the contact when the property can't be created", async () => {
    mockFetch((url) => (url.endsWith("/contact-properties") ? { status: 403 } : { status: 200 }));
    await addToList("a@b.co", "site");
    const create = calls.find((c) => c.url.endsWith("/contacts"))!;
    expect(create.body).not.toHaveProperty("properties");
  });

  it("refuses without a segment", async () => {
    vi.stubEnv("RESEND_SEGMENT_ID", "");
    expect(listConfigured()).toBe(false);
    mockFetch(() => ({ status: 200 }));
    await expect(addToList("a@b.co", "site")).rejects.toThrow();
    expect(calls).toHaveLength(0);
  });
});

describe("sendEmail", () => {
  it("sets reply_to to the contact mailbox and touches no contacts", async () => {
    mockFetch(() => ({ status: 200 }));
    await sendEmail({ to: "a@b.co", subject: "s", html: "<p>h</p>", text: "t" });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.resend.com/emails");
    expect(calls[0].body!.reply_to).toBeTruthy();
  });
});

it("cleanSource keeps form names short and plain", () => {
  expect(cleanSource("Shelf Family / Soon!")).toBe("shelf-family-soon");
  expect(cleanSource("!!!")).toBe("site");
});
