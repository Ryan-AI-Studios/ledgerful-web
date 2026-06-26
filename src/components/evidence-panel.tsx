import { CheckCircle2, FileSearch, GitBranch, LockKeyhole } from "lucide-react";

const lines = [
  "$ ledgerful doctor",
  "Environment: Windows",
  "Search index: OK",
  "Native graph: Ready",
  "$ ledgerful compliance export",
  "ledgerful-soc2-evidence.zip",
  "manifest.json + manifest.sig",
];

const evidence = [
  {
    icon: FileSearch,
    label: "Impact",
    text: "Repo risk and changed-file evidence stay local by default.",
  },
  {
    icon: GitBranch,
    label: "Ledger",
    text: "Change history is tied to signed provenance records.",
  },
  {
    icon: LockKeyhole,
    label: "Export",
    text: "SOC2 evidence is a local ZIP, not a hosted portal claim.",
  },
  {
    icon: CheckCircle2,
    label: "Verify",
    text: "Release checks and checksums remain explicit launch facts.",
  },
];

export function EvidencePanel() {
  return (
    <div className="evidence-panel" aria-label="Ledgerful product evidence">
      <div className="terminal-window" aria-label="Representative Ledgerful command output">
        <div className="terminal-bar">
          <span />
          <span />
          <span />
        </div>
        <pre>
          {lines.map((line) => (
            <code key={line}>{line}</code>
          ))}
        </pre>
      </div>
      <div className="evidence-map" aria-label="Evidence workflow">
        {evidence.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label}>
              <Icon size={22} strokeWidth={1.9} aria-hidden="true" />
              <h3>{item.label}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
