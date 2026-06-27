# WEB-0005-LaunchFactResolution — Spec

## Objective

Resolve every launch-blocking fact in `src/lib/content/launch-facts.ts`,
remove or replace all WEB-0005 disclosure notices planted in docs pages during
WEB-0004, extend the sitemap to cover all `/docs/*` sub-pages, and exit the
quiet preview by restoring crawl access and indexable metadata.

This track is a prerequisite for the site going live. It must not begin web
implementation until at least one external gate below is closed.

---

## Source Authority Order

1. This spec.
2. `C:\dev\Roadmap.md` (Phase 0 / CG-2 / CG-3 targets).
3. `conductor/conductor.md`.
4. `docs/ToDo.md` (Public Launch Facts section).
5. `src/lib/content/launch-facts.ts` (canonical web-side state register).
6. Live backend evidence (GitHub release page, npm registry, anonymous repo access).

---

## Scope

### In scope

- Verify each external launch fact against live evidence.
- Update `launch-facts.ts` entries from `"unresolved"` to `"resolved"` with
  real `value` and `href` once evidence exists.
- Remove or replace WEB-0005 disclosure notices in docs pages.
- Add responsible disclosure contact to the trust page.
- Add license wording to the trust and/or docs pages once confirmed.
- Extend `sitemap.ts` to include the 7 `/docs/*` sub-pages.
- Restore crawl access: update `robots.ts` and remove `noindex`/`nofollow`
  from `layout.tsx` root metadata.
- Replace `check-quiet-preview.mjs` with a `check-launch-policy.mjs` that
  asserts crawling is open and indexing directives are absent.
- Update `docs/ToDo.md` (remove completed launch-fact items once closed).
- Run full web gate and record evidence before closing the track.

### Out of scope

- Creating a status page (treated as a product decision; see Status Page below).
- Hosted control plane, GitHub App, SSO, billing, or tenant features.
- Content changes unrelated to resolving the launch facts above.
- Backend release workflow implementation (that is `C:\dev\ChangeGuard` work).

---

## External Gates

All seven items below require action outside this repo before the corresponding
web content can be updated. Do not update `launch-facts.ts` entries or remove
disclosure notices until the external evidence is confirmed.

### Gate 1 — GitHub repository public access

Verify that `https://github.com/Ryan-AI-Studios/ChangeGuard` is anonymously
accessible (no login prompt, no 404). Use `curl -I` or an incognito browser
session to confirm.

Once confirmed:
- Set `launch-facts.ts` "Canonical GitHub repository" to `"resolved"` with the
  canonical URL and `href`.
- Link the repository from the trust page responsible-disclosure section and
  from any docs page that references the action source.
- Update the GitHub Action page disclosure notice to include the real repo URL.

### Gate 2 — Tagged GitHub release with binaries and checksums

A real tagged release must exist at `Ryan-AI-Studios/ChangeGuard` with:
- Binaries for `linux-x64`, `macos-x64`, `macos-arm64`, `windows-x64`.
- `.sha256` checksum files beside each binary.
- A GitHub Release page with a version tag (`v0.x.y` format).

Verify the download URLs are reachable anonymously before linking them.

Once confirmed:
- Set `launch-facts.ts` "Release downloads and checksums" to `"resolved"`.
- Replace the "Release artifacts pending" disclosure notice in `docs/releases/page.tsx`
  with real download links and the tag name.
- Replace the "Release binaries" disclosure notice in `docs/cli/page.tsx` with
  real download instructions.
- Replace the `<version>` placeholder and "Version pending" disclosure notice in
  `docs/github-action/page.tsx` with the real release tag.
- Set `launch-facts.ts` "GitHub Action install URL" to `"resolved"` once the
  action YAML with real tag is confirmed.

### Gate 3 — MCP npm package published

Verify that `npm view @ledgerful/mcp-server version` returns a real version
without error. The package must be publicly installable.

Once confirmed:
- Set `launch-facts.ts` "MCP registry or npm package" to `"resolved"` with the
  npm package name and version.
- Replace the "npm package pending release" disclosure notice in
  `docs/mcp/page.tsx` with the real `npx` install command and package version.
- Add an `href` pointing to the npm package page.

### Gate 4 — Responsible disclosure channel

A verified security contact must be established:
- A security email address (e.g. `security@ledgerful.dev`) that is monitored.
- A PGP public key published alongside it.
- Optionally, a disclosure policy document linked from the trust page.

Once confirmed:
- Set `launch-facts.ts` "Responsible disclosure channel" to `"resolved"`.
- Add the security contact email and PGP key link to the trust page responsible
  disclosure section.
- Remove the "Do not send vulnerability reports" advisory from the trust page
  if it references this launch fact.

### Gate 5 — License wording confirmed

A LICENSE file or license statement in the repository must be confirmed and
consistent with how the product is distributed (source-available, binary-only,
commercial, MIT, etc.).

Once confirmed:
- Set `launch-facts.ts` "License wording" to `"resolved"` with the confirmed
  license name/summary.
- Add license wording to the footer, trust page, or a dedicated license section
  of the docs, as appropriate.

### Gate 6 — Status page decision

Choose one of:

**Option A (build a status page):** Publish a status surface at a public URL
(e.g. `status.ledgerful.dev` via a third-party status service, a simple static
page, or a Vercel deployment). Verify anonymous access. Set
`launch-facts.ts` "Status page" to `"resolved"` and link it from the site
footer and/or trust page.

**Option B (no status page at launch):** Explicitly decide that a public status
page will not exist at v1 launch. Set `launch-facts.ts` "Status page" to
`"planned"` with a note. Remove any status-page links or `status.ledgerful.dev`
references from the site. Do not add a dead link.

Both options fully resolve this launch fact. Option B is acceptable and does not
block launch.

---

## Web-Side Implementation Tasks

These tasks are the web repo's responsibility, executed after each external gate
closes. They are not blocked on each other — work can proceed gate by gate.

### 1 — launch-facts.ts updates

For each resolved gate, update the corresponding entry in
`src/lib/content/launch-facts.ts`:
- `status: "resolved"`
- `value`: the real value (URL, version, email, license name)
- `href`: the live link (where applicable)

### 2 — Disclosure notice replacements

After each gate, replace the corresponding `disclosure-notice` blocks in docs
pages with real content. See the External Gates section for the mapping.

Pages that contain WEB-0005 disclosure notices:
- `src/app/docs/cli/page.tsx` — release binaries + `<version>` reference
- `src/app/docs/mcp/page.tsx` — npm package pending release
- `src/app/docs/github-action/page.tsx` — version pending + release URLs
- `src/app/docs/releases/page.tsx` — release artifacts pending

### 3 — Trust page: responsible disclosure section

Add a real responsible disclosure section to `src/app/trust/page.tsx`:
- Security contact email.
- PGP key link or inline fingerprint.
- Disclosure policy or timeline (standard 90-day coordinated disclosure).
- Reference to the backend GitHub repository issues page or dedicated reporting URL.

Blocked on Gate 4.

### 4 — Trust page: license wording

Add confirmed license wording to the trust page or a footer note.
Blocked on Gate 5.

### 5 — Sitemap extension

Update `src/app/sitemap.ts` to include the 7 `/docs/*` sub-pages:
- `/docs/cli`
- `/docs/dashboard`
- `/docs/mcp`
- `/docs/github-action`
- `/docs/compliance`
- `/docs/sync`
- `/docs/releases`

This task is not gated on external facts and can be done immediately.

### 6 — Exit quiet preview

Only after all launch-blocking gates are resolved:

1. `src/app/robots.ts`: Remove `disallow: "/"`. Switch to:
   ```ts
   rules: { userAgent: "*", allow: "/" },
   sitemap: `${siteUrl}/sitemap.xml`,
   ```
2. `src/app/layout.tsx`: Remove the `robots` metadata block (or replace with
   `{ index: true, follow: true }`). Remove the `googleBot` noindex block.
3. Replace `scripts/check-quiet-preview.mjs` with
   `scripts/check-launch-policy.mjs` that asserts:
   - `robots.txt` does not contain `Disallow: /`.
   - The homepage does not emit `noindex`.
4. Update `package.json`: rename the `check:quiet-preview` script to
   `check:launch-policy` (or add it as a new script).

---

## Sitemap Extension — Non-Gated Task

This task is not blocked by any external gate and can be done in any session:

`src/app/sitemap.ts` currently iterates `mainNavigation` (5 top-level routes).
It must be extended with explicit entries for all 7 `/docs/*` sub-pages at
`priority: 0.7` and `changeFrequency: "monthly"`.

---

## Explicit Non-Scope: Status Page

The status page launch fact is handled by Gate 6 above. The site currently has
no live link to `status.ledgerful.dev` — it appears only in `launch-facts.ts`.
If Option B is chosen, no change to any live page is required beyond updating
the launch fact status and a note.

---

## Definition of Done

- [ ] All entries in `launch-facts.ts` are `"resolved"` or explicitly `"planned"` with a
      written rationale (only the hosted control plane entry is pre-approved as
      `"planned"`; all others must be resolved or explicitly deferred with user
      direction).
- [ ] No page contains a `WEB-0005 launch fact` string or an unresolved
      disclosure notice referencing a pending release, `<version>` placeholder, or
      pending npm package.
- [ ] The trust page has a real responsible disclosure section.
- [ ] The trust page or footer has confirmed license wording.
- [ ] `sitemap.ts` includes all 7 `/docs/*` sub-pages.
- [ ] `robots.ts` allows crawling (not `disallow: "/"`).
- [ ] `layout.tsx` root metadata does not emit `noindex`.
- [ ] `npm run check:launch-policy` passes (asserts indexing is open).
- [ ] `npm run build` and `npm run lint` pass.
- [ ] `npm run check:docs` passes (the WEB-0004 truth assertions remain valid).
- [ ] Desktop + mobile (375px) browser smoke completed for changed pages.
- [ ] Keyboard navigation checked for any new interactive elements.
- [ ] Link check passes for all public docs links, download URLs, and GitHub references.
- [ ] Vercel preview deployment smoke completed if CLI is available.
- [ ] All WEB-0004 and WEB-0005 truth assertions pass together.
- [ ] `docs/ToDo.md` Public Launch Facts section updated.
- [ ] `conductor/conductor.md` WEB-0005 status set to `Completed`.

---

## Risks and Dependencies

| Risk | Mitigation |
|---|---|
| Backend release is delayed | Each gate resolves independently; web can update launch facts one at a time |
| npm publish is blocked on legal | Treat MCP as "local-only" until publish is approved; site already has that caveat |
| Status page never happens at v1 | Option B explicitly allows omitting it; update the launch fact and move on |
| License is non-standard or restricted | Document exactly what the confirmed license is; do not invent terms |
| Responsible disclosure PGP key not ready | Site already warns readers not to send reports; this state is acceptable until resolved |
| Sitemap missing sub-pages | Low risk, no external gate — fix in any available session |
| Truth scripts break when noindex is removed | Three scripts (check-docs-truth.mjs Assert 1, check-pricing-truth.mjs, check-trust-truth.mjs Assert 1) assert noindex is present; they must be inverted in Phase D before running Phase E gates |
| GitHub CDN redirects cause false curl failures | Release download URLs redirect via 302 to CDN; plan uses `curl -IL` to follow redirects and verify final 200 |
| Checksum files exist but contain wrong hashes | Plan includes a real sha256sum dry-run against one downloaded binary before publishing any download links |
| git transport private even when web UI is public | Plan uses `git ls-remote` to confirm anonymous clone access, not just web page visibility |
