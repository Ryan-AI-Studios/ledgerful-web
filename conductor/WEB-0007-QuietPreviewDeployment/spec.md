# WEB-0007 Quiet Preview Deployment Spec

## Objective

Record the first production Vercel deployment and custom-domain evidence, keep
the site in a deliberate quiet-preview state, and establish one durable register
for work deferred until public launch.

## Requirements

- `www.ledgerful.dev` is the canonical production hostname.
- `ledgerful.dev` redirects permanently to `www.ledgerful.dev`.
- Cloudflare remains authoritative DNS without proxying Vercel traffic.
- Vercel provides HTTPS for both hostnames.
- Search crawlers are blocked by `/robots.txt`.
- Pages emit `noindex,nofollow` metadata as a second indexing control.
- An automated check fails if either indexing control is removed accidentally.
- Local `.env` and agent-state files are explicitly excluded from Vercel source
  uploads.
- `docs/ToDo.md` records launch facts, planned WEB tracks, operational debt,
  quality debt, and cross-repo hosted dependencies.

## Out Of Scope

- Resolving release, package, license, status-page, or GitHub Action facts.
- Enabling public search indexing.
- Adding email hosting records before an email provider is chosen.
- Building hosted control-plane, billing, webhook, identity, or tenant APIs.

## Definition Of Done

- Local build, lint, quiet-preview, and link checks pass.
- ChangeGuard fast verification passes.
- Production DNS, TLS, canonical redirect, and HTTP response evidence is
  recorded.
- `.vercelignore` excludes local environment and agent-state files.
- The quiet-preview policy is deployed and verified against production.
- `docs/ToDo.md` contains explicit exit criteria for restoring indexing.
- No unsupported public claims are introduced.
