import Link from "next/link";
import { Wordmark } from "@/components/ui/Logo";
import { CartBadge } from "@/components/shop/CartBadge";

const NAV = [
  { href: "/shelf", label: "The shelf" },
  { href: "/abc", label: "Free ABC logger" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Wordmark />
      <nav aria-label="Primary" className="flex shrink-0 items-center gap-1 whitespace-nowrap sm:gap-2">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="hidden min-h-11 items-center rounded-pill px-3 text-[15px] text-ink-soft hover:bg-cream-deep hover:text-ink sm:inline-flex"
          >
            {n.label}
          </Link>
        ))}
        <Link
          href="/abc"
          className="inline-flex min-h-11 items-center rounded-pill px-3 text-[15px] text-ink-soft hover:bg-cream-deep hover:text-ink sm:hidden"
        >
          ABC logger
        </Link>
        <CartBadge />
      </nav>
    </header>
  );
}
