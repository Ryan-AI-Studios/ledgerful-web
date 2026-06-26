import Link from "next/link";
import { ArrowRight, CircleDot, Network, ShieldCheck } from "lucide-react";
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
          <h1>Ledgerful keeps repo risk, signed history, and verification evidence inspectable.</h1>
          <p>
            A public web surface for programming teams evaluating Ledgerful
            before adoption. The local engine is real; hosted control-plane,
            identity, billing, and GitHub App capabilities stay labeled as planned.
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
        <SectionHeading kicker="Boundary" title="Four surfaces, one honest adoption path">
          The public site explains Ledgerful without importing dashboard clients
          or pretending the localhost daemon is a SaaS backend.
        </SectionHeading>
        <div className="boundary-grid">
          <article>
            <CircleDot size={24} aria-hidden="true" />
            <h3>Local engine</h3>
            <p>CLI, daemon APIs, signed ledger, local dashboard host, MCP, GitHub Action, sync, and evidence export.</p>
          </article>
          <article>
            <Network size={24} aria-hidden="true" />
            <h3>Dashboard app</h3>
            <p>Static embedded product UI backed by the local daemon and ephemeral token access.</p>
          </article>
          <article>
            <ShieldCheck size={24} aria-hidden="true" />
            <h3>Public web</h3>
            <p>Marketing, docs, pricing, trust, changelog, SEO, launch facts, and Vercel deployment.</p>
          </article>
          <article>
            <ArrowRight size={24} aria-hidden="true" />
            <h3>Hosted control plane</h3>
            <p>Future accounts, GitHub App webhooks, billing, SSO, SCIM, RBAC, and hosted audit logs.</p>
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
