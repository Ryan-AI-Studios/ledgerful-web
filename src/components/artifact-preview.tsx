import { artifactPreviews, type ArtifactPreviewId } from "./captured-evidence";

/**
 * Sanitized artifact preview: one real, redacted capture rendered in the same
 * `.terminal-window.annotated` evidence-frame language as `evidence-panel.tsx`
 * (structural border, raised/terminal surface, compact metadata row, real
 * content — never a screenshot or generated image). Use for the verification
 * plan, a signed provenance record, or the evidence-export manifest; the
 * risk-summary preview is the real captured dashboard image instead (see
 * `hero-proof.tsx`), not a text artifact, so it is not a variant here.
 */
export function ArtifactPreview({
  id,
  className,
}: {
  id: ArtifactPreviewId;
  className?: string;
}) {
  const panel = artifactPreviews[id];
  const windowClassName = className
    ? `terminal-window annotated ${className}`
    : "terminal-window annotated";

  return (
    <div
      className={windowClassName}
      aria-label={`${panel.caption} — ${panel.sourceLabel}`}
    >
      <div className="terminal-bar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <pre>
        {panel.lines.map((line, i) => (
          <code key={`${id}-${i}`}>{line}</code>
        ))}
      </pre>
      <div className="terminal-annotation">
        <span className="terminal-caption">{panel.caption}</span>
        <span className="terminal-meta">{panel.sourceLabel}</span>
      </div>
    </div>
  );
}
