# Ledgerful Web Design System

## Verification Bench

Ledgerful’s public surface is a shared release-verification bench: a staff engineer and a security
reviewer stand over the same change, evidence, and decision. The interface should feel measured,
mechanical, and evidentiary—the precision of an instrument with the readability of an audit binder.
It is not a generic dark AI page, terminal cosplay, an observability dashboard, or an editorial
magazine.

The signature composition is action → receipt. Commands and changes sit beside risk, provenance,
verification, or export evidence. Rules, hashes, timestamps, and state labels support real proof;
they are never decoration.

## Color contract

The canonical tokens live in `src/app/globals.css`. Every OKLCH value is processed at build time to
ship an RGB fallback before the modern declaration.

| Role | Dark intent | Light intent | Use |
|---|---|---|---|
| `--canvas` | Deep blue-slate | Near-white, cool-neutral | Page background |
| `--surface-raised` | Distinct instrument plane | Quiet cool panel | Evidence frames and tables |
| `--surface-strong` | Selected slate | Selected pale slate | Active navigation and controls |
| `--ink-primary` | Soft white | Deep slate | Primary text |
| `--ink-muted` | High-contrast blue-gray | Dark blue-gray | Secondary text |
| `--rule` | Visible structural rule | Visible structural rule | Dividers and table structure |
| `--brand` / `--brand-strong` | Ledgerful teal | Ledgerful teal | Actions, links, active measurement |
| `--evidence` / `--evidence-soft` | Amber | Amber | Verification evidence and focus |

Feature-state colors (`available`, `beta`, `planned`, `unresolved`) are semantic and separate from
brand teal/amber. A state always includes a text label; color is never the only signal.

Do not add gradient text, blue-purple glow, glass cards, repeating grids/stripes, decorative wide
shadows, or more than one decorative accent in a composition. The top wash is non-repeating and
nearly imperceptible.

## Theme behavior

- Dark is the server-rendered and no-JavaScript default.
- Users can choose System, Dark, or Light. The preference is stored under `ledgerful-theme`.
- The root-layout script is synchronous, static, and byte-identical across builds. It sets the
  effective theme before paint and must remain hashable by `scripts/build-with-csp.mjs`.
- Never add `'unsafe-inline'`, a request nonce, or dynamic text to that script.
- Print always uses the light palette, removes decorative backgrounds, and expands hidden overflow.

## Typography

- Archivo carries display and body copy. JetBrains Mono is for commands, paths, hashes, schemas,
  timestamps, and evidence identifiers—not general navigation or prose.
- Display tracking stays between `-0.025em` and `-0.035em`, never tighter than `-0.04em`.
- Display size tops out at 96px. Adjacent heading levels should differ by at least 1.25×.
- Prose measure is 65–75ch. Headings use `text-wrap: balance`; long prose uses `text-wrap: pretty`.

## Space, shape, and structure

- Content maximum: 1180px. Evidence-led hero/diagram compositions may reach 1280px in later tracks.
- Base spacing steps: 4, 8, 12, 16, 24, 32, 48, 64, 96px. Use tighter spacing within one proof and
  larger pauses between narrative chapters.
- Component radii: 6px for code fragments, 10px for panels, full pill only for compact states/actions.
- Prefer ruled lists, split bands, and artifact previews over repeated identical cards.
- Use asymmetry only when it explains action → receipt or local → optional network.
- The ordered Scan → Record → Verify → Export flow may use numbers. Unordered sections may not.

## Components

- Evidence frame: one structural border, raised surface, compact metadata, and real content. Avoid a
  border plus a wide decorative shadow.
- Status pill: state text plus semantic color, minimum AA contrast in both themes.
- Section heading: optional kicker only when it communicates a real category. Do not put a tiny
  uppercase eyebrow over every section.
- Header: brand, primary evaluation paths, explicit theme choice, and one accented Install action.
  “How it works” retains `/architecture`; Changelog is a footer utility.

## Motion and interaction

- No motion dependency. Animate only color/background and small control state changes.
- Content is visible without animation. Never gate content behind a transition.
- Use short ease-out timing; never animate layout, hijack scroll, add parallax, or auto-rotate content.
- `prefers-reduced-motion: reduce` removes transitions and smooth scrolling.
- Focus uses the amber evidence ring and must remain obvious in both themes.

## Icons and assets

- Lucide icons are allowed for compact functional cues. Keep stroke weight consistent and never place
  a large rounded icon above every heading.
- Product, terminal, provenance, verification, and security proof must come from real captured or
  sanitized Ledgerful output. Never use image generation for evidence.
- Decorative assets must not imply product behavior. Every image has dimensions and meaningful alt
  text; code-native diagrams remain understandable as text.

## Extension checklist

Before shipping a new component or page:

1. Use semantic tokens; do not introduce raw theme-specific colors in component code.
2. Verify dark, light, 320px, keyboard, reduced-motion, no-JavaScript, and print behavior.
3. Confirm body text contrast ≥4.5:1 and large text/non-text controls ≥3:1.
4. Preserve the strict hash CSP and `noindex,nofollow`.
5. Ask whether the composition helps an engineer and reviewer make a decision from evidence. If it
   only decorates the page, remove it.
