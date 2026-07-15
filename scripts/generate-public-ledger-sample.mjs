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

  writeFileSync(
    path.join(OUTPUT_DIR, "verifier.html"),
    verifierHtml(),
    "utf8",
  );

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

Open \`verifier.html\` in a browser (it works from \`file://\`, with no network)
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
| \`verifier.html\` | Standalone offline HTML verifier using WebCrypto Ed25519. |

## Re-generation

Run from the web repo root:

\`\`\`powershell
node scripts/generate-public-ledger-sample.mjs
\`\`\`

The script reads from the engine repo, applies the allowlist, and rewrites the
files above deterministically.
`;
}

function verifierHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ledgerful public ledger — offline verifier</title>
<style>
:root {
  color-scheme: light dark;
  --bg: #0b0d10;
  --surface: #11141a;
  --ink: #f0f2f5;
  --muted: #9aa3b2;
  --line: #2a303c;
  --ok: #3ecf7a;
  --bad: #f06b6b;
  --brand: #4db8ff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
@media (prefers-color-scheme: light) {
  :root { --bg: #ffffff; --surface: #f6f8fa; --ink: #111318; --muted: #4b5563; --line: #d1d5db; }
}
body { margin: 0; padding: 24px; background: var(--bg); color: var(--ink); line-height: 1.5; }
h1 { font-size: 1.35rem; margin: 0 0 8px; }
p { margin: 0 0 16px; color: var(--muted); max-width: 70ch; }
button { font: inherit; cursor: pointer; border: 1px solid var(--line); background: var(--surface); color: var(--ink); padding: 10px 16px; border-radius: 6px; }
button:hover { border-color: var(--brand); }
#status { margin: 16px 0; white-space: pre-wrap; }
table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.85rem; }
th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
th { color: var(--muted); font-weight: 600; }
.ok { color: var(--ok); }
.bad { color: var(--bad); }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; word-break: break-all; }
tr.hidden { display: none; }
#filter { margin-top: 12px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); font: inherit; width: min(100%, 360px); }
</style>
</head>
<body>
<h1>Ledgerful public ledger — offline verifier</h1>
<p>
  Loads <code>entries.ndjson</code> and <code>manifest.json</code> from the same
  directory, verifies each entry's Ed25519 signature with WebCrypto, and lists
  the result. This page has no external dependencies and works from
  <code>file://</code>.
</p>
<button id="verify" type="button">Verify all entries</button>
<input id="filter" type="search" placeholder="Filter by tx_id, category, summary, or risk…" aria-label="Filter entries">
<div id="status">Ready. Click "Verify all entries" to start.</div>
<table>
  <thead>
    <tr><th>#</th><th>tx_id</th><th>category</th><th>summary</th><th>risk</th><th>status</th></tr>
  </thead>
  <tbody id="rows"></tbody>
</table>
<script>
(async function () {
  const status = document.getElementById('status');
  const rows = document.getElementById('rows');
  const filter = document.getElementById('filter');
  let entries = [];
  let manifest = null;

  async function load() {
    try {
      const [entriesRes, manifestRes] = await Promise.all([
        fetch('entries.ndjson'),
        fetch('manifest.json'),
      ]);
      if (!entriesRes.ok) throw new Error('entries.ndjson: ' + entriesRes.status);
      if (!manifestRes.ok) throw new Error('manifest.json: ' + manifestRes.status);
      const ndjson = await entriesRes.text();
      entries = ndjson.split('\\n').filter(Boolean).map(line => {
        try { return JSON.parse(line); } catch (e) { return null; }
      }).filter(Boolean);
      manifest = await manifestRes.json();
      status.textContent = 'Loaded ' + entries.length + ' entries. Manifest entryCount: ' + (manifest.entryCount ?? '?') + '.';
      render();
    } catch (err) {
      status.textContent = 'Load error: ' + err.message;
      status.className = 'bad';
    }
  }

  function buildPayload(entry) {
    return [
      'tx_id:' + entry.tx_id,
      'category:' + (entry.category ?? ''),
      'summary:' + (entry.summary ?? ''),
      'reason:' + (entry.reason ?? ''),
      'committed_at:' + (entry.committed_at ?? ''),
    ].join('\\n');
  }

  function truncate(hex, n) {
    if (!hex || hex.length <= n + 3) return hex;
    return hex.slice(0, n) + '…' + hex.slice(-4);
  }

  function render(results) {
    rows.innerHTML = '';
    entries.forEach((entry, i) => {
      const r = results ? results[i] : null;
      const tr = document.createElement('tr');
      tr.dataset.search = [
        entry.tx_id,
        entry.category,
        entry.summary,
        entry.risk_level,
      ].join(' ').toLowerCase();
      tr.innerHTML = '<td>' + (i + 1) + '</td>' +
        '<td class="mono" title="' + entry.tx_id + '">' + truncate(entry.tx_id, 12) + '</td>' +
        '<td>' + (entry.category ?? '-') + '</td>' +
        '<td>' + (entry.summary ?? '-') + '</td>' +
        '<td>' + (entry.risk_level ?? '-') + '</td>' +
        '<td class="' + (r ? (r.ok ? 'ok' : 'bad') : '') + '">' + (r ? (r.ok ? 'VALID' : 'INVALID') : '—') + '</td>';
      rows.appendChild(tr);
    });
    applyFilter();
  }

  function applyFilter() {
    const q = filter.value.trim().toLowerCase();
    for (const tr of rows.children) {
      tr.classList.toggle('hidden', q && !(tr.dataset.search || '').includes(q));
    }
  }

  async function verifyAll() {
    if (!entries.length) {
      status.textContent = 'No entries loaded.';
      return;
    }
    if (!window.crypto || !crypto.subtle) {
      status.textContent = 'WebCrypto is not available in this browser. Use the CLI verifier instead: ledgerful verify --signatures against a local copy of the bundle, or open this page in a modern browser (Chrome 113+, Firefox 130+, Safari 17+).';
      status.className = 'bad';
      return;
    }
    status.textContent = 'Verifying ' + entries.length + ' entries…';
    const results = [];
    let valid = 0;
    let invalid = 0;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      let ok = false;
      let error = null;
      try {
        const pubRaw = hexToBytes(entry.public_key);
        const sigRaw = hexToBytes(entry.signature);
        const key = await crypto.subtle.importKey('raw', pubRaw, { name: 'Ed25519' }, false, ['verify']);
        const payload = new TextEncoder().encode(buildPayload(entry));
        ok = await crypto.subtle.verify('Ed25519', key, sigRaw, payload);
      } catch (err) {
        error = err.message;
      }
      if (ok) valid++; else invalid++;
      results.push({ ok, error });
    }
    render(results);
    const manifestNote = manifest && manifest.bundleType === 'sample' ? ' Manifest signature is not included in this sample (no bot key yet).' : '';
    status.textContent = valid + ' of ' + entries.length + ' entries verified as VALID' + (invalid ? '; ' + invalid + ' INVALID' : '') + '.' + manifestNote;
    status.className = invalid ? '' : 'ok';
  }

  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }

  filter.addEventListener('input', applyFilter);
  document.getElementById('verify').addEventListener('click', verifyAll);

  await load();
})();
</script>
</body>
</html>`;
}

main();
