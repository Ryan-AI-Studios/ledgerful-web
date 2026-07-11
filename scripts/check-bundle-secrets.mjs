import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const staticDir = join(process.cwd(), ".next", "static");

const KEY_PATTERNS = [
  /KIT_API_KEY\s*[:=]/i,
  /X-Kit-Api-Key\s*[:=]\s*["'][A-Za-z0-9_-]{10,}["']/i,
];

const ENDPOINT_PATTERN = /api\.kit\.com\/v4\/subscribers/i;

const ALLOWED_ENDPOINT_CONTEXT = [
  "kit (waitlist)",
  "kit (formerly convertkit)",
  "waitlist email provider",
];

let checked = 0;
const violations = [];

async function scanDirectory(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await scanDirectory(fullPath);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".js") ||
        entry.name.endsWith(".mjs") ||
        entry.name.endsWith(".html"))
    ) {
      const content = await readFile(fullPath, "utf8");
      checked++;

      for (const pattern of KEY_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
          violations.push({
            file: fullPath,
            match: match[0],
          });
        }
      }

      const endpointMatch = content.match(ENDPOINT_PATTERN);
      if (endpointMatch) {
        const idx = endpointMatch.index ?? 0;
        const context = content
          .slice(Math.max(0, idx - 200), idx + 200)
          .toLowerCase();
        const isAllowed = ALLOWED_ENDPOINT_CONTEXT.some((ref) =>
          context.includes(ref.toLowerCase()),
        );
        if (!isAllowed) {
          violations.push({
            file: fullPath,
            match: endpointMatch[0],
          });
        }
      }
    }
  }
}

await scanDirectory(staticDir);

const clientBundleViolations = violations.filter((v) =>
  v.file.includes(join("static", "chunks")) || v.file.includes(join("static", "css")),
);

if (clientBundleViolations.length > 0) {
  console.error("\ncheck-bundle-secrets: FAILED\n");
  console.error(
    "ESP secret or live API endpoint found in client bundle:\n",
  );
  for (const v of clientBundleViolations) {
    console.error(`  ${v.file}: ${v.match}`);
  }
  process.exit(1);
} else {
  console.log(
    `check-bundle-secrets: no ESP secrets in client bundle (${checked} files scanned)`,
  );
}