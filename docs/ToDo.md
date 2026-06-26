# Ledgerful Web Deferred Work

This is the durable register for work intentionally deferred from the public
web. `conductor/conductor.md` remains authoritative for track status, and
`C:\dev\Roadmap.md` remains authoritative for cross-repo product sequencing.
When an item is completed, record its evidence in the owning track and remove
it from this file instead of leaving overlapping status narratives.

Last reviewed: 2026-06-26.

## Exit The Quiet Preview

Do not restore search indexing until every launch-blocking item below is either
resolved with evidence or deliberately removed from launch scope.

- [ ] Resolve the launch facts in `WEB-0005-LaunchFactResolution`.
- [ ] Complete a final public-claim audit against the backend and frontend
  conductor state.
- [ ] Run desktop, mobile, keyboard, link, and accessibility/Lighthouse smokes
  against the production domain.
- [ ] Replace the quiet-preview policy with an explicit launch change that
  restores crawl access and indexable metadata.
- [ ] Verify the launched production domain, sitemap, canonical URLs, social
  metadata, and search directives after that deployment.

## Public Launch Facts

Owner: `WEB-0005-LaunchFactResolution`.

- [ ] Verify anonymous access to the canonical public GitHub repository before
  linking it from the site.
- [ ] Decide whether a public status page will exist; publish and verify it
  before adding a status link.
- [ ] Confirm public license wording with release/legal evidence.
- [ ] Verify the public MCP registry or npm package install path with a real
  release smoke.
- [ ] Publish a tagged release with downloadable assets and checksums, then
  verify those links anonymously.
- [ ] Publish and verify the GitHub Action installation path and public setup
  documentation.
- [ ] Add only source-backed trust or social proof; do not add placeholder
  customers, logos, uptime, or adoption metrics.

## Open Public-Web Tracks

- [ ] `WEB-0002-TruthGatedMarketingPricing` (Draft): finish the buyer-facing feature
  matrix and pricing boundaries for available, beta, local-only, hosted
  planned, and enterprise planned capabilities.
- [ ] `WEB-0003-TrustSecurityCenter`: complete local-first data-flow,
  telemetry, sync, hosted-mode, responsible-disclosure, release-verification,
  and future-subprocessor documentation.
- [ ] `WEB-0004-InstallDocsReleaseVerification`: publish verified CLI, MCP,
  GitHub Action, dashboard, SOC2 export, sync, checksums, and support-bundle
  instructions.
- [ ] `WEB-0005-LaunchFactResolution`: close every item in the launch-facts
  section above.
## Deployment And Operations

- [ ] Prove Git-driven Preview deployment on a non-production branch and record
  the resulting Vercel URL.
- [ ] Add CI that runs build, lint, quiet-preview policy, and link checks for
  pull requests.
- [ ] Decide and document Vercel Preview deployment protection policy.
- [ ] Before public launch, decide whether Preview should receive an explicit
  `NEXT_PUBLIC_SITE_URL`; it currently uses the correct source fallback while
  Production is explicitly set to `https://www.ledgerful.dev`.
- [ ] Decide whether `@ledgerful.dev` will receive or send email. Until an
  email provider is selected, do not invent MX or DKIM records. If email remains
  unused, publish restrictive no-mail SPF and DMARC policy.

## Quality And Maintenance

- [ ] Add a repository-owned browser/e2e suite; the initial route smoke used a
  system Chrome/Playwright installation without a committed test harness.
- [ ] Run and record Lighthouse/accessibility evidence for production pages.
- [ ] Create `DESIGN.md` from the implemented visual system so future tracks do
  not rely on provisional design decisions in review notes.

## Cross-Repo Dependencies

These capabilities must remain visibly planned until their owning repositories
ship and provide release evidence.

- [ ] Backend release evidence for the MCP public package and GitHub Action
  installation paths.
- [ ] Frontend evidence for manager-grade multi-project portfolio and team/admin
  surfaces before corresponding public claims are upgraded.
- [ ] Future control-plane `CP-0`: hosted tenancy, signed-summary ingestion,
  GitHub App webhooks, and hosted portfolio queries using the selected Vercel
  and Supabase baseline.
- [ ] Future control-plane `CP-1`: billing, subscriptions, entitlements, and
  customer portal.
- [ ] Future control-plane `CP-2`: SAML/OIDC, SCIM, RBAC, hosted audit logs,
  retention controls, and enterprise audit export.
- [ ] Hosted data-deletion, subprocessor, and source-upload documentation after
  hosted services actually exist.
