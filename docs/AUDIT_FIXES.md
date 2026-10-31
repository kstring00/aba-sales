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

## Stage 2 — The catalog (F-01, F-11, F-14)

Most of F-01 already existed in the repo (Storefront client, `/products/[handle]`, cart, Shopify-hosted checkout, `/thanks`); the live site showed none of it because the Production environment has no Storefront credentials (O-8). This stage closes the gaps the audit named.

| ID | What changed | Files | Verified | Left for you |
| --- | --- | --- | --- | --- |
| F-01 | Production build fails loudly without `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_STOREFRONT_TOKEN`; `/shelf/:handle` 308-redirects to the built route `/products/:handle`; product page adds "Clinical review: pending", Product JSON-LD with `offers`, "Get it free" + "Checkout takes 30 seconds, no card needed" for $0 items and "Buy · $price" for paid; cart gets "Keep browsing"; homepage sheet caption links to Home ABC Printable when it is live; products render above coming-soon on both `/` and `/shelf` (Stage 1 model) | `src/lib/shopify/client.ts`, `next.config.ts`, `products/[handle]/page.tsx`, `AddToCart.tsx`, `cart/page.tsx`, `WhyItMatters.tsx`, `page.tsx` | Fixtures: every product reachable from `/`, `/shelf` and by URL; `/shelf/care-binder` → 308 → `/products/care-binder`; JSON-LD present; axe 0 on the product page | O-8: set the two variables in Vercel Production, redeploy, then open `/api/health/shopify` (expects `ok: true`, four handles). Token scopes: `unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`. The $0 add-to-cart → checkout redirect and axe on `/cart` with an item need the real token: run `node tests/e2e/live-checkout.mjs` against a Preview deployment (do not complete checkout). Confirm Shopify → Settings → Checkout → "continue shopping" URL is `https://www.thesupportshelf.org/thanks`. |
| F-11 | Search hidden until products + tracker ≥ 8 (component kept); empty state reads "Not on the shelf yet. The four shelves below hold everything that exists today." | `SiteHeader.tsx`, `ShelfSearch.tsx` | 0 search forms rendered | — |
| F-14 | `Content-Security-Policy` on every response (`default-src 'self'`, first-party scripts/styles with `'unsafe-inline'` because Next.js inline bootstrap and JSON-LD would otherwise need a per-request nonce and lose ISR, `img-src` self + cdn.shopify.com, `connect-src` self + the store domain, `frame-ancestors 'none'`, `form-action 'self'`, `object-src 'none'`); `poweredByHeader: false` | `next.config.ts` | Header present; `x-powered-by` gone; hero drawer, tracker, product and cart pages load with 0 console errors under the policy | If a third-party ever gets added (fonts, analytics, chat), extend the policy first |

Lighthouse mobile (local production build, simulated throttling): `/` 80 · `/shelf` 94 · `/products/care-binder` 90 performance; 100 accessibility / best practices / SEO on all three; CLS ≤ 0.006.

Stage 2 gate: build, typecheck, lint clean · axe 0 · pages pass · unit 33/33 · `/abc` journey 8/8.

## Stage 3 — ABC Tracker integrity and polish

| ID | What changed | Files | Verified | Left for you |
| --- | --- | --- | --- | --- |
| F-04 | One observation = one entry with `behaviorIds[]`. Storage moved to `support-shelf-abc-v2`; on first load a v1 blob is merged (rows sharing `occurredAt + antecedent + consequence + createdAt` become one observation), written as v2, the v1 key removed, and the merge count logged once. Counts in the PDF, CSV and on-page views are per observation; behaviors are listed within a row ("Hitting; Screaming"). PDF Counts header: "N observations · M behaviors noticed", with a note that behavior counts can exceed observations. CSV stays one row per observation with behaviors `; `-joined in `noticed` (simpler for a BCBA to scan; no second file). Sample data is six observations in one week, one with two behaviors. Edit sheet lets several behaviors be toggled on one observation. | `src/lib/abc/{types,store}.ts`, `src/lib/export/{report,pdf,fixtures}.ts`, `api/abc/email-export/route.ts`, `TrackerForm.tsx`, `LogSheet.tsx`, `EntryList.tsx`, `BcbaPreview.tsx`, `Tracker.tsx`, `public/sample-export*` | Audit test: nickname `Bean "Jr", Jr.`, Hitting + Screaming + custom `Covering ears "x", y; <b>z</b> 😀`, Not sure, Moderate, 1–5 min → **1** observation, 3 behaviors; CSV 8 rows for 8 observations with the first row listing all three behaviors; PDF renders; v1 key absent, v2 the only key; browser migration of a 2-row v1 blob → 1 observation; unit tests for merge and counts | — |
| F-09 | Entrance animation runs once on mount (verified: 0 `lib-settle` animations restart on click); selection animates only the chosen book and the drawer; reduced motion disables the keyframes, transforms and smooth scrolling (CSS) and the JS scrolls use `behavior: auto` | `globals.css`, `ShelfHero.tsx` | `getAnimations()` after a click; reduced-motion context | — |
| F-15 | Under 768px, tapping a book scrolls the drawer heading to the top of the viewport (69px from the top at 390px); each book carries `aria-expanded` | `ShelfHero.tsx` | Playwright at 390px | The shelf itself is not sticky; the reader scrolls up two thumbs to change book |
| F-17 | Edit sheet titled "Edit observation"; one duration control everywhere (the four ranges plus an exact-minutes field) | `LogSheet.tsx`, `TrackerForm.tsx`, `observation.ts` | Journey | — |
| F-18 | "Not sure" reflection omitted from exports; a free-text before/after stands alone with no "Something else:" prefix | `report.ts` | Unit test | — |
| F-19 | Waitlist and export email forms validate inline before submitting, announce through `aria-live`, replace themselves with "You're on the list" / "Sent — check your inbox", and show a retry message on failure | `EmailCapture.tsx`, `ExportPanel.tsx` | Journey (503 path without Resend) | Test the success path on a Preview deployment with Resend configured |
| F-20 | Unshapeable glyphs become `[emoji]` / `[symbol]` markers instead of vanishing; PDF language set to `en-US` | `pdf.ts` | Unit test with 😀 and ✨; journey PDF | — |
| F-21 | Focus returns to the entry button after the sheet closes (or to the list when the entry was deleted); toasts auto-dismiss at 5s; trailing punctuation trimmed in the save toast | `EntryList.tsx`, `Toast.tsx`, `TrackerForm.tsx` | Journey asserts the focused element | — |
| F-22 | Weekly table fades at its right edge and shows "Swipe sideways to see every column →" on phones | `BcbaPreview.tsx`, `globals.css` | Rendered | — |
| F-23 | Eyebrows, chips, pills and table headers ≥ 12px | `globals.css`, `BcbaPreview.tsx` | Rendered | Book imprint text on the covers is decorative (aria-hidden) and smaller by design |
| F-16 (lite) | "One child per browser for now. For a second child, use a different browser or profile." under the nickname | `TrackerForm.tsx` | Rendered | Follow-up: multi-child (array of children + switcher, per-child entries, export per child). Needs a v3 migration. |
| Primer | Three-line "A / B / C, write what you saw" block above the form; one-time "What to do next" card after the first save (export weekly, bring it to your BCBA, the tracker never interprets) | `Tracker.tsx` | Journey dismisses the card | — |

Stage 3 gate: build, typecheck, lint clean · unit 37/37 · `/abc` journey 8/8 · axe 0 on every route with an observation saved and the edit sheet open · 0 console errors on 8 routes.

## Stage 4 — Launch checklist

| Check | Result |
| --- | --- |
| Homepage says what / for whom within 5 s | Eyebrow "Real support for real family life", H1 "Practical support for every step of the autism journey.", lede names parents of kids in ABA therapy |
| One primary CTA per page, visually dominant | `/`: "Find my shelf" (terracotta) opens Shelf 1; "Browse all support" demoted to a text link. Product pages: "Get it free" / "Buy · $price". `/abc`: "Save entry". `/cart`: "Checkout". |
| Contact reachable from every page | Footer shows the mailbox as a `mailto:`; "Contact" → `/about#contact` |
| Mobile 375 and 768, every route | `tests/e2e/shots/launch/{375,768}-*.png` (10 routes each); no horizontal overflow; no tappable element under 44px (skip link excluded) |
| Speed | Lighthouse mobile, local production build: `/` 91 · `/shelf` 94 · `/abc` 89 · `/products/care-binder` 95 performance; 100 accessibility / best practices / SEO on all four; CLS ≤ 0.006. Product images come from the Shopify CDN through `next/image` with `sizes` set. |
| Credibility | Founder photo slot hidden until `NEXT_PUBLIC_FOUNDER_PHOTO` is set; "Registered Behavior Technician since 2023 · BACB registry"; privacy link in the footer; © 2026 computed; `grep -riE "lorem|TODO|placeholder text|localhost" src public` → only a code comment in `env.ts`. No testimonials (none exist). |
| Search | Unique `<title>` and description per page; one H1 per page (`tests/e2e/pages.mjs`); every image has alt text (product images use the product title); favicon and `og:image` (`https://www.thesupportshelf.org/og.png`) in the rendered head; sitemap lists the six public routes plus every product page. |
| Plumbing | `scripts/link-check.mjs`: all 12 internal links resolve. 404 page present. External links (988lifeline.org, childhelphotline.org, bacb.com) cannot be fetched from the build environment: check once in a browser. Waitlist and export email success paths need a Preview deployment with Resend configured. |
| Handoff | This file; operator actions at the top |

### Still open for you

| # | Item |
| --- | --- |
| O-9 | Collect the first three parent quotes (with permission) before adding any testimonial block. Nothing is fabricated in the meantime. |
| O-10 | Click the three external links once from a browser (they could not be fetched here). |
| O-11 | Run `node tests/e2e/live-checkout.mjs` and `node tests/e2e/live-email.mjs` against a Preview deployment with the Shopify and Resend variables set; do not complete a checkout. |
| O-12 | Follow-up feature: multi-child tracker (per-child entries and exports, a switcher, v3 migration). Logged, not built. |

### Three things to fix next, with another day

1. A real "share with your BCBA" step after export: a one-tap mail/share sheet with the PDF attached and a short "what to bring to the meeting" summary.
2. Product pages with a real spread of each printable (three gallery images per product in Shopify) and the first-sentence "who it's for" pulled from the description once the descriptions are final.
3. Three plain-language guides ("What is ABC data and what should I write down?", "What happens after a diagnosis?", "How to read an ABA treatment plan"), each ending on the tool that helps, to give search something to rank.
