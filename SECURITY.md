# Security Policy

## Supported versions

Ledgerful is in pre-release development. The latest tag is v0.1.6; the local source version is 0.1.7. Security fixes are applied to the main branch and included in the next release. There are no backport branches.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities through one of these channels:

- **Email:** security@ledgerful.dev (provisioning pending — see note below)
- **GitHub private vulnerability reporting:** available once the repository is public

**Response timeline:**
- Acknowledgment: within 3 business days
- Initial assessment: within 7 business days
- Fix or mitigation: within 30 days for high-severity, 90 days for medium
- Disclosure: coordinated disclosure after a fix is released, with a 90-day maximum from initial report

**Safe harbor:** Ledgerful follows disclose.io-style safe harbor principles. Good-faith security research that respects user data and privacy will not be subject to legal action. This policy is marked DRAFT pending LLC and counsel review.

**No PGP key is published.** We do not require or recommend encrypted reporting at this stage.

> **Note:** The security@ledgerful.dev mailbox is documented but pending activation via Cloudflare Email Routing. GitHub private vulnerability reporting is available once the repository is public. Until then, if you discover a vulnerability, please contact the maintainer via the GitHub profile at [github.com/Ryan-AI-Studios](https://github.com/Ryan-AI-Studios) (or the commit-author email visible in the repository's git log). If you cannot reach any channel above, do not delay — any direct communication method is acceptable for good-faith reports.

## Supply chain attestation (planned — track 0053)

Ledgerful's release pipeline is being hardened with verifiable supply-chain integrity. The following capabilities are **planned** and will ship with track 0053-SupplyChainAttestation:

| Capability | Tool | Status |
|---|---|---|
| CycloneDX SBOM (engine + MCP) | `cargo cyclonedx --all-features` | Planned |
| Artifact + SBOM signing | cosign keyless (Sigstore Fulcio) | Planned |
| SLSA build provenance | `actions/attest` (GitHub native) | Planned (requires public repo) |
| SBOM attestation | `actions/attest-sbom` | Planned (requires public repo) |
| Embedded dependency list | `cargo auditable` | Planned |

### Verification recipes (once shipped)

**Verify SBOM signature (cosign keyless):**
```bash
cosign verify-blob \
  --certificate-identity-regexp '^https://github\.com/Ryan-AI-Studios/Ledgerful/\.github/workflows/release\.yml@.+' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --signature ledgerful-<ver>.cdx.json.sig \
  --certificate ledgerful-<ver>.cdx.json.pem \
  ledgerful-<ver>.cdx.json
```

**Verify binary build provenance (SLSA):**
```bash
gh attestation verify ledgerful-<platform>.tar.gz \
  --owner Ryan-AI-Studios
```

**Verify SBOM attestation:**
```bash
gh attestation verify ledgerful-<ver>.cdx.json \
  --owner Ryan-AI-Studios
```

**Inspect embedded dependencies (offline):**
```bash
cargo audit bin ledgerful
# or:
syft ledgerful
```

### Honest gaps

1. **cozo git-dependency is not CVE-matched:** the `cozo-redux` crate is a git dependency pinned by commit, not a registry package. Downstream vulnerability scanners keyed on registry coordinates will not automatically match it. Upstream cozo advisories are tracked manually.
2. **Bundled native SQLite is not enumerated as its own component:** `rusqlite` uses the `bundled` feature, which statically links a native C SQLite library. A Rust-crate SBOM lists `libsqlite3-sys` as a crate but does not enumerate the vendored C library as a separate component.
3. **GitHub attestations require a public or Enterprise-Cloud repo:** the SLSA build-provenance and SBOM attestation steps require a public repository or GitHub Enterprise Cloud. They will activate at the public flip (track 0027).

### Boundary

Artifact signing and build provenance are release-pipeline metadata — not a product feature that generates SBOMs or attestations for your repository. They are distinct from the product's Ed25519 ledger signing basis (the 5-field payload: `tx_id`, `category`, `summary`, `reason`, `committed_at`). Track 0053 changes neither the ledger signing basis nor the no-network runtime invariant.

## Ledger signing vs. artifact signing

Ledgerful has two distinct signing surfaces that should not be confused:

- **Ed25519 ledger signing** (product): every committed ledger entry is signed over a 5-field payload. This is the product's core provenance mechanism. The signing key lives at `~/.ledgerful/keys/`.
- **cosign/Sigstore artifact signing** (release pipeline): release archives and SBOMs will be signed with cosign keyless signing using the GitHub Actions OIDC identity. No long-lived keys. This will prove the download came from the documented release workflow.

These are orthogonal: one proves ledger entry integrity, the other proves release artifact integrity.
