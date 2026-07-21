import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { ArtifactPreview } from "@/components/artifact-preview";
import {
  buildCommercialLicenseMailto,
  commercialPricing,
} from "@/lib/content/commercial-pricing";
import {
  goldenPathBash,
  goldenPathCanonicalSteps,
  goldenPathDemoDoes,
  goldenPathHonesty,
  goldenPathPage,
  goldenPathPowerShell,
  goldenPathSkepticChecklist,
  goldenPathTimings,
} from "@/lib/content/golden-path";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: { absolute: "Golden path — prove it yourself — Ledgerful Docs" },
  description: pageDescriptions.docsGoldenPath,
  alternates: { canonical: "/docs/golden-path" },
  openGraph: { url: "/docs/golden-path", images: [homeOgImage] },
  twitter: { images: [homeOgImage.url] },
};

export default function DocsGoldenPathPage() {
  const { tProof, tFirst } = goldenPathTimings;

  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">{goldenPathPage.kicker}</p>
        <h1>{goldenPathPage.title}</h1>
        <StatusPill maturity="available" deployment="runs-locally" />
        <p>{goldenPathPage.lead}</p>
        <p className="hero-subhead">
          {goldenPathPage.successCriterion} Default path is{" "}
          <strong>CLI-only</strong> — no dashboard required.
        </p>
      </section>

      {/* ── Honesty (load-bearing) ───────────────────────────── */}
      <section className="content-band" id="honesty">
        <SectionHeading title="Honesty (load-bearing)">
          Same Ed25519 signature and chain mechanics as production — synthetic
          data, disposable keys, observe mode. Not a compliance verdict.
        </SectionHeading>
        <div className="disclosure-notice">
          <ul className="doc-step-list" style={{ listStyle: "disc", paddingLeft: "1.25rem" }}>
            {goldenPathHonesty.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Two clocks ───────────────────────────────────────── */}
      <section className="content-band" id="two-clocks">
        <SectionHeading title="Two clocks (never average)">
          Ship the proof-loop time separately from cold install. Measured{" "}
          {goldenPathTimings.measuredOn} on {goldenPathTimings.environment}.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table className="trust-table" aria-label="Golden path two clocks">
            <thead>
              <tr>
                <th scope="col">Clock</th>
                <th scope="col">Meaning</th>
                <th scope="col">Measured (this host)</th>
                <th scope="col">How we ship it</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{tProof.label}</th>
                <td>{tProof.meaning}</td>
                <td>
                  Release median <strong>{tProof.releaseMedianSeconds}s</strong>{" "}
                  (max {tProof.releaseMaxSeconds}s). Debug median{" "}
                  {tProof.debugMedianSeconds}s.
                </td>
                <td>
                  Primary magic-moment claim: {tProof.shipClaim} (
                  {tProof.note}) {tProof.remeasureNote}
                </td>
              </tr>
              <tr>
                <th scope="row">{tFirst.label}</th>
                <td>{tFirst.meaning}</td>
                <td>
                  cargo-binstall + demo ≈{" "}
                  <strong>{tFirst.binstallPlusDemoSeconds}s</strong> on a warm
                  host (install {tFirst.installSeconds}s + demo{" "}
                  {tFirst.demoSeconds}s).
                </td>
                <td>{tFirst.honestDisclosure}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Install link (T_first / cold start) ───────────────── */}
      <section className="content-band" id="install">
        <SectionHeading title="Already installed? Skip to the proof.">
          Cold start begins on the install guide (Homebrew, Scoop, cargo
          binstall, release installer, or source). After the binary is on{" "}
          <code>PATH</code>, start at the demo step below.
        </SectionHeading>
        <p>
          <Link href="/install" className="button-primary">
            Install Ledgerful
          </Link>{" "}
          <Link href="/docs/cli" className="button-secondary">
            CLI docs
          </Link>
        </p>
      </section>

      {/* ── Canonical path ───────────────────────────────────── */}
      <section className="content-band" id="canonical-path">
        <SectionHeading title="Canonical path (already-installed → VALID)">
          Exact steps mirrored from the engine golden-path narration.{" "}
          <code>demo --keep</code> retains the zip; HOME/CWD are restored after
          demo — follow-up verify must run <strong>inside</strong> the kept dir.
        </SectionHeading>

        <h3 className="doc-subhead">PowerShell</h3>
        <div className="terminal-window" aria-label="Golden path PowerShell commands">
          <div className="terminal-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{goldenPathPowerShell}</code>
          </pre>
        </div>

        <h3 className="doc-subhead">Bash</h3>
        <div className="terminal-window" aria-label="Golden path Bash commands">
          <div className="terminal-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{goldenPathBash}</code>
          </pre>
        </div>

        <div className="disclosure-notice" style={{ marginTop: "20px" }}>
          <p>
            <strong>Expected outcomes:</strong>{" "}
            <code>{goldenPathCanonicalSteps.signaturesChain}</code> → exit 0
            with VALID entries / chain verified.{" "}
            <code>{goldenPathCanonicalSteps.againstExport}</code> → exit 0 (live
            head matches retained export). Open{" "}
            <code>{goldenPathCanonicalSteps.keepZip}</code>.
          </p>
        </div>
      </section>

      {/* ── What demo already does ───────────────────────────── */}
      <section className="content-band" id="what-demo-does">
        <SectionHeading title="What automated demo already does">
          The brand moment is the VALID beat (signatures + chain + export bind)
          — not suite-health noise.
        </SectionHeading>
        <ol className="doc-step-list">
          {goldenPathDemoDoes.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {/* ── Skeptic checklist ────────────────────────────────── */}
      <section className="content-band" id="skeptic-checklist">
        <SectionHeading title="Skeptic exit-criteria">
          You should see all of the following before calling the path done.
        </SectionHeading>
        <ul className="doc-step-list" style={{ listStyle: "disc", paddingLeft: "1.25rem" }}>
          {goldenPathSkepticChecklist.map((item) => (
            <li key={item.id} id={`check-${item.id}`}>
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Real evidence asset (0021) ───────────────────────── */}
      <section className="content-band" id="evidence-preview">
        <SectionHeading title="What the retained evidence looks like">
          Real, redacted export-manifest shape from the verified sample (never
          fabricated). Your DEMO zip is generated live by{" "}
          <code>ledgerful demo --keep</code>.
        </SectionHeading>
        <ArtifactPreview id="evidenceExport" />
      </section>

      {/* ── Not in this stopwatch ────────────────────────────── */}
      <section className="content-band" id="not-in-stopwatch">
        <SectionHeading title="Not in this stopwatch">
          Separate narratives — do not fold them into the T_proof clock.
        </SectionHeading>
        <ul className="doc-step-list" style={{ listStyle: "disc", paddingLeft: "1.25rem" }}>
          <li>
            <strong>Public ledger</strong> — browser WebCrypto on Ledgerful&apos;s
            production history at{" "}
            <Link href="/ledger" className="inline-link">
              /ledger
            </Link>
            . Optional post-success sidebar: also verify our production history.
          </li>
          <li>
            <strong>Dashboard</strong> (<code>ledgerful web start</code>) —
            optional. The default skeptic loop is CLI-only.
          </li>
          <li>
            <strong>Control-mapping / certification claims</strong> — not on
            this path. The bundle is signed evidence only. This is not a
            certification and not a compliance verdict.
          </li>
        </ul>
      </section>

      {/* ── Post-success: public ledger sidebar ──────────────── */}
      <section className="content-band" id="also-public-ledger">
        <SectionHeading title="Also: verify our production history">
          After your local DEMO path succeeds, you can separately verify
          Ledgerful&apos;s published development ledger.
        </SectionHeading>
        <p>
          <Link href="/ledger" className="button-secondary">
            Open public ledger
          </Link>{" "}
          <Link href="/docs/public-ledger" className="inline-link">
            Public ledger docs
          </Link>
        </p>
      </section>

      {/* ── Next step / commercial CTA (0069 shipped) ────────── */}
      <section className="content-band" id="next-step">
        <SectionHeading title="Convinced? Next step">
          Local and noncommercial use stay free under the Exception where you
          qualify. Broader commercial Internal Business Use needs a commercial
          license.
        </SectionHeading>
        <p>
          <a
            href={buildCommercialLicenseMailto()}
            className="button-primary"
          >
            Request commercial license
          </a>{" "}
          <Link href="/editions#commercial-license" className="button-secondary">
            See editions &amp; pricing
          </Link>
        </p>
        <p style={{ marginTop: "12px", color: "var(--muted)" }}>
          {commercialPricing.fulfillmentSentence} Full terms:{" "}
          <a
            href={commercialPricing.exceptionHref}
            className="inline-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Commercial Exception
            <span className="sr-only"> (opens in new tab)</span>
          </a>
          .
        </p>
      </section>
    </PageShell>
  );
}
