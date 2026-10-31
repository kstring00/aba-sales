import type { SVGProps } from "react";
import type { FunctionCode } from "@/lib/abc/types";

/** Small 1.6px line icons for the tracker. Decorative; labels carry meaning. */
type P = SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, focusable: false };

export const I = {
  lock: (p: P) => <svg {...base} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>,
  calendar: (p: P) => <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  chevron: (p: P) => <svg {...base} {...p}><path d="M6 9l6 6 6-6" /></svg>,
  plus: (p: P) => <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>,
  check: (p: P) => <svg {...base} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
  chart: (p: P) => <svg {...base} {...p}><path d="M4 20h16M7 16v-5M12 16V8M17 16v-3" /></svg>,
  book: (p: P) => <svg {...base} {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /></svg>,
  bulb: (p: P) => <svg {...base} {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg>,
  info: (p: P) => <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>,
  heart: (p: P) => <svg {...base} {...p}><path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z" /></svg>,
  search: (p: P) => <svg {...base} {...p}><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></svg>,
  people: (p: P) => <svg {...base} {...p}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.5 1.6-4.5 4-5" /></svg>,
  // behaviors
  hand: (p: P) => <svg {...base} {...p}><path d="M8 13V6a1.5 1.5 0 0 1 3 0v6M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.4-3.4L3 13.5a1.5 1.5 0 0 1 2.6-1.5L8 15" /></svg>,
  mouth: (p: P) => <svg {...base} {...p}><path d="M3 12c3-5 15-5 18 0-3 5-15 5-18 0z" /><path d="M7 12h10M9 12v2M12 12v2.5M15 12v2" /></svg>,
  sound: (p: P) => <svg {...base} {...p}><path d="M4 10v4h3l4 3V7l-4 3zM15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /></svg>,
  down: (p: P) => <svg {...base} {...p}><path d="M12 4v13M6 11l6 6 6-6M4 21h16" /></svg>,
  ban: (p: P) => <svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" /></svg>,
  throw: (p: P) => <svg {...base} {...p}><path d="M4 18c4-9 10-12 15-12M15 6h4v4" /><circle cx="6" cy="18" r="1.5" /></svg>,
  run: (p: P) => <svg {...base} {...p}><circle cx="14" cy="5" r="1.8" /><path d="M10 21l2.5-6-2.5-2 1-5 3 1.5L17 12M9 12l-3 1M12 15l4 2 1 4" /></svg>,
  bandage: (p: P) => <svg {...base} {...p}><rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-35 12 12)" /><path d="M11 11l2 2M13 11l-2 2" /></svg>,
  box: (p: P) => <svg {...base} {...p}><path d="M4 8l8-4 8 4-8 4zM4 8v9l8 4 8-4V8M12 12v9" /><path d="M9 6.5l6 3" /></svg>,
  storm: (p: P) => <svg {...base} {...p}><path d="M13 3L6 13h5l-1 8 7-11h-5z" /></svg>,
  climb: (p: P) => <svg {...base} {...p}><path d="M4 20h4v-4h4v-4h4V8h4" /></svg>,
  drop: (p: P) => <svg {...base} {...p}><path d="M12 3s6 7 6 11.5a6 6 0 0 1-12 0C6 10 12 3 12 3z" /></svg>,
  dot: (p: P) => <svg {...base} {...p}><circle cx="12" cy="12" r="4" /></svg>,
  // functions
  exit: (p: P) => <svg {...base} {...p}><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M14 8l4 4-4 4M9 12h9" /></svg>,
  star: (p: P) => <svg {...base} {...p}><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" /></svg>,
  waves: (p: P) => <svg {...base} {...p}><path d="M3 9c3-3 6 3 9 0s6-3 9 0M3 15c3-3 6 3 9 0s6-3 9 0" /></svg>,
  question: (p: P) => <svg {...base} {...p}><path d="M9 9.5a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4M12 18h.01" /></svg>,
};

const BEHAVIOR_ICONS: Array<[RegExp, keyof typeof I]> = [
  [/hit|slap|punch/i, "hand"], [/bit/i, "mouth"], [/scream|yell|shout|cry/i, "sound"], [/drop|floor|flop/i, "down"],
  [/refus|no\b/i, "ban"], [/throw/i, "throw"], [/run|elop|bolt/i, "run"], [/self|injur|head/i, "bandage"],
  [/property|destr|break/i, "box"], [/tantrum|meltdown/i, "storm"], [/climb/i, "climb"], [/spit/i, "drop"],
];

export function BehaviorIcon({ label, className }: { label: string; className?: string }) {
  const key = BEHAVIOR_ICONS.find(([re]) => re.test(label))?.[1] ?? "dot";
  const Icon = I[key];
  return <Icon className={className} />;
}

const FUNCTION_ICONS: Record<FunctionCode, keyof typeof I> = { attention: "people", escape: "exit", access: "star", sensory: "waves", pain: "plus", not_sure: "question" };

export function FunctionIcon({ code, className }: { code: FunctionCode; className?: string }) {
  const Icon = I[FUNCTION_ICONS[code]];
  return <Icon className={className} />;
}
