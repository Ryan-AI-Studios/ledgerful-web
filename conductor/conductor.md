# Ledgerful Web Conductor

The conductor system structures incremental delivery for the Ledgerful public
web repo. This repo owns the public marketing/docs/trust/pricing surface, not
the embedded dashboard or the future hosted control plane.

## Track Naming Convention

All tracks use:

```text
WEB-####-ShortDescription
```

Examples:

- `WEB-0001-InitializePublicSite`
- `WEB-0002-TruthGatedMarketingPricing`
- `WEB-0003-TrustSecurityCenter`

Each track lives in `conductor/<trackId>/` and must include:

- `spec.md` - objective, requirements, scope, source evidence, and Definition of Done.
- `plan.md` - bite-sized implementation checklist with verification steps.
- `review.md` - created when implementation begins, used for review findings and closure evidence.

## Authority Order

When sources conflict, higher entries win:

1. User/run prompt.
2. `C:\dev\Roadmap.md`.
3. `AGENTS.md`.
4. `PRODUCT.md`.
5. `conductor/conductor.md`.
6. `conductor/<track>/spec.md`.
7. `conductor/<track>/plan.md`.
8. `C:\dev\ChangeGuard\docs\Frontend-Notes.md`.
9. `C:\dev\ledgerful-frontend\docs\Backend-Notes.md`.
10. Current package/framework docs and release notes.

## Track Definition Of Done

Before any track can be marked **Completed**:

- The track `spec.md` Definition of Done is fully satisfied.
- No public claim outruns `C:\dev\Roadmap.md`, backend conductor evidence, or frontend contract docs.
- Feature states are explicit for available, beta, local-only, hosted planned, and enterprise planned capabilities.
- No fake customer logos, fake status links, fake uptime claims, unverified package links, or unsupported license claims are presented as real.
- Mock-only or honest-zero data is not described as live production evidence.
- Desktop and mobile browser smoke checks have been run for changed UI.
- Keyboard navigation and visible focus states have been checked for changed interactive elements.
- `npm run build` passes once the app is scaffolded.
- `npm run lint` passes once lint is configured.
- Link check passes when public links or docs routes change.
- Accessibility/Lighthouse smoke is run when public layout changes and tooling exists.
- `changeguard scan --impact` is current.
- `changeguard verify --scope fast` passes with repo-appropriate verification steps.
- Review findings have no open critical/high items.
- Registry status in this file is updated.

## Track Statuses

- **Planned** - Backlog item exists but has no execution draft.
- **Planning** - Spec/plan are being authored or revised.
- **Draft** - Spec/plan/review packet are ready for implementation, but app/code work has not started.
- **In Progress** - Implementation has started.
- **Blocked** - Work cannot continue without external input, credentials, or upstream fixes.
- **Completed** - Definition of Done is satisfied and evidence is recorded.

## Track Registry

| Track | Status | Owner | Summary |
|---|---|---|---|
| WEB-0001-InitializePublicSite | Completed | manager | Scaffold the static public site, define the first public routes, add launch-safe truth gates, configure web verification, and establish the visual/product baseline. |
| WEB-0002-TruthGatedMarketingPricing | Completed | manager | Add feature status matrix and pricing copy with available/beta/local-only/hosted-planned/enterprise-planned states. |
| WEB-0003-TrustSecurityCenter | Completed | manager | Document local-first data flow, telemetry/sync/hosted modes, release verification, responsible disclosure, and subprocessors once hosted services exist. |
| WEB-0004-InstallDocsReleaseVerification | Completed | manager | Public install docs for CLI, MCP, GitHub Action, checksums, release smoke, and support bundle guidance. |
| WEB-0005-LaunchFactResolution | In Progress | manager | Resolve canonical GitHub URL, status URL, license wording, registry/package links, and trust/social proof before public launch. |
| WEB-0006-DependencyBaseline | Completed | manager | Refresh current Next/React/Tailwind/TypeScript/ESLint/lucide pins from npm and official docs; record why selected dependencies are active and maintained. |
| WEB-0007-QuietPreviewDeployment | Completed | manager | Record the live Vercel/domain baseline, block indexing during quiet preview, and maintain a durable deferred-work register. |

## How To Start A Track

1. Read `AGENTS.md`, `PRODUCT.md`, this conductor, and the track `spec.md`.
2. Run `ai-brains preflight --summary` with the repo-local `.env` context.
3. Run `changeguard doctor`, `changeguard ledger status --compact`, and `changeguard scan --impact`.
4. Confirm dependency docs/pins are current when the track changes packages.
5. If status is **Draft**, set the track status to **In Progress**.
6. Start implementation against `plan.md`.
7. Create/update `conductor/<track>/review.md` during review.

## How To Close A Track

1. Check every task in `plan.md`.
2. Run required verification and manual browser checks.
3. Record evidence and review closure.
4. Set the registry status to **Completed**.
5. Commit only intentional files.
6. Push after hooks pass.
