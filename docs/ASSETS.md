# Photography & asset manifest

Briefs for the photography to commission or license. No slots or placeholders ship in the current build; these are re-added when real images exist. Rules: documentary over polish, natural light, no faces of children looking at camera, no fabricated text in frame, no AI-generated person presented as a real family, no staged sadness.

| ID | Title | Placement | Brief (short) | Desktop / mobile crop | Alt text | Format | Licensing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ordinaryMoment | The Ordinary Moment | Home hero | Dining room, afternoon side light, parent and child mid-activity, negative space at left | 16:10 / 4:5 | A parent and child at a kitchen table in afternoon light, drawing together beside a mug and a printed routine card. | AVIF (+JPG fallback) | pending |
| thingsWeCarry | The Things We Carry | Home, recognition band | Still life: calendar, folders, pen, notes, tea; window shadow; no legible medical text | 21:9 / 4:3 | A calendar, folders, a pen, and a cup of tea arranged on a wooden table in soft daylight. | AVIF | pending |
| placeForEverything | A Place for Everything | /shelf header | Real printed product pages fanned on oak, overhead and 30° | 3:2 / 4:5 | Printed worksheets and a tabbed binder arranged on an oak table. | AVIF | pending (needs real pages) |
| humanSide1 | The Human Side · preparing | Finder (reserved) | Evening kitchen table, hands writing questions | 4:5 / 3:2 | Hands writing a list of questions on a notepad at a kitchen table in the evening. | AVIF | pending |
| humanSide2 | The Human Side · help arriving | Support section | Doorway, child's shoes, someone arriving with a dish | 4:5 / 3:2 | A doorway with a child's shoes beside it, and someone arriving with a dish. | AVIF | pending |
| founder | Founder portrait | Founder section, /about | Real portrait, natural light. Never generated. | 4:5 / 1:1 | Portrait of the founder of The Support Shelf. | AVIF | owned (to supply) |
| theShelf | The Shelf | OG image, /about | Wooden shelf: books, folders, notebook, routine, plant | 16:9 / 4:5 | A wooden shelf holding books, folders, a notebook, and a small plant. | AVIF | pending |

Delivery: export each at 2400px on the long edge (hero 3200px), AVIF quality ~60 plus a JPG fallback; `next/image` handles the rest. Drop files in `public/photos/` and set `src` in the manifest.

Product preview images (page thumbnails) live in Shopify, not here. Upload the actual pages at 1600px on the long edge, one per page, in order; the binder preview uses them as tabs.

## Bright shelf (`/shelf`) — additional briefs

The redesigned shelf ships with an original SVG illustration system (waves, sun, binders with colored tabs, notebooks, sheets, folders, sprigs, ribbons) and a real screenshot of the ABC logger with a synthetic nickname. No photography or AI imagery was generated: the image tool available in the build environment bills credits, which the project rules forbid, and AI-generated people must never stand in for real families.

When photography is commissioned, these slots exist in the bright shelf:

| Slot | Brief | Crop | Alt |
| --- | --- | --- | --- |
| Hero human element (optional, right column) | A parent's hands arranging printed sheets and a folder on a turquoise table, daylight, no face | 5:4 | Hands arranging printed sheets and a folder on a turquoise table. |
| Human element section | A caregiver at a bright kitchen table reviewing notes; natural light; dignified, unposed; face soft or turned | 1:1 / 4:5 | A caregiver at a kitchen table reviewing handwritten notes in daylight. |
| Product photography | Actual product pages printed and arranged overhead on a turquoise or sea-glass surface with coral and sun accents | 4:5 per product | Printed pages of [product] arranged on a turquoise table. |
