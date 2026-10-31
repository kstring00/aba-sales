import Link from "next/link";
import { publicEnv } from "@/lib/env";
import { Wordmark } from "@/components/ui/Logo";

/** The boundary line appears on every page, verbatim. */
export const BOUNDARY_LINE = "These tools record and organize. Your BCBA writes the plan.";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const email = publicEnv.contactEmail;
  const links = [
    { href: "/about", label: "About" },
    { href: "/shelf", label: "Shelves" },
    { href: email ? `mailto:${email}` : "/about", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
  ];
  return (
    <footer className="mt-auto border-t border-line bg-cream">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Wordmark />
          <p className="text-[15px] text-ink-soft">Practical tools. Kinder days. Brighter tomorrows.</p>
          <p className="pt-2 text-[15px] text-ink">{BOUNDARY_LINE}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-2 gap-y-0 text-[15px] md:justify-end">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="inline-flex min-h-11 items-center rounded-pill px-3 text-ink-soft hover:bg-cream-deep hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 pb-8 text-[13px] text-ink-mute sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {year} The Support Shelf. The free ABC logger stores nothing on our servers.{" "}
          <Link href="/crisis" className="underline underline-offset-4 hover:text-ink">Crisis resources</Link>
        </p>
        {email ? <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center hover:text-ink sm:min-h-0">{email}</a> : null}
      </div>
    </footer>
  );
}
