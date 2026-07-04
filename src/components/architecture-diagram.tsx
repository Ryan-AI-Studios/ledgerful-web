/**
 * WEB-0023 — the three-surface / local-first-boundary diagram, rebuilt as
 * real HTML/CSS nodes instead of a fixed-viewBox SVG.
 *
 * The previous SVG used absolute pixel coordinates for every label at a
 * fixed `viewBox="0 0 720 360"`. Shrinking that to fit a 320px viewport made
 * the text illegible — DoD-4 explicitly rejects "shrink to fit" as a mobile
 * strategy. This component instead lays the same content out with CSS Grid:
 * two node grids that collapse from side-by-side columns to a single
 * vertical column at <=768px (`repeat(auto-fit, minmax(...))` already
 * degrades gracefully, and the 768px media query below makes the restack an
 * explicit, verifiable contract rather than an incidental fit). Every label
 * is real, selectable, translatable text — no <text> nodes, no rasterized
 * labels, real screen-reader accessibility for free.
 *
 * Content mirrors the previous SVG 1:1 (same surfaces, same meta lines, same
 * planned/dashed hosted-control-plane distinction) — this is a presentation
 * change, not a content change.
 */
type ArchNodeProps = {
  kicker: string;
  title: string;
  body?: string;
  meta?: string;
  planned?: boolean;
};

function ArchNode({ kicker, title, body, meta, planned = false }: ArchNodeProps) {
  return (
    <div className={`arch-node${planned ? " arch-node--planned" : ""}`}>
      <span className="arch-node-kicker">{kicker}</span>
      <span className="arch-node-title">{title}</span>
      {body ? <span className="arch-node-body">{body}</span> : null}
      {meta ? <span className="arch-node-meta">{meta}</span> : null}
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="arch-diagram-v2">
      {/* Host machine boundary — groups the engine and dashboard nodes */}
      <div className="arch-host">
        <span className="arch-host-label">YOUR MACHINE</span>
        <div className="arch-host-nodes">
          <ArchNode
            kicker="SURFACE 01 · ENGINE"
            title="ledgerful CLI"
            body="scan · ledger · audit · verify · mcp"
            meta="sync is feature-gated · --features sync"
          />
          <ArchNode
            kicker="SURFACE 02 · DASHBOARD"
            title="Embedded UI"
            body="launch token → in-memory Bearer auth"
            meta="loopback only · no external bind"
          />
        </div>
      </div>

      {/* Local-first boundary strip — nothing crosses by default */}
      <div className="arch-boundary-strip">
        <span className="arch-node-kicker">LOCAL-FIRST BOUNDARY</span>
        <span className="arch-node-body">
          source code · diffs · keys · ledger · audit
        </span>
        <span className="arch-node-meta">
          all on host · no upload by default · telemetry is opt-in
        </span>
      </div>

      {/* Outside the host boundary: the static public site (solid, real,
          available today) and the hosted control plane (dashed, planned,
          not live). */}
      <div className="arch-outside-nodes">
        <ArchNode
          kicker="SURFACE 03 · PUBLIC WEB"
          title="ledgerful.dev"
          body="static · docs · pricing"
          meta="no hosted auth"
        />
        <ArchNode
          kicker="PLANNED · NOT LIVE"
          title="Hosted control plane"
          meta="tenancy · audit · identity"
          planned
        />
      </div>
    </div>
  );
}
