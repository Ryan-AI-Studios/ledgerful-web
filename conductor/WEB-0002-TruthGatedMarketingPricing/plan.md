# WEB-0002 Truth-Gated Marketing And Pricing Plan

## Phase 1: Lock The Evidence Inventory

- [ ] Re-run `ai-brains preflight --summary`; if unavailable, record the missing
  historical signal and continue with source files.
- [ ] Run `changeguard doctor` and `changeguard ledger status --compact`.
- [ ] Re-read `C:\dev\Roadmap.md` WEB-1, Commercial Packaging, and Pricing
  Notes.
- [ ] Re-check backend/frontend conductor status and contract notes.
- [ ] Create a feature-to-evidence table in `review.md` covering every current
  pricing row.
- [ ] Downgrade or remove any row whose evidence does not support its current
  state.

## Phase 2: Write The Failing Truth Check

Files:

- Create: `scripts/check-pricing-truth.mjs`
- Modify: `package.json`

- [ ] Add `check:pricing` that builds the site and inspects generated `/pricing`
  output.
- [ ] Assert all five approved state labels are represented or explicitly
  accounted for.
- [ ] Assert the page does not contain `Team Hosted Beta`.
- [ ] Assert hosted and enterprise sections contain planned-state language.
- [ ] Assert no unverified Contact, checkout, trial, or billing CTA exists.
- [ ] Run `npm run check:pricing` and confirm it fails against the current page
  for the intended wording/structure reason.

## Phase 3: Strengthen The Content Model

Files:

- Modify: `src/lib/content/pricing.ts`
- Modify if needed: `src/lib/content/features.ts`

- [ ] Add structured evidence and caveat fields to material pricing features.
- [ ] Separate edition availability from price publication status.
- [ ] Encode edition grouping for core, collaboration, release/GitHub,
  compliance, hosted, and enterprise capabilities.
- [ ] Rename hosted and enterprise editions to remove live-beta/contact
  implications.
- [ ] Preserve `$0` only for the roadmap-supported Free/local edition.
- [ ] Keep all other price values explicitly unannounced/planned.
- [ ] Ensure hosted GitHub App, billing, identity, audit, retention, SLA, and
  optional self-hosting remain planned.

## Phase 4: Build The Edition Ladder

Files:

- Modify: `src/app/pricing/page.tsx`
- Modify: `src/app/globals.css`
- Create components under `src/components/pricing/` only when reuse or semantic
  clarity justifies them.

- [ ] Replace the equal-weight four-card wall with an edition ladder.
- [ ] Make currently usable local editions visually primary.
- [ ] Make hosted and enterprise editions visibly planned without making them
  look disabled or hidden.
- [ ] Pair every edition with a state, price-publication label, audience, and
  concise adoption boundary.
- [ ] Avoid adding interactive controls unless they materially reduce
  information overload.

## Phase 5: Build The Evidence Matrix

Files:

- Modify: `src/app/pricing/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/status-pill.tsx` only if semantic labeling requires it.

- [ ] Render a semantic comparison table with edition column headers and feature
  row headers.
- [ ] Group related feature rows with accessible section labels.
- [ ] Show state text and caveats without color-only meaning.
- [ ] Add release-smoke caveats for MCP and GitHub Action.
- [ ] Distinguish local team sync from future hosted sync.
- [ ] Keep local SOC2 ZIP export distinct from a hosted SOC2 portal.
- [ ] Add planned footnotes for GitHub App, billing, SSO, SCIM, RBAC, hosted
  audit logs, retention, support SLA, and self-hosting.

## Phase 6: Responsive And Accessibility Pass

- [ ] Verify 1280px desktop hierarchy and table scanability.
- [ ] Verify 768px tablet layout.
- [ ] Verify 375px mobile with no page-level horizontal overflow.
- [ ] If the table scrolls horizontally, keep the scroll region labeled and
  keyboard reachable.
- [ ] Verify headings, table semantics, list semantics, and status text with the
  accessibility tree.
- [ ] Tab through all links and interactive elements.
- [ ] Check light/dark contrast and visible focus.
- [ ] Confirm planned caveats are never hover-only.

## Phase 7: Verification And Review

- [ ] Run `npm run check:pricing`.
- [ ] Run `npm run check:preview`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run check:links`.
- [ ] Run `changeguard scan --impact`.
- [ ] Run `changeguard verify --scope fast`.
- [ ] Deploy a Vercel Preview from a non-production branch.
- [ ] Smoke the Preview at desktop, tablet, and mobile widths.
- [ ] Audit public claims against the current roadmap and upstream evidence.
- [ ] Record all evidence and residual risks in `review.md`.
- [ ] Remove the completed WEB-0002 item from `docs/ToDo.md`.
- [ ] Set the conductor registry to Completed only after all findings close.
