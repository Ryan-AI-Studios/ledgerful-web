# WEB-0006 Review

## Status

Completed.

## Live Registry Snapshot

Date: 2026-06-26.

| Package | Selected | Live | Decision |
|---|---:|---:|---|
| `next` | `16.2.9` | `16.2.9` | Keep current stable. |
| `react` | `19.2.7` | `19.2.7` | Keep current. |
| `react-dom` | `19.2.7` | `19.2.7` | Keep current. |
| `typescript` | `6.0.3` | `6.0.3` | Keep current. |
| `tailwindcss` | `4.3.1` | `4.3.1` | Keep current. |
| `@tailwindcss/postcss` | `4.3.1` | `4.3.1` | Keep current. |
| `eslint` | `9.39.4` | `10.6.0` | Keep compatibility pin. |
| `eslint-config-next` | `16.2.9` | `16.2.9` | Keep current. |
| `lucide-react` | `1.21.0` | `1.21.0` | Keep current. |
| `cross-env` | `10.1.0` | `10.1.0` | Keep current. |
| `linkinator` | `7.6.1` | `7.6.1` | Keep current. |
| `start-server-and-test` | `3.0.11` | `3.0.11` | Keep current. |
| `@types/node` | `20.19.43` | `26.0.1` | Keep Node 20 supported-floor typings. |
| `@types/react` | `19.2.17` | `19.2.17` | Range already resolves current. |
| `@types/react-dom` | `19.2.3` | `19.2.3` | Range already resolves current. |

## Advisory Analysis

`npm audit` reported two moderate nodes representing one advisory:

- `GHSA-qx2v-qp2m-jg93` / `CVE-2026-41305`.
- Next.js 16.2.9 vendors PostCSS 8.4.31.
- Patched PostCSS version: 8.5.10.
- npm incorrectly proposed Next.js 9.3.3 as the available fix.
- Next.js upstream merged the exact 8.5.10 bump in PR `#93288` and noted that
  the vulnerable path does not affect ordinary Next.js users unless builds
  process untrusted source.

Decision: use an npm override scoped to `next > postcss` at 8.5.10. Remove the
override once a stable Next.js release bundles PostCSS 8.5.10 or newer.

## Compatibility Decisions

- Keep ESLint 9.39.4. Although `eslint-config-next` declares `eslint >=9`, its
  current plugin dependencies still declare peer ranges that exclude ESLint 10.
- Keep `@types/node` on 20.x. Next.js 16 requires Node 20.9 or newer, and the
  public site uses no Node 24-specific APIs. Runtime deployment remains Node 24.
- Do not move to a Next.js canary merely to absorb the PostCSS bump.

## Verification

Commands:

```powershell
npm install
npm ls postcss --all
npm audit --audit-level=moderate
npm run lint
npm run check:preview
npm run check:links
changeguard scan --impact
changeguard verify --scope fast
```

Results:

- Next.js resolves PostCSS 8.5.10 through the scoped override.
- Tailwind resolves its current PostCSS 8.5.15 independently.
- `npm audit`: zero vulnerabilities.
- Build and TypeScript compilation: passed.
- ESLint: passed.
- Quiet-preview indexing policy: passed.
- Linkinator: 22 links passed.
- ChangeGuard impact scan: current, LOW risk.
- ChangeGuard fast verification: passed.
- Public claims changed: none.
- Open critical/high findings: none.
