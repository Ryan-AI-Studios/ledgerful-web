// Captured from real v0.1.6 runs on Windows x86_64.
// Source files: public/evidence/{version,doctor,verify-health}.txt
// Generating commands:
//   - version.txt       : ledgerful --version
//   - doctor.txt        : ledgerful doctor
//   - verify-health.txt : ledgerful verify --health
// PowerShell `2>&1` capture wrappers (ErrorRecord blocks) are stripped from the
// source files; program stdout is reproduced verbatim below.

export const capturedEvidence = {
  version: {
    command: "ledgerful --version",
    description: "Binary version",
    lines: ["ledgerful 0.1.6"],
  },
  doctor: {
    command: "ledgerful doctor",
    description: "Environment health check",
    lines: [
      "Ledgerful Doctor - Environment Health Check",
      "==================================================",
      "Environment:         Windows",
      "Active Shell:        Powershell",
      "LEDGERFUL_PLATFORM:  os=windows, arch=x86_64, family=windows, target_triple=x86_64-pc-windows-msvc",
      "",
      "Tools:",
      "  git                Found (C:\\Program Files\\Git\\cmd\\git.exe)",
      "  gemini             Found (C:\\Users\\RyanB\\AppData\\Roaming\\npm\\gemini.cmd)",
      "",
      "Current Path:        C:\\dev\\ledgerful",
      "Path Type:           Native",
      "",
      "Active Ask Backend:  Gemini (Cloud)",
      "Embedding Model:     nomic-embed-text (768 dims) @ http://127.0.0.1:8083",
      "Completion Model:    gemma-4-E4B-it-Q6_K.gguf @ http://127.0.0.1:8081",
      "Native Graph:        Ready (CozoDB active, 7462 nodes, 31911 edges)",
      "",
      "Index Health:",
      "  \u2022 Search index: OK (1526 documents)",
      "  \u2022 Graph state: Current",
      "  \u2022 Impact report: Current (Clean tree)",
      "GPU VRAM:            0.0 GB / 11.1 GB (Driver limitation: zero-usage reporting on Intel Arc)",
    ],
  },
  verifyHealth: {
    command: "ledgerful verify --health",
    description: "Verification dependency check",
    lines: [
      "Verification Health Check",
      "Checking verification dependencies...",
      "",
      "  Checking cargo...",
      "  [OK] cargo is available.",
      "  Checking git...",
      "  [OK] git is available.",
      "  Checking ledger state...",
      "  [OK] Ledger is clean.",
      "  [OK] Runner: cargo test (nextest available)",
      "",
      "All verification dependencies are available.",
    ],
  },
} as const;

export const panelOrder = ["version", "doctor", "verifyHealth"] as const;

// Real sanitized artifact previews for `hero-proof.tsx` / `artifact-preview.tsx`.
// Each block traces to one real, already-verified capture — never fabricated.
//   - verificationPlan  : `ledgerful verify --dry-run` run against the synthetic
//                         sample repo (captured 2026-07-03, engine v0.1.7). Leading
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
      "Verification plan — captured 2026-07-03, engine v0.1.7, sample repo",
    lines: [
      "Verification Plan",
      "  Source: Auto-Policy",
      "  Runner: cargo test",
      "  • Check for whitespace errors in staging area",
      "  • Check for whitespace errors in working tree",
      "  • Run build",
      "Verification Steps:",
      "  • git diff --cached --check (timeout: 400s)",
      "  • git diff --check (timeout: 400s)",
      "  • npm run build (timeout: 400s)",
      "",
      "Dry run mode: verification plan displayed above. No commands were executed.",
    ],
  },
  provenanceRecord: {
    sourceLabel: "ledger.csv — signed entry",
    caption:
      "Signed provenance record — one real row from the verified sample-soc2 export",
    lines: [
      "tx_id:        6341380a-5a23-4b12-a1f3-19bd54630296",
      "category:     BUGFIX",
      "entity:       invoice-tax-rate-fix",
      "change_type:  Modify",
      "summary:      Add TX region tax rate; tighten session validity check",
      "reason:       Closed a billing gap and a session edge case found during review",
      "committed_at: 2026-07-03T05:05:33.663336200+00:00",
      "signed:       yes",
      "signature:    382829cdca90ba3d844fc376f34ebbf559ccaf58d92ba3267d1046ef28a5602837a3f8368c3a2e4fc7cefcb39fba75b5b06c83233ec67cdf448fccc121eb3202",
    ],
  },
  evidenceExport: {
    sourceLabel: "manifest.json",
    caption:
      "Evidence export manifest — tamper-evidence hashes, sample-soc2 export",
    lines: [
      "{",
      '  "generatedAt": "2026-07-03T05:47:57.608023+00:00",',
      '  "files": [',
      '    { "name": "ledger.csv", "sha256": "5fd8b59fa895489acbe6a848e3c1614d0c02a63da98ea1d077c9f79323753669", "size": 1039 },',
      '    { "name": "verification_history.csv", "sha256": "56ef6d6ace5d5bd1381b764ec3d0398c30c7225219aec22c0029e65cf6ed0e84", "size": 57 }',
      "  ],",
      '  "entryCount": 3',
      "}",
    ],
  },
} as const;

export type ArtifactPreviewId = keyof typeof artifactPreviews;
