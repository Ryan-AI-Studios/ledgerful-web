// check-capture-hygiene.mjs
//
// Capture-hygiene gate (Track 0056-HomepageLaunchIntegrityFix, Phase 3).
// Prevents personal/local data and stale version labels from re-entering
// public evidence captures. Runs as part of `check:truth`.
//
// What this catches:
//   - Stale engine version labels (0.1.6, 0.1.7) in public copy/captures
//   - Personal/local paths (C:\Users\, RyanB, gemini.cmd) in text captures
//   - Machine-specific noise (GPU VRAM, Driver limitation) in text captures
//   - "Quiet preview" / "ready to install" contradiction language
//
// What this does NOT catch:
//   - Text baked into image pixels (public/og/*.png, public/product/*.webp)
//     — grep is blind to image content. Images must be visually inspected
//     and re-captured in a neutral environment. This script checks text only.
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

const FORBIDDEN_PATTERNS = [
  { pattern: /0\.1\.[67]\b/g, label: "stale engine version (0.1.6/0.1.7)" },
  { pattern: /C:\\Users\\RyanB/gi, label: "personal Windows path (C:\\Users\\RyanB)" },
  { pattern: /RyanB/gi, label: "personal username (RyanB)" },
  { pattern: /gemini\.cmd/gi, label: "local toolchain filename (gemini.cmd)" },
  { pattern: /GPU VRAM.*(Driver limitation|Intel Arc|NVIDIA|AMD|Radeon|\d+\.\d+\s*GB)/gi, label: "machine-specific GPU noise" },
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
      violations.push(`${filePath}: ${label} (${matches.length} hit${matches.length > 1 ? "s" : ""})`);
    }
  }
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

console.log(`\n== Capture hygiene (0056) — ${scanned} text files scanned ==`);

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

console.log("  [OK]   No stale versions, personal paths, or quiet-preview language found in text assets.");
console.log(
  "  [NOTE] Image assets (public/og/*.png, public/product/*.webp) are not" +
    " checked here — visually inspect and re-capture those separately.",
);