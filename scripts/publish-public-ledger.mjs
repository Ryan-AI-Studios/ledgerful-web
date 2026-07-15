#!/usr/bin/env node
/**
 * publish-public-ledger.mjs — manual publishing cron for the public ledger.
 *
 * Ships DISABLED by default. Set LEDGERFUL_PUBLISH_LEDGER_ENABLED=1 to enable.
 *
 * When enabled, this script:
 *   1. Runs `ledgerful ledger export-public` in the engine repo.
 *   2. Compares the exported entries.ndjson to the current web bundle.
 *   3. If byte-identical, exits without a commit.
 *   4. Otherwise copies the bundle into public/ledger/ and commits it.
 *
 * The script is NOT wired into CI or cron. It is a manual helper that runs in
 * the user's own environment.
 */

import { readFileSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ENGINE_REPO = "C:\\dev\\ledgerful";
const WEB_LEDGER_DIR = join(process.cwd(), "public", "ledger");
const EXPORT_DIR = join(process.cwd(), "tmp", "ledgerful-public-export");

if (process.env.LEDGERFUL_PUBLISH_LEDGER_ENABLED !== "1") {
  console.log(
    "Publishing cron is disabled. Set LEDGERFUL_PUBLISH_LEDGER_ENABLED=1 to enable.",
  );
  process.exit(0);
}

console.log("Running ledgerful ledger export-public...");
execSync(
  `ledgerful ledger export-public --output "${EXPORT_DIR}" --force`,
  {
    cwd: ENGINE_REPO,
    stdio: "inherit",
  },
);

const newEntries = join(EXPORT_DIR, "entries.ndjson");
const currentEntries = join(WEB_LEDGER_DIR, "entries.ndjson");

if (!existsSync(newEntries)) {
  console.error("FAIL: export did not produce entries.ndjson");
  process.exit(1);
}

if (existsSync(currentEntries)) {
  const newHash = readFileSync(newEntries);
  const currentHash = readFileSync(currentEntries);
  if (Buffer.compare(newHash, currentHash) === 0) {
    console.log("No changes; skipping commit.");
    process.exit(0);
  }
}

const bundleFiles = [
  "entries.ndjson",
  "manifest.json",
  "README.md",
  "verifier.html",
];

for (const file of bundleFiles) {
  const src = join(EXPORT_DIR, file);
  const dst = join(WEB_LEDGER_DIR, file);
  if (existsSync(src)) {
    copyFileSync(src, dst);
  }
}

console.log("Staging public/ledger/...");
execSync("git add public/ledger/", { stdio: "inherit" });

console.log("Committing...");
execSync('git commit -m "chore: publish public ledger bundle"', {
  stdio: "inherit",
});

console.log("Published. Run git push to deploy.");
