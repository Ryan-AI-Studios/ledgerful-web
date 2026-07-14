import Link from "next/link";

// Four real, independently-linkable proof points. Unordered — DESIGN.md
// reserves numbered indices for the ordered Scan -> Record -> Verify ->
// Export flow, so this strip (reusing .workflow-strip/.workflow-step)
// intentionally omits the .workflow-step-index numerals.
const proofItems = [
  {
    label: "Deterministic outputs",
    body: "Same repo, same state, same risk score.",
    href: "/trust",
  },
  {
    label: "Signed ledger provenance",
    body: "Ed25519 signatures verified offline.",
    href: "/trust",
  },
  {
    label: "Verification plan per commit",
    body: "Build and test steps planned automatically.",
    href: "/trust",
  },
  {
    label: "Release workflow emits companion checksums",
    body: "SHA-256 + cosign + SLSA per release.",
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
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}
