# WEB-0001 Review

## Status

Status: Completed. Final ChangeGuard and review gates passed; production
deployment evidence is recorded in `WEB-0007-QuietPreviewDeployment`.

The public site scaffold now exists and renders the required route set:

- `/`
- `/docs`
- `/pricing`
- `/trust`
- `/changelog`
- `not-found` fallback for unknown routes
- generated `/opengraph-image`, `/apple-icon`, `/icon.svg`, `/robots.txt`, and `/sitemap.xml`

## Dependency Baseline

Date: 2026-06-26.

Live npm registry snapshot and selected pins:

| Package | Live version | Selected version | Note |
|---|---:|---:|---|
| `next` | `16.2.9` | `16.2.9` | Current App Router baseline. |
| `react` | `19.2.7` | `19.2.7` | Updated from scaffold's older React 19.2.4. |
| `react-dom` | `19.2.7` | `19.2.7` | Updated from scaffold's older React DOM 19.2.4. |
| `typescript` | `6.0.3` | `6.0.3` | Current live version. |
| `tailwindcss` | `4.3.1` | `4.3.1` | Current v4 pipeline. |
| `@tailwindcss/postcss` | `4.3.1` | `4.3.1` | Current v4 PostCSS plugin. |
| `eslint` | `10.5.0` | `9.39.4` | ESLint 10.5.0 broke `eslint-config-next@16.2.9`; selected latest stable 9.x compatible gate. |
| `eslint-config-next` | `16.2.9` | `16.2.9` | Scaffolded current Next lint config. |
| `lucide-react` | `1.21.0` | `1.21.0` | Used for accessible iconography. |
| `linkinator` | `7.6.1` | `7.6.1` | Selected over lychee npm package because it is current, Node-based, and Windows/CI-friendly. |
| `start-server-and-test` | `3.0.11` | `3.0.11` | Starts/stops local Next server for link gate. |
| `cross-env` | `10.1.0` | `10.1.0` | Makes local link-check `NEXT_PUBLIC_SITE_URL` override portable on Windows/CI. |
| `next-themes` | `0.4.6` | Not selected | No interactive theme switch requirement in track 1. |

Docs consulted:

- Context7 `/vercel/next.js/v16.2.9`: `create-next-app` flags, App Router scaffold, metadata conventions.
- Context7 `/tailwindlabs/tailwindcss.com`: Tailwind v4 Next.js setup using `@tailwindcss/postcss` and `@import "tailwindcss"`.
- Context7 `/react/react/v19.2.7`: React server rendering/server component background.
- Next.js official docs via research subagent: metadata, sitemap, robots, Open Graph image, `error.tsx`, `not-found.tsx`, `headers()`, and static-export caveat.
- npm live metadata for dependency versions and link-checker maintenance.

## Design Evidence

Register: brand.

Impeccable setup was run with `PRODUCT.md`. Brand register guidance was loaded.

Color strategy:

- Light-first public trust/docs surface with first-class dark token support through `prefers-color-scheme`.
- No `next-themes` runtime package in track 1 because there is no user-facing theme toggle requirement.
- Current Impeccable seed used: OKLCH hue 210 sky-blue/steel instrument anchor.
- CSS tokens use OKLCH. Generated Open Graph and Apple icon route styles use renderer-compatible RGB equivalents because Next's `ImageResponse` rejected CSS `oklch()` during prerender.

Design decisions:

- Typography uses Archivo + JetBrains Mono from `next/font/google`; no scaffold Geist defaults remain.
- Visual system uses steel-blue primary, graphite text, brass/green status accents, compact evidence panels, and visible state pills.
- No gradient text, glassmorphism, fake metrics, fake logos, fake status links, fake package links, unsupported license claims, or generic scaffold hero remains.

## Truth-Gate Result

Public copy keeps these as planned or unresolved:

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
- Canonical product GitHub/release links.

Public copy claims only local/beta/planned capabilities consistent with `C:\dev\Roadmap.md`, `Backend-Notes.md`, and `Frontend-Notes.md`:

- Local CLI and engine.
- Local daemon/dashboard with ephemeral `?token=` access.
- Local SOC2 ZIP export, not a hosted portal.
- Local signed ledger/provenance.
- Local team sync foundation.
- MCP and GitHub Action paths as beta/release-smoke pending.

## Review Findings

### Review Pass 1

Reviewer: `gpt-5.4` subagent, read-only.

Findings:

- High: `changeguard verify --scope fast` could not resolve `npm`.
- Medium: SEO/canonical URL fallback could publish localhost URLs and route pages lacked canonical alternates.
- Medium: CSP included `unsafe-inline` and `unsafe-eval` in `script-src`.
- Medium: Homepage feature-state section used `role="table"` without table child roles.
- Medium: Review/conductor status was stale.

Fixes applied:

- Updated ignored `.changeguard/config.toml` verify steps to call `cmd /c npm run ...`, because ChangeGuard does not resolve PowerShell npm shims and splits spaced executable paths.
- Set default `siteUrl` to `https://www.ledgerful.dev` and made local link-check override explicit with `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:4173`.
- Added canonical alternates for core pages.
- Tightened CSP `script-src` to `'self'`; kept `style-src 'unsafe-inline'` for Next/font/style runtime compatibility.
- Removed invalid ARIA table role from the feature-state matrix.
- Replaced this review packet with implementation evidence.

## Verification

Commands run:

```powershell
npm run build
npm run lint
npm run check:links
changeguard config verify
changeguard ledger status --compact
changeguard verify --scope fast
```

Observed:

- `npm run build`: passed.
- `npm run lint`: passed.
- `npm run check:links`: passed; builds first, starts Next on port 4173, runs Linkinator, and shuts the server down.
- `changeguard config verify`: passed.
- `changeguard ledger status --compact`: `0 pending, 0 unaudited drift`.
- `changeguard verify --scope fast`: passed with `git diff --check`, `git diff --cached --check`, `cmd /c npm run build`, `cmd /c npm run lint`, and `cmd /c npm run check:links`.

Manual/browser smoke:

- Server: `npm run dev -- --port 4301`.
- Browser engine: local Chrome via Playwright.
- Desktop `/` at 1280x900: rendered, no horizontal overflow.
- Mobile `/` at 375x900: rendered, no horizontal overflow.
- `/docs`, `/pricing`, `/trust`, `/changelog`: rendered.
- `/missing-route-for-smoke`: returned 404 with branded Ledgerful fallback.
- Keyboard tab order covered brand link, nav links, primary CTA, and secondary CTA.
- JavaScript-disabled mobile render still showed meaningful content and navigation.

Screenshots captured for local inspection:

- `.next/ledgerful-home-desktop.png`
- `.next/ledgerful-home-mobile.png`

## Known Residuals

- Playwright was used from the local environment/system Chrome for manual smoke; no Playwright dependency or e2e suite was added in track 1.

## Closure Criteria

Open critical/high findings: none.
