# WEB-0002 Truth-Gated Marketing And Pricing Spec

## Objective

Turn the initial pricing shell into a buyer-readable, evidence-led edition
ladder and feature matrix that makes shipped, beta, local-only, hosted-planned,
and enterprise-planned boundaries impossible to mistake.

## Problem

The current page has the right state vocabulary but still carries launch-risk:

- `Team Hosted Beta` reads like an available beta even though the control plane
  is only `hosted planned`.
- `Enterprise / Contact` implies a contact path that has not been verified.
- Repeated pricing cards make planned editions visually equivalent to available
  local capability.
- Feature rows carry states but no structured evidence or caveat.
- `Portfolio reports`, team signatures/devices, MCP, and GitHub Action rows need
  evidence-specific qualification before they can remain beta.

## Audience And Decision

Primary readers:

- Engineering managers comparing local evaluation and team adoption.
- Developers deciding what they can install today.
- Security reviewers checking whether paid or hosted language implies source
  upload, identity, or audit capabilities that do not exist.

The page must answer:

1. What can I use locally today?
2. What is beta or release-blocked?
3. What will require a future hosted control plane?
4. Which commercial terms are decided, and which remain unannounced?

## Source Authority

Use this order:

1. User/run prompt.
2. `C:\dev\Roadmap.md`, especially `WEB-1`, Commercial Packaging, and Pricing
   Notes.
3. `AGENTS.md`, `PRODUCT.md`, and `docs/ToDo.md`.
4. Current `src/lib/content/features.ts` and `pricing.ts`.
5. `C:\dev\ChangeGuard\conductor\conductor.md`.
6. `C:\dev\ledgerful-frontend\conductor\conductor.md`.
7. `C:\dev\ChangeGuard\docs\Frontend-Notes.md`.
8. `C:\dev\ledgerful-frontend\docs\Backend-Notes.md`.
9. Current release/package smoke evidence.

## Truth Model

Every edition and feature row must carry exactly one approved state:

- `available`
- `beta`
- `local-only`
- `hosted planned`
- `enterprise planned`

Each feature row must also carry:

- A concise buyer-facing description.
- An evidence reference or owning upstream track.
- A caveat when install/release proof is incomplete.
- A clear edition boundary.

State rules:

- Local CLI/engine and signed ledger may be `available`.
- Local dashboard and SOC2 ZIP export are `local-only`.
- MCP and GitHub Action remain `beta` only with explicit public release-smoke
  caveats.
- Team-local sync may be described as local-only/beta according to current
  release evidence; it must never imply hosted sync.
- Hosted portfolio, GitHub App, billing, team roles, and retained hosted audit
  state are `hosted planned`.
- SSO/SAML/OIDC, SCIM, RBAC, hosted audit export, custom retention, and support
  SLA are `enterprise planned`.
- Local safety features must not be presented as hosted-only or metered by CLI
  command usage.
- Source upload must not be implied as required for paid local value.

## Commercial Copy Rules

- Keep `$0` only if the Free/local packaging decision remains supported by the
  roadmap; do not infer open-source license terms from price.
- Do not invent Pro, hosted, usage, or enterprise dollar amounts.
- Use `Pricing not announced` or an equivalent explicit planned label instead
  of presenting planned billing as an active price.
- Rename `Team Hosted Beta` so the edition cannot be mistaken for a live beta.
- Remove `Contact` language unless a real, monitored contact path is verified.
- Do not add checkout, billing, trial, sales, or SLA CTAs in this track.
- Footnote GitHub App, SSO, RBAC, SCIM, billing, hosted audit logs, support SLA,
  and optional self-hosting as planned.

## Information Architecture

Replace the equal-weight card wall with two coordinated layers:

1. **Edition ladder** — a compact progression from Free/local through future
   enterprise, with local availability visually dominant and planned editions
   visibly receding.
2. **Evidence matrix** — a semantic comparison table grouping core engine,
   collaboration, GitHub/release, compliance, hosted, and enterprise features.

Design direction:

- Preserve the existing steel-blue, graphite, brass/green instrument palette
  and Archivo/JetBrains Mono identity.
- Treat the page like a procurement calibration sheet paired with engineering
  evidence, not a generic SaaS pricing-card template.
- Use status text and explanatory notes in addition to color.
- Do not introduce new fonts, a component library, fake screenshots, fake
  metrics, gradient text, glassmorphism, or repeated identical cards.

## Accessibility And Responsive Requirements

- Use a real semantic table for the comparison matrix.
- Provide row headers and meaningful column headers.
- Preserve readable state labels without relying on color.
- At narrow widths, use controlled horizontal scrolling or an equivalent
  semantic responsive treatment; do not duplicate contradictory data.
- Ensure no text or table content overflows at 375px.
- Maintain visible focus states for links and any disclosure controls.
- Keep body text contrast at WCAG 2.2 AA.
- Avoid hover-only caveats.

## Automated Truth Checks

Add a build-output check that fails when:

- `/pricing` omits an approved feature-state label.
- Live-sounding hosted or enterprise wording appears without a planned state.
- `Team Hosted Beta` or an unverified `Contact` CTA returns.
- Quiet-preview `noindex` metadata disappears.

TypeScript types should make evidence/caveat fields mandatory where required.

## Out Of Scope

- Selecting final paid prices.
- Implementing checkout, billing, entitlements, trials, or a contact backend.
- Building hosted portfolio, GitHub App, tenant, identity, or audit services.
- Changing backend/frontend product contracts.
- Resolving MCP, release, GitHub Action, license, or status-page launch facts.
- Enabling public search indexing.

## Definition Of Done

- Edition names and price labels cannot imply unavailable hosted capability.
- Every material feature has an approved state and evidence/caveat.
- The page clearly separates usable local capability from future hosted and
  enterprise work.
- No unsupported price, license, uptime, customer, contact, or SLA claim ships.
- Semantic table markup and mobile behavior are verified.
- Automated pricing-truth and quiet-preview checks pass.
- Desktop 1280px, tablet 768px, and mobile 375px smokes pass.
- Keyboard and visible-focus checks pass.
- `npm run build`, `npm run lint`, `npm run check:pricing`,
  `npm run check:preview`, and `npm run check:links` pass.
- `changeguard scan --impact` and `changeguard verify --scope fast` pass.
- Vercel Preview deployment is verified before production.
- Review has no open critical/high truth, accessibility, or responsive findings.
- `docs/ToDo.md` and the conductor registry are reconciled.
