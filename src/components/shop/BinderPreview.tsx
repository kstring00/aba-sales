"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import type { Image as Img } from "@/lib/shopify/types";

/**
 * Interaction two and four: "Open the binder" and the print preview.
 * Side tabs pick a page; a soft paper transition shows it; arrow keys and
 * a plain previous/next navigator always work. Static fallback when there
 * is a single image. Preview images are the actual product pages.
 */
export function BinderPreview({ images, title, format }: { images: Img[]; title: string; format: string | null }) {
  const [index, setIndex] = useState(0);
  const [turning, setTurning] = useState(false);
  const id = useId();
  const count = images.length;
  const current = images[index] ?? images[0];

  function go(next: number) {
    if (count < 2) return;
    const clamped = ((next % count) + count) % count;
    if (clamped === index) return;
    setTurning(true);
    setIndex(clamped);
  }

  useEffect(() => {
    if (!turning) return;
    const t = setTimeout(() => setTurning(false), 240);
    return () => clearTimeout(t);
  }, [turning, index]);

  if (!current) {
    return (
      <div className="grain flex aspect-[4/5] items-center justify-center rounded-lg bg-cream-deep p-8 text-center shadow-soft">
        <p className="text-[15px] text-ink-mute">Page previews are on their way. The description below lists exactly what&apos;s included.</p>
      </div>
    );
  }

  const pageLabel = `Page ${index + 1} of ${count}`;
  return (
    <section aria-labelledby={`${id}-h`} className="space-y-3">
      <h2 id={`${id}-h`} className="sr-only">Preview the pages of {title}</h2>
      <div
        className="relative flex gap-3"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
        }}
      >
        {count > 1 ? (
          <div role="tablist" aria-label="Pages" aria-orientation="vertical" className="flex w-10 shrink-0 flex-col gap-1 pt-6">
            {images.map((img, i) => (
              <button
                key={img.url}
                role="tab"
                aria-selected={i === index}
                aria-controls={`${id}-page`}
                onClick={() => go(i)}
                className={`tnum min-h-11 rounded-l-md border-y border-l text-[13px] ${i === index ? "border-line-strong bg-paper text-ink shadow-soft" : "border-transparent bg-cream-deep text-ink-mute hover:bg-cream"}`}
                aria-label={`Page ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        ) : null}
        <div id={`${id}-page`} role={count > 1 ? "tabpanel" : undefined} className="relative flex-1">
          <div className={`grain relative aspect-[4/5] overflow-hidden rounded-lg bg-paper shadow-lift transition-transform duration-200 ease-out ${turning ? "scale-[0.995]" : ""} motion-reduce:transition-none`}>
            <Image
              key={current.url}
              src={current.url}
              alt={current.altText ?? `${title}, ${pageLabel.toLowerCase()}`}
              fill
              priority={index === 0}
              sizes="(min-width: 768px) 55vw, 100vw"
              className={`object-contain p-2 ${turning ? "fade-in" : ""}`}
            />
          </div>
          {/* Page edge, so it reads as paper rather than a screenshot */}
          <div aria-hidden className="absolute -right-1 top-2 bottom-2 w-1 rounded-r-sm bg-gradient-to-b from-line to-line-strong/70" />
        </div>
      </div>
      {count > 1 ? (
        <div className="flex items-center justify-between text-[14px] text-ink-soft">
          <button type="button" onClick={() => go(index - 1)} className="min-h-11 rounded-pill px-3 hover:bg-cream-deep">← Previous</button>
          <span className="tnum" aria-live="polite">{pageLabel}</span>
          <button type="button" onClick={() => go(index + 1)} className="min-h-11 rounded-pill px-3 hover:bg-cream-deep">Next →</button>
        </div>
      ) : null}
      <p className="text-[13px] text-ink-mute">
        {format ? `${format}. ` : ""}Shown at reduced size; pages print at full scale on US Letter unless the description says otherwise.
      </p>
    </section>
  );
}
