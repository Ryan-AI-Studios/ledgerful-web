import type { FeatureState } from "./features";
import { launchTruth } from "./launch-facts";

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
    body: "Ledgerful reads git state and project structure locally and writes evidence to .ledgerful/. Scan, ledger, audit, verify, sync, dashboard, and export stay on the machine by default.",
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
    body: `Usage metrics are excluded from the default build. A build with ${launchTruth.facts.telemetry.feature} must still be enabled with ${launchTruth.facts.telemetry.enableCommand} before aggregate command counts, platform/version metadata, enabled features, and an anonymous ID are sent.`,
    state: "available",
  },
  {
    iconName: "Cloud",
    title: "Configured cloud model",
    body: "The ask workflow can send sanitized, truncated impact and retrieved codebase context to Gemini, Ollama Cloud, or OpenRouter when a user configures and selects one of those providers. Local-model operation does not use this cloud path.",
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
  "Selected configuration variables from the process environment, including model endpoints, model names, dimensions, and provider API keys",
  "A repository-local .env file for those same named model settings and credentials when they are not already configured; Ledgerful does not sweep arbitrary environment variables",
];

export const networkOutbound = {
  updateChecks:
    "None. The CLI does not check for updates automatically. No outbound HTTP requests are made to GitHub or any external server for version checking.",
  crashReporting:
    "None. Ledgerful does not integrate a crash reporter. Panics are handled by Rust's default behavior (stderr output) and are not transmitted anywhere. No crash data is ever sent to a remote service.",
  cloudModels:
    "Configured only. The ask workflow can send sanitized, truncated impact and retrieved codebase context to Gemini, Ollama Cloud, or OpenRouter when that provider is configured and selected. API credentials may be read from the process environment or repository-local .env file.",
} as const;

export const writesLocally: string[] = [
  ".ledgerful/ledger.db — ledger transactions and verification history (project-local)",
  ".ledgerful/reports/ — impact and verify reports in JSON format (project-local)",
  ".ledgerful/index/ — local full-text search index (project-local)",
  ".ledgerful/sync/ — signed and encrypted sync bundles when sync is enabled (project-local)",
  "~/.ledgerful/keys/private.key and public.pem — Ed25519 key pair, generated on first use (legacy private.pem is migrated)",
  "SOC2 evidence ZIP — written to a local path of your choice on demand via the dashboard",
  "Platform paths: Windows uses %USERPROFILE%\\.ledgerful\\keys\\; Linux and macOS use ~/.ledgerful/keys/ resolved from $HOME. Project-local .ledgerful/ directories are always relative to your repository root.",
];

type TelemetryFieldName =
  (typeof launchTruth.facts.telemetry.payloadFields)[number];

const telemetryDescriptions: Record<TelemetryFieldName, string> = {
  schema_version: "Payload schema version used by the ingest validator.",
  anonymous_id:
    "Random UUID generated when usage metrics are enabled; stable across repositories on the same machine and not an account identity.",
  client_version: "Installed Ledgerful version.",
  platform: "Operating-system family: Windows, macOS, Linux, or unknown.",
  sent_at: "UTC timestamp for the send attempt.",
  window_start: "Start of the aggregated reporting window.",
  window_end: "End of the aggregated reporting window.",
  command_counts:
    "Aggregate top-level command-name counts since the previous successful flush. Arguments, paths, entity names, and query text are not included.",
  features_enabled:
    "Compiled-in Ledgerful feature names such as web, mcp, sync, daemon, and viz-server.",
  active_days_in_window:
    "Count of distinct UTC days with at least one recorded command during the reporting window.",
};

export const telemetrySchema: TelemetryField[] =
  launchTruth.facts.telemetry.payloadFields.map((name) => ({
    name,
    description: telemetryDescriptions[name],
  }));

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
  "Run sha256sum -c ledgerful-<platform>.tar.gz.sha256 on Linux/macOS. On Windows, hash ledgerful-x86_64-pc-windows-msvc.zip with Get-FileHash -Algorithm SHA256 and compare it with the companion .zip.sha256 file.",
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
    name: "Configured model provider",
    purpose:
      "Gemini, Ollama Cloud, or OpenRouter receives sanitized, truncated context only when a user configures and selects that cloud-backed ask workflow.",
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
