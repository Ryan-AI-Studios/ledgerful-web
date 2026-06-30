import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "CLI install and first scan — Ledgerful Docs",
  description: pageDescriptions.docsCli,
  alternates: { canonical: "/docs/cli" },
};

export default function DocsCliPage() {
  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · CLI</p>
        <h1>Install and run Ledgerful.</h1>
        <p>
          Build from source using Cargo. Release artifacts (pre-built binaries)
          are a WEB-0005 launch fact and are not yet available.
        </p>
      </section>

      {/* ── Section 1: Prerequisites ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Prerequisites">
          The source install requires the Rust toolchain. Release binaries, once
          available, will not require Rust.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Rust toolchain required for source install:</strong> You need{" "}
            <code>rustc</code> and <code>cargo</code>. Install via{" "}
            <a
              href="https://rustup.rs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
            >
              rustup.rs<span className="sr-only"> (opens in new tab)</span>
            </a>{" "}
            — follow the platform instructions for your OS (Linux, macOS, or
            Windows). The stable toolchain is sufficient.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Release binaries:</strong> Pre-built release artifacts for
            Linux, macOS, and Windows are a WEB-0005 launch fact. When available,
            they will not require Rust. Check the{" "}
            <Link href="/docs/releases" style={{ color: "var(--accent)" }}>
              release verification page
            </Link>{" "}
            for status.
          </p>
        </div>
      </section>

      {/* ── Section 2: Install ───────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Install from source">
          Install the <code>ledgerful</code> binary directly from the GitHub
          repository using Cargo. Crates.io is not used — only the git source
          path is supported.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful`}
            </code>
          </pre>
        </div>
        <p
          className="doc-caption"
        >
          Cargo builds and links the binary from source. The first build takes
          several minutes. Subsequent installs reuse the build cache. The binary
          is placed in <code>~/.cargo/bin/ledgerful</code> — make sure{" "}
          <code>~/.cargo/bin</code> is on your <code>PATH</code>.
        </p>
      </section>

      {/* ── Section 3: Verify install ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Verify the install">
          Confirm the binary is reachable and print the version string.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{`ledgerful --version`}</code>
          </pre>
        </div>
        <p
          className="doc-caption"
        >
          If the command is not found, check that <code>~/.cargo/bin</code> is
          on your <code>PATH</code> and that the Cargo install completed without
          errors.
        </p>
      </section>

      {/* ── Section 4: First commands ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="First commands">
          Run these commands from inside a git repository root to confirm the
          engine is working.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`# Health check — verifies daemon, ledger, and key state
ledgerful doctor

# Scan changed files for risk (compare HEAD to main)
ledgerful scan --base-ref main

# Scan with JSON output and an impact flag
ledgerful scan --base-ref main --impact --json

# Run a full audit of the ledger
ledgerful audit

# Start the local dashboard daemon
ledgerful web start`}
            </code>
          </pre>
        </div>
      </section>

      {/* ── Section 5: Platform notes ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Platform notes">
          Ledgerful runs on Linux, macOS, and Windows. A few things differ by
          platform.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table className="trust-table" aria-label="Platform-specific behavior">
            <thead>
              <tr>
                <th scope="col">Platform</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Linux / macOS</th>
                <td>
                  <code>~/.cargo/bin</code> on PATH. Key storage at{" "}
                  <code>~/.ledgerful/keys/</code>. Shell: bash or zsh.
                </td>
              </tr>
              <tr>
                <th scope="row">Windows</th>
                <td>
                  <code>%USERPROFILE%\.cargo\bin</code> on PATH. Key storage at{" "}
                  <code>%USERPROFILE%\.ledgerful\keys\</code>. Use PowerShell
                  or Git Bash. Windows Authenticode signing is not yet
                  implemented — you may see a SmartScreen prompt on first run.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <strong>OS code signing:</strong> Windows Authenticode and macOS
          Developer ID / Gatekeeper notarization are not yet implemented.
          Binaries built from source or downloaded from a release artifact may
          trigger OS security prompts on first launch. Code signing for both
          platforms is a planned enhancement for a future release.
        </div>
      </section>

      {/* ── Doc nav ───────────────────────────────────────────── */}
      <section className="content-band">
        <div className="doc-nav">
          <Link href="/docs">← All docs</Link>
          <Link href="/docs/dashboard">Dashboard →</Link>
        </div>
      </section>
    </PageShell>
  );
}
