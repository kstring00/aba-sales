import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-line bg-cream">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-display text-[1.25rem] tracking-tight">The Support Shelf</p>
          <p className="text-[15px] text-ink-soft">
            Thoughtfully made tools for the people who care.
          </p>
          <p className="max-w-[44ch] text-[14px] leading-relaxed text-ink-mute">
            Your child&apos;s information is stored under a nickname only. You own it, you can
            export or delete it at any time, and we never read your entries.
          </p>
        </div>
        <nav aria-label="Footer" className="space-y-2 text-[15px]">
          <p className="text-[13px] uppercase tracking-wider text-ink-mute">Site</p>
          <ul className="space-y-2">
            <li><Link href="/app" className="text-ink-soft hover:text-ink">Tracker</Link></li>
            <li><Link href="/contact" className="text-ink-soft hover:text-ink">Contact</Link></li>
            <li><Link href="/crisis" className="text-ink-soft hover:text-ink">Crisis resources</Link></li>
          </ul>
        </nav>
        <nav aria-label="Legal" className="space-y-2 text-[15px]">
          <p className="text-[13px] uppercase tracking-wider text-ink-mute">Legal</p>
          <ul className="space-y-2">
            <li><Link href="/privacy" className="text-ink-soft hover:text-ink">Privacy</Link></li>
            <li><Link href="/terms" className="text-ink-soft hover:text-ink">Terms</Link></li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto w-full max-w-6xl px-5 pb-8 text-[13px] text-ink-mute sm:px-8">
        <p>
          © {year} The Support Shelf. We don&apos;t give advice. We help you see what&apos;s
          happening and hand clear information to the people who do. If someone is in
          immediate danger, call 911 (US).
        </p>
      </div>
    </footer>
  );
}
