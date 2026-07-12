import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { findPositioningViolations } from "./lib/positioning-terms.mjs";

const DEFAULT_ROOTS = [
  "src/app",
  "src/components",
  "src/lib/content",
];

const LAUNCH_ASSET_ROOTS = [
  "conductor/0040-LaunchAssetBundle/assets",
];

const EXTRA_BANNED = [
  { term: "blockchain-grade", pattern: /\bblockchain-grade\b/i },
  { term: "SOC 2 compliant", pattern: /\bSOC\s*2\s+compliant\b/i },
  { term: "SOC2 compliant", pattern: /\bSOC2\s+compliant\b/i },
  { term: "HIPAA compliant", pattern: /\bHIPAA\s+compliant\b/i },
  { term: "HIPAA ready", pattern: /\bHIPAA\s+ready\b/i },
  { term: "21 CFR Part 11 ready", pattern: /\b21\s*CFR\s*Part\s*11\s+ready\b/i },
  { term: "FedRAMP", pattern: /\bFedRAMP\b/i },
  { term: "FIPS", pattern: /\bFIPS\b/i },
  { term: "we never phone home", pattern: /\bwe\s+never\s+phone\s+home\b/i },
  { term: "zero telemetry", pattern: /\bzero\s+telemetry\b/i },
];

const includedExtensions = /\.(?:[cm]?[jt]sx?|mdx?|json|txt)$/i;

async function collectFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (entry.isFile() && includedExtensions.test(entry.name)) {
      files.push({
        path: relative(process.cwd(), path).replaceAll("\\", "/"),
        content: await readFile(path, "utf8"),
      });
    }
  }
  return files;
}

const roots = [...DEFAULT_ROOTS, ...LAUNCH_ASSET_ROOTS];
const files = (
  await Promise.all(roots.map((root) => collectFiles(resolve(root))))
).flat();

const violations = findPositioningViolations(files);

for (const file of files) {
  const lines = file.content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    const isDisclaimer =
      lower.includes("not ") ||
      lower.includes("do not ") ||
      lower.includes("does not ") ||
      lower.includes("no claim") ||
      lower.includes("never") ||
      lower.includes("are not ") ||
      lower.includes("is not ") ||
      lower.includes("we are not");
    for (const { term, pattern } of EXTRA_BANNED) {
      if (pattern.test(line) && !isDisclaimer) {
        violations.push({
          path: file.path,
          line: index + 1,
          term,
          excerpt: line.trim(),
        });
      }
    }
  });
}

if (violations.length > 0) {
  console.error("Launch-term check failed:");
  for (const violation of violations) {
    console.error(
      `- ${violation.path}:${violation.line} [${violation.term}] ${violation.excerpt}`,
    );
  }
  process.exit(1);
}

console.log(`Launch-term check passed (${files.length} files scanned).`);