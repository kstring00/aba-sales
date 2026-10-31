import type { SVGProps } from "react";
import type { Tint } from "@/lib/shelves";

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

function Plant({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* leaves fan out from the pot rim */}
      {[
        [-10, -14, -70, 1.15], [8, -22, -35, 1.25], [26, -14, 5, 1.1], [40, -30, 35, 1.05], [-30, -22, -110, 0.95], [16, -46, -18, 0.9], [-8, -48, -58, 0.8],
      ].map(([lx, ly, r, s], i) => (
        <g key={i} transform={`translate(${lx} ${ly}) rotate(${r}) scale(${s})`}>
          <path d="M0 0C-4-28 10-56 24-68 30-50 26-18 4 2z" fill={i % 3 === 0 ? "#7fae92" : i % 3 === 1 ? "var(--sage)" : "#a6c6b3"} />
          <path d="M3 0C6-24 12-44 22-62" stroke="var(--sage-deep)" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".6" />
        </g>
      ))}
      {/* pot */}
      <path d="M-26 0h64l-6 46a6 6 0 0 1-6 5h-40a6 6 0 0 1-6-5z" fill="#e4cbb0" />
      <path d="M-26 0h64l-2 14h-60z" fill="#d6b995" />
      <path d="M8 14h26l-5 36h-18z" fill="#d6b995" opacity=".35" />
    </g>
  );
}

/* ── Upright folders (hero) ──────────────────────────────────────────────── */

function StandingFolder({ x, y, tint, lines, icon, href, label, w = 76, h = 176 }: { x: number; y: number; tint: Tint; lines: string[]; icon: Tint; href: string; label: string; w?: number; h?: number }) {
  const t = TINT[tint];
  return (
    <a href={href} aria-label={label} className="hero-folder-link">
      <g transform={`translate(${x} ${y})`}>
        <g className="hero-folder">
          {/* back spine shadow */}
          <rect x="3" y="4" width={w} height={h} rx="7" fill="var(--ink)" opacity=".06" />
          <rect x="0" y="0" width={w} height={h} rx="7" fill={t.fill} />
          {/* folder tab */}
          <path d={`M10 0h${w * 0.45}a6 6 0 0 1 6 6v6H4V6a6 6 0 0 1 6-6z`} fill={t.deep} />
          {/* soft gradient edge */}
          <rect x={w - 10} y="0" width="10" height={h} rx="7" fill={t.deep} opacity=".55" />
          {/* label */}
          <text aria-hidden x={w / 2} y={h * 0.44} textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-display)" fontSize="15.5" fontWeight="500" letterSpacing="-0.2">
            {lines.map((l, i) => (
              <tspan key={l} x={w / 2} dy={i === 0 ? 0 : 19}>{l}</tspan>
            ))}
          </text>
          <g transform={`translate(${w / 2 - 17} ${h * 0.64})`}>
            <ShelfIcon tint={icon} width="34" height="34" />
          </g>
        </g>
      </g>
    </a>
  );
}

function Mug({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      <path d="M78 22a14 14 0 0 1 0 28h-6V22z" fill="none" stroke="var(--line-strong)" strokeWidth="6" />
      <path d="M0 0h74v70a16 16 0 0 1-16 16H16A16 16 0 0 1 0 70z" fill="var(--paper)" />
      <path d="M0 0h74v10H0z" fill="var(--cream-deep)" />
      <path d="M58 0h16v70a16 16 0 0 1-16 16z" fill="var(--cream-deep)" opacity=".6" />
      <text x="37" y="36" textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-hand)" fontSize="15" fontWeight="500">
        <tspan x="37" dy="0">Small steps,</tspan>
        <tspan x="37" dy="18">brighter</tspan>
        <tspan x="37" dy="18">days</tspan>
      </text>
    </g>
  );
}

function PinnedNote({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(4)`} aria-hidden>
      <rect x="4" y="6" width="76" height="80" rx="4" fill="var(--ink)" opacity=".07" />
      <rect x="0" y="0" width="76" height="80" rx="4" fill="var(--sun-tint)" />
      <circle cx="38" cy="6" r="4.5" fill="var(--clay-bright)" />
      <circle cx="36.5" cy="4.5" r="1.4" fill="#ffffff" opacity=".7" />
      <text x="38" y="34" textAnchor="middle" fill="var(--ink)" fontFamily="var(--font-hand)" fontSize="17" fontWeight="500">
        <tspan x="38" dy="0">YOU</tspan>
        <tspan x="38" dy="19">GOT</tspan>
        <tspan x="38" dy="19">THIS</tspan>
      </text>
    </g>
  );
}

/**
 * Hero: four tinted paper folders standing on a wooden shelf, a plant to the
 * left, a mug to the right, a pinned note above. Each folder is a link to
 * its shelf and tilts off the board on hover and focus.
 */
export function HeroScene(p: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 540" {...p}>
      <title>Four shelves: Get Organized, Make a Plan, Everyday Life, Support at Home</title>
      {/* wall glow */}
      <ellipse cx="350" cy="310" rx="330" ry="230" fill="var(--paper)" opacity=".55" />
      {/* trailing leaves top right, behind the note */}
      <g transform="translate(600 10) rotate(18)">
        <Sprig width="100" height="150" />
      </g>
      <PinnedNote x={548} y={70} />
      {/* shelf board */}
      <g>
        <rect x="22" y="422" width="636" height="24" rx="4" fill="var(--wood)" />
        <rect x="22" y="438" width="636" height="10" rx="3" fill="var(--wood-deep)" />
        <rect x="40" y="448" width="600" height="14" fill="var(--ink)" opacity=".06" />
      </g>
      <Plant x={128} y={372} scale={1.15} />
      <StandingFolder x={206} y={212} tint="sky" lines={["Get", "Organized"]} icon="sky" w={88} h={210} href="#shelf-organized" label="Shelf 1, Get Organized" />
      <StandingFolder x={302} y={204} tint="mint" lines={["Make", "a Plan"]} icon="mint" w={88} h={218} href="#shelf-plan" label="Shelf 2, Make a Plan" />
      <StandingFolder x={398} y={212} tint="butter" lines={["Everyday", "Life"]} icon="butter" w={88} h={210} href="#shelf-everyday" label="Shelf 3, Everyday Life" />
      <StandingFolder x={494} y={218} tint="blush" lines={["Support", "at Home"]} icon="blush" w={88} h={204} href="#shelf-home" label="Shelf 4, Support at Home" />
      <g transform="translate(570 338) scale(.95)">
        <Mug x={0} y={0} />
      </g>
      {/* small sprig in front, left */}
      <g transform="translate(36 320) rotate(-14)">
        <Sprig width="76" height="110" />
      </g>
    </svg>
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
