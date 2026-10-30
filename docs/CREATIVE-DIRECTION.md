# Creative direction — The Support Shelf

## Audit (what exists, what to keep, where it fell short)

**Stack.** Next.js 16 App Router, TypeScript, Tailwind v4, one token file (`src/app/globals.css`), `next/font`. Shopify Storefront API for the shelf (read + cart), Shopify-hosted checkout, `/thanks`. The ABC logger is localStorage-only with browser-built PDF/CSV; one server route emails an export via Resend. No accounts, database, analytics, or service worker. Tests: 19 unit, Playwright journeys for `/abc` and all pages, axe pass, Lighthouse 98–100.

**Must be preserved.** The logger's privacy model and exports; the exact antecedent/consequence wording; Storefront-only commerce; honest availability (only published products appear); the crisis page as resources only; AA contrast; no fabricated proof.

**What worked.** Calm, one action per page, typographic restraint, the logger's three-tap flow, the export as the pitch.

**Where it failed the brief.** The homepage read as a competent product page, not a place: no recognition before the pitch, a flat three-card pattern, a sample-export image as the only "photo," no way to arrive by need rather than by catalog. Product cards said what, not who-for or which task. The shelf metaphor was a thin rule, not a room. Nothing acknowledged that support also comes from people.

**Inventory reality.** Four real products, all on the Family shelf: `home-abc-printable` (free), `waitlist-playbook` (free), `care-binder` ($14.99), `read-your-childs-treatment-plan` ($9.99). Clinic shelf is empty. Everything on the site keys off what the Storefront API returns; concept products are never rendered as purchasable.

## Three directions, evaluated

| | A · The Warmest Room | B · The Everyday Archive | C · A Light Left On |
| --- | --- | --- | --- |
| Emotional connection | Highest | Medium | High |
| Distinctiveness | High (needs real photography) | High (works with paper objects alone) | Medium |
| Product discoverability | Medium | Highest | Medium |
| Trust | High | High | High |
| Mobile performance | Needs careful image art direction | Light | Light |
| Cost / maintenance | Photography budget | Low | Low |

**Chosen: one direction, "The Warmest Room," built from "The Everyday Archive."** The emotional register of A, the tactile product handling of B, and the lighting and pace of C. In practice: warm paper and forest ink; photography slots art-directed for documentary home moments; products handled as paper objects on a wooden shelf; a handwritten line, once per page; motion limited to a soft reveal and the lifting of a paper object.

Because no licensed photography exists yet, every photo slot is a designed placeholder with its brief, crop, and alt-text strategy attached (see `docs/ASSETS.md`). Nothing waits on photography to function.

## Principles

1. Recognition before the pitch. The first screen names the load without claiming to know it.
2. Honest inventory. Available, free, planned, and "not yet" are visually distinct and never blurred.
3. The child is a person. No deficit framing, no "fix," no before/after.
4. One action per page in terracotta. Everything else is paper and ink.
5. Paper, not cards. Objects sit on a shelf; sections have their own shape.
6. Motion is physical and optional: a reveal, a lift, a page turn. Reduced motion removes all of it.
7. Beauty is the absence of friction: 17–18px text, 44px targets, visible focus, no hover-only paths.

## Tokens (final)

Paper `#F7F3EB` · page `#FFFDF8` · Forest Ink `#283E35` (headings, UI) · Deep Charcoal `#252A27` (body) · muted `#55625A` · Soft Sage `#A5B7A1` (selected states; tint `#E3EADF`) · Powder Blue tint `#DCE8EC` and Lavender tint `#E6E0EC` (category backgrounds only) · Terracotta action `#9E5234` (5.1:1 with paper text; `#C87555` decorative only) · oak `#B98F6A`.

Type: Fraunces (opsz 144, SOFT 30) for headlines and one italic phrase per page; DM Sans 17/18px, 1.6 line-height, 68ch measure, for everything a parent reads to act; Caveat for at most one handwritten line per page, never for instructions or data.

Materials: paper grain (SVG noise, 35% multiply) on large paper surfaces; linen weave on quiet bands; warm forest-tinted shadows; a wooden shelf edge under products.

Interaction standards: 200ms fades; 2px lifts; a 600ms reveal once per element; the bottom sheet's spring; `prefers-reduced-motion` removes all transforms and animations; nothing autoplays, loops, or hijacks scroll.
