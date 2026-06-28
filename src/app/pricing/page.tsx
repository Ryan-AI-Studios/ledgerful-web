import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { pageDescriptions } from "@/lib/content/navigation";
import {
  editions,
  matrixGroups,
  matrixEditionHeaders,
  pricingFootnotes,
} from "@/lib/content/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: pageDescriptions.pricing,
  alternates: {
    canonical: "/pricing",
  },
};

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

      <div
        className="content-band"
        style={{
          paddingTop: "clamp(32px, 5vw, 64px)",
          paddingBottom: "clamp(48px, 8vw, 96px)",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--muted)", marginBottom: "24px", fontSize: "1.05rem" }}>
          Start with the free local edition. No account required.
        </p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link href="/docs/cli" className="button-primary">Install the CLI</Link>
          <Link href="/trust" className="button-secondary">Review trust posture</Link>
        </div>
      </div>
    </PageShell>
  );
}
