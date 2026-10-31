# Audit remediation log

Source: `docs/FULL_SITE_AUDIT.md` (Oct 30–31, 2026). Plan: `docs/AUDIT_REMEDIATION_PROMPT.md`. One row per finding; "Left for you" is the handoff.

## Operator actions (things only you can do)

| # | Where | What | Value / notes |
| --- | --- | --- | --- |
| O-1 | Vercel → Settings → Environment Variables | `NEXT_PUBLIC_SITE_URL` for **Production** and **Preview** | `https://www.thesupportshelf.org` (Preview: the preview URL, or the same). The production build now fails with a clear message if it is missing or contains `localhost` (F-02). |
| O-2 | Vercel → Domains | www is canonical; non-www must 301 to www | Add both `thesupportshelf.org` and `www.thesupportshelf.org`; set `www` as the primary so Vercel redirects the apex. Verify with `curl -I https://thesupportshelf.org` → `308/301` to www. |
| O-3 | Google Search Console | Resubmit `https://www.thesupportshelf.org/sitemap.xml` after the deploy | Also re-scrape with the Facebook/LinkedIn sharing debuggers so `og:image` refreshes. |
| O-4 | `NEXT_PUBLIC_CONTACT_EMAIL` (optional) | Contact mailbox shown in the footer, /about, /privacy, /thanks | Defaults to `kyle@stringhamwebdesign.com` (DECIDE item: switch to a `@thesupportshelf.org` mailbox when one exists). |
| O-5 | `NEXT_PUBLIC_FOUNDER_PHOTO` (optional) | Founder photo on /about | Drop a file in `public/` (e.g. `/founder.jpg`, square, ≥ 320px) and set the var to its path. Until then the slot renders nothing. |
| O-6 | `/about` credential line | BACB certification number | Omitted (DECIDE). Confirm the registry link `https://www.bacb.com/services/o.php?page=101135` resolves to the certificant registry; it could not be fetched from the build environment. |
| O-7 | Production console | F-26: one resource 404s on load in production | Not reproducible locally (0 non-2xx responses on `/`, `/abc`, `/cart`). After deploy, open DevTools → Network on `/` and note the URL; it is likely environment-specific (e.g. an old cached asset). |
| O-8 | Vercel → Environment Variables | `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN` for Production | See Stage 2. `/api/health/shopify` on the deployment reports the state without secrets. |

## Stage 1 — Trust, metadata, navigation

| ID | What changed | Files | Verified | Left for you |
| --- | --- | --- | --- | --- |
| F-02 | `metadataBase` from `NEXT_PUBLIC_SITE_URL`; sitemap, robots, canonical and og:image share it; production build throws if missing or localhost | `src/lib/env.ts`, `src/app/layout.tsx` (existing sitemap/robots already read `publicEnv.siteUrl`) | Local build with the www URL: 0 `localhost` matches in sitemap, robots, canonical, og:image | O-1, O-2, O-3 |
| F-03 | Contact mailbox always present (default + env override); footer shows the address and "Contact" → `/about#contact`; /about has a Contact section; /privacy and /thanks link the address; phone removed everywhere | `src/lib/env.ts`, `SiteFooter.tsx`, `about/page.tsx`, `privacy/page.tsx`, `thanks/page.tsx` | Rendered pages contain the `mailto:` | O-4 |
| F-08 | Privacy: "Last updated" + version, lawyer line replaced, export pipeline described step by step (sent once → PDF on server → Resend → discarded; address kept to send, plus notices only if ticked; unsubscribe), shopping section accurate to $0 checkouts, contact fixed | `src/app/privacy/page.tsx` | Read-through | Update `LAST_UPDATED` whenever the text changes |
| F-05 | Export newsletter checkbox unchecked by default and labelled with `<label htmlFor>` | `src/components/abc/ExportPanel.tsx` | axe clean; `/abc` journey 8/8 | — |
| F-06 | Header shows About, Shelves and ABC tracker at every width; "How it works" hidden below `sm`; search is an expanding icon and is gated (see F-11); wordmark and cart tightened for phones | `SiteHeader.tsx`, `Logo.tsx`, `CartBadge.tsx` | 375px: scrollWidth 375, four links each 47px tall; 768px: five links | — |
| F-07 | One shelf data source: `/shelf` renders `buildDrawer()` exactly like the homepage drawer (same one-liners from `SHELVES.blurb`, same `lead`, same cards); ABC Tracker on Shelf 1 only; Shelf 4's tool removed | `src/lib/shelves.ts`, `src/lib/drawer.ts`, `src/app/shelf/page.tsx`, `src/components/home/DrawerCards.tsx`, `DrawerPanel.tsx` | Unit test asserts `/abc` appears on Shelf 1 only | — |
| F-12 | Coming-soon capped at 3 per shelf (`COMING_SOON_CAP`); coming-soon cards have no button or link; one "Tell me first" form per shelf on `/shelf` | `src/lib/drawer.ts`, `DrawerCards.tsx`, `shelf/page.tsx` | Unit test; page checks | Content for removed items stays in `src/content/shelf-drawer.ts` |
| F-10 | `datetime-local` default is empty on the server and set after mount | `src/components/abc/TrackerForm.tsx` | 0 console errors/warnings on fresh loads of `/`, `/abc`, `/cart`, `/shelf` | — |
| F-13 | Founder note says "Since becoming a Registered Behavior Technician in 2023"; credential line "Registered Behavior Technician since 2023 · BACB registry"; photo slot renders only when `NEXT_PUBLIC_FOUNDER_PHOTO` is set; "Clinical review: pending" stated in neutral language | `about/page.tsx`, `src/components/site/FounderPhoto.tsx` | Rendered | O-5, O-6 |
| F-26 | Not reproducible locally | — | 0 non-2xx responses on `/`, `/abc`, `/cart` | O-7 |
| F-27 | "stores nothing on our servers" removed from the global footer; stays on `/abc` and `/privacy` | `SiteFooter.tsx` | Rendered | — |
| F-25 | 988lifeline.org and childhelphotline.org are links (`target=_blank rel=noopener`) | `crisis/page.tsx` | Rendered | — |
| F-24 | Canonical per page via `alternates.canonical: "./"`; Organization + WebSite JSON-LD in the root layout (no `sameAs`: no verified profiles) | `layout.tsx` | `/` and `/about` heads carry the right canonical; JSON-LD present | Add `sameAs` when real profiles exist |
| F-11 (early) | Header search hidden until products + tracker ≥ 8; component kept | `SiteHeader.tsx` | 0 search forms rendered with 4 products | — |
| F-23 (part) | Eyebrows, chips and status pills raised to 12px | `globals.css` | — | Rest in Stage 3 |
| — | "Coming soon"/"Free" pill green deepened to pass AA (4.2 → 5.3:1) | `globals.css` | axe clean | — |

Stage 1 gate: `next build`, typecheck, lint clean · axe 0 on all routes · pages 375/1280 pass · unit 33/33 · `/abc` journey 8/8 · screenshots `tests/e2e/shots/rebuild/375-stage1-home.png`, `768-stage1-home.png`.
