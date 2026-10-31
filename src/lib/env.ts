/**
 * Environment access. Public values may be read anywhere; server values only
 * inside server code.
 *
 * Production fails loudly at build time when the site URL is missing or
 * still points at localhost: every absolute URL (sitemap, robots, canonical,
 * og:image) derives from it, and a wrong value silently breaks sharing and
 * crawling (audit F-02).
 */
const isProductionBuild = process.env.VERCEL_ENV === "production";
const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();

if (isProductionBuild && (!rawSiteUrl || /localhost|127\.0\.0\.1/.test(rawSiteUrl))) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be set to https://www.thesupportshelf.org for the Production environment (and the Preview URL for Preview). See docs/AUDIT_FIXES.md → Operator actions.",
  );
}

export const publicEnv = {
  siteUrl: (rawSiteUrl || "http://localhost:3000").replace(/\/$/, ""),
  /** A real person's mailbox. Overridable; never empty, so no page promises a contact that doesn't exist. */
  contactEmail: (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim() || "kyle@stringhamwebdesign.com",
  /** Name of the reviewing BCBA. Empty renders nothing: no placeholder line. */
  bcbaReviewer: (process.env.NEXT_PUBLIC_BCBA_REVIEWER ?? "").trim(),
  /** Path (under /public) to the founder photo. Empty hides the slot entirely. */
  founderPhoto: (process.env.NEXT_PUBLIC_FOUNDER_PHOTO ?? "").trim(),
};
