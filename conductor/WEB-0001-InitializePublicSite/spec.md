# WEB-0001 Initialize Public Site Spec

## Objective

Initialize `C:\dev\ledgerful-web` as Ledgerful's independent public web repo:
a static, Vercel-ready site with launch-safe routes, truth-gated copy, active
dependency pins, and verification gates appropriate for a frontend project.

## Background

`C:\dev\Roadmap.md` defines `ledgerful-web` as the public marketing, docs,
trust/status, pricing, changelog, and launch collateral surface. It must deploy
independently from the embedded dashboard in `C:\dev\ledgerful-frontend` and
must not own local daemon API clients, authenticated hosted app internals,
webhook ingest, billing, or tenant APIs.

The repo is currently pre-scaffold. It has agent workflow docs, ChangeGuard
local state, AI-Brains context, and this conductor system. No app code exists
yet.

## Scope

Create the first working public site baseline:

- Next.js App Router + React + TypeScript app scaffold.
- Tailwind CSS v4 styling pipeline.
- ESLint/build scripts.
- Vercel-ready project configuration without production deploy.
- Public route set:
  - `/` homepage.
  - `/docs` docs index.
  - `/pricing` pricing and feature-state matrix.
  - `/trust` trust/security center starter.
  - `/changelog` changelog starter.
- SEO infrastructure:
  - `sitemap.ts`.
  - `robots.ts`.
  - route metadata for core pages.
- Brand/share assets:
  - favicon/icon assets.
  - Apple touch icon.
  - Open Graph image strategy.
  - social-card metadata for launch-safe link previews.
- Branded resilience surfaces:
  - `not-found.tsx`.
  - `error.tsx`.
  - static-first fallback content that remains useful before hydration.
- Shared content model for feature states:
  - `available`.
  - `beta`.
  - `local-only`.
  - `hosted planned`.
  - `enterprise planned`.
- Launch facts modeled explicitly:
  - canonical GitHub URL.
  - status page URL.
  - license wording.
  - MCP package/registry link.
  - release download/checksum link.
  - GitHub Action install link.
- Visible handling for unresolved launch facts.
- Initial visual direction aligned to `PRODUCT.md` and `impeccable` brand-register guidance.
- Repo verification updated from temporary `git diff --check` to web gates after scripts exist.
- Baseline HTTP security headers appropriate for a static public trust site.
- Link-check gate for internal routes and intentional external links.

## Out Of Scope

- Authenticated hosted app shell.
- Server routes or API handlers.
- GitHub App OAuth/webhook flows.
- Billing, Stripe, entitlements, or customer portal.
- Supabase migrations, RLS policies, Edge Functions, or service-role access.
- Importing or duplicating the embedded dashboard API client.
- Presenting mock data or planned hosted features as live production evidence.
- Production Vercel deploy or domain cutover.

## Source Evidence

Use these files as implementation authority:

- `C:\dev\Roadmap.md`.
- `AGENTS.md`.
- `PRODUCT.md`.
- `conductor/conductor.md`.
- `C:\dev\ChangeGuard\docs\Frontend-Notes.md`.
- `C:\dev\ledgerful-frontend\docs\Backend-Notes.md`.
- `C:\dev\ChangeGuard\conductor\conductor.md`.
- `C:\dev\ledgerful-frontend\conductor\conductor.md`.

Use current package docs before scaffolding:

- Next.js App Router docs.
- React docs.
- Tailwind CSS v4 docs.
- Vercel deployment/environment docs.
- npm registry metadata for selected packages.

## Dependency Baseline

Before installing packages, refresh live versions with:

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

Record chosen versions in the implementation notes or review evidence. Prefer
active, maintained dependencies. Preserve pins once selected unless a later
track intentionally upgrades them.

## Content Requirements

### Homepage

The homepage must make Ledgerful's category and boundary obvious in the first
viewport:

- Ledgerful is a local-first change-intelligence and provenance tool for
  programming teams.
- It helps teams understand repo risk, signed change history, verification
  evidence, and adoption paths across local, team, hosted, and enterprise
  modes.
- It is not a source-upload-first SaaS product.
- It should show product evidence: command output, signed evidence concept,
  release verification, feature status, or a credible product screenshot/scene.

### Docs Index

The docs index must include placeholders or starter pages/sections for:

- CLI install and smoke test.
- Local dashboard launch and ephemeral `?token=` access model.
- MCP setup.
- GitHub Action setup.
- SOC2 evidence export.
- Local team sync.
- Release verification/checksums.

Unresolved package/release links must be visibly marked unresolved or planned.

### Pricing

Pricing must use clear edition boundaries:

- Free / Local.
- Pro / Team Local.
- Team Hosted Beta.
- Enterprise / Contact.

Hosted and enterprise features must be explicitly labeled planned until the
control plane exists.

### Trust

The trust page must explain:

- Local default: no source upload by default.
- What the local engine reads and writes.
- Optional telemetry behavior and opt-in framing.
- Local sync data flow.
- Local SOC2 zip export, not a hosted SOC2 portal.
- Future hosted-mode data boundaries.
- Responsible disclosure starter.
- Subprocessors as "none yet" or "to be defined when hosted services exist",
  unless real subprocessors are documented.

### Changelog

The changelog starter must distinguish:

- Public web milestones.
- Backend/local engine release milestones.
- Dashboard/app milestones.
- Planned hosted/control-plane milestones.

## Design Requirements

Default register: brand.

Use `PRODUCT.md` and `impeccable` brand guidance:

- Distinctive but disciplined; avoid generic AI SaaS styling.
- Use real product evidence or deliberately constructed product diagrams.
- Avoid gradient text, glassmorphism, repeated identical card grids, fake
  metrics, fake logos, and excessive rounded-card decoration.
- Ensure WCAG 2.2 AA contrast.
- Use visible focus states and keyboard-accessible navigation.
- Prefer one or two high-signal visual systems over many generic cards.
- Use imagery or product evidence; do not ship a text-only brand surface unless
  typography/evidence is intentionally carrying the full design.

Seed context from `impeccable` for this greenfield project:

- Brand seed: OKLCH hue near 113 degrees, a yellow-green/olive anchor.
- This is only a starting point; final palette must be composed for Ledgerful's
  evidence-first engineering brand and checked for contrast.

## Technical Requirements

- Use TypeScript strict mode.
- Use App Router.
- Keep routes static/public-first.
- No server-only secrets in client code.
- No `.env` commits.
- Add `metadata` for core routes.
- Add `sitemap.ts` and `robots.ts`.
- Add branded `not-found.tsx` and `error.tsx`; keep copy helpful and claim-safe.
- Add favicon/icon/Open Graph assets or dynamic metadata/image generation using
  current Next.js-supported APIs.
- Add security headers in `next.config.ts` or the current Next.js-supported
  configuration surface:
  - `Content-Security-Policy` appropriate for a static marketing/docs site.
  - `X-Frame-Options` or `frame-ancestors` policy.
  - `X-Content-Type-Options: nosniff`.
  - `Referrer-Policy`.
  - `Permissions-Policy`.
- Use semantic landmarks.
- Use `next/link` for internal navigation.
- Avoid unnecessary `'use client'`; default to Server Components and static
  rendering unless interaction requires client-side JavaScript.
- Define a first-class color-scheme strategy before building tokens:
  - Either light-only for track 1 with explicit future dark-mode token slots, or
    light/dark support in the initial token system.
  - Do not add a theme package such as `next-themes` without current docs,
    maintenance check, and a real interaction requirement.
- Use `lucide-react` for icons only after dependency pin is selected.
- Avoid adding a UI component library in this track unless a concrete need
  appears.
- Add a link checker or equivalent link-validation script. Choose an actively
  maintained tool and document why. If using `lychee`, verify current install
  and Windows behavior before pinning it.

## Verification Strategy

Minimum commands after scaffold:

```powershell
npm run build
npm run lint
npm run check:links
changeguard scan --impact
changeguard verify --scope fast
```

Manual checks:

- Open homepage on desktop width around 1280px.
- Open homepage on mobile width around 375px.
- Visit `/docs`, `/pricing`, `/trust`, `/changelog`.
- Tab through top navigation, primary CTA, secondary CTA, and footer links.
- Confirm unresolved launch facts are visibly labeled and not clickable as real
  production claims.
- Confirm pricing planned features are not described as live.
- Confirm JavaScript-disabled or pre-hydration rendering still shows meaningful
  page content and navigation.
- Confirm branded `not-found` behavior for an unknown route.
- Confirm social/share metadata and icon assets are not generic scaffold
  defaults.

Optional but preferred once app exists:

- Playwright screenshot smoke for desktop and mobile.
- Lighthouse/accessibility smoke.
- Link checker for internal and external links.

## Definition Of Done

- Next.js public site scaffold exists and builds.
- SEO infrastructure exists: `sitemap.ts`, `robots.ts`, and metadata for core
  routes.
- Favicon/icon and Open Graph/social preview assets are Ledgerful-branded or
  intentionally generated; no generic scaffold icons remain.
- Branded `not-found.tsx` and `error.tsx` exist.
- Baseline security headers are configured and documented.
- Pages remain useful without unnecessary client-side JavaScript; `'use client'`
  is limited to components that require browser interactivity.
- Color-scheme strategy is documented, including whether track 1 ships
  light-only tokens with dark-mode slots or actual light/dark support.
- `npm run build` passes.
- `npm run lint` passes.
- `npm run check:links` or the chosen equivalent link-check command passes.
- `changeguard scan --impact` is current.
- `changeguard verify --scope fast` passes using web-appropriate verify steps.
- `PRODUCT.md` remains consistent with implemented public copy.
- `conductor/conductor.md` registry status is updated.
- Routes `/`, `/docs`, `/pricing`, `/trust`, and `/changelog` render.
- Public copy uses feature states for available/beta/local-only/hosted
  planned/enterprise planned.
- Hosted GitHub App, SSO, RBAC, SCIM, billing, hosted audit logs, hosted SOC2
  portal, and Slack/webhook claims are not presented as live.
- Local dashboard docs mention ephemeral token behavior without exposing tokens.
- Telemetry is described as opt-in/default-off.
- Local SOC2 export is described as a local zip export, not a hosted portal.
- Unresolved launch facts are visible and tracked.
- Desktop and mobile smoke checks are recorded.
- Keyboard/focus checks are recorded.
- No `.env`, `.changeguard/`, secrets, generated scratch output, or unsupported
  local state are committed.
- `conductor/WEB-0001-InitializePublicSite/review.md` has no open critical/high
  findings.

## Risks

- Public copy could overstate hosted/enterprise features before control-plane
  work exists.
- Scaffold defaults may introduce stale or inactive dependency pins if live
  checks are skipped.
- A generic SaaS visual system would weaken Ledgerful's evidence-first
  positioning.
- Vercel deployment cannot be verified locally until the Vercel CLI is
  installed and authenticated.
- ChangeGuard currently reports an empty pre-scaffold index as stale; treat that
  as a tool friction issue until app files exist.
