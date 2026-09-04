# AI Code Review Protocol

## How the `ai-reviewed` status check works

1. A pull request is opened against `main`.
2. The `AI Review Gate` workflow automatically posts a `pending` status check
   named `ai-reviewed` on the PR's head commit.
3. Branch protection requires `ai-reviewed` before merge — the PR cannot be
   merged until it reports `success`.
4. An independent AI adversarial review (cross-model, read-only) is run
   against the PR diff. The reviewer checks for:
   - Security vulnerabilities (injection, secrets, auth bypass)
   - Correctness regressions (broken logic, data loss, state corruption)
   - Placeholder/stub/fake code shipped as real
   - Truth-gate violations (false claims, mislabeled feature states)
   - Broken links, missing tests for new behavior
5. If the review reports **no blocking findings** (no P0 or P1), the
   orchestrator sets `ai-reviewed` to `success` via:
   ```powershell
   gh api repos/Ryan-AI-Studios/ledgerful-web/statuses/<PR_HEAD_SHA> \
     -X POST \
     -f state=success \
     -f context=ai-reviewed \
     -f description="AI adversarial review passed — no blocking findings"
   ```
6. If the review reports blocking findings, the orchestrator fixes them,
   pushes new commits, and re-runs the review until clean.
7. A reviewer's **"verification gap, not a defect in this diff"** finding
   must become a `deferred.md` row (coordinated conductor) before the PR
   merges — do not leave gaps only in review prose.
8. The human (repo owner) makes the final **product/merge decision** based
   on the plain-language review summary — not a code review.

## What the AI reviewer does NOT do

- Does not approve PRs. `ai-reviewed` is a status check, not a review
  approval. The human makes the merge decision.
- Does not modify code. The review is read-only.
- Does not replace the live required status checks listed below.

## Required automated checks (live branch protection)

Live `main` branch protection (`required_status_checks.contexts`, re-verified
2026-09-03) requires a pull request plus these four checks before merge:

- `build-and-lint` (GitHub Actions)
- `test-links` (GitHub Actions)
- `test-browser` (GitHub Actions)
- `ai-reviewed` (AI Review Gate + orchestrator)

`launch-truth-drift` still runs (push to `main`, weekday schedule, and
`workflow_dispatch`). It is **not** a required PR check.

## Advisory (non-blocking) security checks

`.github/workflows/security.yml` still runs on pull_request, push to `main`,
and the weekly schedule. Job names include `Secret scan`, `Semgrep scan`, and
`npm audit`. Those jobs **do not gate merge** unless branch protection is
updated to include them.

HITL names if protection is updated: `Secret scan`, `Semgrep scan`, `npm audit`.
Default is honesty against live protection; this track does not flip GitHub
settings.
