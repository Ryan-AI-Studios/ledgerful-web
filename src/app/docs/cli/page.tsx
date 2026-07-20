import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";
import { launchTruth } from "@/lib/content/launch-facts";
import {
  BINSTALL_COMMAND,
  BREW_COMMAND,
  INSTALL_COMMAND,
  SCOOP_COMMANDS,
} from "@/lib/content/install";

export const metadata: Metadata = {
  title: { absolute: "CLI install and first scan — Ledgerful Docs" },
  description: pageDescriptions.docsCli,
  alternates: { canonical: "/docs/cli" },
  openGraph: { url: "/docs/cli", images: [homeOgImage] },
  twitter: { images: [homeOgImage.url] },
};

export default function DocsCliPage() {
  const { release, repository } = launchTruth.facts;

  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · CLI</p>
        <h1>Install and run Ledgerful.</h1>
        <p>
          Install the <code>ledgerful</code> CLI from a pre-built v0.1.8 release
          binary or build from source using Cargo.
        </p>
      </section>

      {/* ── Section 1: Prerequisites ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Prerequisites">
          The source install requires the Rust toolchain. Pre-built release
          binaries (v0.1.8) do not require Rust.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Rust toolchain required for source install:</strong> You need{" "}
            <code>rustc</code> and <code>cargo</code>. Install via{" "}
            <a
              href="https://rustup.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              rustup.rs<span className="sr-only"> (opens in new tab)</span>
            </a>{" "}
            — follow the platform instructions for your OS (Linux, macOS, or
            Windows). The stable toolchain is sufficient.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Release binaries:</strong> {release.note} The{" "}
            <Link href="/docs/releases" className="inline-link">
              release verification page
            </Link>{" "}
            has checksums and provenance details.
          </p>
        </div>
      </section>

      {/* ── Section 2: Install ───────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Install">
          Prefer a package manager or prebuilt path when you want a release
          binary without a full workspace compile. Full options and platform
          notes live on the{" "}
          <Link href="/install" className="inline-link">
            install guide
          </Link>
          . {repository.note}
        </SectionHeading>
        <h3 className="doc-subhead">Homebrew (prebuilt)</h3>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{BREW_COMMAND}</code>
          </pre>
        </div>
        <p className="doc-caption">
          Official tap formula for macOS (Apple Silicon and Intel) and
          Linuxbrew. Installs the prebuilt release binary.
        </p>
        <h3 className="doc-subhead">cargo binstall (prebuilt)</h3>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{BINSTALL_COMMAND}</code>
          </pre>
        </div>
        <p className="doc-caption">
          Uses <code>[package.metadata.binstall]</code> to resolve the matching
          GitHub release archive when one exists. Requires{" "}
          <code>cargo-binstall</code>. May fall back to compiling from source if
          no prebuilt asset matches. No crates.io publish is used for
          distribution.
        </p>
        <h3 className="doc-subhead">Scoop (Windows, prebuilt)</h3>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{SCOOP_COMMANDS.join("\n")}</code>
          </pre>
        </div>
        <p className="doc-caption">
          Official Scoop bucket for the portable Windows x86_64 zip. winget (
          <code>Ledgerful.Ledgerful</code>) is Planned until the first package is
          accepted on microsoft/winget-pkgs.
        </p>
        <h3 className="doc-subhead">Cargo (source)</h3>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{INSTALL_COMMAND}</code>
          </pre>
        </div>
        <p className="doc-caption">
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
