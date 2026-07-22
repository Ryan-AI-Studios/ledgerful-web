#!/usr/bin/env node
/**
 * check-ledger-signatures.mjs — verify public ledger entry signatures with
 * the 0072 dual-path honesty fence:
 *   - sig_version missing or 1 → five-field Ed25519 must VALID
 *   - sig_version >= 2 → do NOT five-field re-verify offline (provenance redacted)
 *
 * Also asserts a tampered v1 payload is rejected.
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

function entrySigVersion(entry) {
  if (entry.sig_version == null) return 1;
  const n = Number(entry.sig_version);
  return Number.isFinite(n) ? n : 1;
}

function buildPayload(entry) {
  return `tx_id:${entry.tx_id}\ncategory:${entry.category ?? ""}\nsummary:${entry.summary ?? ""}\nreason:${entry.reason ?? ""}\ncommitted_at:${entry.committed_at ?? ""}`;
}

function verifyEntryV1(entry) {
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

// 1. Dual-path: v1 must verify; v2 must be honesty-fenced (not five-field verified).
let validCount = 0;
let invalidCount = 0;
let v2FencedCount = 0;
for (const line of lines) {
  const entry = JSON.parse(line);
  const sigVersion = entrySigVersion(entry);
  if (sigVersion >= 2) {
    // Honesty fence: presence of key material is enough offline; do not claim VALID.
    if (!entry.signature || !entry.public_key) {
      invalidCount++;
      continue;
    }
    v2FencedCount++;
    continue;
  }
  if (verifyEntryV1(entry)) {
    validCount++;
  } else {
    invalidCount++;
  }
}

assert.equal(
  invalidCount,
  0,
  `${invalidCount} of ${lines.length} entries failed dual-path verification (expected 0 failures)`,
);
console.log(
  `Ledger signature check: ${validCount} v1 valid, ${v2FencedCount} v2 not re-verified offline (of ${lines.length}).`,
);

// 2. A tampered v1 five-field payload must be rejected.
const firstV1 =
  lines
    .map((l) => JSON.parse(l))
    .find((e) => entrySigVersion(e) < 2 && e.signature && e.public_key) ??
  null;
assert.ok(firstV1, "expected at least one v1 signed entry for tamper check");
const tampered = { ...firstV1, summary: firstV1.summary + " TAMPERED" };
const tamperedValid = verifyEntryV1(tampered);

assert.equal(
  tamperedValid,
  false,
  "Tampered payload was accepted as valid (expected rejection)",
);
console.log("Tampered v1 payload correctly rejected.");
