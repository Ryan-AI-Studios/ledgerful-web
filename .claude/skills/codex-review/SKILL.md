---
name: codex-review
description: Use for a read-only review of non-trivial ledgerful-web diffs before completion, especially public claims, pricing, trust/security, accessibility, or route/layout changes.
---

# Codex Review for Ledgerful Web

Use review as a gate, not a substitute for source-backed claim checks.

review_targets:
  - public claim truth
  - feature-state accuracy
  - pricing caveats
  - trust/security wording
  - broken links or fake launch facts
  - accessibility and keyboard navigation
  - responsive layout regressions
  - SEO metadata gaps

command{
  powershell:"cmd /c \"codex exec --dangerously-bypass-approvals-and-sandbox -C \".\" -s read-only -m gpt-5.4 -o output\\review-codex.md \"\"Review the current phase of work. Compare the current git diff against the base branch, identify bugs, regressions, missing tests, risky patterns, and unclear assumptions. Do not modify files. Give findings ordered by severity (critical/high/medium/low), then list the most important follow-up checks.\"\" < NUL\""
  output:"output/review-codex.md (gitignored - not committed; copy findings into conductor/<track>/review.md for durable evidence)"
  non_interactive_note:"--dangerously-bypass-approvals-and-sandbox skips interactive approval prompts that hang headless runs. `< NUL` prevents stdin blocking. The review artifact is scratch; the durable record is conductor/<track>/review.md."
}

Key flags:

| Flag | Purpose |
|------|---------|
| `--dangerously-bypass-approvals-and-sandbox` | Skip interactive approval prompts in headless runs |
| `-C <path>` | Set workspace root (use "." for current dir) |
| `-s read-only` | Prevent the reviewer from modifying files |
| `-m gpt-5.4` | Use GPT-5.4 for the review (different training than Claude) |
| `-o output\review-codex.md` | Write scratch review to gitignored output directory |
| `--json` | Machine-readable output (for CI integration) |
| `< NUL` | Redirect stdin from NUL to prevent stdin blocking |

rules:
  - keep review read-only
  - do not pass secrets or .env contents
  - treat critical/high findings as blockers
  - verify fixes with commands or manual evidence before closure
  - if Codex is unavailable, do a manual review and report the missing review signal
