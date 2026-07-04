import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "parse5";
import { isIndexingAllowed } from "../src/lib/indexing-policy.mjs";

const robots = await readFile(".next/server/app/robots.txt.body", "utf8");
const homepage = await readFile(".next/server/app/index.html", "utf8");
const indexingAllowed = isIndexingAllowed(
  process.env.NEXT_PUBLIC_ALLOW_INDEXING,
  process.env.VERCEL_ENV,
);

function findRobotsContent(html) {
  const document = parse(html);
  const stack = [document];

  while (stack.length > 0) {
    const node = stack.pop();
    if (
      node?.nodeName === "meta" &&
      node.attrs?.some(
        (attribute) =>
          attribute.name === "name" && attribute.value === "robots",
      )
    ) {
      return node.attrs.find((attribute) => attribute.name === "content")
        ?.value;
    }
    if (node?.childNodes) stack.push(...node.childNodes);
  }

  return undefined;
}

const robotsContent = findRobotsContent(homepage);
assert.ok(robotsContent, "the homepage must emit robots metadata");

if (indexingAllowed) {
  assert.match(
    robots,
    /^Allow: \/$/m,
    "robots.txt must allow crawling when indexing is explicitly enabled",
  );
  assert.doesNotMatch(
    robots,
    /^Disallow: \/$/m,
    "robots.txt must not disallow all crawling when indexing is enabled",
  );
  assert.match(
    robotsContent,
    /\bindex\b.*\bfollow\b/,
    "the homepage must emit index,follow metadata when indexing is enabled",
  );
  assert.doesNotMatch(
    robotsContent,
    /\bnoindex\b|\bnofollow\b/,
    "the homepage must not emit noindex or nofollow when indexing is enabled",
  );
} else {
  assert.match(
    robots,
    /^Disallow: \/$/m,
    "robots.txt must disallow all crawling unless indexing is explicitly enabled",
  );
  assert.doesNotMatch(
    robots,
    /^Allow: \/$/m,
    "robots.txt must not allow site-wide crawling by default",
  );
  assert.match(
    robotsContent,
    /\bnoindex\b.*\bnofollow\b/,
    "the homepage must emit noindex,nofollow metadata by default",
  );
}

console.log(
  `Indexing policy passed (${indexingAllowed ? "enabled" : "fail-safe noindex"}).`,
);
