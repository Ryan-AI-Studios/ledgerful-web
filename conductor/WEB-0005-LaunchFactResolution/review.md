# WEB-0005-LaunchFactResolution — Review

Date: 2026-06-27
Status: In Progress — gated phases blocked; ungated phases complete

---

## What Was Implemented

### Phase A (completed)
- **A1** — `src/app/sitemap.ts`: extended with 7 explicit `/docs/*` sub-page entries (`/docs/cli`, `/docs/dashboard`, `/docs/mcp`, `/docs/github-action`, `/docs/compliance`, `/docs/sync`, `/docs/releases`), each at `priority: 0.7` and `changeFrequency: "monthly"`. Sitemap now has 12 total URLs. Verified in `.next/server/app/sitemap.xml.body`.

### Phase C (partial — only for passed gates)
- **C1** — `src/app/docs/github-action/page.tsx`: disclosure notice updated to include the live GitHub repository URL (`github.com/Ryan-AI-Studios/ChangeGuard/releases`) in place of "will be linked once the repository is confirmed publicly accessible."
- **C1** — `src/app/trust/page.tsx`: GitHub repository link (`github.com/Ryan-AI-Studios/ChangeGuard`) added to the responsible disclosure section.
- **C5** — `src/app/trust/page.tsx`: new Section 10 ("License") added with MIT License statement, link to the LICENSE file, and the repo URL. Section 11 renumbered from old Section 10.

### launch-facts.ts updates
- `"Canonical GitHub repository"`: changed from `"unresolved"` to `"resolved"`, value and href set to `https://github.com/Ryan-AI-Studios/ChangeGuard`.
- `"License wording"`: changed from `"unresolved"` to `"resolved"`, value set to `"MIT License"`, href to the LICENSE file.

### conductor.md
- WEB-0005 status changed from `Planned` to `In Progress`.

---

## Phase B Gate Verdicts

### B1 — GitHub repository public access — PASSED

```
curl -sI https://github.com/Ryan-AI-Studios/ChangeGuard
Result: HTTP/1.1 200 OK
```

```
git ls-remote https://github.com/Ryan-AI-Studios/ChangeGuard.git HEAD
Result: ee702d481a3cb870f39b378170625a2bc054ba13  HEAD
```

Anonymous HTTP access and git transport both confirmed. Repository is publicly accessible.

### B2 — Tagged release and binaries — UNRESOLVED

```
gh release list --repo Ryan-AI-Studios/ChangeGuard --limit 5
Result: (no output — no releases found)
```

No tagged releases exist. Release download links, CLI binary docs, and GitHub Action version tag cannot be updated. Docs/releases, docs/cli, and docs/github-action version placeholder remain as-is.

### B3 — npm package — UNRESOLVED

```
npm view @ledgerful/mcp-server version
Result: npm error 404 Not Found — package not published
```

`@ledgerful/mcp-server` is not in the public npm registry. MCP install docs remain with the "pending release" disclosure. The `check-docs-truth.mjs` Assert 2 and Assert 3 remain valid.

### B4 — Responsible disclosure channel — UNRESOLVED

```
curl -sI https://raw.githubusercontent.com/Ryan-AI-Studios/ChangeGuard/main/SECURITY.md
Result: HTTP/1.1 404 Not Found
```

No SECURITY.md found in the repository. No verified security contact or PGP key exists. Trust page responsible disclosure section remains with "channel not yet published" notice. Do not send vulnerability reports.

### B5 — License wording — PASSED

```
curl -s https://raw.githubusercontent.com/Ryan-AI-Studios/ChangeGuard/main/LICENSE
Result: HTTP/1.1 200 OK
Content: MIT License, Copyright (c) 2026 UnlikelyKiller
```

MIT License confirmed. `launch-facts.ts` updated. MIT License section added to trust page.

### B6 — Status page decision — AWAITING USER DECISION

No decision recorded. Options:
- **Option A:** Publish a status surface and set `launch-facts.ts` "Status page" to `"resolved"`.
- **Option B:** Decide no status page at v1. Set `launch-facts.ts` "Status page" to `"planned"` with a note.

Both options fully resolve this launch fact. Option B requires only a launch-facts.ts update with no page changes. **User must decide before track can close.**

---

## Phase D Status — SKIPPED (blocked)

Phase D (exit quiet preview) requires all of B1–B5 to pass. B2, B3, and B4 are unresolved.

The following remain unchanged:
- `src/app/robots.ts` — still has `disallow: "/"` (quiet preview active)
- `src/app/layout.tsx` — still has `robots: { index: false, follow: false }` block
- No `check-launch-policy.mjs` created
- Truth scripts not inverted (`check-docs-truth.mjs` Assert 1, `check-pricing-truth.mjs` noindex assertion, `check-trust-truth.mjs` Assert 1 all remain unchanged)

---

## Build and Lint Results

### npm run build — PASSED

Build environment note: The worktree at `.claude/worktrees/agent-a322ae49dcf704d41` is nested inside the main Next.js project directory. Turbopack panics with "Invalid distDirRoot" when `turbopack.root: process.cwd()` is set in a nested context. Build was verified with `turbopack.root` temporarily removed. `next.config.ts` was restored to original state after verification.

Build output (with turbopack.root removed temporarily):

```
▲ Next.js 16.2.9 (Turbopack)
✓ Compiled successfully in 2.0s
✓ Generating static pages using 15 workers (19/19) in 663ms
```

All 19 routes generated including `/sitemap.xml`. Sitemap verified to contain all 12 URLs.

### npm run lint — PASSED

```
> ledgerful-web@0.1.0 lint
> eslint
(no errors)
```

### Truth scripts (Phase D not executed — noindex still active)

```
node scripts/check-docs-truth.mjs     → check-docs-truth: all 12 assertions passed ✓
node scripts/check-pricing-truth.mjs  → Pricing truth checks passed.
node scripts/check-trust-truth.mjs    → check-trust-truth: all assertions passed
```

Note: `check-launch-policy.mjs` does not exist yet (created in Phase D after quiet preview exit).

---

## Open Items (remaining blockers)

| Item | Blocked on | Required action |
|---|---|---|
| Release download links in docs/releases, docs/cli, docs/github-action | B2 — no tagged release | Publish v0.x.y release with binaries and checksums, re-run B2 verification |
| MCP npm install docs | B3 — npm package not published | Publish `@ledgerful/mcp-server` to npm, re-run B3 verification |
| Responsible disclosure channel (trust page + launch-facts) | B4 — no SECURITY.md or security email | Add SECURITY.md to ChangeGuard repo or establish `security@ledgerful.dev`, re-run B4 verification |
| Status page | B6 — awaiting user decision | User must choose Option A or Option B |
| Exit quiet preview (robots.ts, layout.tsx, check-launch-policy.mjs) | All above | Close B2, B3, B4, and B6 first |
| Invert truth script noindex assertions | Phase D | Must happen immediately before removing noindex in layout.tsx |

---

## Residual Risks

- **Turbopack nested-worktree build issue:** The production build cannot be run from the worktree due to Turbopack's detection of nested lockfiles. Build must be re-verified from the main project after merge. This is an environment issue, not a code issue.
- **check-docs-truth.mjs Assert 5:** When a real version replaces `<version>` in the GitHub Action YAML (after B2), Assert 5 in `scripts/check-docs-truth.mjs` must be inverted from checking for a version placeholder to checking for a real semver tag. See plan.md "Change Log" section.
- **noindex inversion order:** When Phase D is executed, D4 (invert truth script assertions) must happen BEFORE D2 (remove noindex from layout.tsx) or all three truth scripts will fail. The plan enforces this order.
