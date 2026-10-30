import { readFile } from "node:fs/promises";
import path from "node:path";
import { FONT_FILES, type FontBytes } from "./pdf";

/** Server-side font loading from public/fonts (traced into the function bundle). */
export async function loadFontBytesFromDisk(): Promise<FontBytes> {
  const dir = path.join(process.cwd(), "public", "fonts");
  const [regular, semibold, display] = await Promise.all([
    readFile(path.join(dir, FONT_FILES.regular)),
    readFile(path.join(dir, FONT_FILES.semibold)),
    readFile(path.join(dir, FONT_FILES.display)),
  ]);
  return { regular, semibold, display };
}
