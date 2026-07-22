# Ledgerful Public Ledger Bundle

This bundle is a redacted, cryptographically verifiable export of the Ledgerful
engine's own signed ledger entries.

## Files

- `manifest.json` — publisher identity, entry count, time range, signature
  metadata, an SHA-256 hash of `entries.ndjson`, and (if present) the signed
  chain head.
- `entries.ndjson` — one JSON object per line containing only the allowlisted
  fields.
- `index.html` — static browse page (no JavaScript).
- `verifier.html` — standalone offline WebCrypto verifier. Open this file in a
  modern browser to verify the manifest signature, entries.ndjson integrity,
  and (for v1 rows only) entry Ed25519 signatures. v2 entry signatures require
  unredacted provenance fields and are verified with the local CLI.
- `README.md` — this file.

## Allowlist

Each published entry includes only:

- `tx_id`
- `category`
- `summary`
- `reason`
- `committed_at`
- `author_pseudonym` (HMAC-SHA256 keyed hash of the author)
- `verification_result`
- `risk_level`
- `entry_hash`
- `sig_version` (1 = legacy five-field; 2 = full provenance; optional on
  historical bundles — missing is treated as 1)
- `signature`
- `public_key`

The following are intentionally redacted: internal IDs, entry type, entity
path, normalized entity, change type, breaking flag, outcome notes, origin,
trace ID, related tickets, raw author, observed flag, and previous chain hash.

## Verification

1. Open `verifier.html` in a browser (manifest + entries hash always; v1 entry
   sigs offline; v2 entry sigs honesty-fenced), or
2. Full entry + chain verify against the source ledger:
   `ledgerful verify --signatures --chain`
3. Export: `ledgerful ledger export-public --output <dir> --sign`

If signed, the bundle also contains:

- `manifest.sig` — raw Ed25519 signature over `manifest.json`
- `manifest.pub` — raw Ed25519 verifying key

## Honest ceiling

This bundle proves the manifest signature and the integrity of entries.ndjson.
Legacy v1 entry signatures (`sig_version=1` or missing) can be re-verified
offline over the published five-field payload. v2 entry signatures
(`sig_version>=2`) bind redacted provenance fields (entity, author, origin, …)
that are not published — offline entry-sig re-verify is intentionally not
claimed for v2; use `ledgerful verify --signatures` against the local ledger.
Chain head (when present) is a rollback checkpoint, not a full offline chain
walk (`prev_hash` is redacted). Key identity requires out-of-band fingerprint
comparison.

## Bot key

The manifest is signed by a dedicated `ledgerful-ledger-bot` keypair that is
separate from the engine's main signing key. This keeps bundle-key rotation
independent of the engine's signing identity.

## Signed

Yes — `manifest.sig` and `manifest.pub` are present.
