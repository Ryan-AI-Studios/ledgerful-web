# Security Policy

## Supported versions

Ledgerful is pre-1.0 software. The latest release is v0.1.9. Security fixes are applied to the main branch and included in the next release. There are no backport branches.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities through one of these channels:

- **Email:** security@ledgerful.dev (active)
- **GitHub private vulnerability reporting:** enabled on the public repository

**Response timeline:**
- Acknowledgment: within 3 business days
- Initial assessment: within 7 business days
- Fix or mitigation: within 30 days for high-severity, 90 days for medium
- Disclosure: coordinated disclosure after a fix is released, with a 90-day maximum from initial report

**Safe harbor:** Ledgerful follows disclose.io-style safe harbor principles. Good-faith security research that respects user data and privacy will not be subject to legal action.

**No PGP key is published.** We do not require or recommend encrypted reporting at this stage.

## Supply chain attestation (shipped since v0.1.8; current v0.1.9)

Ledgerful's release pipeline is hardened with verifiable supply-chain integrity. The following capabilities shipped with v0.1.8 and continue in the current v0.1.9 release:

| Capability | Tool | Status |
|---|---|---|
| CycloneDX SBOM (engine + MCP) | `cargo cyclonedx --all-features` | Shipped |
| Artifact + SBOM signing | cosign keyless (Sigstore Fulcio) | Shipped |
| SLSA build provenance | `actions/attest` (GitHub native) | Shipped |
| SBOM attestation | `actions/attest-sbom` | Shipped |
| Embedded dependency list | `cargo auditable` | Shipped |

### Verification recipes

**Verify SBOM signature (cosign keyless):**
```bash
cosign verify-blob \
  --certificate-identity-regexp '^https://github\.com/Ryan-AI-Studios/Ledgerful/\.github/workflows/release\.yml@.+' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --bundle ledgerful-<ver>.cdx.json.bundle \
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
3. **OS code signing is not yet implemented:** the pipeline signs artifacts with cosign and SLSA provenance but does not yet implement Windows Authenticode or macOS Developer ID / Gatekeeper notarization. Binaries may trigger OS security prompts on first launch.

### Boundary

Artifact signing and build provenance are release-pipeline metadata — not a product feature that generates SBOMs or attestations for your repository. They are distinct from the product's Ed25519 ledger signing basis (v2 provenance payload: `sig_version:2` binds `tx_id`, `category`, `summary`, `reason`, `committed_at`, `entity`, `change_type`, `entry_type`, `author`, `risk`, `is_breaking`, `related_tickets`, and `origin`; historical v1 rows use the legacy five-field payload under dual-verify). These capabilities change neither the ledger signing basis nor the no-network runtime invariant.

## Ledger signing vs. artifact signing

Ledgerful has two distinct signing surfaces that should not be confused:

- **Ed25519 ledger signing** (product): every new committed ledger entry is signed over the v2 provenance payload (`sig_version:2`), binding entity, author, risk, origin, and related fields in addition to the legacy five fields. Historical rows with `sig_version=1` still verify under dual-verify. The signing key lives at `~/.ledgerful/keys/`.
- **cosign/Sigstore artifact signing** (release pipeline): release archives and SBOMs are signed with cosign keyless signing using the GitHub Actions OIDC identity. No long-lived keys. This proves the download came from the documented release workflow.

These are orthogonal: one proves ledger entry integrity, the other proves release artifact integrity.