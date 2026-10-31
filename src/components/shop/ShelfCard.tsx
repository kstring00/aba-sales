import Link from "next/link";
import type { ProductSummary } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalize";
import { metaFor } from "@/lib/resources";
import { TINT_BG, TINT_TEXT, type ShelfDef, type Tint } from "@/lib/shelves";
import { PaperObject, PhoneObject, IconArrow } from "@/components/illustrations/Paper";
import { EmailCapture } from "@/components/shop/EmailCapture";

/* Layered paper: a tinted back sheet peeks out behind each card and slides a
   little further on hover while the card lifts. */
const wrap = "group relative block h-full no-underline outline-none";
const card = "paper-card relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-lift group-focus-visible:-translate-y-1 group-focus-visible:shadow-lift motion-reduce:transition-none motion-reduce:group-hover:translate-y-0";
const art = "grain flex items-end justify-center px-6 pt-5";
const artImg = "h-28 w-36 transition-transform duration-300 ease-out group-hover:scale-[1.04] group-hover:-rotate-1 motion-reduce:transition-none sm:h-32 sm:w-40";
const pill = "inline-flex min-h-10 items-center gap-1.5 self-start rounded-pill border border-line-strong bg-paper px-4 text-[14px] font-medium text-ink transition-colors group-hover:border-ink";

const BACK: Record<Tint, string> = {
  sky: "bg-[#c6def0]",
  mint: "bg-[#c3e4cc]",
  butter: "bg-[#f4dfa6]",
  blush: "bg-[#f2c8be]",
};

function BackSheet({ tint }: { tint: Tint }) {
  return (
    <span
      aria-hidden
      className={`${BACK[tint]} absolute inset-0 -z-0 translate-x-1.5 translate-y-2 rotate-[1.4deg] rounded-lg transition-transform duration-200 ease-out group-hover:translate-x-2.5 group-hover:translate-y-3 group-hover:rotate-[2.2deg] motion-reduce:transition-none`}
    />
  );
}

/** A product as an illustrated paper object: title, one sentence, price, "View resource →". */
export function ProductShelfCard({ product, tint }: { product: ProductSummary; tint: Tint }) {
  const meta = metaFor(product.handle);
  const price = formatMoney(product.price);
  return (
    <Link href={`/products/${product.handle}`} className={wrap}>
      <BackSheet tint={tint} />
      <div className={card}>
        <div className={`${TINT_BG[tint]} ${art}`}>
          <PaperObject kind={meta?.object ?? "folder"} tint={tint} className={artImg} />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-[1.15rem] leading-snug">{product.title}</h3>
          <p className="flex-1 text-[14.5px] leading-relaxed text-ink-soft">{meta?.task ?? product.benefit}</p>
          <p className={`tnum text-[14px] font-medium ${TINT_TEXT[tint]}`}>
            {price}
            {product.compareAtPrice ? <span className="ml-2 font-normal text-ink-mute line-through">{formatMoney(product.compareAtPrice)}</span> : null}
          </p>
          <span className={`${pill} mt-1`}>
            View resource <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** The free logger, always present on Shelf 4. Static: not a product. */
export function LoggerCard({ shelf }: { shelf: ShelfDef }) {
  const tool = shelf.tool!;
  return (
    <Link href={tool.href} className={wrap}>
      <BackSheet tint={shelf.tint} />
      <div className={card}>
        <div className={`${TINT_BG[shelf.tint]} ${art}`}>
          <PhoneObject tint={shelf.tint} className={artImg} />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-[1.15rem] leading-snug">{tool.title}</h3>
          <p className="flex-1 text-[14.5px] leading-relaxed text-ink-soft">{tool.body}</p>
          <p className={`text-[13.5px] font-medium ${TINT_TEXT[shelf.tint]}`}>{tool.label}</p>
          <span className={`${pill} mt-1`}>
            Open the logger <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** An empty shelf never shows a blank: it says what's being made and takes an email. */
export function EmptyShelfCard({ shelf }: { shelf: ShelfDef }) {
  const e = shelf.empty ?? { title: "This shelf is being stocked.", body: "Leave your email and you'll be first." };
  return (
    <div className="group relative h-full">
      <BackSheet tint={shelf.tint} />
      <div className="paper-card relative flex h-full flex-col gap-3 p-6">
      <p className={`kicker ${TINT_TEXT[shelf.tint]}`}>Being made</p>
      <h3 className="text-[1.2rem] leading-snug">{e.title}</h3>
      <p className="text-[14.5px] text-ink-soft">{e.body} One email when it&apos;s ready. Nothing else.</p>
      <div className="mt-auto pt-2">
        <EmailCapture source={`shelf-${shelf.id}`} cta="Tell me first" />
      </div>
      </div>
    </div>
  );
}
