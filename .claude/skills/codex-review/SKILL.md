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
  powershell:"cmd /c \"codex exec --dangerously-bypass-approvals-and-sandbox -C \"\"C:\dev\ledgerful-web\"\" -s read-only -m gpt-5.4 -o output\review-codex.md \"\"Review the current git diff against the base branch. Identify bugs, regressions, missing tests, risky patterns, and unclear assumptions. Do not modify files. Give findings ordered by severity (critical/high/medium/low), then list the most important follow-up checks.\"\" < NUL\""
  output:"output/review-codex.md (gitignored - not committed; copy findings into conductor/<track>/review.md for durable evidence)"
  non_interactive_note:"--dangerously-bypass-approvals-and-sandbox skips interactive approval prompts that hang headless runs. `< NUL` prevents stdin blocking. The review artifact is scratch; the durable record is conductor/<track>/review.md."
}

rules:
  - keep review read-only
  - do not pass secrets or .env contents
  - treat critical/high findings as blockers
  - verify fixes with commands or manual evidence before closure
  - if Codex is unavailable, do a manual review and report the missing review signal
