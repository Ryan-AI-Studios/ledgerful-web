import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { LicenseExamples } from "@/components/license-examples";
import { pageDescriptions } from "@/lib/content/navigation";
import {
  maturityLabels,
  deploymentLabels,
  editionLabels,
  type Maturity,
  type Deployment,
  type Edition,
} from "@/lib/content/features";
import {
  editions,
  matrixGroups,
  matrixEditionHeaders,
  pricingFootnotes,
  pricingBoundaryStatement,
  pricingFaq,
  localCapabilities,
} from "@/lib/content/pricing";

export const metadata: Metadata = {
  title: "Pricing — editions and feature states",
  description: pageDescriptions.pricing,
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    url: "/pricing",
    images: [
      {
        url: "/og/pricing.png",
        width: 1200,
        height: 630,
        alt: "Pricing — editions and feature states, with a real local dashboard receipt showing Project Health and Recent Changes.",
      },
    ],
  },
  twitter: {
    images: ["/og/pricing.png"],
  },
};

// Reuses the same Local capability list as the pricing card and matrix
// (localCapabilities) so this summary can't drift out of sync with them.
const availableToday = localCapabilities;

export default function PricingPage() {
  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Edition boundaries</p>
        <h1>A plain boundary: free, paid, or a separate agreement.</h1>
        <p>{pricingBoundaryStatement}</p>
      </section>

      <section className="content-band">
        <SectionHeading title="Editions">
          Local and Commercial License describe the same current software
          under the in-force PolyForm Noncommercial License with the
          Small-Entity Commercial Exception. Hosted and Enterprise are
          planned and require a future control plane, with no announced
          prices or timelines.
        </SectionHeading>

        <aside
          className="available-today"
          aria-labelledby="available-today-heading"
        >
          <div className="available-today-head">
            <StatusPill maturity="available" deployment="runs-locally" />
            <h2 id="available-today-heading">Implemented in the current build</h2>
            <p className="available-today-price">Source-available, in force</p>
          </div>
          <p>
            The local capabilities below are implemented. The license is in
            force: Ledgerful, LLC formed, IP assigned, Small-Entity
            Commercial Exception counsel-reviewed. No paid commercial price
            is announced.
          </p>
          <ul className="available-today-list">
            {availableToday.map((item) => (
              <li key={item.label}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>
                  <span className="available-today-label">{item.label}</span>
                  <span className="available-today-state">
                    <StatusPill maturity={item.maturity} deployment={item.deployment} />
                    <span className="visually-hidden">
                      {maturityLabels[item.maturity]} · {deploymentLabels[item.deployment]}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="available-today-actions">
            <Link href="/install" className="button-primary">
              Install Ledgerful <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <span className="available-today-hint">
              No account, no source upload, no subscription.
            </span>
          </div>
        </aside>
        <div className="pricing-grid">
          {editions.map((edition) => {
            const isPlanned = edition.maturity === "planned";
            return (
              <article
                key={edition.name}
                className={
                  isPlanned ? "pricing-card pricing-card--planned" : "pricing-card"
                }
              >
                <div className="pricing-card-head">
                  <div>
                    <h3>{edition.name}</h3>
                    <p>{edition.audience}</p>
                  </div>
                  <StatusPill maturity={edition.maturity} deployment={edition.deployment} />
                </div>
                <p className={edition.price.startsWith("$") ? "price" : "price price--label"}>
                  {edition.price}
                </p>
                <p>{edition.description}</p>
                <ul>
                  {edition.includes.map((item) => (
                    <li key={item.label}>
                      <CheckCircle2 size={18} aria-hidden="true" />
                      <span>
                        {item.label}
                        {item.caveat ? (
                          <span className="item-caveat">{item.caveat}</span>
                        ) : null}
                      </span>
                      <StatusPill maturity={item.maturity} deployment={item.deployment} />
                    </li>
                  ))}
                </ul>
                {edition.cta ? (
                  <div className="pricing-card-cta">
                    {edition.cta.href.startsWith("/") ? (
                      <Link href={edition.cta.href} className="button-secondary">
                        {edition.cta.label}
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    ) : (
                      <a href={edition.cta.href} className="button-secondary">
                        {edition.cta.label}
                        <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    )}
                    {edition.cta.note ? (
                      <span className="item-caveat">{edition.cta.note}</span>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="content-band">
        <SectionHeading kicker="License boundary" title="Who qualifies for what">
          A plain-English read of the free/paid boundary, plus concrete
          examples matching the Small-Entity Commercial Exception text.
        </SectionHeading>
        <LicenseExamples />
      </section>

      <section className="content-band">
        <SectionHeading kicker="Comparison" title="Feature matrix">
          Every row carries an explicit state. Planned features are not built
          yet and have no announced timeline.
        </SectionHeading>
        <p className="matrix-scroll-hint" aria-hidden="true">
          Scroll the table →
        </p>
        <div
          role="region"
          aria-label="Feature comparison table"
          className="matrix-scroll"
          tabIndex={0}
        >
          <table className="matrix-table">
            <caption className="sr-only">
              Ledgerful feature comparison across Local, Commercial License,
              Hosted, and Enterprise editions.
            </caption>
            <thead>
              <tr>
                <th scope="col">Feature</th>
                {matrixEditionHeaders.map((name) => (
                  <th key={name} scope="col">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            {matrixGroups.map((group) => (
              <tbody key={group.label}>
                <tr>
                  <th
                    scope="rowgroup"
                    colSpan={matrixEditionHeaders.length + 1}
                    className="matrix-group-label"
                  >
                    {group.label}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">
                      {row.feature}
                      {row.caveat ? (
                        <span className="item-caveat">{row.caveat}</span>
                      ) : null}
                    </th>
                    {row.cells.map((cell, i) =>
                      cell ? (
                        <td key={matrixEditionHeaders[i]}>
                          <StatusPill maturity={cell.maturity} deployment={cell.deployment} />
                        </td>
                      ) : (
                        <td key={matrixEditionHeaders[i]}>
                          <span className="matrix-empty" aria-label="not included">
                            —
                          </span>
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <ul className="pricing-footnotes">
          {pricingFootnotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="content-band">
        <SectionHeading kicker="FAQ" title="Common questions">
          Threshold definition, contractors, hosting, and OEM — plain-English
          answers pending the same counsel review as the license examples
          above.
        </SectionHeading>
        <div className="pricing-faq">
          {pricingFaq.map((item) => (
            <details key={item.question} className="pricing-faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="content-band" id="legend">
        <SectionHeading title="What each state label means">
          The same labels appear on the feature matrix above and on the
          homepage. Available and beta capabilities run on your machine;
          hosted features are planned and not built yet.
        </SectionHeading>
        <div className="state-legend">
          {stateLegendOrder.map(([maturity, deployment]) => (
            <div className="state-legend-item" key={`${maturity}-${deployment}`}>
              <StatusPill maturity={maturity} deployment={deployment} />
              <p>{stateDefinitions[maturity][deployment]}</p>
            </div>
          ))}
        </div>
        <div className="edition-legend" style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "8px" }}>Edition columns</h3>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "6px", color: "var(--muted)" }}>
            {(Object.keys(editionLabels) as Edition[]).map((ed) => (
              <li key={ed} style={{ display: "flex", gap: "8px" }}>
                <strong style={{ color: "var(--ink-primary)", minWidth: "100px" }}>{editionLabels[ed]}</strong>
                <span>{ed === "local" ? "Free for individuals and small companies" : ed === "commercial" ? "Paid license for broader commercial use" : ed === "hosted" ? "Planned hosted service" : "Planned enterprise features"}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="content-band pricing-cta-band">
        <p>Review the draft source terms, then run locally. No account required.</p>
        <div className="hero-actions">
          <Link href="/docs/cli" className="button-primary">Install the CLI</Link>
          <Link href="/trust" className="button-secondary">Review trust posture</Link>
        </div>
      </div>
    </PageShell>
  );
}

// Real definitions of each feature-state axis pair — shared with the homepage
// summary and the pricing-page glossary so the wording cannot drift.
const stateDefinitions: Record<Maturity, Record<Deployment, string>> = {
  available: {
    "runs-locally": "Ships in the current local binary today and runs on your machine.",
    hosted: "Ships in the current local binary today; hosted deployment is not available yet.",
  },
  beta: {
    "runs-locally": "Implemented and usable locally; not yet fully tested for public release.",
    hosted: "Implemented and usable; hosted deployment is not available yet.",
  },
  planned: {
    "runs-locally": "Planned for a future local delivery path. Not built.",
    hosted: "A future hosted service. Not built.",
  },
};

const stateLegendOrder: [Maturity, Deployment][] = [
  ["available", "runs-locally"],
  ["beta", "runs-locally"],
  ["planned", "hosted"],
];
