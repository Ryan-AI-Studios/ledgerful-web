import type { Metadata } from "next";
import type { SoftwareApplication, WithContext } from "schema-dts";
import Image from "next/image";
import Link from "next/link";
import { ArtifactPreview } from "@/components/artifact-preview";
import { AudienceRoutes } from "@/components/audience-routes";
import { DataFlowStrip } from "@/components/data-flow-strip";
import { EvidencePanel } from "@/components/evidence-panel";
import { InstallCommand } from "@/components/install-command";
import { LegendHashRedirect } from "@/components/legend-hash-redirect";
import { PageShell } from "@/components/page-shell";
import { ProofStrip } from "@/components/proof-strip";
import { SectionHeading } from "@/components/section-heading";
import { WaitlistForm } from "@/components/waitlist-form";
import { launchTruth } from "@/lib/content/launch-facts";
import { pageDescriptions, siteUrl } from "@/lib/content/navigation";
import { pillars, askCaveat } from "@/lib/content/pillars";

export const metadata: Metadata = {
  description: pageDescriptions.home,
  alternates: { canonical: "/" },
};

const softwareApplicationJsonLd: WithContext<SoftwareApplication> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Ledgerful",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Linux, macOS, Windows",
  url: siteUrl,
  description:
    "Local-first change intelligence and signed provenance for repo risk and verification evidence.",
  featureList: pillars.map((p) => p.label),
};

// Real captured URL, same source as hero-proof.tsx (see that file's comment
// for the full provenance chain). Reused here at a smaller frame for the
// "what a scan produces" preview grid — same real image, different caption.
const DASHBOARD_CAPTURE_URL = "http://127.0.0.1:52001/dashboard";


function RiskSummaryPreview() {
  return (
    <figure className="evidence-frame">
      <picture>
        <source srcSet="/product/dashboard-risk-summary.avif" type="image/avif" />
        <source srcSet="/product/dashboard-risk-summary.webp" type="image/webp" />
        <Image
          unoptimized
          className="evidence-frame-media"
          src="/product/dashboard-risk-summary.webp"
          alt="Ledgerful local dashboard showing Project Health and Recent Changes for a scanned sample repository, with per-file risk state"
          width={2560}
          height={1600}
          sizes="(max-width: 900px) 100vw, 100vw"
        />
      </picture>
      <figcaption className="evidence-frame-meta">
        <span className="evidence-frame-caption">Local dashboard receipt</span>
        <span className="evidence-frame-url">{DASHBOARD_CAPTURE_URL}</span>
      </figcaption>
    </figure>
  );
}

export default function Home() {
  const { release, repository } = launchTruth.facts;

  return (
    <PageShell>
      {/* 2. Hero — headline/CTAs at reading measure; release line, docs link,
          and signed receipt span the full hero content width below. */}
      <div className="hero-section hero-section--stacked">
        <section className="hero-copy" id="hero">
          <h1>
            Understand code change risk before it ships. Runs locally.
          </h1>
          <p className="hero-subhead">
            Ledgerful analyzes Git repositories locally and produces risk,
            provenance, verification, and SOC 2-style evidence without
            uploading source code by default.
          </p>
          <div className="hero-actions hero-actions--primary">
            <InstallCommand />
            <Link className="button-secondary" href="/architecture">
              See how it works
            </Link>
          </div>
        </section>
        <div className="hero-meta">
          <div className="hero-launch-line">
            <span className="hero-launch-line-dot" aria-hidden="true" />
            <span>
              <strong>{release.value}.</strong> {repository.value} — see{" "}
              <Link href="/docs/releases">release notes</Link>.
            </span>
          </div>
          <div className="hero-actions hero-actions--quiet">
            <Link className="button-tertiary" href="/docs">
              Read the docs
            </Link>
          </div>
        </div>
        <aside className="hero-visual" aria-label="Sample signed provenance receipt">
          <p className="hero-visual-label">Sample signed receipt</p>
          <ArtifactPreview id="provenanceRecord" className="hero-visual-frame" />
        </aside>
      </div>

      {/* 4. Data-flow strip */}
      <section className="content-band content-band--strip" id="data-flow">
        <h2 className="visually-hidden">Where your data goes</h2>
        <DataFlowStrip />
      </section>

      {/* 5. Four-item proof strip */}
      <section className="content-band content-band--strip" id="proof-points">
        <h2 className="visually-hidden">Proof points, linked to evidence</h2>
        <ProofStrip />
      </section>

      {/* 6. Problem and stakes */}
      <section className="split-band" id="problem">
        <SectionHeading title="The volume of change has outpaced the evidence for it.">
          More commits, more repositories, more evidence rebuilt after the fact.
        </SectionHeading>
        <div className="problem-grid">
          <article>
            <h3>More change, reviewed the same way</h3>
            <p>
              AI-assisted commits keep raising the volume of change a team
              produces, while most of it still gets the same diff-sized
              review it always did.
            </p>
          </article>
          <article>
            <h3>Risk spreads across repositories</h3>
            <p>
              Once work spans more than one repository, risk collects across
              all of them at once — and no single diff view shows that
              picture.
            </p>
          </article>
          <article>
            <h3>Evidence gets reconstructed after the fact</h3>
            <p>
              When an audit or incident review happens, evidence is usually
              rebuilt afterward from commit messages and memory, instead of
              captured at the time of the change.
            </p>
          </article>
        </div>
      </section>

      {/* 7. What Ledgerful produces */}
      <section className="content-band" id="produces">
        <SectionHeading title="What a scan actually produces">
          Each output is a captured artifact from a real v0.1.8 run.
        </SectionHeading>
        <div className="produces-grid">
          <article>
            <h3>Risk summary</h3>
            <RiskSummaryPreview />
          </article>
          <article>
            <h3>Verification plan</h3>
            <ArtifactPreview id="verificationPlan" />
          </article>
          <article>
            <h3>Evidence export</h3>
            <ArtifactPreview id="evidenceExport" />
          </article>
        </div>
      </section>

      {/* 8. Available today vs. planned */}
      <section className="split-band" id="capabilities">
        <SectionHeading title="What's available today">
          Local CLI, dashboard, signed provenance, and SOC 2-style evidence
          export are implemented now. Team sync is beta. Hosted and enterprise
          features are planned — see the full breakdown on{" "}
          <Link href="/editions" className="inline-link">
            the editions page
          </Link>
          .
        </SectionHeading>
      </section>

      {/* 8a. The four pillars */}
      <section className="content-band" id="pillars">
        <SectionHeading title="What Ledgerful does">
          Four capabilities, all running on your machine. Nothing uploads by
          default.
        </SectionHeading>
        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <div className="pillar-card" key={pillar.id}>
              <h3>{pillar.label}</h3>
              <p>{pillar.description}</p>
              <ul className="pillar-capabilities">
                {pillar.capabilities.map((cap) => (
                  <li key={cap}>{cap}</li>
                ))}
              </ul>
              {pillar.id === "ask" && (
                <p className="pillar-caveat">{askCaveat}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. How it stays local */}
      <section className="content-band" id="stays-local">
        <SectionHeading title="Local by default">
          The engine, ledger, and dashboard run on your machine. Hosted sync is{" "}
          <em style={{ fontStyle: "normal", color: "var(--ink-primary)" }}>
            planned
          </em>
          , not live — see{" "}
          <Link href="/architecture" className="inline-link">
            the architecture page
          </Link>{" "}
          and{" "}
          <Link href="/trust" className="inline-link">
            the trust page
          </Link>
          .
        </SectionHeading>
        <EvidencePanel />
      </section>

      {/* Public ledger proof link */}
      <section className="content-band" id="public-ledger-proof">
        <SectionHeading title="See the public ledger">
          Ledgerful&apos;s own development change ledger is published at{" "}
          <Link href="/ledger" className="inline-link">
            /ledger
          </Link>{" "}
          — every entry is Ed25519-signed and verifiable in your browser.
        </SectionHeading>
      </section>

      {/* 10. Audience routing */}
      <section className="split-band" id="audience">
        <SectionHeading title="Start where you sit">
          Pick the entry point that matches your role.
        </SectionHeading>
        <AudienceRoutes />
      </section>

      {/* 11. Waitlist / launch updates */}
      <section className="content-band" id="waitlist">
        <SectionHeading title="Get launch updates">
          Ledgerful v0.1.8 is installed today. If you want launch announcements
          and changelog updates, leave your email.{" "}
          <Link href="/waitlist" className="inline-link">
            Open the full form
          </Link>
          .
        </SectionHeading>
        <WaitlistForm />
      </section>

      {/* 12. Final CTA */}
      <section className="content-band" id="install-cta">
        <SectionHeading title="Install now, or read the docs first">
          The full install guide has platform-specific binaries and
          verification steps.
        </SectionHeading>
        <div className="hero-actions">
          <Link href="/install" className="button-primary">
            Open the install guide
          </Link>
          <Link href="/docs" className="button-secondary">
            Docs
          </Link>
        </div>
      </section>

      {/* JSON-LD as a non-executable script type — valid in RSC; no runtime. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
      {/* Old #legend → /editions#legend (client effect, not an inline script tag). */}
      <LegendHashRedirect />
    </PageShell>
  );
}
