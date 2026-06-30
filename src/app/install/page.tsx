import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "Install the Ledgerful CLI",
  description: pageDescriptions.install,
  alternates: { canonical: "/install" },
};

function CodeBlock({ children, caption }: { children: string; caption?: string }) {
  return (
    <div className="terminal-window annotated">
      <div className="terminal-bar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <pre>
        <code>{children}</code>
      </pre>
      {caption ? (
        <div className="terminal-annotation">
          <span className="terminal-caption">{caption}</span>
        </div>
      ) : null}
    </div>
  );
}

const platformRows = [
  {
    platform: "Linux",
    shell: "bash / zsh",
    installPath: "$HOME/.cargo/bin/ledgerful",
    keyPath: "$HOME/.ledgerful/keys/",
    note: "Add $HOME/.cargo/bin to PATH if not already.",
  },
  {
    platform: "macOS",
    shell: "zsh (default)",
    installPath: "$HOME/.cargo/bin/ledgerful",
    keyPath: "$HOME/.ledgerful/keys/",
    note: "Apple silicon and Intel both supported.",
  },
  {
    platform: "Windows",
    shell: "PowerShell / Git Bash",
    installPath: "%USERPROFILE%\\.cargo\\bin\\ledgerful.exe",
    keyPath: "%USERPROFILE%\\.ledgerful\\keys\\",
    note: "Authenticode signing not yet implemented; SmartScreen may prompt on first run.",
  },
];

export default function InstallPage() {
  return (
    <PageShell>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Install</p>
        <h1>Install Ledgerful on your machine.</h1>
        <p>
          Build the <code>ledgerful</code> binary from source. The engine,
          ledger, dashboard, and MCP server all run locally — no hosted account
          required.
        </p>
        <div
          className="hero-actions"
          style={{ marginTop: "28px" }}
        >
          <a
            className="button-primary"
            href="https://github.com/Ryan-AI-Studios/Ledgerful"
            rel="noopener noreferrer"
            target="_blank"
          >
            View source repository{" "}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <Link className="button-secondary" href="/architecture">
            See the architecture
          </Link>
        </div>
        <p className="private-preview">
          <ShieldAlert size={15} aria-hidden="true" />
          <span>
            <strong>Private preview / early access.</strong> The Ledgerful
            source repository is private until the legal launch gates clear.
            Running <code>cargo install</code> against the GitHub URL requires
            authorized access today; this is expected, not a bug. Pre-built
            release binaries will be published alongside the launch.
          </span>
        </p>
      </section>

      {/* ── 1. Prerequisites ───────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">01 · PREREQUISITES</span>
            <h2>Get the Rust toolchain.</h2>
          </div>
          <div className="step-body">
            <p>
              Source install requires <code>rustc</code> and{" "}
              <code>cargo</code>. Install via{" "}
              <a
                href="https://rustup.rs"
                target="_blank"
                rel="noopener noreferrer"
              >
                rustup.rs
              </a>{" "}
              using the platform instructions for your OS. The stable toolchain
              is sufficient — no nightly features are required.
            </p>
            <p style={{ marginTop: "12px" }}>
              Once installed, confirm with{" "}
              <code>rustc --version</code>. A working Rust 1.74+ toolchain is
              the floor for current Ledgerful builds.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Install ─────────────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">02 · INSTALL</span>
            <h2>Build and link the binary from source.</h2>
            <span className="step-tag">source install</span>
          </div>
          <div className="step-body">
            <p>
              Use Cargo to install directly from the Ledgerful GitHub
              repository. Crates.io is not used — only the git source path is
              supported for v0.1.x.
            </p>
          </div>
        </div>
        <CodeBlock caption="install · source build · ~3–6 min on first run">
          {`cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful`}
        </CodeBlock>
        <p className="doc-caption">
          The first build compiles the engine and links the{" "}
          <code>ledgerful</code> binary. Subsequent installs reuse the build
          cache. The binary is placed in your Cargo bin directory — make sure
          that directory is on your <code>PATH</code>.
        </p>
      </section>

      {/* ── 3. Verify ──────────────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">03 · VERIFY</span>
            <h2>Confirm the binary is reachable.</h2>
            <span className="step-tag">post-install</span>
          </div>
          <div className="step-body">
            <p>
              Print the version string and run a dependency check. Both commands
              exit non-zero on a broken install.
            </p>
          </div>
        </div>
        <CodeBlock caption="verify · version string and dependency health">
          {`ledgerful --version
ledgerful verify --health`}
        </CodeBlock>
        <p className="doc-caption">
          If <code>ledgerful</code> is not found, check that{" "}
          <code>$HOME/.cargo/bin</code> (or{" "}
          <code>%USERPROFILE%\.cargo\bin</code> on Windows) is on your PATH.
          Pre-built release binaries with SHA-256 checksums are a launch fact —
          once available, verification will mirror the procedure described on{" "}
          <Link href="/docs/releases" style={{ color: "var(--accent)" }}>
            the releases page
          </Link>
          .
        </p>
      </section>

      {/* ── 4. First commands ──────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">04 · FIRST COMMANDS</span>
            <h2>Run these from inside a git repository root.</h2>
          </div>
          <div className="step-body">
            <p>
              Each command below exercises a different local-first surface.
              None of them contact a remote service by default.
            </p>
          </div>
        </div>
        <CodeBlock caption="first scan · audit · dashboard · compliance export">
          {`# Environment health check (daemon, ledger, key state)
ledgerful doctor

# Analyze repo changes vs. main
ledgerful scan --base-ref main

# Scan with JSON output and an explicit impact report
ledgerful scan --base-ref main --impact --json

# Run a full ledger audit
ledgerful audit

# Start the loopback dashboard daemon (binds 127.0.0.1:52001)
ledgerful web start

# Export a signed SOC2 evidence bundle as a local ZIP
ledgerful compliance export`}
        </CodeBlock>
      </section>

      {/* ── 5. Platform notes ──────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">05 · PLATFORM NOTES</span>
            <h2>Path and key locations by OS.</h2>
          </div>
          <div className="step-body">
            <p>
              Ledgerful stores keys under{" "}
              <code>~/.ledgerful/keys/</code> on Unix-like systems and{" "}
              <code>%USERPROFILE%\.ledgerful\keys\</code> on Windows. These
              directories are created on first use and contain your local
              Ed25519 signing material.
            </p>
          </div>
        </div>
        <div className="table-scroll-wrapper">
          <table className="platform-table" aria-label="Install paths and key locations by platform">
            <thead>
              <tr>
                <th scope="col">Platform</th>
                <th scope="col">Shell</th>
                <th scope="col">Install path</th>
                <th scope="col">Key storage</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {platformRows.map((row) => (
                <tr key={row.platform}>
                  <th scope="row">{row.platform}</th>
                  <td>{row.shell}</td>
                  <td>
                    <code>{row.installPath}</code>
                  </td>
                  <td>
                    <code>{row.keyPath}</code>
                  </td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <strong>OS code signing status:</strong> Windows Authenticode and
          macOS Developer ID / Gatekeeper notarization are not yet implemented.
          Source-built or downloaded binaries may trigger OS security prompts on
          first launch. OS code signing is a planned enhancement for a future
          release.
        </div>
      </section>

      {/* ── 6. Where next? ─────────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">06 · WHERE NEXT</span>
            <h2>Continue the install → operate flow.</h2>
          </div>
          <div className="step-body">
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: "10px",
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              <li>
                <Link
                  href="/docs"
                  style={{
                    color: "var(--primary-strong)",
                    fontWeight: 680,
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    textDecorationColor: "var(--line)",
                  }}
                >
                  Docs →
                </Link>{" "}
                CLI reference, dashboard, MCP server, GitHub Action, sync,
                compliance, and release verification.
              </li>
              <li>
                <Link
                  href="/architecture"
                  style={{
                    color: "var(--primary-strong)",
                    fontWeight: 680,
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    textDecorationColor: "var(--line)",
                  }}
                >
                  Architecture →
                </Link>{" "}
                The three Ledgerful surfaces and the planned control plane.
              </li>
              <li>
              <Link
                href="/trust"
                style={{
                  color: "var(--primary-strong)",
                  fontWeight: 680,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  textDecorationColor: "var(--line)",
                }}
              >
                Trust & security →
              </Link>{" "}
              Local-first data flow, signing model, SOC2 export layout,
              telemetry, and disclosure.
            </li>
            <li>
              <Link
                href="/pricing"
                style={{
                  color: "var(--primary-strong)",
                  fontWeight: 680,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  textDecorationColor: "var(--line)",
                }}
              >
                Pricing →
              </Link>{" "}
              Free/local edition and feature-state matrix.
            </li>
            </ul>
          </div>
        </div>
        <SectionHeading title="Install first, evaluate on the box.">
          Ledgerful is built for engineers who want the receipts on disk, not in
          a hosted dashboard. Install once, verify a release, and judge the
          local-first claim with your own data.
        </SectionHeading>
      </section>
    </PageShell>
  );
}