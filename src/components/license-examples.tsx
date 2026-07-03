import { licenseBoundaryColumns, licensePersonas } from "@/lib/content/pricing";

/**
 * Best-effort license-boundary explainer for /pricing. Wrapped in a
 * prominent draft banner because counsel sign-off + license-in-force is the
 * async 0027 launch gate, not a blocker on shipping this content — see
 * 0025-WebPricingReframe spec.md §2/DoD-4.
 */
export function LicenseExamples() {
  return (
    <>
      <div className="legal-draft-banner">
        <strong>DRAFT — PENDING LEGAL REVIEW.</strong> The summary and
        examples below are our best-effort reading of the PolyForm
        Noncommercial License 1.0.0 plus the Ledgerful Small-Entity
        Commercial Exception v1.0. They are not legal advice and are subject
        to change before counsel sign-off and license-in-force.
      </div>
      <div className="license-boundary-columns">
        {licenseBoundaryColumns.map((column) => (
          <div key={column.heading} className="license-boundary-column">
            <h3>{column.heading}</h3>
            <ul>
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ul className="license-personas">
        {licensePersonas.map((persona) => (
          <li key={persona.scenario}>
            <p className="license-persona-scenario">{persona.scenario}</p>
            <p className="license-persona-outcome">
              <strong>{persona.outcome}.</strong> {persona.reason}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
