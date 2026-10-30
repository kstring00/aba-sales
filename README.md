# The Support Shelf

*Thoughtfully made tools for the people who care.*

One Next.js site on Vercel: a storefront for digital downloads (Shopify as a headless backend, Shopify-hosted checkout) with one built-in free tool, the ABC observation logger at `/abc`. The store is the product. The logger is a feature of the store.

**Status: Phase 1 built and locally verified. Not deployed. Not public.** Phase 2 (launch-readiness checks, accessibility pass, handoff doc) is next.

## Architecture, one sentence each

- **Next.js 16 App Router + TypeScript + Tailwind v4**, with design tokens in one CSS file (`src/app/globals.css`). `cacheComponents` is off so caching is explicit.
- **Shopify Storefront API only** (`src/lib/shopify`): reads collections and products with ISR (5 minutes), creates and edits a cart with Storefront cart mutations, and hands off to `cart.checkoutUrl`. The Admin API is never called from the app.
- **The ABC logger has no backend** (`src/lib/abc`): one localStorage key holds the nickname, labels, and entries; PDF and CSV are generated in the browser from the same code that renders the sample export.
- **"Email me my export"** is the one server route (`/api/abc/email-export`): entries arrive in the request, become a PDF, go out through Resend, and are discarded. The email list is a Resend Audience, because tagging a Shopify customer needs the Admin API.
- **No accounts, no database, no analytics, no service worker.**

## Design system and the redesign

The experience direction, audit, and principles are in `docs/CREATIVE-DIRECTION.md`; the photography plan and asset manifest in `docs/ASSETS.md` (source of truth: `src/lib/assets.ts`, where filling `src` swaps a designed placeholder for the real image).

- Tokens live in `src/app/globals.css`: Warm Paper, Forest Ink, Deep Charcoal body text, Soft Sage, Powder Blue and Lavender tints (backgrounds only), Terracotta for the one primary action per page. All text pairs pass WCAG AA.
- Type: Fraunces (headlines, one italic phrase per page), DM Sans (everything a parent reads to act), Caveat (one handwritten line per page, never instructions).
- Materials: `.grain` (paper), `.linen` (quiet bands), warm forest-tinted shadows, an oak shelf edge under products.
- Motion: `.reveal` (one 600ms rise), 2px lifts, the bottom sheet's spring, the binder's page turn. `prefers-reduced-motion` removes all of it.
- The homepage is eight sections keyed off the live catalog: Welcome → We see the work → Finder → Living Shelf → ABC demo → Support beyond files → Founder → Closing. `src/lib/resources.ts` maps needs to real products and carries the "who it may help / which task" framing; it never creates inventory.

**Local design review without a Storefront token:** set `SHOPIFY_FIXTURES=1` in `.env.local`. The four real products appear by handle and price with no invented contents. Ignored whenever a real token is set and always on Vercel.

## Pages

`/` · `/shelf` · `/products/[handle]` · `/cart` · `/thanks` · `/abc` · `/about` · `/privacy` · `/crisis` · 404. Phone and email are in the footer on every page (set `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_CONTACT_PHONE`).

## Environment

Copy `.env.example` to `.env.local`. All variables are documented there.

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | metadata, sitemap |
| `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_API_VERSION` | the shelf, product pages, cart |
| `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_AUDIENCE_ID` | email export and the email list |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE` | footer |

Without the Shopify variables the shelf shows its "being stocked" state with email capture. Without Resend, the export email button explains it isn't switched on; downloads still work.

## Shopify setup (one-time, in Shopify admin)

The app reads products through the **Headless** sales channel, which gives a public Storefront access token. Products appear only when they are **Active** and published to that channel.

1. Shopify admin → **Sales channels** → **+** → search **Headless** → Add. Then **Headless → Create storefront**, name it "Support Shelf site".
2. In that storefront, open **Storefront API** → copy the **Public access token** into `SHOPIFY_STOREFRONT_TOKEN`. Make sure read access covers products, collections, and cart (the defaults do).
3. **Products**: for each product you want on the site, open it → **Sales channels and apps** (right sidebar) → **Manage** → tick **Headless** (leave **Online Store** unticked) → set status **Active**. The three `TEST —` products are Draft and unpublished; do this for them to test.
4. **Collections**: open **The Family Shelf** and **The Clinic Shelf** → **Manage** sales channels → tick **Headless**. (Products land in them automatically by tag: `family-shelf`, `clinic-shelf`.)
5. **Checkout** → **Settings → Checkout → Order status page**: set "Continue shopping" / return URL to `https://<your-site>/thanks`.
6. Keep the **Online Store** password-protected; nothing in this app depends on it.

Product page details come from the description. If you add metafields `custom.benefit` (one line), `custom.format` (one line), and `custom.included` (one item per line) and expose them to the Storefront API, the page uses those instead.

## Resend setup

1. Create a free Resend account and an API key → `RESEND_API_KEY`.
2. Optionally create an **Audience** → `RESEND_AUDIENCE_ID` (email list sign-ups and "keep me posted" go here).
3. Until you **verify a sending domain** in Resend, `onboarding@resend.dev` can only deliver to your own Resend account email. Verify a domain (a subdomain of one you already own works), then set `RESEND_FROM` to an address on it.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests: export formatting, chip data model, store, cart handoff (18)
npm run build && npm start -p 3100
node tests/e2e/abc.mjs    # /abc journey: setup, 10 entries, views, PDF+CSV downloads, email flow, delete
node tests/e2e/pages.mjs  # every page at 375px and 1280px, one H1, no overflow, every internal link
```

## Deploy to Vercel (free tier)

Import the repo, add the environment variables, deploy. The PDF fonts live in `public/fonts` and are traced into the email route by `next.config.ts`.

## Hard rules this code follows

- Observation only: no function inference, no advice, no diagnosis, anywhere, including PDF captions.
- The logger stores nothing on our servers; the privacy page says so plainly.
- Storefront API read-only plus cart mutations; checkout is Shopify's.
- Test mode everywhere; nothing here publishes a product, buys a domain, or incurs a charge.
