import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { syncCommands } from "@/lib/content/docs-pages";
import { StatusPill } from "@/components/status-pill";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: { absolute: "Local Team Sync — Ledgerful Docs" },
  description: pageDescriptions.docsSync,
  alternates: { canonical: "/docs/sync" },
  openGraph: { url: "/docs/sync", images: [homeOgImage] },
  twitter: { images: [homeOgImage.url] },
};

export default function DocsSyncPage() {
  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · Sync</p>
        <h1>Local team sync.</h1>
        <StatusPill status="beta" />
        <p>
          Ledgerful sync writes signed, encrypted bundles to a directory you
          control. No cloud transport is involved by default.
        </p>
      </section>

      <section className="content-band">
        <div className="disclosure-notice">
          <p>
            <strong>Feature-gated build:</strong> Sync is not included in the
            default Ledgerful build. The source repository is a private preview,
            so this command requires authorized repository access. Authorized
            testers can install a sync-enabled binary with{" "}
            <code>
              cargo install --git
              https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful
              --features sync
            </code>
            . The standard install command elsewhere on this site does not add
            this optional feature.
          </p>
        </div>
      </section>

      {/* ── Section 1: How sync works ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="How local sync works">
          Sync uses a <code>dir://</code> transport — a local directory path.
          Each run produces a signed and encrypted bundle written to that path.
          Team members with access to the same directory can verify and apply
          bundles locally.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Local-first:</strong> The <code>dir://</code> transport
            writes bundles to a local filesystem path. No data is sent to a
            cloud service. If you point the path at a network share, cloud sync
            folder, or SMB mount, the behavior depends entirely on the underlying
            filesystem.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Network share warning:</strong> Using a{" "}
            <code>dir://</code> path over network shares — including Dropbox,
            Google Drive, and SMB mounts — can cause file-locking conflicts or
            silent data corruption when multiple machines write bundles
            concurrently. If you need multi-machine sync via a shared folder,
            ensure the transport path is on a filesystem that supports atomic
            writes and proper file locking for your OS combination. When in
            doubt, designate one machine as the writer and treat the share as
            read-only for all other machines.
          </p>
        </div>
      </section>

      {/* ── Section 2: Initialize ─────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Initialize sync">
          After installing a sync-enabled build, run{" "}
          <code>ledgerful sync init</code> from the repository root to set up
          the sync configuration and create a transport entry.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`# Initialize sync with a local directory transport
ledgerful sync init`}
            </code>
          </pre>
        </div>
        <p className="doc-caption">
          The init command creates or updates the sync configuration in{" "}
          <code>config.toml</code> and prepares the local{" "}
          <code>.ledgerful/sync/</code> directory for bundle output.
        </p>
      </section>

      {/* ── Section 3: Sync commands ──────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Sync commands">
          All sync subcommands run from the repository root.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table className="trust-table" aria-label="Ledgerful sync commands">
            <thead>
              <tr>
                <th scope="col">Command</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {syncCommands.map((cmd) => (
                <tr key={cmd.command}>
                  <th scope="row">
                    <code>{cmd.command}</code>
                  </th>
                  <td>{cmd.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="terminal-window" style={{ marginTop: "24px" }}>
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`# Write a signed, encrypted bundle to the transport directory
ledgerful sync run

# Check sync health and last bundle timestamp
ledgerful sync status

# Verify all local bundles against their Ed25519 signatures
ledgerful sync verify

# Show sync history
ledgerful sync log`}
            </code>
          </pre>
        </div>
      </section>

      {/* ── Section 4: Security model ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Sync security model">
          Bundles are signed and encrypted before being written to the transport
          directory. A receiver without the encryption key cannot read bundle
          contents.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table className="trust-table" aria-label="Sync security properties">
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Mechanism</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Signing</th>
                <td>
                  Ed25519 signature over bundle contents, using the project
                  signing key at <code>~/.ledgerful/keys/private.key</code>.
                </td>
              </tr>
              <tr>
                <th scope="row">Encryption</th>
                <td>
                  Bundle contents are encrypted before writing to the transport
                  directory. Bundle contents are not readable without the
                  encryption key.
                </td>
              </tr>
              <tr>
                <th scope="row">Verification</th>
                <td>
                  <code>ledgerful sync verify</code> checks Ed25519 signatures
                  on all local bundles and reports any that fail.
                </td>
              </tr>
              <tr>
                <th scope="row">Transport</th>
                <td>
                  <code>dir://</code> only. Bundles are written to the local
                  filesystem path you configure. No cloud transport is built in.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Doc nav ───────────────────────────────────────────── */}
      <section className="content-band">
        <div className="doc-nav">
          <Link href="/docs/compliance">← Compliance export</Link>
          <Link href="/docs/releases">Release verification →</Link>
        </div>
      </section>
    </PageShell>
  );
}
