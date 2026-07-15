#!/usr/bin/env node
/**
 * check-ledger-signatures.mjs — verify that all public ledger entry
 * signatures are valid AND that a tampered payload is rejected.
 *
 * Wired into `npm run check:truth`. Exits 1 on any failure.
 */

import assert from "node:assert/strict";
import { createPublicKey, verify as cryptoVerify } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ndjsonPath = join(process.cwd(), "public", "ledger", "entries.ndjson");
const lines = readFileSync(ndjsonPath, "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

const spkiPrefix = Buffer.from("302a300506032b6570032100", "hex");

function buildPayload(entry) {
  return `tx_id:${entry.tx_id}\ncategory:${entry.category ?? ""}\nsummary:${entry.summary ?? ""}\nreason:${entry.reason ?? ""}\ncommitted_at:${entry.committed_at ?? ""}`;
}

function verifyEntry(entry) {
  if (!entry.signature || !entry.public_key) return false;
  const pub = Buffer.from(entry.public_key, "hex");
  const sig = Buffer.from(entry.signature, "hex");
  const key = createPublicKey({
    key: Buffer.concat([spkiPrefix, pub]),
    format: "der",
    type: "spki",
  });
  return cryptoVerify(null, Buffer.from(buildPayload(entry)), key, sig);
}

// 1. All entries must verify as valid
let validCount = 0;
let invalidCount = 0;
for (const line of lines) {
  const entry = JSON.parse(line);
  if (verifyEntry(entry)) {
    validCount++;
  } else {
    invalidCount++;
  }
}

assert.equal(
  invalidCount,
  0,
  `${invalidCount} of ${lines.length} entries failed signature verification (expected 0 failures)`,
);
console.log(`Ledger signature check: all ${validCount} entries verified as valid.`);

// 2. A tampered payload must be rejected
const firstEntry = JSON.parse(lines[0]);
const tampered = { ...firstEntry, summary: firstEntry.summary + " TAMPERED" };
const tamperedValid = verifyEntry(tampered);

assert.equal(
  tamperedValid,
  false,
  "Tampered payload was accepted as valid (expected rejection)",
);
console.log("Tampered payload correctly rejected.");