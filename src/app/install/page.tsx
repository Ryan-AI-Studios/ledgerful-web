import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { InstallCommand, INSTALL_COMMAND } from "@/components/install-command";
import { capturedEvidence } from "@/components/captured-evidence";
import { launchTruth } from "@/lib/content/launch-facts";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: { absolute: "Install the Ledgerful CLI" },
  description: pageDescriptions.install,
  alternates: { canonical: "/install" },
  openGraph: {
    url: "/install",
    images: [
      {
        url: "/og/install.png",
        width: 1200,
        height: 630,
        alt: "Install the Ledgerful CLI — the real source-build install command beside a real local dashboard receipt showing Project Health and Recent Changes.",
      },
    ],
  },
  twitter: {
    images: ["/og/install.png"],
  },
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

// Real captured `ledgerful doctor` output (see captured-evidence.ts) — the
// same source already published on the homepage's evidence panel. Reused
// here as the smoke test's representative output for the one smoke-test
// command with an already-captured, reviewed sample; `init` and
// `scan --summary` are described in prose only, since no capture exists for
// them and the constraint is: never invent literal command output.
function DoctorOutputPreview() {
  const panel = capturedEvidence.doctor;
  return (
    <div
      className="terminal-window annotated"
      aria-label={`${panel.description} — ${panel.command}`}
    >
      <div className="terminal-bar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <pre>
        {panel.lines.map((line, i) => (
          <code key={`doctor-${i}`}>{line}</code>
        ))}
      </pre>
      <div className="terminal-annotation">
        <span className="terminal-caption">
          Representative output — captured from a real v0.1.6 run
        </span>
        <span className="terminal-meta">{panel.command}</span>
      </div>
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
  const { repository } = launchTruth.facts;

  return (
    <PageShell>
      {/* ── Hero — the verified canonical command is the dominant first
          action, not the repository link (WEB-0023 DoD-1). The command is
          natively selectable text (<pre>/<code>) via InstallCommand's
          "expanded" terminal block, and its copy button is hidden/disabled
          until hydration at the shared-component level. ──────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Install</p>
        <h1>Install Ledgerful on your machine.</h1>
        <p>
          Build the <code>ledgerful</code> binary from source. The engine,
          ledger, dashboard, and MCP server all run locally — no hosted account
          required.
        </p>
        <div style={{ marginTop: "28px" }}>
          <InstallCommand variant="expanded" showLink={false} />
        </div>
        <div className="hero-actions" style={{ marginTop: "20px" }}>
          <Link className="button-secondary" href="/architecture">
            See the architecture
          </Link>
          {repository.anonymousAccess ? (
            <a
              className="button-secondary"
              href={repository.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              View source repository{" "}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          ) : (
            <span className="button-secondary" aria-disabled="true">
              Repository access required
            </span>
          )}
        </div>
        <p className="private-preview">
          <ShieldAlert size={15} aria-hidden="true" />
          <span>
            <strong>{repository.value}.</strong> {repository.note}
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
              supported for v0.1.x. This is the same command shown above.
            </p>
          </div>
        </div>
        <CodeBlock caption="install · source build · ~3–6 min on first run">
          {INSTALL_COMMAND}
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
        <div className="disclosure-notice" style={{ marginTop: "20px" }}>
          <strong>Verify checksums for release binaries:</strong>{" "}
          Pre-built release binaries with SHA-256 checksums are available on
          the v0.1.8 GitHub Release page. Checksum verification is a required
          step before running any downloaded binary — see{" "}
          <Link href="/docs/releases" className="inline-link">
            the exact checksum verification steps
          </Link>{" "}
          on the release verification page.
        </div>
      </section>

      {/* ── 4. Smoke test ──────────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">04 · SMOKE TEST</span>
            <h2>Run a 30-second first pass.</h2>
          </div>
          <div className="step-body">
            <p>
              Four real commands, in order. On a warm build cache this takes
              under 30 seconds. Run <code>scan --summary</code> from inside a
              git repository root — the other three work from anywhere.
            </p>
          </div>
        </div>
        <CodeBlock caption="smoke test · ~30s · version → init → doctor → scan summary">
          {`ledgerful --version
ledgerful init
ledgerful doctor
ledgerful scan --summary`}
        </CodeBlock>
        <p className="doc-caption">
          <code>--version</code> prints the installed binary version.{" "}
          <code>init</code> sets up local Ledgerful state (
          <code>.ledgerful/</code>) in the current directory.{" "}
          <code>doctor</code> runs the environment and dependency health check
          shown below. <code>scan --summary</code> prints a compact,
          one-line-per-file risk summary for the working tree.
        </p>
        <div style={{ marginTop: "20px" }}>
          <p className="doc-caption" style={{ marginBottom: "10px" }}>
            Representative output for the <code>doctor</code> step:
          </p>
          <DoctorOutputPreview />
        </div>
      </section>

      {/* ── 5. First commands (reference) ─────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">05 · FIRST COMMANDS</span>
            <h2>A fuller reference, once the smoke test passes.</h2>
          </div>
          <div className="step-body">
            <p>
              Each command below exercises a different local-first surface.
              None of them contact a remote service by default.
            </p>
          </div>
        </div>
        <CodeBlock caption="reference · scan · audit · dashboard">
          {`# Environment health check (daemon, ledger, key state)
ledgerful doctor

# Analyze repo changes vs. main
ledgerful scan --base-ref main

# Scan with JSON output and an explicit impact report
ledgerful scan --base-ref main --impact --json

# Run a full ledger audit
ledgerful audit

# Start the loopback dashboard daemon (binds 127.0.0.1:52001)
ledgerful web start`}
        </CodeBlock>
        <p className="doc-caption">
          SOC2-style evidence export is dashboard-only: after{" "}
          <code>ledgerful web start</code>, open the dashboard and use its
          Export action (served locally via the daemon&rsquo;s{" "}
          <code>/api/compliance/export</code> route while the dashboard is
          running). There is no standalone CLI subcommand for it — see{" "}
          <Link href="/docs/compliance" className="inline-link">
            the compliance export docs
          </Link>{" "}
          for the full walkthrough.
        </p>
      </section>

      {/* ── 6. Update & uninstall ─────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">06 · UPDATE &amp; UNINSTALL</span>
            <h2>Update in place, or remove Ledgerful entirely.</h2>
          </div>
          <div className="step-body">
            <p>
              Ledgerful is an ordinary Cargo-installed binary — updating and
              removing it use plain Cargo commands, not a custom updater or an
              uninstall script.
            </p>
          </div>
        </div>
        <CodeBlock caption="update · re-run the same install command">
          {INSTALL_COMMAND}
        </CodeBlock>
        <p className="doc-caption">
          Re-running the install command rebuilds from the latest source at
          that git ref and replaces the existing binary. There is no separate
          update command.
        </p>
        <div style={{ marginTop: "20px" }}>
          <CodeBlock caption="uninstall · cargo uninstall">
            {`cargo uninstall ledgerful`}
          </CodeBlock>
        </div>
        <p className="doc-caption">
          This removes the installed binary from your Cargo bin directory.
          Local state under <code>~/.ledgerful/</code> (keys, ledger, indexes)
          is left in place — delete that directory yourself for a full clean
          removal.
        </p>
      </section>

      {/* ── 7. Troubleshooting ─────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">07 · TROUBLESHOOTING</span>
            <h2>If something doesn&rsquo;t work.</h2>
          </div>
          <div className="step-body">
            <p>Three common first-run problems and the real fix for each.</p>
          </div>
        </div>
        <div className="disclosure-notice">
          <p>
            <strong>
              <code>ledgerful</code>: command not found.
            </strong>{" "}
            The Cargo bin directory isn&rsquo;t on your <code>PATH</code>.
            Add <code>$HOME/.cargo/bin</code> (or{" "}
            <code>%USERPROFILE%\.cargo\bin</code> on Windows) to your{" "}
            <code>PATH</code> and open a new shell.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Install seems stale after pulling new commits.</strong>{" "}
            Cargo can reuse a cached build for the same git ref. Force a clean
            rebuild with <code>--force</code>:
          </p>
        </div>
        <div style={{ marginTop: "16px" }}>
          <CodeBlock caption="troubleshooting · force a clean rebuild">
            {`${INSTALL_COMMAND} --force`}
          </CodeBlock>
        </div>
        <p className="doc-caption">
          <code>--force</code> is a real Cargo flag — it rebuilds and
          reinstalls even when Cargo believes the same version is already
          installed.
        </p>
        <div className="disclosure-notice" style={{ marginTop: "20px" }}>
          <strong>Windows SmartScreen prompt.</strong> Authenticode signing is
          not yet implemented (see Platform notes below) — SmartScreen may
          prompt on first run of a locally built binary. This is expected and
          is not a sign of a corrupted build.
        </div>
      </section>

      {/* ── 8. Platform notes ──────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">08 · PLATFORM NOTES</span>
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

      {/* ── 9. Where next? ─────────────────────────────────── */}
      <section className="content-band">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">09 · WHERE NEXT</span>
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
              License terms and feature-state matrix.
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
