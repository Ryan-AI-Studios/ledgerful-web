# Ledgerful Web Deferred Work

This is the durable public-web action register. Current track governance lives in
`C:\dev\coordinated\conductor\`; the repo-local `conductor/` directory is a legacy historical register.
Remove completed items instead of retaining overlapping status narratives.

Last reviewed: 2026-07-04. Track 0027 engineering is complete; public launch remains blocked.

## Exit The Quiet Preview

Production search indexing stays off until every launch-blocking item below closes with evidence and
the explicit D1-GO decision is recorded.

- [x] Complete the final public-claim audit against backend/frontend evidence.
- [x] Add fail-safe env-driven indexing: exact `NEXT_PUBLIC_ALLOW_INDEXING=true` plus Vercel Production
  context is required; Preview/development/unset configurations remain `noindex`.
- [x] Verify the current CLI-deployed Vercel Preview across desktop/mobile/keyboard/themes/reduced
  motion/print/console/network, automated WCAG, and Lighthouse lab CWV.
- [ ] Complete the consolidated pre-flip checklist in
  `C:\dev\coordinated\conductor\deferred.md`.
- [ ] Run the external 5-second comprehension test with at least three independent testers.
- [ ] Set `NEXT_PUBLIC_ALLOW_INDEXING=true` on the Vercel Production environment only after D1-GO.
- [ ] Verify the launched Production domain, sitemap, canonical/social metadata, console, lab CWV, and
  index/follow directives after the flip.
- [ ] Around Day 28 post-launch, confirm CrUX field p75 and track any regression.

## Public Launch Facts

Owner: Track `0027-WebLaunchGate` plus the consolidated deferred checklist.

- [ ] Complete LLC formation, individual-to-LLC IP assignment, counsel review, and license-in-force.
- [ ] Verify anonymous access to the canonical GitHub repository before exposing repository links.
- [ ] Publish a tagged release with downloadable assets, companion checksums, SBOM/provenance, then
  verify every link anonymously.
- [ ] Verify the public MCP package decision/install path and GitHub Action setup against real releases.
- [ ] Provision and receipt-test `security@ledgerful.dev`, `hello@ledgerful.dev`, and
  `waitlist@ledgerful.dev` (or replace the latter two with a verified form).
- [ ] Enable branch protection and require the `ai-reviewed` status check.
- [ ] Complete telemetry-ingest hardening and reconcile any resulting Trust copy.
- [ ] Decide whether a public status page will exist; do not add a status link before it does.
- [ ] Add only source-backed trust or social proof; no placeholder customers, logos, uptime, or metrics.

## Deployment And Operations

- [ ] Prove a Git-driven Preview deployment from a non-production branch and record its Vercel URL.
  The verified Track 0027 deployment was CLI-driven and does not close this item.
- [ ] Decide and document the long-term Vercel Preview protection policy.
- [ ] Confirm Vercel spend-management/usage-alert posture and record the Attack Challenge Mode runbook.
- [ ] Run a full git-history secret scan before any repository visibility change.

## Cross-Repo Dependencies

These capabilities remain visibly planned until their owning repositories ship release evidence.

- [ ] Frontend evidence for manager-grade multi-project portfolio and team/admin surfaces.
- [ ] Future control-plane `CP-0`: hosted tenancy, signed-summary ingestion, GitHub App webhooks, and
  hosted portfolio queries.
- [ ] Future control-plane `CP-1`: billing, subscriptions, entitlements, and customer portal.
- [ ] Future control-plane `CP-2`: SAML/OIDC, SCIM, RBAC, hosted audit logs, retention controls, and
  enterprise audit export.
- [ ] Hosted data-deletion, subprocessor, and source-upload documentation after hosted services exist.
