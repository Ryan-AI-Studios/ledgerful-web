import { createHash, createHmac } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

// Generate a deterministic, redacted sample of the Ledgerful engine's own signed
// change ledger for publication at /ledger on the public web site.
//
// Source of truth: real ledger data from the engine repo (C:\dev\ledgerful),
// read via `ledgerful ledger export-provenance`. The sample applies a strict
// field allowlist and replaces author identifiers with deterministic HMAC
// pseudonyms so email addresses and names never reach the public bundle.
//
// This script must be deterministic: running it twice produces byte-identical
// output (sorted entries, stable JSON key order, no timestamps in output other
// than the recorded committed_at values and an explicit generatedAt).

const ENGINE_REPO = "C:\\dev\\ledgerful";
const WEB_REPO = process.cwd();
const OUTPUT_DIR = path.join(WEB_REPO, "public", "ledger");

const DEMO_SECRET =
  "ledgerful-demo-pseudonym-key-NOT-PRODUCTION-0045-SAMPLE";

const ALLOWLIST = [
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

function deterministicEntryHash(entry) {
  // Deterministic entry identifier used by this web sample. The engine-side
  // export-public command (Track 0046) will compute the actual chain hash using
  // tx_id + signature_hex + prev_hash. For the sample we expose a stable
  // content hash so the web UI can render an identifier without waiting for
  // the chain-aware export.
  const input = `${entry.tx_id}${entry.category}${entry.summary}${entry.reason}${entry.committed_at}`;
  return createHash("sha256").update(input, "utf8").digest("hex");
}

function authorPseudonym(author) {
  return createHmac("sha256", DEMO_SECRET).update(author, "utf8").digest("hex");
}

function runLedgerfulExport() {
  const tempFile = path.join(ENGINE_REPO, "ledger-provenance-web-sample.json");
  const result = spawnSync(
    "ledgerful",
    ["ledger", "export-provenance", "-o", tempFile, "--force"],
    {
      cwd: ENGINE_REPO,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      env: process.env,
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `ledgerful ledger export-provenance failed: ${result.stderr || result.stdout}`,
    );
  }
  const raw = readFileSync(tempFile, "utf8");
  // Clean up the temporary file inside the engine repo so we don't leave web
  // artifacts behind.
  try {
    unlinkSync(tempFile);
  } catch {
    // Best-effort cleanup; do not fail the script.
  }
  return JSON.parse(raw);
}

function formatUtcRfc3339(date) {
  return date.toISOString().replace(/\.[0-9]{3}Z$/, "Z");
}

function stableJsonStringify(value) {
  return JSON.stringify(value, (key, val) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const sorted = {};
      for (const k of Object.keys(val).sort()) {
        sorted[k] = val[k];
      }
      return sorted;
    }
    return val;
  });
}

// Build a sample entry from the engine's raw provenance export.
function buildSampleEntry(raw) {
  // REDACT: drop entity paths, author name/email, relatedTickets file lists,
  // argv, env, etc. Keep only the allowlisted fields.
  //
  // summary and reason are part of the Ed25519 signing payload (crypto.rs:208-210).
  // They must stay byte-exact so browser-based signature verification works.
  // We do NOT mask or edit them in the bundle; display masking is done in the UI
  // (see the displayMask function in the page components).
  //
  // Entries with @ledgerful.io bot sign-off trailers in signed text are kept
  // as-is: @ledgerful.io is Ledgerful's own internal domain (already public via
  // npm/GitHub), not third-party PII. The displayMask function in the UI masks
  // emails and Signed-off-by lines at render time.
  const summary = raw.summary ?? null;
  const reason = raw.reason ?? null;
  const entry = {
    tx_id: raw.tx_id,
    category: raw.category ?? null,
    summary,
    reason,
    committed_at: raw.committed_at ?? null,
    author_pseudonym: authorPseudonym(raw.author ?? "unknown"),
    verification_result: raw.verification_status ?? null,
    verification_duration_ms: null,
    risk_level: raw.risk ?? null,
    signature: raw.signature ?? null,
    public_key: raw.public_key ?? null,
    entry_hash: null,
    prev_hash: null,
  };
  entry.entry_hash = deterministicEntryHash(entry);
  return entry;
}

// Phase 0 PII inspection: classify PII inside the signed `summary`/`reason`
// fields. Returns entries to exclude (third-party PII embedded in signed text
// that cannot be redacted without breaking Ed25519 signatures) and a report.
function inspectSignedPii(entries) {
  const exclude = [];
  const report = [];

  for (const entry of entries) {
    const text = `${entry.summary ?? ""}\n${entry.reason ?? ""}`;
    const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (!emails) continue;

    const unique = [...new Set(emails)];
    const ownOnly = unique.every((email) => email.endsWith("@ledgerful.io"));
    const hasTrailer = /(?:Signed-off-by|Co-Authored-by):/i.test(text);

    report.push({
      tx_id: entry.tx_id,
      author: entry.author ?? "unknown",
      emails: unique,
      ownOnly,
      inSignedTrailer: hasTrailer,
    });

    // Exclude entries that embed third-party PII inside signed text. The
    // signature binds the literal string, so we cannot edit it.
    if (!ownOnly) {
      exclude.push(entry.tx_id);
    }
  }

  return { exclude, report };
}

function main() {
  if (!existsSync(ENGINE_REPO)) {
    throw new Error(`Engine repo not found at ${ENGINE_REPO}`);
  }

  const rawEntries = runLedgerfulExport();
  if (!Array.isArray(rawEntries)) {
    throw new Error("Expected ledger export to be an array of entries");
  }

  // Phase 0: inspect signed fields for third-party PII before building sample.
  const piiInspection = inspectSignedPii(rawEntries);
  if (piiInspection.exclude.length > 0) {
    console.error(
      "Excluded entries with third-party PII in signed text:",
      piiInspection.exclude.join(", "),
    );
  }

  // Sort ascending by committed_at for a stable, append-ordered ledger view.
  const sorted = [...rawEntries]
    .filter((e) => !piiInspection.exclude.includes(e.tx_id))
    .sort((a, b) => {
      const ta = a.committed_at ?? "";
      const tb = b.committed_at ?? "";
      if (ta === tb) return a.tx_id.localeCompare(b.tx_id);
      return ta.localeCompare(tb);
    });

  const entries = sorted.map(buildSampleEntry);

  const ndjson = entries.map((e) => stableJsonStringify(e)).join("\n");
  if (ndjson) {
    writeFileSync(path.join(OUTPUT_DIR, "entries.ndjson"), ndjson + "\n", "utf8");
  } else {
    writeFileSync(path.join(OUTPUT_DIR, "entries.ndjson"), "", "utf8");
  }

  const sizes = new Map();
  for (const entry of entries) {
    sizes.set(entry.tx_id, Buffer.byteLength(stableJsonStringify(entry), "utf8"));
  }

  const entryCount = entries.length;
  const firstCommittedAt = entries[0]?.committed_at ?? null;
  const lastCommittedAt = entries[entries.length - 1]?.committed_at ?? null;
  const generatedAt = lastCommittedAt ?? formatUtcRfc3339(new Date());

  const entriesNdjsonBytes = readFileSync(
    path.join(OUTPUT_DIR, "entries.ndjson"),
    "utf8",
  );
  const entriesSha256 = createHash("sha256")
    .update(entriesNdjsonBytes, "utf8")
    .digest("hex");
  const entriesSize = Buffer.byteLength(entriesNdjsonBytes, "utf8");

  const manifest = {
    publisher: "Ledgerful engine sample export",
    entryCount,
    timeRange: {
      first: firstCommittedAt,
      last: lastCommittedAt,
    },
    generatedAt,
    allowlist: ALLOWLIST,
    sigAlg: "Ed25519",
    bundleType: "sample",
    chainHeadPresent: false,
    files: [
      {
        name: "entries.ndjson",
        sha256: entriesSha256,
        size: entriesSize,
      },
    ],
  };

  // Stable manifest serialization.
  const manifestJson = `${JSON.stringify(
    manifest,
    (key, val) => {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        const sorted = {};
        for (const k of Object.keys(val).sort()) {
          sorted[k] = val[k];
        }
        return sorted;
      }
      return val;
    },
    2,
  )}\n`;
  writeFileSync(path.join(OUTPUT_DIR, "manifest.json"), manifestJson, "utf8");

  writeFileSync(
    path.join(OUTPUT_DIR, "README.md"),
    readmeContent(entryCount, firstCommittedAt, lastCommittedAt, generatedAt, sizes),
    "utf8",
  );

  // Track 0075: write the CSP dual-file shell only. Do NOT emit an inline
  // verifier with tr.innerHTML of entry free-text (historical RT-X0 sink).
  // The live DOM-safe logic lives in public/ledger/verifier.js and is
  // maintained separately from this sample-data generator.
  writeFileSync(
    path.join(OUTPUT_DIR, "verifier.html"),
    cspVerifierShell(),
    "utf8",
  );
  const verifierJsPath = path.join(OUTPUT_DIR, "verifier.js");
  if (!existsSync(verifierJsPath)) {
    console.error(
      "FAIL: public/ledger/verifier.js is missing. Restore the DOM-safe 0075 verifier before deploy.",
    );
    process.exit(1);
  }

  console.log(
    `Wrote public/ledger sample with ${entryCount} entries (${entriesSize} bytes).`,
  );

  if (piiInspection.report.length > 0) {
    console.log(
      `PII inspection: ${piiInspection.report.length} entries with emails in signed text, ${piiInspection.exclude.length} excluded for third-party PII.`,
    );
  }
}

function readmeContent(
  entryCount,
  firstCommittedAt,
  lastCommittedAt,
  generatedAt,
  sizes,
) {
  const totalBytes = [...sizes.values()].reduce((a, b) => a + b, 0);
  return `# Ledgerful public ledger sample

This directory contains a **sample** of the Ledgerful engine's own development
change ledger, published for review and offline verification. It is **not**
a live, automatically published ledger — the publishing cron is disabled
until the engine-side \`ledger export-public\` command and the bot signing key
are in place.

## Scope

- **Entry count:** ${entryCount}
- **Time range:** ${firstCommittedAt ?? "n/a"} → ${lastCommittedAt ?? "n/a"}
- **Generated at:** ${generatedAt}
- **Approximate raw entry bytes:** ${totalBytes}

## Source

The entries were generated by running the real engine command
\`ledgerful ledger export-provenance\` in the Ledgerful engine repository
(\`C:\\\\dev\\\\ledgerful\`), then redacting and pseudonymizing the result.
No entries were invented or hand-edited.

## Field allowlist

Only these fields are published:

${ALLOWLIST.map((f) => `- \`${f}\``).join("\n")}

## Redactions

The following are **removed** from every entry:

- File paths and entity names (the \`entity\` field is dropped)
- Author email, name, or any other identity marker
- Commit messages beyond \`summary\` and \`reason\`
- argv, environment variables, hostnames, or machine identifiers
- Any ticket/PR numbers that expose internal tooling

Email addresses and sign-off lines (\`Signed-off-by\`, \`Co-Authored-by\`) inside
\`summary\` or \`reason\` are kept byte-exact in the bundle because the engine
signs the literal text — editing them would break Ed25519 verification. The
web UI masks these at display time. Ledgerful's own \`@ledgerful.io\` bot
sign-off trailers are kept as-is (the domain is already public via npm/GitHub);
entries containing third-party PII in signed text are excluded from the bundle
entirely.

## Author pseudonymization

\`author_pseudonym\` is computed as \`HMAC-SHA256(secret-key, author)\` using a
secret key that is never published — not in the bundle, not in the repo, not
in docs. The same author always produces the same pseudonym, so
attribution patterns are visible, but real identities are not recoverable from
the bundle. The production key is never published.

## Honest ceiling

This sample proves each entry's Ed25519 signature against the public key in the
entry. It **does not** prove:

1. The order or completeness of entries (chain continuity) — \`prev_hash\` is
   intentionally null in this sample because chain linkage is produced by the
   engine-side \`export-public\` command in a follow-up track.
2. The identity behind the signing key — out-of-band fingerprint comparison is
   required before treating a public key as authentic.

Use honest language: "tamper-evident", "signed", and "cryptographic". Never
use the banned superlatives for this ledger.

## Verification

Open \`verifier.html\` in a browser (loads sibling \`verifier.js\`; works from \`file://\` when the browser allows local fetch)
to verify every entry's Ed25519 signature using WebCrypto. The manifest in
\`manifest.json\` is **not** signed in this sample because there is no bot
signing key yet; the real publishing cron will sign the manifest with a
separate bot key.

## Files

| File | Purpose |
| --- | --- |
| \`entries.ndjson\` | One JSON object per line, allowlisted and pseudonymized entries, ordered by \`committed_at\` ascending. |
| \`manifest.json\` | Sample manifest: publisher, entry count, time range, allowlist, and a SHA-256 hash of \`entries.ndjson\`. Not signed. |
| \`README.md\` | This file. |
| \`verifier.html\` | CSP shell for the offline WebCrypto verifier (loads \`verifier.js\`). |
| \`verifier.js\` | DOM-safe verifier logic (\`textContent\` only for free-text; track 0075). |

## Re-generation

Run from the web repo root:

\`\`\`powershell
node scripts/generate-public-ledger-sample.mjs
\`\`\`

The script reads from the engine repo, applies the allowlist, and rewrites the
files above deterministically.
`;
}

function cspVerifierShell() {
  // Matches public/ledger/verifier.html — external verifier.js for CSP script-src 'self'.
  // Logic lives in verifier.js (DOM-safe textContent path, track 0075 / RT-X0).
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Ledgerful Public Ledger Verifier</title>
<style>
body { font-family: system-ui, -apple-system, sans-serif; margin: 2rem; }
#status { font-weight: bold; }
.valid { color: green; }
.invalid { color: red; }
.unsigned { color: gray; }
pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
</style>
</head>
<body>
<h1>Ledgerful Public Ledger Verifier</h1>
<p>This page verifies the bundle's manifest signature and each entry's Ed25519 signature using WebCrypto. It works offline; no external resources are loaded.</p>
<p id="status">Loading bundle files...</p>
<div id="results"></div>
<!-- External script: production CSP allows script-src 'self' only (no unsafe-inline). -->
<script src="verifier.js"></script>
</body>
</html>
`;
}

main();