import { describe, expect, it } from "vitest";
import { formatEventDate, liveEvents, toEvent } from "@/lib/events";

const node = (fields: Record<string, string>, handle = "x") => ({ handle, fields: Object.entries(fields).map(([key, value]) => ({ key, value })) });
const base = { name: "Sensory morning", venue: "Example Museum", kind: "Recurring", when: "First Saturday, 8–10 AM", url: "https://example.com/", adapted: "Lower sound\n- Quiet room" };

describe("toEvent", () => {
  it("reads an entry and splits 'what's different' into lines", () => {
    const e = toEvent(node({ ...base, cost: "Free" }))!;
    expect(e.adapted).toEqual(["Lower sound", "Quiet room"]);
    expect(e.kind).toBe("Recurring");
    expect(e.cost).toBe("Free");
  });
  it("skips entries missing required fields, with non-https links, or one-date events without a date", () => {
    expect(toEvent(node({ ...base, name: "" }))).toBeNull();
    expect(toEvent(node({ ...base, adapted: "" }))).toBeNull();
    expect(toEvent(node({ ...base, url: "http://example.com" }))).toBeNull();
    expect(toEvent(node({ ...base, url: "javascript:alert(1)" }))).toBeNull();
    expect(toEvent(node({ ...base, kind: "One date" }))).toBeNull();
  });
});

describe("liveEvents", () => {
  it("drops past one-date events and hidden entries, and orders dated, recurring, any-day", () => {
    const past = toEvent(node({ ...base, kind: "One date", date: "2026-10-31" }, "past"))!;
    const soon = toEvent(node({ ...base, kind: "One date", date: "2026-12-02" }, "soon"))!;
    const sooner = toEvent(node({ ...base, kind: "One date", date: "2026-11-15" }, "sooner"))!;
    const monthly = toEvent(node(base, "monthly"))!;
    const anyday = toEvent(node({ ...base, kind: "Any day" }, "anyday"))!;
    const hidden = toEvent(node({ ...base, hide_after: "2026-10-31" }, "hidden"))!;
    expect(liveEvents([anyday, monthly, past, soon, hidden, sooner], "2026-11-01").map((e) => e.handle)).toEqual(["sooner", "soon", "monthly", "anyday"]);
  });
  it("keeps a one-date event through its day", () => {
    const e = toEvent(node({ ...base, kind: "One date", date: "2026-11-01" }))!;
    expect(liveEvents([e], "2026-11-01")).toHaveLength(1);
  });
});

describe("formatEventDate", () => {
  it("formats with the weekday", () => {
    expect(formatEventDate("2026-12-02")).toBe("Wed, Dec 2");
    expect(formatEventDate(null)).toBeNull();
  });
});
