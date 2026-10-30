# The Support Shelf

*Thoughtfully made tools for the people who care.*

A parent-facing observation tracker and education platform for parents and caregivers of autistic children, plus (Phase 2) a storefront for digital downloads. It records what was observable, exports it cleanly, and never tells anyone what to do.

**Status: Phase 1A (parent ABC tracker) built and locally verified. Not deployed. Not launched.** Phases 1B (Support Guide), 2 (shelf), and 3 (launch readiness) are not started.

---

## What's in the box

| Area | Where | State |
| --- | --- | --- |
| Design system (cream / ink / sage / clay, Fraunces + Inter) | `src/app/globals.css` | Done |
| Database schema, RLS, SECURITY DEFINER functions | `supabase/migrations/0001_init.sql` | Done, 39 RLS tests |
| Magic link + Google sign-in, adult attestation | `src/app/sign-in`, `src/app/auth` | Done (magic link verified locally) |
| Tracker: onboarding, logging sheet, today, entries, settings | `src/app/app`, `src/components/app` | Done, verified locally |
| Offline queue (IndexedDB, per-user, idempotent replay) + service worker | `src/lib/entries/queue.ts`, `public/sw.js` | Done, 9-step offline test |
| Free PDF/CSV export, full JSON export | `src/lib/export`, `src/app/app/export` | Done |
| Hard account deletion | `src/app/app/actions.ts` → `deleteAccount` | Done |
| Pro: patterns, second caregiver, report layouts, 30-day share links | `src/app/app/patterns`, `src/app/app/caregivers`, `src/app/share` | Done |
| Stripe test billing: Checkout, Customer Portal, webhook | `src/app/app/billing`, `src/app/api/stripe/webhook` | Built; webhook unit-tested with signed fixtures; **not run against Stripe** |
| Static pages: home (minimal), crisis, privacy, terms, contact, 404, offline | `src/app/*` | Done (legal copy needs review) |
| PWA manifest, icons, OG image, robots, sitemap | `src/app/manifest.ts`, `public/` | Done |

See `TODO.md` for everything that still needs a human.

---

## Architecture in five sentences

1. **One Next.js 16 app** (App Router, TypeScript, Tailwind v4). Public pages are static or ISR; everything under `/app` renders per request. `cacheComponents` is off on purpose so auth pages behave predictably.
2. **Supabase** holds auth and Postgres. **Row Level Security is on every table.** A user reaches child data only through a `child_caregivers` link, and links are created only by database functions an owner can call. Server actions re-check access before writing; RLS re-checks in the database.
3. **Pro is one server-side boolean**: `isPro()` in `src/lib/pro.ts` reads the `subscriptions` row, which only the Stripe webhook writes (service key). The SQL function `is_pro()` mirrors it so the database can enforce Pro-only grants too.
4. **Offline is a local queue, not background sync.** Entries get client-generated UUIDs, land in IndexedDB first, and replay with idempotent upserts when the app opens, regains connectivity, or becomes visible. The service worker only keeps the shell available.
5. **Exports are free forever.** PDF and CSV routes run as the user (RLS applies); the Pro share link is the one place the service key reads child data, after validating a hashed token, expiry, and revocation.

---

## Environment

Copy `.env.example` to `.env.local`. Every variable is documented there. Summary:

| Variable | Needed for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | auth redirects, share/invite links | No trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | everything | Safe in the browser; RLS protects data |
| `SUPABASE_SERVICE_KEY` | Stripe webhook, account deletion, share links | **Server only.** Never `NEXT_PUBLIC_` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Pro billing | **Test mode only** until launch |
| `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY` | Pro checkout | Price IDs of the two TEST products |
| `RLS_TEST_DATABASE_URL` | `npm run test:rls` | Local Postgres |
| `SHOPIFY_*`, `AI_*` | Phases 2 and 1B | Not read yet; `AI_LIVE_ENABLED=false` |

---

## Run it locally

### Option A: against a real Supabase project (recommended for you)

1. Create a Supabase project. In the SQL editor, paste and run `supabase/migrations/0001_init.sql`.
2. Authentication → Providers: enable **Email** (magic link) and **Google** (needs a Google OAuth client; put its ID/secret in Supabase, not in this app).
3. Authentication → URL configuration: Site URL = your origin (no trailing slash); add `http://localhost:3000/**` and later `https://<your-app>.vercel.app/**` to Redirect URLs.
4. **Authentication → Email Templates: change the link in "Magic Link" and "Confirm signup"** (both) to:

   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/app
   ```

   Why: the default `{{ .ConfirmationURL }}` uses a one-time code that only works in the browser that requested it and is often used up by email scanners that pre-open links. The result is "the login screen sends me back to the login screen". The template above links straight to our confirm page, which does nothing on load and verifies on a button press, so it works in any browser and survives scanners.
5. Project settings → API: copy the URL, anon key, and service role key into `.env.local`.
6. `npm install && npm run dev`, open http://localhost:3000.

### Option B: without Docker or a Supabase account (how this was tested)

The Supabase CLI needs Docker. This environment didn't have it, so `tools/local-supabase` is a tiny Node server that speaks the subset of PostgREST and GoTrue this app uses, on top of a plain Postgres with the real migration and real RLS. **It is a test double, not Supabase.**

```bash
npm run db:local:dev          # creates support_shelf_dev (auth shim + migration)
npm run local:supabase        # :54321, prints anon/service keys
```

Put the printed keys plus `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321` in `.env.local`, then `npm run dev`. Magic links print to that console and are listed at http://localhost:54321/_dev/outbox. "Continue with Google" signs you in as a fake Google user. Details: `tools/local-supabase/README.md`.

---

## Tests

```bash
npm run test          # unit: report/CSV/PDF, patterns, Stripe webhook (18 tests)
npm run test:rls      # 39 RLS tests against local Postgres (needs db:local:reset first)
npm run test:e2e      # Playwright parent journey (needs stand-in on :54321 and app on :3100)
node tests/e2e/offline.mjs   # offline queue journey
node tests/e2e/pro.mjs       # Pro journey: gating, patterns, invites, share links
node tests/e2e/auth.mjs      # magic links: scanners, other browsers, used links
```

RLS tests cover: unauthorized reads/writes, role escalation (caregiver → owner), direct link insertion, child reassignment of entries/behaviors, author changes, owner-link deletion, account deletion cascade, invite acceptance by the wrong email, replay, expiry, revocation, and cross-user export queries.

**Verified locally vs. live.** Everything above was verified against the local stand-in and local Postgres. Nothing has been run against a hosted Supabase project, Stripe, or Vercel in this build. The first live run should re-check: magic link email delivery, Google OAuth, the Stripe webhook with the Stripe CLI, and PDF fonts on Vercel.

---

## Deploy to Vercel (free tier, vercel.app URL)

1. Push this repo to GitHub and import it in Vercel. Framework: Next.js. No build command changes.
2. Add the environment variables from the table above (Production and Preview). Use Stripe **test** keys.
3. Deploy. Then set Supabase **Site URL** to `https://<your-app>.vercel.app`, add `https://<your-app>.vercel.app/**` to Redirect URLs, and set `NEXT_PUBLIC_SITE_URL` to that origin. Links in sign-in emails use the request's host when it is the configured site, a `*.vercel.app` deployment, or localhost; otherwise `NEXT_PUBLIC_SITE_URL`.
4. PDF export reads `src/lib/export/fonts/*.ttf` at runtime; `next.config.ts` lists them in `outputFileTracingIncludes` so Vercel bundles them. Download one PDF after the first deploy to confirm.

Custom domain, plan upgrades, and public launch are your TODOs. Nothing in this repo buys or enables anything.

---

## Stripe (test mode)

1. In the Stripe **test** dashboard create one product "The Support Shelf Pro" with two prices: $6/month and $49/year. Put their `price_...` IDs in env.
2. Customer Portal: Settings → Billing → Customer portal → enable, allow cancel.
3. Webhook: locally, `stripe listen --forward-to localhost:3000/api/stripe/webhook` and copy the `whsec_...` into `STRIPE_WEBHOOK_SECRET`. On Vercel, add an endpoint for `https://<app>/api/stripe/webhook` with events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
4. Test with card `4242 4242 4242 4242`. Settings → Plan should flip to Pro within seconds of the webhook.

The webhook handler (`src/lib/billing/webhook.ts`) is unit-tested with signed fixture events, including tampered payloads, so signature verification and status mapping are covered without network. Whether your Stripe account sends what we expect is the live check.

---

## Privacy, retention, deletion (what the code actually does)

- Children are stored under a **nickname only**. No name, DOB, or photo fields exist.
- Entries hold observable events (enum codes), optional notes in the parent's words, duration, intensity.
- **Export** (PDF, CSV, JSON) is free and unrestricted. Share links (Pro) expire in 30 days and can be withdrawn.
- **Deletion** (`Settings → Delete my account`): cancels Stripe, deletes every owned child (cascading entries, behaviors, invites, share links) as the user, then deletes the auth user with the service key (cascading profile, caregiver links, subscription). Entries a caregiver logged on someone *else's* child survive with `created_by` set to null.
- Hosting providers (Supabase, Vercel) are processors. Supabase keeps backups per its plan; the privacy page says "age out within 30 days", which you must confirm against your plan before launch.
- No analytics. No ad trackers. Server logs record Stripe event IDs and status words only, never entry content.
- **AI provider retention terms**: not applicable yet (Phase 1B). Document the chosen provider's actual retention and training policy here before enabling.

---

## How Phase 1B and Phase 2 will plug in

- `/guide` and `/library` are not built. The crisis page is already static and account-free, as 1B requires.
- The Shopify Storefront client, `/shelf/[collection]`, `/product/[handle]`, and the full homepage are Phase 2. The homepage is intentionally minimal now.
- `public/sample-export.pdf` and `sample-export-*.png` are generated from synthetic data by `node scripts/make-sample-export.mjs` and are ready for the Phase 2 homepage "the export is the pitch" section.

---

## Repository map

```
supabase/migrations/      schema + RLS (apply in Supabase SQL editor)
supabase/local/           auth shim for plain Postgres (tests only)
src/app/                  routes (public pages, /app tracker, /api/stripe, /share, /invite)
src/components/ui/        Button, Chip, Field, Sheet, Toast, Logo
src/components/app/       tracker screens: LogSheet, EntryList, AppShell, settings/*
src/lib/                  auth, access, pro, data, export, entries/queue, billing, patterns
tests/rls, tests/unit, tests/e2e
tools/local-supabase/     dev-only Supabase stand-in
scripts/                  db reset, sample export
```
