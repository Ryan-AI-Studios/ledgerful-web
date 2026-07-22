// check-banned-terms.mjs
//
// Deterministic banned-term gate for Track 0052-MarketingContentPipeline.
// Scans customer-facing Markdown/TSX/TS assets against a combined banned-term
// list (Claims Register D10 + 0027 positioning terms + AI-tell fixed strings),
// exits non-zero on any hit, and names the file + line + term.
//
// Disclaimer exception: a clause (split by line, ". ", "; ", or ", ") that
// contains a negation/disclaimer phrase ("not ", "do not ", "does not ",
// "never", "are not ", "is not ", "we are not", "no claim", "not a ") is
// skipped. Affirmative clauses mixed with negated clauses on the same line are
// still caught.

import { readdir, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

const DEFAULT_ROOTS = [
  "src/app",
  "src/components",
  "src/lib/content",
];

const PUBLIC_EVIDENCE_ROOT = "public";

// Combined banned-term list. Sources:
// 1. Claims Register D10 terms: tamper-proof, immutable, blockchain-grade
// 2. 0027 positioning terms (scripts/lib/positioning-terms.mjs)
// 3. AI-tell fixed strings from humanize-marketing-copy skill blacklist.md
//    Tier 1 classics + promotional inflation + corporate abstraction
// Substrings that are allowed even when they contain a banned term. These
// are web platform API names or engine track names, not marketing copy.
const API_CONTEXT_ALLOWLIST = Object.freeze([
  { pattern: /window\.crypto/gi },
  { pattern: /crypto\.subtle/gi },
  { pattern: /E1-CRYPTO/g },
  // Exact product stdout from `ledgerful demo` (track 0070).
  { pattern: /CRYPTO VALID/g },
  // Engine module path citation (0072 honesty / proveClaims).
  { pattern: /crypto\.rs/g },
]);

const BANNED_TERMS = Object.freeze([
  // D10 terms from Claims Register
  { term: "tamper-proof", pattern: /\btamper-proof\b/i },
  { term: "immutable", pattern: /\bimmutable\b/i },
  { term: "blockchain-grade", pattern: /\bblockchain-grade\b/i },

  // 0027 positioning terms
  { term: "blockchain", pattern: /\bblockchain\b/i },
  { term: "web3", pattern: /\bweb3\b/i },
  { term: "smart contract", pattern: /\bsmart\s+contract\b/i },
  { term: "wallet", pattern: /\bwallet\b/i },
  { term: "NFT", pattern: /\bNFT\b/i },
  { term: "on-chain", pattern: /\bon-chain\b/i },
  { term: "tokenomics", pattern: /\btokenomics\b/i },
  // "crypto" is allowed when it is part of a web platform API context
  // (window.crypto, crypto.subtle) or an engine track name (E1-CRYPTO).
  { term: "crypto", pattern: /\bcrypto\b/i },

  // AI-tell fixed strings — Tier 1 classics
  { term: "delve", pattern: /\bdelve\b/i },
  { term: "tapestry", pattern: /\btapestry\b/i },
  { term: "testament", pattern: /\btestament\b/i },
  { term: "underscore", pattern: /\bunderscore\b/i },
  { term: "pivotal", pattern: /\bpivotal\b/i },
  { term: "multifaceted", pattern: /\bmultifaceted\b/i },
  { term: "intricate", pattern: /\bintricate\b/i },
  { term: "plethora", pattern: /\bplethora\b/i },
  { term: "myriad", pattern: /\bmyriad\b/i },
  { term: "realm", pattern: /\brealm\b/i },
  { term: "palpable", pattern: /\bpalpable\b/i },
  { term: "camaraderie", pattern: /\bcamaraderie\b/i },
  { term: "vibrant", pattern: /\bvibrant\b/i },
  { term: "nestled", pattern: /\bnestled\b/i },
  { term: "boasts", pattern: /\bboasts\b/i },
  { term: "thriving", pattern: /\bthriving\b/i },
  { term: "captivate", pattern: /\bcaptivate\b/i },
  { term: "groundbreaking", pattern: /\bgroundbreaking\b/i },
  { term: "indelible", pattern: /\bindelible\b/i },

  // AI-tell fixed strings — promotional inflation
  { term: "elevate", pattern: /\belevate\b/i },
  { term: "unlock", pattern: /\bunlock\b/i },
  { term: "empower", pattern: /\bempower\b/i },
  { term: "unleash", pattern: /\bunleash\b/i },
  { term: "embark", pattern: /\bembark\b/i },
  { term: "seamless", pattern: /\bseamless\b/i },
  { term: "seamlessly", pattern: /\bseamlessly\b/i },
  { term: "robust", pattern: /\brobust\b/i },
  { term: "leverage", pattern: /\bleverage\b/i },
  { term: "paradigm", pattern: /\bparadigm\b/i },
  { term: "synergy", pattern: /\bsynergy\b/i },
  { term: "streamline", pattern: /\bstreamline\b/i },
  { term: "holistic", pattern: /\bholistic\b/i },
  { term: "harness", pattern: /\bharness\b/i },
  { term: "utilize", pattern: /\butilize\b/i },

  // AI-tell fixed strings — corporate abstraction
  { term: "showcase", pattern: /\bshowcase\b/i },
  { term: "endeavor", pattern: /\bendeavor\b/i },
  { term: "facilitate", pattern: /\bfacilitate\b/i },
  { term: "ascertain", pattern: /\bascertain\b/i },

  // 0048 compliance-claim terms (affirmative form; disclaimer exemption handles negated uses)
  { term: "compliant", pattern: /\bcompliant\b/i },
  { term: "certified", pattern: /\bcertified\b/i },
  { term: "audited", pattern: /\baudited\b/i },
  { term: "compliance attestation", pattern: /\bcompliance attestation\b/i },
]);

const includedExtensions = /\.(?:[cm]?[jt]sx?|mdx?|json|txt)$/i;

const NEGATION_MARKERS = Object.freeze([
  "not ",
  "do not ",
  "does not ",
  "never",
  "are not ",
  "is not ",
  "we are not",
  "no claim",
  "not a ",
]);

function isNegatedClause(clause) {
  const lower = clause.toLowerCase();
  return NEGATION_MARKERS.some((marker) => lower.includes(marker));
}

function checkBannedTermsInText(text) {
  const violations = [];
  const clauses = text.split(/\r?\n|\.\s+|;\s+|,\s+/);

  for (const clause of clauses) {
    if (isNegatedClause(clause)) continue;
    for (const { term, pattern } of BANNED_TERMS) {
      pattern.lastIndex = 0;
      if (!pattern.test(clause)) continue;
      // Allow the term when it appears only as part of a web platform API
      // context (window.crypto, crypto.subtle) or as an engine track name.
      let scrubbed = clause;
      for (const allowed of API_CONTEXT_ALLOWLIST) {
        scrubbed = scrubbed.replace(allowed.pattern, "__allowed__");
      }
      pattern.lastIndex = 0;
      if (pattern.test(scrubbed)) {
        violations.push({ term, clause: clause.trim() });
      }
    }
  }

  return violations;
}

async function collectFiles(directory, extensions) {
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
      files.push(...(await collectFiles(path, extensions)));
    } else if (entry.isFile() && extensions.test(entry.name)) {
      files.push({
        path: relative(process.cwd(), path).replaceAll("\\", "/"),
        content: await readFile(path, "utf8"),
      });
    }
  }
  return files;
}

async function collectPublicEvidenceFiles(directory) {
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
      files.push(...(await collectPublicEvidenceFiles(path)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push({
        path: relative(process.cwd(), path).replaceAll("\\", "/"),
        content: await readFile(path, "utf8"),
      });
    }
  }
  return files;
}

const defaultFiles = (
  await Promise.all(
    DEFAULT_ROOTS.map((root) => collectFiles(resolve(root), includedExtensions)),
  )
).flat();

const publicFiles = await collectPublicEvidenceFiles(resolve(PUBLIC_EVIDENCE_ROOT));
const files = [...defaultFiles, ...publicFiles];

const violations = [];

for (const file of files) {
  const lines = file.content.split(/\r?\n/);
  let inCodeFence = false;
  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      inCodeFence = !inCodeFence;
      return;
    }
    if (inCodeFence) return;
    const lineViolations = checkBannedTermsInText(line);
    for (const violation of lineViolations) {
      violations.push({
        path: file.path,
        line: index + 1,
        term: violation.term,
        excerpt: violation.clause,
      });
    }
  });
}

if (violations.length > 0) {
  console.error("Banned-term check failed:");
  for (const violation of violations) {
    console.error(
      `  ${violation.path}:${violation.line} [${violation.term}] ${violation.excerpt}`,
    );
  }
  process.exit(1);
}

console.log(`Banned-term check passed (${files.length} files scanned).`);
