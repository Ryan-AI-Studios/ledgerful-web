# WEB-0006 Dependency Baseline Spec

## Objective

Refresh the public site's dependency baseline from live registry metadata,
resolve actionable advisories without unsafe framework downgrades, and record
intentional compatibility pins.

## Requirements

- Query current npm versions for direct runtime and development dependencies.
- Run `npm outdated`, `npm audit`, and dependency-tree inspection.
- Preserve exact runtime package pins unless evidence supports a scoped update.
- Do not accept npm's suggested Next.js downgrade as an advisory fix.
- Eliminate the vendored PostCSS advisory with the narrowest tested override.
- Keep ESLint 9 until the Next.js plugin chain supports ESLint 10 without peer
  conflicts.
- Record why Node typings remain on the supported Node 20 line.
- Run build, lint, quiet-preview, link, audit, and ChangeGuard gates.

## Source Evidence

- Live npm registry metadata queried on 2026-06-26.
- Context7 `/vercel/next.js/v16.2.9` for Node and ESLint requirements.
- PostCSS advisory `GHSA-qx2v-qp2m-jg93`.
- Vercel Next.js PR `#93288`, which tested and merged the PostCSS 8.5.10 bump.
- Vercel Next.js issue `#91702` and its upstream-plugin compatibility context
  for ESLint 10.

## Out Of Scope

- Upgrading to canary or prerelease Next.js.
- Forcing ESLint 10 through incompatible lint plugins.
- Moving the project to Node 26 typings or runtime.
- Broad dependency churn unrelated to an advisory or compatibility requirement.

## Definition Of Done

- `npm audit` reports no known vulnerabilities.
- Direct dependency pins are current or have an explicit compatibility reason.
- `package-lock.json` captures the resolved PostCSS override.
- Full public-web and ChangeGuard verification passes.
- Review evidence records live versions, decisions, and removal criteria for
  temporary overrides.
