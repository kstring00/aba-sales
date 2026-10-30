# TODO — grouped by page

Items marked **(founder)** need you. Items marked **(review)** need a professional before launch. Everything else is build work for later phases.

## Global
- (founder) Create the Supabase project, run the migration, enable Email + Google providers, set env vars. Nothing here has run against hosted Supabase yet.
- (founder) Google OAuth client in Google Cloud; paste into Supabase. Until then "Continue with Google" fails politely.
- (founder) Vercel project + env vars; verify PDF export fonts load on Vercel.
- (founder) Stripe test products ($6/mo, $49/yr), Customer Portal enabled, webhook endpoint; run one test purchase.
- (review) Legal review of privacy + terms (consumer privacy, health-app, child-protection).
- (review) BCBA review of observation wording (antecedent/consequence lists, intensity labels, patterns captions, PDF copy).
- (review) Safeguarding review of crisis page copy and numbers; add non-US lines or a clear statement.
- Email delivery: caregiver invites and share links are shown as copyable links; no email is sent. Choose a provider (Resend/Postmark) in a later phase.
- Confirm Supabase backup retention for your plan; privacy page currently says "within 30 days".
- Rate limiting on public forms (contact, email signup) and on `/share/[token]` lookups is minimal (honeypot + token entropy). Add a limiter before launch.
- Accessibility pass with a screen reader (VoiceOver/NVDA) on the logging sheet.

## Home `/`
- Minimal by design in Phase 1A. Phase 2 adds: sample export image (`public/sample-export-1.png` is ready), Support Guide entry points, featured download, email capture, founder photo.
- (founder) Founder photo and final wording for the RBT paragraph.
- "Reviewed by a BCBA" line and testimonials section: build hidden in Phase 2, fill when real.
- Hero photography slots: quiet domestic imagery, no faces. Currently none; placeholders arrive with Phase 2 layout.

## Sign-in `/sign-in`
- (founder) Connect Resend as Supabase's SMTP sender (README step 5). Until a domain is verified, Resend only delivers to your own email, so other testers should use Google sign-in.
- (founder) **Update the "Magic Link" and "Confirm signup" email templates** to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/app` (README step 4). Without it, links fail when opened in another browser or after an email scanner pre-opens them.
- (founder) Confirm Supabase magic-link email template wording; default template says "Supabase".
- Consider rate limiting magic-link requests per email/IP.

## Tracker `/app`
- Behavior label suggestions are seeded once at onboarding; consider a "suggestions" sheet for adding later.
- iOS "Add to Home Screen" nudge once the parent has logged a few times (no streaks, no badges).
- Haptic feedback on save where supported (progressive enhancement).

## Entries `/app/entries`
- Pagination beyond 1000 entries in a range (currently capped at 1000).
- Search within notes.

## Export `/app/export`
- Pro "custom report layouts" currently means three toggles (notes, details, counts). Decide whether to add a "one line per entry" compact layout and a landscape option.
- Share-link range is fixed to the last 4 weeks; let Pro users pick the range.
- Share page uses the DEFAULT_TZ (America/Chicago) for week boundaries because the viewer has no zone cookie; store the owner's zone on the link.

## Patterns `/app/patterns`
- Consider a "by what happened right after" block (currently time of day, right before, day of week per spec).
- Export patterns as a page in the PDF (Pro).

## Settings `/app/settings`
- Display name editing (profile exists, no UI yet).
- Caregivers see owner's display name only if one exists; magic-link users have none. Consider asking for a first name at onboarding.
- Billing section shows nothing about invoices; the Stripe Customer Portal covers it.

## Crisis `/crisis`
- (review) Safeguarding review. Add international lines or a clear "US only" statement with a link to a global directory.

## Privacy `/privacy`, Terms `/terms`
- (review) Legal review. Replace the TODO banners.

## Contact `/contact`
- Messages land in `contact_messages`; no email notification yet. Decide how you'll read them (Supabase dashboard for now).

## Phase 1B — Support Guide `/guide`, Library `/library`
- Not started. Safety system, rate limits, fixtures, library seed, provider retention docs all pending.
- AI usage limits are intentionally NOT tied to Pro yet (your call in 1B).

## Phase 2 — Shelf
- Not started. Storefront API client, collections, product page, cart, ISR.

## Phase 3 — Launch readiness
- Not started. Lighthouse, a11y audit, sitemap check, link check, grep for lorem (currently zero).
