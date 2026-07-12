import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { LicenseExamples } from "@/components/license-examples";
import { pageDescriptions } from "@/lib/content/navigation";
import { stateLabels } from "@/lib/content/features";
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
            <StatusPill status="local-only" />
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
                    <StatusPill status={item.state} />
                    <span className="visually-hidden">
                      {stateLabels[item.state]}
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
            const isPlanned =
              edition.state === "hosted planned" ||
              edition.state === "enterprise planned";
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
                  <StatusPill status={edition.state} />
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
                      <StatusPill status={item.state} />
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
          Every row carries an explicit state. Planned features require a future
          hosted control plane and have no announced timeline.
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
                          <StatusPill status={cell.state} />
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
