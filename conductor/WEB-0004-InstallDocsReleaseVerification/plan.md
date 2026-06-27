# WEB-0004-InstallDocsReleaseVerification Plan

## Overview

This plan turns the 7-card placeholder at `/docs` into a linked set of real
install/quickstart doc pages. Each page covers one product surface, uses only
verified claims, and marks release-blocked or hosted-planned items with the
correct state pill and disclosure notices.

**Routes added:** `/docs/cli`, `/docs/dashboard`, `/docs/mcp`,
`/docs/github-action`, `/docs/compliance`, `/docs/sync`, `/docs/releases`.

**Truth posture:** Release download URLs and npm package links remain WEB-0005
launch facts. MCP package and GitHub Action are shown with beta state and
explicit caveats.

---

## Step 0 — Pre-work: backend verification

Before authoring content, grep the backend to confirm available commands and
flags exist. Record findings in this plan before implementing.

### 0a. Confirm CLI commands exist

```powershell
# Enumerate all subcommands in the CLI
grep -r "\.subcommand\|Args::\|Command::\|Subcommand::" C:/dev/ChangeGuard/src/cli/ | head -40

# Confirm sync subcommands
grep -rn "sync" C:/dev/ChangeGuard/src/cli/args.rs | head -20

# Confirm compliance subcommands
grep -rn "compliance\|export" C:/dev/ChangeGuard/src/cli/args.rs | head -20

# Confirm ledgerful --version and doctor
grep -n "doctor\|version" C:/dev/ChangeGuard/src/cli/args.rs | head -20
```

Expected findings:
- `ledgerful scan`, `ledgerful web`, `ledgerful mcp`, `ledgerful doctor`,
  `ledgerful ledger status`, `ledgerful compliance export`, `ledgerful audit`
- `ledgerful sync init` and `ledgerful sync` subcommands — verify exact names
- `--base-ref` flag on `ledgerful scan` (confirmed in M4 notes)

### 0b. Confirm MCP tool list

```powershell
grep -rn "tool_name\|ToolName\|register_tool\|\"scan\"\|\"search\"\|\"ask\"" `
  C:/dev/ChangeGuard/src/commands/mcp/ | head -30
```

Expected: 10 tools (scan, search, ask, ledger_status, ledger_search, hotspots,
endpoints_changed, security_boundaries, dead_code, verify_plan).

### 0c. Confirm GitHub Action inputs

```powershell
Get-Content "C:/dev/ChangeGuard/action/action.yml"
```

Expected: `github-token`, `risk-threshold`, `fail-on-risk` inputs. Confirm
exact `uses:` string format and whether a version tag exists.

### 0d. Confirm `ledgerful audit` exists

```powershell
grep -n "audit" C:/dev/ChangeGuard/src/cli/args.rs | head -10
```

Expected: `ledgerful audit` command (used in support bundle guidance).

### 0e. Confirm MCP workspace context and dashboard port flag

```powershell
# Does ledgerful mcp accept a --root flag?
grep -n "\-\-root\|root.*mcp\|mcp.*root" C:/dev/ChangeGuard/src/commands/mcp/ -r | head -10

# Does ledgerful web accept a --port flag or is port configurable in config.toml?
grep -n "\-\-port\|port.*web\|web.*port" C:/dev/ChangeGuard/src/cli/args.rs | head -10
grep -n "port" C:/dev/ChangeGuard/src/cli/args.rs | head -20
```

Expected: Determine whether `ledgerful mcp` uses the current working directory
as the project root (so MCP clients must launch it from the repo root) or
accepts an explicit `--root <path>` flag. Also determine if `ledgerful web`
exposes a `--port` flag or `config.toml` key for changing the bound port.

Record all findings above in the review log before writing page content.

---

## Step 1 — Content model and shared types

Create `src/lib/content/docs-pages.ts`:

```typescript
export type DocNavLink = {
  label: string;
  href: string;
};

export const docNavLinks: DocNavLink[] = [
  { label: "CLI install", href: "/docs/cli" },
  { label: "Dashboard", href: "/docs/dashboard" },
  { label: "MCP setup", href: "/docs/mcp" },
  { label: "GitHub Action", href: "/docs/github-action" },
  { label: "Compliance export", href: "/docs/compliance" },
  { label: "Team sync", href: "/docs/sync" },
  { label: "Release verification", href: "/docs/releases" },
];
```

Add MCP tool list and GitHub Action input definitions here so they are
importable into the `/docs/mcp` and `/docs/github-action` pages.

---

## Step 2 — Update /docs index

Edit `src/lib/content/docs.ts`:
- Add `href: string` to `DocTopic` type.
- Add the `/docs/*` hrefs to each of the 7 entries.
- Update `nextAction` text to match what the linked page actually delivers.

Edit `src/app/docs/page.tsx`:
- Import `Link` from `next/link`.
- Wrap each card `<article>` in a `<Link href={topic.href}>` (or conditionally
  if `href` is present).
- Update card copy to reflect that each now links to real content.

Check: `npm run build` — all 12 current pages still build.

---

## Step 3 — CLI doc (`/docs/cli`)

Create `src/app/docs/cli/page.tsx`.

Sections:
1. Hero — kicker "Docs · CLI", h1 "Install and run Ledgerful"
2. **Release binaries (pending)** — `disclosure-notice` stating download URLs
   are a WEB-0005 launch fact. Do not publish a URL. Note that release binaries
   will not require a Rust toolchain.
3. **Install from source** — `cargo install --git
   https://github.com/Ryan-AI-Studios/ChangeGuard --bin ledgerful`.
   Prerequisite: a Rust toolchain (`rustc` and `cargo`). Direct users to
   rustup.rs for the standard install. Mark as `available` with note "not the
   primary distribution path; release binaries will not require Rust."
4. **Verify install** — `ledgerful --version`, `ledgerful doctor` output
   structure (checks: git, Rust, engine, project count).
5. **First scan** — `ledgerful scan` with sample output structure (risk level,
   hotspots, temporal couplings, pending ledger).
6. **Ledger status** — `ledgerful ledger status --compact`.
7. **Next steps** — grid of links: Dashboard, MCP, GitHub Action, Compliance.

Required metadata: `title: "CLI Install — Ledgerful Docs"`,
`description: pageDescriptions.docsCli` (add to navigation.ts),
`canonical: "/docs/cli"`.

Truth check: zero invented command flags. No crates.io install path unless
verified. No release binary download URL.

---

## Step 4 — Dashboard doc (`/docs/dashboard`)

Create `src/app/docs/dashboard/page.tsx`.

Sections:
1. Hero — kicker "Docs · Dashboard", h1 "Launch and access the local dashboard"
2. **Start the daemon** — `ledgerful web`. Port `52001`. Opens browser.
   Add a port conflict note: if `52001` is in use, explain the resolution path
   based on Step 0e findings (e.g., `--port` flag or `[daemon].port` in
   `config.toml`). If no port flag is confirmed, direct users to stop the
   conflicting process or change it via config; do not invent a flag that was
   not verified.
3. **Token and loopback security** — Reuse framing from trust page (Section 4),
   condensed. Emphasize: token not in logs, restart to rotate.
4. **Multiple projects** — `ledgerful web --root <path>`. Validation warnings
   explained as "needs-attention" signals.
5. **What is local-only** — Dashboard does not have a hosted SaaS backend.
   GitHub App, SSO, billing, team workspaces: hosted planned.
6. **Next steps** — links to CLI, MCP, Compliance.

State pills: dashboard access `local-only`, GitHub App `hosted planned`, SSO
`enterprise planned`.

---

## Step 5 — MCP doc (`/docs/mcp`)

Create `src/app/docs/mcp/page.tsx`.

Sections:
1. Hero — kicker "Docs · MCP", h1 "Add Ledgerful to your AI coding agent"
2. **State badge** — `beta` pill + disclosure-notice: "`@ledgerful/mcp-server`
   is implementation-complete; npm publish is release-blocked until a tagged
   GitHub release is available and smoke-tested. The local binary path below
   works today."
3. **Local binary setup (available now)** — config block showing
   `"command": "ledgerful", "args": ["mcp"]`. This path works immediately
   after installing the CLI. Based on Step 0e findings: if `--root` is
   required, add it to `"args"`; if cwd is used, document that the MCP client
   must launch the server from the target repository root (add an explicit
   `"cwd"` field in the config if the client supports it).
4. **Claude Code config** — `.mcp.json` or `settings.json` example using the
   local binary.
5. **npm package (beta — pending)** — Show `npx @ledgerful/mcp-server` inside
   a disclosure-notice or code block with a "pending" comment. Do not link
   npmjs.com.
6. **Tool list** — table: `name | description | read-only?`. All 10 tools,
   all read-only.
7. **Security note** — local read access, trust only verified agents.

---

## Step 6 — GitHub Action doc (`/docs/github-action`)

Create `src/app/docs/github-action/page.tsx`.

Sections:
1. Hero — kicker "Docs · GitHub Action", h1 "Add Ledgerful risk comments to
   your pull requests"
2. **State badge** — `beta` pill + disclosure-notice: "M4 validated on a real
   PR (#3). The release version tag is a WEB-0005 launch fact; replace
   `<version>` below with the published tag once available."
3. **Example workflow YAML** — `.github/workflows/ledgerful.yml`. Use
   `uses: Ryan-AI-Studios/ChangeGuard@<version>` with `<version>` as a visible
   placeholder in a `# Replace with release tag` comment. The `github-token`
   value must be shown as `${{ secrets.GITHUB_TOKEN }}` — not as a hardcoded
   value or a PAT. This is both a correctness and security requirement; assert
   it in Step 11.
4. **Permissions** — `pull-requests: write`, `contents: read`. Based on Step
   0c findings, add `checks: write` if the current `action.yml` or the
   roadmap's check-run polishing requires it.
5. **Inputs table** — `github-token` (required), `risk-threshold` (default
   `medium`), `fail-on-risk` (default `false`).
6. **Action vs GitHub App** — callout box: "This is a self-managed GitHub
   Action running in your repository's CI. A hosted GitHub App (org-level
   install, webhook callbacks, cross-repo check runs) is a separate feature —
   hosted planned, not yet implemented."
7. **Branch protection** — `fail-on-risk: true` + `risk-threshold` gate.

Verify `action.yml` inputs in Step 0c before publishing this content.

---

## Step 7 — Compliance doc (`/docs/compliance`)

Create `src/app/docs/compliance/page.tsx`.

Sections:
1. Hero — kicker "Docs · Compliance", h1 "Generate and verify local SOC2
   evidence"
2. **Run the export** — `ledgerful compliance export`. Output: ZIP file at
   local path.
3. **ZIP layout table** — 6 rows from `soc2ExportLayout` (import from
   `src/lib/content/trust.ts` to avoid duplication). Add cross-link to `/trust`
   for offline tamper-verification steps.
4. **Dashboard export** — alternative via `/compliance` route in the dashboard
   (local). Add `local-only` pill.
5. **Scope callout** — `disclosure-notice`: "This is a local ZIP export from
   local evidence only. It is not a hosted SOC2 portal. A hosted portal with
   continuous monitoring and auditor access is enterprise-planned."
6. **Using the export** — what a reviewer can do: share the ZIP, run the
   offline tamper check, map entries to controls. Include a security callout:
   the `manifest.pub` shipped inside the ZIP cannot self-authenticate. A
   recipient must verify the public key against a trusted out-of-band source
   (e.g., the GitHub release page or a published key fingerprint) before the
   tamper check has meaningful security guarantees. Document this limitation
   explicitly so security reviewers are not misled.

Import `soc2ExportLayout` from `@/lib/content/trust` rather than redefining.

---

## Step 8 — Sync doc (`/docs/sync`)

Create `src/app/docs/sync/page.tsx`.

Sections:
1. Hero — kicker "Docs · Team Sync", h1 "Share ledger state with your team
   locally"
2. **State badge** — `local-only` pill. Hosted sync transport: `hosted planned`.
3. **What sync does** — signed/encrypted ledger bundles, `dir://` transport, no
   source code in bundles.
4. **Setup** — `ledgerful sync init` (verify exact command from Step 0a),
   `dir://` path config, first export. If exact subcommands cannot be confirmed
   from the conductor, label the section "setup steps (verify exact commands
   with `ledgerful sync --help`)" and show the conceptual flow.
5. **Routine workflow** — export, copy bundle, import.
6. **Bundle contents** — signed/encrypted ledger delta: no source code, no
   file contents, no diff text.
7. **Recovery** — note that recovery from lost sync key requires re-init.
   Cross-link to `/trust` for key management details.
8. **Concurrent write warning** — Add a callout for teams mapping `dir://` to
   a network share (Dropbox, Google Drive, SMB). Simultaneous writes from
   multiple developers can cause file-locking conflicts or silent corruption.
   `dir://` has no distributed locking. Teams should coordinate exports (one at
   a time) or use a dedicated local path that one person manages. Hosted sync
   transport (with conflict resolution) is hosted planned.

Truth boundary: do not describe hosted transport, S3/WebDAV, PR/ticket sync, or
multi-org partitioning — out of scope for the M0 sync foundation.

---

## Step 9 — Releases doc (`/docs/releases`)

Create `src/app/docs/releases/page.tsx`.

Sections:
1. Hero — kicker "Docs · Releases", h1 "Verify Ledgerful release artifacts"
2. **Release artifacts (pending)** — `disclosure-notice`: "Download URLs are a
   WEB-0005 launch fact. Artifact types will include platform binaries,
   `.sha256` checksum files, and the npm MCP package."
3. **Verify a binary** — conceptual step list (mirrors trust page R9 steps):
   - Download binary + `.sha256`
   - `sha256sum -c ledgerful.sha256` (Linux/macOS) or
     `(Get-FileHash ledgerful.exe -Algorithm SHA256).Hash` (Windows PowerShell,
     preferred over `certutil` — outputs a single clean hash line)
   - Compare output hash to the published hash
4. **OS code signing status** — `disclosure-notice`: Windows Authenticode and
   macOS Developer ID not yet implemented; planned.
5. **SLSA provenance** — planned.
6. **Support bundle** — `ledgerful audit --json` + `ledgerful doctor`. What to
   redact: tokens, keys, internal paths. Where to file: cross-link `/trust`
   for responsible disclosure (unresolved launch fact).

---

## Step 10 — CSS for new doc patterns

In `src/app/globals.css`, add only what is needed:

```css
/* Doc sub-page bottom nav */
.doc-nav {
  display: flex;
  gap: 24px;
  padding: 32px 0 0;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.doc-nav a {
  font-size: 0.9rem;
  color: var(--accent);
  text-decoration: none;
}
.doc-nav a:hover { text-decoration: underline; }

/* Doc step list (consistent numbered style) */
.doc-step-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding-left: 1.4em;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.65;
}

/* MCP/Action tool table */
.doc-tool-table {
  /* extends .trust-table patterns; just alias if identical */
}
```

If `.doc-tool-table` is identical to `.trust-table`, do not add it — use
`.trust-table` directly.

---

## Step 11 — check:docs truth script

Create `scripts/check-docs-truth.mjs`.

- Build the app (`npm run build` already done by parent `check:docs` script).
- Read the static HTML for each of the 8 docs routes from `.next/server/app/docs/`.
- Run the 11 assertions from spec R11 — the 10 original plus assertion 11:
  - Assertion 11: The `/docs/github-action` page HTML contains
    `secrets.GITHUB_TOKEN` (or the escaped form `secrets.GITHUB_TOKEN`) to
    confirm the YAML example demonstrates the secure token pattern.
- Exit 1 on any failure; print the failing assertion and path.

Add to `package.json`:
```json
"check:docs": "npm run build && node scripts/check-docs-truth.mjs"
```

---

## Step 12 — Metadata: add page descriptions to navigation.ts

For each new sub-page, add a `pageDescriptions.docsCli`, `.docsDashboard`,
`.docsMcp`, `.docsGithubAction`, `.docsCompliance`, `.docsSync`, `.docsReleases`
entry in `src/lib/content/navigation.ts`.

---

## Step 13 — Verification gate

Run in order:

```powershell
npm run build
npm run lint
node scripts/check-docs-truth.mjs
node scripts/check-quiet-preview.mjs
node scripts/check-trust-truth.mjs   # regression: trust page must still pass
node scripts/check-pricing-truth.mjs # regression: pricing page must still pass
```

Record all output in `conductor/WEB-0004-InstallDocsReleaseVerification/review.md`.

---

## Step 14 — Manual browser smoke

For each of the 8 docs pages (index + 7 sub-pages):
- Desktop (1280px): hero renders, sections scroll without layout breaks, code
  blocks are readable, state pills show, disclosure notices render.
- Mobile (375px): nav links wrap, code blocks scroll horizontally or wrap, no
  text overflow.
- Keyboard: Tab reaches all links, focus ring visible.

Record evidence in review.md.

---

## Step 15 — ChangeGuard scan and final checks

```powershell
changeguard scan --impact
changeguard verify --scope fast
```

Commit pending ledger transactions with `ledgerful ledger commit <tx-id>
--summary '...' --reason '...'` before pushing.

---

## Step 16 — Close the track

1. Fill in `conductor/WEB-0004-InstallDocsReleaseVerification/review.md` with
   all evidence.
2. Update `conductor/conductor.md` — WEB-0004 status: Planned → Completed.
3. Update `docs/ToDo.md` — remove WEB-0004 open item; update last-reviewed.
4. Commit (intentional files only, no .env, no .next/).
5. Resolve any pending ChangeGuard ledger transactions.
6. Push.

---

## Claim Audit Checklist

Before closing, verify:

- [ ] No CLI command shown that does not exist in the current backend (Step 0)
- [ ] Rust toolchain prerequisite stated in CLI doc; rustup.rs referenced
- [ ] No release binary download URL published
- [ ] MCP package path has beta pill and release-pending disclosure notice
- [ ] MCP workspace/working directory requirement documented based on Step 0e
- [ ] GitHub Action YAML has version placeholder and beta pill
- [ ] GitHub Action YAML shows `${{ secrets.GITHUB_TOKEN }}`, not a hardcoded value
- [ ] Action permissions match Step 0c findings (include `checks: write` if confirmed)
- [ ] Action vs GitHub App distinction explicit in `/docs/github-action`
- [ ] Dashboard docs cover loopback boundary and token safety
- [ ] Dashboard port conflict resolution documented based on Step 0e findings
- [ ] SOC2 export described as local ZIP only; no hosted portal claim
- [ ] Compliance doc includes out-of-band public key verification warning
- [ ] Sync docs do not describe hosted transport or cross-org sync
- [ ] Sync doc includes concurrent write warning for network share users
- [ ] Windows hash command uses `Get-FileHash` (not `certutil`)
- [ ] Releases doc does not publish any unverified download URL
- [ ] All 11 check:docs assertions pass
- [ ] All check:trust, check:pricing, check:quiet-preview assertions still pass
- [ ] Desktop and mobile smoke recorded for each new page

---

## Open Questions (resolve in Step 0)

1. **Exact sync subcommands**: Does `ledgerful sync init` exist, or is the
   invocation different? Grep `src/cli/args.rs` in Step 0a.
2. **`ledgerful audit` command**: Confirm it produces a JSON-serializable output
   suitable for a support bundle. Grep in Step 0d.
3. **GitHub Action version tag**: Does a released version tag exist yet? Step 0c
   will confirm. If no tag exists, the `<version>` placeholder stays and is
   explicitly marked as a WEB-0005 launch fact.
4. **`cargo install` crates.io path**: Is `ledgerful` published on crates.io?
   The interim install path uses `--git` only; do not add a crates.io path
   without verification.
5. **MCP workspace context**: Does `ledgerful mcp` infer the project root from
   cwd, or does it require `--root`? Step 0e will confirm. MCP client config
   example must reflect the correct behavior.
6. **Dashboard port flag**: Does `ledgerful web` expose `--port` or a
   `config.toml` key for changing the bound port? Step 0e will confirm. Port
   conflict guidance in the dashboard doc must reflect what actually exists.
7. **GitHub Action `checks: write` permission**: Does the current or near-term
   `action.yml` use the GitHub Checks API? Step 0c will confirm. The permissions
   block in the example YAML must be accurate.
