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
7. The human (repo owner) makes the final **product/merge decision** based
   on the plain-language review summary — not a code review.

## What the AI reviewer does NOT do

- Does not approve PRs. `ai-reviewed` is a status check, not a review
  approval. The human makes the merge decision.
- Does not modify code. The review is read-only.
- Does not replace automated CI checks (build, lint, e2e, link check,
  launch truth). All CI checks must also pass.

## Required automated checks (all mandatory for merge)

- `build-and-lint` (GitHub Actions)
- `test-links` (GitHub Actions)
- `test-browser` (GitHub Actions)
- `launch-truth-drift` (GitHub Actions, push only)
- `ai-reviewed` (AI Review Gate + orchestrator)
- `npm audit` (GitHub Actions security workflow)
- `Secret scan` (GitHub Actions security workflow)
- `Semgrep scan` (GitHub Actions security workflow)