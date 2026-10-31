import type { SVGProps } from "react";
import type { ShelfId, Tint } from "@/lib/shelves";

/**
 * The whole illustration set, drawn inline so nothing is a raster and every
 * color is a token. Soft shading = a second, darker shape; outlines never
 * heavier than 1px. Everything is decorative (aria-hidden) unless a label
 * is passed, in which case it becomes an img with that name.
 */

type Props = SVGProps<SVGSVGElement> & { label?: string };

function Svg({ label, children, ...rest }: Props) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const, focusable: false };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...a11y} {...rest}>
      {children}
    </svg>
  );
}

/* Tint → the token pair used by paper objects. */
const TINT: Record<Tint, { fill: string; deep: string; text: string }> = {
  sky: { fill: "var(--sky)", deep: "#bcd8e8", text: "var(--sky-deep)" },
  mint: { fill: "var(--mint)", deep: "#b9dfc3", text: "var(--mint-deep)" },
  butter: { fill: "var(--butter)", deep: "#f3dc9f", text: "var(--butter-deep)" },
  blush: { fill: "var(--blush)", deep: "#f1c2b7", text: "var(--blush-deep)" },
};

/* ── Small icons (24×24) ─────────────────────────────────────────────────── */

export function IconFolder(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4.2c.7 0 1.3.3 1.8.8l1.2 1.2h5.8A2.5 2.5 0 0 1 21 9.5V17a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17z" fill="#bcd8e8" />
      <path d="M3 10.5A2.5 2.5 0 0 1 5.5 8h13A2.5 2.5 0 0 1 21 10.5V17a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17z" fill="var(--sky-deep)" opacity=".85" />
    </Svg>
  );
}

export function IconCalendar(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <rect x="3" y="5" width="18" height="16" rx="3" fill="#b9dfc3" />
      <rect x="3" y="5" width="18" height="5" rx="3" fill="var(--mint-deep)" opacity=".85" />
      <rect x="7" y="2.5" width="2" height="5" rx="1" fill="var(--mint-deep)" />
      <rect x="15" y="2.5" width="2" height="5" rx="1" fill="var(--mint-deep)" />
      {[0, 1, 2].map((i) => [0, 1].map((j) => <rect key={`${i}${j}`} x={6.5 + i * 4} y={12.5 + j * 3.5} width="2.5" height="2.2" rx=".6" fill="var(--mint-deep)" opacity=".75" />))}
    </Svg>
  );
}

export function IconSun(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <circle cx="12" cy="12" r="5" fill="var(--sun)" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="11.2" y="1.5" width="1.6" height="4" rx=".8" fill="var(--sun)" transform={`rotate(${i * 45} 12 12)`} />
      ))}
    </Svg>
  );
}

export function IconPeople(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <circle cx="8" cy="8.5" r="3" fill="var(--clay-bright)" opacity=".9" />
      <circle cx="16" cy="8.5" r="3" fill="#f1c2b7" />
      <path d="M2.5 19.5c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5z" fill="var(--clay-bright)" opacity=".9" />
      <path d="M11.5 19.5c0-3.3 2-5.5 4.5-5.5s5.5 2.2 5.5 5.5z" fill="#f1c2b7" />
    </Svg>
  );
}

export function IconChecklist(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <rect x="4" y="3" width="16" height="18" rx="3" fill="var(--paper)" stroke="var(--line-strong)" />
      {[7.5, 12, 16.5].map((y, i) => (
        <g key={y}>
          <rect x="7" y={y - 1.5} width="3" height="3" rx=".8" fill={i < 2 ? "var(--sage)" : "var(--line)"} />
          <rect x="12" y={y - 0.6} width="5" height="1.2" rx=".6" fill="var(--ink-faint)" />
        </g>
      ))}
    </Svg>
  );
}

export function IconHeart(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="var(--clay-bright)" opacity=".85" />
    </Svg>
  );
}

export function IconLeaf(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z" fill="var(--sage)" />
      <path d="M5 19C9 14 13 10 18.5 5.5" stroke="var(--sage-deep)" strokeWidth="1" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function IconSearch(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15 15l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </Svg>
  );
}

export function IconArrow(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconLoop(p: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...p}>
      <path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ShelfIcon({ tint, ...p }: Props & { tint: Tint }) {
  if (tint === "sky") return <IconFolder {...p} />;
  if (tint === "mint") return <IconCalendar {...p} />;
  if (tint === "butter") return <IconSun {...p} />;
  return <IconPeople {...p} />;
}

/* ── Leaves and plants ───────────────────────────────────────────────────── */

export function Sprig(p: Props) {
  return (
    <Svg viewBox="0 0 120 160" {...p}>
      <path d="M60 158C58 110 56 70 62 20" stroke="var(--sage-deep)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {[
        [58, 130, -30], [62, 110, 30], [57, 88, -32], [63, 66, 28], [58, 46, -34], [63, 28, 26],
      ].map(([x, y, r], i) => (
        <path key={i} d="M0 0c14-14 34-14 46 0-12 12-32 12-46 0z" fill={i % 2 ? "var(--sage)" : "#a6c6b3"} transform={`translate(${x} ${y}) rotate(${r}) scale(${1 - i * 0.08})`} />
      ))}
    </Svg>
  );
}

/* ── Paper objects for product cards ────────────────────────────────────── */

export type ObjectKind = "binder" | "checklist" | "calendar" | "folder" | "booklet";

export function PaperObject({ kind, tint, ...p }: Props & { kind: ObjectKind; tint: Tint }) {
  const t = TINT[tint];
  return (
    <Svg viewBox="0 0 160 140" {...p}>
      {kind === "binder" ? (
        <g>
          <rect x="34" y="18" width="96" height="112" rx="9" fill="var(--ink)" opacity=".07" transform="translate(4 4)" />
          <rect x="34" y="18" width="96" height="112" rx="9" fill={t.fill} />
          <rect x="34" y="18" width="16" height="112" rx="9" fill={t.deep} />
          {[44, 74, 104].map((y) => <rect key={y} x="38" y={y} width="12" height="5" rx="2.5" fill="var(--paper)" />)}
          <rect x="62" y="40" width="52" height="7" rx="3.5" fill="var(--paper)" />
          <rect x="62" y="54" width="36" height="5" rx="2.5" fill="var(--paper)" opacity=".8" />
          <rect x="108" y="82" width="16" height="30" rx="4" fill={t.deep} />
          <rect x="106" y="110" width="20" height="4" rx="2" fill="var(--paper)" opacity=".6" />
        </g>
      ) : null}
      {kind === "checklist" ? (
        <g>
          <rect x="40" y="22" width="86" height="108" rx="8" fill="var(--ink)" opacity=".07" transform="translate(4 4)" />
          <rect x="40" y="22" width="86" height="108" rx="8" fill={t.deep} />
          <rect x="48" y="34" width="70" height="90" rx="4" fill="var(--paper)" />
          <rect x="68" y="14" width="30" height="16" rx="5" fill={t.text} opacity=".8" />
          {[50, 68, 86, 104].map((y, i) => (
            <g key={y}>
              <rect x="56" y={y} width="9" height="9" rx="2" fill={i < 3 ? t.fill : "var(--line)"} stroke={t.text} strokeWidth=".8" />
              {i < 3 ? <path d={`M58 ${y + 4.5}l2.5 2.5 4.5-5`} fill="none" stroke={t.text} strokeWidth="1.2" strokeLinecap="round" /> : null}
              <rect x="71" y={y + 2.5} width={34 - i * 5} height="4" rx="2" fill="var(--line-strong)" />
            </g>
          ))}
          <path d="M24 44l10 10M18 60h12M28 32l8 6" stroke="var(--sun)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : null}
      {kind === "calendar" ? (
        <g>
          <rect x="34" y="26" width="92" height="100" rx="9" fill="var(--ink)" opacity=".07" transform="translate(4 4)" />
          <rect x="34" y="26" width="92" height="100" rx="9" fill="var(--paper)" />
          <path d="M34 35a9 9 0 0 1 9-9h74a9 9 0 0 1 9 9v17H34z" fill={t.deep} />
          <rect x="52" y="16" width="6" height="18" rx="3" fill={t.text} />
          <rect x="102" y="16" width="6" height="18" rx="3" fill={t.text} />
          {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={44 + c * 19} y={60 + r * 19} width="14" height="13" rx="3" fill={r === 1 && c === 2 ? t.text : t.fill} opacity={r === 1 && c === 2 ? 0.9 : 1} />))}
        </g>
      ) : null}
      {kind === "folder" ? (
        <g>
          <rect x="30" y="30" width="100" height="94" rx="9" fill="var(--ink)" opacity=".07" transform="translate(4 4)" />
          <path d="M30 40a8 8 0 0 1 8-8h30l10 10h44a8 8 0 0 1 8 8v66a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8z" fill={t.deep} />
          <rect x="40" y="38" width="72" height="80" rx="3" fill="var(--paper)" transform="rotate(-3 76 78)" />
          <rect x="52" y="52" width="40" height="5" rx="2.5" fill="var(--line-strong)" transform="rotate(-3 76 78)" />
          <rect x="52" y="64" width="50" height="4" rx="2" fill="var(--line)" transform="rotate(-3 76 78)" />
          <path d="M30 60h100v56a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8z" fill={t.fill} />
          <rect x="30" y="60" width="100" height="6" fill={t.deep} opacity=".5" />
        </g>
      ) : null}
      {kind === "booklet" ? (
        <g>
          <rect x="38" y="20" width="84" height="110" rx="7" fill="var(--ink)" opacity=".07" transform="translate(5 4)" />
          <rect x="44" y="24" width="84" height="108" rx="7" fill={t.deep} />
          <rect x="38" y="20" width="84" height="110" rx="7" fill={t.fill} />
          <rect x="38" y="20" width="8" height="110" rx="4" fill={t.deep} />
          <rect x="56" y="40" width="50" height="8" rx="4" fill="var(--paper)" />
          <rect x="56" y="56" width="52" height="4" rx="2" fill="var(--paper)" opacity=".85" />
          <rect x="56" y="66" width="44" height="4" rx="2" fill="var(--paper)" opacity=".85" />
          <rect x="56" y="76" width="48" height="4" rx="2" fill="var(--paper)" opacity=".85" />
          <circle cx="98" cy="108" r="12" fill="var(--paper)" />
          <path d="M92 108l4 4 8-8" fill="none" stroke={t.text} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ) : null}
    </Svg>
  );
}

/** A phone with three chips: the free logger, as a paper-ish object. */
export function PhoneObject({ tint = "blush", ...p }: Props & { tint?: Tint }) {
  const t = TINT[tint];
  return (
    <Svg viewBox="0 0 160 140" {...p}>
      <rect x="52" y="8" width="60" height="124" rx="12" fill="var(--ink)" opacity=".07" transform="translate(4 4)" />
      <rect x="52" y="8" width="60" height="124" rx="12" fill="var(--ink)" />
      <rect x="56" y="14" width="52" height="112" rx="9" fill="var(--paper)" />
      <rect x="62" y="24" width="30" height="5" rx="2.5" fill="var(--ink)" opacity=".8" />
      <rect x="62" y="34" width="20" height="3" rx="1.5" fill="var(--ink-faint)" />
      {[48, 64, 80].map((y, i) => <rect key={y} x="62" y={y} width={i === 1 ? 40 : 28} height="11" rx="5.5" fill={i === 1 ? t.deep : t.fill} />)}
      <rect x="62" y="104" width="40" height="12" rx="6" fill="var(--clay-bright)" />
      <path d="M20 60l12 6M16 76h14M24 44l8 10" stroke={t.deep} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

/* ── Sample page from the Home ABC Printable ────────────────────────────── */

export function SampleLogSheet(p: Props) {
  const rows = [84, 124, 164, 204, 244, 284, 324];
  return (
    <Svg viewBox="0 0 320 400" {...p}>
      <rect x="0" y="0" width="320" height="400" rx="6" fill="var(--paper)" />
      <text x="24" y="38" fill="var(--ink)" fontFamily="var(--font-display)" fontSize="19" fontWeight="500">ABC log</text>
      <text x="24" y="54" fill="var(--ink-mute)" fontFamily="var(--font-sans)" fontSize="8.5">Write what you saw, not what it means.</text>
      <text x="296" y="38" textAnchor="end" fill="var(--ink-mute)" fontFamily="var(--font-sans)" fontSize="8.5">Week of ____ / ____</text>
      <text x="296" y="54" textAnchor="end" fill="var(--ink-mute)" fontFamily="var(--font-sans)" fontSize="8.5">For: ______________</text>
      {/* header row */}
      <rect x="24" y="64" width="272" height="20" rx="3" fill="var(--sage-tint)" />
      {[
        [24, "When"], [78, "Right before"], [154, "What happened"], [230, "Right after"],
      ].map(([x, l]) => (
        <text key={String(l)} x={Number(x) + 6} y="77" fill="var(--ink)" fontFamily="var(--font-sans)" fontSize="8.5" fontWeight="600">{l}</text>
      ))}
      {/* rows */}
      {rows.map((y, i) => (
        <g key={y}>
          <line x1="24" y1={y} x2="296" y2={y} stroke="var(--line)" />
          {i < rows.length - 1 ? [78, 154, 230].map((x) => <line key={x} x1={x} y1={y} x2={x} y2={y + 40} stroke="var(--line)" />) : null}
        </g>
      ))}
      <line x1="24" y1="84" x2="24" y2="324" stroke="var(--line)" />
      <line x1="296" y1="84" x2="296" y2="324" stroke="var(--line)" />
      {/* one sample entry, clearly a sample */}
      <g fontFamily="var(--font-hand)" fontSize="12" fill="var(--ink-soft)">
        <text x="30" y="108">Tue 7:40a</text>
        <text x="84" y="104">Asked to put</text>
        <text x="84" y="118">shoes on</text>
        <text x="160" y="104">Dropped to</text>
        <text x="160" y="118">floor, ~2 min</text>
        <text x="236" y="104">Waited, then</text>
        <text x="236" y="118">offered help</text>
      </g>
      {/* legend */}
      <text x="24" y="350" fill="var(--ink-mute)" fontFamily="var(--font-sans)" fontSize="8">A · right before &nbsp; B · what happened &nbsp; C · right after</text>
      <text x="24" y="364" fill="var(--ink-mute)" fontFamily="var(--font-sans)" fontSize="8">Sample entry shown. Print on US Letter.</text>
      <text x="296" y="382" textAnchor="end" fill="var(--ink-faint)" fontFamily="var(--font-sans)" fontSize="7.5">The Support Shelf · Home ABC Printable</text>
    </Svg>
  );
}

/* ── Per-shelf scenes: a small still life for each panel ─────────────────── */

function Pencil({ x, y, r = -30 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x="0" y="0" width="70" height="10" rx="2" fill="var(--sun)" />
      <rect x="0" y="0" width="12" height="10" rx="2" fill="var(--blush)" />
      <path d="M70 0l12 5-12 5z" fill="#e8d7b8" />
      <path d="M78 3.4l4 1.6-4 1.6z" fill="var(--ink)" opacity=".7" />
    </g>
  );
}

function Clock({ x, y, tint }: { x: number; y: number; tint: Tint }) {
  const t = TINT[tint];
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="22" fill="var(--paper)" />
      <circle cx="0" cy="0" r="22" fill="none" stroke={t.deep} strokeWidth="3" />
      <path d="M0 0V-12M0 0l8 5" stroke={t.text} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="0" cy="0" r="1.8" fill={t.text} />
    </g>
  );
}

function Heart({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 10S-12 2.5-12-5A6 6 0 0 1 0-7 6 6 0 0 1 12-5c0 7.5-12 15-12 15z" fill="var(--clay-bright)" opacity=".85" />
  );
}

/**
 * One still life per shelf, built from the same paper objects the cards
 * use. Large enough to read as a scene, quiet enough to sit beside copy.
 */
export function ShelfScene({ id, ...p }: Props & { id: ShelfId }) {
  return (
    <Svg viewBox="0 0 260 200" {...p}>
      {/* soft ground shadow */}
      <ellipse cx="130" cy="186" rx="100" ry="8" fill="var(--ink)" opacity=".07" />
      {id === "organized" ? (
        <g>
          <g transform="translate(10 40) rotate(-6)" opacity=".9"><PaperObject kind="folder" tint="sky" width="150" height="130" /></g>
          <g transform="translate(96 30)"><PaperObject kind="binder" tint="sky" width="170" height="150" /></g>
          <g transform="translate(176 96) rotate(8)"><PaperObject kind="checklist" tint="mint" width="90" height="80" /></g>
          <g transform="translate(10 150) rotate(-100) scale(.5)"><Sprig width="120" height="160" /></g>
        </g>
      ) : null}
      {id === "plan" ? (
        <g>
          <g transform="translate(18 34)"><PaperObject kind="calendar" tint="mint" width="170" height="150" /></g>
          <g transform="translate(140 44) rotate(6)"><PaperObject kind="booklet" tint="mint" width="120" height="110" /></g>
          <Pencil x={150} y={170} r={-28} />
          <Clock x={44} y={150} tint="mint" />
        </g>
      ) : null}
      {id === "everyday" ? (
        <g>
          <circle cx="176" cy="68" r="46" fill="var(--sun-tint)" />
          <circle cx="176" cy="68" r="30" fill="var(--sun)" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="174" y="12" width="4" height="12" rx="2" fill="var(--sun)" transform={`rotate(${i * 45} 176 68)`} />
          ))}
          <g transform="translate(16 56)"><PaperObject kind="checklist" tint="butter" width="150" height="130" /></g>
          <Clock x={214} y={150} tint="butter" />
          <g transform="translate(120 140) rotate(4)">
            <rect x="0" y="0" width="56" height="40" rx="6" fill="var(--paper)" />
            <rect x="8" y="10" width="40" height="5" rx="2.5" fill="var(--butter)" />
            <rect x="8" y="20" width="28" height="5" rx="2.5" fill="var(--butter)" />
            <circle cx="46" cy="28" r="5" fill="var(--sun)" />
          </g>
        </g>
      ) : null}
      {id === "home" ? (
        <g>
          {/* a roofline, barely there */}
          <path d="M40 92L130 30l90 62" fill="none" stroke="var(--blush-deep)" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
          <g transform="translate(22 48)"><PhoneObject tint="blush" width="150" height="132" /></g>
          <g transform="translate(150 88)">
            <circle cx="24" cy="26" r="16" fill="var(--clay-bright)" opacity=".9" />
            <circle cx="64" cy="30" r="13" fill="#f1c2b7" />
            <path d="M-2 86c0-18 12-30 26-30s26 12 26 30z" fill="var(--clay-bright)" opacity=".9" />
            <path d="M42 86c0-15 9-26 22-26s22 11 22 26z" fill="#f1c2b7" />
          </g>
          <Heart x={222} y={64} s={1.1} />
          <Heart x={238} y={88} s={0.7} />
        </g>
      ) : null}
    </Svg>
  );
}

/* ── Scenery ─────────────────────────────────────────────────────────────── */

/** A gentle wave used as a section divider; pale aqua by default. */
export function Wave({ flip = false, color = "var(--aqua)", className = "" }: { flip?: boolean; color?: string; className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 1440 80" preserveAspectRatio="none" className={`block h-10 w-full sm:h-16 ${flip ? "rotate-180" : ""} ${className}`}>
      <path d="M0 40C180 80 320 0 520 24s340 60 540 28S1300 0 1440 36V80H0z" fill={color} />
    </svg>
  );
}

/** Soft sun with leaves, for the closing section. */
export function SunAndLeaves(p: Props) {
  return (
    <Svg viewBox="0 0 400 200" {...p}>
      <circle cx="300" cy="120" r="70" fill="var(--sun-tint)" />
      <circle cx="300" cy="120" r="44" fill="var(--sun)" opacity=".9" />
      <g transform="translate(40 200) rotate(-100)">
        <Sprig width="130" height="180" />
      </g>
      <g transform="translate(120 190) rotate(-70) scale(.8)">
        <Sprig width="130" height="180" />
      </g>
    </Svg>
  );
}

/** Loose leaves for corners. */
export function CornerLeaves({ side = "left", ...p }: Props & { side?: "left" | "right" }) {
  return (
    <Svg viewBox="0 0 200 200" {...p}>
      <g transform={side === "left" ? "translate(10 200) rotate(-110)" : "translate(190 200) rotate(-70) scale(-1 1)"}>
        <Sprig width="150" height="200" />
      </g>
      <g transform={side === "left" ? "translate(70 200) rotate(-80) scale(.7)" : "translate(130 200) rotate(-100) scale(-.7 .7)"}>
        <Sprig width="150" height="200" />
      </g>
    </Svg>
  );
}
