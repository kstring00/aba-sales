import Link from "next/link";
import type { ProductSummary } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalize";
import { metaFor } from "@/lib/resources";
import { TINT_BG, TINT_TEXT, type ShelfDef, type Tint } from "@/lib/shelves";
import { PaperObject, PhoneObject, IconArrow } from "@/components/illustrations/Paper";
import { EmailCapture } from "@/components/shop/EmailCapture";

const card = "paper-card lift group flex h-full flex-col overflow-hidden";
const pill = "inline-flex min-h-10 items-center gap-1.5 self-start rounded-pill border border-line-strong bg-paper px-4 text-[14px] font-medium text-ink group-hover:border-ink";

/** A product as an illustrated paper object: title, one sentence, price, "View resource →". */
export function ProductShelfCard({ product, tint }: { product: ProductSummary; tint: Tint }) {
  const meta = metaFor(product.handle);
  const price = formatMoney(product.price);
  return (
    <Link href={`/products/${product.handle}`} className={`${card} no-underline`}>
      <div className={`${TINT_BG[tint]} grain flex items-end justify-center px-6 pt-5`}>
        <PaperObject kind={meta?.object ?? "folder"} tint={tint} className="h-28 w-36 sm:h-32 sm:w-40" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-[1.15rem] leading-snug">{product.title}</h3>
        <p className="flex-1 text-[14.5px] leading-relaxed text-ink-soft">{meta?.task ?? product.benefit}</p>
        <p className={`tnum text-[14px] font-medium ${TINT_TEXT[tint]}`}>
          {price}
          {product.compareAtPrice ? <span className="ml-2 font-normal text-ink-mute line-through">{formatMoney(product.compareAtPrice)}</span> : null}
        </p>
        <span className={`${pill} mt-1`}>
          View resource <IconArrow className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

/** The free logger, always present on Shelf 4. Static: not a product. */
export function LoggerCard({ shelf }: { shelf: ShelfDef }) {
  const tool = shelf.tool!;
  return (
    <Link href={tool.href} className={`${card} no-underline`}>
      <div className={`${TINT_BG[shelf.tint]} grain flex items-end justify-center px-6 pt-5`}>
        <PhoneObject tint={shelf.tint} className="h-28 w-36 sm:h-32 sm:w-40" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-[1.15rem] leading-snug">{tool.title}</h3>
        <p className="flex-1 text-[14.5px] leading-relaxed text-ink-soft">{tool.body}</p>
        <p className={`text-[13.5px] font-medium ${TINT_TEXT[shelf.tint]}`}>{tool.label}</p>
        <span className={`${pill} mt-1`}>
          Open the logger <IconArrow className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

/** An empty shelf never shows a blank: it says what's being made and takes an email. */
export function EmptyShelfCard({ shelf }: { shelf: ShelfDef }) {
  const e = shelf.empty ?? { title: "This shelf is being stocked.", body: "Leave your email and you'll be first." };
  return (
    <div className="paper-card flex h-full flex-col gap-3 p-6">
      <p className={`kicker ${TINT_TEXT[shelf.tint]}`}>Being made</p>
      <h3 className="text-[1.2rem] leading-snug">{e.title}</h3>
      <p className="text-[14.5px] text-ink-soft">{e.body} One email when it&apos;s ready. Nothing else.</p>
      <div className="mt-auto pt-2">
        <EmailCapture source={`shelf-${shelf.id}`} cta="Tell me first" />
      </div>
    </div>
  );
}
