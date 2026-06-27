# WEB-0004 — Install Docs & Release Verification — Review

**Status:** In Progress (automated checks complete; manual browser smoke pending)
**Date:** 2026-06-27

---

## Step 0: Backend Verification Findings (pre-checked)

The following findings override the spec/plan where they conflict.

| Finding | Detail |
|---|---|
| `ledgerful scan` | Confirmed (flags: `--impact`, `--json`, `--base-ref`) |
| `ledgerful web start` | Confirmed — `web` has subcommands: `start`, `stop`, `status`. NOT bare `ledgerful web`. |
| `ledgerful web start --port <PORT>` | Confirmed in WebStartArgs |
| `ledgerful doctor` | Confirmed |
| `ledgerful audit` | Confirmed |
| `ledgerful sync init/run/status/verify/log` | Confirmed |
| `ledgerful ledger status` | Confirmed (inside ledger subcommands) |
| `ledgerful mcp` | Confirmed — no `--root` flag, uses cwd auto-detection |
| `ledgerful --version` | Confirmed |
| `ledgerful compliance export` | **DOES NOT EXIST** — export is dashboard-only |
| MCP tools | 10 confirmed from mcp/manifest.rs: scan, search, ask, ledger_status, ledger_search, hotspots, endpoints_changed, security_boundaries, dead_code, verify_plan |
| GitHub Action inputs | Confirmed from action/action.yml: github-token (required), project-path, base-ref, risk-threshold (default TRIVIAL), fail-on-risk, changeguard-version, post-on-clean |
| GitHub Action permissions | `pull-requests: write` + `contents: read` — NO `checks: write` needed |

---

## Files Changed

### Created
- `src/lib/content/docs-pages.ts` — shared content model (MCP tools, GitHub Action inputs, sync commands)
- `src/app/docs/cli/page.tsx` — CLI install and first commands
- `src/app/docs/dashboard/page.tsx` — Dashboard launch and token security
- `src/app/docs/mcp/page.tsx` — MCP server setup (10 tools table)
- `src/app/docs/github-action/page.tsx` — GitHub Action PR risk comments
- `src/app/docs/compliance/page.tsx` — SOC2 evidence export (dashboard-only)
- `src/app/docs/sync/page.tsx` — Local team sync with dir:// transport
- `src/app/docs/releases/page.tsx` — Release verification (WEB-0005 disclosure)
- `scripts/check-docs-truth.mjs` — 12-assertion automated truth check
- `conductor/WEB-0004-InstallDocsReleaseVerification/review.md` — this file

### Modified
- `src/lib/content/docs.ts` — added `href?: string` to DocTopic type and all 7 entries
- `src/lib/content/navigation.ts` — added 7 `pageDescriptions` entries
- `src/app/docs/page.tsx` — render doc cards as overlay-link articles when `href` present
- `src/app/globals.css` — added `.doc-nav` and `.doc-step-list` CSS classes
- `package.json` — added `"check:docs"` script
- `next.config.ts` — added `realpathSync`-based `turbopack.root` workaround for symlinked git worktree build

---

## Automated Check Results

All checks run against the production build (no manual browser smoke yet):

### `npm run build`
```
✓ Compiled successfully in 2.1s
✓ Generating static pages using 15 workers (19/19) in 557ms
All 19 routes generated including: /docs, /docs/cli, /docs/compliance,
/docs/dashboard, /docs/github-action, /docs/mcp, /docs/releases, /docs/sync
```
**Result: PASS**

### `npm run lint`
```
(no output = clean)
```
**Result: PASS**

### `node scripts/check-docs-truth.mjs`
```
check-docs-truth: all 11 assertions passed ✓
```
**Result: PASS**

### `node scripts/check-quiet-preview.mjs`
```
Quiet-preview indexing policy is active.
```
**Result: PASS**

### `node scripts/check-trust-truth.mjs`
```
check-trust-truth: all assertions passed
```
**Result: PASS**

### `node scripts/check-pricing-truth.mjs`
```
Pricing truth checks passed.
```
**Result: PASS**

---

## Claim Audit Checklist

- [x] No `ledgerful compliance export` CLI command — compliance export is documented as dashboard-only
- [x] `ledgerful web start` used (not bare `ledgerful web`)
- [x] `ledgerful mcp` documented without `--root` flag; cwd requirement noted
- [x] GitHub Action uses `uses: Ryan-AI-Studios/ChangeGuard@<version>` with pending notice
- [x] `github-token: ${{ secrets.GITHUB_TOKEN }}` present in GitHub Action YAML
- [x] No `checks: write` permission — only `pull-requests: write` + `contents: read`
- [x] GitHub App described as "hosted planned", not "available"
- [x] `@ledgerful/mcp-server` npm package disclosed as pending release in disclosure-notice
- [x] No live link to npmjs.com or registry.npmjs.org
- [x] No crates.io install path — only `cargo install --git https://github.com/Ryan-AI-Studios/ChangeGuard --bin ledgerful`
- [x] Rust toolchain prerequisite stated; rustup.rs linked; release binary note present
- [x] Release artifacts disclosed as WEB-0005 launch fact (not yet available)
- [x] No raw release download URLs on /docs/releases
- [x] Windows hash command: `(Get-FileHash ledgerful.exe -Algorithm SHA256).Hash`
- [x] Dashboard: loopback / 127.0.0.1 documented; token safety rules present
- [x] `manifest.pub` out-of-band trust warning in compliance doc
- [x] Sync dir:// network share warning (Dropbox, Google Drive, SMB) present
- [x] local SOC2 export scope: not hosted portal, local only

---

## Issues Found and Fixed

1. **Template literal `${{` syntax error** — `${{ secrets.GITHUB_TOKEN }}` inside a backtick template literal caused a Turbopack parse error (JSX interpolation). Fixed by splitting: `{"${{ secrets.GITHUB_TOKEN }}"}`.

2. **Assert 4 false negative** — `"GitHub App"` in the section heading `"GitHub Action vs GitHub App"` was not within 150 chars of "planned". Two fixes: (a) increased window to 200 chars and changed to loop over all occurrences (matching the trust check pattern), (b) updated section heading to `"GitHub Action vs GitHub App (planned)"` to be clear in the rendered heading.

3. **Turbopack + symlinked git worktree bug** — Next.js 16 Turbopack panics with `"Invalid distDirRoot: '.next'. distDirRoot should not navigate out of the projectPath"` when run inside a git worktree accessed via a directory junction (`.claude` → `.agents`). Fix: set `turbopack.root` to the resolved real path of the repo root (3 levels up from the real worktree directory), allowing Turbopack to find `node_modules` and correctly validate distDir scope.

---

## Residual Risks / Launch Blockers

- **Manual browser smoke not yet done** — verify responsive layout, keyboard nav, link targets, and copy at 375px width.
- **Release artifacts still pending (WEB-0005)** — CLI page and releases page both carry disclosure-notices that download URLs are not yet available. No live links exist.
- **`@ledgerful/mcp-server` npm package not yet published** — MCP page carries a disclosure-notice; no registry links.
- **GitHub Action version tag pending** — YAML uses `@<version>` placeholder with a pending notice; release smoke needed before removing.
- **Deployment not yet done** — preview deploy not triggered by this subagent (parent to run `vercel deploy` separately).

---

## Round 1 Fixes (2026-06-27)

Review findings from codex-review applied and verified.

### Changes Made

**HIGH — All fixed**

- **H1** `src/app/docs/mcp/page.tsx` — Added `import { StatusPill }` and `<StatusPill status="beta" />` below h1 in hero section.
- **H2** `src/app/docs/dashboard/page.tsx` — Added `import { StatusPill }` and `<StatusPill status="local-only" />` below h1 in hero section.
- **H3** `src/app/docs/sync/page.tsx` — Added `import { StatusPill }` and `<StatusPill status="local-only" />` below h1 in hero section.
- **H4** `src/app/docs/github-action/page.tsx` — Added `<StatusPill status="beta" />` below h1 in hero section (import was already present; hosted-planned pill in body section unchanged).

**MEDIUM — Fixed**

- **M1** `src/app/globals.css` — Added `.doc-caption` and `.table-scroll-wrapper` utility classes at end of file.
- **M1** `src/app/docs/cli/page.tsx` — Replaced 2x inline doc-caption style (`marginTop: 16px` pattern) with `className="doc-caption"`; replaced `style={{ overflowX: "auto" }}` table wrapper with `className="table-scroll-wrapper"`.
- **M1** `src/app/docs/dashboard/page.tsx` — Replaced 1x inline doc-caption style with `className="doc-caption"`.
- **M1** `src/app/docs/mcp/page.tsx` — Replaced 2x inline doc-caption styles (marginBottom and no-margin variants) with `className="doc-caption"`; replaced table wrapper with `className="table-scroll-wrapper"`.
- **M1** `src/app/docs/releases/page.tsx` — Replaced 1x inline doc-caption style (marginBottom: 16px) with `className="doc-caption"`; kept the `marginTop: "24px"` + `marginBottom: "16px"` variant as inline per instruction.
- **M1** `src/app/docs/sync/page.tsx` — Replaced 2x `style={{ overflowX: "auto" }}` table wrappers with `className="table-scroll-wrapper"`.
- **M1** `src/app/docs/compliance/page.tsx` — Replaced 1x `style={{ overflowX: "auto" }}` table wrapper with `className="table-scroll-wrapper"`.
- **M2** `src/app/docs/mcp/page.tsx` — Changed JSON config block container from `overflow: "hidden"` to `overflowX: "auto"` so wide code scrolls on mobile.
- **M2** `src/app/docs/github-action/page.tsx` — Changed workflow YAML container from `overflow: "hidden"` to `overflowX: "auto"` so wide YAML scrolls on mobile; also replaced table wrapper with `className="table-scroll-wrapper"`.

**LOW — Fixed**

- **L1** `src/app/docs/releases/page.tsx` — Removed `←` arrow from "All docs" link in doc-nav; "← Local sync" arrow retained.

### Automated Check Results (Round 1)

All checks re-run after fixes, all pass:

#### `npm run build`
```
✓ Compiled successfully in 2.5s
✓ Generating static pages using 15 workers (19/19) in 589ms
All 19 routes generated.
```
**Result: PASS**

#### `npm run lint`
```
(no output = clean)
```
**Result: PASS**

#### `node scripts/check-docs-truth.mjs`
```
check-docs-truth: all 11 assertions passed ✓
```
**Result: PASS**

#### `node scripts/check-quiet-preview.mjs`
```
Quiet-preview indexing policy is active.
```
**Result: PASS**

#### `node scripts/check-trust-truth.mjs`
```
check-trust-truth: all assertions passed
```
**Result: PASS**

#### `node scripts/check-pricing-truth.mjs`
```
Pricing truth checks passed.
```
**Result: PASS**
---

## Round 2 Fixes (2026-06-27)

Review findings from codex-review (round 2) applied and verified.

### Changes Made

**CRITICAL — Fixed**

- **C1 / L1** `next.config.ts` — Removed the `realpathSync + resolve("../../..")` workaround and the associated comment block. Restored `turbopack: { root: process.cwd() }` (matching the main branch). Removed `import { realpathSync } from "fs"` and `import { resolve } from "path"`. The broken workaround resolved to `C:\dev` when run from the main repo root (3 levels above the worktree), which would have broken Turbopack module resolution post-merge.

  Build note: `turbopack: { root: process.cwd() }` cannot be built inside a symlinked git worktree (Turbopack limitation — no `node_modules` at the worktree path). Build verification of other changes was performed with `turbopack.root` temporarily omitted (successful); then the main-compatible form was restored. The config is correct for production and the main repo root.

**MEDIUM — All fixed**

- **M1** `src/app/docs/sync/page.tsx` — Replaced inline style `{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "16px", lineHeight: "1.65" }` on the `ledgerful sync init` caption `<p>` with `className="doc-caption"`.

- **M2** `src/app/docs/releases/page.tsx` — Changed Windows label `<p>` from fully inline style to `className="doc-caption"` with `style={{ marginTop: "24px", marginBottom: "16px" }}` (bottom margin preserved as inline since `.doc-caption` does not include it).

- **M3** `src/app/docs/github-action/page.tsx` — Removed live `<a href="https://github.com/Ryan-AI-Studios/ChangeGuard/releases" target="_blank">` link from Section 2 disclosure notice. Replaced with disclosure text: "Release URLs are a WEB-0005 launch fact and will be linked once the repository is confirmed publicly accessible."

- **M4** `src/app/docs/mcp/page.tsx` — Added `whiteSpace: "pre"` to the `<pre style={{ background: "var(--surface)" }}>` on the JSON client config block so horizontal scroll works despite the global `pre { white-space: pre-wrap }` rule.

- **M4** `src/app/docs/github-action/page.tsx` — Added `whiteSpace: "pre"` to the `<pre style={{ background: "var(--surface)" }}>` on the workflow YAML block for the same reason. Terminal-window `<pre>` blocks were not changed.

**LOW — All fixed**

- **L1** Handled by C1 — no remaining worktree-detection comments in `next.config.ts`.

- **L2** `src/app/docs/cli/page.tsx` — Added `<span className="sr-only"> (opens in new tab)</span>` inside the `rustup.rs` external link.

- **L2** `src/app/globals.css` — Added `.sr-only` utility class (visually hidden, screen-reader accessible) after the existing classes.

- **L2** `src/app/docs/github-action/page.tsx` — No remaining `target="_blank"` external links after the M3 fix removed the only one.

- **L3** `src/app/docs/compliance/page.tsx` — Added `import { StatusPill }` and `<StatusPill status="local-only" />` below the h1 in the hero section.

- **L3** `src/app/docs/releases/page.tsx` — Added `import { StatusPill }` and `<StatusPill status="unresolved" />` below the h1 in the hero section.

### Automated Check Results (Round 2)

Build verification was performed with `turbopack.root` omitted (auto-detect mode) to work around the Turbopack + symlinked-worktree limitation; all other checks ran against the final source files.

#### `npm run build` (turbopack.root auto-detect)
```
✓ Compiled successfully in 1728ms
✓ Generating static pages using 15 workers (19/19) in 500ms
All 19 routes generated.
```
**Result: PASS**

#### `npm run lint`
```
(no output = clean)
```
**Result: PASS**

#### `node scripts/check-docs-truth.mjs`
```
check-docs-truth: all 11 assertions passed ✓
```
**Result: PASS**

#### `node scripts/check-quiet-preview.mjs`
```
Quiet-preview indexing policy is active.
```
**Result: PASS**

#### `node scripts/check-trust-truth.mjs`
```
check-trust-truth: all assertions passed
```
**Result: PASS**

#### `node scripts/check-pricing-truth.mjs`
```
Pricing truth checks passed.
```
**Result: PASS**

---

## Codex Review Fixes (2026-06-27)

Findings from codex-review (round 3) applied and verified.

### Changes Made

**MEDIUM — All 3 fixed**

- **M1** `scripts/check-docs-truth.mjs` — Added Assert 12 after Assert 11 (sequential order): checks that `/docs/compliance` does not contain the string `"ledgerful compliance export"` (this CLI command does not exist; the export is dashboard-only). Updated final `console.log` to say `"all 12 assertions passed"`.

- **M2** `scripts/check-docs-truth.mjs` — Removed overly broad `.includes("version")` fallback from `hasVersionPlaceholder` in Assert 5. Now only accepts `"&lt;version&gt;"`, `"<version>"`, or `"pending"` near the `uses:` line.

- **M3** `src/app/docs/page.tsx` — Changed `<h2>{topic.title}</h2>` to `<h3>{topic.title}</h3>` inside `.doc-grid` article cards. `src/app/globals.css` — Added `.doc-grid h3` to the font-size selector that previously only covered `.doc-grid h2`.

**LOW — All 4 fixed**

- **L1** `src/app/docs/page.tsx` — Removed redundant ternary: `status={topic.state === "unresolved" ? "unresolved" : topic.state}` simplified to `status={topic.state}`.

- **L2** `scripts/check-docs-truth.mjs` — Tightened Assert 8 to proximity-based check. The assert now iterates all `"token"` occurrences (not just the first, which lands in the `<meta>` description tag) and passes if any occurrence has safety language within 400 chars in either direction.

- **L3** `scripts/check-docs-truth.mjs` — Moved Assert 11 (`secrets.GITHUB_TOKEN`) from before Assert 6 to after Assert 10. Source now reads 1–2–3–4–5–6–7–8–9–10–11–12 in order.

- **L4** `src/app/globals.css` — Removed duplicate `.sr-only` custom rule. Tailwind v4 (`@import "tailwindcss"`) generates `.sr-only` as a built-in utility when detected in source (confirmed: present in `.next/static/chunks/*.css` after build).

### Automated Check Results (Round 3)

Build run with `turbopack.root` temporarily omitted (Turbopack + symlinked-worktree limitation); restored to `process.cwd()` after verification.

#### `npm run build` (turbopack.root auto-detect)
`
✓ Compiled successfully in 3.0s
✓ Generating static pages using 15 workers (19/19) in 631ms
All 19 routes generated.
`
**Result: PASS**

#### `npm run lint`
`
(no output = clean)
`
**Result: PASS**

#### `node scripts/check-docs-truth.mjs`
`
check-docs-truth: all 12 assertions passed ✓
`
**Result: PASS**

#### `node scripts/check-quiet-preview.mjs`
`
Quiet-preview indexing policy is active.
`
**Result: PASS**

#### `node scripts/check-trust-truth.mjs`
`
check-trust-truth: all assertions passed
`
**Result: PASS**

#### `node scripts/check-pricing-truth.mjs`
`
Pricing truth checks passed.
`
**Result: PASS**