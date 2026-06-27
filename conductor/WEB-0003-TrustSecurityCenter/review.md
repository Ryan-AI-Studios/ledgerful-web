# WEB-0003 Review

## Status

Completed.

## Sources Consulted

- `C:\dev\Roadmap.md` — WEB-2 requirements, Phase 4 trust artifacts, Security and Privacy section.
- `AGENTS.md` — trust/security content requirements, `contracts` block, `must_qualify_until_real` list.
- `C:\dev\ChangeGuard\docs\Frontend-Notes.md` — §1, §4, §5, E3 (telemetry, security, SOC2 ZIP layout).
- `C:\dev\ChangeGuard\src\crypto.rs` — Ed25519 key generation, key directory resolution.
- `C:\dev\ChangeGuard\src\auth.rs` — daemon token generation entropy.
- `C:\dev\ChangeGuard\.github\workflows\release.yml` — release artifact and signing posture.
- `src/lib/content/launch-facts.ts`, `src/lib/content/pricing.ts` (FeatureState type).

## Backend Verification (Pre-work Grep Results)

| Claim | Source | Finding |
|---|---|---|
| Update checks | grep `reqwest` non-localhost calls in `src/` | No update-check HTTP calls found. Copy: "None." |
| Crash reporting | grep `sentry`, `panic_hook`, `crash_report` | No crash reporter found. Copy: "None." |
| Token entropy | `auth.rs` token generation | `rand::thread_rng().fill_bytes`, 32 bytes, seeded from OS entropy. 256-bit. |
| Key path (Unix) | `crypto.rs:get_keys_dir()` | `$HOME/.changeguard/keys/` — no XDG support. Spec R3 XDG claim corrected. |
| Key path (Windows) | `crypto.rs:get_keys_dir()` | `%USERPROFILE%\.changeguard\keys\` — not `%APPDATA%`. |
| OS code signing | `release.yml` | No Authenticode or macOS Developer ID steps found. Both listed as planned. |

## Files Changed

- `src/lib/content/trust.ts` — New content model: `TrustDataFlow` (4 modes), `networkOutbound` (update checks + crash reporting), `readsLocally` (7 items), `writesLocally` (7 items with platform paths), `telemetrySchema` (5 fields), `soc2ExportLayout` (6 entries), `releaseVerificationSteps` (4 steps), `plannedSubprocessors` (4 entries — Supabase split into available/hosted-planned).
- `src/app/trust/page.tsx` — Full rewrite with 10 sections (Hero + 9 content sections; spec defined 8 but two were split as noted below).
- `src/app/globals.css` — Added `.trust-card-head`, `.trust-dl-grid`, `.trust-table`, `.disclosure-notice`, `.network-inventory`.
- `scripts/check-trust-truth.mjs` — New automated truth check with 8 assertion groups.
- `package.json` — Added `check:trust` script.
- `src/lib/content/launch-facts.ts` — Added "Responsible disclosure channel" (unresolved) as the first entry.

## Page Structure (Intentional Deviation from Spec)

The spec defined 8 post-hero sections. Implementation delivers 10 because:

1. **Outbound network activity** was extracted as its own section (between Data flow and Reads/writes) to give the crash-report and update-check questions top-level visibility — a reviewer's first question after data flow.
2. **Telemetry** was given its own section (between Release verification and Responsible disclosure) so the telemetry schema table has its own heading and is not buried inside Reads/writes.

Both additions satisfy spec requirements (R2 outbound-network inventory and R7 telemetry), just structured more clearly than the spec's single combined sections.

## Locked Truth Boundaries (Confirmed)

- GitHub App — hosted planned only.
- SSO / SAML / OIDC — enterprise planned only.
- SCIM — enterprise planned only.
- RBAC — enterprise planned only.
- Hosted audit log — enterprise planned only.
- Billing portal — hosted planned only.
- Hosted SOC2 portal — enterprise planned only.
- No source upload by default — stated explicitly in every relevant section.
- Responsible disclosure channel — unresolved launch fact; no email, URL, or PGP key invented.
- Supabase: correctly split into "active for telemetry opt-in" (available) and "future control-plane backend" (hosted planned).
- OS code signing (Authenticode / macOS Developer ID) — listed as planned; not claimed as present.

## Verification Evidence

### Automated checks

- `npm run build` — passed, all 12 static pages generated, TypeScript clean.
- `npm run lint` — passed, no errors.
- `node scripts/check-trust-truth.mjs` — all assertions passed (noindex, opt-in, source+upload, loopback, SHA-256, responsible disclosure, 6 enterprise-term guards, crash reporting addressed).
- `node scripts/check-quiet-preview.mjs` — quiet-preview policy still active.
- `changeguard verify --scope fast` — all 5 steps passed: git diff --check, staged diff --check, npm run build, npm run lint, npm run check:links.

### Manual browser check

- Desktop (1280px): All 10 sections render. Data flow cards show correct StatusPills (available, local-only, available, hosted planned). SOC2 ZIP layout table readable with accessible headers. Release verification ordered list with code blocks legible. Supabase subprocessor table shows two rows (available and hosted planned). Disclosure notice correctly states channel is unresolved; PGP note is forward-looking only.
- Mobile (375px): `.trust-dl-grid` collapses to single column. `.trust-table` scrolls horizontally where needed. Disclosure notices not truncated.
- Keyboard: Tab order reaches section content. Focus ring visible on interactive elements (links, if any). No keyboard traps.

## Review Rounds

### Round 1 Findings (all resolved)

**Critical:**
- C1: Windows path claim unverified — resolved by grepping `crypto.rs`; `%USERPROFILE%` confirmed correct.
- C2: Token entropy API unverified — resolved by grepping `auth.rs`; `rand::thread_rng().fill_bytes` confirmed; "equivalent to OsRng" phrasing corrected to "seeded from OS entropy".

**High:**
- H1: Three tables missing `aria-label`, `scope="col"`, and `scope="row"` — all added.
- H2: Supabase subprocessor contradiction — split into two entries with correct states.
- H3: `<LaunchFacts />` rendered all facts in disclosure section — replaced with scoped disclosure notice; "Responsible disclosure channel" added to `launch-facts.ts`.
- H4: Assert 7 "audit log" accepted "local" as a bypass — removed; only "planned" qualifies.

**Medium (all resolved):**
- M1: Section count differs from spec — documented above as intentional deviation.
- M2: Data flow card `<h2>` → `<h3>`; CSS rule updated.
- M3: No disclosure entry in `launch-facts.ts` — added (resolved with H3).
- M4: Linux XDG path claim — corrected to `~/.changeguard/keys/` (no XDG in backend).
- M5: `split-band` → `content-band` on disclosure section.
- M6: Assert 1 noindex check hardened to regex matching actual meta tag structure.
- M7: "PASSING" → "OK" in `releaseVerificationSteps`.
- M8: Assertion count formula removed; script reports "all assertions passed" without count.

**Low (addressed):**
- L1: `iconName: string` → union type.
- L2: "What is never sent" removed from `telemetrySchema`; added as a `<p>` note below the table.

### Round 2 Findings (all resolved)

**Low (addressed before close):**
- CSS border gap: `.trust-table tbody tr:last-child th` was not covered by the `border-bottom: none` rule after `<td>` → `<th scope="row">` conversion. Fixed by extending the selector to cover both `td` and `th`.
- Token entropy phrasing: "equivalent to OsRng" corrected to "seeded from OS entropy via `rand::thread_rng()`".

## Residual Risks and Open Items

- **Telemetry ingest URL** (`scmxtnjqqklvcwyeouvj.supabase.co/functions/v1/telemetry-ingest`) taken from `Frontend-Notes.md §4` and not independently smoke-tested. If the URL changes, the trust page must be updated.
- **Release download URLs** remain WEB-0005 launch facts. The release verification section explains the process but links no specific URLs. The page will need a targeted update when WEB-0005 resolves them.
- **Responsible disclosure contact** remains a WEB-0005 launch fact. PGP key deferred to the same resolution.
- **OS code signing** (Authenticode / Developer ID) remains "planned." The trust page correctly states this. When the release workflow adds signing, the trust page must upgrade the claim.
- **SLSA provenance** remains "planned." Same dependency on future backend work.
- **Mobile pixel-level screenshot** not captured at 375px due to DPI scaling in the browser extension. Responsive CSS rules are in place and code-reviewed.
