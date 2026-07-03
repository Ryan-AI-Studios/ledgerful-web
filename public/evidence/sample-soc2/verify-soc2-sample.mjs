#!/usr/bin/env node
// verify-soc2-sample.mjs
//
// Standalone, rerunnable offline verification of a ledgerful SOC2-style evidence
// export zip, per coordination.md §4.7 ("Offline tamper-evidence" procedure):
//
//   1. Re-SHA-256 every file listed in manifest.json's `files` array and compare
//      against the recorded hashes.
//   2. Verify manifest.sig (raw 64-byte Ed25519 signature) against the exact bytes
//      of manifest.json using manifest.pub (raw 32-byte Ed25519 verifying key).
//
// Usage:
//   node verify-soc2-sample.mjs <path-to-zip-or-extracted-dir>
//
// Exits 0 and prints "VALID" only if every hash matches AND the signature verifies.
// Exits 1 otherwise (and never silently "passes" on a partial check).
//
// Requires: Node >= 18 with built-in node:crypto Ed25519 support.
//
// No external binaries: `.zip` inputs are read with a minimal pure-Node ZIP
// reader (below), not a shelled-out `unzip`. This script is invoked from
// scripts/check-proof-assets.mjs, which is wired into `npm run check:truth`
// (CI-critical) — depending on an external binary with no existence check
// meant a CI image lacking `unzip` would break the whole truth gate with a
// raw ENOENT. The sample zip only ever holds 5 small files with plain
// DEFLATE/stored entries and no data-descriptor/ZIP64 records, so a minimal
// central-directory walk is sufficient; this is NOT a general-purpose ZIP
// library (no multi-disk, no ZIP64, no encryption).

import { createHash, createPublicKey, verify as cryptoVerify } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { join, resolve } from "node:path";

function fail(msg) {
  console.error(`[FAIL] ${msg}`);
  process.exitCode = 1;
}

function sha256Hex(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

// ---------------------------------------------------------------------------
// Minimal pure-Node ZIP reader.
//
// Format reference (PKWARE APPNOTE.TXT): a ZIP file is read from the END
// backwards — the authoritative index is the "End Of Central Directory"
// (EOCD) record, which points at the central directory, whose entries in
// turn point back at each file's local header + compressed data.
//
// Supported: compression method 0 (stored) and 8 (deflate, i.e. raw DEFLATE
// per RFC1951 — inflateRawSync, not the zlib-wrapped inflateSync).
// NOT supported (throws): ZIP64 records, multi-disk archives, encrypted
// entries, and the general-purpose-bit-3 "data descriptor" trailer (sizes
// stored after file data instead of in the local header) — none of these
// appear in this track's small, single-disk, non-encrypted sample zip.
// ---------------------------------------------------------------------------

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIR_SIGNATURE = 0x02014b50;
const LOCAL_HEADER_SIGNATURE = 0x04034b50;
const EOCD_MIN_SIZE = 22;
const MAX_COMMENT_LENGTH = 65535;

function findEndOfCentralDirectory(buf) {
  // The EOCD's variable-length comment means we don't know its exact start,
  // so scan backwards from the end for the signature. Bounded by the
  // maximum possible comment length (a 2-byte field), not the whole file.
  const searchStart = Math.max(0, buf.length - EOCD_MIN_SIZE - MAX_COMMENT_LENGTH);
  for (let i = buf.length - EOCD_MIN_SIZE; i >= searchStart; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIGNATURE) {
      return i;
    }
  }
  throw new Error("not a valid ZIP file: End Of Central Directory record not found");
}

function readZipEntries(buf) {
  const eocdOffset = findEndOfCentralDirectory(buf);
  const totalEntries = buf.readUInt16LE(eocdOffset + 10);
  const centralDirOffset = buf.readUInt32LE(eocdOffset + 16);

  if (centralDirOffset === 0xffffffff || totalEntries === 0xffff) {
    throw new Error("ZIP64 archives are not supported by this minimal reader");
  }

  const entries = new Map();
  let off = centralDirOffset;

  for (let i = 0; i < totalEntries; i++) {
    const sig = buf.readUInt32LE(off);
    if (sig !== CENTRAL_DIR_SIGNATURE) {
      throw new Error(
        `malformed ZIP: expected central directory signature at offset ${off}, got 0x${sig.toString(16)}`,
      );
    }
    const generalPurposeFlag = buf.readUInt16LE(off + 8);
    const compressionMethod = buf.readUInt16LE(off + 10);
    const compressedSize = buf.readUInt32LE(off + 20);
    const uncompressedSize = buf.readUInt32LE(off + 24);
    const nameLength = buf.readUInt16LE(off + 28);
    const extraLength = buf.readUInt16LE(off + 30);
    const commentLength = buf.readUInt16LE(off + 32);
    const localHeaderOffset = buf.readUInt32LE(off + 42);
    const name = buf.toString("utf8", off + 46, off + 46 + nameLength);

    if ((generalPurposeFlag & 0x0008) !== 0) {
      throw new Error(`${name}: data-descriptor entries (general-purpose bit 3) are not supported`);
    }
    if (compressionMethod !== 0 && compressionMethod !== 8) {
      throw new Error(`${name}: unsupported compression method ${compressionMethod} (only stored=0/deflate=8)`);
    }

    entries.set(name, {
      compressionMethod,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });

    off += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function extractZipEntry(buf, entry) {
  const localSig = buf.readUInt32LE(entry.localHeaderOffset);
  if (localSig !== LOCAL_HEADER_SIGNATURE) {
    throw new Error(
      `malformed ZIP: expected local file header signature at offset ${entry.localHeaderOffset}, got 0x${localSig.toString(16)}`,
    );
  }
  const nameLength = buf.readUInt16LE(entry.localHeaderOffset + 26);
  const extraLength = buf.readUInt16LE(entry.localHeaderOffset + 28);
  const dataStart = entry.localHeaderOffset + 30 + nameLength + extraLength;
  const compressedBytes = buf.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    return compressedBytes;
  }
  return inflateRawSync(compressedBytes);
}

/** Read a ZIP buffer into a Map<entryName, decompressedBuffer>. */
function readZip(buf) {
  const entries = readZipEntries(buf);
  const files = new Map();
  for (const [name, entry] of entries) {
    files.set(name, extractZipEntry(buf, entry));
  }
  return files;
}

// Wrap a raw 32-byte Ed25519 public key in a minimal DER/SPKI envelope so
// Node's crypto.createPublicKey() (which expects SPKI/DER, not raw bytes)
// can consume it. The SPKI prefix below is the fixed 12-byte ASN.1 header
// for "Ed25519 public key" (OID 1.3.101.112), followed by the raw 32-byte key.
function rawEd25519ToSpki(rawKey) {
  if (rawKey.length !== 32) {
    throw new Error(`expected 32-byte raw Ed25519 public key, got ${rawKey.length}`);
  }
  const spkiPrefix = Buffer.from(
    "302a300506032b6570032100",
    "hex",
  ); // SEQUENCE { SEQUENCE { OID 1.3.101.112 } BIT STRING (0 unused bits) [32-byte key] }
  return Buffer.concat([spkiPrefix, rawKey]);
}

function main() {
  const inputArg = process.argv[2];
  if (!inputArg) {
    console.error("Usage: node verify-soc2-sample.mjs <path-to-zip-or-extracted-dir>");
    process.exit(2);
  }

  const inputPath = resolve(inputArg);
  if (!existsSync(inputPath)) {
    console.error(`Input path does not exist: ${inputPath}`);
    process.exit(2);
  }

  // Build a uniform `readEntry(name) -> Buffer | null` regardless of
  // whether the input is a .zip (read fully into memory and parsed with the
  // pure-Node reader above — no temp dir, no external binary) or an
  // already-extracted directory (plain file reads, unchanged from before).
  const isZip = inputPath.toLowerCase().endsWith(".zip");
  let readEntry;
  if (isZip) {
    const zipBuf = readFileSync(inputPath);
    console.log(`Reading ${inputPath} (${zipBuf.length} bytes) as ZIP ...`);
    let files;
    try {
      files = readZip(zipBuf);
    } catch (err) {
      console.error(`[FAIL] could not parse ZIP: ${err.message}`);
      printSummary(false);
      return;
    }
    console.log(`  found ${files.size} entr${files.size === 1 ? "y" : "ies"}: ${[...files.keys()].join(", ")}`);
    readEntry = (name) => files.get(name) ?? null;
  } else {
    readEntry = (name) => {
      // Reject traversal/absolute entry names before ever touching the
      // filesystem: `manifest.json`'s `files` array is untrusted input until
      // the signature below is verified, so a crafted manifest listing
      // `../../../etc/passwd` (or an absolute/drive-qualified path) must
      // never resolve outside `inputPath`.
      if (name.includes("..") || name.startsWith("/") || name.startsWith("\\") || /^[a-zA-Z]:/.test(name)) {
        throw new Error(`refusing to read entry with unsafe name: ${name}`);
      }
      const filePath = join(inputPath, name);
      return existsSync(filePath) ? readFileSync(filePath) : null;
    };
  }

  const manifestBytes = readEntry("manifest.json");
  const sig = readEntry("manifest.sig");
  const pub = readEntry("manifest.pub");

  for (const [name, bytes] of [
    ["manifest.json", manifestBytes],
    ["manifest.sig", sig],
    ["manifest.pub", pub],
  ]) {
    if (!bytes) fail(`missing required file: ${name}`);
  }
  if (process.exitCode) {
    printSummary(false);
    return;
  }

  console.log(`manifest.json: ${manifestBytes.length} bytes`);
  console.log(`manifest.sig:  ${sig.length} bytes (expect 64, raw Ed25519 sig)`);
  console.log(`manifest.pub:  ${pub.length} bytes (expect 32, raw Ed25519 pubkey)`);

  if (sig.length !== 64) fail(`manifest.sig is ${sig.length} bytes, expected 64`);
  if (pub.length !== 32) fail(`manifest.pub is ${pub.length} bytes, expected 32`);

  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (!Array.isArray(manifest.files)) {
    fail("manifest.json has no `files` array");
    printSummary(false);
    return;
  }

  // Verify the manifest's signature BEFORE reading any file it lists. Until
  // this passes, `manifest.files` is untrusted input — an attacker who can
  // craft a fake manifest.json could otherwise get us to read arbitrary
  // entry names via readEntry() (mitigated by the name-sanitization above in
  // directory mode, but verifying signature-first removes the need to rely
  // on that as the only guard).
  console.log("");
  console.log("Verifying manifest.sig against manifest.json bytes using manifest.pub ...");
  let sigValid = false;
  try {
    const spki = rawEd25519ToSpki(pub);
    const keyObject = createPublicKey({
      key: spki,
      format: "der",
      type: "spki",
    });
    // Ed25519 uses the "pure" scheme; Node requires passing `null` as the
    // digest algorithm argument for crypto.verify with Ed25519 keys.
    sigValid = cryptoVerify(null, manifestBytes, keyObject, sig);
  } catch (err) {
    fail(`signature verification threw: ${err.message}`);
  }

  if (sigValid) {
    console.log("  [OK]   manifest.sig verifies against manifest.json + manifest.pub");
  } else {
    fail("manifest.sig does NOT verify against manifest.json + manifest.pub");
  }

  console.log("");
  console.log(`Checking ${manifest.files.length} file hash(es) from manifest.json ...`);
  let hashesChecked = 0;
  for (const entry of manifest.files) {
    let bytes;
    try {
      bytes = readEntry(entry.name);
    } catch (err) {
      fail(`${entry.name}: ${err.message}`);
      continue;
    }
    if (!bytes) {
      fail(`listed file missing from archive: ${entry.name}`);
      continue;
    }
    const actualHash = sha256Hex(bytes);
    const actualSize = bytes.length;
    const hashOk = actualHash === entry.sha256;
    const sizeOk = actualSize === entry.size;
    hashesChecked++;
    if (hashOk && sizeOk) {
      console.log(`  [OK]   ${entry.name}  sha256=${actualHash}  size=${actualSize}`);
    } else {
      if (!hashOk) {
        fail(
          `${entry.name}: sha256 mismatch (recorded=${entry.sha256} actual=${actualHash})`,
        );
      }
      if (!sizeOk) {
        fail(`${entry.name}: size mismatch (recorded=${entry.size} actual=${actualSize})`);
      }
    }
  }

  console.log("");
  console.log(`entryCount (from manifest.json): ${manifest.entryCount}`);
  console.log(`generatedAt: ${manifest.generatedAt}`);

  const allOk = !process.exitCode && sigValid && hashesChecked === manifest.files.length;
  printSummary(allOk, { hashesChecked, sigValid });
}

function printSummary(ok, details) {
  console.log("");
  console.log("==================== SUMMARY ====================");
  if (ok) {
    console.log(
      `VALID: all ${details.hashesChecked} file hash(es) match and manifest.sig verified successfully.`,
    );
    console.log("Signature verified: true");
  } else {
    console.log("INVALID: one or more checks failed. See [FAIL] lines above.");
    console.log(`Signature verified: ${details && details.sigValid ? "true" : "false"}`);
  }
  console.log("===================================================");
  process.exit(ok ? 0 : 1);
}

main();
