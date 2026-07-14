import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { launchTruth } from "@/lib/content/launch-facts";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "Trust and security — local-first data flow and SOC 2-style evidence",
  description: pageDescriptions.trust,
  alternates: {
    canonical: "/trust",
  },
  openGraph: {
    url: "/trust",
    images: [
      {
        url: "/og/trust.png",
        width: 1200,
        height: 630,
        alt: "Trust and security — local-first data flow and SOC 2-style evidence, with a real local dashboard receipt showing Project Health and Recent Changes.",
      },
    ],
  },
  twitter: {
    images: ["/og/trust.png"],
  },
};

export default function TrustPage() {
  const { disclosure, license, repository } = launchTruth.facts;

  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Security posture</p>
        <h1>Security starts at the local-first boundary.</h1>
        <p>
          What Ledgerful reads, writes, and transmits — and what stays on your
          machine.
        </p>
      </section>

      <div className="trust-layout">
        <div className="trust-content">
          {/* ── Executive summary table (procurement quick view) */}
          <section className="content-band" id="exec-summary">
            <SectionHeading title="Executive summary">
              The short version for procurement reviewers.
            </SectionHeading>
            <p className="trust-disclaimer">
              Ledgerful produces technical evidence only; it is not legal advice
              and does not guarantee regulatory compliance.
            </p>
            <table className="exec-summary-table">
              <tbody>
                <tr>
                  <th scope="row">Is source uploaded by default?</th>
                  <td>No. Analysis runs on your machine.</td>
                </tr>
                <tr>
                  <th scope="row">Where does analysis run?</th>
                  <td>Your machine. Local daemon at 127.0.0.1:52001.</td>
                </tr>
                <tr>
                  <th scope="row">Where are keys stored?</th>
                  <td>Locally. ~/.ledgerful/keys/ (Ed25519).</td>
                </tr>
                <tr>
                  <th scope="row">Is evidence signed?</th>
                  <td>Yes. Every ledger entry is Ed25519-signed.</td>
                </tr>
                <tr>
                  <th scope="row">Is telemetry required?</th>
                  <td>No. Opt-in only, disabled by default.</td>
                </tr>
                <tr>
                  <th scope="row">Hosted control plane?</th>
                  <td>Planned. Not built.</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ── Procurement facts ─────────────────────────────── */}
          <section className="content-band" id="procurement">
            <SectionHeading title="Procurement facts">
              What a security reviewer needs to know.
            </SectionHeading>
            <dl className="procurement-facts">
              <dt>Security contact</dt>
              <dd>security@ledgerful.dev (active, monitored)</dd>

              <dt>Disclosure policy</dt>
              <dd>
                Responsible disclosure with safe-harbor. See{" "}
                <Link href="#disclosure">disclosure section</Link>.
              </dd>

              <dt>Release verification</dt>
              <dd>
                SHA-256 checksums, cosign keyless signing, SLSA build provenance.
                See <Link href="/docs/security#release-verification">release verification</Link>.
              </dd>

              <dt>SBOM availability</dt>
              <dd>CycloneDX SBOM published with every release.</dd>

              <dt>Signing mechanism</dt>
              <dd>Ed25519 for ledger entries; cosign for release artifacts.</dd>

              <dt>Data-handling statement</dt>
              <dd>No source uploads by default. Telemetry is opt-in only.</dd>

              <dt>Certification disclaimer</dt>
              <dd>
                Ledgerful produces technical evidence only; it is not legal
                advice and does not guarantee regulatory compliance.
              </dd>

              <dt>Last updated</dt>
              <dd>July 14, 2026</dd>
            </dl>
          </section>

          {/* ── Deep dive link ──────────────────────────────────── */}
          <section className="content-band" id="full-security-architecture">
            <SectionHeading kicker="Deep dive" title="Full security architecture">
              The detailed treatment of every boundary, mechanism, and policy.
            </SectionHeading>
            <p>
              For the complete technical documentation — data flow diagrams,
              token model, signing, release verification, supply chain
              attestation, telemetry schema, threat model, and subprocessors —{" "}
              <Link href="/docs/security" className="inline-link">
                read the security architecture deep dive
              </Link>
              .
            </p>
          </section>

          {/* ── Responsible disclosure ──────────────────────────── */}
          <section id="disclosure" className="content-band trust-section">
            <SectionHeading title="Responsible disclosure">
              {disclosure.value}. The disclosure channel is verified and
              active.
            </SectionHeading>
            <div className="disclosure-notice">
              <p>
                <strong>Channel status:</strong> {disclosure.note}
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Forward note:</strong> Do not send vulnerability
                details to a public issue. Check this page for the current
                verified channel status.
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Source repository:</strong> {repository.note}{" "}
                Canonical URL:{" "}
                {repository.anonymousAccess ? (
                  <a
                    href={repository.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-link repo-url"
                  >
                    github.com/Ryan-AI-Studios/Ledgerful
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                ) : (
                  <code className="repo-url">github.com/Ryan-AI-Studios/Ledgerful</code>
                )}
                . General (non-security) bugs may be reported via GitHub
                Issues on the public repository.
              </p>
            </div>
          </section>

          {/* ── License ──────────────────────────────────────────── */}
          <section id="license" className="content-band trust-section">
            <SectionHeading title="License">
              The source terms are {license.base} plus the small-entity
              exception. The license is in force.
            </SectionHeading>
            <div className="disclosure-notice">
              <p>
                The <em>Ledgerful source repository</em> is licensed under{" "}
                <strong>{license.base}</strong> with the{" "}
                <strong>{license.exception}</strong>. The{" "}
                {repository.anonymousAccess ? (
                  <a
                    href={`${repository.href}/blob/main/LICENSE`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-link"
                  >
                    source repository LICENSE file
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                ) : (
                  "reviewed Ledgerful source repo LICENSE file"
                )}{" "}
                reflects the in-force terms. Ledgerful, LLC is formed (FL,
                effective 2026-07-01); individual→LLC IP assignment is
                executed; the Small-Entity Commercial Exception is
                counsel-reviewed; FL + USPTO trademark searches are clear.
                Any later change must update the reviewed truth baseline
                before it reaches public copy. (This website&rsquo;s own
                repository is proprietary and separately licensed — all
                rights reserved, no license granted.)
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
