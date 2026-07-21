// check-capture-hygiene.mjs
//
// Capture-hygiene gate (Track 0056-HomepageLaunchIntegrityFix, Phase 3).
// Prevents personal/local data and stale version labels from re-entering
// public evidence captures. Runs as part of `check:truth`.
//
// What this catches:
//   - Engine version labels older than launch-facts release.localSourceVersion
//     (e.g. 0.1.6–0.1.8 once current is 0.1.9), except allowlisted historical
//     phrasing ("since v0.1.8", "shipped with v0.1.8", older-archive caveats)
//   - Personal/local paths (C:\Users\, RyanB, gemini.cmd) in text captures
//   - Machine-specific noise (GPU VRAM, Driver limitation) in text captures
//   - "Quiet preview" / "ready to install" contradiction language
//
// What this does NOT catch:
//   - Text baked into image pixels (public/og/*.png, public/product/*.webp)
//     — grep is blind to image content. Images must be visually inspected
//     and re-captured in a neutral environment. This script checks text only.
//   - Historical public ledger NDJSON (not under SCAN_DIRS)
//
// Capture-hygiene rule: captures are generated from a neutral environment
// (Docker Ubuntu 24.04 or equivalent), are byte-authentic to real engine
// output, and are grep-verified (this script) AND visually inspected (images)
// before shipping. Never hand-edit capture text to "clean it up" — for a
// tamper-evidence product, editing evidence is self-refuting. Clean output
// comes from how you capture, not from editing.

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

// Parse launch-facts without importing TypeScript (plain node gate).
const launchFactsRaw = await readFile(
  join(root, "src", "lib", "content", "launch-facts.ts"),
  "utf8",
);
const currentVersion =
  launchFactsRaw.match(/localSourceVersion:\s*"([^"]+)"/)?.[1] ?? "0.1.9";
const currentParts = currentVersion.split(".").map((n) => Number.parseInt(n, 10));
if (currentParts.length !== 3 || currentParts.some((n) => Number.isNaN(n))) {
  console.error(`capture-hygiene: invalid launch-facts version "${currentVersion}"`);
  process.exit(1);
}

/**
 * True if dotted version a.b.c is strictly older than current launch-facts version.
 * @param {string} version
 */
function isOlderThanCurrent(version) {
  const parts = version.split(".").map((n) => Number.parseInt(n, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return false;
  for (let i = 0; i < 3; i++) {
    if (parts[i] < currentParts[i]) return true;
    if (parts[i] > currentParts[i]) return false;
  }
  return false;
}

/** Historical mentions that may still cite an older release honestly. */
const HISTORICAL_ALLOW =
  /\b(since|shipped with|shipped since|continues? in|older(?: archives?)?|predate|before)\b[\s\S]{0,40}v?0\.1\.\d+/gi;

const FORBIDDEN_PATTERNS = [
  { pattern: /C:\\Users\\RyanB/gi, label: "personal Windows path (C:\\Users\\RyanB)" },
  { pattern: /RyanB/gi, label: "personal username (RyanB)" },
  { pattern: /gemini\.cmd/gi, label: "local toolchain filename (gemini.cmd)" },
  {
    pattern: /GPU VRAM.*(Driver limitation|Intel Arc|NVIDIA|AMD|Radeon|\d+\.\d+\s*GB)/gi,
    label: "machine-specific GPU noise",
  },
  { pattern: /quiet preview/gi, label: "stale quiet-preview language" },
  { pattern: /ready to install/gi, label: "stale ready-to-install language" },
  { pattern: /let you know when/gi, label: "stale waitlist language" },
];

const SCAN_DIRS = [
  join(root, "src"),
  join(root, "public", "evidence"),
  join(root, "scripts"),
];

const EXCLUDE_FILES = new Set([
  join(root, "scripts", "check-capture-hygiene.mjs"),
]);

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".txt", ".md", ".json"]);

let scanned = 0;
const violations = [];

/**
 * @param {string} filePath
 * @param {string} content
 */
function findStaleVersionHits(filePath, content) {
  // Strip allowlisted historical phrases before scanning version tokens.
  const scrubbed = content.replace(HISTORICAL_ALLOW, " ");
  const re = /\bv?0\.\d+\.\d+\b/g;
  /** @type {string[]} */
  const hits = [];
  let m;
  while ((m = re.exec(scrubbed)) !== null) {
    const token = m[0].replace(/^v/, "");
    // Skip MCP package versions and other non-engine triples that aren't 0.1.x engine
    // Only treat 0.1.x as engine line (Ledgerful engine is still 0.1.z).
    if (!token.startsWith("0.1.")) continue;
    // MCP package versions live at 0.1.10+; those are package numbers, not engine.
    // Engine is 0.1.9 today; MCP is 0.1.11. Flag only engine-like labels that are older.
    if (isOlderThanCurrent(token)) {
      hits.push(m[0]);
    }
  }
  if (hits.length > 0) {
    violations.push(
      `${filePath}: stale engine version older than launch-facts ${currentVersion} (${hits.length} hit${hits.length > 1 ? "s" : ""}: ${[...new Set(hits)].join(", ")})`,
    );
  }
}

async function scanFile(filePath) {
  if (EXCLUDE_FILES.has(filePath)) return;
  let content;
  try {
    content = await readFile(filePath, "utf8");
  } catch {
    return;
  }
  scanned++;
  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = content.match(pattern);
    if (matches) {
      violations.push(
        `${filePath}: ${label} (${matches.length} hit${matches.length > 1 ? "s" : ""})`,
      );
    }
  }
  findStaleVersionHits(filePath, content);
}

async function scanDir(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await scanDir(fullPath);
    } else {
      const ext = entry.name.slice(entry.name.lastIndexOf("."));
      if (SCAN_EXTENSIONS.has(ext)) {
        await scanFile(fullPath);
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  await scanDir(dir);
}

console.log(
  `\n== Capture hygiene (0056) — ${scanned} text files scanned; current engine ${currentVersion} ==`,
);

if (violations.length > 0) {
  console.error(`  [FAIL] ${violations.length} violation(s):`);
  for (const v of violations) {
    console.error(`    - ${v}`);
  }
  console.error(
    "\n  Capture-hygiene rule: captures must be generated from a neutral" +
      " environment (Docker Ubuntu 24.04 or equivalent), never hand-edited." +
      " Stale versions and personal data are removed by re-capturing, not" +
      " by editing. See scripts/check-capture-hygiene.mjs header for the" +
      " full rule. Image assets (public/og/*.png, public/product/*.webp)" +
      " are not checked here — grep cannot read pixels; visually inspect" +
      " and re-capture those separately.",
  );
  process.exit(1);
}

console.log(
  "  [OK]   No stale engine versions, personal paths, or quiet-preview language found in text assets.",
);
console.log(
  "  [NOTE] Image assets (public/og/*.png, public/product/*.webp) are not" +
    " checked here — visually inspect and re-capture those separately.",
);
