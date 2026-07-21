import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

/** Apple touch icon — brand mark (dark default, matches site default theme). */
export default async function AppleIcon() {
  const file = path.join(process.cwd(), "public", "brand", "icon-dark-180.png");
  const data = await readFile(file);
  return new Response(data, {
    headers: {
      "Content-Type": "image/png",
      // Long browser cache; avoid the word "immut…" (positioning-terms gate).
      "Cache-Control": "public, max-age=86400",
    },
  });
}
