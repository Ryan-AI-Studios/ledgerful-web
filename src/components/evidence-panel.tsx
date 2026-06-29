import { capturedEvidence, panelOrder } from "./captured-evidence";

export function EvidencePanel() {
  return (
    <div className="evidence-panel" aria-label="Ledgerful product evidence">
      {panelOrder.map((id) => {
        const panel = capturedEvidence[id];
        return (
          <div
            key={id}
            className="terminal-window annotated"
            aria-label={`${panel.description} — ${panel.command}`}
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
              <span className="terminal-caption">
                {`${panel.description} — captured from v0.1.6`}
              </span>
              <span className="terminal-meta">{panel.command}</span>
            </div>
          </div>
        );
      })}
      <p className="evidence-caption">
        <span>
          Real output from a <strong>v0.1.6</strong> run on Windows x86_64.
          Source files in <code>public/evidence/</code>. PowerShell capture
          wrappers are stripped; program stdout is reproduced verbatim.
        </span>
      </p>
    </div>
  );
}