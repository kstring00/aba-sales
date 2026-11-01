import Link from "next/link";
import { Wordmark } from "@/components/ui/Logo";
import { CartBadge } from "@/components/shop/CartBadge";
import { IconSearch } from "@/components/illustrations/Paper";
import { MobileMenu } from "@/components/site/MobileMenu";
import { getProductHandles } from "@/lib/shopify/catalog";
import { hubSections } from "@/lib/content/pages";
import { ui } from "@/lib/content/data";

/** Header search appears only once there is enough to find (audit F-11): products plus the ABC Tracker. */
const SEARCH_MIN_ITEMS = 8;

const LABEL = { "right-now": ui.nav.rightNow, learn: ui.nav.learn, "find-care": ui.nav.findCare, "for-you": ui.nav.forYou } as const;

const link = "inline-flex min-h-11 items-center rounded-pill px-3 text-[15px] text-ink-soft hover:bg-cream-deep hover:text-ink";

/**
 * Wordmark, the calm "Right now" pill (always visible once published), the
 * hub sections, Shelves and the ABC tracker. From lg up the links sit
 * inline; below lg they live in a menu. Only sections that are visible on
 * this deployment appear (published, or any status outside production).
 */
export async function SiteHeader() {
  const findable = (await getProductHandles().catch(() => [])).length + 1;
  const showSearch = findable >= SEARCH_MIN_ITEMS;
  const sections = hubSections().filter((s) => s.visible);
  const rightNow = sections.find((s) => s.key === "right-now");
  const hubLinks = sections.filter((s) => s.key !== "right-now").map((s) => ({ href: s.href, label: LABEL[s.key] }));
  const links = [...hubLinks, { href: "/jobs", label: "Jobs" }, { href: "/shelf", label: ui.nav.shelves }, { href: "/abc", label: ui.nav.abc }];
  const menu = [...(rightNow ? [{ href: rightNow.href, label: ui.nav.rightNow }] : []), ...links, { href: "/about", label: ui.nav.about }];

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-1 px-3 py-4 sm:gap-2 sm:px-8 sm:py-5">
      <Wordmark />
      <nav aria-label="Primary" className="flex shrink-0 items-center gap-0.5 whitespace-nowrap sm:gap-1">
        {rightNow ? (
          <Link href={rightNow.href} className="lift inline-flex min-h-11 items-center gap-2 rounded-pill border border-accent/40 bg-sage-tint px-3 text-[14px] font-medium text-heading hover:border-accent sm:px-4 sm:text-[15px]">
            <span aria-hidden className="hidden h-2 w-2 rounded-pill bg-accent sm:inline-block" />
            {ui.nav.rightNow}
          </Link>
        ) : null}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
          ))}
        </ul>
        {showSearch ? (
          <details className="group relative">
            <summary
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-pill text-ink-soft hover:bg-cream-deep hover:text-ink [&::-webkit-details-marker]:hidden"
              aria-label="Search the shelves"
            >
              <IconSearch className="h-5 w-5" />
            </summary>
            <form role="search" action="/shelf" method="get" className="paper-card absolute right-0 top-[calc(100%+8px)] flex w-[min(86vw,22rem)] items-center gap-2 p-2">
              <label htmlFor="site-search" className="sr-only">Search the shelves</label>
              <input id="site-search" name="q" type="search" autoComplete="off" className="min-h-11 w-full rounded-pill border border-line-strong bg-paper px-4 text-[15px] text-ink focus:border-sage-deep focus:outline-none" />
              <button type="submit" className="lift inline-flex min-h-11 items-center rounded-pill bg-ink px-4 text-[15px] font-medium text-paper hover:bg-ink-soft">Go</button>
            </form>
          </details>
        ) : null}
        <MobileMenu items={menu} label={ui.nav.menu} closeLabel={ui.nav.closeMenu} />
        <CartBadge />
      </nav>
    </header>
  );
}
