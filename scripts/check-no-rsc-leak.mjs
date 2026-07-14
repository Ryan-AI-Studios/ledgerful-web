// check-no-rsc-leak.mjs
//
// Post-build guard (Track 0060-InstallServerReferenceLeak).
// Greps the built .next/server HTML for React client-reference proxy error
// text — the signature of a "use client" export being coerced server-side.
// If any built page contains "Attempted to call" or "from the server but",
// the build is broken and the gate fails.
//
// Runs as part of `check:truth`.

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const serverDir = join(root, ".next", "server");
const LEAK_PATTERNS = [
  /Attempted to call/gi,
  /from the server but/gi,
];

let violations = [];
let htmlFilesFound = 0;

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return false;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.name.endsWith(".html")) {
      htmlFilesFound++;
      const html = await readFile(full, "utf8");
      for (const pattern of LEAK_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
          violations.push({ file: relative(root, full), count: matches.length });
        }
      }
    }
  }
}

await walk(serverDir);

if (htmlFilesFound === 0) {
  console.error("\n✗ RSC leak guard found no built HTML files in .next/server.");
  console.error("Run `npm run build` before this check so there is output to scan.");
  process.exit(1);
}

if (violations.length > 0) {
  console.error("\n✗ RSC leak detected — React client-reference error text found in built HTML:");
  for (const v of violations) {
    console.error(`  ${v.file} (${v.count} match${v.count > 1 ? "es" : ""})`);
  }
  console.error("\nThis means a \"use client\" module export is being coerced server-side.");
  console.error("Move the plain data to a non-\"use client\" module (Track 0060).");
  process.exit(1);
}

console.log("✓ No RSC client-reference leaks in built HTML.");
