import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const robots = await readFile(".next/server/app/robots.txt.body", "utf8");
const homepage = await readFile(".next/server/app/index.html", "utf8");

assert.match(
  robots,
  /^Disallow: \/$/m,
  "robots.txt must disallow all crawling during quiet preview",
);
assert.doesNotMatch(
  robots,
  /^Allow: \/$/m,
  "robots.txt must not allow site-wide crawling during quiet preview",
);
assert.match(
  homepage,
  /<meta name="robots" content="[^"]*noindex[^"]*nofollow[^"]*"/,
  "the homepage must emit noindex,nofollow metadata during quiet preview",
);

console.log("Quiet-preview indexing policy is active.");
