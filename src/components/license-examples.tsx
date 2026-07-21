import { licenseBoundaryColumns, licensePersonas } from "@/lib/content/pricing";
import { commercialPricing } from "@/lib/content/commercial-pricing";

/**
 * Plain-language license-boundary explainer for /editions. The PolyForm
 * Noncommercial License 1.0.0 + Ledgerful Small-Entity Commercial Exception
 * v1.0 are in force (counsel-reviewed); this remains a summary, not the
 * operative text — see 0025-WebPricingReframe spec.md §2/DoD-4.
 */
export function LicenseExamples() {
  return (
    <>
      <div className="legal-draft-banner">
        <strong>Plain-language summary — not legal advice.</strong> The
        summary and examples below explain the PolyForm Noncommercial License
        1.0.0 plus the Ledgerful Small-Entity Commercial Exception v1.0 in
        plain terms. The{" "}
        <a
          href={commercialPricing.exceptionHref}
          className="inline-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Exception text
        </a>{" "}
        governs; where this summary and the license differ, the license
        controls.
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
