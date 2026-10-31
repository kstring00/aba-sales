import type { SVGProps } from "react";
import type { DrawerIcon } from "@/content/shelf-drawer";

/** The demo's icon set, 1.8px strokes. Decorative unless a label is given. */
type P = SVGProps<SVGSVGElement>;
const s = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, focusable: false };

export const D = {
  leaf: (p: P) => <svg viewBox="0 0 24 24" aria-hidden focusable={false} {...p}><path fill="currentColor" d="M4 20c1-9 7-14 16-16-1 9-6 15-14 16 2-5 5-8 8-10-4 1-7 4-10 10z" /></svg>,
  folder: (p: P) => <svg {...s} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 11h18" /></svg>,
  cal: (p: P) => <svg {...s} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2" /></svg>,
  sun: (p: P) => <svg {...s} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></svg>,
  people: (p: P) => <svg {...s} {...p}><circle cx="9" cy="8" r="3.2" /><circle cx="17" cy="9.5" r="2.4" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 20c0-2.4 1.6-4.4 4-4.8 1.2.2 2 1.5 2 3.3" /></svg>,
  doc: (p: P) => <svg {...s} {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>,
  clip: (p: P) => <svg {...s} {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v3H9zM9 12l2 2 4-4" /></svg>,
  files: (p: P) => <svg {...s} {...p}><path d="M8 7h10v14H8z" /><path d="M5 17V4h8" /><path d="M11 12h4M11 16h4" /></svg>,
  map: (p: P) => <svg {...s} {...p}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></svg>,
  flag: (p: P) => <svg {...s} {...p}><path d="M5 21V4h12l-2 4 2 4H5" /></svg>,
  list: (p: P) => <svg {...s} {...p}><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></svg>,
  home: (p: P) => <svg {...s} {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>,
  heart: (p: P) => <svg viewBox="0 0 24 24" aria-hidden focusable={false} {...p}><path fill="currentColor" d="M12 21s-7-4.6-9-9.1C1.6 8.6 3.6 5 7.2 5c2 0 3.4 1.1 4.8 2.7C13.4 6.1 14.8 5 16.8 5c3.6 0 5.6 3.6 4.2 6.9C19 16.4 12 21 12 21z" /></svg>,
  check: (p: P) => <svg {...s} strokeWidth={3} {...p}><path d="M5 12l5 5 9-10" /></svg>,
  arrow: (p: P) => <svg {...s} strokeWidth={2} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  clock: (p: P) => <svg {...s} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
};

export function DrawerGlyph({ name, className }: { name: DrawerIcon; className?: string }) {
  const Icon = D[name];
  return <Icon className={className} />;
}

export const SHELF_GLYPH = { organized: "folder", plan: "cal", everyday: "sun", home: "people" } as const;
