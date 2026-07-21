import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { LicenseExamples } from "@/components/license-examples";
import { pageDescriptions } from "@/lib/content/navigation";
import {
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
import {
  buildCommercialLicenseMailto,
  buildOemHostingMailto,
  commercialPriceBandRows,
  commercialPricing,
} from "@/lib/content/commercial-pricing";

export const metadata: Metadata = {
  title: "Editions — licenses and feature states",
  description: pageDescriptions.pricing,
  alternates: {
    canonical: "/editions",
  },
  openGraph: {
    url: "/editions",
    images: [
      {
        url: "/og/pricing.png",
        width: 1200,
        height: 630,
        alt: "Editions — licenses and feature states, with a real local dashboard receipt showing Project Health and Recent Changes.",
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

const priceBands = commercialPriceBandRows();

export default function EditionsPage() {
  return (
    <PageShell>
      <section className="page-hero compact">
        <h1>Use Ledgerful locally for free. License it for broader commercial use.</h1>
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

        {/* Layer 1 — eligibility (revenue / QSE / eval / written auth), not headcount */}
        <div className="decision-tree">
          <h2 className="decision-tree-heading">Which path fits you?</h2>
          <p className="decision-tree-intro">
            Eligibility is revenue- and use-based (Qualified Small Entity,
            Evaluation Use, or Written Authorization). Headcount price bands
            apply only after you need a paid Commercial License.
          </p>
          <ul className="decision-tree-list">
            <li>
              <strong>Individual or noncommercial use</strong> →{" "}
              <Link href="/install" className="inline-link">
                Local
              </Link>
            </li>
            <li>
              <strong>Qualifying small commercial use</strong> (under $1M
              aggregated gross revenue across You and Affiliates, Internal
              Business Use only) →{" "}
              <Link href="/install" className="inline-link">
                Local
              </Link>
            </li>
            <li>
              <strong>Evaluation Use</strong> (30 days, once per Entity +
              Affiliate group, non-Production only) →{" "}
              <Link href="/install" className="inline-link">
                Local
              </Link>
              {" · "}
              <a href="#eval-rights" className="inline-link">
                rights summary
              </a>
            </li>
            <li>
              <strong>Broader commercial Internal Business Use</strong> (at
              or above $1M aggregated revenue, or outside QSE after eval /
              transition) →{" "}
              <a href="#commercial-license" className="inline-link">
                Commercial License pricing
              </a>
              {" · "}
              <a href={buildCommercialLicenseMailto()} className="inline-link">
                Request commercial license
              </a>
            </li>
            <li>
              <strong>OEM, hosting-as-a-service, resale, or redistribution</strong>{" "}
              →{" "}
              <a href={buildOemHostingMailto()} className="inline-link">
                Separate written agreement
              </a>{" "}
              (regardless of size)
            </li>
            <li>
              <strong>Hosted, regulated, or custom deployment</strong> →{" "}
              <a
                href="mailto:hello@ledgerful.dev?subject=Ledgerful%20Enterprise%20inquiry"
                className="inline-link"
              >
                Contact us
              </a>
            </li>
          </ul>
        </div>

        <aside
          className="available-today"
          aria-labelledby="available-today-heading"
        >
          <div className="available-today-head">
            <h2 id="available-today-heading">Implemented in the current build</h2>
          </div>
          <p>
            The local capabilities below ship in the current build. The
            license is in force (Ledgerful, LLC formed, IP assigned, Exception
            counsel-reviewed). Commercial License introductory pricing is
            published below; Hosted and Enterprise remain Pricing not
            announced.
          </p>
          <ul className="available-today-list">
            {availableToday.map((item) => (
              <li key={item.label}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <div className="available-today-item-body">
                  <span className="available-today-label">{item.label}</span>
                  {item.caveat ? (
                    <span className="item-caveat">{item.caveat}</span>
                  ) : null}
                  <StatusPill maturity={item.maturity} deployment={item.deployment} />
                </div>
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

        {/* Layer 2 — headcount-band Commercial prices (only if you need a paid license) */}
        <section
          id="commercial-license"
          className="commercial-price-section"
          aria-labelledby="commercial-license-heading"
        >
          <div className="commercial-price-section-head">
            <h2 id="commercial-license-heading">Commercial License pricing</h2>
            <span className="provisional-badge">{commercialPricing.provisionalLabel}</span>
          </div>
          <p className="commercial-price-section-lead">
            Flat annual USD license for Internal Business Use when you are
            outside free eligibility. Same software capabilities as Local —
            the license changes who may run it, not what it does. These bands
            are not the free/paid line; revenue and use type are.
          </p>
          <ul className="commercial-price-bands">
            {priceBands.map((band) => (
              <li key={band.label} className="commercial-price-band">
                <span className="commercial-price-band-label">{band.label}</span>
                <span
                  className={
                    band.isContact
                      ? "commercial-price-band-price commercial-price-band-price--contact"
                      : "commercial-price-band-price"
                  }
                >
                  {band.priceDisplay}
                </span>
              </li>
            ))}
          </ul>
          <p className="commercial-price-fulfillment">
            {commercialPricing.fulfillmentSentence}
          </p>
          <p className="commercial-price-oem">{commercialPricing.oemHostingNote}</p>
          <div className="commercial-price-actions">
            <a href={buildCommercialLicenseMailto()} className="button-primary">
              Request commercial license
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a
              href={commercialPricing.exceptionHref}
              className="button-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Full Exception text
              <span className="sr-only"> (opens as markdown)</span>
            </a>
          </div>

          <details className="commercial-legal-details" id="eval-rights">
            <summary>Evaluation, QSE, and transition rights (summary)</summary>
            <div className="commercial-legal-details-body">
              <ul>
                <li>
                  <strong>Qualified Small Entity (QSE):</strong> under $1M
                  Aggregated Gross Revenue across You and all Affiliates;
                  Internal Business Use only. At exactly $1,000,000 you are
                  not a QSE.
                </li>
                <li>
                  <strong>Evaluation Use:</strong> 30 days, once per Entity +
                  its Affiliate group, non-Production only; does not reset on
                  upgrades, new versions, or Affiliate transfers.
                </li>
                <li>
                  <strong>90-day transition:</strong> when you cross the
                  threshold or on Change of Control, a transition grant may
                  apply so you can obtain a commercial license — see the
                  Exception.
                </li>
                <li>
                  <strong>OEM / hosting / resale:</strong> separate written
                  agreement via {commercialPricing.contactEmail}, regardless of
                  size.
                </li>
              </ul>
              <p>
                Plain-language summary — not legal advice. The{" "}
                <a
                  href={commercialPricing.exceptionHref}
                  className="inline-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ledgerful Small-Entity Commercial Exception
                </a>{" "}
                text governs.
              </p>
            </div>
          </details>
        </section>

        <div className="pricing-grid">
          {editions.map((edition) => {
            const isPlanned = edition.maturity === "planned";
            const isCommercial = edition.name === "Commercial License";
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
                {edition.provisionalLabel ? (
                  <span className="provisional-badge">{edition.provisionalLabel}</span>
                ) : null}
                <p className={edition.price.startsWith("$") || edition.price.startsWith("From $") ? "price" : "price price--label"}>
                  {edition.price}
                </p>
                {isCommercial ? (
                  <ul className="pricing-card-bands" aria-label="Commercial License price bands">
                    {priceBands.map((band) => (
                      <li key={band.label}>
                        <span>{band.label}</span>
                        <strong>{band.priceDisplay}</strong>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p>{edition.description}</p>
                <ul className="pricing-card-includes">
                  {edition.includes.map((item) => (
                    <li key={item.label}>
                      <CheckCircle2 size={18} aria-hidden="true" />
                      <div className="pricing-card-include-body">
                        <span className="pricing-card-include-label">{item.label}</span>
                        {item.caveat ? (
                          <span className="item-caveat">{item.caveat}</span>
                        ) : null}
                        <StatusPill
                          maturity={item.maturity}
                          deployment={item.deployment}
                        />
                      </div>
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
        <p className="edition-disclaimer" style={{ marginTop: "16px", color: "var(--muted)" }}>
          Still unsure?{" "}
          <a
            href="mailto:hello@ledgerful.dev?subject=Ledgerful%20edition%20question"
            className="inline-link"
          >
            Email hello@ledgerful.dev
          </a>{" "}
          for general questions, or{" "}
          <a href={buildCommercialLicenseMailto()} className="inline-link">
            legal@ledgerful.dev
          </a>{" "}
          for commercial license and OEM inquiries. Not legal advice — the{" "}
          <a
            href={commercialPricing.exceptionHref}
            className="inline-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Exception text
          </a>{" "}
          controls.
        </p>
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
                          <span className="matrix-included">
                            <CheckCircle2 size={16} aria-hidden="true" />
                            <span className="visually-hidden">included</span>
                          </span>
                        </td>
                      ) : (
                        <td key={matrixEditionHeaders[i]}>
                          <span className="matrix-empty" aria-label="not included">
                            —
                          </span>
                        </td>
                      ),
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
          Threshold definition, Evaluation Use, 90-day transition, contractors,
          hosting, OEM, and commercial price bands — plain-English answers.
          Not legal advice; the Exception text controls.
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
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "grid",
              gap: "6px",
              color: "var(--muted)",
            }}
          >
            {(Object.keys(editionLabels) as Edition[]).map((ed) => (
              <li key={ed} style={{ display: "flex", gap: "8px" }}>
                <strong style={{ color: "var(--ink-primary)", minWidth: "100px" }}>
                  {editionLabels[ed]}
                </strong>
                <span>
                  {ed === "local"
                    ? "Free for individuals and qualifying small entities"
                    : ed === "commercial"
                      ? "Paid commercial license for broader Internal Business Use"
                      : ed === "hosted"
                        ? "Planned hosted service"
                        : "Planned enterprise features"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="content-band pricing-cta-band">
        <p>Review the source terms, then run locally. No account required.</p>
        <div className="hero-actions">
          <Link href="/docs/cli" className="button-primary">
            Install the CLI
          </Link>
          <Link href="/trust" className="button-secondary">
            Review trust posture
          </Link>
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
