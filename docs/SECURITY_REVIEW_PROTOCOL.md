# AI-Code Adversarial Review Protocol — ledgerful-web

## Purpose

`ledgerful-web` is a public marketing/docs site, but it still receives AI-generated code and
handles public claims, install instructions, telemetry wiring, and trust/security copy. Research
shows combined SAST tools miss ~98% of formally-provable AI-code findings, so this protocol is the
higher-value gate for security-sensitive changes.

This document adapts the repo-specific subset of
`C:\dev\Security-and-Compliance-Plan.md` §6 (E1) to the web repo. It is enforced through a
required `ai-reviewed` status check before merge to `main`.

## Protocol

For every PR that touches security-sensitive surfaces (auth/CI/release scripts, public trust copy,
telemetry, `src/`, `public/`, `scripts/`, or `.github/`), the reviewer must confirm:

### Browser-bundle / secret exposure

- No service-role keys, Ed25519 private keys, daemon tokens, or `.env` contents reach the browser
  bundle. Review all `NEXT_PUBLIC_*` variables and confirm they are non-sensitive or absent.
- Telemetry, if enabled, uses only the official opt-in Supabase ingest endpoint/config path.
- No secrets are embedded in examples, screenshots, terminal output, or generated assets.

### Mock vs live data

- Mock data is never presented as live.
- Auth failures surface as errors; only 404 maps to an explicit empty state.
- Returned values or displayed claims carry data-source provenance (live / mock / stale /
  unavailable) where ambiguity exists.

### Dependency provenance

- No AI-suggested dependency is merged without the provenance check from
  `C:\dev\Security-and-Compliance-Plan.md` §3 (slopsquatting sweep).
- Run `npm run check:provenance` (or the CI provenance job) on any dependency change and inspect the
  report for flagged packages.

### Iteration discipline

- Security-sensitive code is not iterated by AI across multiple rounds without a cross-model review
  between iterations. Iterative AI "fixes" measurably add vulnerabilities.
- If a security fix requires more than one AI pass, a different model or human reviewer must
  approve the intermediate state before the next pass begins.

## Enforcement mechanism

Branch protection on `main` requires the `ai-reviewed` status check to pass before merge. The check
is set by the orchestrator (manager agent) after the review subagent passes this protocol.

Set the status from the orchestrator with the GitHub CLI:

```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  repos/Ryan-AI-Studios/ledgerful-web/statuses/<COMMIT_SHA> \
  -f state=success \
  -f context="ai-reviewed" \
  -f description="AI adversarial review passed"
```

Replace `<COMMIT_SHA>` with the head commit of the PR branch. If the review fails, set
`state=failure` and include the blocking finding in the `description` field.

> **Note:** Branch protection on private repos requires GitHub Pro. Until the repo goes public,
> the `ai-reviewed` status check is created but not enforced as a required check. Enforcement will
> be enabled when the repo transitions to public (tracked in `C:\dev\coordinated\conductor\deferred.md`).

## SAST caveat

> SAST is a floor, not proof — combined SAST tools miss ~98% of formally-provable AI-code findings.
> This protocol is the higher-value gate.

`npm run lint`, Semgrep, and gitleaks run in CI, but a clean CI run does not replace this review.