# Asset manifest

No photography and no raster images ship on the homepage or shelves. Every illustration is inline SVG in `src/components/illustrations/Paper.tsx`, colored from the tokens in `src/app/globals.css`, so it re-themes with the palette and costs no bytes beyond the HTML.

## Inventory

| Component | Where it appears | Notes |
| --- | --- | --- |
| `HeroScene` | Homepage hero | Four tinted upright folders on a wooden shelf, plant, mug ("Small steps, brighter days"), pinned note ("YOU GOT THIS"), leaves. Labelled `img`. |
| `ShelfIcon` → `IconFolder`, `IconCalendar`, `IconSun`, `IconPeople` | Shelf tabs, panel badges, folders | One per shelf tint. |
| `PaperObject` (`binder`, `checklist`, `calendar`, `folder`, `booklet`) | Product cards, product page fallback | Chosen per product in `src/lib/resources.ts`. |
| `PhoneObject` | The free logger card | Three chips and a terracotta save button. |
| `SampleLogSheet` | Why it matters | The first sheet of the Home ABC Printable with one clearly labelled sample entry. Labelled `img`. |
| `Wave`, `SunAndLeaves`, `CornerLeaves`, `Sprig` | Section dividers and corners | Decorative, `aria-hidden`. |
| `IconLeaf`, `IconHeart`, `IconChecklist`, `IconSearch`, `IconArrow` | Trust marks, nav, buttons | |

## Raster images that are allowed

- Shopify product gallery images on `/products/[handle]` (real pages of the download, uploaded in Shopify). When a product has none, the shelf's paper object stands in.
- `public/og.png` for link previews; `public/icons/*` favicons; `public/screens/*` real screenshots of the logger used in documentation.

## If photography is added later

Only real, licensed photographs of consenting people; never stock that implies a customer or a family, never generated people. Add a slot deliberately; nothing in the current layout reserves space for one.
