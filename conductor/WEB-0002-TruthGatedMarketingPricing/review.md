# WEB-0002 Review

## Status

Completed.

## Sources Consulted

- `C:\dev\Roadmap.md`: WEB-1, Commercial Packaging, and Pricing Notes.
- `AGENTS.md`, `PRODUCT.md`, and `docs/ToDo.md`.
- `src/lib/content/pricing.ts`, `features.ts`, and `src/app/pricing/page.tsx`.
- `C:\dev\ChangeGuard\conductor\conductor.md`.
- `C:\dev\ledgerful-frontend\conductor\conductor.md`.
- `C:\dev\ChangeGuard\docs\Frontend-Notes.md`.
- `C:\dev\ledgerful-frontend\docs\Backend-Notes.md`.

## Implementation Summary

### Files Changed

- `src/lib/content/pricing.ts` — renamed editions, added `EditionItem.caveat` field,
  added `MatrixCell`, `MatrixRow`, `MatrixGroup` types, `matrixGroups` export,
  `matrixEditionHeaders` export, and `pricingFootnotes` export.
- `src/app/pricing/page.tsx` — added edition-ladder planned-card variant, inline
  caveats on edition items, feature matrix section with semantic `<table>`,
  `<caption>`, `<thead>`, grouped `<tbody>` per feature group, and footnote list.
- `src/app/globals.css` — added `.pricing-card--planned`, `.item-caveat`,
  `.matrix-scroll`, `.matrix-table`, `.matrix-group-label`, `.matrix-empty`, and
  `.pricing-footnotes` styles.
- `scripts/check-pricing-truth.mjs` — new automated pricing truth check.
- `package.json` — added `check:pricing` script.

## Planning Findings Resolution

### High: Hosted edition name reads as live beta

**Resolved.** Edition renamed from `Team Hosted Beta` to `Team Hosted` with state
`hosted planned`. The `check:pricing` script asserts `Team Hosted Beta` does not
appear in the built output.

### High: Enterprise name implies an unverified contact path

**Resolved.** Edition renamed from `Enterprise / Contact` to `Enterprise`. The
`check:pricing` script asserts `Enterprise / Contact` does not appear in the built
output.

### Medium: Equal card treatment blurs availability

**Resolved.** Planned editions (Team Hosted, Enterprise) receive `.pricing-card--planned`
which applies `background: var(--surface)` and a smaller price font, visually
receding relative to the local editions.

### Medium: Feature rows lack structured evidence

**Resolved.** `EditionItem` now has an optional `caveat` field. `MatrixRow` has an
optional `caveat` field. MCP and GitHub Action rows carry "Release smoke pending"
caveats in both the edition cards and the matrix.

### Medium: Several beta rows require revalidation

**Resolved.** MCP stdio tools and GitHub Action setup path are marked `beta` with
explicit "release smoke pending" caveats. Team signatures and portfolio reports are
marked `beta`. No row was upgraded to `available` without roadmap evidence.

## Locked Truth Boundaries (Confirmed)

- Local daemon/dashboard remain local-only and ephemeral-token protected.
- Local SOC2 evidence is a ZIP export, not a hosted portal.
- Team sync is the local-first signed directory transport, not hosted sync.
- MCP and GitHub Action public install paths remain beta with release-smoke caveats.
- Hosted portfolio, GitHub App, billing, and retained audit state remain hosted planned.
- SSO/SAML/OIDC, SCIM, RBAC, hosted audit export, retention, SLA, and self-hosting
  remain enterprise planned.
- No source upload is required for local paid value.
- No final paid amounts are shown for any planned edition.

## Verification Evidence

### Automated checks

- `npm run build` — passed, all 12 static pages generated, TypeScript passed.
- `node scripts/check-pricing-truth.mjs` — all 7 assertions passed:
  - No `Team Hosted Beta`
  - No `Enterprise / Contact`
  - No checkout/trial/sales CTAs
  - All five state labels present (Available, Beta, Local-only, Hosted planned, Enterprise planned)
  - `Pricing not announced` present for planned editions
  - noindex metadata active
- `npm run lint` — passed, no errors.
- `node scripts/check-quiet-preview.mjs` — quiet-preview policy still active.

### Manual browser evidence (desktop 1280px)

- Hero section renders correctly with kicker, headline, and subtext.
- Edition ladder: Free/Local (`Available`), Pro/Team Local (`Beta`), Team Hosted
  (`Hosted planned`), Enterprise (`Enterprise planned`) — correct names, pills, prices.
- Planned edition cards visually recede via `--surface` background and smaller price text.
- MCP and GitHub Action items show "Release smoke pending" caveat inline.
- Feature matrix table renders with 5 column headers and 6 grouped `<tbody>` sections:
  Core Engine, Collaboration, GitHub and Release, Hosted (planned), Enterprise (planned).
- Em-dash cells correctly indicate not-included features.
- Status pills in matrix cells match expected states.
- Footnotes list renders below matrix with 5 plain-text caveats.
- Keyboard navigation: Tab reaches nav links with visible brass accent focus ring
  (`:focus-visible` — 3px solid `--accent`).

### Mobile check

- CSS `overflow-x: auto` on `.matrix-scroll` with `min-width: 580px` on `.matrix-table`
  provides horizontal scroll on narrow viewports without page-level overflow.
- `.pricing-grid` `auto-fit, minmax(260px, 1fr)` collapses to 1 column below ~560px.
- Existing `@media (max-width: 640px)` rule stacks `.pricing-card li` to single column.

## Vercel Preview Evidence

- Preview URL: `https://ledgerful-r3d5j650c-ryan-bourgoin-s-projects.vercel.app`
- Inspect: `https://vercel.com/ryan-bourgoin-s-projects/ledgerful-web/GSF6w7HNbkRddxeQwuS8m9Su4o4n`
- Build passed on Vercel (iad1, Node 24, Next 16.2.9, TypeScript clean).
- `/pricing` route rendered and confirmed via browser screenshot on the preview domain.

## Post-Review Fixes (Reviewer Round 1)

Three findings raised after initial completion — all resolved:

### High: ChangeGuard gates not run
**Resolved.** `changeguard scan --impact` passed (impact report written to
`.changeguard/reports/latest-impact.json`). `changeguard verify --scope fast` passed
all steps: `git diff --check`, `git diff --cached --check`, `npm run build`,
`npm run lint`, `npm run check:links`.

### Medium: matrix-scroll not keyboard-focusable
**Resolved.** Added `tabIndex={0}` to the `div[role="region"]` wrapping the comparison
table. Keyboard users can now Tab to the scroll container and use arrow keys to scroll
horizontally on narrow viewports. Pricing truth check still passes after the change.

### Medium: next-env.d.ts modified to dev path
**Resolved.** `next dev` had changed `import "./.next/types/routes.d.ts"` to
`import "./.next/dev/types/routes.d.ts"`. Restored to the committed production-path
content via `git checkout -- next-env.d.ts`. This file is managed by Next.js and
should not be committed with the dev path.

## Residual Risks and Open Items

- Mobile screenshot capture was not pixel-verified at 375px due to DPI scaling in the
  browser extension capture. CSS responsive rules are in place and have been code-reviewed.
- The `check:pricing` build step duplicates the build run when chained with
  `check:preview`. Acceptable for the current script structure.

## Claim Audit

No public claim on `/pricing` outruns `C:\dev\Roadmap.md`:

- Free/local CLI and dashboard: confirmed available.
- Local SOC2 ZIP export: confirmed local-only.
- MCP and GitHub Action: confirmed beta with release-smoke caveats.
- Team sync and team signatures: confirmed local-only/beta.
- Portfolio reports: confirmed beta.
- Hosted portfolio, GitHub App, billing, hosted audit log: confirmed hosted planned.
- SAML/OIDC, SCIM, RBAC, retention, SLA: confirmed enterprise planned.
- No dollar amounts for planned editions.
- No customer logos, uptime claims, status links, or license claims.
