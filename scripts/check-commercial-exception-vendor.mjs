import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Fail-closed vendor guard for public/COMMERCIAL-EXCEPTION.md (track 0069).
 *
 * Always requires:
 *   1. Vendored file exists and is non-empty
 *   2. SHA-256 matches the pinned digest below (provenance without needing the engine tree)
 *   3. Load-bearing content needles present
 *
 * When the sibling engine source is present, also require byte-identity with engine
 * and that the engine hash matches the pin (so a pin drift is caught early).
 *
 * When re-vendoring from engine after an Exception edit:
 *   1. Copy-Item the engine file to public/COMMERCIAL-EXCEPTION.md
 *   2. Update PINNED_SHA256 to the new digest
 */

/** SHA-256 of engine + vendored COMMERCIAL-EXCEPTION.md (8809 bytes, 2026-07-21). */
const PINNED_SHA256 =
  "d0a7bf9c77a92f324522794952ec842efda99f5ce71309512c15803eda38dedd";

const VENDOR_PATH = path.join(process.cwd(), "public", "COMMERCIAL-EXCEPTION.md");
const ENGINE_PATH = "C:\\dev\\ledgerful\\COMMERCIAL-EXCEPTION.md";

function sha256Hex(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

if (!existsSync(VENDOR_PATH)) {
  console.error(
    "Missing vendored public/COMMERCIAL-EXCEPTION.md — copy from ledgerful/COMMERCIAL-EXCEPTION.md.",
  );
  process.exit(1);
}

const vendorStat = statSync(VENDOR_PATH);
if (!vendorStat.isFile() || vendorStat.size < 100) {
  console.error(
    `Vendored public/COMMERCIAL-EXCEPTION.md is missing or too small (${vendorStat.size} bytes).`,
  );
  process.exit(1);
}

const vendorRaw = readFileSync(VENDOR_PATH);
const vendorHash = sha256Hex(vendorRaw);

if (vendorHash !== PINNED_SHA256) {
  console.error(
    [
      "Vendored public/COMMERCIAL-EXCEPTION.md SHA-256 does not match pin.",
      `  expected: ${PINNED_SHA256}`,
      `  actual:   ${vendorHash}`,
      "Re-vendor from ledgerful/COMMERCIAL-EXCEPTION.md and update PINNED_SHA256 in this script.",
    ].join("\n"),
  );
  process.exit(1);
}

const vendorText = vendorRaw.toString("utf8");
for (const needle of [
  "Qualified Small Entity",
  "Evaluation Use",
  "Aggregated Gross Revenue",
  "legal@ledgerful.dev",
  "90 days",
  "Internal Business Use",
]) {
  if (!vendorText.includes(needle)) {
    console.error(
      `Vendored public/COMMERCIAL-EXCEPTION.md is missing required phrase: ${needle}`,
    );
    process.exit(1);
  }
}

if (!existsSync(ENGINE_PATH)) {
  console.log(
    `Vendored public/COMMERCIAL-EXCEPTION.md matches pin ${PINNED_SHA256.slice(0, 12)}… (engine source not available for byte compare).`,
  );
  process.exit(0);
}

const engineRaw = readFileSync(ENGINE_PATH);
const engineHash = sha256Hex(engineRaw);

if (engineHash !== PINNED_SHA256) {
  console.error(
    [
      "Engine COMMERCIAL-EXCEPTION.md no longer matches the web pin — Exception was edited upstream.",
      `  pin:    ${PINNED_SHA256}`,
      `  engine: ${engineHash}`,
      "Re-vendor into public/COMMERCIAL-EXCEPTION.md and update PINNED_SHA256.",
    ].join("\n"),
  );
  process.exit(1);
}

if (Buffer.compare(engineRaw, vendorRaw) !== 0) {
  console.error(
    `Vendored public/COMMERCIAL-EXCEPTION.md differs from engine source ${ENGINE_PATH} — re-vendor it.`,
  );
  process.exit(1);
}

console.log(
  `Vendored public/COMMERCIAL-EXCEPTION.md matches engine source and pin ${PINNED_SHA256.slice(0, 12)}….`,
);
