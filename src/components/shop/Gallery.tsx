"use client";

import Image from "next/image";
import { useState } from "react";
import type { Image as Img } from "@/lib/shopify/types";

/** Preview images of the actual pages. First image large, thumbnails below. */
export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  if (!current) {
    return <div aria-hidden className="aspect-[4/5] rounded-lg bg-cream-deep" />;
  }
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-deep shadow-soft">
        <Image
          key={current.url}
          src={current.url}
          alt={current.altText ?? `${title}, preview ${index + 1}`}
          fill
          priority
          sizes="(min-width: 768px) 55vw, 100vw"
          className="fade-in object-cover"
        />
      </div>
      {images.length > 1 ? (
        <ul className="scroll-quiet mt-3 flex gap-2 overflow-x-auto" aria-label="Preview pages">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show preview ${i + 1}`}
                aria-current={i === index}
                className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-md border-2 ${i === index ? "border-sage-deep" : "border-transparent"}`}
              >
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
