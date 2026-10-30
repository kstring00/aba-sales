/**
 * Environment access. Public values may be read anywhere; server values only
 * inside server code.
 */
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
};
