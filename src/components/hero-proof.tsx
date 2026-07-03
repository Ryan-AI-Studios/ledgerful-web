import Image from "next/image";
import { artifactPreviews } from "./captured-evidence";

// Real captured URL from the Playwright dashboard capture (see
// C:\dev\FrontendDev\output\ledgerful-assets\dashboard-risk-summary.avif.provenance.json
// -> sourceRawProvenance -> raw-dashboard.png.provenance.json -> sourceCommands
// -> page.goto("http://127.0.0.1:52001/dashboard")). Shown as real text per
// DESIGN.md's "Evidence frame" contract — never baked into the image, never
// hidden.
const DASHBOARD_CAPTURE_URL = "http://127.0.0.1:52001/dashboard";

/**
 * The signature "action → receipt" composition (DESIGN.md, "Verification
 * Bench"): a real CLI action on one side, the real local dashboard receipt on
 * the other. The dashboard screenshot has no synthetic chrome baked in, so
 * this component wraps it in a code-native evidence frame — a real HTML
 * caption/meta row, not an image overlay — that keeps the captured
 * `127.0.0.1` host context visible as text.
 *
 * Uses the 2560x1600 primary capture (not the 1400x416 detail crop): the
 * detail crop is sourced from a different route (`/hotspots`, see
 * raw-hotspots.png.provenance.json) than the dashboard URL quoted here, and
 * the full-frame capture shows both "Project Health" and "Recent Changes"
 * together, which reads as a more complete receipt at hero scale.
 */
export function HeroProof() {
  const action = artifactPreviews.verificationPlan;

  return (
    <div
      className="hero-proof"
      aria-label="Real action and receipt: a verification plan and the resulting dashboard risk summary"
    >
      <div className="hero-proof-action">
        <div
          className="terminal-window annotated"
          aria-label={`${action.caption} — ${action.sourceLabel}`}
        >
          <div className="terminal-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <pre>
            {action.lines.map((line, i) => (
              <code key={`hero-action-${i}`}>{line}</code>
            ))}
          </pre>
          <div className="terminal-annotation">
            <span className="terminal-caption">{action.caption}</span>
            <span className="terminal-meta">{action.sourceLabel}</span>
          </div>
        </div>
      </div>
      <div className="hero-proof-receipt">
        <figure className="evidence-frame">
          {/*
            Both AVIF and WebP are real, already-shipped outputs of
            optimize-assets.mjs (see dashboard-risk-summary.{avif,webp} and
            their .provenance.json companions) — ship both rather than only
            the AVIF <source>, since a real (if shrinking) slice of
            traffic supports WebP but not AVIF. The next/image component
            below is the plain-img fallback for browsers matching neither
            source's type. `unoptimized` is intentional and matches this
            track's static-first stance (see spec.md DoD-5's OG-image
            reasoning, which applies equally here): the AVIF is already a
            final, pre-optimized, exact-dimension build-time artifact, so
            routing it through Next's runtime image-optimization endpoint
            on every request would add per-request compute for an image
            that never changes — and a <picture> with raw <source>s
            bypasses that endpoint for every browser that takes a <source>
            branch anyway, so `unoptimized` just makes the <img> fallback
            path consistent with the two <source> paths above it.
          */}
          <picture>
            <source srcSet="/product/dashboard-risk-summary.avif" type="image/avif" />
            <source srcSet="/product/dashboard-risk-summary.webp" type="image/webp" />
            <Image
              unoptimized
              className="evidence-frame-media"
              src="/product/dashboard-risk-summary.avif"
              alt="Ledgerful local dashboard showing Project Health and Recent Changes for a scanned sample repository, with per-file risk state"
              width={2560}
              height={1600}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </picture>
          <figcaption className="evidence-frame-meta">
            <span className="evidence-frame-caption">
              Real local dashboard receipt — signed in, live data, reduced
              motion
            </span>
            <span className="evidence-frame-url">{DASHBOARD_CAPTURE_URL}</span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
