# Launch-readiness check — Phase 2

Pass/fail against the checklist in the build prompt. "Local" means verified against a production build on this machine; "Live" means verified on the Vercel deployment. Nothing is public.

## Message
| Check | Result | How verified |
| --- | --- | --- |
| Home says what, for whom, and shows one CTA within 5 seconds | Pass | Eyebrow "For parents and caregivers of kids in ABA therapy", H1 "Thoughtfully made tools for the people who care", one clay button "Browse the shelf" above the fold at 375px |
| One dominant CTA per page | Pass | Clay used once per page: Browse the shelf (home), Add to cart (product), Checkout (cart), Log what happened (/abc), Try the logger (/thanks), Browse the shelf (/about) |
| Product page answers "what do I get?" | Pass (content pending) | Format + what's included block, "delivered by email in under a minute"; reads metafields or falls back to the description |
| Product page credential line | Pass (name pending) | "Written by an RBT with three years in-clinic. Reviewed by a BCBA (name to come)" |
| /abc first line: nothing leaves your phone | Pass | Asserted by `tests/e2e/abc.mjs` |
| /abc sample export above the fold | Pass (desktop) / Pass-scrolls (mobile) | Sample PDF image in the right column; on phones it follows the logger |
| /abc "records what happened, never tells you what to do" | Pass | On the page and in the PDF counts caption |
| /thanks says check your email, links to /abc | Pass | `tests/e2e/pages.mjs` |
| Phone and email in footer on every page | Pass (values pending) | Reads `NEXT_PUBLIC_CONTACT_EMAIL` / `_PHONE` |

## Mobile
| Check | Result | How verified |
| --- | --- | --- |
| No horizontal overflow at 375px, every page | Pass | `pages.mjs` measures scrollWidth |
| Readable without zoom | Pass | 17px base, 16px form controls (prevents iOS zoom) |
| 44px tap targets | Pass | axe pass + custom check; only the 24px checkbox is smaller (its label is the tap area) |
| Sticky add-to-cart on product pages | Pass | Mobile-only bar |

## Speed
| Check | Result | How verified |
| --- | --- | --- |
| next/image everywhere | Pass | Product cards, gallery, cart thumbnails, sample export |
| Lighthouse mobile ≥ 80 on /, /abc, /shelf | Pass: 100 / 100 / 98 | Lighthouse 12, simulated mobile, local production build; /shelf measured in its empty state |
| PDF engine loaded only on export | Pass | Dynamic import in ExportPanel |

## Accessibility
| Check | Result | How verified |
| --- | --- | --- |
| axe-core WCAG 2.1 AA, every page incl. open logging sheet | Pass, 0 serious/critical, 0 minor | `tests/e2e/a11y.mjs` |
| Contrast | Pass | Tokens darkened: ink-mute 5.8:1, sage-deep 5.2:1, paper on clay 4.8:1 |
| Keyboard: sheet traps focus, Escape closes, focus returns | Pass | Sheet component; manual |
| Lighthouse accessibility | 100 / 100 / 100 | |

## Credibility and search
| Check | Result |
| --- | --- |
| `grep -ri lorem` | 0 results |
| Current copyright year | Pass (dynamic) |
| Privacy link in footer; privacy says logger stores nothing on our servers | Pass |
| One H1 per page, unique title + description | Pass (`pages.mjs`) |
| Alt text on every image | Pass (axe `image-alt`) |
| Favicon + OG image | Pass |
| sitemap.xml (includes product handles), robots.txt | Pass; /cart, /thanks, /api disallowed |
| Styled 404 | Pass |

## Commerce and /abc
| Check | Result |
| --- | --- |
| Cart → Shopify checkout → /thanks, live, test mode | **Pending live run** (`tests/e2e/live-checkout.mjs`); requires Shopify Payments test mode and the /thanks continue link |
| Email export delivered through Resend | **Pending live run** (`tests/e2e/live-email.mjs`) |
| /abc: log 10 entries, export both formats, email flow, clear and confirm | Pass locally (`abc.mjs`), email flow verified for its no-Resend path |
| Empty Clinic shelf shows "coming soon" with email capture | Pass |
| Tests: export formatting, chip data model, cart handoff | Pass, 19 unit tests |

## Still needs a human
Legal review of /privacy · BCBA review of wording and the "reviewed by" name · safeguarding review of /crisis · Resend verified domain · founder photo.

## Redesign QA (creative direction build)

| Check | Result |
| --- | --- |
| Unit tests (adds resource-finder matching and copy guardrails) | 24 of 24 |
| Pages at 375px/1280px incl. `/products/care-binder` (fixtures): one H1, titles, no overflow, every link | pass |
| axe-core WCAG 2.1 AA, every page, with the finder, demo, and logging sheet open | 0 violations |
| Lighthouse mobile `/`, `/abc`, `/shelf` | 94 / 99 / 98 |
| `/abc` journey unchanged (setup, 10 entries, views, PDF+CSV, email path, delete) | 7 of 7 |
| Reduced motion: reveals, lifts, page turn disabled via `prefers-reduced-motion` | pass (CSS) |
| Keyboard: finder tabs, binder tabs and arrow keys, demo chips, sheet focus trap | pass (manual) |
| Honest availability: planned categories render "Not yet"; empty Clinic shelf "Coming soon"; no concept product is purchasable | pass |
| No fabricated proof: no testimonials, counts, endorsements; clinical review shown as pending | pass |

## Bright shelf QA (`/shelf` reimagining)

| Check | Result |
| --- | --- |
| Pages at 375px/1280px, all routes incl. `/shelf` and a product page | pass, no overflow |
| axe-core WCAG 2.1 AA on `/shelf` (coral button text, small labels, upcoming list fixed) | 0 violations after fixes |
| Lighthouse mobile `/shelf` | 99 / 100 / 100 / 100 |
| `/abc` journey unchanged | 7 of 7 |
| Hover/focus lifts, hero float, reveals disabled under `prefers-reduced-motion` | pass (CSS) |
| Products shown only from the Storefront API; upcoming items listed without dates or purchase paths | pass |
| Real tool screenshot (synthetic nickname) in the logger section; no stock or generated people | pass |

## Homepage & shelf rebuild QA (mockup build)

| Check | Result |
| --- | --- |
| Five-second test on the hero at 375px: kicker, audience line, one terracotta CTA above the fold | pass (screenshot `tests/e2e/shots/rebuild/375-home-fold.png`) |
| One H1 per page, titles, no overflow at 375px and 1280px, every internal link resolves | pass (`pages.mjs`, 10 routes × 2 widths) |
| One dominant CTA per section: Find my shelf (hero), Explore this shelf (active panel), Find my shelf (closing); product cards use outlined pills | pass |
| `grep -ri lorem` and placeholder text/images | 0 results; no raster images on `/` or `/shelf` |
| axe-core WCAG 2.1 AA, every page, with shelf tabs changed, search opened, and the logging sheet open | 0 violations |
| Lighthouse mobile `/` · `/shelf` · `/products/care-binder` | 93 · 94 · 95 performance; 100 accessibility, best practices, SEO (CLS 0.02 / 0 / 0 after metric-tuned font fallbacks) |
| Unit tests (shelf mapping by tag and handle, unshelved products kept, copy guardrails) | 25 of 25 |
| `/abc` journey unchanged | 7 of 7 |
| No invented products, testimonials, sign-in, or counts; prices from Shopify ($0 shows as Free) | pass |
| Boundary line on every page: "These tools record and organize. Your BCBA writes the plan." | footer + product page |

## Shelf personality pass

| Check | Result |
| --- | --- |
| Pages 375/1280, axe, unit tests, `/abc` journey | all pass (unchanged) |
| Lighthouse mobile `/` after adding per-shelf scenes, layered cards, thick board | 91–94 perf (scene rendered only for the open panel), 100 a11y/BP/SEO, CLS 0.02 |
| Last shelf loops with "Back to the first shelf" instead of "Next up" | pass (`tests/e2e/shots/rebuild/1280-shelves-4.png`) |
