"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics: page-view counts, no cookies. Two pages put private
 * details in their address (unsubscribe links carry the email address; Find
 * care answers carry age and coverage), so every event is sent with the
 * path only, and /unsubscribe is never counted.
 */
export function privateEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  if (url.pathname === "/unsubscribe" || url.pathname.startsWith("/unsubscribe/")) return null;
  return { ...event, url: `${url.origin}${url.pathname}` };
}

export function SiteAnalytics() {
  return <Analytics beforeSend={privateEvent} />;
}
