import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { pageDescriptions } from "@/lib/content/navigation";
import { editions } from "@/lib/content/pricing";

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
          Every significant feature carries a visible state.
        </SectionHeading>
        <div className="pricing-grid">
          {editions.map((edition) => (
            <article key={edition.name} className="pricing-card">
              <div className="pricing-card-head">
                <div>
                  <h2>{edition.name}</h2>
                  <p>{edition.audience}</p>
                </div>
                <StatusPill status={edition.state} />
              </div>
              <p className="price">{edition.price}</p>
              <p>{edition.description}</p>
              <ul>
                {edition.includes.map((item) => (
                  <li key={item.label}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>{item.label}</span>
                    <StatusPill status={item.state} />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
