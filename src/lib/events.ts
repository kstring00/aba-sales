import { storefront, shopifyConfigured } from "@/lib/shopify/client";
import { fixturesEnabled } from "@/lib/shopify/fixtures";
import { todayInTexas } from "@/lib/jobs";

/**
 * Sensory-friendly outings in Houston. Entries are Shopify metaobjects of
 * type `event_listing`, added in Shopify admin (Content → Metaobjects →
 * Event listing). Only Active entries reach the Storefront API. A one-date
 * event drops off the day after it happens, and anything past its
 * "Hide after" date drops off too. Edits show up within five minutes.
 */
export type EventKind = "One date" | "Recurring" | "Any day";

export type SensoryEvent = {
  handle: string;
  name: string;
  venue: string;
  area: string | null;
  kind: EventKind;
  when: string;
  date: string | null;
  adapted: string[];
  cost: string | null;
  url: string;
  checkedOn: string | null;
  hideAfter: string | null;
};

type RawField = { key: string; value: string | null };
type RawNode = { handle: string; fields: RawField[] };

const EVENTS_QUERY = /* GraphQL */ `
  query Events {
    metaobjects(type: "event_listing", first: 100) {
      nodes { handle fields { key value } }
    }
  }
`;

const KINDS = new Set<EventKind>(["One date", "Recurring", "Any day"]);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** One metaobject → an event, or null when a required field is missing, the link isn't https, or a one-date event has no date. */
export function toEvent(node: RawNode): SensoryEvent | null {
  const f = Object.fromEntries(node.fields.map((x) => [x.key, (x.value ?? "").trim()])) as Record<string, string>;
  const url = f.url ?? "";
  if (!f.name || !f.venue || !f.when || !/^https:\/\//i.test(url)) return null;
  const adapted = (f.adapted ?? "").split(/\r?\n/).map((l) => l.replace(/^[-•·*]\s*/, "").trim()).filter(Boolean);
  if (!adapted.length) return null;
  const kind: EventKind = KINDS.has(f.kind as EventKind) ? (f.kind as EventKind) : "Recurring";
  const date = ISO.test(f.date ?? "") ? f.date : null;
  if (kind === "One date" && !date) return null;
  return {
    handle: node.handle,
    name: f.name,
    venue: f.venue,
    area: f.area || null,
    kind,
    when: f.when,
    date,
    adapted,
    cost: f.cost || null,
    url,
    checkedOn: f.checked_on || null,
    hideAfter: ISO.test(f.hide_after ?? "") ? f.hide_after : null,
  };
}

const ORDER: Record<EventKind, number> = { "One date": 0, Recurring: 1, "Any day": 2 };

/** Drop past and hidden entries; dated events soonest first, then recurring, then any-day, each by name. */
export function liveEvents(events: SensoryEvent[], today = todayInTexas()): SensoryEvent[] {
  return events
    .filter((e) => !(e.hideAfter && e.hideAfter < today))
    .filter((e) => !(e.kind === "One date" && e.date && e.date < today))
    .sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || (a.date ?? "").localeCompare(b.date ?? "") || a.name.localeCompare(b.name));
}

/** "Sat, Dec 6" from "2026-12-06". */
export function formatEventDate(date: string | null): string | null {
  if (!date || !ISO.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

const FIXTURE_EVENTS: SensoryEvent[] = [
  {
    handle: "fixture-recurring",
    name: "Sample sensory-friendly morning",
    venue: "Example Museum",
    area: "Museum District",
    kind: "Recurring",
    when: "First Saturday of the month, 8–10 AM",
    date: null,
    adapted: ["Lower sound and softer lights", "Smaller crowd", "Quiet room available"],
    cost: "Free with registration",
    url: "https://example.com/",
    checkedOn: "2026-11-01",
    hideAfter: null,
  },
  {
    handle: "fixture-date",
    name: "Sample one-night event",
    venue: "Example Garden",
    area: "Downtown",
    kind: "One date",
    when: "5–8 PM",
    date: "2026-12-06",
    adapted: ["Reduced lights and music", "Calm-down area on site"],
    cost: "$",
    url: "https://example.com/",
    checkedOn: "2026-11-01",
    hideAfter: null,
  },
];

export async function getEvents(): Promise<SensoryEvent[]> {
  if (fixturesEnabled()) return liveEvents(FIXTURE_EVENTS);
  if (!shopifyConfigured()) return [];
  try {
    const data = await storefront<{ metaobjects: { nodes: RawNode[] } }>(EVENTS_QUERY, {}, { revalidate: 300, tags: ["shopify", "events"] });
    return liveEvents(data.metaobjects.nodes.map(toEvent).filter((e): e is SensoryEvent => e !== null));
  } catch {
    return [];
  }
}
