import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { soc2ExportLayout } from "@/lib/content/trust";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: { absolute: "Compliance Export — Ledgerful Docs" },
  description: pageDescriptions.docsCompliance,
  alternates: { canonical: "/docs/compliance" },
  openGraph: { url: "/docs/compliance", images: [homeOgImage] },
  twitter: { images: [homeOgImage.url] },
};

export default function DocsCompliancePage() {
  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · Compliance</p>
        <h1>Export local SOC 2-style evidence.</h1>
        <StatusPill maturity="available" deployment="runs-locally" />
        <p>
          Ledgerful generates a signed ZIP of local evidence entirely on your
          machine. This is not a hosted SOC 2 portal — no data leaves your device
          during export.
        </p>
      </section>

      {/* ── Section 1: Scope ──────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Scope of the local export">
          The compliance export is a local operation. It reads your{" "}
          <code>.ledgerful/</code> directory and produces a ZIP you can share
          with auditors or archive for your own records.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Local only:</strong> The SOC 2-style evidence export is a local ZIP
            generated entirely from your machine&apos;s{" "}
            <code>.ledgerful/</code> data. No data leaves your machine during
            export. There is no hosted SOC 2 portal — continuous monitoring,
            auditor access controls, and live attestation are enterprise-planned
            and require a future hosted control plane.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Two export paths:</strong> Export from the local dashboard
            (below) or from the CLI:{" "}
            <code>ledgerful export evidence --profile soc2</code>.
          </p>
        </div>
      </section>

      {/* ── Section 2: Export steps ───────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="How to export">
          The export is initiated from the dashboard. Start the daemon, open the
          dashboard, and navigate to the compliance route.
        </SectionHeading>
        <ol className="doc-step-list">
          <li>
            <strong>Start the daemon</strong> from inside your repository root:
            <div className="terminal-window" style={{ marginTop: "12px" }}>
              <div className="terminal-bar">
                <span />
                <span />
                <span />
              </div>
              <pre>
                <code>{`ledgerful web start`}</code>
              </pre>
            </div>
          </li>
          <li>
            <strong>Open the dashboard URL</strong> printed at startup — it
            includes your session token:{" "}
            <code>http://127.0.0.1:52001/?token=&lt;your-token&gt;</code>
          </li>
          <li>
            <strong>Navigate to the compliance route</strong> in the dashboard.
            Look for the Compliance or Evidence Export section in the navigation.
          </li>
          <li>
            <strong>Click Download</strong> to generate and download the signed
            evidence ZIP to your local machine.
          </li>
        </ol>
      </section>

      {/* ── Section 3: ZIP layout ─────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="ZIP file layout">
          The evidence ZIP contains a signed manifest, ledger CSV, verification
          history, and any ADR files committed to the ledger.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table className="trust-table" aria-label="SOC 2-style export ZIP file layout">
            <thead>
              <tr>
                <th scope="col">File</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {soc2ExportLayout.map((file) => (
                <tr key={file.filename}>
                  <th scope="row">
                    <code>{file.filename}</code>
                  </th>
                  <td>{file.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 4: Offline verification ──────────────────── */}
      <section className="content-band">
        <SectionHeading title="Offline tamper verification">
          Auditors can verify the ZIP without connecting to any Ledgerful service.
          All verification is performed locally against the included cryptographic
          artifacts.
        </SectionHeading>
        <ol className="doc-step-list">
          <li>
            For each entry in <code>manifest.json</code>&apos;s{" "}
            <code>files</code> array, re-compute SHA-256 over the corresponding
            file&apos;s bytes and compare to the stored hash. A mismatch means
            the file was altered after the manifest was generated.
          </li>
          <li>
            Read <code>manifest.sig</code> (64 raw bytes) and{" "}
            <code>manifest.pub</code> (32 raw bytes). Verify the Ed25519
            signature over <code>manifest.json</code> bytes. A mismatch means
            the manifest was replaced.
          </li>
          <li>
            Both checks must pass for the export to be considered unmodified.
          </li>
        </ol>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <p>
            <strong>manifest.pub trust model:</strong> The{" "}
            <code>manifest.pub</code> file contains the Ed25519 verifying key
            that was used to sign the manifest. However, this key originated
            from the same machine that generated the ZIP. A compromised machine
            could have replaced both the ledger data and the signing key,
            producing a convincing but fraudulent export.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Out-of-band verification required:</strong> To close this
            gap, the receiver must verify <code>manifest.pub</code> against a
            trusted out-of-band copy of your Ed25519 public key — for example,
            a key fingerprint you shared over a separate secure channel, or a
            copy stored in a location independent of the machine that generated
            the ZIP. Without this step, the signature proves internal consistency
            but not the authenticity of the signing key itself.
          </p>
        </div>
      </section>

      {/* ── Doc nav ───────────────────────────────────────────── */}
      <section className="content-band">
        <div className="doc-nav">
          <Link href="/docs/github-action">← GitHub Action</Link>
          <Link href="/docs/sync">Local sync →</Link>
        </div>
      </section>
    </PageShell>
  );
}
