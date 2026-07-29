// check-capture-hygiene.mjs
//
// Capture-hygiene gate (Track 0056-HomepageLaunchIntegrityFix, Phase 3).
// Prevents personal/local data and stale version labels from re-entering
// public evidence captures. Runs as part of `check:truth`.
//
// What this catches:
//   - Present-tense engine version labels older than launch-facts
//     release.localSourceVersion, except allowlisted historical / dated-capture
//     phrasing ("since v0.1.8", "captured from a real v0.1.9 run", Scoop measure notes)
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

/** Historical / dated-capture mentions that may still cite an older release honestly. */
const HISTORICAL_ALLOW =
  /\b(since|shipped with|shipped since|continues? in|older(?: archives?)?|predate|before|captured from|captured artifact|real v?\d+\.\d+\.\d+ run|measured on|through v?\d+\.\d+\.\d+|era|sample-repo capture|command shape current through|dual-number|ledgerful-mcp-server-|mcp-server@|@ledgerful\/mcp-server|engine pin|package version|action-repo residual|action default|defaultValue|default ledgerful-version|residual default is still|ledgerful-action@)\b[\s\S]{0,120}v?0\.\d+\.\d+/gi;

/**
 * Paths whose version tokens are dated capture provenance, not present-tense
 * currency claims. Do not re-capture in claim-currency tracks (0103 DoD-4).
 */
const DATED_CAPTURE_PATH =
  /(?:captured-evidence\.ts|evidence-panel\.tsx|golden-path\.ts|[\\/]public[\\/]evidence[\\/])/i;

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
  // Dated capture modules keep their provenance versions on purpose.
  if (DATED_CAPTURE_PATH.test(filePath)) return;

  // Strip allowlisted historical phrases before scanning version tokens.
  const scrubbed = content.replace(HISTORICAL_ALLOW, " ");
  const re = /\bv?0\.\d+\.\d+\b/g;
  /** @type {string[]} */
  const hits = [];
  let m;
  // Engine is 0.2.x (localSourceVersion). MCP package stays on 0.1.x dual-number —
  // do not treat every 0.1.x token as a stale engine claim.
  const engineMajorMinor = `${currentParts[0]}.${currentParts[1]}.`;
  while ((m = re.exec(scrubbed)) !== null) {
    const token = m[0].replace(/^v/, "");
    // Only engine-line majors matching current series (e.g. 0.2.x when current is 0.2.3).
    // Older major/minor series in remaining text are treated as non-engine or residual
    // after HISTORICAL_ALLOW; explicit present-tense stale minors still flag.
    if (!token.startsWith(engineMajorMinor) && !token.startsWith("0.1.")) {
      // other series (future-proof)
    }
    // Flag 0.1.x only when they look like bare present-tense engine claims
    // (e.g. "v0.1.9 is installed") — after HISTORICAL_ALLOW scrubbing.
    // Prefer engine series match when current is 0.2+:
    const isEngineSeries = token.startsWith(engineMajorMinor);
    const isLegacyEngineSeries = token.startsWith("0.1.");
    if (!isEngineSeries && !isLegacyEngineSeries) continue;
    // MCP 0.1.1x package numbers: skip when clearly package-shaped (>= 0.1.10)
    // while engine has moved to 0.2.x.
    if (isLegacyEngineSeries && currentParts[1] >= 2) {
      const patch = Number.parseInt(token.split(".")[2] ?? "", 10);
      // 0.1.10+ are MCP package line; 0.1.0–0.1.9 may still be bare engine claims
      if (!Number.isNaN(patch) && patch >= 10) continue;
    }
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
