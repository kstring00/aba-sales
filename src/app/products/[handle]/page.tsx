import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductCard } from "@/components/shop/ProductCard";
import { AddToCart } from "@/components/shop/AddToCart";
import { Gallery } from "@/components/shop/Gallery";
import { getProduct, getProductHandles, getRelated } from "@/lib/shopify/catalog";
import { formatMoney } from "@/lib/shopify/normalize";

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
    description: product.seoDescription ?? product.benefit,
    openGraph: product.featuredImage ? { images: [{ url: product.featuredImage.url, alt: product.featuredImage.altText ?? product.title }] } : undefined,
  };
}

const FAQ = [
  { q: "How do I get the files?", a: "Shopify emails a download link within a minute of checkout. Links stay in that email, so keep it." },
  { q: "Can I edit it?", a: "Printable PDFs print as-is. Editable items open in Canva or Google Docs, as listed under Format." },
  { q: "Is this treatment advice?", a: "No. Everything on the shelf is a template or educational material. Your child's team decides what fits." },
  { q: "Refunds?", a: "Downloads can't be returned, but if something is broken or not as described, write to us and we'll make it right." },
];

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();
  const related = await getRelated(handle, product.collectionHandles);
  const formatLine = product.format ?? extractFormat(product.description);
  const included = product.included.length ? product.included : extractIncluded(product.description);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-32 pt-6 sm:px-8 sm:pt-12 md:pb-24">
        <nav aria-label="Breadcrumb" className="text-[14px] text-ink-mute">
          <Link href="/shelf" className="hover:text-ink">The shelf</Link> <span aria-hidden>/</span> {product.title}
        </nav>

        <div className="mt-6 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <Gallery images={product.images} title={product.title} />

          <div>
            <h1 className="text-[clamp(1.9rem,1.5rem+1.5vw,2.8rem)]">{product.title}</h1>
            <p className="mt-3 text-[1.1rem] text-ink-soft">{product.benefit}</p>
            <p className="tnum mt-5 text-[1.5rem]">
              {formatMoney(product.price)}
              {product.compareAtPrice ? <span className="ml-3 text-[1rem] text-ink-mute line-through">{formatMoney(product.compareAtPrice)}</span> : null}
            </p>

            <section className="mt-6 rounded-lg bg-paper p-5 shadow-soft" aria-labelledby="format-h">
              <h2 id="format-h" className="font-sans text-[13px] font-medium uppercase tracking-wider text-ink-mute">Format &amp; what&apos;s included</h2>
              <p className="mt-2 text-[16px] text-ink">{formatLine ?? "Format details coming soon."}</p>
              {included.length ? (
                <ul className="mt-3 space-y-1 text-[15px] text-ink-soft">
                  {included.map((item) => (
                    <li key={item} className="flex gap-2"><span aria-hidden className="text-sage-deep">·</span>{item}</li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-[14px] text-ink-mute">Delivered by email in under a minute.</p>
            </section>

            <div className="mt-6 hidden md:block">
              <AddToCart variantId={product.variantId} available={product.availableForSale} price={formatMoney(product.price)} />
            </div>

            <p className="mt-5 text-[14px] text-ink-soft">
              If a file is broken or not as described, write to us and we&apos;ll fix it or refund you.
            </p>

            <p className="mt-6 rounded-md bg-sage-tint px-4 py-3 text-[14px] text-ink">
              No client data. No treatment recommendations. You customize everything.
            </p>

            <p className="mt-6 text-[14px] text-ink-mute">
              Written by a Registered Behavior Technician with three years in-clinic. Reviewed by a BCBA (name to come).
            </p>
          </div>
        </div>

        <section className="mt-16 max-w-3xl" aria-labelledby="faq-h">
          <h2 id="faq-h">Questions people ask</h2>
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

        {product.descriptionHtml ? (
          <section className="mt-16 max-w-3xl" aria-labelledby="about-h">
            <h2 id="about-h">About this download</h2>
            <div className="prose-shop mt-5 space-y-4 text-ink-soft [&_strong]:text-ink" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </section>
        ) : null}

        {related ? (
          <section className="mt-20" aria-labelledby="related-h">
            <h2 id="related-h">From the same shelf</h2>
            <div className="shelf-edge mt-6 pb-12">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <ProductCard product={related} />
              </div>
            </div>
          </section>
        ) : null}
      </main>

      {/* Mobile: sticky add-to-cart */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <span className="tnum text-[1.1rem]">{formatMoney(product.price)}</span>
          <div className="flex-1"><AddToCart variantId={product.variantId} available={product.availableForSale} price={formatMoney(product.price)} compact /></div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

/** Fallbacks when metafields aren't set: read "Format:" and "What's included:" from the description. */
function extractFormat(text: string): string | null {
  const m = text.match(/Format:\s*([^\n]+?)(?:\s*What's included:|\s*This is a TEST|$)/i);
  return m ? m[1].trim().replace(/\.$/, "") : null;
}
function extractIncluded(text: string): string[] {
  const m = text.match(/What's included:\s*([^\n]+?)(?:\s*This is a TEST|$)/i);
  if (!m) return [];
  return m[1].split(/\s·\s|;\s*/).map((s) => s.trim().replace(/\.$/, "")).filter(Boolean);
}
