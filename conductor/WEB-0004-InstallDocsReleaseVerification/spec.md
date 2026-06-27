# WEB-0004-InstallDocsReleaseVerification Spec

## Objective

Replace the 7-card docs index placeholder at `/docs` with a linked set of
install and quickstart doc pages covering every public product surface — scoped
strictly to what is verifiably available, beta, or local-only today, with
release-blocked items clearly labelled and linked release URLs deferred to
WEB-0005.

## Problem

The current `/docs` page renders a grid of topic cards, each with a state pill
and a "next action" sentence. A developer landing on it cannot install
Ledgerful, launch the dashboard, configure an MCP client, or add the GitHub
Action to a workflow — everything is a placeholder. WEB-0004 turns those
placeholders into real quickstart docs.

## Source Authority

- `C:\dev\Roadmap.md` — Phase 1 web install-page requirements.
- `AGENTS.md` — content rules, feature states, truth gate, contracts block.
- `C:\dev\ChangeGuard\conductor\conductor.md` — M4 (GitHub Action, Completed),
  M10 (MCP package, Implementation Complete; release-blocked), M9 (binary
  renamed to `ledgerful`).
- `C:\dev\ChangeGuard\docs\Frontend-Notes.md` — daemon defaults, token model,
  E3 SOC2 export, sync transport.
- `C:\dev\ledgerful-frontend\docs\Backend-Notes.md` — dashboard API contracts.

## Feature State Baseline

| Surface | State | Source |
|---|---|---|
| `ledgerful` binary and CLI | available | M9 name landed; release artifacts not yet smoke-tested |
| Local dashboard (`ledgerful web`) | local-only | Daemon at 127.0.0.1:52001, ephemeral token |
| MCP stdio server (`ledgerful mcp`) | available | 10 tools implemented; public npm package release-blocked |
| `@ledgerful/mcp-server` npm package | beta | M10 implementation complete; blocked on tagged release |
| GitHub Action (PR risk comments) | beta | M4 Completed, real PR #3 validated; release tag pending |
| SOC2 evidence export | local-only | `ledgerful compliance export` implemented |
| Local team sync | local-only | `dir://` transport, signed/encrypted bundles |
| Release artifacts and checksums | unresolved | WEB-0005 launch fact — no live tagged release yet |
| `cargo install` from source | available | Works but is not the primary distribution path |

## Requirements

### R1 — Route structure

Create the following pages in addition to the existing `/docs` index:

```
/docs                      → updated index with links to sub-pages
/docs/cli                  → CLI install and first commands
/docs/dashboard            → Dashboard launch and token security
/docs/mcp                  → MCP server setup
/docs/github-action        → GitHub Action PR risk comments
/docs/compliance           → SOC2 evidence export
/docs/sync                 → Local team sync
/docs/releases             → Release verification and support bundle
```

Every sub-page must:
- Use the same `<PageShell>`, hero, `<SectionHeading>` patterns as other pages.
- Include correct `<Metadata>` (title, description, canonical).
- Inherit the site-wide noindex from the root layout (quiet preview policy).
- Be reachable from the `/docs` index.

### R2 — /docs index update

Update `src/app/docs/page.tsx` and `src/lib/content/docs.ts`:
- Extend `DocTopic` with an optional `href: string` field pointing to the sub-page.
- Add `href` to each of the 7 topic entries.
- Update the page to render each card as a link (`<a>` or Next.js `<Link>`) when
  `href` is present.
- Update topic summaries to match what the linked pages actually contain.

### R3 — CLI doc (`/docs/cli`)

Sections:
1. **Prerequisites** — git, supported OS (Windows, macOS, Linux). The source
   install path requires a Rust toolchain (`rustc` and `cargo`); state this
   explicitly and link to rustup.rs. Reference the `ledgerful doctor` command
   for system health. State that release binary downloads are a WEB-0005 launch
   fact with a `disclosure-notice` (no Rust toolchain required for release
   binaries once published).
2. **Install from source (interim)** — `cargo install --git
   https://github.com/Ryan-AI-Studios/ChangeGuard --bin ledgerful`. Mark as
   "available — not the primary distribution path; use release binaries once
   published." Do not invent a Homebrew tap or package manager path.
3. **Verify install** — `ledgerful --version` and `ledgerful doctor`.
4. **First scan** — `ledgerful scan` and reading the output.
5. **Ledger status** — `ledgerful ledger status --compact`.
6. **Next steps** — links to Dashboard, MCP, GitHub Action docs.

Truth boundaries: do not publish a release binary download URL. Do not publish
a `cargo install` crate path (`ledgerful` on crates.io) unless that is
verified. The git-based source install is acceptable as an interim path.

### R4 — Dashboard doc (`/docs/dashboard`)

Sections:
1. **Start the daemon** — `ledgerful web`. Default port: `52001`. Explain that
   the daemon serves the embedded dashboard at `http://127.0.0.1:52001`.
   Add a note on port conflicts: if `52001` is already in use, document the
   resolution path (e.g., `--port` flag or `config.toml` setting if available;
   verify in Step 0a before authoring — if no flag exists, direct the user to
   stop the conflicting service or configure the port via `config.toml`).
2. **Dashboard access** — The launch command opens the browser with an
   ephemeral `?token=<session-token>` URL. State the token is high-entropy,
   per-session, and is not persisted. Warn that the token must not appear in
   browser history exports, bug reports, or screenshots.
3. **Loopback boundary** — CORS is restricted to `localhost`/`127.0.0.1`. The
   dashboard is not accessible from remote machines without explicit tunnelling,
   which is not supported or recommended.
4. **Multiple projects** — `ledgerful web --root <path>` or the `projects`
   section in the dashboard. Mention validation warnings for sibling projects.
5. **Hosted future** — the local daemon is not a hosted SaaS backend. Hosted
   team workspaces, GitHub App, billing, and SSO require a future control
   plane — all hosted planned.

### R5 — MCP doc (`/docs/mcp`)

Sections:
1. **What the MCP server does** — 10 read-only tools (scan, search, ask,
   ledger_status, ledger_search, hotspots, endpoints_changed,
   security_boundaries, dead_code, verify_plan) exposed over stdio.
2. **State badge** — Prominently show beta status + "Release smoke pending"
   caveat. State that `@ledgerful/mcp-server` is implementation-complete but
   the npm package is release-blocked until a tagged GitHub release and live
   download smoke exist.
3. **Local stdio path (available now)** — The MCP server can be used today by
   running `ledgerful mcp` directly. Show the command and the generic MCP
   client config pattern:
   ```json
   {
     "mcpServers": {
       "ledgerful": {
         "command": "ledgerful",
         "args": ["mcp"]
       }
     }
   }
   ```
   Clarify workspace context: state whether the MCP server infers the project
   root from the current working directory (so the MCP client must launch it
   from the repo root), or whether an explicit `--root <path>` argument is
   needed. Verify in Step 0e before authoring. If `--root` is required, the
   config example must include it; if the cwd is used, document that the MCP
   client must be configured to start the server from the target repo's root.
4. **npm package path (beta — release pending)** — Show the intended one-line
   install path `npx @ledgerful/mcp-server` with a `disclosure-notice` stating
   it is not yet published. Do not link a registry URL that does not exist.
5. **Claude Code config** (local binary path example)
6. **Generic MCP client config** — JSON snippet using the local binary.
7. **Tool list** — Name and brief description of all 10 tools. State they are
   read-only; no mutations are made to the repository.
8. **Security note** — MCP tools read local project state; ensure only trusted
   AI agents are configured with this server.

### R6 — GitHub Action doc (`/docs/github-action`)

Sections:
1. **What it does** — Posts a formatted risk-analysis comment on every PR via
   `ledgerful scan --impact --json`. Updates the same comment on each push.
   Provides risk level, temporal couplings, pending ledger transactions, and
   predicted CI failures.
2. **State badge** — Beta. M4 is Completed and validated on a real PR. The
   action's release tag is a WEB-0005 launch fact; show the YAML with a
   placeholder version tag and a `disclosure-notice`.
3. **Example workflow YAML** — Complete `.github/workflows/ledgerful.yml`
   example. Use `uses: Ryan-AI-Studios/ChangeGuard@<version>` with `<version>`
   visibly marked as "pending release" in a comment or caveat. The
   `github-token` input must be shown as `${{ secrets.GITHUB_TOKEN }}` in the
   YAML — never as a hardcoded value or PAT placeholder.
4. **Required permissions** — `pull-requests: write`, `contents: read`. Note
   that if the action is updated to use the GitHub Checks API (creating check
   runs on the PR), `checks: write` will also be required; verify the current
   `action.yml` in Step 0c to determine the correct set for the published docs.
5. **Inputs** — `github-token` (required), `risk-threshold` (optional,
   defaults to `medium`), `fail-on-risk` (optional, defaults to `false`).
6. **Action vs hosted GitHub App distinction** — Explicitly state:
   - The GitHub Action is self-managed and runs in the repository's CI.
   - A hosted GitHub App (webhook, org-level install, check runs) is a
     separate future capability and requires a control plane — hosted planned.
   - Do not conflate the two in the docs.
7. **Branch protection** — How to use `fail-on-risk: true` and
   `risk-threshold` to gate merges.

### R7 — Compliance doc (`/docs/compliance`)

Sections:
1. **Run the export** — `ledgerful compliance export`. Output is a ZIP file.
2. **What is in the export** — table matching the E3 ZIP layout from
   `Frontend-Notes.md` (manifest.json, manifest.sig, manifest.pub, ledger.csv,
   verification_history.csv, adr/*.md). Cross-link to `/trust` for detailed
   tamper-verification steps.
3. **Dashboard export** — The dashboard compliance page provides a download
   button for the same export. Reference the `/compliance` route in the
   dashboard.
4. **Scope** — This is a local ZIP export using local evidence only. It is not
   a hosted SOC2 portal and does not involve a third-party auditor.
5. **Using the export** — Brief guidance on what a security reviewer or auditor
   can do with the ZIP (share the ZIP, verify tamper evidence offline, map
   entries to AICPA TSP 100 controls). Cross-link to `/trust` for the offline
   verification steps.
   Add a security callout: the `manifest.pub` (verifying key) shipped inside
   the ZIP cannot self-authenticate. A recipient who receives only the ZIP
   cannot rule out an attacker who generated a fake ZIP with their own keys and
   replaced `manifest.pub` to match. To be meaningful, the expected public key
   must be verified against a trusted out-of-band channel (e.g., the project's
   GitHub release page or a published key fingerprint) before the tamper check
   is run. Document this limitation explicitly.
6. **Hosted SOC2 portal** — enterprise planned; not available until a hosted
   control plane with retained audit state exists.

### R8 — Sync doc (`/docs/sync`)

Sections:
1. **What team sync does** — shares signed/encrypted ledger bundles across
   team members via a shared local directory (`dir://` transport). No cloud
   dependency; no source code in the bundles.
2. **State badge** — local-only. Foundation implemented. Hosted sync transport
   is hosted planned.
3. **Setup** — `ledgerful sync init`, device identity, `dir://` path
   configuration, first export.
4. **Routine workflow** — export, share/copy bundle, import.
5. **What is in a sync bundle** — signed/encrypted ledger delta. No source
   code, no file content, no diff text.
6. **Recovery** — guidance on lost sync secret, device rotation, and when to
   re-initialize.
7. **Concurrent write warning** — Add a callout for teams who map `dir://` to
   a shared network drive, Dropbox, or similar: naive network shares with
   simultaneous writes from multiple developers can cause file-locking conflicts
   or silently corrupt sync bundles. Ledgerful does not implement distributed
   locking over `dir://`. Teams using a network share should coordinate writes
   (one export at a time) or use a dedicated sync directory on a local path
   that is then shared via versioning. Hosted sync transport (with proper
   conflict resolution) is hosted planned.
8. **Hosted sync** — hosted planned; will require a control plane for
   cloud/S3/WebDAV transport.

Truth boundary: Do not describe hosted transport, org partitioning, PR/ticket
sync, or multi-org semantics — those were explicitly out of scope for the M0
sync foundation.

### R9 — Releases doc (`/docs/releases`)

Sections:
1. **Release artifacts** — Explain what is included: platform binaries,
   `.sha256` checksum files, npm MCP package. State that specific download
   URLs are a WEB-0005 launch fact with a `disclosure-notice`.
2. **Verify a binary (process)** — The conceptual steps:
   - Download binary and companion `.sha256` file from the release page.
   - Run `sha256sum -c ledgerful.sha256` (Linux/macOS) or
     `(Get-FileHash ledgerful.exe -Algorithm SHA256).Hash` (Windows PowerShell,
     preferred over `certutil` — outputs a single clean hash string for easy
     comparison).
   - Compare to the published hash. `OK` / matching hash means untampered.
3. **OS code signing** — Windows Authenticode and macOS Developer ID
   notarization are planned; not yet implemented. State explicitly.
4. **SLSA provenance** — planned for enterprise-readiness follow-up.
5. **Support bundle** — `ledgerful audit --json` and `ledgerful doctor` output
   capture guidance for filing issues. What to redact (tokens, private keys,
   internal directory paths if sensitive) before sharing.
6. **Reporting issues** — Reference `/trust` for the responsible disclosure
   channel (unresolved launch fact).

### R10 — Content model

Create `src/lib/content/docs-pages.ts`:

```typescript
export type DocSection = {
  heading: string;
  body: string | null; // null for template/placeholder sections
};

export type CodeBlock = {
  lang: string;
  code: string;
  caption?: string;
};

export type DocNavLink = {
  label: string;
  href: string;
};
```

Each doc page should import from a shared minimal content model or define
inline constants for code snippets, step lists, and tool tables.

Keep code snippets accurate. Do not invent command flags or options that do
not exist in the current backend. Verify all commands against the ChangeGuard
source or conductor notes before authoring content.

### R11 — Automated truth check

Create `scripts/check-docs-truth.mjs`. Check the rendered HTML for each of the
7 sub-pages:

Assertions across all pages:
1. noindex meta tag is active on every page.

Assertions for `/docs/mcp`:
2. "release" or "pending" appears near any `@ledgerful/mcp-server` mention.
3. A registry URL (`npmjs.com`, `registry.npmjs.org`) does not appear as a
   live link (only the intended command, not a verified registry link).

Assertions for `/docs/github-action`:
4. "GitHub App" is absent OR appears with "planned" nearby — not conflated
   with the self-managed Action.
5. The action version placeholder (e.g., `<version>` or `pending`) appears
   near the `uses:` YAML line, OR no `@v\d` tag is present without a caveat.
11. `secrets.GITHUB_TOKEN` (or `${{ secrets.GITHUB_TOKEN }}`) is present in
    the page — ensuring the example always demonstrates secure token handling,
    not a hardcoded value or PAT placeholder.

Assertions for `/docs/cli`:
6. "release binary" or "release artifact" language appears, alongside a note
   that it is a launch fact OR is not yet available.

Assertions for `/docs/dashboard`:
7. "loopback" or "127.0.0.1" appears (daemon access boundary).
8. "token" appears with a safety warning (ephemeral, not in logs).

Assertions for `/docs/compliance`:
9. "local" appears near "SOC2" or "export" — not described as a hosted portal.

Assertions for `/docs/releases`:
10. Release download URLs are absent OR explicitly marked as pending/launch
    facts.

Add `"check:docs": "npm run build && node scripts/check-docs-truth.mjs"` to
`package.json`. The script must run all 11 assertions and exit 1 on any
failure.

## Page Layout Patterns

Each doc sub-page follows this structure:

```
[Hero compact]
  kicker: "Docs"
  h1: "<Topic> for Ledgerful"

[Content sections]
  SectionHeading with numbered or thematic sections
  Code blocks in <pre><code> or a CodeBlock component
  Status pills where state matters
  Disclosure notices for WEB-0005 launch facts

[Bottom nav]
  Links to previous/next doc pages or back to /docs
```

### Code block component

Consider adding a shared `<DocCodeBlock>` component:
```tsx
// props: lang, code, caption?, state?: FeatureState
// renders <pre><code> with copy-button affordance and optional state pill
```

### Disclosure notice reuse

Reuse the `.disclosure-notice` class added in WEB-0003 for all WEB-0005
release-fact callouts. Avoid duplicating styles.

## Styles

Reuse existing classes: `.content-band`, `.disclosure-notice`, `.trust-table`,
`.pricing-footnotes`, `code` inline.

New classes (add only if needed):
- `.doc-nav` — bottom previous/next navigation strip
- `.doc-step-list` — numbered step list with counter styling distinct from
  `<ol>` defaults
- `.doc-tool-table` — tool name/description table for the MCP tools list

## Definition of Done

- All 7 `/docs/*` sub-pages render without TypeScript errors.
- `/docs` index links to all 7 sub-pages.
- `npm run build` passes (12 static pages → 20 static pages).
- `npm run lint` passes.
- `node scripts/check-docs-truth.mjs` — all 11 assertions pass.
- `node scripts/check-quiet-preview.mjs` — noindex still active.
- `changeguard scan --impact` current.
- `changeguard verify --scope fast` passes.
- No CLI command shown that does not exist in the current backend.
- No release download URL published without verification.
- MCP package path shown only with beta + release-pending caveat.
- GitHub Action YAML shown only with beta + version-pending caveat.
- Action vs GitHub App distinction explicit in the GitHub Action doc.
- Dashboard token handling covered with ephemeral/loopback safety rules.
- SOC2 export described as local ZIP only; no hosted portal claim.
- Desktop (1280px) and mobile (375px) browser smoke recorded for each new page.
- Keyboard navigation checked for new interactive elements (copy buttons,
  navigation links).
- Review has no open critical or high findings.
- `conductor/conductor.md` and `.agents/plan.md` updated to Completed.
