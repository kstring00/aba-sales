import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatMoney } from "@/lib/shopify/normalize";
import { getCart } from "@/lib/shopify/cart";
import { checkout, removeLine, setQuantity } from "./actions";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart().catch(() => null);
  const lines = cart?.lines ?? [];

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">Your cart</h1>
        {lines.length === 0 ? (
          <div className="mt-8 rounded-lg bg-paper p-8 shadow-soft">
            <p className="text-ink-soft">Nothing here yet.</p>
            <div className="mt-6"><LinkButton href="/shelf" variant="primary" size="lg">Browse the shelf</LinkButton></div>
          </div>
        ) : (
          <>
            <ul className="mt-8 divide-y divide-line rounded-lg bg-paper shadow-soft">
              {lines.map((l) => (
                <li key={l.id} className="flex gap-4 p-4 sm:p-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-cream-deep">
                    {l.image ? <Image src={l.image.url} alt={l.image.altText ?? l.title} fill sizes="80px" className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${l.productHandle}`} className="text-[16px] text-ink hover:underline">{l.title}</Link>
                    <p className="tnum mt-1 text-[15px] text-ink-soft">{formatMoney(l.price)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <form action={setQuantity} className="flex items-center gap-2">
                        <input type="hidden" name="lineId" value={l.id} />
                        <label htmlFor={`q-${l.id}`} className="text-[13px] text-ink-mute">Qty</label>
                        <select id={`q-${l.id}`} name="quantity" defaultValue={l.quantity} className="min-h-11 rounded-md border border-line-strong bg-paper px-3 text-[15px]">
                          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <Button type="submit" size="sm" variant="quiet">Update</Button>
                      </form>
                      <form action={removeLine}>
                        <input type="hidden" name="lineId" value={l.id} />
                        <Button type="submit" size="sm" variant="quiet">Remove</Button>
                      </form>
                    </div>
                  </div>
                  <p className="tnum shrink-0 text-[16px]">{formatMoney(l.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-lg bg-paper p-5 shadow-soft">
              <div className="flex items-center justify-between text-[16px]">
                <span className="text-ink-soft">Subtotal</span>
                <span className="tnum">{formatMoney(cart!.subtotal)}</span>
              </div>
              <p className="mt-1 text-[14px] text-ink-mute">Digital downloads. No shipping. Tax, if any, is shown at checkout.</p>
              <form action={checkout} className="mt-5">
                <Button type="submit" variant="primary" size="lg" className="w-full">Checkout</Button>
              </form>
              <p className="mt-3 text-center text-[13px] text-ink-mute">Checkout is handled securely by Shopify. Your files arrive by email within a minute.</p>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
