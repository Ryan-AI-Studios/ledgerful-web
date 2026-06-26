---
name: changeguard
description: Use when public web work depends on Ledgerful engine, CLI, MCP, GitHub Action, release, compliance, or backend/frontend contract truth. This repo consumes ChangeGuard evidence; it does not own backend state.
---

# ChangeGuard Evidence for Ledgerful Web

Use the backend repo as product evidence for public-web claims. The public site
must not describe capabilities as live unless the backend/frontend conductor,
release artifacts, docs, or command smoke tests support the claim.

repos{
  backend:"C:\dev\ChangeGuard"
  frontend:"C:\dev\ledgerful-frontend"
  web:"C:\dev\ledgerful-web"
}

use_for:
  - CLI install and smoke docs
  - `ledgerful doctor`, `audit`, `verify`, `web`, and `mcp` behavior
  - SOC2 evidence export docs
  - MCP package/release claims
  - GitHub Action claims
  - local team sync claims
  - data contract references
  - release checksum/provenance claims

do_not_use_for:
  - pretending the localhost daemon is a SaaS backend
  - hosted tenant, billing, SSO, SCIM, RBAC, or GitHub App webhook claims
  - editing `.changeguard/` state from this repo

commands{
  health:
    - changeguard doctor
    - changeguard audit
    - changeguard ledger status --compact
  evidence:
    - changeguard ledger search "<topic>"
    - changeguard verify --scope full
    - changeguard mcp --help
    - changeguard web --help
    - changeguard compliance --help
  release:
    - gh release list --limit 10
    - npm pack or live package install smoke when MCP package docs change
}

claim_mapping{
  local_only:
    - local daemon APIs
    - ephemeral local dashboard token auth
    - local dashboard hosting
    - local SOC2 export
    - local signed ledger
    - local sync bundles
  release_blocked_until_smoked:
    - public MCP package install
    - public release download/install docs
    - GitHub Action public install path
  hosted_planned:
    - hosted GitHub App
    - portfolio control-plane ingest
    - billing
    - tenant admin APIs
  enterprise_planned:
    - SSO/SAML/OIDC
    - SCIM
    - RBAC
    - hosted audit logs
}

contract_caveats{
  from_frontend_notes:
    - browser docs/examples must not expose secrets, service-role keys, private keys, raw `.env`, or session tokens
    - telemetry is opt-in and backend-controlled
    - local daemon is not the identity/RBAC/SSO layer
    - sparse/config-gated surfaces may return empty states with enablement hints
    - `testsRun`, `flakes`, and file diff stats may be honest zeros until follow-up backend tracks land
    - `/api/projects` can include `validation_warnings`; present them as attention signals
}

if_unavailable{
  rule:"continue with native web checks, but mark affected claims as unverified in the final report"
}
