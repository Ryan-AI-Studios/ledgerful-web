# Ledgerful Web Deferred Work

This is the durable public-web action register. Current track governance lives in
the coordinated conductor. The repo-local `conductor/` directory is not merely historical:
it contains the frozen launch assets that the launch execution runbook
depends on, while current track specs and the deferred checklist live in the coordinated conductor.
Remove completed items instead of retaining overlapping status narratives.

Last reviewed: 2026-07-13. Web launch gate engineering is complete; engine-slice public flip done.
Remaining: web repo public flip (mechanical, see launch runbook evidence), then launch-day steps.

## Exit The Quiet Preview

Production search indexing stays off until every launch-blocking item below closes with evidence and
the explicit D1-GO decision is recorded.

- [x] Complete the final public-claim audit against backend/frontend evidence.
- [x] Add fail-safe env-driven indexing: exact `NEXT_PUBLIC_ALLOW_INDEXING=true` plus Vercel Production
  context is required; Preview/development/unset configurations remain `noindex`.
- [x] Verify the current CLI-deployed Vercel Preview across desktop/mobile/keyboard/themes/reduced
  motion/print/console/network, automated WCAG, and Lighthouse lab CWV.
- [x] Complete the consolidated pre-flip checklist in the coordinated deferred file. **Done 2026-07-13** — web-owned items verified: gitleaks clean, no private track numbers in public-facing copy, SECURITY.md confirmed, Actions hardening fully verified (fork-PR approval confirmed in UI, read-only token via API), Discussions enabled, README and issue template created, repo public, branch protection applied, private vuln reporting enabled.
- [x] Run the external 5-second comprehension test with at least three independent testers. **Done 2026-07-13** — ≥3 testers passed.
  - [x] Set `NEXT_PUBLIC_ALLOW_INDEXING=true` on the Vercel Production environment. **Done 2026-07-13** — set after D1-GO.
- [x] Verify the launched Production domain, sitemap, canonical/social metadata, console, lab CWV, and
  index/follow directives after the flip. **Done 2026-07-13** — verified post-flip.
- [ ] Around Day 28 post-launch, confirm CrUX field p75 and track any regression.

## Public Launch Facts

Owner: The web launch gate track plus the consolidated deferred checklist.

- [x] Complete LLC formation, individual-to-LLC IP assignment, counsel review, and license-in-force. **Done 2026-07-12** — Ledgerful, LLC formed (2026-07-01); IP assignment executed; COMMERCIAL-EXCEPTION.md counsel-reviewed; FL/USPTO trademark search clear; license **in force**. MIT→source-available naming already reconciled.
- [x] Verify anonymous access to the canonical GitHub repository. **Done 2026-07-12** — repo is public at `github.com/Ryan-AI-Studios/Ledgerful`.
- [x] Publish a tagged release with downloadable assets, companion checksums, SBOM/provenance. **Done 2026-07-12** — v0.1.8 released with 4 platform binaries, SHA-256 checksums, CycloneDX SBOM, cosign keyless signing, SLSA provenance, SBOM attestation, cargo auditable.
- [x] Verify the public MCP package decision/install path. **Done 2026-07-12** — `@ledgerful/mcp-server` v0.1.10 published on npm. GitHub Action is still planned (no action.yml in repo).
- [x] Provision and receipt-test `security@ledgerful.dev`, `hello@ledgerful.dev`, and
  `waitlist@ledgerful.dev`. **Done 2026-07-12** — all mailboxes provisioned via Cloudflare Email Routing; Kit waitlist provisioned.
- [x] Enable branch protection and require the `ai-reviewed` status check. **Done 2026-07-12** — engine repo: 1 review + `ai-reviewed` check + enforce-admins + no force-push.
- [x] Complete telemetry-ingest hardening and reconcile any resulting Trust copy.
- [x] Decide whether a public status page will exist. **Decided 2026-07-13: Option B — no status page at v1.** A local-first tool with no hosted control plane has no uptime to report; `launch-facts.ts` statusPage → `"planned"`. **Deferred until hosted services exist** (see Cross-Repo Dependencies). Do not link `status.ledgerful.dev` until a real status surface exists.
- [x] Add only source-backed trust or social proof; no placeholder customers, logos, uptime, or metrics.

## Deployment And Operations

- [x] Prove a Git-driven Preview deployment from a non-production branch. Branch
  `web-launch-gate` deployed READY at
  `https://ledgerful-qy3bw98uv-ryan-bourgoin-s-projects.vercel.app`; 178/178 deployed checks passed.
- [ ] Decide and document the long-term Vercel Preview protection policy.
- [ ] Confirm Vercel spend-management/usage-alert posture and record the Attack Challenge Mode runbook.
- [x] Run a full git-history secret scan before any repository visibility change. **Done 2026-07-12** — gitleaks scan clean (0 leaks, no FPs to baseline for ledgerful-web).

## Cross-Repo Dependencies

These capabilities remain visibly planned until their owning repositories ship release evidence.

- [ ] Frontend evidence for manager-grade multi-project portfolio and team/admin surfaces.
- [ ] Future control-plane `CP-0`: hosted tenancy, signed-summary ingestion, GitHub App webhooks, and
  hosted portfolio queries.
- [ ] Future control-plane `CP-1`: billing, subscriptions, entitlements, and customer portal.
- [ ] Public **status page** (`status.ledgerful.dev`) — deferred from launch (Option B, 2026-07-13). Revisit when the hosted control plane (CP-0/CP-1) ships and there is real uptime to report; then build the status surface and flip `launch-facts.ts` statusPage → `"resolved"` with the URL.
- [ ] Future control-plane `CP-2`: SAML/OIDC, SCIM, RBAC, hosted audit logs, retention controls, and
  enterprise audit export.
- [ ] Hosted data-deletion, subprocessor, and source-upload documentation after hosted services exist.