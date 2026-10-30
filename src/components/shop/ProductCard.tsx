import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalize";

export function ProductCard({ product, priority = false }: { product: ProductSummary; priority?: boolean }) {
  return (
    <Link href={`/products/${product.handle}`} className="lift group block rounded-lg bg-paper shadow-shelf">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-lg bg-cream-deep">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div aria-hidden className="absolute inset-0 grid place-items-center text-[13px] text-ink-mute">Preview coming</div>
        )}
      </div>
      <div className="space-y-1 p-5">
        <h3 className="text-[1.15rem] leading-snug">{product.title}</h3>
        <p className="text-[14px] text-ink-soft">{product.benefit}</p>
        <p className="tnum pt-2 text-[15px] text-ink">
          {formatMoney(product.price)}
          {product.compareAtPrice ? (
            <span className="ml-2 text-ink-mute line-through">{formatMoney(product.compareAtPrice)}</span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
