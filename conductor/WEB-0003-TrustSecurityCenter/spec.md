# WEB-0003-TrustSecurityCenter Spec

## Objective

Replace the four-card placeholder on `/trust` with a structured Trust and
Security Center that enables a security reviewer to approve a local Ledgerful
install pilot without private clarification.

## Problem

The current `/trust` page has four short cards (Local default, Daemon access,
Telemetry, Hosted future) and a launch-facts placeholder for Evidence and
Disclosure. It does not answer the questions a security reviewer would ask
before approving a devtool on a development machine:

- What files does Ledgerful read?
- What does it write, and where?
- Does anything leave the machine? Under what conditions?
- Does the CLI phone home for updates or crash reports?
- How is the dashboard accessed, and are tokens safe?
- How are ledger signatures generated and stored? Are they encrypted at rest?
- How do I verify a release artifact?
- How do I report a security issue?

## Source Authority

- `C:\dev\Roadmap.md` — WEB-2 requirements, Phase 4 trust artifacts, Security
  and Privacy section, Commercial Readiness Gap Matrix.
- `AGENTS.md` — trust/security content requirements, `contracts` block, and
  `must_qualify_until_real` list.
- `C:\dev\ChangeGuard\docs\Frontend-Notes.md` — §1 (stateless daemon, honest
  zeros), §2 (config gating), §4 (telemetry and ingest endpoint), §5 (security
  and isolation), E3 (SOC2 export ZIP layout and tamper-evidence contract).
- `C:\dev\ledgerful-frontend\docs\Backend-Notes.md` — frontend contract notes.

## Requirements

### R1 — Data flow modes

The page must describe four distinct data transmission modes. Each mode must
carry an explicit state label (available, local-only, or hosted planned).

| Mode | State | What leaves the machine |
|---|---|---|
| Local default | available | Nothing. Source is never uploaded by default. |
| Local sync (`dir://`) | local-only | Signed, encrypted bundles over a local directory transport. No cloud. |
| Telemetry opt-in | available (opt-in) | Usage events only. No source code, no file content. Requires explicit config. |
| Hosted mode (future) | hosted planned | Signed summaries and metadata. Source code never uploaded by default. Requires explicit consent and future control-plane. |

### R2 — What Ledgerful reads locally

The page must enumerate what the local engine reads:
- git repository state (commits, diffs, blame)
- project file structure and symbol graph
- `.changeguard/ledger.db` (SQLite ledger state)
- `config.toml` (user configuration)
- signing keys in `~/.changeguard/keys/`
- environment variables for configuration overrides (e.g., `CHANGEGUARD_CONFIG`
  for a custom config path); the page must state explicitly that Ledgerful does
  not read `.env` files, `AWS_*` keys, or general system environment variables
  as part of normal operation

The page must also answer two outbound-network questions security reviewers will
ask immediately:

- **Update checks**: state explicitly whether the CLI pings GitHub or any
  external service to check for new versions. If it does, document what is
  transmitted (version, OS). If it does not, state that explicitly.
- **Crash reporting**: state explicitly whether crash or panic reports are
  transmitted. If a crash reporter (e.g., Sentry) is integrated, it must be
  opt-in and must strip PII, file paths, and source snippets before sending.
  If no crash reporter exists, state that explicitly.

If the current backend state is ambiguous on either point, mark it as a
verification task in the plan and default the published copy to "not
implemented" until backend evidence confirms otherwise.

### R3 — What Ledgerful writes locally

The page must enumerate what the local engine writes. All writes are local:
- `.changeguard/ledger.db` — ledger transactions, verification history
- `.changeguard/reports/` — impact and verify reports (JSON)
- `.changeguard/index/` — local search index
- `.changeguard/sync/` — signed/encrypted sync bundles (when sync enabled)
- `~/.changeguard/keys/` — Ed25519 signing key pair (generated on first use)

The page must document platform-specific default paths so reviewers know the
tool does not write to arbitrary system directories:
- **Linux**: respects `$XDG_CONFIG_HOME` / `$XDG_DATA_HOME`; defaults to
  `~/.config/changeguard/` and `~/.local/share/changeguard/` if XDG is unset
- **macOS**: writes to `~/.changeguard/` (home-relative, not system-wide)
- **Windows**: uses `%APPDATA%\changeguard\` and project-local `.changeguard\`

If the actual paths differ from the above, the plan must verify and correct
them against backend source before publishing.

### R4 — Daemon access and token security

- Local dashboard is loopback-only: `http://127.0.0.1:52001`
- Access uses ephemeral `?token=` query parameter or `Authorization: Bearer`
- Tokens are cryptographically random with sufficient entropy to make
  localhost brute-force infeasible (verify exact bit-length against backend
  source in the plan; do not publish a weaker-than-true claim)
- Tokens are per-session and never persisted to disk by the daemon
- Tokens must not appear in browser logs, bug reports, or documentation examples
- CORS is restricted to `localhost`/`127.0.0.1`; daemon does not accept
  cross-origin requests from remote or hosted domains

### R5 — Cryptographic signing

- Ledger entries are signed with a local Ed25519 key pair stored in
  `~/.changeguard/keys/`
- Keys are generated on first use; no remote key management by default
- Sync bundles are signed and encrypted before transport
- SOC2 export ZIP includes `manifest.sig` (raw 64-byte Ed25519 signature) and
  `manifest.pub` (raw 32-byte verifying key) for offline tamper verification
- Key rotation and device trust state are local; enterprise key management
  belongs to a future control plane

**Key storage at rest**: The page must explicitly acknowledge that Ed25519
private keys are stored as local files protected only by filesystem permissions.
A local machine compromise (malware, stolen laptop without FDE) could allow an
attacker to extract the private key and forge signed ledger entries. The trust
center should state this plainly and recommend Full Disk Encryption (FDE) as the
primary mitigation for local key security. Hardware-backed key storage and
hosted KMS are enterprise-planned features for the future control plane.

### R6 — SOC2 evidence export

The local SOC2 export is a ZIP generated from local evidence. This is NOT a
hosted SOC2 portal.

ZIP layout (from E3 contract in `Frontend-Notes.md`):

| File | Description |
|---|---|
| `manifest.json` | SHA-256 hashes and sizes for all other files, `generatedAt`, `entryCount` |
| `manifest.sig` | Raw 64-byte Ed25519 signature over `manifest.json` bytes |
| `manifest.pub` | Raw 32-byte Ed25519 verifying key |
| `ledger.csv` | All committed ledger provenance records, RFC 4180 CSV |
| `verification_history.csv` | CI gate pass/fail records |
| `adr/*.md` | MADR-format Architectural Decision Records |

Offline tamper verification steps:
1. For each file in `manifest.json`'s `files` array, re-compute SHA-256 and
   compare to the stored hash.
2. Read `manifest.sig` (64 bytes) and `manifest.pub` (32 bytes). Verify the
   signature over `manifest.json` bytes using Ed25519.
3. A mismatch in step 1 means a file was altered after generation. A mismatch
   in step 2 means the manifest was replaced.

### R7 — Telemetry

- Usage telemetry is opt-in only, controlled by the backend `config.toml`
  (`ledgerful usage` command or `[telemetry].enabled = true`)
- When enabled, only structured usage events are sent: command names, timing,
  feature flags used
- No source code, no file content, no diff text, no commit messages are sent
- Ingest endpoint: Supabase function at
  `scmxtnjqqklvcwyeouvj.supabase.co/functions/v1/telemetry-ingest`
- The page must not imply source upload occurs via telemetry

### R8 — Release verification

- Every release includes SHA-256 checksum files alongside binary assets
- Verification process: download binary + companion `.sha256` file, run
  `sha256sum -c ledgerful.sha256`, compare output
- SLSA provenance is planned for enterprise-readiness follow-up
- Specific download URLs are a WEB-0005 launch fact; this page explains the
  process without linking unverified release assets

**OS-level code signing**: The page must document the current status of
platform binary signing:
- **Windows Authenticode**: state whether binaries are currently signed with
  a code-signing certificate (removes SmartScreen warnings). If not yet done,
  list it as a planned enhancement alongside SLSA provenance.
- **macOS Developer ID / Gatekeeper notarization**: state whether binaries are
  notarized. If not yet done, list it as a planned enhancement.

Verify the current signing status against the release workflow in the backend
repo before publishing. Do not claim signing is in place if it is not.

### R9 — Responsible disclosure

The security disclosure channel is a WEB-0005 launch fact. This page must:
- Acknowledge that a responsible disclosure channel will be published
- Mark the contact details as unresolved (using the LaunchFacts component or
  an equivalent unresolved-fact pattern)
- Not invent an email address, form URL, or GitHub security advisory link that
  does not yet exist and has not been smoke-tested

**PGP/GPG for encrypted reports**: When WEB-0005 resolves the disclosure
channel, the implementation should also publish a PGP public key so researchers
can submit encrypted vulnerability reports. Enterprise security teams and bug-
bounty researchers routinely expect an encrypted channel. This is not a
requirement for WEB-0003 (the channel is still a launch fact), but the
responsible-disclosure section should include a placeholder note that an
encrypted submission path will be provided when the channel is published.

### R10 — Subprocessors

- Local mode: zero subprocessors. All data stays on the developer machine.
- Hosted mode (future): to be named when hosted services launch. Expected to
  include Vercel, Supabase, and GitHub App when relevant.
- Data deletion: process to be defined when hosted mode exists.

### R11 — Feature state boundaries

The following MUST appear with a hosted-planned or enterprise-planned qualifier.
None may be presented as available today:

- GitHub App (hosted planned)
- SSO / SAML / OIDC (enterprise planned)
- SCIM provisioning (enterprise planned)
- RBAC (enterprise planned)
- Hosted audit log (enterprise planned)
- Billing portal (hosted planned)
- Hosted SOC2 portal (enterprise planned)
- Data deletion portal for hosted mode (hosted planned)

### R12 — Automated truth check

`scripts/check-trust-truth.mjs` must assert against `.next/server/app/trust.html`:

1. noindex meta tag is active (quiet preview policy).
2. "opt-in" is present near telemetry content.
3. Both "source" and "upload" appear (the no-source-upload claim is present).
4. "loopback" or "127.0.0.1" appears (daemon access documented).
5. "SHA-256" or "checksum" appears (release verification documented).
6. "responsible disclosure" appears (even as a launch fact).
7. Enterprise identity terms do not appear unqualified. Each of the following
   must appear only alongside a "planned" qualifier (within ~120 characters) or
   not appear at all. The script must check each term independently:
   - "SSO"
   - "SAML"
   - "OIDC"
   - "SCIM"
   - "RBAC"
   - "audit log" (hosted form; "local" + "audit" is acceptable)
8. "crash" or "crash report" claim is present — either stating crash reporting
   does not exist or stating it is opt-in (validates R2 coverage).

`package.json` must gain `"check:trust": "npm run build && node scripts/check-trust-truth.mjs"`.

## Page Structure

```
/trust

[Hero]
  kicker: "Security posture"
  h1: "Security starts at the local-first boundary."
  subtext: What Ledgerful reads, writes, and transmits — and what stays on your machine.

[Section 1: Data flow]
  SectionHeading: "Data flow"
  Cards: 4 flows (local default, local sync, telemetry opt-in, hosted planned)
  Each card: icon + title + state label + body

[Section 2: Reads and writes]
  SectionHeading: "What stays on your machine"
  Reads list (left) / Writes list (right)

[Section 3: Daemon access]
  SectionHeading: "Dashboard and token security"
  Narrative with inline code: 127.0.0.1, ?token=, loopback-only

[Section 4: Cryptographic signing]
  SectionHeading: "Signing and key management"
  Ed25519 key pair, ~/.changeguard/keys/, bundle signing, export manifest

[Section 5: SOC2 evidence export]
  SectionHeading: "Local evidence export"
  ZIP layout table + offline verification steps

[Section 6: Release verification]
  SectionHeading: "Release verification"
  sha256sum steps + SLSA note + release URL launch-fact caveat

[Section 7: Responsible disclosure]
  SectionHeading: "Responsible disclosure"
  LaunchFacts or unresolved-fact pattern for the contact channel

[Section 8: Subprocessors]
  SectionHeading: "Subprocessors"
  None for local mode + hosted-planned caveat
```

## Content Model

Create `src/lib/content/trust.ts` containing:

- `TrustDataFlow` type — `icon`, `title`, `body`, `state` (FeatureState)
- `trustDataFlows: TrustDataFlow[]`
- `readsLocally: string[]`
- `writesLocally: string[]`
- `TelemetryField` type — `name`, `description`
- `telemetrySchema: TelemetryField[]`
- `SocExportFile` type — `filename`, `description`
- `soc2ExportLayout: SocExportFile[]`
- `releaseVerificationSteps: string[]`
- `Subprocessor` type — `name`, `purpose`, `state` (FeatureState)
- `plannedSubprocessors: Subprocessor[]`

## Styles

Reuse existing classes wherever possible: `.trust-grid`, `.content-band`,
`.split-band`, `.fact-row`, `.fact-list`, `.item-caveat`, code inline.

Add only what is missing:
- `.trust-dl-grid` — two-column definition-style list for reads/writes
- `.trust-table` — compact table for SOC2 ZIP layout and telemetry schema
- `.disclosure-notice` — muted-border box for launch-fact unresolved blocks

## Definition of Done

- `/trust` route passes all assertions in `check-trust-truth.mjs`.
- `npm run build` passes with TypeScript clean.
- `npm run lint` passes.
- `node scripts/check-quiet-preview.mjs` — noindex still active.
- `changeguard scan --impact` is current.
- `changeguard verify --scope fast` passes all steps.
- No public claim outruns `C:\dev\Roadmap.md` or current backend/frontend state.
- No hosted feature (SSO/SAML/GitHub App/SCIM/RBAC/hosted SOC2) presented as available.
- No invented responsible-disclosure channel, email, or URL.
- No invented subprocessors for hosted mode.
- Desktop (1280px) and mobile (375px) browser smoke recorded.
- Keyboard navigation checked for any interactive elements added.
- Review has no open critical or high findings.
- `conductor/conductor.md` and `.agents/plan.md` updated to Completed.
