# Initialize Public Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use the repo-local `.agents/skills/implement/SKILL.md` and `impeccable` brand guidance to implement this plan task-by-task.

**Goal:** Build the first static public Ledgerful web site with truthful launch-safe homepage, docs, pricing, trust, and changelog routes.

**Architecture:** Use a static/public-first Next.js App Router app. Content should be structured in typed local data modules so public claims, feature states, and launch facts can be audited without scraping JSX. Do not introduce server APIs, dashboard clients, billing, auth, or hosted-control-plane code in this track.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, ESLint, lucide-react after live pin refresh.

---

## Task 1: Refresh Dependency Baseline

**Files:**
- Create or modify: `conductor/WEB-0001-InitializePublicSite/review.md`
- No package files yet unless scaffold occurs in Task 2.

**Step 1: Query live package versions**

Run:

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

Expected: each command returns a single version.

**Step 2: Check official docs**

Use Context7 or official docs for:

- Next.js App Router install/scaffold.
- Tailwind CSS v4 with Next.js.
- Vercel deployment/environment basics.

Expected: implementation notes cite the docs used and the selected versions.

**Step 3: Record the baseline**

Create `conductor/WEB-0001-InitializePublicSite/review.md` with:

```markdown
# WEB-0001 Review

## Dependency Baseline

- Date:
- next:
- react:
- react-dom:
- typescript:
- tailwindcss:
- @tailwindcss/postcss:
- eslint:
- lucide-react:
- Docs consulted:

## Findings

No findings yet.
```

**Step 4: Run no commit yet**

Do not commit until the scaffold and verification config are complete enough to pass hooks.

## Task 2: Scaffold The App

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.*` or framework default lint config
- Create: `postcss.config.*`
- Create: `app/` or `src/app/` depending on scaffold choice
- Create: `public/` if scaffold generates it

**Step 1: Scaffold non-interactively**

Use the current official Next.js scaffold command with TypeScript, Tailwind,
ESLint, App Router, and import alias. Example shape, adjusted to current docs:

```powershell
npx create-next-app@latest . --yes --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Expected: app files and package files are generated in the repo root without overwriting `AGENTS.md`, `PRODUCT.md`, `.agents/`, or `conductor/`.

**Step 2: Resolve scaffold conflicts**

If the scaffold tries to overwrite `AGENTS.md`, preserve the existing repo-specific file.

Expected: `AGENTS.md` remains the Ledgerful Web agent rules.

**Step 3: Install dependencies**

Run:

```powershell
npm install
```

Expected: dependencies install and `package-lock.json` is created or updated.

## Task 3: Establish Content Data Model

**Files:**
- Create: `src/lib/content/features.ts`
- Create: `src/lib/content/launch-facts.ts`
- Create: `src/lib/content/navigation.ts`
- Create: `src/lib/content/pricing.ts`
- Create: `src/lib/content/changelog.ts`

**Step 1: Define feature state types**

Add:

```ts
export type FeatureState =
  | "available"
  | "beta"
  | "local-only"
  | "hosted planned"
  | "enterprise planned";

export type FeatureItem = {
  name: string;
  state: FeatureState;
  description: string;
  evidence?: string;
};
```

**Step 2: Add launch fact model**

Add:

```ts
export type LaunchFactStatus = "resolved" | "unresolved" | "planned";

export type LaunchFact = {
  label: string;
  status: LaunchFactStatus;
  value: string;
  note: string;
  href?: string;
};
```

**Step 3: Encode initial launch facts**

Include canonical GitHub URL, status page URL, license wording, MCP package,
release downloads/checksums, and GitHub Action install link. Mark unresolved
items as `unresolved` instead of linking to fake destinations.

Expected: content can be rendered without hardcoding claims in page JSX.

## Task 4: Create Global Layout And Visual Foundation

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/site-header.tsx`
- Create: `src/components/site-footer.tsx`
- Create: `src/components/status-pill.tsx`

**Step 1: Set metadata**

Add title/description metadata for Ledgerful Web.

Expected: browser title and metadata reflect Ledgerful as local-first change
intelligence and provenance for programming teams.

**Step 2: Define OKLCH tokens**

Use OKLCH CSS custom properties. Start from the `impeccable` seed hue near 113
degrees, but compose a disciplined evidence-first palette with contrast checks.

Expected: no hex color literals in authored CSS except third-party resets if scaffolded.

**Step 3: Build navigation**

Header links:

- Home.
- Docs.
- Pricing.
- Trust.
- Changelog.

Footer links repeat core pages plus unresolved launch facts where useful.

Expected: all internal nav works via `next/link`.

## Task 5: Build Homepage

**Files:**
- Modify: `src/app/page.tsx`
- Create components as needed under `src/components/home/`.

**Step 1: Hero**

Build first viewport around:

- Ledgerful name.
- Local-first change intelligence and provenance.
- Clear proof-oriented subcopy.
- Primary CTA to `/docs`.
- Secondary CTA to `/trust` or `/pricing`.

Expected: first viewport clearly signals Ledgerful and does not read as generic AI SaaS.

**Step 2: Evidence layer**

Add a product-evidence section using command-output style, release verification
flow, signed evidence concept, or feature status summary.

Expected: no fake metrics, fake customers, or fake logos.

**Step 3: Boundary section**

Explain local engine, embedded dashboard, public web, and future control plane.

Expected: visitor understands this repo is public web, not the dashboard or hosted API.

## Task 6: Build Docs Index

**Files:**
- Create: `src/app/docs/page.tsx`
- Create components as needed under `src/components/docs/`.

**Step 1: Add docs categories**

Sections:

- Install and smoke test.
- Dashboard launch/local token.
- MCP setup.
- GitHub Action.
- SOC2 export.
- Local team sync.
- Release verification.

**Step 2: Gate unresolved facts**

MCP/public release/GitHub Action links that are not smoke-tested must show
`unresolved` or `planned`, not a fake link.

Expected: docs index is useful but honest.

## Task 7: Build Pricing Page

**Files:**
- Create: `src/app/pricing/page.tsx`
- Create components as needed under `src/components/pricing/`.

**Step 1: Add editions**

Render:

- Free / Local.
- Pro / Team Local.
- Team Hosted Beta.
- Enterprise / Contact.

**Step 2: Attach feature states**

Every significant feature row must show one of the approved feature states.

Expected: SSO, RBAC, SCIM, billing, GitHub App, hosted audit logs, and hosted SOC2 portal are not presented as live.

## Task 8: Build Trust Page

**Files:**
- Create: `src/app/trust/page.tsx`
- Create components as needed under `src/components/trust/`.

**Step 1: Data flow**

Explain:

- Local default.
- Optional telemetry.
- Local sync.
- Future hosted mode.

**Step 2: Security posture**

Include:

- No source upload by default.
- No secrets in browser.
- Local SOC2 zip export.
- Release verification.
- Responsible disclosure starter.
- Subprocessors status.

Expected: trust content is security-reviewer-readable and avoids hosted claims.

## Task 9: Build Changelog Page

**Files:**
- Create: `src/app/changelog/page.tsx`

**Step 1: Add starter entries**

Group entries by:

- Public web.
- Local engine.
- Dashboard app.
- Planned hosted/control-plane.

Expected: page does not imply releases that have not happened.

## Task 10: Configure Web Verification

**Files:**
- Modify ignored local file: `.changeguard/config.toml`
- Modify tracked docs if needed: `AGENTS.md` or `conductor/WEB-0001-InitializePublicSite/review.md`

**Step 1: Update ChangeGuard verify steps**

After `package.json` scripts exist, update local ignored `.changeguard/config.toml` verify steps to include:

```toml
[[verify.steps]]
description = "Build public web"
command = "npm run build"
timeout_secs = 300

[[verify.steps]]
description = "Lint public web"
command = "npm run lint"
timeout_secs = 300
```

Keep `git diff --check` steps if useful.

**Step 2: Verify config**

Run:

```powershell
changeguard config verify
changeguard verify --scope fast
```

Expected: both pass.

## Task 11: Full Verification And Manual Smoke

**Files:**
- Modify: `conductor/WEB-0001-InitializePublicSite/review.md`
- Modify: `conductor/WEB-0001-InitializePublicSite/plan.md`
- Modify: `conductor/conductor.md`

**Step 1: Run build/lint**

Run:

```powershell
npm run build
npm run lint
```

Expected: both pass.

**Step 2: Run ChangeGuard**

Run:

```powershell
changeguard scan --impact
changeguard verify --scope fast
changeguard ledger status --compact
```

Expected: impact report current, verification passes, no pending tx/drift.

**Step 3: Browser smoke**

Start dev server:

```powershell
npm run dev
```

Check:

- `/` desktop 1280px.
- `/` mobile 375px.
- `/docs`.
- `/pricing`.
- `/trust`.
- `/changelog`.
- Keyboard tab order and focus states.

Expected: all routes render; no overlapping text; unresolved facts visible.

**Step 4: Record evidence**

Update `review.md` with commands, manual checks, dependency versions, docs consulted, and findings.

## Task 12: Close Track

**Files:**
- Modify: `conductor/conductor.md`
- Modify: `conductor/WEB-0001-InitializePublicSite/plan.md`
- Modify: `conductor/WEB-0001-InitializePublicSite/review.md`

**Step 1: Mark checklist complete**

Convert completed task checkboxes/statuses in this plan to done markers.

**Step 2: Update registry**

Set `WEB-0001-InitializePublicSite` to `Completed` in `conductor/conductor.md`.

**Step 3: Commit and push**

Run:

```powershell
git status --short
git diff --check
git add <intentional files>
git commit -m "feat: initialize ledgerful public web"
git push
```

Expected: hooks pass and `origin/main` receives the completed track.
