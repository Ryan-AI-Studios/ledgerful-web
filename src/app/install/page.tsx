import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { InstallCommand } from "@/components/install-command";
import { INSTALL_COMMAND } from "@/lib/content/install";
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

// Real captured `ledgerful doctor` output (see captured-evidence.ts) — kept
// as a representative environment-health sample. The install guide also
// shows captured `--version` and `verify --health` output inline; this
// component is reused so the page never invents literal command output.
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
          Representative output — captured from a real v0.1.8 run
        </span>
        <span className="terminal-meta">{panel.command}</span>
      </div>
    </div>
  );
}

function ExpectedOutput({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="expected-output">
      <span className="expected-output-caption">
        <CheckCircle2 size={14} aria-hidden="true" />
        {caption}
      </span>
      <div className="expected-output-body">{children}</div>
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

const osTabs = platformRows.map((row) => ({
  id: row.platform.toLowerCase(),
  label: row.platform,
  ...row,
}));

export default function InstallPage() {
  const { repository } = launchTruth.facts;

  return (
    <PageShell>
      {/* ── Compact install-guide hero ─────────────────────── */}
      <section className="page-hero install-hero">
        <p className="hero-kicker">Install</p>
        <h1>Install Ledgerful locally</h1>
        <p className="install-hero-lead">
          v0.1.8 · macOS, Linux, Windows · source install via Cargo · no hosted
          account required.
        </p>
        <div className="install-hero-command">
          <InstallCommand variant="expanded" showLink={false} />
        </div>
        <div className="install-hero-meta">
          <span className="status-pill status-runs-locally">Runs locally</span>
          <span className="install-hero-prereq">
            Prerequisite: Rust 1.85+ via{" "}
            <a
              href="https://rustup.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              rustup.rs
            </a>
          </span>
        </div>
        <p className="install-hero-result">
          Expected result: a <code>ledgerful</code> binary on your PATH, ready to
          scan repos and start the local dashboard.
        </p>
        <div className="hero-actions">
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
      </section>

      {/* ── OS tabs ─────────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Choose your platform">
          The same Cargo source install works on every OS. Pick a tab for the
          platform-specific binary path, verify command, and first scan.
        </SectionHeading>
        <div
          className="os-tabs"
          role="radiogroup"
          aria-label="Install instructions by operating system"
        >
          {osTabs.map((os, i) => (
            <span key={os.id} className="os-tab">
              <input
                type="radio"
                name="os-tab"
                id={`os-tab-${os.id}`}
                className="os-tab-input"
                defaultChecked={i === 0}
                aria-labelledby={`os-tab-label-${os.id}`}
              />
              <label
                className="os-tab-label"
                htmlFor={`os-tab-${os.id}`}
                id={`os-tab-label-${os.id}`}
              >
                {os.label}
              </label>
            </span>
          ))}
          <div className="os-panels">
            {osTabs.map((os) => (
              <div
                key={os.id}
                className="os-panel"
                id={`os-panel-${os.id}`}
                aria-labelledby={`os-tab-label-${os.id}`}
              >
                <dl className="os-panel-grid">
                  <div>
                    <dt>Recommended installer</dt>
                    <dd>
                      <CodeBlock caption={`${os.label} · install`}>
                        {INSTALL_COMMAND}
                      </CodeBlock>
                    </dd>
                  </div>
                  <div>
                    <dt>Binary path</dt>
                    <dd>
                      <code>{os.installPath}</code>
                    </dd>
                  </div>
                  <div>
                    <dt>Verify command</dt>
                    <dd>
                      <code>ledgerful --version</code>
                    </dd>
                  </div>
                  <div>
                    <dt>First scan command</dt>
                    <dd>
                      <code>ledgerful scan --summary</code>
                    </dd>
                  </div>
                </dl>
                <p className="os-panel-note">{os.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Numbered install procedure ──────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Install in five steps">
          From the Rust toolchain to your first repo review.
        </SectionHeading>

        {/* Step 1: Install CLI */}
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">01 · INSTALL CLI</span>
            <h2>Build the binary from source.</h2>
          </div>
          <div className="step-body">
            <p>
              Run Cargo against the Ledgerful GitHub repository. Crates.io is
              not used — only the git source path is supported for v0.1.x.
            </p>
          </div>
        </div>
        <CodeBlock caption="install · cargo · source build · ~3–6 min on first run">
          {INSTALL_COMMAND}
        </CodeBlock>
        <ExpectedOutput caption="Expected result">
          <p>
            Cargo compiles and links the <code>ledgerful</code> binary. On
            success the binary is placed at <code>{platformRows[0].installPath}</code>{" "}
            (macOS/Linux) or{" "}
            <code>{platformRows[2].installPath}</code> (Windows). Make sure
            that directory is on your <code>PATH</code>.
          </p>
        </ExpectedOutput>

        {/* Step 2: Verify binary */}
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">02 · VERIFY BINARY</span>
            <h2>Confirm the binary is reachable and healthy.</h2>
          </div>
          <div className="step-body">
            <p>
              Print the version string and run a dependency health check. Both
              commands exit non-zero on a broken install.
            </p>
          </div>
        </div>
        <CodeBlock caption="verify · version string and dependency health">
          {`ledgerful --version
ledgerful verify --health`}
        </CodeBlock>
        <ExpectedOutput caption="Expected output — captured from a real v0.1.8 run">
          <div className="expected-output-grid">
            <div className="expected-output-sample">
              <p className="expected-output-command">ledgerful --version</p>
              <pre>
                <code>{capturedEvidence.version.lines.join("\n")}</code>
              </pre>
            </div>
            <div className="expected-output-sample">
              <p className="expected-output-command">ledgerful verify --health</p>
              <pre>
                <code>{capturedEvidence.verifyHealth.lines.join("\n")}</code>
              </pre>
            </div>
          </div>
          <p className="expected-output-extra">
            A fuller environment report is available via{" "}
            <code>ledgerful doctor</code>:
          </p>
          <DoctorOutputPreview />
        </ExpectedOutput>

        {/* Step 3: Scan a repo */}
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">03 · SCAN A REPO</span>
            <h2>Run a one-line summary on a git repository.</h2>
          </div>
          <div className="step-body">
            <p>
              Run from inside a git repository root. The scan reads the working
              tree and produces a compact per-file risk summary. No source is
              uploaded by default.
            </p>
          </div>
        </div>
        <CodeBlock caption="scan · first pass">
          {`ledgerful scan --summary`}
        </CodeBlock>
        <ExpectedOutput caption="Expected result">
          <p>
            A one-line-per-file summary showing change category, risk state, and
            impacted paths for the working tree. For a deeper report, add{" "}
            <code>--impact</code> or <code>--json</code>.
          </p>
        </ExpectedOutput>

        {/* Step 4: Launch dashboard */}
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">04 · LAUNCH DASHBOARD</span>
            <h2>Start the local loopback dashboard.</h2>
          </div>
          <div className="step-body">
            <p>
              The dashboard is served by the CLI on <code>127.0.0.1:52001</code>{" "}
              with an ephemeral local token. Nothing is hosted externally.
            </p>
          </div>
        </div>
        <CodeBlock caption="dashboard · local loopback">
          {`ledgerful web start`}
        </CodeBlock>
        <ExpectedOutput caption="Expected result">
          <p>
            A browser opens to the local dashboard (or visit{" "}
            <code>http://127.0.0.1:52001</code>). The dashboard shows Project
            Health and Recent Changes for the scanned repo.
          </p>
        </ExpectedOutput>

        {/* Step 5: Review result */}
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">05 · REVIEW RESULT</span>
            <h2>Read the dashboard or export evidence.</h2>
          </div>
          <div className="step-body">
            <p>
              Review per-file risk state, recent changes, and impact reports. For
              compliance workflows, export a signed SOC 2-style evidence ZIP from
              the dashboard or run{" "}
              <code>ledgerful export evidence --profile soc2</code>. See the{" "}
              <Link href="/docs/compliance" className="inline-link">
                compliance export docs
              </Link>{" "}
              for the full walkthrough.
            </p>
          </div>
        </div>
      </section>

      {/* ── End CTA ─────────────────────────────────────────── */}
      <section className="content-band install-end-cta">
        <h2>
          Run your first scan: <code>ledgerful scan</code>
        </h2>
        <p>
          Once the binary is installed, pick a repo and run a summary scan. The
          local dashboard and evidence export are one command away.
        </p>
        <div className="hero-actions">
          <Link href="/docs/cli" className="button-primary">
            Read the CLI docs <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/docs/dashboard" className="button-secondary">
            Dashboard guide
          </Link>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "20px" }}>
          <strong>OS code signing status:</strong> Windows Authenticode and
          macOS Developer ID / Gatekeeper notarization are not yet implemented.
          Source-built or downloaded binaries may trigger OS security prompts on
          first launch. OS code signing is a planned enhancement for a future
          release.
        </div>
      </section>
    </PageShell>
  );
}
