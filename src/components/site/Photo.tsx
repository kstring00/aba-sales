import Image from "next/image";
import type { Asset } from "@/lib/assets";

const TONES: Record<Asset["tone"], string> = {
  paper: "from-[#efe6d6] via-[#f5eee1] to-[#e7dcc7]",
  sage: "from-[#dfe7da] via-[#ebefe6] to-[#cfdbc9]",
  blue: "from-[#d6e3e8] via-[#e6eef1] to-[#c9d9df]",
  lavender: "from-[#e2dbe9] via-[#ece7f0] to-[#d3c9dc]",
  wood: "from-[#d9c3a6] via-[#e9d9c2] to-[#c7a983]",
};

type Props = {
  asset: Asset;
  variant?: "desktop" | "mobile";
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Show the brief caption on the placeholder (off in production chrome). */
  showBrief?: boolean;
};

/**
 * Art-directed photo slot. Renders the real image when the manifest has one;
 * otherwise a quiet, textured placeholder in the slot's tone so layout,
 * rhythm, and alt text are right before photography arrives.
 */
export function Photo({ asset, variant = "desktop", priority = false, sizes = "100vw", className = "", showBrief = true }: Props) {
  const ratio = asset.crop[variant];
  if (asset.src) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ aspectRatio: ratio }}>
        <Image src={asset.src} alt={asset.alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    );
  }
  return (
    <figure
      role="img"
      aria-label={`Photograph placeholder: ${asset.alt}`}
      className={`grain relative overflow-hidden rounded-lg bg-gradient-to-br ${TONES[asset.tone]} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/* A window-light wash, so the placeholder has depth rather than flatness. */}
      <div aria-hidden className="absolute -right-1/4 -top-1/3 h-[120%] w-[80%] rotate-12 bg-gradient-to-b from-white/50 to-transparent blur-2xl" />
      {showBrief ? (
        <figcaption className="absolute bottom-3 left-3 right-3 text-[12px] leading-snug text-ink-soft/80">
          <span className="font-medium text-ink-soft">{asset.title}.</span> Photograph to come.
        </figcaption>
      ) : null}
    </figure>
  );
}
