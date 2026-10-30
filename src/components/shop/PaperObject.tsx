import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalize";
import { metaFor, TONE_BG } from "@/lib/resources";

/**
 * A product as a paper object: a folder/booklet with a tinted cover and the
 * real product image when one exists. Lifts 6px on hover/focus. A link.
 */
export function PaperObject({ product, index = 0 }: { product: ProductSummary; index?: number }) {
  const meta = metaFor(product.handle);
  const tone = meta?.tone ?? "paper";
  const price = formatMoney(product.price);
  const tilt = ["-rotate-1", "rotate-[0.6deg]", "-rotate-[0.4deg]", "rotate-1"][index % 4];

  return (
    <Link
      href={`/products/${product.handle}`}
      className={`group block rounded-sm outline-none transition-transform duration-200 ease-out hover:-translate-y-1.5 focus-visible:-translate-y-1.5 ${tilt} motion-reduce:transform-none motion-reduce:hover:transform-none`}
      aria-label={`${product.title}, ${price}`}
    >
      <div className={`grain relative aspect-[3/4] overflow-hidden rounded-sm ${TONE_BG[tone]} shadow-shelf transition-shadow duration-200 group-hover:shadow-lift`}>
        {/* Folder tab */}
        <div aria-hidden className="absolute left-4 top-0 h-3 w-16 rounded-b-md bg-white/50" />
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? `${product.title} cover`}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 72vw"
            className="object-cover mix-blend-multiply opacity-90"
          />
        ) : (
          <div className="absolute inset-x-5 top-10">
            <p className="font-display text-[1.35rem] leading-tight text-ink">{product.title}</p>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper via-paper/95 to-transparent px-5 pb-4 pt-10">
          <p className="font-display text-[1.1rem] leading-tight text-ink">{product.title}</p>
          <p className="mt-1 text-[13px] text-ink-mute">{meta?.category ?? "Download"} · {price}</p>
        </div>
      </div>
      <p className="mt-3 text-[14px] leading-snug text-ink-soft">{meta?.task ?? product.benefit}</p>
    </Link>
  );
}
