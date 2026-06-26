---
name: onboarding
description: Load when starting work in ledgerful-web, creating or reviewing public web tracks, writing marketing/docs/trust copy, or deciding what this repo should own.
---

# Ledgerful Web Onboarding

identity{
  product:"Ledgerful"
  repo:"C:\dev\ledgerful-web"
  role:"public marketing, docs, pricing, changelog, trust/security, launch, SEO"
  backend_repo:"C:\dev\ChangeGuard"
  dashboard_repo:"C:\dev\ledgerful-frontend"
  roadmap:"C:\dev\Roadmap.md"
  hosted_platform:"Vercel"
  backend_platform_for_future_control_plane:"Supabase"
}

mission{
  summary:"make Ledgerful understandable, credible, installable, and trustable for programming teams without mixing public web with the embedded dashboard or future control-plane APIs"
  primary_audience:
    - engineering managers evaluating multi-repo change risk
    - developers installing local tooling
    - security/compliance reviewers approving a local-first devtool pilot
    - future buyers comparing local, team, hosted, and enterprise editions
}

source_order:
  - user/run prompt
  - C:\dev\Roadmap.md
  - AGENTS.md
  - .agents/plan.md
  - current repo files
  - C:\dev\ChangeGuard\conductor\conductor.md
  - C:\dev\ledgerful-frontend\conductor\conductor.md
  - C:\dev\ChangeGuard\docs\Frontend-Notes.md
  - C:\dev\ledgerful-frontend\docs\Backend-Notes.md
  - official docs for current package/framework behavior

session_start{
  read:
    - AGENTS.md
    - .agents/plan.md
    - C:\dev\Roadmap.md
  optional_commands:
    - ai-brains preflight --summary
    - changeguard doctor
    - changeguard ledger status --compact
  then:
    - identify the active WEB track or create the smallest track note needed
    - check whether the work changes public claims, docs, pricing, trust, or deployment
    - decide which verification gates apply
}

repo_boundaries{
  use_this_repo_for:
    - public site pages
    - docs pages
    - pricing and feature matrices
    - changelog
    - trust/security center
    - release verification instructions
    - public SEO metadata
    - Vercel public web deployment
  do_not_use_this_repo_for:
    - local daemon API clients
    - embedded dashboard app internals
    - authenticated hosted app APIs
    - GitHub App webhooks
    - billing webhooks
    - tenant database access
    - Supabase service-role operations
}

roadmap_summary{
  available_today:
    - local Ledgerful engine and CLI
    - local-first dashboard surface in the frontend repo
    - local SOC2 evidence export
    - local team sync foundation
    - MCP and GitHub Action paths with release/public-smoke caveats
  public_web_gap:
    - empty repo needs static site initialization
    - public docs/pricing/trust should move out of embedded dashboard thinking
    - claims need feature-state labels
    - placeholder trust facts must be resolved before launch
  future_not_here:
    - hosted control plane
    - GitHub App webhooks
    - enterprise identity
    - billing and entitlements
}

contract_notes_from_frontend_docs{
  local_first:
    - dashboard docs should point at the local daemon model and default `http://127.0.0.1:52001`
    - access is ephemeral-token based; document `?token=` only as local launch/session behavior, not an account system
    - no secrets belong in browser docs/examples
  honest_limitations:
    - some ledger metrics are honest zeros until backend follow-up tracks populate them
    - project validation warnings are additive "needs attention" signals and should not be hidden
    - config-gated sparse CLI/API surfaces can return empty-state payloads with enablement hints
  security:
    - local daemon does not implement SAML/OIDC/RBAC/SCIM
    - those identity features belong to a future hosted control plane and must stay marked planned
    - local SOC2 evidence export is a zip download; do not describe it as a hosted portal
  telemetry:
    - usage telemetry is opt-in and backend-controlled
    - public docs must not imply source upload by default
}

web_stack_defaults{
  framework:"Next.js App Router + TypeScript"
  styling:"Tailwind CSS"
  deploy:"Vercel"
  mode:"static/public first"
  current_dependency_snapshot_2026_06_25:
    - next 16.2.9
    - react/react-dom 19.2.7
    - typescript 6.0.3
    - tailwindcss/@tailwindcss/postcss 4.3.1
    - eslint 10.5.0
    - lucide-react 1.21.0
  before_scaffold:
    - refresh versions with `npm view <package> version`
    - check official Next/Tailwind/React/Vercel docs or Context7 for current setup
    - prefer active maintained dependencies
  avoid:
    - server APIs until explicitly scoped
    - importing dashboard API client
    - hiding planned features behind live-sounding copy
}

content_rules{
  feature_states:
    - available
    - beta
    - local-only
    - hosted planned
    - enterprise planned
  trust_required_topics:
    - what Ledgerful reads locally
    - what it writes locally
    - what is uploaded by default
    - telemetry opt-in schema
    - team sync data flow
    - hosted mode data flow when it exists
    - release verification with checksums/provenance
    - responsible disclosure
    - data deletion path for future hosted mode
}

quick_commands{
  after_scaffold:
    - npm run dev
    - npm run build
    - npm run lint
  deployment_when_available:
    - vercel env pull
    - vercel deploy
    - vercel logs
}

vercel_note{
  cli:"The Vercel CLI is required for local agentic deployment work. If unavailable, recommend `npm i -g vercel` and continue with local checks."
}

finalize{
  include:
    - files changed
    - checks run
    - manual browser evidence
    - claim-audit result
    - unresolved launch facts
    - deployment status or Vercel CLI limitation
}
