/**
 * Time-zone helpers with no dependencies. The server never knows the parent's
 * local day on its own, so the client stores its IANA zone in a cookie and
 * these helpers turn "2026-03-04" in that zone into UTC instants.
 */

export const TZ_COOKIE = "ss_tz";
export const DEFAULT_TZ = "America/Chicago";

export function isValidTimeZone(tz: string | undefined | null): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Offset (ms) of `tz` from UTC at the given instant. */
function offsetAt(instant: number, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(new Date(instant)).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** Start of the local calendar day `yyyy-mm-dd` in `tz`, as a Date (UTC instant). */
export function zonedStartOfDay(dateStr: string, tz: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, 0, 0);
  const off1 = offsetAt(guess, tz);
  let instant = guess - off1;
  const off2 = offsetAt(instant, tz);
  if (off2 !== off1) instant = guess - off2;
  return new Date(instant);
}

/** Exclusive end: start of the following local day. */
export function zonedEndOfDay(dateStr: string, tz: string): Date {
  const start = zonedStartOfDay(dateStr, tz);
  // Add 24h then re-snap to handle DST days of 23/25 hours.
  const next = new Date(start.getTime() + 36 * 3600 * 1000);
  const nextStr = toDateStr(next, tz);
  return zonedStartOfDay(nextStr, tz);
}

/** `yyyy-mm-dd` of an instant in `tz`. */
export function toDateStr(d: Date, tz: string): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return dtf.format(d);
}

export function isDateStr(s: string | undefined | null): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}
