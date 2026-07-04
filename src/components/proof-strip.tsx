import Link from "next/link";

// Four real, independently-linkable proof points. Unordered — DESIGN.md
// reserves numbered indices for the ordered Scan -> Record -> Verify ->
// Export flow, so this strip (reusing .workflow-strip/.workflow-step)
// intentionally omits the .workflow-step-index numerals.
const proofItems = [
  {
    label: "Runs locally by default",
    href: "/architecture",
  },
  {
    label: "Deterministic outputs",
    href: "/trust",
  },
  {
    label: "Source upload off by default",
    href: "/trust",
  },
  {
    label: "Release workflow emits companion checksums",
    href: "/docs/releases",
  },
] as const;

export function ProofStrip() {
  return (
    <div className="workflow-strip proof-strip" aria-label="Proof points, each linked to its evidence">
      {proofItems.map((item) => (
        <article className="workflow-step" key={item.label}>
          <h3>
            <Link href={item.href}>{item.label}</Link>
          </h3>
        </article>
      ))}
    </div>
  );
}
