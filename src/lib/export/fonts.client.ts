"use client";

import { FONT_FILES, type FontBytes } from "./pdf";

let cached: Promise<FontBytes> | null = null;

/** Browser-side font loading from /fonts, fetched once per page load. */
export function loadFontBytesFromPublic(): Promise<FontBytes> {
  if (!cached) {
    cached = (async () => {
      const get = async (f: string) => new Uint8Array(await (await fetch(`/fonts/${f}`)).arrayBuffer());
      const [regular, semibold, display] = await Promise.all([get(FONT_FILES.regular), get(FONT_FILES.semibold), get(FONT_FILES.display)]);
      return { regular, semibold, display };
    })();
  }
  return cached;
}
