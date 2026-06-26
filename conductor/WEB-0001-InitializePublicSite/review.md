# WEB-0001 Review

## Draft Status

Status: Draft.

This packet prepares `WEB-0001-InitializePublicSite` for implementation. No app
scaffold has been generated yet, and no public UI has been built. The track is
ready for an implementer to move it to **In Progress** and execute
`plan.md` task-by-task.

## Dependency Baseline

Date: 2026-06-26.

Live npm registry snapshot:

| Package | Version |
|---|---:|
| `next` | `16.2.9` |
| `react` | `19.2.7` |
| `react-dom` | `19.2.7` |
| `typescript` | `6.0.3` |
| `tailwindcss` | `4.3.1` |
| `@tailwindcss/postcss` | `4.3.1` |
| `eslint` | `10.5.0` |
| `lucide-react` | `1.21.0` |
| `next-themes` | Not selected; only evaluate if track 1 implements theme switching. |
| link checker | Not selected; implementation must verify active maintenance and Windows behavior before pinning. |

Docs consulted:

- Context7 `/vercel/next.js/v16.2.9`: Next.js App Router installation and
  `create-next-app` non-interactive flags.
- Context7 `/reactjs/react.dev`: React 19 TypeScript type upgrade guidance.
- Local `AGENTS.md`, `PRODUCT.md`, `conductor/conductor.md`, and this track
  spec/plan.

Implementation note:

- Before package install, rerun the `npm view` commands from `spec.md` because
  package versions can change.
- Context7 did not resolve the official Tailwind docs cleanly in this pass.
  During implementation, verify Tailwind v4 setup through the official Tailwind
  site or the Next.js bundled docs before editing config.
- Treat `next-themes` and `lychee` as candidate tools, not default dependencies.
  Add them only after current docs, maintenance, and Windows behavior are checked.

## Design Baseline

Register: brand.

Required design source:

- `PRODUCT.md`.
- `impeccable` setup via `node C:\Users\RyanB\.agents\skills\impeccable\scripts\context.mjs`.
- `impeccable` brand register reference for marketing/docs/trust surfaces.

Draft constraints:

- Do not implement public UI/UX without loading `impeccable`.
- No gradient text, glassmorphism, fake metrics, fake logos, fake status links,
  fake package links, unsupported license claims, or generic identical-card
  grids.
- Use OKLCH tokens and verify contrast.
- Treat the current visual system as provisional until `DESIGN.md` exists or
  implementation creates stable tokens.
- Decide the color-scheme strategy during implementation. Engineering-tool
  audience makes dark mode worth considering, but track 1 should not add a theme
  runtime package unless the UX requires interactive switching.

## Accepted Draft Improvements

Folded in from external review:

- Add `sitemap.ts` and `robots.ts` to the track baseline.
- Add branded favicon/icon/apple-touch/Open Graph/social preview strategy.
- Add branded `not-found.tsx` and `error.tsx`.
- Explicitly prefer static-first Server Components and avoid unnecessary
  `'use client'`.
- Add baseline security headers for the public trust posture.
- Add a first-class color-scheme decision so dark mode is either implemented or
  intentionally deferred with token slots.
- Add automated link checking to the verification plan.

Not accepted as hard requirements:

- `next-themes` is not required yet; it is a candidate if the implemented UX
  needs theme switching.
- `lychee` is not required yet; it is a candidate if current docs/Windows
  behavior make it the best link checker.

## Truth-Gate Baseline

Public copy must keep these as planned or unresolved unless implementation can
prove otherwise:

- Hosted GitHub App.
- SSO/SAML/OIDC.
- SCIM.
- RBAC.
- Billing portal.
- Hosted audit logs.
- Hosted SOC2 portal.
- Slack or external workflow webhooks.
- Public MCP registry/package links.
- Release download/checksum links.
- Status page URL.
- License wording.

Public copy may claim these with local-only or available qualifiers:

- Local Ledgerful engine and CLI.
- Local dashboard surface.
- Local SOC2 zip export.
- Local signed ledger/provenance.
- Local team sync foundation.

## Implementation Entry Conditions

Before switching status to **In Progress**:

- Run `ai-brains preflight --summary` with repo-local `.env` context.
- Run `changeguard doctor`.
- Run `changeguard ledger status --compact`.
- Run `changeguard scan --impact`.
- Rerun dependency version checks.
- Load `impeccable` if touching UI/UX or forward-facing copy.
- Verify current docs for SEO metadata, Open Graph images, security headers,
  link checking, and any theme package before implementation.

## Findings

No open findings.

## Draft Verification

Commands run for this draft packet:

```powershell
npm view next version
npm view react version
npm view react-dom version
npm view typescript version
npm view tailwindcss version
npm view @tailwindcss/postcss version
npm view eslint version
npm view lucide-react version
```

Expected and observed: each returned a single package version.

```powershell
changeguard scan --impact
changeguard verify --scope fast
```

Expected and observed at draft time: ChangeGuard scan/verify passed with the
current documentation-only gate. Full web gates become mandatory after scaffold.
