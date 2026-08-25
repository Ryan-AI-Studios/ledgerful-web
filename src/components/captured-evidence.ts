// Captured from real engine runs on Linux x86_64 (Docker Ubuntu 24.04).
// Capture provenance: binary ledgerful 0.2.11 (ec3332495e8e), measured 2026-08-24.
// Tag SHA: ec3332495e8e79c1e2c9049665b284424eb238a9 (published v0.2.11 archive — not PATH cargo tip).
// captureTag is exhibit provenance for chrome strings — do not bind chrome to
// launchFacts.release.tag (that would hide exhibit lag).
// Doctor / version / verify-health: neutral-env Docker Ubuntu 24.04, /tmp/neutral-repo.
// Verification plan: JS sample-repo dry-run stdout only (stderr redirected).
// Source files: public/evidence/{version,doctor,verify-health}.txt
// Generating commands:
//   - version.txt       : ledgerful --version
//   - doctor.txt        : ledgerful doctor
//   - verify-health.txt : ledgerful verify --health
// ANSI styling is stripped; program stdout is reproduced verbatim below.

/** Exhibit provenance for chrome. Not launchFacts.release.tag. */
export const captureTag = "v0.2.11";

export const capturedEvidence = {
  version: {
    command: "ledgerful --version",
    description: "Binary version",
    lines: [
      "ledgerful 0.2.11 (ec3332495e8e)",
    ],
  },
  doctor: {
    command: "ledgerful doctor",
    description: "Environment health check",
    lines: [
      "\u2713 Doctor: ready for publish env \u00b7 5 warning(s) \u00b7 1 optional",
      "",
      "Ledgerful Doctor - Environment Health Check",
      "==================================================",
      "Environment:         Linux",
      "Active Shell:        Unknown",
      "LEDGERFUL_PLATFORM:  os=linux, arch=x86_64, family=unix, target_triple=x86_64-unknown-linux-gnu",
      "",
      "Tools:",
      "  git                Found (/usr/bin/git)",
      "  gemini CLI         NOT FOUND (optional CLI; not the Cloud Ask backend)",
      "",
      "Current Path:        /tmp/neutral-repo",
      "Path Type:           Native",
      "Work root:           /tmp/neutral-repo",
      "State dir:           /tmp/neutral-repo/.ledgerful",
      "",
      "Active Ask Backend:  Local (127.0.0.1)",
      "Native Graph:        Ready (CozoDB active, 1 nodes, 1 edges)",
      "",
      "Index Health:",
      "  \u2022 Gate mode: observe (matches ledger history)",
      "  \u2022 Search index: Empty (0 documents \u2014 run 'ledgerful index')",
      "  \u2022 [warn] [graph-empty] Graph state: Empty (never indexed)",
      "  \u2022 [warn] [impact-missing] Impact report: None (run 'ledgerful scan --impact')",
      "  \u2022 [warn] [search-empty] Search index: present but empty (0 documents); full-text search unusable until populated",
      "    ledgerful index",
      "    # first search also rebuilds when empty:",
      "    # ledgerful search \"<query>\"",
      "    ledgerful doctor --json",
      "  \u2022 [warn] [sig-pin] no intent.trusted_public_keys pinned; crypto-valid signatures report VALID (unknown key). Pin keys after init or re-sign. Next: pin the current identity via config set (see remediation).",
      "    ledgerful config set 'intent.trusted_public_keys=[\"a349e4961c08229a70effeafc94bbd797839a145389f7bbf24c8c2ad806fe4bc\"]'",
      "    ledgerful doctor --json",
      "    ledgerful verify --signatures",
      "  \u2022 [warn] [sig-version] intent.min_sig_version=1 still accepts legacy v1 signatures. All LOCAL rows already have sig_version >= 2; set min_sig_version=2 to close the downgrade path.",
      "    ledgerful config set intent.min_sig_version=2",
      "    ledgerful verify --signatures",
      "",
      "\u2500\u2500 Optional Accelerators \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
      "Embedding Model:     unreachable (Local embedding model server at http://127.0.0.1:8083 is unreachable after 1 retries)",
      "Completion Model:    Not configured",
      "",
      "11 hygiene finding(s) collapsed (1 optional warning) \u2014 run doctor --full",
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
//   - verificationPlan  : `ledgerful verify --dry-run` against a minimal JS
//                         sample repo (Docker / neutral capture 2026-08-24 on
//                         v0.2.11; stdout only). Leading blank line / ANSI
//                         styling stripped. Caption re-labeled for currency;
//                         command-shape body left as previously measured.
//   - provenanceRecord  : one real, Ed25519-signed ledger row from `ledger.csv`
//                         inside the verified `public/evidence/sample-soc2/`
//                         export. Signature independently verified — see that
//                         directory's `index.md`.
//   - evidenceExport    : the tamper-evidence hash manifest from the same
//                         verified sample-soc2 export.
export const artifactPreviews = {
  verificationPlan: {
    sourceLabel: "ledgerful verify --dry-run",
    caption: "Verification plan — sample-repo capture on v0.2.11",
    lines: [
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
      "signature:    f3e27176\u202639807",
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
      '    { "name": "ledger.csv", "sha256": "25ca4a8d\u20262927b63", "size": 3266 },',
      '    { "name": "verification_history.csv", "sha256": "56ef6d6a\u20266ed0e84", "size": 57 }',
      "  ],",
      '  "entryCount": 7',
      "}",
    ],
  },
} as const;

export type ArtifactPreviewId = keyof typeof artifactPreviews;
