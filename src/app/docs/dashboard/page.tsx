import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: { absolute: "Dashboard — Ledgerful Docs" },
  description: pageDescriptions.docsDashboard,
  alternates: { canonical: "/docs/dashboard" },
  openGraph: { url: "/docs/dashboard", images: [homeOgImage] },
  twitter: { images: [homeOgImage.url] },
};

export default function DocsDashboardPage() {
  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · Dashboard</p>
        <h1>Launch the local dashboard.</h1>
        <StatusPill status="local-only" />
        <p>
          The Ledgerful dashboard is a local-only web UI. It runs as a loopback
          daemon and requires an ephemeral session token to access.
        </p>
      </section>

      {/* ── Section 1: Start the daemon ──────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Start the daemon">
          Run <code>ledgerful web start</code> from inside a git repository root.
          The daemon binds exclusively to <code>127.0.0.1</code> and is not
          accessible from any other machine or network interface.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`# Start with the default port (52001)
ledgerful web start

# Start on a custom port
ledgerful web start --port 3001`}
            </code>
          </pre>
        </div>
        <p
          className="doc-caption"
        >
          At startup the daemon prints the dashboard URL including a session
          token. Copy the full URL — including the <code>?token=</code> query
          parameter — and open it in your browser.
        </p>
      </section>

      {/* ── Section 2: Access URL ─────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Opening the dashboard">
          The URL printed at startup includes the session token. Open this URL
          in a browser on the same machine. The dashboard will not load without
          a valid token.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`# Example output from ledgerful web start:
Ledgerful dashboard listening on http://127.0.0.1:52001
Open: http://127.0.0.1:52001/?token=<your-64-char-hex-token>`}
            </code>
          </pre>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <p>
            <strong>Loopback only:</strong> The daemon binds exclusively to{" "}
            <code>http://127.0.0.1:52001</code>. CORS is restricted to{" "}
            <code>localhost</code> and <code>127.0.0.1</code> on any port.
            Cross-origin requests from remote or hosted domains are rejected.
            The dashboard is not a hosted service and is not accessible from
            other machines on your network.
          </p>
        </div>
      </section>

      {/* ── Section 3: Daemon management ─────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Daemon management">
          Check daemon status or stop it with the following commands.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`# Check whether the daemon is running and get its port
ledgerful web status

# Stop the daemon
ledgerful web stop`}
            </code>
          </pre>
        </div>
      </section>

      {/* ── Section 4: Token security ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Token security">
          Each daemon session uses a 256-bit cryptographically random token.
          Treat the token like a temporary password for the duration of the
          session.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Token entropy:</strong> Tokens are 256-bit values (32 bytes
            from OS entropy via <code>rand::thread_rng().fill_bytes</code>),
            hex-encoded to 64 characters. This makes loopback brute-force
            attacks infeasible.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Token lifetime:</strong> Tokens are per-session and are
            never persisted to disk by the daemon. Restarting the daemon
            generates a new token.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Token safety rules:</strong>
          </p>
          <ol className="doc-step-list" style={{ marginTop: "10px" }}>
            <li>
              Do not paste the full dashboard URL — including the{" "}
              <code>?token=</code> parameter — into bug reports, screenshots,
              screencasts, or documentation examples.
            </li>
            <li>
              Do not store the token in environment variables, shell history, or
              scripts.
            </li>
            <li>
              If a token is accidentally exposed, stop and restart the daemon
              immediately to generate a new one.
            </li>
            <li>
              The token is validated with constant-time comparison on every
              request to prevent timing attacks.
            </li>
          </ol>
        </div>
      </section>

      {/* ── Doc nav ───────────────────────────────────────────── */}
      <section className="content-band">
        <div className="doc-nav">
          <Link href="/docs/cli">← CLI install</Link>
          <Link href="/docs/mcp">MCP setup →</Link>
        </div>
      </section>
    </PageShell>
  );
}
