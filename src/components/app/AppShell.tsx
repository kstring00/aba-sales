"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Wordmark } from "@/components/ui/Logo";
import { setTimeZone } from "@/app/app/actions";

const TABS = [
  { href: "/app", label: "Log", icon: PlusIcon },
  { href: "/app/entries", label: "Entries", icon: ListIcon },
  { href: "/app/export", label: "Export", icon: ExportIcon },
  { href: "/app/patterns", label: "Patterns", icon: PatternIcon },
  { href: "/app/settings", label: "Settings", icon: GearIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Tell the server which local day "today" is. Once per session is enough.
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const key = "ss_tz_sent";
      if (tz && sessionStorage.getItem(key) !== tz) {
        sessionStorage.setItem(key, tz);
        void setTimeZone(tz);
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <header className="flex items-center justify-between px-5 pb-2 pt-5 md:hidden">
        <Wordmark href="/app" className="text-[1.1rem]" />
        <Link href="/crisis" className="text-[14px] text-ink-mute hover:text-ink">
          Crisis resources
        </Link>
      </header>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-line px-6 py-8 md:flex">
        <Wordmark href="/app" />
        <nav aria-label="Tracker" className="mt-10 flex flex-col gap-1">
          {TABS.map((t) => {
            const active = t.href === "/app" ? pathname === "/app" : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`lift flex min-h-12 items-center gap-3 rounded-md px-3 text-[16px] ${
                  active ? "bg-paper text-ink shadow-soft" : "text-ink-soft hover:bg-cream-deep hover:text-ink"
                }`}
              >
                <t.icon />
                {t.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/crisis" className="mt-auto text-[14px] text-ink-mute hover:text-ink">
          Crisis resources
        </Link>
      </aside>

      <div className="flex-1 pb-[calc(env(safe-area-inset-bottom)+84px)] md:pb-12">{children}</div>

      <nav
        aria-label="Tracker"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {TABS.map((t) => {
            const active = t.href === "/app" ? pathname === "/app" : pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] ${
                    active ? "text-ink" : "text-ink-mute"
                  }`}
                >
                  <t.icon />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 7h14M5 12h14M5 17h9" />
    </svg>
  );
}
function ExportIcon() {
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11M8 11l4 4 4-4M5 19h14" />
    </svg>
  );
}
function PatternIcon() {
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 19V11M12 19V5M19 19v-8" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4.4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2Z" />
    </svg>
  );
}
