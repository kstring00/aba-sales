# TODO — grouped by page

**(founder)** = needs you. **(review)** = needs a professional before launch.

## Global
- (founder) Install the **Headless** sales channel in Shopify, create a storefront, paste the public Storefront token into env (README "Shopify setup").
- (founder) For the three `TEST —` products: tick **Headless**, leave **Online Store** unticked, set **Active**. Also publish both shelf collections to Headless. (The connector could create the products but not change their channels; it initially published them to Online Store, so I set them to Draft.)
- (founder) Vercel project + env vars; first deploy.
- (founder) Resend: API key, Audience, and a **verified sending domain**. Until then export emails only reach your own address.
- (founder) `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_CONTACT_PHONE` for the footer.
- (review) Legal review of the privacy page.
- (review) BCBA review of the chip wording, PDF captions, and product copy; supply the "reviewed by" name.
- Replace the Shopify sample-art placeholder images on TEST products with real page previews.
- Favicon and social image exist; replace the OG image copy when the homepage copy is final.

## Home `/`
- (founder) Founder photo slot (currently text only).
- Featured products come from the first three published products; consider a `featured` tag.

## Shelf `/shelf`
- Interactive shelf stays hidden until it has products.
- Shelf-level descriptions come from the Shopify collection description.

## Product `/products/[handle]`
- Add `custom.benefit`, `custom.format`, `custom.included` metafields and expose them to the Storefront API; the page falls back to parsing the description.
- Upload real preview images (the actual pages) in Shopify.
- "Reviewed by a BCBA (name to come)" placeholder.

## Cart `/cart` → Shopify checkout → `/thanks`
- (founder) Set the order-status "continue shopping" link to `/thanks` in Shopify checkout settings.
- Run one end-to-end test purchase with Shopify's test gateway (Phase 2 checklist).

## ABC logger `/abc`
- Email export only delivers to your own address until the Resend domain is verified.
- Consider an "import CSV" so a parent can move entries between devices.

## About `/about`
- Final wording of the RBT paragraph; BCBA reviewer name.

## Privacy `/privacy`
- (review) Legal review.

## Crisis `/crisis`
- (review) Safeguarding review; add non-US lines or a directory link.
