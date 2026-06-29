---
name: implement
description: Use when implementing a ledgerful-web public-web track end-to-end. Loads with onboarding and enforces truth-gated public copy, review convergence, and web verification.
---

# Implement Ledgerful Web Track

identity{
  repo:"C:\dev\ledgerful-web"
  source_of_truth:"C:\dev\Roadmap.md + AGENTS.md + .agents/plan.md"
  default_track_prefix:"WEB"
  clearance:"one public-web track or slice at a time"
}

loop:
  - plan
  - implement
  - targeted_checks
  - truth_review
  - manual_test
  - full_gate
  - finalize

plan{
  before_edit:
    - read AGENTS.md
    - read .agents/plan.md
    - read C:\dev\Roadmap.md
    - read C:\dev\coordinated\coordination.md and C:\dev\coordinated\coordination.md when copy/docs mention dashboard, daemon APIs, telemetry, compliance, or local auth
    - identify whether the work affects claims, pricing, trust, docs, SEO, or deployment
  output:
    - target pages/components/docs
    - claims being added or changed
    - source evidence for those claims
    - tests/checks to run
    - launch facts that remain unresolved
}

implement{
  rules:
    - make the smallest complete slice
    - use real product evidence or clearly labeled planned states
    - do not invent customer logos, status pages, license claims, package links, or uptime claims
    - do not add server APIs, billing, webhook, or tenant code without explicit scope
    - keep docs and copy source-backed
}

research{
  required_when:
    - package/framework API behavior matters
    - dependency version or maintenance status matters
    - Vercel behavior matters
    - SEO/metadata conventions matter
    - security/compliance wording references external standards
    - public docs link to external install or API behavior
  precedence:
    - active files
    - roadmap
    - backend/frontend conductor state
    - frontend/backend contract docs
    - official docs
    - current package docs
  commands:
    - npm view next version
    - npm view react version
    - npm view react-dom version
    - npm view typescript version
    - npm view tailwindcss version
    - npm view @tailwindcss/postcss version
    - npm view eslint version
    - npm view lucide-react version
}

targeted_checks{
  examples:
    - npm run build
    - npm run lint
    - npm run test:unit -- <test-file>
    - link checker for touched docs
}

truth_review{
  review_for:
    - feature-state accuracy
    - no hosted/control-plane overclaims
    - local daemon auth and no-secrets wording
    - telemetry opt-in/default-off wording
    - honest-zero limitations for metrics not yet populated
    - project validation warnings presented as needs-attention signals
    - pricing and enterprise caveats
    - link validity
    - launch fact placeholders
    - accessibility
    - mobile layout
    - keyboard navigation
    - SEO titles/descriptions
  blockers:
    - fake or unresolved trust signal presented as real
    - mock/local-only feature presented as hosted/live
    - enterprise feature claim without planned-state caveat
    - broken primary CTA or install path
}

manual_test{
  required_for_ui:true
  record:
    - page/route tested
    - viewport sizes
    - interaction path
    - result
  viewports:
    - 375px mobile
    - 768px tablet when layout changes
    - 1280px desktop
}

full_gate{
  commands:
    - npm run build
    - npm run lint
    - npm run test:unit when tests exist or touched
    - npm run test:e2e when interaction flows are touched
  extra:
    - link check when docs/links changed
    - Lighthouse/accessibility smoke when public layout changed
    - Vercel preview smoke when deployment is in scope and CLI is installed
  never:
    - --no-verify unless user explicitly requests
}

finalize{
  gate_clear_only_if:
    - no open critical/high truth or accessibility issues
    - build/lint gates pass once configured
    - manual evidence recorded for UI changes
    - public claims audited against roadmap/current product state
    - unresolved launch facts are visibly marked or documented
  deferred_register:"log residual risks + low findings to C:\dev\coordinated\conductor\deferred.md (date | repo | track | sev | finding | why deferred | follow-up). Do NOT leave residual risks only in review.md - the deferred register is the cross-repo durable backlog."
  track_format:"use the conductor track id (e.g. 0003-HomepageComprehension) when one exists; for repo-local WEB-#### tracks use that id; for a review-only pass with no track, use the date (YYYY-MM-DD) as the track field and note 'review-only' in the finding. Every entry must have a value in the track column - never blank. Review-only evidence still lives in conductor/<track>/review.md when a track exists, else in .agents/plan.md or the final report."
  final_report:
    - track/slice completed
    - files changed
    - checks run
    - manual evidence
    - claim audit
    - deployment status
    - residual risks (also logged to deferred.md)
}

stop_before:
  - production deploy without user direction
  - committing secrets
  - destructive git operation
  - adding hosted app/server responsibilities to this repo
  - unsupported security/compliance/enterprise claims
