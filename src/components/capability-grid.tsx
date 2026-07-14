import { featureStates } from "@/lib/content/features";
import { StatusPill } from "./status-pill";

/**
 * One flat, ruled list of every real feature state (DESIGN.md: "Prefer ruled
 * lists ... over repeated identical cards"; no 3D transforms, no glow, no
 * nested cards, no repeated large icon tiles). Reuses the existing
 * .feature-table/.feature-row classes and the real featureStates data —
 * no invented rows.
 */
export function CapabilityGrid() {
  return (
    <div className="feature-table" aria-label="Ledgerful feature states">
      {featureStates.map((feature) => (
        <article className="feature-row" key={feature.name}>
          <div>
            <h3>{feature.name}</h3>
            <p>{feature.description}</p>
          </div>
          <StatusPill maturity={feature.maturity} deployment={feature.deployment} />
        </article>
      ))}
    </div>
  );
}
