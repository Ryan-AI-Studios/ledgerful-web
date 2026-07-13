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

export type BoundaryRow = {
  surface: string;
  reads: string;
  writes: string;
  uploads: string;
  staysLocal: string;
};

export const trustDataFlows: TrustDataFlow[] = [
  {
    iconName: "Shield",
    title: "Local default",
    body: "Ledgerful reads git state and project structure locally and writes evidence to .ledgerful/. Scan, ledger, audit, verify, dashboard, and export stay on the machine by default. Local sync is separate and requires a sync-enabled build compiled with --features sync.",
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
    body: "The ask workflow can send sanitized, truncated impact and retrieved codebase context to Gemini, Ollama Cloud, or OpenRouter when a user configures and selects one of those providers. Separately, ledgerful index --fast can send code chunks to a configured Gemini model for semantic extraction instead of the local model. Neither path is active in the default local-only workflow.",
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

export const writesLocally: string[] = [
  ".ledgerful/ledger.db — ledger transactions and verification history (project-local)",
  ".ledgerful/reports/ — impact and verify reports in JSON format (project-local)",
  ".ledgerful/index/ — local full-text search index (project-local)",
  ".ledgerful/sync/ — signed and encrypted sync bundles when sync is enabled (project-local)",
  "~/.ledgerful/keys/private.key and public.pem — Ed25519 key pair, generated on first use (legacy private.pem is migrated)",
  "SOC2 evidence ZIP — written to a local path of your choice on demand via the dashboard",
  "Platform paths: Windows uses %USERPROFILE%\\.ledgerful\\keys\\; Linux and macOS use ~/.ledgerful/keys/ resolved from $HOME. Project-local .ledgerful/ directories are always relative to your repository root.",
];

export const networkOutbound = {
  updateChecks:
    "None. The CLI does not check for updates automatically. No outbound HTTP requests are made to GitHub or any external server for version checking.",
  crashReporting:
    "None. Ledgerful does not integrate a crash reporter. Panics are handled by Rust's default behavior (stderr output) and are not transmitted anywhere. No crash data is ever sent to a remote service.",
  cloudModels:
    "Configured only. Two distinct workflows can send data to a configured cloud model. The ask command sends sanitized, truncated impact and retrieved codebase context to Gemini, Ollama Cloud, or OpenRouter when that provider is configured and selected. The index --fast flag sends code chunks to a configured Gemini model for semantic extraction instead of the local model. API credentials may be read from the process environment or repository-local .env file. Neither path is active in the default local-only workflow.",
} as const;

/**
 * Single-source boundary table: each row states what a given surface reads,
 * writes, what may leave the machine (uploads / sends externally), and what
 * stays local. Synthesized from `readsLocally`, `writesLocally`,
 * `networkOutbound`, and the launch-truth telemetry fact. No new claims —
 * every value traces back to existing copy above and in launch-facts.
 */
export const boundaryRows: BoundaryRow[] = [
  {
    surface: "Local scan / audit / ledger / verify",
    reads:
      "Git repo state, project file structure, .ledgerful/ledger.db, config.toml",
    writes:
      ".ledgerful/ledger.db, .ledgerful/reports/, .ledgerful/index/ (project-local)",
    uploads: "None by default",
    staysLocal:
      "Repo files, ledger, reports, signing keys, and verification history",
  },
  {
    surface: "Local sync (dir://)",
    reads:
      "Local ledger transactions and verification history (when sync is enabled)",
    writes:
      "Signed, encrypted bundles to a local directory path you control",
    uploads: "None — no cloud transport is involved",
    staysLocal:
      "Bundles and encryption keys remain on the local filesystem; transport is a directory path",
  },
  {
    surface: "Opt-in telemetry (usage-metrics build)",
    reads:
      "Local aggregate top-level command-name counts, enabled features, and an anonymous UUID generated when enabled",
    writes: "A single JSON payload to the configured Supabase ingest endpoint",
    uploads:
      "Aggregate command counts, platform/version metadata, enabled features, and an anonymous ID — only after explicit enable. " + launchTruth.facts.telemetry.ipRetention,
    staysLocal:
      "Source code, file paths, diff text, query text, commit messages, and author identities.",
  },
  {
    surface: "Configured cloud model (Gemini / Ollama Cloud / OpenRouter)",
    reads:
      "Local sanitized, truncated impact and retrieved codebase context (only when a provider is configured and selected)",
    writes: "Nothing local beyond normal ledger entries",
    uploads:
      "Sanitized, truncated context to the selected provider; API credentials may be read from the process environment or repository-local .env file",
    staysLocal:
      "Raw source files beyond the sanitized retrieval window; secrets unrelated to the configured model provider",
  },
  {
    surface: "Local dashboard (loopback)",
    reads:
      "Local daemon API at http://127.0.0.1:52001 with an ephemeral session token",
    writes: "No persistent writes outside the local ledger / report paths",
    uploads: "None — bind address is 127.0.0.1 only",
    staysLocal:
      "Dashboard session, ephemeral token (in-memory, never persisted to disk), and all served data",
  },
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
    filename: "chain_head.json",
    description:
      "Signed chain head binding the latest entry hash, genesis boundary, and chain length. Present when the ledger has entries; omitted for empty-state. Used by `ledgerful verify --against-export` to detect rollback or tail-truncation against an independently retained export.",
  },
  {
    filename: "ledger.csv",
    description:
      "All committed ledger provenance records in RFC 4180 CSV format. Columns: tx_id, category, entity, change_type, summary, reason, committed_at, signed, signature, observed, prev_hash. Sorted by committed_at ascending, then tx_id ascending. The observed column carries gate-mode metadata; prev_hash links each entry to its predecessor in the chain, post-genesis only.",
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
  "A successful verification prints filename: OK for each file. Any FAILED output means the download is corrupt or tampered — do not use the binary.",
  "Note: download URLs are live on the v0.1.8 GitHub Release. Windows Authenticode signing and macOS Developer ID / Gatekeeper notarization are not yet implemented — binaries may trigger OS security prompts on first launch. OS code signing is a planned enhancement. Supply chain attestation (SBOM, cosign, SLSA) shipped with v0.1.8 — see the supply chain section below.",
];

export type SupplyChainComponent = {
  name: string;
  tool: string;
  description: string;
};

export const supplyChainComponents: SupplyChainComponent[] = [
  {
    name: "CycloneDX SBOM",
    tool: "cargo cyclonedx --all-features",
    description:
      "A per-release Software Bill of Materials generated from the Cargo lockfile. Covers the engine (all features) and the MCP npm package. Attached as a release asset alongside the binaries.",
  },
  {
    name: "cosign keyless signing",
    tool: "cosign sign-blob (Sigstore Fulcio, GitHub OIDC)",
    description:
      "Release archives and the SBOM are signed with cosign keyless signing using the GitHub Actions OIDC identity. No long-lived signing keys to manage. Verifiers check the signature against the workflow identity and Fulcio certificate.",
  },
  {
    name: "SLSA build provenance",
    tool: "actions/attest (GitHub native)",
    description:
      "Each binary carries a SLSA build-provenance attestation emitted inside the matrix build job that compiled it. Provenance binds the artifact to the runner, source commit, and build parameters that produced it. Verifiable with gh attestation verify.",
  },
  {
    name: "SBOM attestation",
    tool: "actions/attest-sbom",
    description:
      "The SBOM file carries a signed attestation bound to the built artifact digest — the distinct claim that this is the bill of materials for that binary. Distinct from build provenance, which proves where it was built.",
  },
  {
    name: "Embedded dependency list",
    tool: "cargo auditable",
    description:
      "Releases are built with cargo auditable, which embeds the dependency graph in the binary as a custom linker section. Verifiable offline with cargo audit bin or syft without needing the SBOM file.",
  },
];

export const supplyChainVerifyCommands: { label: string; command: string; note: string }[] = [
  {
    label: "Verify the SBOM signature (cosign keyless)",
    command:
      "cosign verify-blob \\\n  --certificate-identity-regexp '^https://github\\.com/Ryan-AI-Studios/Ledgerful/\\.github/workflows/release\\.yml@.+' \\\n  --certificate-oidc-issuer https://token.actions.githubusercontent.com \\\n  --bundle ledgerful-<ver>.cdx.json.bundle \\\n  ledgerful-<ver>.cdx.json",
    note: "Checks that the SBOM was signed by the release workflow's OIDC identity (anchored to release.yml).",
  },
  {
    label: "Verify binary build provenance (SLSA)",
    command:
      "gh attestation verify ledgerful-<platform>.tar.gz \\\n  --owner Ryan-AI-Studios",
    note: "Confirms the binary was built by the documented GitHub Actions workflow. Requires the repository to be public or on GitHub Enterprise Cloud.",
  },
  {
    label: "Verify the SBOM attestation",
    command:
      "gh attestation verify ledgerful-<ver>.cdx.json \\\n  --owner Ryan-AI-Studios",
    note: "Confirms the SBOM is the bill of materials for this release. Requires the repository to be public or on GitHub Enterprise Cloud.",
  },
  {
    label: "Inspect embedded dependencies (offline)",
    command:
      "cargo audit bin ledgerful\n# or:\nsyft ledgerful",
    note: "Reads the dependency list embedded in the binary by cargo auditable. Works offline without the SBOM file. Available on each target where cargo auditable succeeded.",
  },
];

export const supplyChainGaps: { heading: string; body: string }[] = [
  {
    heading: "cozo git-dependency is not CVE-matched",
    body:
      "The cozo-redux crate is a git dependency pinned by commit, not a registry package. Downstream vulnerability scanners keyed on registry coordinates will not automatically match it against published advisories. Upstream cozo advisories are tracked manually. Publishing the fork to crates.io would give it a registry coordinate but does not change this gap for the current git-pinned rev.",
  },
  {
    heading: "Bundled native SQLite is not enumerated as its own component",
    body:
      "rusqlite uses the bundled feature, which statically links a native C SQLite library. A Rust-crate SBOM lists libsqlite3-sys as a crate component but does not enumerate the vendored C library as a separate component. This is a standard limitation of crate-level SBOM generation, not specific to the fork.",
  },
  {
    heading: "OS code signing is not yet implemented",
    body:
      "The release pipeline signs artifacts with cosign and SLSA provenance but does not yet implement Windows Authenticode or macOS Developer ID / Gatekeeper notarization. Binaries may trigger OS security prompts on first launch. OS code signing is a planned enhancement layered on top of the existing artifact signing.",
  },
];

/**
 * Public-site hosting & docs infrastructure — never touches user code.
 * Vercel hosts the static marketing/docs site; it serves only the published
 * public pages for `www.ledgerful.dev`. It does not process project source code,
 * ledger data, or user data. Reviewers should not confuse this surface with
 * the product's local-first runtime or the planned hosted control plane.
 */
export const publicSiteInfra: Subprocessor[] = [
  {
    name: "Vercel",
    purpose:
      "Static site hosting for this public marketing website. Hosts the public www.ledgerful.dev site only and never receives Ledgerful project source code, ledger data, or product data. Visitor traffic to the public site (e.g. IP addresses) is processed by Vercel as the hosting provider for the marketing site, not as a product subprocessor.",
    state: "available",
  },
  {
    name: "Kit (waitlist)",
    purpose:
      "Email capture for the /waitlist interest form. Receives the email address, an opt-in timestamp, and a design_partner custom field (set to \"true\" only if the design-partner checkbox is checked) via a first-party server relay. No source code, project data, or product data is sent. Double opt-in is mandatory: adding a subscriber to a double opt-in form triggers a confirmation email that must be acted on. The Kit API key stays server-side and never ships to the browser. To request deletion of your email from the waitlist, contact hello@ledgerful.dev with the subject \"Waitlist deletion request\" — your email and associated data will be removed from Kit within 5 business days.",
    state: "available",
  },
];

/**
 * Product / future-hosted-control-plane subprocessors. Two clearly-separated
 * groups are kept inside this single array, marked by the `tier` field on
 * each row:
 *   - "current-product" — sub-processors that already touch product surfaces
 *     in the *current* local-first build (opt-in telemetry ingest; configured
 *     cloud-model providers). They are scoped to data the user has explicitly
 *     chosen to send.
 *   - "hosted-planned" — subprocessors reserved for a future hosted control
 *     plane. They are listed only so reviewers can see the planned surface;
 *     they do not receive any data today.
 *
 * Vercel is **intentionally excluded** from this list — it is public-site
 * infra only (see `publicSiteInfra`) and would mislead reviewers if it
 * appeared here.
 */
export type ProductSubprocessorTier = "current-product" | "hosted-planned";

export type ProductSubprocessor = Subprocessor & { tier: ProductSubprocessorTier };

export const productSubprocessors: ProductSubprocessor[] = [
  {
    name: "Supabase (telemetry)",
    purpose:
      "Opt-in usage telemetry ingest only. No source code or project data is sent. Disabled by default.",
    state: "available",
    tier: "current-product",
  },
  {
    name: "Configured model provider",
    purpose:
      "Gemini, Ollama Cloud, or OpenRouter receives sanitized, truncated context only when a user configures and selects that cloud-backed ask workflow.",
    state: "available",
    tier: "current-product",
  },
  {
    name: "Supabase (hosted backend)",
    purpose:
      "Future control-plane database, auth, and Edge Functions for the hosted team service.",
    state: "hosted planned",
    tier: "hosted-planned",
  },
  {
    name: "GitHub",
    purpose:
      "Future GitHub App installation records and webhooks for the hosted control plane. The current self-managed GitHub Action is a separate beta path run in the customer's own repository.",
    state: "hosted planned",
    tier: "hosted-planned",
  },
];

/**
 * Concise threat-model + non-goals bullets. Sources:
 *   - coordination.md §6.2 (no SAML/OIDC/RBAC/SCIM in local daemon)
 *   - the SOC2 export page (local-only ZIP export, not a hosted SOC2 portal)
 *   - the signing section (private key at rest protected only by filesystem
 *     permissions; FDE is the primary recommended mitigation)
 *   - the data flow content above (no zero-network / zero-telemetry absolutes;
 *     opt-in telemetry, configured cloud-model egress are the only external
 *     paths and are off by default).
 *
 * No new security claims — every bullet restates something already implied by
 * the rest of this page.
 */
export const threatModel: { heading: string; body: string }[] = [
  {
    heading: "Trusted local machine assumption",
    body: "Ledgerful assumes the local machine is the trust boundary. Every claim on this page — ephemeral token, signing key, local sync transport, redacted evidence export — depends on the integrity of the local OS, filesystem, and the user running the CLI.",
  },
  {
    heading: "Local compromise equals key compromise",
    body: "Private keys are stored as plain hex files protected only by filesystem permissions. Malware or a stolen laptop without Full Disk Encryption (FDE) can extract the signing key and forge ledger entries. FDE is the primary recommended mitigation. Hardware-backed key storage (TPM, Secure Enclave) and hosted KMS are enterprise-planned and require a future control plane.",
  },
  {
    heading: "Local dashboard is loopback-only",
    body: "The dashboard bind address is 127.0.0.1:52001; CORS is restricted to loopback origins; the session token is 256-bit random, validated in constant time, and never persisted to disk. This is not an exposure surface for an external network — it is an exposure surface for a local attacker who can read process memory.",
  },
  {
    heading: "External paths are opt-in and narrow",
    body: "Opt-in telemetry sends a fixed aggregate JSON payload (no source, paths, query text, or commit messages). Two configured cloud-model workflows can send data: ask sends sanitized, truncated context, and index --fast sends code chunks to a configured Gemini model for semantic extraction. Both are opt-in (require a configured API key) and neither is active in the default local-only workflow.",
  },
];

export const nonGoals: string[] = [
  "Hosted-mode guarantees. The local-first engine does not promise the SLAs, RBAC, audit log retention, or team-scope guarantees of a hosted control plane. Hosted mode is planned and does not exist today.",
  "SOC2 certified / SOC2 compliant. Ledgerful generates a local SOC2-style evidence export from your ledger; we are not a certified audit firm and do not claim third-party SOC 2 attestation.",
  "FedRAMP, FIPS 140, or other government baselines. No claim is made about FedRAMP authorization, FIPS-validated cryptography, or comparable government certification.",
  "Zero-network or zero-telemetry absolutes. The default build excludes telemetry; opt-in telemetry and the configured cloud-model ask and index --fast workflows are the outbound paths for project data. The optional viz command generates a local HTML file that loads the vis-network library from a public CDN when opened in a browser. Nothing here is a 'no network ever' guarantee.",
  "Air-gap. The engine can run fully offline, but this page does not claim that every install configuration is air-gapped. Operators are responsible for their own network posture.",
  "SSO / SAML / OIDC / SCIM / RBAC in the local daemon. None of these are implemented locally. They are enterprise-planned for a future control plane.",
];

export type ProveDontClaim = {
  heading: string;
  body: string;
};

export const proveClaims: ProveDontClaim[] = [
  {
    heading: "Each ledger entry is Ed25519-signed",
    body:
      "Every committed entry is signed over a 5-field payload: tx_id, category, summary, reason, and committed_at. " +
      "The signature verifies that those fields have not changed since the entry was signed. (sign_ledger_entry basis: tx_id, category, summary, reason, committed_at)",
  },
  {
    heading: "The SOC2 export manifest is signed",
    body:
      "Each SOC2 evidence ZIP includes manifest.sig, a 64-byte Ed25519 signature over the manifest.json bytes, " +
      "plus manifest.pub for offline verification. (src/export/soc2.rs:300-305)",
  },
  {
    heading: "Chain hash makes order/set tampering evident",
    body:
      "From the chain-hash adoption date, every post-genesis entry stores prev_hash and a signed chain head binds the latest entry hash, " +
      "genesis, and length. Running ledgerful verify --signatures --chain walks the linkage end-to-end and detects alteration, removal, " +
      "reordering, or insertion. (chain-hash decision memo §3)",
  },
  {
    heading: "verify --against-export detects rollback when the head is retained",
    body:
      "ledgerful verify --against-export <path> compares the live chain head against a previously exported signed head. " +
      "If the live chain is shorter, points to a different latest entry, or presents a mismatched head, the command fails. " +
      "Detection requires the export to be kept outside the machine — for example, an auditor copy or CI artifact. (chain-hash decision memo §4)",
  },
  {
    heading: "The offline verifier is a standalone, dependency-free Node.js script",
    body:
      "verify-soc2-sample.mjs has no dependencies and runs offline. It recomputes SHA-256 over each file and verifies the Ed25519 " +
      "manifest signature with the public key included in the export.",
  },
];

export const dontProveClaims: ProveDontClaim[] = [
  {
    heading: "Signer identity",
    body:
      "manifest.pub in the export is self-asserted: it originated from the same machine that produced the ZIP. A compromised machine " +
      "could replace the ledger data, the signature, and the public key together, producing a self-consistent but fraudulent export. " +
      "Out-of-band verification — comparing the Ed25519 fingerprint against a copy obtained independently — is required to close that gap. " +
      "(sample-soc2/index.md:93-103)",
  },
  {
    heading: "Rollback to an earlier valid state from the same machine",
    body:
      "The chain head stored on the local machine can be rolled back alongside the database, and that earlier head will still verify. " +
      "Detecting rollback requires a chain head retained independently of the machine. (chain-hash decision memo §3)",
  },
  {
    heading: "Pre-chain entries",
    body:
      "Entries committed before chain-hash adoption (migration m51) remain order-unverifiable by design. " +
      "We do not fabricate retroactive chain history. (chain-hash decision memo §6)",
  },
  {
    heading: "Ground truth of category and summary",
    body:
      "Category, summary, and reason are strings entered by the user. The signature proves they have not been altered since signing; " +
      "it does not prove they are accurate or complete.",
  },
];

/**
 * Combined claim ceiling used by scripts or surfaces that need a single list.
 * The prove and don't-prove halves are kept separate in proveClaims and
 * dontProveClaims so the Trust page can render them under their own headings.
 */
export const proveDontClaims: ProveDontClaim[] = [
  ...proveClaims,
  ...dontProveClaims,
];
