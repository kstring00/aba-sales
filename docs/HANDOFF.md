# Handoff — The Support Shelf

Everything a new maintainer (or you in six months) needs, in one file. Last updated for Phase 2.

## 1. Accounts

| Service | Used for | Login / where |
| --- | --- | --- |
| **GitHub** `kstring00/aba-sales` | source code; `main` is production | github.com |
| **Vercel** | hosting (free tier, `*.vercel.app`) | vercel.com, project imported from the GitHub repo; production deploys from `main` |
| **Shopify** `vgb9f2-eg.myshopify.com` (Basic plan) | products, cart, checkout, delivery via Digital Products app | admin.shopify.com |
| **Resend** | sends "Email me my export", holds the email list (Audience) | resend.com |
| **Google Fonts** (no account) | Fraunces + Inter via `next/font`; TTF copies in `public/fonts` for PDFs (OFL) | — |

No database, no auth provider, no analytics, no payment processor of our own.

## 2. Environment variables (Vercel → Settings → Environment Variables)

| Variable | Value / where to get it | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-app>.vercel.app` (no trailing slash) | yes |
| `SHOPIFY_STORE_DOMAIN` | `vgb9f2-eg.myshopify.com` | yes |
| `SHOPIFY_STOREFRONT_TOKEN` | Shopify admin → Sales channels → Headless → your storefront → Storefront API → Public access token | yes |
| `SHOPIFY_API_VERSION` | `2025-10` (update yearly; see Shopify release notes) | default in code |
| `RESEND_API_KEY` | Resend → API keys, **Full access** (contacts need it) | for email export + list |
| `RESEND_FROM` | `"The Support Shelf <hello@yourdomain>"` on a verified domain; until then `onboarding@resend.dev` (delivers only to your own Resend email) | for email export |
| `RESEND_SEGMENT_ID` | Resend → Audience → Segments → the list's segment ID | for the list; without it, shelf sign-ups say the list isn't open yet and exports still send |
| `NEXT_PUBLIC_CONTACT_EMAIL` | the address shown in the footer; also Reply-To on every email | yes |
| `NEXT_PUBLIC_CONTACT_PHONE` | the phone shown in the footer | optional |

Local development: copy `.env.example` to `.env.local` and fill the same names.

## 3. Shopify admin settings that matter

- **Sales channels → Headless**: installed; one storefront whose public token the site uses. The app reads only through the Storefront API and never calls the Admin API.
- **Online Store**: password-protected and unused. Products should **not** be published to it.
- **Products**: appear on the site only when **Active** and published to **Headless**. Shelf membership is by tag: `family-shelf`, `clinic-shelf` (smart collections `the-family-shelf`, `the-clinic-shelf`; `the-interactive-shelf` exists but is hidden on the site). Current products: `home-abc-printable` ($0), `waitlist-playbook` ($0), `care-binder` ($14.99), `read-your-childs-treatment-plan` ($9.99), all Family.
- **Collections**: both shelf collections must also be published to Headless.
- **Digital Products app**: attaches files and emails download links after purchase. The site never handles delivery.
- **Settings → Checkout**: order-status page "continue shopping" link → `https://<your-app>.vercel.app/thanks`.
- **Settings → Payments**: test mode on until launch. Turn it off to take real payments.
- **Product page content**: the site reads the description, and if present the metafields `custom.benefit`, `custom.format`, `custom.included` (expose them to the Storefront API in Settings → Custom data → Products → the definition → Storefront access).

Settings changed during the build: the three `TEST —` products created by the connector were deleted by the founder; nothing else was changed through the connector.

### Shelf tags (add in Shopify admin → Products → Tags)
| Product | Tag |
| --- | --- |
| care-binder, home-abc-printable | `shelf-organized` |
| read-your-childs-treatment-plan, waitlist-playbook | `shelf-plan` |
| future routine / visual tools | `shelf-everyday` |
| future home-support items | `shelf-home` |

Until the tags exist the handles above are mapped in `src/lib/shelves.ts`. A new product with no tag and an unknown handle appears under "Also on the shelf" on `/shelf` so it is never hidden.

## 4. Resend settings

- API key with sending access.
- Audience for the email list (sign-ups from the shelf, home, and the "keep me posted" box on `/abc`).
- **Verified domain** required to email anyone other than the account owner. Add the DNS records Resend shows, then set `RESEND_FROM`.

### If the live shelves are empty
Open `https://<your-deployment>/api/health/shopify`. It returns no secrets, only: whether the domain and token are set in that environment, which kind of token it is, whether Shopify answered, and the product handles each collection returns. A 401/403 means the token was rejected (copy it again from Sales channels → Headless → Manage → Storefront API; both the public and the private token work). "not set for this environment" means the variable is missing for Production in Vercel. Redeploy after any change.

## 5. Deploy and operate

- Push to `main` → Vercel deploys production. Preview deploys for branches.
- Shopify edits (prices, descriptions, new products) appear within 5 minutes (ISR), no redeploy needed. Product pages are also pre-rendered at build.
- To force a refresh immediately: Vercel → Deployments → Redeploy.
- Logs: Vercel → Functions. The only server logs are `[abc-export] failed: <error text>`; no entry content is ever logged.

## 6. Where things live in the code

```
src/app/                 pages: /, /shelf, /products/[handle], /cart, /thanks, /abc, /about, /privacy, /crisis, not-found
src/app/api/abc/email-export/route.ts   the one server route
src/app/cart/actions.ts  add / update / remove / checkout (redirects to Shopify)
src/lib/shopify/         Storefront client, GraphQL, normalizers, catalog, cart cookie
src/lib/shelves.ts       the four shelves: tag → shelf mapping with handle fallback
src/lib/resources.ts     one sentence per product, who it may help, which paper object
src/components/illustrations/Paper.tsx   every illustration (inline SVG, token colors)
src/components/home/     ShelfHero (binders + drawer, client), DrawerPanel (server), WhyItMatters, ClosingCta
src/lib/drawer.ts        drawer model: live products → built-in tool → coming-soon fillers (max 4)
src/content/shelf-drawer.ts   lead lines, checklists, the ABC tool card, coming-soon items per shelf
reference/shelf-demo.html     the approved interaction target for the hero
src/components/abc/      Tracker (page body), TrackerForm, BcbaPreview (live table + exports), Explainers, EntryList, LogSheet (edit), Views
src/lib/abc/             localStorage store (v2, observations with behaviorIds[]; v1 merged on load), hook, views, types
src/lib/export/          report → PDF (pdf-lib + brand fonts) and CSV
src/lib/observation.ts   the exact antecedent / consequence wording
src/app/globals.css      every design token
tests/unit               vitest; tests/e2e  Playwright scripts (see README)
```

## 6b. Audit remediation
`docs/AUDIT_FIXES.md` is the finding-by-finding log from the Oct 2026 site audit, including the operator actions (env vars, Shopify and Vercel settings) that only you can do.

## 7. Checks to run before any public launch

See the Phase 2 report in `docs/LAUNCH-CHECK.md`. Reviews that still need a human: legal (privacy page), BCBA (chip wording, product copy, "reviewed by" name), safeguarding (crisis page).
