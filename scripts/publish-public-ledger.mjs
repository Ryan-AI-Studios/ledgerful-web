#!/usr/bin/env node
/**
 * publish-public-ledger.mjs — export-then-commit helper for the public ledger.
 *
 * Ships DISABLED by default. Set LEDGERFUL_PUBLISH_LEDGER_ENABLED=1 to enable.
 *
 * ## Export-then-commit model (track 0120)
 *
 * GitHub-hosted CI cannot export from live dogfood (`.ledgerful/` is gitignored).
 * The intended path is:
 *   1. On a machine with the engine ledger (+ bot key for --sign):
 *        LEDGERFUL_PUBLISH_LEDGER_ENABLED=1 node scripts/publish-public-ledger.mjs
 *      or manually:
 *        ledgerful ledger export-public --output <dir> --sign
 *        then copy artifacts into public/ledger/ (this script does that).
 *   2. Review + open a PR that commits public/ledger/ data files.
 *   3. CI validates committed artifacts via check:truth (assertPublicLedgerBundle).
 *
 * ## Env flags
 *
 *   LEDGERFUL_PUBLISH_LEDGER_ENABLED=1   required to run (otherwise exit 0 + notice)
 *   LEDGERFUL_ENGINE_REPO                engine root (default: ../ledgerful relative to cwd)
 *   LEDGERFUL_PUBLISH_LEDGER_SIGN=0      skip --sign (default: sign when enabled)
 *   LEDGERFUL_BOT_KEY_DIR                optional --key path for export-public
 *   LEDGERFUL_PUBLISH_LEDGER_COMMIT=1    optional: git add + commit after copy
 *                                        (default: copy only; print next git steps)
 *
 * ## Bot signing
 *
 * Prefer --sign so manifest.sig / manifest.pub refresh. Requires the ledger bot
 * keypair (default ~/.ledgerful/keys/ or LEDGERFUL_BOT_KEY_DIR). Without a key,
 * export-public --sign fails and this script exits non-zero when enabled.
 *
 * ## CSP dual-file verifier (track 0075)
 *
 * Never copy engine verifier.html / verifier.js over the production dual-file
 * pair. Engine export may emit an inline-script verifier; production CSP requires
 * verifier.html + verifier.js. Overwriting would reintroduce a sink or break CSP.
 */

import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
} from "node:fs";
import { join, resolve, isAbsolute } from "node:path";
import { execFileSync } from "node:child_process";

const WEB_ROOT = process.cwd();
const WEB_LEDGER_DIR = join(WEB_ROOT, "public", "ledger");
const EXPORT_DIR = join(WEB_ROOT, "tmp", "ledgerful-public-export");

/** Data + docs only. Do NOT list verifier.html / verifier.js (CSP dual-file). */
const bundleFiles = [
  "entries.ndjson",
  "manifest.json",
  "README.md",
  "manifest.sig",
  "manifest.pub",
];

/** Stable field order matching `ledgerful export head` / bare chain_head.json. */
const CHAIN_HEAD_FIELDS = [
  "latest_entry_hash",
  "genesis",
  "length",
  "head_signature",
  "head_public_key",
  "updated_at",
];

function resolveEngineRepo() {
  const fromEnv = process.env.LEDGERFUL_ENGINE_REPO?.trim();
  if (fromEnv) {
    return isAbsolute(fromEnv) ? fromEnv : resolve(WEB_ROOT, fromEnv);
  }
  return resolve(WEB_ROOT, "..", "ledgerful");
}

function structuralHeadFrom(source) {
  if (!source || typeof source !== "object") return null;
  const length = source.length;
  const latest = source.latest_entry_hash;
  const genesis = source.genesis;
  if (length == null || latest == null || genesis == null) return null;
  return {
    length: Number(length),
    latest_entry_hash: String(latest),
    genesis: String(genesis),
  };
}

function readJsonIfExists(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function headsStructurallyEqual(a, b) {
  if (!a || !b) return false;
  return (
    a.length === b.length &&
    a.latest_entry_hash === b.latest_entry_hash &&
    a.genesis === b.genesis
  );
}

function entriesByteIdentical(aPath, bPath) {
  if (!existsSync(aPath) || !existsSync(bPath)) return false;
  const a = readFileSync(aPath);
  const b = readFileSync(bPath);
  return Buffer.compare(a, b) === 0;
}

function buildChainHeadObject(chainHead) {
  const out = {};
  for (const key of CHAIN_HEAD_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(chainHead, key)) {
      out[key] = chainHead[key];
    }
  }
  // Preserve any extra fields deterministically (sorted).
  const extras = Object.keys(chainHead)
    .filter((k) => !CHAIN_HEAD_FIELDS.includes(k))
    .sort();
  for (const key of extras) {
    out[key] = chainHead[key];
  }
  return out;
}

function writeChainHeadJson(destPath, chainHead) {
  const ordered = buildChainHeadObject(chainHead);
  writeFileSync(destPath, `${JSON.stringify(ordered, null, 2)}\n`, "utf8");
}

function requireFile(path, label) {
  if (!existsSync(path)) {
    console.error(`FAIL: missing required file ${label}: ${path}`);
    process.exit(1);
  }
}

if (process.env.LEDGERFUL_PUBLISH_LEDGER_ENABLED !== "1") {
  console.log(
    "Publishing helper is disabled. Set LEDGERFUL_PUBLISH_LEDGER_ENABLED=1 to enable.",
  );
  console.log(
    "Model: export-then-commit on a machine with engine .ledgerful (+ bot key for --sign); CI only validates committed public/ledger artifacts.",
  );
  process.exit(0);
}

const ENGINE_REPO = resolveEngineRepo();
if (!existsSync(ENGINE_REPO)) {
  console.error(
    `FAIL: engine repo not found at ${ENGINE_REPO}. Set LEDGERFUL_ENGINE_REPO to the ledgerful engine root.`,
  );
  process.exit(1);
}

const wantSign = process.env.LEDGERFUL_PUBLISH_LEDGER_SIGN !== "0";
const keyDir = process.env.LEDGERFUL_BOT_KEY_DIR?.trim();

mkdirSync(EXPORT_DIR, { recursive: true });

const exportArgs = ["ledger", "export-public", "--output", EXPORT_DIR];
if (wantSign) {
  exportArgs.push("--sign");
  if (keyDir) {
    exportArgs.push("--key", keyDir);
  }
}

console.log(
  `Running: ledgerful ${exportArgs.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(" ")}`,
);
console.log(`  cwd: ${ENGINE_REPO}`);
console.log(`  sign: ${wantSign ? "yes" : "no"}`);

try {
  execFileSync("ledgerful", exportArgs, {
    cwd: ENGINE_REPO,
    stdio: "inherit",
    env: process.env,
  });
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`FAIL: ledger export-public failed: ${message}`);
  process.exit(1);
}

const newEntries = join(EXPORT_DIR, "entries.ndjson");
const newManifest = join(EXPORT_DIR, "manifest.json");
const currentEntries = join(WEB_LEDGER_DIR, "entries.ndjson");
const currentChainHeadPath = join(WEB_LEDGER_DIR, "chain_head.json");
const currentManifestPath = join(WEB_LEDGER_DIR, "manifest.json");

requireFile(newEntries, "entries.ndjson");
requireFile(newManifest, "manifest.json");

const exportedManifest = readJsonIfExists(newManifest);
if (!exportedManifest) {
  console.error("FAIL: could not parse exported manifest.json");
  process.exit(1);
}

const newHead = structuralHeadFrom(exportedManifest.chainHead);
const existingHead =
  structuralHeadFrom(readJsonIfExists(currentChainHeadPath)) ??
  structuralHeadFrom(readJsonIfExists(currentManifestPath)?.chainHead);

const entriesUnchanged = entriesByteIdentical(newEntries, currentEntries);
const headUnchanged = headsStructurallyEqual(newHead, existingHead);

// Structural idempotency: skip when entries.ndjson byte-identical AND structural
// head fields (length, latest_entry_hash, genesis) unchanged. Do NOT full-byte-diff
// timestamped chain_head.json / manifest.json alone (updated_at / re-sign churn).
if (entriesUnchanged && headUnchanged) {
  console.log(
    "No structural changes (entries.ndjson identical and head length/hash/genesis unchanged); skipping copy/commit.",
  );
  process.exit(0);
}

mkdirSync(WEB_LEDGER_DIR, { recursive: true });

for (const file of bundleFiles) {
  const src = join(EXPORT_DIR, file);
  const dst = join(WEB_LEDGER_DIR, file);
  if (!existsSync(src)) {
    // sig/pub optional only when not signing; required data files must exist.
    if (file === "manifest.sig" || file === "manifest.pub") {
      if (wantSign) {
        console.error(
          `FAIL: --sign requested but export did not produce ${file}`,
        );
        process.exit(1);
      }
      // Unsigned path: remove stale sig/pub so they cannot mismatch a new manifest.
      if (existsSync(dst)) {
        unlinkSync(dst);
        console.log(`Removed stale ${file} (unsigned export).`);
      } else {
        console.log(`Note: ${file} not present in export; skipping.`);
      }
      continue;
    }
    console.error(`FAIL: export did not produce ${file}`);
    process.exit(1);
  }
  copyFileSync(src, dst);
  console.log(`Copied ${file}`);
}

if (exportedManifest.chainHead) {
  writeChainHeadJson(
    join(WEB_LEDGER_DIR, "chain_head.json"),
    exportedManifest.chainHead,
  );
  console.log("Wrote chain_head.json from manifest.chainHead");
} else {
  console.error(
    "FAIL: exported manifest has no chainHead; cannot write chain_head.json",
  );
  process.exit(1);
}

// Enforce CSP dual-file verifier remains in place (never overwritten above).
const liveVerifierJs = join(WEB_LEDGER_DIR, "verifier.js");
const liveVerifierHtml = join(WEB_LEDGER_DIR, "verifier.html");
if (!existsSync(liveVerifierJs) || !existsSync(liveVerifierHtml)) {
  console.error(
    "FAIL: public/ledger must keep the CSP dual-file verifier (verifier.html + verifier.js). Restore track 0075 assets before publishing.",
  );
  process.exit(1);
}

// Explicit data-file staging list only — never `git add public/ledger/` (would
// risk staging verifier.html/js if accidentally dirty).
const stagePaths = [
  "public/ledger/entries.ndjson",
  "public/ledger/manifest.json",
  "public/ledger/README.md",
  "public/ledger/manifest.sig",
  "public/ledger/manifest.pub",
  "public/ledger/chain_head.json",
];

const autoCommit = process.env.LEDGERFUL_PUBLISH_LEDGER_COMMIT === "1";
if (autoCommit) {
  console.log(
    "Staging public ledger data files (LEDGERFUL_PUBLISH_LEDGER_COMMIT=1)...",
  );
  try {
    const existing = stagePaths.filter((p) => existsSync(join(WEB_ROOT, p)));
    execFileSync("git", ["add", ...existing], {
      cwd: WEB_ROOT,
      stdio: "inherit",
    });
    execFileSync(
      "git",
      ["commit", "-m", "chore: publish public ledger bundle"],
      {
        cwd: WEB_ROOT,
        stdio: "inherit",
      },
    );
    console.log("Committed. Run git push / open a PR to deploy.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`FAIL: git commit step failed: ${message}`);
    process.exit(1);
  }
} else {
  console.log("");
  console.log("Copied artifacts into public/ledger/ (no git commit).");
  console.log("Next steps (export-then-commit):");
  console.log(`  git add ${stagePaths.join(" ")}`);
  console.log('  git commit -m "chore: publish public ledger bundle"');
  console.log("  # open PR; do not force-push");
  console.log(
    "Or re-run with LEDGERFUL_PUBLISH_LEDGER_COMMIT=1 for optional auto-commit.",
  );
}

const headSummary = newHead
  ? `length=${newHead.length} latest_entry_hash=${newHead.latest_entry_hash.slice(0, 12)}…`
  : "no chain head";
console.log(`Done. Structural head: ${headSummary}`);
