import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EvidencePanel } from "@/components/evidence-panel";
import { LaunchFacts } from "@/components/launch-facts";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { featureStates } from "@/lib/content/features";

export default function Home() {
  return (
    <PageShell>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="hero-kicker">Local-first change intelligence</p>
          <h1>Change intelligence that stays on your machine.</h1>
          <p>
            Ledgerful runs on your machine, reads your repos, and produces signed
            change history and audit evidence without sending source code anywhere.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/docs">
              Read docs <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button-secondary" href="/trust">
              Review trust posture
            </Link>
          </div>
        </div>
        <EvidencePanel />
      </section>

      <section className="content-band">
        <SectionHeading kicker="How it works" title="Scan, record, verify — locally.">
          Every step runs on your machine. No source code leaves your environment.
        </SectionHeading>
        <div className="timeline">
          <article>
            <div className="timeline-meta">1</div>
            <div>
              <h3>Install</h3>
              <p>
                <code>cargo install ledgerful</code> or download a pre-built binary.
                Runs entirely on your machine.
              </p>
            </div>
          </article>
          <article>
            <div className="timeline-meta">2</div>
            <div>
              <h3>Scan</h3>
              <p>
                <code>ledgerful scan</code> analyzes change impact across one or many
                repos. Impact and risk are assessed locally.
              </p>
            </div>
          </article>
          <article>
            <div className="timeline-meta">3</div>
            <div>
              <h3>Record</h3>
              <p>
                Each scan writes a signed ledger entry. History is tamper-evident and
                stored in <code>.changeguard/</code>.
              </p>
            </div>
          </article>
          <article>
            <div className="timeline-meta">4</div>
            <div>
              <h3>Export</h3>
              <p>
                <code>ledgerful compliance export</code> produces a signed SOC2
                evidence bundle. No upload required.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="split-band">
        <SectionHeading title="Feature states are part of the product">
          Ledgerful should be evaluated with the limits visible. No hosted or
          enterprise capability is presented as live before the control plane exists.
        </SectionHeading>
        <div className="feature-table" aria-label="Ledgerful feature states">
          {featureStates.map((feature) => (
            <article className="feature-row" key={feature.name}>
              <div>
                <h3>{feature.name}</h3>
                <p>{feature.description}</p>
              </div>
              <StatusPill status={feature.state} />
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <SectionHeading title="Launch facts stay visible until resolved">
          Public credibility depends on refusing fake status pages, package
          links, license claims, and release downloads.
        </SectionHeading>
        <LaunchFacts />
      </section>
    </PageShell>
  );
}
