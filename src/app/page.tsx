import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { EvidencePanel } from "@/components/evidence-panel";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { featureStates } from "@/lib/content/features";
import { pageDescriptions, siteUrl } from "@/lib/content/navigation";

export const metadata: Metadata = {
  description: pageDescriptions.home,
  alternates: { canonical: "/" },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Ledgerful",
  applicationCategory: "DeveloperTool",
  operatingSystem: "Linux, macOS, Windows",
  url: siteUrl,
  description:
    "Local-first change intelligence and signed provenance for repo risk and verification evidence.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const workflow = [
  {
    index: "01",
    title: "Scan",
    body: (
      <>
        <code>ledgerful scan --base-ref main</code> analyzes repo changes
        locally — file diff, risk surface, and impact without uploading source.
      </>
    ),
  },
  {
    index: "02",
    title: "Record",
    body: (
      <>
        Each scan writes a signed ledger entry. History is tamper-evident and
        stored under <code>.ledgerful/</code>.
      </>
    ),
  },
  {
    index: "03",
    title: "Verify",
    body: (
      <>
        <code>ledgerful verify</code> re-checks signatures and dependencies.
        Release hygiene stays explicit, not implicit.
      </>
    ),
  },
  {
    index: "04",
    title: "Export",
    body: (
      <>
        <code>ledgerful compliance export</code> produces a signed SOC2
        evidence bundle. No upload required.
      </>
    ),
  },
];

export default function Home() {
  return (
    <PageShell>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="release-chip">
            <span className="release-chip-dot" aria-hidden="true" />
            Current release: source install available; pre-built binaries pending.{" "}
            <Link
              href="/docs/releases"
              style={{
                color: "var(--primary-strong)",
                fontWeight: 680,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                textDecorationColor: "var(--line)",
              }}
            >
              Release notes →
            </Link>
          </p>
          <h1>Understand what changed before it ships.</h1>
          <p>
            Ledgerful runs on your machine to analyze repo changes, record
            signed provenance, plan verification, and export audit evidence —
            without uploading source code by default.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/install">
              Install Ledgerful{" "}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button-secondary" href="/architecture">
              See how it works
            </Link>
            <Link className="button-secondary" href="/trust">
              Trust posture
            </Link>
          </div>
          <div className="hero-actions" style={{ marginTop: "12px" }}>
            <Link className="button-tertiary" href="/docs">
              Read the docs
            </Link>
            <Link className="button-tertiary" href="/pricing">
              See editions
            </Link>
          </div>
          <p className="private-preview" aria-label="Repository access state">
            <ShieldAlert size={15} aria-hidden="true" />
            <span>
              <strong>Private preview / early access.</strong> The source
              repository is private until the legal launch gates clear. Running{" "}
              <code>cargo install</code> against the GitHub URL requires
              authorized access today; this is expected, not a bug.
            </span>
          </p>
        </div>
        <EvidencePanel />
      </section>

      <section className="content-band" id="how-it-works">
        <SectionHeading title="Scan, record, verify, export — locally.">
          Every step runs on your machine. Nothing uploads by default. The
          public web is one of three surfaces; the engine and embedded
          dashboard run locally. Telemetry is opt-in.
        </SectionHeading>
        <div className="workflow-strip">
          {workflow.map((step) => (
            <article className="workflow-step" key={step.index}>
              <span className="workflow-step-index">{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
        <p
          style={{
            marginTop: "18px",
            color: "var(--muted)",
            fontSize: "0.92rem",
          }}
        >
          Default data flow: source code stays on your machine. The local
          dashboard binds to <code>127.0.0.1</code> only. Hosted sync is{" "}
          <em style={{ fontStyle: "normal", color: "var(--ink)" }}>
            planned
          </em>
          , not live. See{" "}
          <Link
            href="/architecture"
            style={{
              color: "var(--primary-strong)",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              textDecorationColor: "var(--line)",
            }}
          >
            the architecture page
          </Link>
          .
        </p>
      </section>

      <section className="split-band" id="feature-states">
        <SectionHeading title="Feature states are part of the product">
          Every Ledgerful capability carries an explicit state. Hosted and
          enterprise features are not presented as live before the control
          plane exists.
        </SectionHeading>
        <div
          className="feature-table"
          aria-label="Ledgerful feature states"
        >
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
    </PageShell>
  );
}