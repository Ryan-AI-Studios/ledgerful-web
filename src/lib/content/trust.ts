import type { FeatureState } from "./features";

export type TrustDataFlow = {
  iconName: "Shield" | "HardDrive" | "RadioTower" | "Cloud";
  title: string;
  body: string;
  state: FeatureState;
};

export type TelemetryField = {
  name: string;
  description: string;
};

export type SocExportFile = {
  filename: string;
  description: string;
};

export type Subprocessor = {
  name: string;
  purpose: string;
  state: FeatureState;
};

export const trustDataFlows: TrustDataFlow[] = [
  {
    iconName: "Shield",
    title: "Local default",
    body: "Ledgerful reads git state and project structure locally, writes evidence to .ledgerful/, and never uploads source code by default. Nothing leaves your machine during normal operation.",
    state: "available",
  },
  {
    iconName: "HardDrive",
    title: "Local sync (dir://)",
    body: "When sync is enabled with a dir:// transport, Ledgerful writes signed, encrypted bundles to a local directory path you control. No cloud transport is involved. Bundles are signed and encrypted before leaving the engine.",
    state: "local-only",
  },
  {
    iconName: "RadioTower",
    title: "Telemetry (opt-in)",
    body: "Usage telemetry is strictly opt-in via config.toml or the ledgerful usage command. When enabled, only structured usage events are sent — command names, timing, and feature flags. Source code, file content, diff text, and commit messages are never transmitted.",
    state: "available",
  },
  {
    iconName: "Cloud",
    title: "Hosted mode (planned)",
    body: "A future hosted control plane will allow teams to share signed summaries and metadata across machines. Source code will never be uploaded by default and will require explicit consent. This mode requires a future hosted infrastructure that does not yet exist.",
    state: "hosted planned",
  },
];

export const readsLocally: string[] = [
  "Git repository state — commits, diffs, file history, and blame",
  "Project file structure and symbol graph (via local index)",
  ".ledgerful/ledger.db — local SQLite ledger state",
  "config.toml — user configuration and feature flags",
  "~/.ledgerful/keys/ — Ed25519 signing key pair (read/write on first use)",
  "Environment variables for configuration overrides only (e.g., LEDGERFUL_CONFIG for a custom config path)",
  "Does not read .env files, AWS_* keys, or general system environment variables as part of normal operation",
];

export const networkOutbound = {
  updateChecks:
    "None. The CLI does not check for updates automatically. No outbound HTTP requests are made to GitHub or any external server for version checking.",
  crashReporting:
    "None. Ledgerful does not integrate a crash reporter. Panics are handled by Rust's default behavior (stderr output) and are not transmitted anywhere. No crash data is ever sent to a remote service.",
} as const;

export const writesLocally: string[] = [
  ".ledgerful/ledger.db — ledger transactions and verification history (project-local)",
  ".ledgerful/reports/ — impact and verify reports in JSON format (project-local)",
  ".ledgerful/index/ — local full-text search index (project-local)",
  ".ledgerful/sync/ — signed and encrypted sync bundles when sync is enabled (project-local)",
  "~/.ledgerful/keys/private.pem and public.pem — Ed25519 key pair, generated on first use",
  "SOC2 evidence ZIP — written to a local path of your choice on demand via the dashboard",
  "Platform paths: Windows uses %USERPROFILE%\\.ledgerful\\keys\\; Linux and macOS use ~/.ledgerful/keys/ resolved from $HOME. Project-local .ledgerful/ directories are always relative to your repository root.",
];

export const telemetrySchema: TelemetryField[] = [
  {
    name: "Command name",
    description:
      "The top-level command invoked (e.g., audit, verify, web). Does not include arguments that could contain file paths or source content.",
  },
  {
    name: "Subcommand / action",
    description:
      "The subcommand variant where applicable. Anonymized — does not include user-provided values such as file paths, entity names, or query strings.",
  },
  {
    name: "Feature flags enabled",
    description:
      "Which config.toml features are enabled (e.g., coverage.enabled, intent.require_signing). No source-content or diff-text values are included.",
  },
  {
    name: "Duration / timing",
    description:
      "Wall-clock time for the command in milliseconds. No content-derived fields.",
  },
];

export const soc2ExportLayout: SocExportFile[] = [
  {
    filename: "manifest.json",
    description:
      "SHA-256 hashes and byte sizes for all other files, plus generatedAt (RFC3339) and entryCount. The files array is sorted by name for determinism. manifest.json itself is not listed in the files array.",
  },
  {
    filename: "manifest.sig",
    description:
      "Raw 64-byte Ed25519 signature over manifest.json bytes. Proves the manifest was produced by the holder of this repo's signing key.",
  },
  {
    filename: "manifest.pub",
    description:
      "Raw 32-byte Ed25519 verifying key (the public half of ~/.ledgerful/keys/). Used to verify manifest.sig offline without trusting a remote key server.",
  },
  {
    filename: "ledger.csv",
    description:
      "All committed ledger provenance records in RFC 4180 CSV format. Columns: tx_id, category, entity, change_type, summary, reason, committed_at, signed, signature. Sorted by committed_at ascending.",
  },
  {
    filename: "verification_history.csv",
    description:
      "CI gate pass/fail records. Columns: run_timestamp, overall_pass, command, exit_code, duration_ms. Header-only when there are no verification runs.",
  },
  {
    filename: "adr/*.md",
    description:
      "MADR-format Architectural Decision Records, one file per ADR ledger entry. Filenames are 0001-<slugified-summary>.md. Folder is omitted when no ADR entries exist.",
  },
];

export const releaseVerificationSteps: string[] = [
  "Download the binary archive and its companion .sha256 checksum file from the GitHub Release page for your platform (Linux, macOS, or Windows).",
  "Run sha256sum -c ledgerful-<platform>.tar.gz.sha256 (Linux/macOS) or compare the SHA-256 hash manually on Windows using Get-FileHash -Algorithm SHA256. A passing verification prints OK.",
  "A successful verification prints `filename: OK` for each file. Any `FAILED` output means the download is corrupt or tampered — do not use the binary.",
  "Note: specific download URLs are a WEB-0005 launch fact and will be published when the release is smoke-tested and publicly documented. Windows Authenticode signing and macOS Developer ID / Gatekeeper notarization are not yet implemented — binaries may trigger OS security prompts on first launch. Both code-signing capabilities and SLSA provenance attestations are planned enhancements.",
];

export const plannedSubprocessors: Subprocessor[] = [
  {
    name: "Vercel",
    purpose:
      "Static site hosting for this public marketing website. Does not process project source code, ledger data, or user data.",
    state: "available",
  },
  {
    name: "Supabase (telemetry)",
    purpose:
      "Opt-in usage telemetry ingest only. No source code or project data is sent. Disabled by default.",
    state: "available",
  },
  {
    name: "Supabase (hosted backend)",
    purpose:
      "Future control-plane database, auth, and Edge Functions for the hosted team service.",
    state: "hosted planned",
  },
  {
    name: "GitHub",
    purpose:
      "GitHub App webhooks and GitHub Actions integration for the future hosted CI workflow. Relevant only when hosted mode launches.",
    state: "hosted planned",
  },
];
