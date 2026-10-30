import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalize";
import { metaFor, TONE_BG } from "@/lib/resources";

/**
 * A product card answers: what is it, who may it help, which task, what
 * format, and the price or free. Preview is one tap away.
 */
export function ProductCard({ product, priority = false }: { product: ProductSummary; priority?: boolean }) {
  const meta = metaFor(product.handle);
  const price = formatMoney(product.price);
  return (
    <Link href={`/products/${product.handle}`} className="lift group block rounded-lg bg-paper shadow-shelf">
      <div className={`grain relative aspect-[4/5] overflow-hidden rounded-t-lg ${TONE_BG[meta?.tone ?? "paper"]}`}>
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? `${product.title} preview`}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-x-6 top-16">
            <p className="font-display text-[1.5rem] leading-tight text-ink">{product.title}</p>
            <p className="mt-3 text-[13px] text-ink-mute">Page previews coming</p>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-pill bg-paper/90 px-3 py-1 text-[12px] uppercase tracking-wider text-ink-soft backdrop-blur">
          {price === "Free" ? "Free" : "Download"}
        </span>
      </div>
      <div className="space-y-2 p-5">
        <h3 className="text-[1.2rem] leading-snug">{product.title}</h3>
        <p className="text-[15px] text-ink-soft">{meta?.task ?? product.benefit}</p>
        {meta ? <p className="text-[14px] text-ink-mute">For: {meta.who}</p> : null}
        <div className="flex items-center justify-between pt-2 text-[15px]">
          <span className="tnum text-ink">{price}{product.compareAtPrice ? <span className="ml-2 text-ink-mute line-through">{formatMoney(product.compareAtPrice)}</span> : null}</span>
          <span className="text-ink-soft underline-offset-4 group-hover:underline">See inside</span>
        </div>
      </div>
    </Link>
  );
}
