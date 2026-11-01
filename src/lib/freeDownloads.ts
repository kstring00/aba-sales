/**
 * Free products that download straight from the site, with no checkout.
 *
 * A free product listed here gets a "Download free PDF" button instead of
 * "Get it free" → cart → Shopify checkout. The PDF lives in
 * /public/downloads/<handle>.pdf, so it is served from our own domain.
 *
 * A free product NOT listed here keeps the old checkout flow, so nothing
 * breaks while its PDF is still missing. To add one: drop the PDF into
 * public/downloads/ named after the product handle, then add the handle here.
 */
export const FREE_DOWNLOADS: Record<string, { file: string; pages: number }> = {
  "visual-schedules": { file: "/downloads/visual-schedules.pdf", pages: 12 },
  "parent-care-guide": { file: "/downloads/parent-care-guide.pdf", pages: 9 },
  "appointment-notes": { file: "/downloads/appointment-notes.pdf", pages: 9 },
  "next-steps-roadmap": { file: "/downloads/next-steps-roadmap.pdf", pages: 11 },
  // Add these two once their PDFs are in public/downloads/:
  // "home-abc-printable": { file: "/downloads/home-abc-printable.pdf", pages: 9 },
  // "waitlist-playbook": { file: "/downloads/waitlist-playbook.pdf", pages: 0 },
};

/** The direct download for a product, only when it is free and its PDF is on the site. */
export function freeDownloadFor(handle: string, price: string) {
  if (price !== "Free") return null;
  return FREE_DOWNLOADS[handle] ?? null;
}
