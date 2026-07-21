import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { launchTruth } from "@/lib/content/launch-facts";
import { pageDescriptions } from "@/lib/content/navigation";
import {
  policyCheckBaseBranchConstraint,
  policyCheckHonestLimit,
} from "@/lib/content/policy-check";

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

      {/* Concise /trust is full-width content only — no section-nav rail.
          Do not wrap in .trust-layout (that grid reserves a left rail column
          for /docs/security; a lone child would sit in a ~260px track). */}

      {/* ── Executive summary (procurement quick view) ──────── */}
      <section className="content-band trust-landing-band" id="exec-summary">
        <SectionHeading title="Executive summary">
          The short version for procurement reviewers.
        </SectionHeading>
        <p className="trust-disclaimer">
          Ledgerful produces technical evidence only; it is not legal advice and
          does not guarantee regulatory compliance.
        </p>
        <div className="table-scroll" role="region" aria-label="Executive summary">
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
        </div>
      </section>

      {/* ── Procurement facts ─────────────────────────────────── */}
      <section className="content-band trust-landing-band" id="procurement">
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
            SHA-256 checksums, cosign keyless signing, SLSA build provenance. See{" "}
            <Link href="/docs/security#release-verification">
              release verification
            </Link>
            .
          </dd>

          <dt>SBOM availability</dt>
          <dd>CycloneDX SBOM published with every release.</dd>

          <dt>Signing mechanism</dt>
          <dd>Ed25519 for ledger entries; cosign for release artifacts.</dd>

          <dt>Data-handling statement</dt>
          <dd>No source uploads by default. Telemetry is opt-in only.</dd>

          <dt>Last updated</dt>
          <dd>July 19, 2026</dd>

          <dt>Public ledger</dt>
          <dd>
            Browser-verifiable signed change ledger at{" "}
            <Link href="/ledger" className="inline-link">
              /ledger
            </Link>
            .
          </dd>
        </dl>
      </section>

      {/* ── Public ledger ─────────────────────────────────────── */}
      <section className="content-band trust-landing-band" id="public-ledger">
        <SectionHeading title="Public ledger">
          Ledgerful publishes its own development change ledger as a redacted,
          signed, browser-verifiable bundle. Every entry carries a real Ed25519
          signature you can verify without a backend call.
        </SectionHeading>
        <p>
          View the ledger at{" "}
          <Link href="/ledger" className="inline-link">
            /ledger
          </Link>
          , or read the docs at{" "}
          <Link href="/docs/public-ledger" className="inline-link">
            /docs/public-ledger
          </Link>
          .
        </p>
        <div className="disclosure-notice disclosure-notice--follow">
          <p>
            <strong>What this proves:</strong> each entry&apos;s Ed25519
            signature.
          </p>
          <p className="disclosure-notice-gap">
            <strong>What this does not prove:</strong> the order or set of
            entries (chain continuity) or the identity behind the signing key.
            Out-of-band fingerprint comparison is required before treating a key
            as authentic.
          </p>
        </div>
      </section>

      {/* ── Policy as code (0049) ─────────────────────────────── */}
      <section className="content-band trust-landing-band" id="policy-as-code">
        <SectionHeading title="Policy as code">
          Gate merges on declared named rules — offline evaluation, not a
          compliance certificate.
        </SectionHeading>
        <p>
          <code>ledgerful policy check</code> evaluates a flat policy (
          <code>.ledgerful/policy.toml</code>) against PR/diff/ledger state and
          exits nonzero on violation. Built-in rules cover signed entries,
          pending transactions, bound verification, high-risk changes without
          ADR coverage, and risk thresholds. There is no expression-language
          DSL.
        </p>
        <div className="disclosure-notice disclosure-notice--follow">
          <p>
            <strong>Honest limit:</strong> {policyCheckHonestLimit}
          </p>
          <p className="disclosure-notice-gap">
            <strong>Base-branch policy:</strong> {policyCheckBaseBranchConstraint}
          </p>
          <p className="disclosure-notice-gap">
            <strong>CI role:</strong> the engine only evaluates and exits.
            Posting PR comments or check-runs is the Action wrapper&apos;s job,
            not the engine. See the{" "}
            <Link href="/docs/policy-check" className="inline-link">
              policy check docs
            </Link>{" "}
            for rules, permissions, and a CI workflow example.
          </p>
        </div>
      </section>

      {/* ── Deep dive CTA ─────────────────────────────────────── */}
      <section
        className="content-band trust-landing-band trust-deep-dive"
        id="full-security-architecture"
      >
        <SectionHeading title="Full security architecture">
          Data flow, token model, signing, release verification, supply chain,
          telemetry, threat model, and subprocessors — the complete technical
          treatment.
        </SectionHeading>
        <div className="hero-actions">
          <Link href="/docs/security" className="button-primary">
            Read the security deep dive
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/install" className="button-secondary">
            Install locally
          </Link>
        </div>
      </section>

      {/* ── Responsible disclosure ──────────────────────────── */}
      <section id="disclosure" className="content-band trust-landing-band trust-section">
        <SectionHeading title="Responsible disclosure">
          {disclosure.value}. The disclosure channel is verified and active.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Channel status:</strong> {disclosure.note}
          </p>
          <p className="disclosure-notice-gap">
            <strong>Forward note:</strong> Do not send vulnerability details to a
            public issue. Check this page for the current verified channel
            status.
          </p>
          <p className="disclosure-notice-gap">
            <strong>Source repository:</strong> {repository.note} Canonical URL:{" "}
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
            . General (non-security) bugs may be reported via GitHub Issues on
            the public repository.
          </p>
        </div>
      </section>

      {/* ── License ──────────────────────────────────────────── */}
      <section id="license" className="content-band trust-landing-band trust-section">
        <SectionHeading title="License">
          The source terms are {license.base} plus the small-entity exception.
          The license is in force.
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
            reflects the in-force terms. Ledgerful, LLC is formed (FL, effective
            2026-07-01); individual→LLC IP assignment is executed; the
            Small-Entity Commercial Exception is counsel-reviewed; FL + USPTO
            trademark searches are clear. Any later change must update the
            reviewed truth baseline before it reaches public copy. (This
            website&rsquo;s own repository is proprietary and separately licensed
            — all rights reserved, no license granted.)
          </p>
        </div>
      </section>
    </PageShell>
  );
}
