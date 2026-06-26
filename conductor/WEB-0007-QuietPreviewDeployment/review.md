# WEB-0007 Review

## Status

Completed and deployed.

## Deployment Evidence

- Vercel project: `ryan-bourgoin-s-projects/ledgerful-web`.
- Initial production deployment status: Ready.
- Quiet-preview production deployment:
  `dpl_EQiqUD4kLLnfxdhspuHAjiAfCu4J`.
- Canonical hostname: `https://www.ledgerful.dev`.
- Apex behavior: `https://ledgerful.dev` returns `308` to the canonical host.
- Canonical response before this source change: HTTP `200`.
- DNS provider: Cloudflare, DNS-only records.
- Vercel configuration reported both domains as verified and correctly
  configured.
- Vercel issued auto-renewing certificates for both hostnames.

## Quiet Preview Evidence

Red check:

```powershell
npm run check:preview
```

Failed because the generated `robots.txt` contained `Allow: /`.

Green check:

```powershell
npm run check:preview
```

Passed after generated output contained `Disallow: /` and the homepage emitted
`noindex,nofollow`.

Full local gate:

```powershell
npm run lint
npm run check:preview
npm run check:links
changeguard scan --impact
changeguard verify --scope fast
```

All commands passed. Linkinator scanned 22 links successfully. The current npm
audit remains at two moderate advisories with no high or critical findings.

Next.js source consulted:

- Context7 `/vercel/next.js/v16.2.9` for `robots.ts` and Metadata `robots`
  behavior.

## Claim Audit

- No product capability claims changed.
- Hosted and enterprise capabilities remain planned.
- All release/install/license/status facts remain unresolved and are recorded
  in `docs/ToDo.md`.

## Findings

- The all-Preview `NEXT_PUBLIC_SITE_URL` value created during setup was empty
  and would have broken preview builds; it was removed. Production now contains
  the correct canonical value, and preview builds use the identical source
  fallback.
- The first CLI source deployment reported a detected `.env`. The local file
  contained only AI-Brains scoping identifiers, not credentials, and was
  gitignored. A tracked `.vercelignore` now explicitly excludes all local
  environment and agent-state paths from future source uploads.
- The hardened production redeploy uploaded 4.7 KB instead of 1.1 MB and no
  longer emitted the `.env` warning.

## Production Verification

- `https://www.ledgerful.dev/robots.txt` contains `Disallow: /`.
- The production homepage emits `noindex, nofollow, nocache`.
- The production homepage emits Googlebot `noindex, nofollow, noimageindex`.
- `/`, `/docs`, `/pricing`, `/trust`, and `/changelog` return HTTP `200`.
- `https://ledgerful.dev/` returns `308` to
  `https://www.ledgerful.dev/`.
- Vercel reports the deployment as Ready.
- `vercel logs dpl_EQiqUD4kLLnfxdhspuHAjiAfCu4J --no-follow --level error
  --since 30m --limit 100` returned no error logs.

## Review Closure

- Manual read-only diff review found no unsupported public claims, broken
  launch facts, accessibility changes, or SEO gaps in the quiet-preview policy.
- Open critical/high findings: none.
- Source commit: `b394eca`.
- `origin/main` received the source commit after all push hooks passed.
