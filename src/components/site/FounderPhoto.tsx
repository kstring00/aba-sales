import Image from "next/image";
import { publicEnv } from "@/lib/env";

/**
 * The founder photo slot. Renders nothing until NEXT_PUBLIC_FOUNDER_PHOTO
 * names a file under /public (for example "/founder.jpg"). No placeholder
 * text or image ever ships (audit F-13).
 */
export function FounderPhoto({ className = "" }: { className?: string }) {
  const src = publicEnv.founderPhoto;
  if (!src) return null;
  return (
    <Image
      src={src}
      alt="Kyle Stringham, founder of The Support Shelf"
      width={160}
      height={160}
      className={`h-28 w-28 rounded-pill object-cover shadow-soft sm:h-32 sm:w-32 ${className}`}
    />
  );
}
