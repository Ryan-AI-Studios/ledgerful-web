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
  powershell:"cmd /c \"codex exec -C \"\"C:\dev\ledgerful-web\"\" -s read-only -m gpt-5.4 -o output\\review.md \"\"Review the current diff for public-web regressions, unsupported claims, accessibility issues, and missing verification. Do not modify files.\"\" < NUL\""
}

rules:
  - keep review read-only
  - do not pass secrets or .env contents
  - treat critical/high findings as blockers
  - verify fixes with commands or manual evidence before closure
  - if Codex is unavailable, do a manual review and report the missing review signal
