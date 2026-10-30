# Photography & asset manifest

Source of truth: `src/lib/assets.ts`. Each slot renders a designed placeholder until `src` is filled. Rules: documentary over polish, natural light, no faces of children looking at camera, no fabricated text in frame, no AI-generated person presented as a real family, no staged sadness.

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
