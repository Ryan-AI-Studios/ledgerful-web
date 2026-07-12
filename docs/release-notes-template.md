# Release Notes Template — Ledgerful

Copy this template for each release. Fill in the bracketed sections. Delete sections that do not apply.

---

## v[VERSION] — [DATE]

### Highlights

- [1-3 sentence summary of what this release changes]

### Binaries

| Platform | Archive | SHA-256 |
|---|---|---|
| Linux x86_64 | `ledgerful-x86_64-unknown-linux-gnu.tar.gz` | [hash] |
| Windows x86_64 | `ledgerful-x86_64-pc-windows-msvc.zip` | [hash] |
| macOS x86_64 | `ledgerful-x86_64-apple-darwin.tar.gz` | [hash] |
| macOS ARM64 | `ledgerful-aarch64-apple-darwin.tar.gz` | [hash] |

### Verify the download

```bash
# Linux / macOS
sha256sum -c ledgerful-<platform>.tar.gz.sha256

# Windows (PowerShell)
(Get-FileHash ledgerful-x86_64-pc-windows-msvc.zip -Algorithm SHA256).Hash
```

### Supply chain attestation

This release includes:

- [ ] CycloneDX SBOM: `ledgerful-<ver>.cdx.json`
- [ ] cosign keyless signature: `.sig` + `.pem` beside each archive
- [ ] SLSA build provenance: `gh attestation verify <archive> --owner Ryan-AI-Studios`
- [ ] SBOM attestation: `gh attestation verify <sbom> --owner Ryan-AI-Studios`
- [ ] Embedded dependency list: `cargo audit bin ledgerful`

> GitHub attestations (`gh attestation verify`) require the repository to be public or on GitHub Enterprise Cloud.

### Known gaps

- The `cozo-redux` git-dependency is not CVE-matched by registry-keyed scanners.
- Bundled native SQLite is not enumerated as its own SBOM component.
- OS code signing (Windows Authenticode, macOS Developer ID) is not yet implemented.

### Changes

- [Breaking changes, if any]
- [New features]
- [Fixes]
- [Deprecations]

### Upgrade notes

- [If applicable, steps to upgrade from the previous version]
