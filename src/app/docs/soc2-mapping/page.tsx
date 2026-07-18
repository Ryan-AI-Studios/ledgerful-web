import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import {
  getSoc2Mapping,
  soc2MappingDraftLabel,
} from "@/lib/content/soc2-mapping";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "SOC 2 control-evidence mapping — documentation",
  description: pageDescriptions.docsSoc2Mapping,
  alternates: {
    canonical: "/docs/soc2-mapping",
  },
  openGraph: {
    url: "/docs/soc2-mapping",
    images: [homeOgImage],
  },
  twitter: {
    images: [homeOgImage.url],
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function DocsSoc2MappingPage() {
  const mapping = getSoc2Mapping();

  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · SOC 2 mapping</p>
        <h1>SOC 2 control-evidence mapping.</h1>
        <StatusPill maturity="planned" deployment="runs-locally" />
        <p className="soc2-mapping-draft-label">{soc2MappingDraftLabel}</p>
        <p className="soc2-mapping-hero">
          A draft mapping of Ledgerful&apos;s framework-agnostic evidence to SOC 2
          named controls — here&apos;s the evidence a control assessment typically
          wants, not a certification.
        </p>
      </section>

      {/* ── Draft notice ─────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Draft — pending validation">
          This mapping is a draft derived from the 2017 AICPA Trust Services
          Criteria and 2022 revised Points of Focus. It has not been validated by
          a real auditor or design partner.
        </SectionHeading>
        <div className="disclosure-notice soc2-mapping-draft-notice">
          <p>
            <strong>Why this page is noindex:</strong> a public un-validated
            control mapping reads as overclaiming regardless of its label. The
            2026 market for compliance tooling is especially sensitive to this
            failure mode. This page stays out of search engines until at least
            two real auditor or design-partner conversations validate both the
            map content and the framing.
          </p>
        </div>
      </section>

      {/* ── What this is ───────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="What this is">
          An additive translation layer. The framework-agnostic core of
          Ledgerful stays unchanged; this mapping layers named SOC 2 controls on
          top of it so an auditor gets &quot;CC7.2 → these entries&quot; instead
          of a raw CSV.
        </SectionHeading>
      </section>

      {/* ── Honest ceiling ───────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Honest ceiling">
          The tool produces audit-ready evidence. The customer&apos;s auditor maps
          that evidence to controls and renders an opinion.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>
              This is a mapping aid, NOT a certification or compliance
              attestation.
            </strong>{" "}
            The mapping is the tool&apos;s interpretation of how Ledgerful evidence
            relates to SOC 2 controls. It is not an AICPA standard. Points of
            focus do not require one-to-one control mapping.
          </p>
        </div>
      </section>

      {/* ── The CLI ──────────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="The CLI">
          Export evidence through a SOC 2 control lens with the shipped
          command.
        </SectionHeading>
        <div className="terminal-window" style={{ marginTop: "12px" }}>
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{`ledgerful export evidence --profile soc2 --control CC8.1 --control "CC7.*" --out soc2-cc8.zip`}</code>
          </pre>
        </div>
        <ul className="doc-step-list" style={{ marginTop: "16px" }}>
          <li>
            <code>--control</code> is repeatable.
          </li>
          <li>
            Family wildcards are supported: <code>CC7.*</code> matches every
            control whose ID starts with <code>CC7.</code>.
          </li>
          <li>Unknown or empty selectors are rejected with a clear error.</li>
          <li>
            The export always contains the full signed evidence bundle. The
            control lens only adds <code>control-lens/cover.md</code> and{" "}
            <code>control-lens/index.json</code>; the manifest and signature are
            regenerated to cover them.
          </li>
        </ul>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <p>
            <strong>
              The whole intact signed bundle stays whole — the lens is additive,
              never truncation.
            </strong>{" "}
            Existing payloads (ledger.csv, verification_history.csv, adr/*.md,
            chain_head.json) are preserved byte-identical. Only the manifest and
            manifest.sig are regenerated so their signature covers the additive
            lens files.
          </p>
        </div>
      </section>

      {/* ── The mapping ──────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="The mapping">
          Rendered from <code>mappings/soc2.toml</code> in the Ledgerful engine.
        </SectionHeading>
        {mapping.controls.map((control) => (
          <article key={control.id} className="soc2-mapping-control">
            <p className="soc2-mapping-control-id">{control.id}</p>
            <h3 className="soc2-mapping-control-title">{control.title}</h3>
            <ul className="soc2-mapping-evidence">
              {control.evidence.map((keyword) => (
                <li key={keyword}>
                  <code>{keyword}</code>
                </li>
              ))}
            </ul>
            <p className="soc2-mapping-provenance">
              <strong>Provenance:</strong> {control.provenance}
            </p>
            <div className="soc2-mapping-limit">
              <p className="soc2-mapping-limit-label">
                What this does not prove
              </p>
              <p>{control.limit}</p>
            </div>
          </article>
        ))}
      </section>

      {/* ── Source of truth ──────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Mapping source of truth">
          This page renders <code>mappings/soc2.toml</code> from the Ledgerful
          engine at build time. It cannot drift from the engine&apos;s source of
          truth — the page is regenerated when the engine mapping changes.
        </SectionHeading>
      </section>

      {/* ── Important limitations ──────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Important limitations">
          The mapping is a default starting point. Every customer environment and
          auditor interprets controls differently.
        </SectionHeading>
        <ul className="doc-step-list">
          <li>
            Validate and customize <code>mappings/soc2.toml</code> before relying
            on it for an audit.
          </li>
          <li>The tool produces evidence; the auditor renders the opinion.</li>
          <li>
            Existing evidence payloads stay byte-identical when the control lens
            is applied.
          </li>
        </ul>
      </section>
    </PageShell>
  );
}
