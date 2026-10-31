import Link from "next/link";
import { Wordmark } from "@/components/ui/Logo";
import { CartBadge } from "@/components/shop/CartBadge";
import { IconSearch } from "@/components/illustrations/Paper";
import { getProductHandles } from "@/lib/shopify/catalog";

/** Header search appears only once there is enough to find (audit F-11): products plus the ABC Tracker. */
const SEARCH_MIN_ITEMS = 8;

const NAV = [
  { href: "/about", label: "About", mobile: true },
  { href: "/#shelf-organized", label: "How it works", mobile: false },
  { href: "/shelf", label: "Shelves", mobile: true },
  { href: "/abc", label: "ABC tracker", mobile: true, short: "ABC" },
];

const link = "min-h-11 items-center rounded-pill px-1.5 text-[14px] text-ink-soft hover:bg-cream-deep hover:text-ink sm:px-3 sm:text-[15px]";

/**
 * Wordmark with a leaf, three links, a search disclosure and the cart.
 * There are no accounts, so there is no sign-in. Search is a plain GET to
 * the shelf page, so it works before any script runs.
 */
export async function SiteHeader() {
  const findable = (await getProductHandles().catch(() => [])).length + 1;
  const showSearch = findable >= SEARCH_MIN_ITEMS;
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-1 px-3 py-4 sm:gap-2 sm:px-8 sm:py-5">
      <Wordmark />
      <nav aria-label="Primary" className="flex shrink-0 items-center gap-0 whitespace-nowrap sm:gap-1">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`${link} ${n.mobile ? "inline-flex" : "hidden sm:inline-flex"}`}>
            {n.short ? (<><span className="sm:hidden">{n.short}</span><span className="hidden sm:inline">{n.label}</span></>) : n.label}
          </Link>
        ))}
        {showSearch ? (
        <details className="group relative">
          <summary
            className="flex h-11 w-10 cursor-pointer list-none items-center justify-center rounded-pill text-ink-soft hover:bg-cream-deep hover:text-ink sm:w-11 [&::-webkit-details-marker]:hidden"
            aria-label="Search the shelves"
          >
            <IconSearch className="h-5 w-5" />
          </summary>
          <form role="search" action="/shelf" method="get" className="paper-card absolute right-0 top-[calc(100%+8px)] flex w-[min(86vw,22rem)] items-center gap-2 p-2">
            <label htmlFor="site-search" className="sr-only">Search the shelves</label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Binder, plan, routines…"
              autoComplete="off"
              className="min-h-11 w-full rounded-pill border border-line-strong bg-paper px-4 text-[15px] text-ink placeholder:text-ink-faint focus:border-sage-deep focus:outline-none"
            />
            <button type="submit" className="lift inline-flex min-h-11 items-center rounded-pill bg-ink px-4 text-[15px] font-medium text-paper hover:bg-ink-soft">Go</button>
          </form>
        </details>
        ) : null}
        <CartBadge />
      </nav>
    </header>
  );
}
