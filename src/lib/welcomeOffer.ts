/**
 * The welcome offer: 15% off a first paid download for joining the list.
 *
 * It appears once per browser, never before ~30 seconds or half a page of
 * scrolling, and never on pages a parent opens in a hard moment or in the
 * middle of a task. Closing it is final.
 */
export const OFFER_PERCENT = 15;

/** localStorage key. Set the moment the offer is shown, so it never shows twice. */
export const OFFER_SEEN_KEY = "ss-welcome-offer-seen";

/** How long a visitor has to be on the site before the offer can appear. */
export const OFFER_DELAY_MS = 30_000;

/** Share of the page scrolled that also counts as "settled in". */
export const OFFER_SCROLL_SHARE = 0.5;

/**
 * Never on these. Right now, Crisis and the breathing / grounding tools are
 * for hard moments; the ABC logger, cart, thanks and unsubscribe are mid-task.
 */
const BLOCKED = ["/right-now", "/crisis", "/for-you/breathe", "/for-you/ground", "/abc", "/cart", "/thanks", "/unsubscribe"];

export function offerAllowedOn(pathname: string): boolean {
  const p = (pathname || "/").replace(/\/+$/, "") || "/";
  return !BLOCKED.some((b) => p === b || p.startsWith(`${b}/`));
}
