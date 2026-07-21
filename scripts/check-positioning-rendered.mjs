import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { parse } from "parse5";
import { findPositioningViolations } from "./lib/positioning-terms.mjs";

const outputRoot = resolve(".next/server/app");

/**
 * Public ledger entry detail pages SSG real signed summaries from the engine
 * ledger (e.g. commit messages that legitimately mention crypto.rs). That is
 * verifiable historical content, not marketing copy — exclude them from the
 * positioning vocabulary gate. Keep /ledger and /docs/* in scope.
 */
function isPublicLedgerEntryPage(relativePath) {
  // .next/server/app/ledger/<txId>.html  or  ledger/<txId>/index.html
  const normalized = relativePath.replaceAll("\\", "/");
  return (
    /^(\.next\/server\/app\/)?ledger\/[0-9a-f-]{36}(\.html|\/index\.html)$/i.test(
      normalized,
    ) ||
    /^(\.next\/server\/app\/)?ledger\/[0-9a-f-]{36}\.html$/i.test(normalized)
  );
}

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path);
    }
  }

  return files;
}

function renderedText(html) {
  const document = parse(html);
  const text = [];
  const stack = [document];

  while (stack.length > 0) {
    const node = stack.pop();
    if (node.nodeName === "#text") text.push(node.value);
    if (
      node.childNodes &&
      node.tagName !== "script" &&
      node.tagName !== "style"
    ) {
      stack.push(...node.childNodes);
    }
  }

  return text.reverse().join("\n");
}

const allHtml = await collectHtmlFiles(outputRoot);
const scanned = [];
let skippedLedgerEntries = 0;

for (const absolute of allHtml) {
  const rel = relative(process.cwd(), absolute).replaceAll("\\", "/");
  if (isPublicLedgerEntryPage(rel)) {
    skippedLedgerEntries += 1;
    continue;
  }
  scanned.push({
    path: rel,
    content: renderedText(await readFile(absolute, "utf8")),
  });
}

const violations = findPositioningViolations(scanned);

if (violations.length > 0) {
  console.error("Rendered positioning vocabulary check failed:");
  for (const violation of violations) {
    console.error(
      `- ${violation.path}:${violation.line} [${violation.term}] ${violation.excerpt}`,
    );
  }
  process.exit(1);
}

console.log(
  `Rendered positioning vocabulary check passed (${scanned.length} pages` +
    (skippedLedgerEntries > 0
      ? `; skipped ${skippedLedgerEntries} public-ledger entry pages with real signed content`
      : "") +
    `).`,
);
