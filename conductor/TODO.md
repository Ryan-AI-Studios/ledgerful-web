# Conductor TODO

Pending and blocked items for in-flight tracks. This is a tactical register —
`docs/ToDo.md` is the strategic deferred-work register and `conductor/conductor.md`
is authoritative for track status. Remove items here once they are resolved and
evidenced in the owning track.

Last updated: 2026-06-27

---

## WEB-0005-LaunchFactResolution — In Progress

### Decisions needed from user

- [ ] **LICENSE MODEL** — MIT is wrong for a commercial SaaS product. The Fusion
  360 hobbyist pattern (free personal use, paid commercial) maps to a proprietary
  EULA with a free-tier clause. Closest established options:
  - **PolyForm Noncommercial** — free for non-commercial, paid for any commercial use
  - **PolyForm Small Business** — free under $1M ARR
  - **Custom EULA** — maximum flexibility, needs legal review
  
  Until decided: revert launch-facts.ts "License wording" back to `"unresolved"`
  and update the trust page license section to say "License terms are being
  finalized; see the repository LICENSE file for current terms." Do not ship
  "MIT License" on the trust page if the product will be sold commercially.

- [ ] **B6 — Status page** — Option A (publish a status surface) or Option B
  (no status page at v1; update launch fact to `"planned"` and move on). Option B
  does not block launch.

### Blocked on backend (ChangeGuard repo actions)

- [ ] **B2 — Tagged release + binaries** — Publish a release tag (`v0.x.y`) with
  binaries for linux-x64, macos-x64, macos-arm64, windows-x64 and `.sha256`
  checksum files beside each. Verify with `curl -IL` and `sha256sum -c` before
  unlocking web content updates. (Docs affected: releases/page.tsx, cli/page.tsx,
  github-action/page.tsx, launch-facts.ts entries for releases and Action URL.)

- [ ] **B3 — npm package** — Publish `@ledgerful/mcp-server` to the public npm
  registry. Verify with `npm view @ledgerful/mcp-server version`. (Docs affected:
  mcp/page.tsx, launch-facts.ts MCP entry.)

- [ ] **B4 — Responsible disclosure channel** — Establish a monitored security
  contact email (e.g. `security@ledgerful.dev`) and publish a PGP key. Add a
  `SECURITY.md` to the ChangeGuard repo or a disclosure policy URL. (Docs
  affected: trust/page.tsx responsible disclosure section, launch-facts.ts entry.)

### Phase D — blocked until B2 + B3 + B4 + B6 all resolved and license decided

When all gates above close, execute in this exact order (see plan.md for details):

1. **D4 first** — Invert noindex assertions in three truth scripts:
   - `scripts/check-docs-truth.mjs` Assert 1: flip to "must NOT have noindex"
   - `scripts/check-pricing-truth.mjs`: remove quiet-preview noindex assertion block
   - `scripts/check-trust-truth.mjs` Assert 1: flip to "must NOT have noindex"
2. **D1** — `src/app/robots.ts`: change `disallow: "/"` to `allow: "/"`
3. **D2** — `src/app/layout.tsx`: remove `robots: { index: false, ... }` block
4. **D3** — Create `scripts/check-launch-policy.mjs` (asserts crawl open, no noindex);
   add `check:launch-policy` script to `package.json`
5. Run Phase E full gate (build, lint, all 4 truth scripts, sitemap smoke, browser smoke)
6. Phase F: update `docs/ToDo.md`, set conductor WEB-0005 to Completed, commit, push

### Also resolve before Phase D

- [ ] **license-facts.ts revert** — Set "License wording" back to `"unresolved"` until
  the license model decision above is made. (Current value "MIT License" was set in
  the 2026-06-27 partial implementation but is likely wrong for a commercial product.)

- [ ] **trust/page.tsx license section** — Update or revert Section 10 (License) to
  accurately reflect the chosen license model. If MIT is wrong, the section currently
  shipping "MIT License" must be corrected before launch.

### Note: check-docs-truth.mjs Assert 5 mutation

When the GitHub Action `<version>` placeholder is replaced with a real tag (B2),
Assert 5 in `scripts/check-docs-truth.mjs` must change from:
```js
/<version>|pending/i.test(…)
```
to:
```js
/uses:.*Ryan-AI-Studios\/ChangeGuard@v\d+\.\d+/i.test(…)
```
Record this mutation in `conductor/WEB-0005-LaunchFactResolution/review.md`.

---

## Cross-track: email and domain

- [ ] Decide whether `@ledgerful.dev` will receive or send email. Until decided,
  publish restrictive no-mail SPF and DMARC records. Do not add MX or DKIM
  without an email provider selected.

---

## Cross-track: CI

- [ ] Add a CI pipeline (GitHub Actions on this repo) that runs `npm run build`,
  `npm run lint`, and `node scripts/check-quiet-preview.mjs` on pull requests.
  Upgrade to `check:launch-policy` once Phase D completes.
