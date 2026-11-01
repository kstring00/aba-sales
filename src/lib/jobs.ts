import { storefront, shopifyConfigured } from "@/lib/shopify/client";
import { fixturesEnabled } from "@/lib/shopify/fixtures";

/**
 * The Jobs page. Listings are Shopify metaobjects of type `job_listing`,
 * added and edited in Shopify admin (Content → Metaobjects → Job listing).
 * Only entries set to Active reach the Storefront API, and an entry past its
 * "Hide after" date drops off on its own. Edits show up within five minutes.
 */
export type Job = {
  handle: string;
  title: string;
  employer: string;
  kind: "Job" | "Hiring program";
  location: string | null;
  setting: "On site" | "Remote" | "Hybrid" | null;
  hours: string | null;
  pay: string | null;
  goodFit: string[];
  howToApply: string | null;
  applyUrl: string;
  checkedOn: string | null;
  expiresOn: string | null;
};

type RawField = { key: string; value: string | null };
type RawNode = { handle: string; fields: RawField[] };

const JOBS_QUERY = /* GraphQL */ `
  query Jobs {
    metaobjects(type: "job_listing", first: 100) {
      nodes { handle fields { key value } }
    }
  }
`;

const SETTINGS = new Set(["On site", "Remote", "Hybrid"]);

/** One metaobject → a Job, or null when a required field is missing or the link isn't https. */
export function toJob(node: RawNode): Job | null {
  const f = Object.fromEntries(node.fields.map((x) => [x.key, (x.value ?? "").trim()])) as Record<string, string>;
  const applyUrl = f.apply_url ?? "";
  if (!f.title || !f.employer || !/^https:\/\//i.test(applyUrl)) return null;
  const goodFit = (f.good_fit ?? "").split(/\r?\n/).map((l) => l.replace(/^[-•·*]\s*/, "").trim()).filter(Boolean);
  if (!goodFit.length) return null;
  return {
    handle: node.handle,
    title: f.title,
    employer: f.employer,
    kind: f.kind === "Hiring program" ? "Hiring program" : "Job",
    location: f.location || null,
    setting: SETTINGS.has(f.work_setting) ? (f.work_setting as Job["setting"]) : null,
    hours: f.hours || null,
    pay: f.pay || null,
    goodFit,
    howToApply: f.interview || null,
    applyUrl,
    checkedOn: f.checked_on || null,
    expiresOn: f.expires_on || null,
  };
}

/** Today as YYYY-MM-DD in Texas, so a listing hides at the end of its last day there. */
export function todayInTexas(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Drop expired listings; jobs before hiring programs, most recently checked first. */
export function liveJobs(jobs: Job[], today = todayInTexas()): Job[] {
  return jobs
    .filter((j) => !j.expiresOn || j.expiresOn >= today)
    .sort((a, b) => (a.kind === b.kind ? (b.checkedOn ?? "").localeCompare(a.checkedOn ?? "") : a.kind === "Job" ? -1 : 1));
}

const FIXTURE_JOBS: Job[] = [
  {
    handle: "fixture-program",
    title: "Sample hiring program",
    employer: "Example Employer",
    kind: "Hiring program",
    location: "Houston, TX",
    setting: "On site",
    hours: "Internship",
    pay: null,
    goodFit: ["A sample line about why it is on the list", "A second line"],
    howToApply: "Apply on the employer's page.",
    applyUrl: "https://example.com/",
    checkedOn: "2026-11-01",
    expiresOn: null,
  },
];

export async function getJobs(): Promise<Job[]> {
  if (fixturesEnabled()) return liveJobs(FIXTURE_JOBS);
  if (!shopifyConfigured()) return [];
  try {
    const data = await storefront<{ metaobjects: { nodes: RawNode[] } }>(JOBS_QUERY, {}, { revalidate: 300, tags: ["shopify", "jobs"] });
    return liveJobs(data.metaobjects.nodes.map(toJob).filter((j): j is Job => j !== null));
  } catch {
    return [];
  }
}

/** "Nov 1, 2026" from "2026-11-01". */
export function formatChecked(date: string | null): string | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
