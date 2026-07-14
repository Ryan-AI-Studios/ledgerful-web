// Captured from real v0.1.8 runs on Linux x86_64 (Docker Ubuntu 24.04).
// Source files: public/evidence/{version,doctor,verify-health}.txt
// Generating commands:
//   - version.txt       : ledgerful --version
//   - doctor.txt        : ledgerful doctor
//   - verify-health.txt : ledgerful verify --health
// ANSI styling is stripped; program stdout is reproduced verbatim below.

export const capturedEvidence = {
  version: {
    command: "ledgerful --version",
    description: "Binary version",
    lines: ["ledgerful 0.1.8"],
  },
  doctor: {
    command: "ledgerful doctor",
    description: "Environment health check",
    lines: [
      "Ledgerful Doctor - Environment Health Check",
      "==================================================",
      "Environment:         Wsl",
      "Active Shell:        Unknown",
      "LEDGERFUL_PLATFORM:  os=linux, arch=x86_64, family=unix, target_triple=x86_64-unknown-linux-gnu",
      "",
      "Tools:",
      "  git                Found (/usr/bin/git)",
      "  gemini             NOT FOUND",
      "",
      "Current Path:        /tmp/neutral-repo",
      "Path Type:           Native",
      "",
      "Active Ask Backend:  Local (127.0.0.1)",
      "Embedding Model:     Not configured",
      "Completion Model:    Not configured",
      "Native Graph:        Ready (CozoDB active, 1 nodes, 1 edges)",
      "",
      "Index Health:",
      "  \u2022 Gate mode: observe (matches ledger history)",
      "  \u2022 Search index: OK (0 documents)",
      "  \u2022 Graph state: Empty (never indexed)",
      "  \u2022 Impact report: None (run 'ledgerful scan --impact')",
      "GPU VRAM:            n/a (Windows-only monitoring)",
    ],
  },
  verifyHealth: {
    command: "ledgerful verify --health",
    description: "Verification dependency check",
    lines: [
      "Verification Health Check",
      "Checking verification dependencies...",
      "  Checking git...",
      "  [OK] git is available.",
      "  Checking ledger state...",
      "  [NOTE] No impact report found. Run 'ledgerful scan --impact' after making changes.",
      "  [OK] Runner: cargo test (nextest not available)",
      "",
      "All verification dependencies are available.",
    ],
  },
} as const;

export const panelOrder = ["version", "doctor", "verifyHealth"] as const;

// Real sanitized artifact previews for `hero-proof.tsx` / `artifact-preview.tsx`.
// Each block traces to one real, already-verified capture — never fabricated.
//   - verificationPlan  : `ledgerful verify --dry-run` run against the synthetic
//                         sample repo (captured 2026-07-13, engine v0.1.8). Leading
//                         blank line / ANSI styling stripped, same convention as
//                         the PowerShell-wrapper stripping above.
//   - provenanceRecord  : one real, Ed25519-signed ledger row from `ledger.csv`
//                         inside the verified `public/evidence/sample-soc2/`
//                         export. Signature independently verified — see that
//                         directory's `index.md`.
//   - evidenceExport    : the tamper-evidence hash manifest from the same
//                         verified sample-soc2 export.
export const artifactPreviews = {
  verificationPlan: {
    sourceLabel: "ledgerful verify --dry-run",
    caption:
      "Verification plan — captured 2026-07-13, engine v0.1.8, sample repo",
    lines: [
      "Verification Plan",
      "  Source: Auto-Policy",
      "  Runner: cargo test",
      "  \u2022 Check for whitespace errors in staging area",
      "  \u2022 Check for whitespace errors in working tree",
      "  \u2022 Run build",
      "Verification Steps:",
      "  \u2022 git diff --cached --check (timeout: 400s)",
      "  \u2022 git diff --check (timeout: 400s)",
      "  \u2022 npm run build (timeout: 400s)",
      "",
      "Dry run mode: verification plan displayed above. No commands were executed.",
    ],
  },
  provenanceRecord: {
    sourceLabel: "ledger.csv — signed entry",
    caption:
      "Signed provenance record — one row from the verified sample-soc2 export",
    lines: [
      "tx_id:        e09f48ab-0afe-4881-833f-8fd80048ea34",
      "category:     BUGFIX",
      "entity:       src/invoice.rs",
      "change_type:  Modify",
      "summary:      fix(invoice): [DEMO] fix rounding error in tax calculation",
      "reason:       Switch tax calculation from f64 to Decimal to eliminate floating-point rounding.",
      "committed_at: 2026-07-14T01:47:02.876335722+00:00",
      "signed:       yes",
      "signature:    f3e27176…39807",
    ],
  },
  evidenceExport: {
    sourceLabel: "manifest.json",
    caption:
      "Evidence export manifest — tamper-evidence hashes, sample-soc2 export",
    lines: [
      "{",
      '  "generatedAt": "2026-07-14T01:47:02.982622805+00:00",',
      '  "files": [',
      '    { "name": "chain_head.json", "sha256": "3a0555a3cdc06156530aaff441232247bae2c105ea7c199b8c9a77f836cba68f", "size": 431 },',
      '    { "name": "ledger.csv", "sha256": "25ca4a8d…2927b63", "size": 3266 },',
      '    { "name": "verification_history.csv", "sha256": "56ef6d6a…6ed0e84", "size": 57 }',
      "  ],",
      '  "entryCount": 7',
      "}",
    ],
  },
} as const;

export type ArtifactPreviewId = keyof typeof artifactPreviews;
