# WEB-0005-LaunchFactResolution — Plan

Status: In Progress

Each step below is ordered by dependency. Tasks marked **[not gated]** can be
done in any session without waiting for external evidence.

---

## Phase A — Non-Gated Web Tasks

These can be done immediately and do not require backend release evidence.

### A1 — Extend the sitemap [not gated]

File: `src/app/sitemap.ts`

Add explicit entries for all 7 `/docs/*` sub-pages after the `mainNavigation`
map. Use `priority: 0.7` and `changeFrequency: "monthly"`.

```ts
const docRoutes = [
  "/docs/cli",
  "/docs/dashboard",
  "/docs/mcp",
  "/docs/github-action",
  "/docs/compliance",
  "/docs/sync",
  "/docs/releases",
];
```

Verification: `npm run build && node -e "console.log('sitemap OK')"` — confirm
`.next/server/app/sitemap.xml.body` contains `/docs/cli` etc.

- [x] A1 done — sitemap extended with 7 /docs/* routes (2026-06-27)

---

## Phase B — External Verification (per gate)

Confirm each fact against live external evidence before updating any web content.
Record the evidence (URL, version, curl output) in `review.md`.

### B1 — Verify GitHub repository public access (Gate 1)

```sh
# Verify web UI is public (follow redirects to final 200)
curl -IL https://github.com/Ryan-AI-Studios/ChangeGuard
# Expect: final HTTP 200 (not 404 or redirect-to-login)

# Verify anonymous git transport works (proves developers can clone without auth)
git ls-remote https://github.com/Ryan-AI-Studios/ChangeGuard.git HEAD
# Expect: a commit SHA printed, no authentication prompt
```

Also verify in an incognito/private browser window: repo is visible without
login, README is present.

- [x] B1 evidence recorded in review.md (curl final status: HTTP 200, git ls-remote SHA: ee702d481a3cb870f39b378170625a2bc054ba13)
- [x] `launch-facts.ts` "Canonical GitHub repository" → `"resolved"` with URL

### B2 — Verify tagged release and binaries (Gate 2)

```sh
# List releases
gh release list --repo Ryan-AI-Studios/ChangeGuard --limit 5

# Verify download URLs are public (use -IL to follow GitHub's CDN redirect)
curl -IL https://github.com/Ryan-AI-Studios/ChangeGuard/releases/download/<tag>/ledgerful-linux-x64
curl -IL https://github.com/Ryan-AI-Studios/ChangeGuard/releases/download/<tag>/ledgerful-linux-x64.sha256
# Expect: final HTTP 200 from objects.githubusercontent.com (302 alone is not enough)
```

- [ ] B2 evidence recorded: tag name, binary names, curl final status, sha256sum OK — **UNRESOLVED: no releases found as of 2026-06-27**
- [ ] `launch-facts.ts` "Release downloads and checksums" → `"resolved"`
- [ ] `launch-facts.ts` "GitHub Action install URL" → `"resolved"` once action tag confirmed

### B3 — Verify npm package (Gate 3)

```sh
npm view @ledgerful/mcp-server version
npm view @ledgerful/mcp-server dist-tags
```

Expect a published version string without error. Optionally do a dry-run
install in a temp dir to confirm `npx` works.

- [ ] B3 evidence recorded: version string — **UNRESOLVED: npm 404 as of 2026-06-27**
- [ ] `launch-facts.ts` "MCP registry or npm package" → `"resolved"`

### B4 — Confirm responsible disclosure contact (Gate 4)

Record:
- The security contact email address.
- Location of PGP public key (e.g. keys.openpgp.org, a `/security.txt`, or
  inline on the trust page).
- Policy: standard 90-day coordinated disclosure unless otherwise stated.

- [ ] B4 evidence recorded: email, key location — **UNRESOLVED: SECURITY.md not present in repo as of 2026-06-27**
- [ ] `launch-facts.ts` "Responsible disclosure channel" → `"resolved"`

### B5 — Confirm license wording (Gate 5)

Read `LICENSE` or `README` in the `Ryan-AI-Studios/ChangeGuard` repository.
Note the exact SPDX identifier or descriptive license name.

- [x] B5 evidence recorded: MIT License — LICENSE file confirmed at https://raw.githubusercontent.com/Ryan-AI-Studios/ChangeGuard/main/LICENSE (2026-06-27)
- [x] `launch-facts.ts` "License wording" → `"resolved"` with MIT License

### B6 — Status page decision (Gate 6)

**Option A:** Publish a status surface, confirm its URL, and record it.
**Option B:** Decide no status page at v1. Record the decision.

- [ ] B6 decision recorded in review.md — **AWAITING USER DECISION**
- [ ] `launch-facts.ts` "Status page" → `"resolved"` (with URL) or `"planned"` (with note)

---

## Phase C — Web Content Updates (per gate as it resolves)

Each group below is blocked on the corresponding Phase B verification.

### C1 — GitHub repo references (after B1) — DONE

- [x] Trust page: GitHub repository link added to responsible disclosure section (2026-06-27)
- [x] GitHub Action page: disclosure note updated with real repo URL (2026-06-27)

### C2 — Release and download content (after B2)

Files: `src/app/docs/releases/page.tsx`, `src/app/docs/cli/page.tsx`,
`src/app/docs/github-action/page.tsx`

- [ ] `releases/page.tsx`: replace "Release artifacts pending" disclosure block — **BLOCKED on B2**
- [ ] `cli/page.tsx`: replace "Release binaries" disclosure with real binary download instructions — **BLOCKED on B2**
- [ ] `github-action/page.tsx`: replace `<version>` placeholder with real tag — **BLOCKED on B2**

### C3 — MCP package install content (after B3)

File: `src/app/docs/mcp/page.tsx`

- [ ] Replace "npm package pending release" disclosure block — **BLOCKED on B3**

### C4 — Responsible disclosure section (after B4)

File: `src/app/trust/page.tsx`

- [ ] Add security contact email and PGP key — **BLOCKED on B4**

### C5 — License section (after B5) — DONE

- [x] MIT License section added to trust page with link to LICENSE file (2026-06-27)

### C6 — Status page or removal (after B6)

- [ ] Awaiting B6 decision — **BLOCKED on B6 user decision**

---

## Phase D — Exit Quiet Preview

**Blocked on: all B1–B5 verified, B6 decided, all C1–C6 complete.**

B2, B3, B4 are unresolved. Phase D is blocked as of 2026-06-27.

### D1 — Update robots.ts

- [ ] D1 done — **BLOCKED: Phase D requires all B1–B5 resolved**

### D2 — Update layout.tsx root metadata

- [ ] D2 done — **BLOCKED**

### D3 — Replace check-quiet-preview with check-launch-policy

- [ ] D3 done — **BLOCKED**

### D4 — Remove noindex assertions from existing truth scripts

- [ ] D4: check-docs-truth.mjs Assert 1 inverted — **BLOCKED**
- [ ] D4: check-pricing-truth.mjs noindex assertion removed — **BLOCKED**
- [ ] D4: check-trust-truth.mjs Assert 1 inverted — **BLOCKED**

---

## Phase E — Full Gate and Verification

### E1 — Build and lint

- [x] E1 pass — npm run build and npm run lint passed (2026-06-27)

### E2 — Truth and policy checks

- [ ] E2 pass (all 4 scripts) — **BLOCKED: Phase D not yet executed; check-launch-policy.mjs not yet created**

### E3 — Sitemap smoke

- [ ] E3 pass — verify `.next/server/app/sitemap.xml.body` contains all 12 URLs

### E4 — Manual browser smoke

- [ ] E4 evidence recorded — **pending**

### E5 — Keyboard navigation

- [ ] E5 pass — **pending**

### E6 — Link check

- [ ] E6 pass — **pending**

### E7 — Vercel preview deployment smoke (if CLI available)

- [ ] E7 done (or noted as unavailable)

---

## Phase F — Close Track

- [ ] `docs/ToDo.md` — check off resolved Public Launch Facts items.
- [ ] `conductor/conductor.md` — set WEB-0005 status to **Completed**.
- [ ] Commit with `feat: close WEB-0005 launch facts and exit quiet preview`.
- [ ] Run pre-push hooks (ChangeGuard ledger commit if pending).
- [ ] Push.

---

## Check-docs-truth.mjs Change Log for WEB-0005

When a real version replaces the `<version>` placeholder in the GitHub Action
YAML, Assert 5 in `scripts/check-docs-truth.mjs` must change from:

```js
// Assert 5 (current): version placeholder or "pending" near `uses:`
assert(
  /<version>|pending/i.test(…),
  "github-action page must have version placeholder or pending near uses:"
);
```

To:
```js
// Assert 5 (after WEB-0005): real semver tag near `uses:`
assert(
  /uses:.*Ryan-AI-Studios\/ChangeGuard@v\d+\.\d+/i.test(…),
  "github-action page must have a real version tag near uses:"
);
```

Record this mutation in `review.md` so it is explicitly tracked.
