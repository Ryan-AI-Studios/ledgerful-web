import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { pageDescriptions } from "@/lib/content/navigation";
import { stateLabels, type FeatureState } from "@/lib/content/features";
import {
  editions,
  matrixGroups,
  matrixEditionHeaders,
  pricingFootnotes,
} from "@/lib/content/pricing";

export const metadata: Metadata = {
  title: "Pricing — editions and feature states",
  description: pageDescriptions.pricing,
  alternates: {
    canonical: "/pricing",
  },
};

type AvailableItem = {
  label: string;
  state: FeatureState;
};

const availableToday: AvailableItem[] = [
  { label: "Local CLI and engine", state: "available" },
  { label: "Local dashboard", state: "local-only" },
  { label: "Signed ledger provenance", state: "available" },
  { label: "SOC2 evidence ZIP export", state: "local-only" },
  { label: "MCP stdio tools", state: "beta" },
  { label: "GitHub Action setup path", state: "beta" },
];

export default function PricingPage() {
  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Edition boundaries</p>
        <h1>Pricing copy that does not outrun implementation.</h1>
        <p>
          Free/local and team-local paths are separated from hosted and
          enterprise capabilities that require future control-plane work.
        </p>
      </section>

      <section className="content-band">
        <SectionHeading title="Editions">
          Available and beta editions are local-first. Hosted and enterprise
          editions require a future control plane and have no announced prices or
          timelines.
        </SectionHeading>

        <aside
          className="available-today"
          aria-labelledby="available-today-heading"
        >
          <div className="available-today-head">
            <StatusPill status="available" />
            <h2 id="available-today-heading">Available today</h2>
            <p className="available-today-price">$0</p>
          </div>
          <p>
            The Free / Local edition is the only edition with announced pricing.
            It runs entirely on your machine and ships every capability that is
            available or in beta right now.
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
              </article>
            );
          })}
        </div>
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
              Ledgerful feature comparison across Free / Local, Pro / Team
              Local, Team Hosted, and Enterprise editions.
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

      <div className="content-band pricing-cta-band">
        <p>Start with the free local edition. No account required.</p>
        <div className="hero-actions">
          <Link href="/docs/cli" className="button-primary">Install the CLI</Link>
          <Link href="/trust" className="button-secondary">Review trust posture</Link>
        </div>
      </div>
    </PageShell>
  );
}
