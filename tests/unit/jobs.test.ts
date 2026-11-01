import { describe, expect, it } from "vitest";
import { formatChecked, liveJobs, toJob, todayInTexas } from "@/lib/jobs";

const node = (fields: Record<string, string>, handle = "x") => ({ handle, fields: Object.entries(fields).map(([key, value]) => ({ key, value })) });
const base = { title: "Stock associate", employer: "Example Co", kind: "Job", apply_url: "https://example.com/apply", good_fit: "Written interview questions\n- Same shift every week" };

describe("toJob", () => {
  it("reads a listing and splits 'why it's on the list' into lines", () => {
    const j = toJob(node({ ...base, work_setting: "Remote", hours: "Part-time" }))!;
    expect(j.goodFit).toEqual(["Written interview questions", "Same shift every week"]);
    expect(j.setting).toBe("Remote");
    expect(j.kind).toBe("Job");
  });
  it("skips a listing missing a required field or with a non-https link", () => {
    expect(toJob(node({ ...base, title: "" }))).toBeNull();
    expect(toJob(node({ ...base, good_fit: "" }))).toBeNull();
    expect(toJob(node({ ...base, apply_url: "http://example.com" }))).toBeNull();
    expect(toJob(node({ ...base, apply_url: "javascript:alert(1)" }))).toBeNull();
  });
});

describe("liveJobs", () => {
  it("hides expired listings and puts jobs before programs, newest check first", () => {
    const a = toJob(node({ ...base, kind: "Hiring program", checked_on: "2026-11-01" }, "prog"))!;
    const b = toJob(node({ ...base, checked_on: "2026-10-01" }, "old"))!;
    const c = toJob(node({ ...base, checked_on: "2026-11-01" }, "new"))!;
    const d = toJob(node({ ...base, expires_on: "2026-10-31" }, "gone"))!;
    expect(liveJobs([a, b, c, d], "2026-11-01").map((j) => j.handle)).toEqual(["new", "old", "prog"]);
  });
  it("keeps a listing through its last day", () => {
    const j = toJob(node({ ...base, expires_on: "2026-11-01" }))!;
    expect(liveJobs([j], "2026-11-01")).toHaveLength(1);
  });
});

describe("dates", () => {
  it("formats the checked date", () => {
    expect(formatChecked("2026-11-01")).toBe("Nov 1, 2026");
    expect(formatChecked(null)).toBeNull();
  });
  it("uses Texas time for today", () => {
    expect(todayInTexas(new Date("2026-11-02T03:00:00Z"))).toBe("2026-11-01");
  });
});
