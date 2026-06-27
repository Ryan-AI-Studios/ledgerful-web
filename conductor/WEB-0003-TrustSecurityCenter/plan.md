# WEB-0003-TrustSecurityCenter Plan

See `spec.md` for full requirements, source authority, and Definition of Done.

## Pre-work

- [ ] `changeguard ledger status --compact` — verify no pending transactions
- [ ] `changeguard scan --impact` — confirm current hotspot baseline
- [ ] Re-read `C:\dev\ChangeGuard\docs\Frontend-Notes.md` §4, §5, and E3 before
      writing content (telemetry config, security isolation, SOC2 export format)
- [ ] **Verify network inventory** against backend source before writing content:
  - Grep `C:\dev\ChangeGuard` for update-check logic (ping GitHub Releases API,
    `reqwest` calls to non-local hosts, `version_check`, etc.) — document result
    as "update checks: yes/no + what is sent" and use that truth in the page
  - Grep for Sentry, `sentry`, crash-report, or panic-hook integrations — if
    absent, the page may state "no crash reporting"; if present, document opt-in
    status and what is stripped before transmission
- [ ] **Verify token generation** — grep for the token generation code in the
      daemon; confirm bit-length / entropy source (e.g., `OsRng`, 256-bit) so
      the page can state "cryptographically random" with confidence
- [ ] **Verify platform paths** — grep for `dirs` crate or `AppData`/XDG path
      resolution; confirm actual OS-specific paths and correct the R3 table if
      the defaults differ from the spec

## Step 1 — Content model

Create `src/lib/content/trust.ts`:

- [ ] `TrustDataFlow` type with `icon`, `title`, `body`, `state: FeatureState`
- [ ] `trustDataFlows: TrustDataFlow[]` — 4 entries:
  - Local default (available): reads git/project state, writes local evidence, no upload
  - Local sync `dir://` (local-only): signed/encrypted bundles, no cloud transport
  - Telemetry opt-in (available): usage events only, Supabase ingest, no source code
  - Hosted mode (hosted planned): signed summaries and metadata, source never uploaded, future control plane
- [ ] `readsLocally: string[]` — 7+ items covering git state, file graph, ledger DB,
      config.toml, signing keys, project structure, and env vars for config
      overrides only; include a "does not read .env files or AWS_* keys" note
- [ ] `networkOutbound` — a small data structure (or inline copy block) stating
      the result of the pre-work network inventory: update checks (yes/no + what)
      and crash reporting (yes/no + opt-in status); this drives Section 2 copy
- [ ] `writesLocally: string[]` — 7+ items covering ledger.db, reports/, index/,
      sync/ bundles, `~/.changeguard/keys/`, SOC2 ZIP (on demand), with
      platform-specific path notes (Linux XDG / macOS home / Windows AppData)
- [ ] `TelemetryField` type with `name`, `description`
- [ ] `telemetrySchema: TelemetryField[]` — command name, feature flags, timing;
      note that source code, file content, and diff text are excluded
- [ ] `SocExportFile` type with `filename`, `description`
- [ ] `soc2ExportLayout: SocExportFile[]` — 7 entries matching E3 ZIP layout:
      manifest.json, manifest.sig, manifest.pub, ledger.csv,
      verification_history.csv, adr/*.md (describe as a folder)
- [ ] `releaseVerificationSteps: string[]` — 4 ordered steps covering download,
      SHA-256 check, SLSA note (planned), and the release-URL launch-fact caveat
- [ ] `Subprocessor` type with `name`, `purpose`, `state: FeatureState`
- [ ] `plannedSubprocessors: Subprocessor[]` — Vercel, Supabase, GitHub App
      (all hosted planned; note these are defined only when hosted mode launches)

## Step 2 — Page rewrite

Rewrite `src/app/trust/page.tsx` with 8 sections:

- [ ] **Hero** — kicker "Security posture", h1 "Security starts at the
      local-first boundary.", subtext about reads/writes/uploads
- [ ] **Section 1 — Data flow** — `trust-grid` with 4 `TrustDataFlow` cards;
      each card carries a `<StatusPill>` for its feature state
- [ ] **Section 2 — Reads and writes** — two-column grid listing `readsLocally`
      and `writesLocally` with separate headings; use `trust-dl-grid` class
- [ ] **Section 3 — Daemon access** — narrative with inline `<code>` for
      `127.0.0.1:52001`, `?token=`, `Authorization: Bearer`; explicit statement
      that tokens are cryptographically random (entropy from pre-work verification);
      token-safety rules (no logs, no examples, no URLs)
- [ ] **Section 4 — Cryptographic signing** — Ed25519 narrative, key location
      `~/.changeguard/keys/`, bundle signing, export manifest signing, explicit
      at-rest disclosure (plaintext files, relies on filesystem permissions and
      FDE), key rotation note (local only; hardware KMS / enterprise key
      management are enterprise planned)
- [ ] **Section 5 — SOC2 evidence export** — local-only copy, `<table>` with
      `soc2ExportLayout` rows, numbered offline verification steps
- [ ] **Section 6 — Release verification** — `releaseVerificationSteps` as
      ordered list with inline code; note that release URLs are WEB-0005
      launch facts; include current OS signing status (Authenticode / Developer
      ID) from pre-work verification — if not yet implemented, mark as planned
      alongside SLSA provenance
- [ ] **Section 7 — Responsible disclosure** — `<LaunchFacts />` component
      (disclosure channel row is already marked as an unresolved launch fact)
      or a `disclosure-notice` box; include a forward-looking note that an
      encrypted submission path (PGP key) will be published when the channel
      is resolved (WEB-0005)
- [ ] **Section 8 — Subprocessors** — local mode text ("zero subprocessors"),
      then `plannedSubprocessors` table with hosted-planned state pills

## Step 3 — Styles

- [ ] Add `.trust-dl-grid` to `src/app/globals.css` — two-column list layout
      for reads/writes at ≥ 600px, single column on narrow viewports
- [ ] Add `.trust-table` — compact table style for SOC2 layout and telemetry
      schema (similar to `.matrix-table` but without the fixed min-width)
- [ ] Add `.disclosure-notice` — muted-border info box for unresolved-fact
      and launch-fact notices inside sections
- [ ] Reuse `.trust-grid`, `.content-band`, `.split-band`, `.fact-row`,
      `.item-caveat`, `code` inline — do not duplicate existing rules

## Step 4 — Automated truth check

- [ ] Create `scripts/check-trust-truth.mjs`:
  - Read `.next/server/app/trust.html`
  - Assert 1: noindex meta tag is active
  - Assert 2: "opt-in" appears in the page body
  - Assert 3: both "source" and "upload" appear (no-source-upload claim)
  - Assert 4: "loopback" or "127.0.0.1" appears (daemon access)
  - Assert 5: "SHA-256" or "checksum" appears (release verification)
  - Assert 6: "responsible disclosure" appears (case-insensitive)
  - Assert 7: enterprise identity terms do not appear unqualified — check each
      independently; each must either be absent or appear within ~120 chars of
      "planned": "SSO", "SAML", "OIDC", "SCIM", "RBAC", "audit log" (hosted)
  - Assert 8: crash reporting is addressed — "crash" or "no crash" appears
      somewhere in the body (validates the outbound-network inventory is present)
  - Exit 0 if all pass; exit 1 with a per-assertion failure description
- [ ] Add to `package.json`:
  `"check:trust": "npm run build && node scripts/check-trust-truth.mjs"`

## Step 5 — Full gate

- [ ] `npm run build` — passes clean
- [ ] `npm run lint` — no errors
- [ ] `node scripts/check-trust-truth.mjs` — all 8 assertions pass
- [ ] `node scripts/check-quiet-preview.mjs` — noindex still active
- [ ] `changeguard scan --impact` — current report written
- [ ] `changeguard verify --scope fast` — all steps pass

## Step 6 — Manual browser checks

- [ ] Desktop 1280px: all 8 sections render; no overflow; SOC2 table readable;
      release verification steps legible; `StatusPill` labels correct
- [ ] Mobile 375px: `trust-dl-grid` collapses to single column; `trust-table`
      scrolls if needed; disclosure notice not truncated
- [ ] Keyboard: Tab order reaches data-flow cards, table, and any disclosure
      links; focus ring visible

## Step 7 — Claim audit

- [ ] No hosted feature presented as available: GitHub App, SSO/SAML/OIDC,
      SCIM, RBAC, hosted audit log, billing portal, hosted SOC2 portal
- [ ] No invented responsible-disclosure email, URL, or security advisory link
- [ ] PGP section is forward-looking only — no invented key published
- [ ] No invented subprocessors for hosted mode
- [ ] No release asset download URL that has not been smoke-tested
- [ ] OS code signing status matches backend release workflow (not overclaimed)
- [ ] Token entropy claim matches actual backend implementation
- [ ] Update-check and crash-report copy matches backend grep results from pre-work
- [ ] Telemetry copy does not imply source upload
- [ ] Key at-rest disclosure is present (plaintext + FDE recommendation)

## Step 8 — Finalize

- [ ] Update `conductor/conductor.md` — WEB-0003 status: Planned → Completed
- [ ] Update `.agents/plan.md` — WEB-0003 status: Planned → Completed
- [ ] Update `docs/ToDo.md` — remove WEB-0003 open item; update last-reviewed
- [ ] Create `conductor/WEB-0003-TrustSecurityCenter/review.md` with evidence
- [ ] `git diff --stat` — confirm only intentional files are staged
- [ ] Commit and push; verify ChangeGuard pre-push hooks pass
