import Link from "next/link";
import { publicEnv } from "@/lib/env";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const email = publicEnv.contactEmail;
  const phone = publicEnv.contactPhone;
  return (
    <footer className="mt-auto border-t border-line bg-cream">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-display text-[1.25rem] tracking-tight">The Support Shelf</p>
          <p className="text-[15px] text-ink-soft">Thoughtfully made tools for the people who care.</p>
          <p className="max-w-[44ch] text-[14px] leading-relaxed text-ink-mute">
            The free ABC logger stores nothing on our servers. Entries live in your browser only.
          </p>
        </div>
        <nav aria-label="Footer" className="space-y-2 text-[15px]">
          <p className="text-[13px] uppercase tracking-wider text-ink-mute">Site</p>
          <ul className="space-y-2">
            <li><Link href="/shelf" className="text-ink-soft hover:text-ink">The shelf</Link></li>
            <li><Link href="/abc" className="text-ink-soft hover:text-ink">Free ABC logger</Link></li>
            <li><Link href="/about" className="text-ink-soft hover:text-ink">About</Link></li>
            <li><Link href="/privacy" className="text-ink-soft hover:text-ink">Privacy</Link></li>
            <li><Link href="/crisis" className="text-ink-soft hover:text-ink">Crisis resources</Link></li>
          </ul>
        </nav>
        <div className="space-y-2 text-[15px]">
          <p className="text-[13px] uppercase tracking-wider text-ink-mute">Reach a person</p>
          <ul className="space-y-2">
            {email ? (
              <li><a href={`mailto:${email}`} className="text-ink-soft hover:text-ink">{email}</a></li>
            ) : (
              <li className="text-ink-mute">Email coming soon</li>
            )}
            {phone ? (
              <li><a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-ink-soft hover:text-ink">{phone}</a></li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-5 pb-8 text-[13px] text-ink-mute sm:px-8">
        <p>
          © {year} The Support Shelf. Tools and templates, not treatment. Nothing here diagnoses or tells you what to do.
          If someone is in immediate danger, call 911 (US).
        </p>
      </div>
    </footer>
  );
}
