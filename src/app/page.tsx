import type { Metadata } from "next";
import type { SoftwareApplication, WithContext } from "schema-dts";
import Image from "next/image";
import Link from "next/link";
import { HeroProof } from "@/components/hero-proof";
import { ArtifactPreview } from "@/components/artifact-preview";
import { AudienceRoutes } from "@/components/audience-routes";
import { CapabilityGrid } from "@/components/capability-grid";
import { DataFlowStrip } from "@/components/data-flow-strip";
import { EvidencePanel } from "@/components/evidence-panel";
import { InstallCommand } from "@/components/install-command";
import { PageShell } from "@/components/page-shell";
import { ProofStrip } from "@/components/proof-strip";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { WaitlistForm } from "@/components/waitlist-form";
import { capturedEvidence } from "@/components/captured-evidence";
import type { FeatureState } from "@/lib/content/features";
import { launchTruth } from "@/lib/content/launch-facts";
import { pageDescriptions, siteUrl } from "@/lib/content/navigation";

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
};

// Real captured URL, same source as hero-proof.tsx (see that file's comment
// for the full provenance chain). Reused here at a smaller frame for the
// "what a scan produces" preview grid — same real image, different caption.
const DASHBOARD_CAPTURE_URL = "http://127.0.0.1:52001/dashboard";

// The only real evidence in this repo for a "repo knowledge/search"
// capability is this one line from a captured `ledgerful doctor` run — there
// is no captured screenshot or artifact for search results, so this section
// shows the real line rather than an invented search UI. See
// src/components/captured-evidence.ts.
const searchIndexLine = capturedEvidence.doctor.lines.find((line) =>
  line.includes("Search index"),
);

// Short, real definitions of each feature state — grounds the legend in
// what the state actually means for a reader deciding whether to rely on a
// capability today, without repeating the per-feature evidence text already
// shown in the capability grid above it.
const stateDefinitions: Record<FeatureState, string> = {
  available: "Ships in the current local binary today.",
  beta: "Implemented and usable, but not yet public-release-verified.",
  "local-only": "Runs today, only on your machine — no hosted equivalent exists yet.",
  "hosted planned": "A design target for the future hosted control plane. Not built.",
  "enterprise planned": "A design target for future enterprise identity and audit. Not built.",
};

const stateLegendOrder: FeatureState[] = [
  "available",
  "beta",
  "local-only",
  "hosted planned",
  "enterprise planned",
];

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
        <span className="evidence-frame-caption">Real local dashboard receipt</span>
        <span className="evidence-frame-url">{DASHBOARD_CAPTURE_URL}</span>
      </figcaption>
    </figure>
  );
}

export default function Home() {
  const { release, repository } = launchTruth.facts;

  return (
    <PageShell>
      {/* 2. Hero, and 3. the action -> receipt proof visual — two distinct
          <section> landmarks (each with its own heading, per the required
          section order) sharing one grid row so the proof visual sits
          beside the hero copy on wide viewports instead of below a full
          screen of hero text. On narrow viewports the grid collapses to a
          single column, so section 2 still renders before section 3. */}
      <div className="hero-section">
        <section className="hero-copy" id="hero">
          <h1>
            Understand code change risk before it ships. Runs locally on your
            code.
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
        </section>

        <section id="proof-visual" aria-label="Action and receipt proof visual">
          <h2 className="visually-hidden">One scan. One receipt.</h2>
          <HeroProof />
        </section>
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
          Three real pressures, not a comparison to any other tool.
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
          Five real outputs, each traceable to a captured artifact — nothing
          below is a mockup.
        </SectionHeading>
        <div className="produces-grid">
          <article>
            <h3>Risk summary</h3>
            <RiskSummaryPreview />
          </article>
          <article>
            <h3>Provenance record</h3>
            <ArtifactPreview id="provenanceRecord" />
          </article>
          <article>
            <h3>Verification plan</h3>
            <ArtifactPreview id="verificationPlan" />
          </article>
          <article>
            <h3>Evidence export</h3>
            <ArtifactPreview id="evidenceExport" />
          </article>
          {searchIndexLine ? (
            <article>
              <h3>Repo knowledge and search</h3>
              <div
                className="terminal-window annotated"
                aria-label="Search index status — ledgerful doctor"
              >
                <div className="terminal-bar" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <pre>
                  <code>{searchIndexLine}</code>
                </pre>
                <div className="terminal-annotation">
                  <span className="terminal-caption">
                    One real line from a captured environment health check —
                    no search-results UI is shown because none has been
                    captured yet
                  </span>
                  <span className="terminal-meta">ledgerful doctor</span>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      {/* 8. Capability grid */}
      <section className="split-band" id="capabilities">
        <SectionHeading title="Every capability, in one flat list">
          Every row carries an explicit state. Hosted and enterprise
          capabilities are not shown as live before the control plane exists.
        </SectionHeading>
        <CapabilityGrid />
      </section>

      {/* 9. How it stays local */}
      <section className="content-band" id="stays-local">
        <SectionHeading title="How it stays local">
          The engine, ledger, and dashboard run on your machine. The local
          dashboard binds to <code>127.0.0.1</code> only. Hosted sync is{" "}
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

      {/* 10. Audience routing */}
      <section className="split-band" id="audience">
        <SectionHeading title="Start where you sit">
          Three real paths, no invented case studies.
        </SectionHeading>
        <AudienceRoutes />
      </section>

      {/* 11. Available-today vs. planned legend */}
      <section className="content-band" id="legend">
        <SectionHeading title="What each state label means">
          The same five states appear on the capability grid above and on{" "}
          <Link href="/pricing" className="inline-link">
            the pricing page
          </Link>
          .
        </SectionHeading>
        <div className="state-legend">
          {stateLegendOrder.map((state) => (
            <div className="state-legend-item" key={state}>
              <StatusPill status={state} />
              <p>{stateDefinitions[state]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 11.5. Waitlist / early access */}
      <section className="content-band" id="waitlist">
        <SectionHeading title="Register interest">
          We are in quiet preview. Leave your email and we will let you know when
          Ledgerful is ready to install. No commitment, no timeline, no purchase.{" "}
          <Link href="/waitlist" className="inline-link">
            Open the full form
          </Link>
          .
        </SectionHeading>
        <WaitlistForm />
      </section>

      {/* 12. Final install CTA */}
      <section className="content-band" id="install-cta">
        <SectionHeading title="Install now, or read the docs first">
          The same source-build command from earlier on this page.
        </SectionHeading>
        <InstallCommand variant="expanded" linkLabel="Open the install guide" />
        <p style={{ marginTop: "18px" }}>
          <Link href="/docs" className="inline-link">
            Docs →
          </Link>
        </p>
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
