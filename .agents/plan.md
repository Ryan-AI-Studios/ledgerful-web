# Ledgerful Web Plan

This repo starts as the public web surface for Ledgerful. The roadmap source of
truth is `C:\dev\Roadmap.md`; the public-web responsibility is the WEB track
family. The authoritative track registry now lives in
[`conductor/conductor.md`](../conductor/conductor.md).

## Track Naming Convention

Use:

```text
WEB-####-ShortDescription
```

Examples:

- `WEB-0001-InitializePublicSite`
- `WEB-0002-TruthGatedPricing`
- `WEB-0003-TrustSecurityCenter`

Each non-trivial track should have a short objective, files touched, test plan,
manual evidence, and claim-audit notes. Use the conductor directory for active
track specs and plans; keep this file as a short orientation pointer.

## Active Roadmap-Derived Tracks

| Track | Status | Summary |
|---|---|---|
| WEB-0001-InitializePublicSite | Completed | Create the static public site, docs/pricing/trust/changelog routes, lint/build/link-check gates, Vercel-ready config, and launch placeholders that are visibly unresolved. |
| WEB-0002-TruthGatedMarketingPricing | Draft | Add an evidence-led edition ladder and feature matrix with explicit available/beta/local-only/hosted-planned/enterprise-planned states. |
| WEB-0003-TrustSecurityCenter | Planned | Document local-first data flow, telemetry/sync/hosted modes, release verification, responsible disclosure, and subprocessors once hosted services exist. |
| WEB-0004-InstallDocsReleaseVerification | Planned | Public install docs for CLI, MCP, GitHub Action, checksums, release smoke, and support bundle guidance. |
| WEB-0005-LaunchFactResolution | Planned | Resolve canonical GitHub URL, status URL, license wording, registry/package links, and any trust/social proof before public launch. |
| WEB-0006-DependencyBaseline | Completed | Refresh current Next/React/Tailwind/TypeScript/ESLint/lucide pins from npm and official docs; resolve actionable advisories and record compatibility pins. |
| WEB-0007-QuietPreviewDeployment | Completed | Record the live Vercel/domain baseline, block indexing during quiet preview, and maintain `docs/ToDo.md` as the durable deferred-work register. |

For current status, use `conductor/conductor.md`.

## Definition of Done

Before a WEB track can be marked complete:

- No public claim outruns the product reality in `C:\dev\Roadmap.md`.
- Feature states are explicit for shipped, beta, local-only, hosted planned, and enterprise planned capabilities.
- Placeholder links or launch facts are either resolved or visibly marked as unresolved.
- Desktop and mobile layout are manually checked.
- Keyboard navigation is checked for changed interactive elements.
- `npm run build` passes once the app is scaffolded.
- `npm run lint` passes once lint is configured.
- Link check passes when routes/docs links change.
- Accessibility/Lighthouse smoke is run for changed public pages when tooling exists.
- Vercel preview/deployment smoke is run when deployment is in scope and the Vercel CLI is installed.
- Dependency pins are refreshed from live package metadata before scaffold/upgrade work.

## Web-Specific Claim Audit

Block completion if copy implies these are live before the relevant evidence
exists:

- hosted GitHub App
- SSO/SAML/OIDC
- SCIM
- RBAC
- hosted audit logs
- billing portal
- Slack or external workflow webhooks
- hosted SOC2 portal
- public package registry links that have not been smoke-tested
- status page URL that does not exist
- license claim that has not been confirmed
- telemetry claims that omit opt-in/default-off behavior
- dashboard access docs that omit ephemeral local token behavior

## Immediate Track Guidance

Start with `WEB-0001-InitializePublicSite`. It should create a public site that
can deploy independently from the embedded dashboard and should not import the
dashboard API client. The first version can be static, but it must already
include truth gates for docs, pricing, trust, launch facts, local-first daemon
auth, telemetry opt-in, and honest-zero product limitations.
