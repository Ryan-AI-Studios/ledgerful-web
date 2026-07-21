#!/usr/bin/env node
/**
 * check-allowlist-guard.mjs — verify that public/ledger/entries.ndjson only
 * contains allowlisted fields and no obvious PII leaks.
 *
 * Wired into `npm run check:truth`. Exits 1 on any violation.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const allowlist = [
  "tx_id",
  "category",
  "summary",
  "reason",
  "committed_at",
  "author_pseudonym",
  "verification_result",
  "verification_duration_ms",
  "risk_level",
  "signature",
  "public_key",
  "entry_hash",
  "prev_hash",
];

const ndjsonPath = join(process.cwd(), "public", "ledger", "entries.ndjson");
const lines = readFileSync(ndjsonPath, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const allowlistSet = new Set(allowlist);
const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const failures = [];

let fieldCount = 0;

for (let i = 0; i < lines.length; i++) {
  const entry = JSON.parse(lines[i]);
  const keys = Object.keys(entry);
  fieldCount = keys.length;

  for (const key of keys) {
    if (!allowlistSet.has(key)) {
      failures.push(`Disallowed field "${key}" in entry ${i + 1}`);
    }
  }

  for (const [key, value] of Object.entries(entry)) {
    if (value === null || value === undefined) continue;
    if (key === "committed_at") continue;
    const str = String(value);
    // Signed fields are byte-exact (cannot redact without breaking Ed25519).
    // Allow known-public bot/AI co-author domains that appear in git trailers;
    // flag only unexpected third-party addresses.
    const emailMatch = str.match(emailPattern);
    if (emailMatch) {
      const email = emailMatch[0].toLowerCase();
      const allowed =
        email.endsWith("@ledgerful.io") ||
        email === "noreply@anthropic.com" ||
        email.endsWith("@users.noreply.github.com");
      if (!allowed) {
        failures.push(
          `Email-like value in entry ${i + 1}, field "${key}": ${emailMatch[0]}`,
        );
      }
    }
    // Also catch obvious identity markers that should never appear.
    if (["author", "author_email", "entity", "related_tickets", "trace_id", "origin", "change_type", "is_breaking"].includes(key)) {
      failures.push(`Identity marker "${key}" in entry ${i + 1}`);
    }
  }
}

if (failures.length > 0) {
  console.error("\ncheck-allowlist-guard: FAILED\n");
  failures.forEach((f) => console.error(" ", f));
  process.exit(1);
}

console.log(
  `Allowlist guard passed (${lines.length} entries, ${fieldCount} fields each)`,
);
