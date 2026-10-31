# Creative direction — The Support Shelf

## Current direction: a botanical library (this build)

Warm ivory walls, deep botanical green used sparingly for headings and emphasis, sage and eucalyptus for accents, coral/terracotta for the one warm action, honey for highlights. The homepage hero is a CSS-3D bookshelf: four hardcover books (cover, spine, page block, top edge) on a crafted wooden plank with cheeks and contact shadows. Hover or focus slides a book forward; click pulls it out and unfolds a drawer beneath. Books: dusty blue, botanical sage, golden ochre, muted terracotta. Three.js was considered and declined: CSS 3D gives the depth and lighting without a WebGL bundle, text stays crisp, and there is nothing to fall back from. Dark mode was removed; the site is always light. Fallback fonts are metric-matched (roman and italic separately) so headlines keep their line count while fonts load.


This supersedes the earlier "Warmest Room" and "Brighter Kind of Support" directions. The target is the homepage mockup supplied with the rebuild brief; this document records what was built and why.

## The idea

The shelf does the heavy lifting. A parent arrives, reads one honest headline, and picks the shelf that matches today: Get Organized, Make a Plan, Everyday Life, or Support at Home. Each shelf is a tinted panel holding a few paper objects, one sentence each, price shown plainly. Nothing is invented: the four shelves hold the four products that exist in Shopify and the free ABC logger; the empty shelf says so and takes an email.

## Conversion

- Primary: open a shelf → click through to a product or the free logger.
- Secondary: on an empty shelf, leave an email.
- Objections answered where they arise: "Is this for me?" (kicker and audience line in the hero), "What is this actually?" (one sentence and price on each card), "Who made this?" (RBT line in Why it matters, no clinical claims), "Is this telling me how to parent?" (boundary line in the footer and on every product page).

## Palette and type

Warm cream `#FBF7F0` walls; deep forest ink `#1F3A3A` for headings and body; shelf tints sky `#D9EBF5`, mint `#D7EEDC`, butter `#FBEDC8`, blush `#F9DAD3` (backgrounds only, each with a deep partner for icons and small labels on white); sage leaves; a soft sun; pale aqua wave dividers. Terracotta is the single primary action per section: `#B25A3F` on text-bearing buttons (white text 4.7:1), the brief's `#C96A4E` for rules, arrows and large marks. Secondary actions are outlined ink.

Fraunces for headlines (opsz 144), the emphasized word in italic; Inter for everything a parent reads to act; Caveat only for handwriting inside illustrations (the pinned note, the mug, the sample entry).

## Illustration

Everything is inline SVG in `src/components/illustrations/Paper.tsx`, colored from tokens: paper folders, a ring binder, a checklist, a calendar, a sun, people, leaves, a mug, a pinned note, the hero shelf scene, the sample log sheet, and the wave dividers. Soft shading is a second, darker shape; no outline heavier than 1px. No stock, no AI people, no raster images.

## Sections, in order

1. Nav: leaf wordmark · About · How it works · Shelves · search · cart. No sign-in (there are no accounts).
2. Hero: "Real support for real family life" · "You don't have to find everything *all at once*." · audience line · Find my shelf (scrolls to the shelves) · Browse all support (`/shelf`) · three trust marks · the shelf scene.
3. Explore the shelves: "What kind of support do you need *today*?" Four tabs on a wooden board, swipeable with a "Shelf 1 of 4" counter; the active tab opens its tinted panel.
4. Why it matters: "Small, useful things, *within reach*." Two sentences, the RBT line, three marks, and a framed sample page from the Home ABC Printable captioned "What your BCBA actually wants to see." A testimonial carousel is added only when real testimonials exist.
5. Closing: "You don't have to figure everything *out alone*." One terracotta Find my shelf.
6. Footer: wordmark, tagline, About · Shelves · Contact · Privacy, the boundary line, year, email.

## Principles kept from earlier phases

Honest inventory (available, free, being made are visually distinct); the child is a person; one action per section; motion is a reveal and a lift, removed under reduced motion; 17–18px text, 44px targets, visible focus; AA contrast on every text pair.
