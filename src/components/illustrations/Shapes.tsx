/**
 * Original illustration system for the bright theme: waves, sun, tabs,
 * notebooks, folders, botanicals, ribbons. Pure SVG, themed by CSS vars,
 * aria-hidden (decorative) unless a label is passed.
 */
type P = { className?: string; label?: string };

const a11y = (label?: string) => (label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true });

/** Layered ocean waves. Fills its box; use as a section bottom edge. */
export function Waves({ className = "", label }: P) {
  return (
    <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className={className} {...a11y(label)}>
      <path d="M0 120 C 240 40, 480 200, 720 120 S 1200 40, 1440 120 V220 H0 Z" fill="var(--turq)" opacity="0.45" />
      <path d="M0 150 C 260 90, 520 210, 780 150 S 1240 90, 1440 150 V220 H0 Z" fill="var(--glass)" opacity="0.8" />
      <path d="M0 180 C 300 130, 600 230, 900 180 S 1300 130, 1440 180 V220 H0 Z" fill="var(--white)" />
    </svg>
  );
}

/** Radiating sunlight. */
export function Sun({ className = "", label }: P) {
  return (
    <svg viewBox="0 0 400 400" className={className} {...a11y(label)}>
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="var(--sun)" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="var(--sun)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--sun)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="200" fill="url(#sunGlow)" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="196" y="20" width="8" height="70" rx="4" fill="var(--sun)" opacity="0.7" transform={`rotate(${i * 30} 200 200)`} />
      ))}
      <circle cx="200" cy="200" r="78" fill="var(--sun)" />
    </svg>
  );
}

/** A tabbed binder, slightly rotated, with colored index tabs. */
export function Binder({ className = "", label, tone = "ocean", title }: P & { tone?: "ocean" | "teal" | "leaf" | "coral"; title?: string }) {
  const fill = `var(--${tone})`;
  return (
    <svg viewBox="0 0 320 400" className={className} {...a11y(label)}>
      <defs>
        <linearGradient id={`sheen-${tone}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* pages */}
      <rect x="34" y="22" width="262" height="356" rx="10" fill="#ffffff" />
      <rect x="40" y="16" width="262" height="356" rx="10" fill="#f6f9fa" />
      {/* cover */}
      <rect x="20" y="30" width="262" height="356" rx="14" fill={fill} />
      <rect x="20" y="30" width="262" height="356" rx="14" fill={`url(#sheen-${tone})`} />
      {/* spine */}
      <rect x="20" y="30" width="26" height="356" rx="8" fill="#000" opacity="0.14" />
      {/* tabs */}
      <rect x="282" y="70" width="26" height="54" rx="8" fill="var(--sun)" />
      <rect x="282" y="140" width="26" height="54" rx="8" fill="var(--turq)" />
      <rect x="282" y="210" width="26" height="54" rx="8" fill="var(--coral)" />
      <rect x="282" y="280" width="26" height="54" rx="8" fill="var(--leaf)" />
      {/* label plate */}
      <rect x="62" y="80" width="180" height="92" rx="10" fill="#fff" opacity="0.94" />
      <rect x="78" y="100" width="110" height="10" rx="5" fill="var(--ink)" opacity="0.75" />
      <rect x="78" y="122" width="148" height="8" rx="4" fill="var(--ink)" opacity="0.35" />
      <rect x="78" y="140" width="92" height="8" rx="4" fill="var(--ink)" opacity="0.35" />
      {title ? (
        <text x="78" y="330" fill="#fff" fontFamily="var(--font-display)" fontSize="22" fontWeight="500">{title}</text>
      ) : null}
    </svg>
  );
}

/** Open spiral notebook with ruled lines. */
export function Notebook({ className = "", label, tone = "turq" }: P & { tone?: "turq" | "coral" | "leaf" | "sun" }) {
  return (
    <svg viewBox="0 0 420 300" className={className} {...a11y(label)}>
      <rect x="10" y="20" width="200" height="260" rx="12" fill="#fff" />
      <rect x="210" y="20" width="200" height="260" rx="12" fill="#f7fafb" />
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <rect x="34" y={60 + i * 26} width={140 - (i % 3) * 22} height="6" rx="3" fill="var(--ink)" opacity="0.22" />
          <rect x="236" y={60 + i * 26} width={150 - ((i + 1) % 3) * 24} height="6" rx="3" fill="var(--ink)" opacity="0.14" />
        </g>
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx="210" cy={40 + i * 28} r="7" fill={`var(--${tone})`} />
      ))}
      <rect x="236" y="208" width="120" height="30" rx="8" fill={`var(--${tone})`} opacity="0.9" />
    </svg>
  );
}

/** Stack of loose sheets fanned out. */
export function Sheets({ className = "", label }: P) {
  return (
    <svg viewBox="0 0 300 360" className={className} {...a11y(label)}>
      <rect x="40" y="40" width="200" height="280" rx="10" fill="#fff" transform="rotate(-8 140 180)" opacity="0.9" />
      <rect x="50" y="36" width="200" height="280" rx="10" fill="#fff" transform="rotate(-3 150 176)" />
      <rect x="60" y="30" width="200" height="280" rx="10" fill="#fff" transform="rotate(3 160 170)" />
      <g transform="rotate(3 160 170)">
        <rect x="84" y="62" width="110" height="10" rx="5" fill="var(--ink)" opacity="0.7" />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x="84" y={92 + i * 24} width={152 - (i % 2) * 30} height="6" rx="3" fill="var(--ink)" opacity="0.18" />
        ))}
        <rect x="84" y="262" width="60" height="22" rx="6" fill="var(--sun)" />
        <rect x="150" y="262" width="60" height="22" rx="6" fill="var(--glass)" />
      </g>
    </svg>
  );
}

/** Folder with a tab. */
export function Folder({ className = "", label, tone = "coral" }: P & { tone?: "coral" | "ocean" | "leaf" | "turq" | "sun" }) {
  return (
    <svg viewBox="0 0 320 240" className={className} {...a11y(label)}>
      <path d="M16 50 h92 l20 -22 h176 a16 16 0 0 1 16 16 v174 a16 16 0 0 1 -16 16 h-272 a16 16 0 0 1 -16 -16 z" fill={`var(--${tone})`} opacity="0.85" />
      <rect x="40" y="60" width="240" height="150" rx="8" fill="#fff" />
      <rect x="16" y="80" width="288" height="144" rx="14" fill={`var(--${tone})`} />
      <rect x="16" y="80" width="288" height="144" rx="14" fill="#fff" opacity="0.12" />
    </svg>
  );
}

/** Delicate botanical sprig. */
export function Sprig({ className = "", label }: P) {
  return (
    <svg viewBox="0 0 120 220" className={className} {...a11y(label)}>
      <path d="M60 210 C 62 150, 58 100, 60 20" stroke="var(--leaf-deep)" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[40, 70, 100, 130, 160].map((y, i) => (
        <g key={y}>
          <path d={`M60 ${y} q -34 -10 -40 -34 q 30 2 40 34`} fill="var(--leaf)" opacity={0.9 - i * 0.1} />
          <path d={`M60 ${y + 14} q 34 -10 40 -34 q -30 2 -40 34`} fill="var(--leaf)" opacity={0.85 - i * 0.1} />
        </g>
      ))}
    </svg>
  );
}

/** Curved ribbon path, for connecting shapes. */
export function Ribbon({ className = "", label }: P) {
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="none" className={className} {...a11y(label)}>
      <path d="M0 140 C 150 40, 300 240, 450 110 S 600 60, 600 60" stroke="var(--turq)" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M0 160 C 160 70, 320 250, 470 130 S 600 90, 600 90" stroke="var(--sun)" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

/** Soft overlapping organic blobs for section backgrounds. */
export function Blobs({ className = "", label }: P) {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="none" className={className} {...a11y(label)}>
      <ellipse cx="600" cy="120" rx="260" ry="160" fill="var(--turq)" opacity="0.18" />
      <ellipse cx="220" cy="380" rx="300" ry="170" fill="var(--glass)" opacity="0.55" />
      <ellipse cx="520" cy="420" rx="200" ry="120" fill="var(--sun)" opacity="0.5" />
    </svg>
  );
}
