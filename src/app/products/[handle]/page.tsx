import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductCard } from "@/components/shop/ProductCard";
import { AddToCart } from "@/components/shop/AddToCart";
import { BinderPreview } from "@/components/shop/BinderPreview";
import { getProduct, getProductHandles, getRelated } from "@/lib/shopify/catalog";
import { formatMoney } from "@/lib/shopify/normalize";
import { metaFor, TONE_BG } from "@/lib/resources";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const handles = await getProductHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Not found" };
  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? metaFor(handle)?.task ?? product.benefit,
    openGraph: product.featuredImage ? { images: [{ url: product.featuredImage.url, alt: product.featuredImage.altText ?? product.title }] } : undefined,
  };
}

const FAQ = [
  { q: "How do I get the files?", a: "Shopify emails a download link within a minute of checkout. The link stays in that email, so keep it. If it doesn't arrive, check spam, then write to us using the footer." },
  { q: "Can I edit it?", a: "Printable PDFs print as-is. Editable items open in Canva or Google Docs, as listed under Format." },
  { q: "Is this treatment advice?", a: "No. Everything on the shelf is a template or educational material. Your child's team decides what fits your child." },
  { q: "Is it right for my situation?", a: "Read 'who it may help' and the page previews. If it isn't a fit, don't buy it; the free ABC logger is here either way." },
  { q: "Refunds?", a: "Downloads can't be returned, but if something is broken or not as described, write to us and we'll make it right." },
];

/**
 * Every product page answers: what task, what exactly you get, what it looks
 * like, who it's for, the format, the price, and how to get help. Important
 * details sit next to the purchase decision, never behind an animation.
 */
export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();
  const related = await getRelated(handle, product.collectionHandles);
  const meta = metaFor(handle);
  const price = formatMoney(product.price);
  const formatLine = product.format ?? extractFormat(product.description);
  const included = product.included.length ? product.included : extractIncluded(product.description);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-5 pb-32 pt-6 sm:px-8 sm:pt-10 md:pb-24">
        <nav aria-label="Breadcrumb" className="text-[14px] text-ink-mute">
          <Link href="/shelf" className="hover:text-ink">The shelf</Link>
          {meta ? <> <span aria-hidden>/</span> <Link href={`/shelf#${meta.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-ink">{meta.category}</Link></> : null}
        </nav>

        <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-14">
          <div className={`rounded-[28px] p-4 sm:p-8 ${TONE_BG[meta?.tone ?? "paper"]}`}>
            <BinderPreview images={product.images} title={product.title} format={formatLine} />
          </div>

          <div>
            <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">{meta?.category ?? "Download"} · {price === "Free" ? "Free" : "Digital download"}</p>
            <h1 className="mt-3 text-[clamp(2rem,1.5rem+1.8vw,3rem)]">{product.title}</h1>
            <p className="mt-4 text-[1.1rem] text-ink-soft">{meta?.task ?? product.benefit}</p>
            {meta ? <p className="mt-2 text-[15px] text-ink-mute">Who it may help: {meta.who}</p> : null}
            <p className="tnum mt-6 text-[1.6rem] text-ink">
              {price}
              {product.compareAtPrice ? <span className="ml-3 text-[1rem] text-ink-mute line-through">{formatMoney(product.compareAtPrice)}</span> : null}
            </p>

            <section className="mt-6 rounded-lg bg-paper p-5 shadow-soft" aria-labelledby="format-h">
              <h2 id="format-h" className="font-sans text-[13px] font-medium uppercase tracking-wider text-ink-mute">What you receive</h2>
              <p className="mt-2 text-[16px] text-ink">{formatLine ?? "Format details are being added. The description below says what's inside."}</p>
              {included.length ? (
                <ul className="mt-3 space-y-1 text-[15px] text-ink-soft">
                  {included.map((item) => <li key={item} className="flex gap-2"><span aria-hidden className="text-sage-deep">·</span>{item}</li>)}
                </ul>
              ) : null}
              <p className="mt-3 text-[14px] text-ink-mute">Delivered by email in under a minute, from Shopify. Use it right away.</p>
            </section>

            <div className="mt-6 hidden md:block">
              <AddToCart variantId={product.variantId} available={product.availableForSale} price={price} />
            </div>

            <p className="mt-6 rounded-md bg-sage-tint px-4 py-3 text-[14px] text-ink">Made by a Registered Behavior Technician.</p>
            <p className="mt-4 text-[14px] text-ink-soft">No client data. No treatment recommendations. You customize everything. If a file is broken or not as described, write to us and we&apos;ll fix it or refund you.</p>
          </div>
        </div>

        {product.descriptionHtml ? (
          <section className="mt-16 max-w-3xl" aria-labelledby="about-h">
            <h2 id="about-h">About this download</h2>
            <div className="mt-5 space-y-4 text-ink-soft [&_strong]:text-ink" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </section>
        ) : null}

        <section className="mt-16 max-w-3xl" aria-labelledby="faq-h">
          <h2 id="faq-h">Before you buy</h2>
          <div className="mt-6 divide-y divide-line rounded-lg bg-paper shadow-soft">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-[16px] text-ink">
                  {f.q}
                  <span aria-hidden className="text-ink-mute transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[15px] text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {related ? (
          <section className="mt-20" aria-labelledby="related-h">
            <h2 id="related-h">Often used together</h2>
            <p className="mt-2 text-[15px] text-ink-mute">Because the tasks go together, not because of a sales target.</p>
            <div className="shelf-edge mt-6 pb-12">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><ProductCard product={related} /></div>
            </div>
          </section>
        ) : null}
      </main>

      <aside aria-label="Add to cart" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <span className="tnum text-[1.1rem]">{price}</span>
          <div className="flex-1"><AddToCart variantId={product.variantId} available={product.availableForSale} price={price} compact /></div>
        </div>
      </aside>
      <SiteFooter />
    </>
  );
}

function extractFormat(text: string): string | null {
  const m = text.match(/Format:\s*([^\n]+?)(?:\s*What's included:|\s*This is a TEST|$)/i);
  return m ? m[1].trim().replace(/\.$/, "") : null;
}
function extractIncluded(text: string): string[] {
  const m = text.match(/What's included:\s*([^\n]+?)(?:\s*This is a TEST|$)/i);
  if (!m) return [];
  return m[1].split(/\s·\s|;\s*/).map((s) => s.trim().replace(/\.$/, "")).filter(Boolean);
}
