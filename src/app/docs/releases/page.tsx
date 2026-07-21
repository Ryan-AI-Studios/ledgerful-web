import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";
import { launchTruth } from "@/lib/content/launch-facts";

export const metadata: Metadata = {
  title: { absolute: "Release Verification — Ledgerful Docs" },
  description: pageDescriptions.docsReleases,
  alternates: { canonical: "/docs/releases" },
  openGraph: { url: "/docs/releases", images: [homeOgImage] },
  twitter: { images: [homeOgImage.url] },
};

export default function DocsReleasesPage() {
  const { release } = launchTruth.facts;
  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · Releases</p>
        <h1>Release verification.</h1>
        <StatusPill maturity="available" deployment="runs-locally" />
        <p>
          The release workflow requires SHA-256 checksums alongside every binary
          archive. {release.value}.
        </p>
      </section>

      {/* ── Section 1: Release status ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Release artifact status">
          {release.value}. Download URLs are live on the v0.1.9 GitHub
          Release page.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Release artifacts available:</strong> {release.note} The
            verification process documented below is actionable for the
            v0.1.9 release.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Install from source:</strong> You can also build from
            source. See the{" "}
            <Link href="/docs/cli" className="inline-link">
              CLI install page
            </Link>{" "}
            for instructions using <code>cargo install --git</code>.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>OS code signing status:</strong> Windows Authenticode and
            macOS Developer ID / Gatekeeper notarization are not yet
            implemented. Binaries may trigger OS security prompts on first
            launch. Code signing for both platforms is a separate planned
            enhancement. Supply chain attestation (SBOM, cosign signing, SLSA
            provenance) shipped since v0.1.8 and continue in v0.1.9 — see the{" "}
            <Link href="/docs/security#supply-chain-attestation" className="inline-link">
              trust page supply chain section
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Section 2: Checksum verification ─────────────────── */}
      <section className="content-band">
        <SectionHeading title="SHA-256 verification process">
          Each release download is accompanied
          by a <code>.sha256</code> checksum file. Verify the checksum before
          running any binary.
        </SectionHeading>
        <p
          className="doc-caption"
        >
          Linux and macOS:
        </p>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`# Verify the downloaded archive against its companion .sha256 file
sha256sum -c ledgerful-<platform>.tar.gz.sha256

# A passing verification prints:
# ledgerful-<platform>.tar.gz: OK`}
            </code>
          </pre>
        </div>
        <p
          className="doc-caption"
          style={{ marginTop: "24px", marginBottom: "16px" }}
        >
          Windows (PowerShell):
        </p>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`# Compute the SHA-256 hash of the downloaded Windows archive
(Get-FileHash ledgerful-x86_64-pc-windows-msvc.zip -Algorithm SHA256).Hash

# Compare the output to ledgerful-x86_64-pc-windows-msvc.zip.sha256.
# They must match exactly (case-insensitive).`}
            </code>
          </pre>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <strong>Failure means do not use:</strong> Any <code>FAILED</code>{" "}
          output from <code>sha256sum</code>, or a hash mismatch on Windows,
          means the download is corrupt or has been tampered with. Delete the
          file and re-download from the official release page.
        </div>
      </section>

      {/* ── Section 3: Health report ───────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Health report">
          If you encounter an issue with Ledgerful, run{" "}
          <code>ledgerful doctor</code> to print a local environment and
          dependency health report. It does not create a bundle or archive.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`# Print the environment and dependency health report
ledgerful doctor`}
            </code>
          </pre>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <p>
            <strong>What doctor checks:</strong> Daemon reachability, ledger
            integrity, key pair presence, and project configuration validity.
            Output is safe to share — it does not include source code, diff
            content, commit messages, or private key material.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Reporting issues:</strong> General (non-security) bugs
            can be reported via GitHub Issues on the public repository. For
            security vulnerabilities, see the{" "}
            <Link href="/trust" className="inline-link">
              trust and security page
            </Link>{" "}
            for the responsible disclosure channel.
          </p>
        </div>
      </section>

      {/* ── Doc nav ───────────────────────────────────────────── */}
      <section className="content-band">
        <div className="doc-nav">
          <Link href="/docs/sync">← Local sync</Link>
          <Link href="/docs">All docs</Link>
        </div>
      </section>
    </PageShell>
  );
}
