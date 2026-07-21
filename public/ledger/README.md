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
  modern browser to verify the manifest signature and every entry's Ed25519
  signature without network access.
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
- `signature`
- `public_key`

The following are intentionally redacted: internal IDs, entry type, entity
path, normalized entity, change type, breaking flag, outcome notes, origin,
trace ID, related tickets, raw author, observed flag, and previous chain hash.

## Verification

1. Open `verifier.html` in a browser, or
2. Use the CLI: `ledgerful ledger export-public --output <dir> --sign`

If signed, the bundle also contains:

- `manifest.sig` — raw Ed25519 signature over `manifest.json`
- `manifest.pub` — raw Ed25519 verifying key

## Honest ceiling

This bundle proves each entry's Ed25519 signature and the manifest signature. It does not prove the order or set of entries (that's the chain head) or the identity behind the key (out-of-band fingerprint comparison).

## Bot key

The manifest is signed by a dedicated `ledgerful-ledger-bot` keypair that is
separate from the engine's main signing key. This keeps bundle-key rotation
independent of the engine's signing identity.

## Signed

Yes — `manifest.sig` and `manifest.pub` are present.
