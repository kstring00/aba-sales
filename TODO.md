# TODO — grouped by page

**(founder)** = needs you. **(review)** = needs a professional before launch.

## Global
- (founder) Product sentences and "who it may help" in `src/lib/resources.ts` were written from the product names and the brief; confirm each against the actual files.
- (founder) Upload the actual page images to each Shopify product, in page order; the product page gallery uses them. Add `custom.format` and `custom.included` metafields for exact contents.
- (founder) Production shelves are empty while Shopify itself is correct (four products Active on Headless, tagged, collection published). Open `/api/health/shopify` on the deployment: it says whether the token/domain are set for Production and whether Shopify accepts the token. Fix the variable in Vercel and redeploy.
- (founder) Resend: API key, Audience, and a **verified sending domain**. Until then export emails only reach your own address.
- (founder) `NEXT_PUBLIC_CONTACT_EMAIL` for the footer and the Contact link.
- (founder) Testimonials: the Why-it-matters section holds a sample sheet in place of a carousel; add a carousel only when real, permissioned testimonials exist.
- (review) Legal review of the privacy page.
- (review) BCBA review of the chip wording, PDF captions, and product copy.
- Favicon and social image exist; refresh the OG image to the new palette when the copy is final.

## ABC tracker `/abc`
- (review) BCBA review of the "Understanding the function of behavior" card and its "Read more" text, and of the step-3 reflection wording. Both are framed as the parent's reflection, not a finding; exports label it "Parent's reflection".
- Saving with several behaviors selected writes one entry per behavior (same details). Revisit if a BCBA prefers one episode row with several behaviors.

## Home `/`
- Shelf tabs remember nothing between visits by design; consider deep-linking `/#shelves` with a shelf id if parents share links.

## Shelf `/shelf`
- Header search is a plain `?q=` substring match over titles and sentences; fine for four products, revisit past ~20.
- Everyday Life is empty and takes an email; Support at Home holds the free logger.

## Product `/products/[handle]`
- Add `custom.benefit`, `custom.format`, `custom.included` metafields and expose them to the Storefront API; the page falls back to parsing the description.
- Upload real preview images (the actual pages) in Shopify; the paper object stands in until then.

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
