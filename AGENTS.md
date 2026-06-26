# Ledgerful Web Agent Rules

This repo is the public web surface for Ledgerful. It should stay separate from
the local Rust engine in `C:\dev\ChangeGuard` and the embedded dashboard app in
`C:\dev\ledgerful-frontend`.

repo{
  name:"Ledgerful Web"
  path:"C:\dev\ledgerful-web"
  os:"Windows"
  goal:"public marketing, docs, pricing, trust/security, changelog, launch pages, SEO, and Vercel deployment"
}

boundary{
  owns:
    - public homepage and product narrative
    - public docs for CLI, MCP, GitHub Action, dashboard, compliance export, and team sync
    - pricing and feature-status matrix
    - trust/security center and responsible disclosure
    - changelog and launch collateral
    - Vercel preview/production web deployment configuration
  does_not_own:
    - embedded local dashboard UI
    - local daemon API client code
    - hosted app authenticated internals
    - webhook ingest, billing webhooks, tenant APIs, or GitHub App callbacks
    - backend `.changeguard/` state
}

truth_gate{
  rule:"public claims must match shipped or explicitly planned capability"
  source_order:
    - user/run prompt
    - C:\dev\Roadmap.md
    - this AGENTS.md
    - .agents/skills/onboarding/SKILL.md
    - .agents/skills/implement/SKILL.md
    - C:\dev\ChangeGuard\conductor\conductor.md
    - C:\dev\ledgerful-frontend\conductor\conductor.md
    - C:\dev\ChangeGuard\docs\Frontend-Notes.md
    - C:\dev\ledgerful-frontend\docs\Backend-Notes.md
    - current product code and release evidence
  feature_states:
    - available
    - beta
    - local-only
    - hosted planned
    - enterprise planned
  must_qualify_until_real:
    - hosted GitHub App
    - SSO/SAML/OIDC
    - SCIM
    - RBAC
    - hosted audit log
    - billing portal
    - Slack or external workflow webhooks
    - hosted SOC2 portal
  real_today:
    - local CLI/engine
    - local daemon/dashboard APIs
    - local SOC2 evidence export
    - local MCP stdio server/package path once release smoke is proven
    - GitHub Action path once public install docs and release smoke are proven
}

workflow{
  mode:"conductor-inspired public-web tracks"
  summary:"Use small tracks with specs, plans, review logs, manual evidence, and truth-gated copy before marking work complete."
  steps:
    - read C:\dev\Roadmap.md and this AGENTS.md before starting a non-trivial track
    - create or update the relevant plan in `.agents/plan.md` or `conductor/<track>/` if a conductor is added later
    - implement the smallest public-web slice that satisfies the track
    - run targeted checks during work
    - run a review pass for truth, accessibility, responsive layout, links, and claim accuracy
    - run full web gate before marking complete
    - record manual evidence and residual risks in the track notes or final report
  rules:
    - no placeholders ship on public pages unless visibly marked as planned or unresolved
    - no fake customer logos, uptime claims, license claims, status links, or registry links
    - no mock-only product capability may be described as live
    - every pricing/enterprise claim needs a feature state or explicit caveat
    - trust/security pages must distinguish local default, optional telemetry, local sync, and future hosted mode
}

web{
  recommended_stack:"Next.js App Router + TypeScript + Tailwind CSS, deployable on Vercel"
  app_shape:"static/public site first; avoid server APIs unless the repo is deliberately promoted into a hosted app shell"
  dependency_policy:
    - outside dependency knowledge is stale by default
    - before scaffolding or upgrading, run `npm view <package> version` and check official docs/current package docs
    - prefer active, maintained dependencies over abandoned packages
    - preserve explicit pins once chosen unless a track intentionally upgrades them
    - record package versions and documentation sources in the final report for dependency changes
  current_snapshot_2026_06_25:
    - next: "16.2.9"
    - react: "19.2.7"
    - react-dom: "19.2.7"
    - typescript: "6.0.3"
    - tailwindcss: "4.3.1"
    - "@tailwindcss/postcss": "4.3.1"
    - eslint: "10.5.0"
    - lucide-react: "1.21.0"
  design:
    - public first viewport must clearly signal Ledgerful
    - use real product evidence, screenshots, receipts, terminal output, diagrams, or generated bitmap assets where useful
    - keep claims scannable for engineering managers and security reviewers
    - avoid visual treatment that makes planned/hosted features look already available
  content_required:
    - install and release verification docs
    - CLI, MCP, GitHub Action, dashboard, compliance export, and sync docs
    - pricing with feature states and footnotes
    - trust/security center with local-first data flow
    - changelog
    - comparison or positioning pages only when claims are source-backed
}

verify{
  scope:"targeted during work; full gates before public-web track completion"
  commands:
    - npm run build
    - npm run lint
    - npm run test:unit when tests exist or touched
    - npm run test:e2e when page flows or interactions are touched
    - link check when docs/marketing links changed
    - Lighthouse/accessibility smoke for public pages when layout changed
  manual:
    - desktop browser smoke
    - mobile responsive smoke at about 375px width
    - keyboard navigation for nav, CTAs, accordions, copy buttons, and forms
    - claim audit against C:\dev\Roadmap.md and current backend/frontend conductor state
  vercel:
    - use `vercel env pull`, `vercel deploy`, and `vercel logs` when Vercel CLI is installed and deployment work is in scope
    - if Vercel CLI is missing, report that deployment verification is unavailable and recommend `npm i -g vercel`
}

contracts{
  rule:"this repo documents product surfaces; it does not define local daemon contracts"
  public_contract_implications:
    - describe the dashboard as local-first and daemon-backed, not as a hosted SaaS backend
    - explain ephemeral `?token=` local dashboard auth when documenting dashboard launch/access
    - state that browser surfaces must not receive Gemini keys, Supabase service-role keys, private Ed25519 keys, raw `.env`, or daemon session tokens in logs
    - when documenting telemetry, say it is opt-in and must use the official Supabase ingest endpoint/config path if enabled
    - treat `testsRun`, `flakes`, and per-file diff stats as honest-zero/limited until backend follow-up tracks populate them
    - mention project validation warnings as "needs attention" signals, not as missing projects or full health
    - keep local SOC2 zip export claims limited to the implemented local export, not a hosted SOC2 portal
    - document config-gated sparse surfaces as empty/degraded states with enablement hints, not product failures
  update_when:
    - public docs mention daemon API shape
    - frontend/back-end behavior changes what public docs promise
    - feature matrix changes shipped/beta/planned state
  cross_repo_sources:
    - C:\dev\ChangeGuard\docs\Frontend-Notes.md
    - C:\dev\ledgerful-frontend\docs\Backend-Notes.md
    - C:\dev\Roadmap.md
}

powershell{
  forbid:"&& | [[ | ]] | then | fi | done | echo -e"
  prefer:"Get-ChildItem | Get-Content | Test-Path | Join-Path | Copy-Item | Remove-Item"
  rules:
    - use $_ and object properties for pipelines
    - use backslashes for shell-level Windows paths
    - avoid Bash shims for complex logic
}

aibrains{
  preflight:"ai-brains preflight --summary"
  recall:"ai-brains recall \"<query>\" --semantic"
  query:"ai-brains sync query \"<query>\""
  pin:"ai-brains pin \"DECISION: <what + why>\""
  use_when:
    - searching prior Ledgerful positioning decisions
    - checking historical product constraints
    - before risky public claim changes
}

changeguard{
  role:"cross-repo truth and release evidence, mostly in C:\dev\ChangeGuard"
  use_when:
    - public docs mention backend/CLI/MCP/GitHub Action behavior
    - verifying release, SOC2 export, MCP package, or GitHub Action claims
    - checking ledger/conductor status for shipped capability
  commands:
    - changeguard doctor
    - changeguard audit
    - changeguard ledger status --compact
    - changeguard ledger search "<topic>"
    - changeguard verify --scope full
  fail:"if unavailable, continue with native web checks and report missing ChangeGuard evidence"
}

git{
  forbid:
    - push to main/master without explicit user direction
    - force-push without explicit approval
    - destructive operations without explicit approval
    - committing secrets or .env files
  require:
    - inspect diff before commit
    - commit only intentional files
    - keep generated/scratch output out of commits unless intentionally tracked
}

review{
  file:"conductor/<track>/review.md if conductor exists; otherwise track notes in `.agents/plan.md` or final report"
  review_for:
    - public claim truth
    - pricing and feature-state accuracy
    - accessibility
    - responsive behavior
    - broken links
    - SEO metadata
    - no fake integrations, customers, status, licenses, or release links
    - no secrets in examples
  critical_high:"must be fixed before completion"
  medium:"fix by default; defer only with explicit reason"
}

stop_before:
  - destructive git operation
  - force-push
  - committing secrets
  - publishing/deploying production without user direction
  - making unsupported enterprise/security/compliance claims
  - adding server/API/billing/webhook code to this repo without explicit scope change
  - ambiguous roadmap conflict not resolvable from C:\dev\Roadmap.md and current conductor state

final_report{
  include:
    - files changed
    - checks/tests/manual evidence with exact commands
    - public claims or feature states changed
    - source docs consulted
    - deployment status if relevant
    - residual risks or launch blockers
}
