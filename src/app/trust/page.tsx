import type { Metadata } from "next";
import Link from "next/link";
import { Cloud, HardDrive, RadioTower, Shield } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { TrustSectionNav } from "@/components/trust-section-nav";
import { TrustSummary } from "@/components/trust-summary";
import { pageDescriptions } from "@/lib/content/navigation";
import { launchTruth } from "@/lib/content/launch-facts";
import {
  boundaryRows,
  networkOutbound,
  nonGoals,
  productSubprocessors,
  publicSiteInfra,
  releaseVerificationSteps,
  soc2ExportLayout,
  telemetrySchema,
  threatModel,
  trustDataFlows,
} from "@/lib/content/trust";

function DataFlowDiagram() {
  return (
    <svg
      viewBox="0 0 760 360"
      role="img"
      aria-labelledby="trust-dataflow-title trust-dataflow-desc"
      className="trust-dataflow-diagram"
    >
      <title id="trust-dataflow-title">
        Ledgerful data flow: what stays on your machine and what leaves it
      </title>
      <desc id="trust-dataflow-desc">
        Two zones. Left zone &quot;Your machine&quot; contains the git repository,
        the .ledgerful/ project directory, the ~/.ledgerful/keys/ signing key
        directory, and config.toml. Arrows show local reads and writes between
        the engine and these paths. Right zone &quot;External&quot; shows two
        explicit outbound paths: opt-in aggregate telemetry to Supabase and
        sanitized, truncated context sent by the ask workflow when a cloud
        model provider is configured and selected.
      </desc>

      {/* ── Your machine box ─────────────────────────────── */}
      <rect
        x="24"
        y="24"
        width="460"
        height="312"
        rx="10"
        ry="10"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.2"
      />
      <text
        x="40"
        y="46"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.08em"
      >
        YOUR MACHINE
      </text>

      {/* ── Engine node (center) ─────────────────────────── */}
      <rect
        x="170"
        y="118"
        width="168"
        height="84"
        rx="8"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <text
        x="184"
        y="142"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.06em"
      >
        LEDGERFUL ENGINE
      </text>
      <text
        x="184"
        y="168"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="16"
        fontWeight="700"
        fill="currentColor"
      >
        CLI · daemon · dashboard
      </text>
      <text
        x="184"
        y="188"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.65"
      >
        audit · verify · sync · export
      </text>

      {/* ── Local resources (left of engine) ─────────────── */}
      <rect
        x="44"
        y="78"
        width="108"
        height="48"
        rx="6"
        ry="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <text
        x="56"
        y="98"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.04em"
      >
        GIT REPO
      </text>
      <text
        x="56"
        y="116"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        commits, diffs
      </text>

      <rect
        x="44"
        y="146"
        width="108"
        height="48"
        rx="6"
        ry="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <text
        x="56"
        y="166"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.04em"
      >
        .LEDGERFUL/
      </text>
      <text
        x="56"
        y="184"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        ledger, reports
      </text>

      <rect
        x="44"
        y="214"
        width="108"
        height="48"
        rx="6"
        ry="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <text
        x="56"
        y="234"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.04em"
      >
        ~/KEYS/
      </text>
      <text
        x="56"
        y="252"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        Ed25519 pair
      </text>

      <rect
        x="44"
        y="282"
        width="108"
        height="36"
        rx="6"
        ry="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <text
        x="56"
        y="304"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        config.toml
      </text>

      {/* ── Sync dir (right of engine, still local) ──────── */}
      <rect
        x="356"
        y="78"
        width="120"
        height="48"
        rx="6"
        ry="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <text
        x="368"
        y="98"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.04em"
      >
        SYNC DIR
      </text>
      <text
        x="368"
        y="116"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        dir:// (local)
      </text>

      <rect
        x="356"
        y="282"
        width="120"
        height="36"
        rx="6"
        ry="6"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <text
        x="368"
        y="304"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        SOC2 zip (local)
      </text>

      {/* ── Local arrows (read/write) ─────────────────────── */}
      <line
        x1="152"
        y1="102"
        x2="170"
        y2="138"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1"
        markerEnd="url(#trust-df-arrow)"
      />
      <line
        x1="152"
        y1="170"
        x2="170"
        y2="170"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1"
        markerEnd="url(#trust-df-arrow)"
        markerStart="url(#trust-df-arrow-start)"
      />
      <line
        x1="152"
        y1="238"
        x2="170"
        y2="200"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1"
        markerEnd="url(#trust-df-arrow)"
      />
      <line
        x1="152"
        y1="300"
        x2="170"
        y2="200"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="338"
        y1="160"
        x2="356"
        y2="102"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1"
        markerEnd="url(#trust-df-arrow)"
      />
      <line
        x1="338"
        y1="180"
        x2="356"
        y2="300"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1"
        markerEnd="url(#trust-df-arrow)"
      />

      {/* ── External zone ─────────────────────────────────── */}
      <rect
        x="540"
        y="24"
        width="200"
        height="312"
        rx="10"
        ry="10"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1.2"
        strokeDasharray="6 4"
      />
      <text
        x="556"
        y="46"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.08em"
      >
        EXTERNAL
      </text>

      <rect
        x="556"
        y="74"
        width="168"
        height="72"
        rx="8"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <text
        x="568"
        y="96"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.04em"
      >
        CONFIGURED MODEL
      </text>
      <text
        x="568"
        y="114"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        Gemini / cloud provider
      </text>
      <text
        x="568"
        y="130"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.6"
      >
        sanitized context via ask
      </text>

      <rect
        x="556"
        y="220"
        width="168"
        height="72"
        rx="8"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      <text
        x="568"
        y="242"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.04em"
      >
        OPT-IN TELEMETRY
      </text>
      <text
        x="568"
        y="260"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fontWeight="600"
        fill="currentColor"
      >
        Supabase ingest
      </text>
      <text
        x="568"
        y="276"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.6"
      >
        disabled by default
      </text>

      {/* ── Boundary line between zones ───────────────────── */}
      <line
        x1="500"
        y1="42"
        x2="500"
        y2="318"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <text
        x="512"
        y="40"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="9"
        fill="currentColor"
        opacity="0.55"
        letterSpacing="0.08em"
      >
        LOCAL-FIRST BOUNDARY
      </text>

      {/* ── Single outbound arrow (telemetry, dashed) ─────── */}
      <line
        x1="338"
        y1="160"
        x2="556"
        y2="110"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.2"
        strokeDasharray="5 4"
        markerEnd="url(#trust-df-arrow)"
      />
      <text
        x="394"
        y="126"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.7"
      >
        configured ask
      </text>
      <line
        x1="338"
        y1="190"
        x2="556"
        y2="256"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.2"
        strokeDasharray="5 4"
        markerEnd="url(#trust-df-arrow)"
      />
      <text
        x="394"
        y="232"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.7"
      >
        opt-in metrics
      </text>

      {/* ── Arrowhead marker ─────────────────────────────── */}
      <defs>
        <marker
          id="trust-df-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.7" />
        </marker>
        <marker
          id="trust-df-arrow-start"
          viewBox="0 0 10 10"
          refX="2"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 10 0 L 0 5 L 10 10 z" fill="currentColor" opacity="0.7" />
        </marker>
      </defs>
    </svg>
  );
}

function TokenModelDiagram() {
  return (
    <svg
      viewBox="0 0 760 320"
      role="img"
      aria-labelledby="trust-token-title trust-token-desc"
      className="trust-token-diagram"
    >
      <title id="trust-token-title">
        Local dashboard token model: ephemeral ?token= session on loopback
      </title>
      <desc id="trust-token-desc">
        Five steps in a horizontal flow. Step one, a developer runs
        &quot;ledgerful web start&quot; on their machine. Step two, the daemon
        generates a 256-bit random token in memory. Step three, the CLI opens
        a browser to http://127.0.0.1:52001 with the token appended as
        &quot;?token=&lt;hex&gt;&quot;. Step four, the daemon validates the
        token using constant-time comparison. Step five, the dashboard session
        is established; the token is never persisted to disk and the bind
        address stays on the loopback interface, not the network.
      </desc>

      {/* ── Five nodes ─────────────────────────────────────── */}
      {[
        {
          x: 28,
          kicker: "STEP 1",
          title: "Start daemon",
          body: "ledgerful web start",
        },
        {
          x: 174,
          kicker: "STEP 2",
          title: "Generate token",
          body: "256-bit in memory",
        },
        {
          x: 320,
          kicker: "STEP 3",
          title: "Open URL",
          body: "127.0.0.1:52001/?token=…",
        },
        {
          x: 466,
          kicker: "STEP 4",
          title: "Validate",
          body: "constant-time compare",
        },
        {
          x: 612,
          kicker: "STEP 5",
          title: "Session",
          body: "loopback-only UI",
        },
      ].map(({ x, kicker, title, body }) => (
        <g key={kicker}>
          <rect
            x={x}
            y="100"
            width="120"
            height="100"
            rx="8"
            ry="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <text
            x={x + 12}
            y="124"
            fontFamily="var(--font-jetbrains-mono), monospace"
            fontSize="10"
            fill="currentColor"
            opacity="0.7"
            letterSpacing="0.06em"
          >
            {kicker}
          </text>
          <text
            x={x + 12}
            y="150"
            fontFamily="var(--font-archivo), sans-serif"
            fontSize="15"
            fontWeight="700"
            fill="currentColor"
          >
            {title}
          </text>
          <text
            x={x + 12}
            y="172"
            fontFamily="var(--font-jetbrains-mono), monospace"
            fontSize="11"
            fill="currentColor"
            opacity="0.78"
          >
            {body}
          </text>
        </g>
      ))}

      {/* ── Arrows between nodes ─────────────────────────── */}
      {[148, 294, 440, 586].map((x) => (
        <line
          key={x}
          x1={x}
          y1="150"
          x2={x + 26}
          y2="150"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.2"
          markerEnd="url(#trust-tk-arrow)"
        />
      ))}

      {/* ── Boundary band: loopback only ──────────────────── */}
      <rect
        x="20"
        y="220"
        width="720"
        height="68"
        rx="8"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text
        x="36"
        y="240"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.06em"
      >
        BOUNDARY
      </text>
      <text
        x="36"
        y="262"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="13"
        fontWeight="600"
        fill="currentColor"
      >
        Loopback only — bound to 127.0.0.1:52001, not reachable from your
        network or the internet.
      </text>
      <text
        x="36"
        y="280"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fill="currentColor"
        opacity="0.78"
      >
        Token is per-session, validated in memory, and never persisted to disk.
      </text>

      {/* ── Arrowhead marker ─────────────────────────────── */}
      <defs>
        <marker
          id="trust-tk-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.7" />
        </marker>
      </defs>
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Trust and security — local-first data flow and SOC2 evidence",
  description: pageDescriptions.trust,
  alternates: {
    canonical: "/trust",
  },
};

const iconMap = {
  Shield,
  HardDrive,
  RadioTower,
  Cloud,
} as const;

export default function TrustPage() {
  const {
    disclosure,
    license,
    release,
    repository,
    telemetry,
  } = launchTruth.facts;

  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Security posture</p>
        <h1>Security starts at the local-first boundary.</h1>
        <p>
          What Ledgerful reads, writes, and transmits — and what stays on your
          machine.
        </p>
      </section>

      <div className="trust-layout">
        <TrustSectionNav />

        <div className="trust-content">
          {/* ── Section 1: Executive summary ──────────────────── */}
          <section id="summary" className="content-band trust-section">
            <TrustSummary />
          </section>

          {/* ── Section 2: Reads / writes / uploads boundary ── */}
          <section id="boundary-table" className="content-band trust-section">
            <SectionHeading title="Reads / writes / uploads">
              Boundary answer in one table: what each surface reads, what it
              writes, what can leave the machine, and what stays local. Every
              row traces back to the sections below.
            </SectionHeading>
            <div
              className="table-scroll"
              role="region"
              aria-label="Reads, writes, uploads, and what stays local, horizontally scrollable"
              tabIndex={0}
            >
              <table
                className="trust-table boundary-table"
                aria-label="Reads, writes, uploads, and what stays local for each Ledgerful surface"
              >
                <thead>
                  <tr>
                    <th scope="col">Surface</th>
                    <th scope="col">Reads</th>
                    <th scope="col">Writes</th>
                    <th scope="col">Uploads / sends externally</th>
                    <th scope="col">Stays local</th>
                  </tr>
                </thead>
                <tbody>
                  {boundaryRows.map((row) => (
                    <tr key={row.surface}>
                      <th scope="row">
                        <strong>{row.surface}</strong>
                      </th>
                      <td>{row.reads}</td>
                      <td>{row.writes}</td>
                      <td>{row.uploads}</td>
                      <td>{row.staysLocal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p
              className="item-caveat"
              style={{ marginTop: "12px", color: "var(--muted)" }}
            >
              Detailed reads / writes are listed in the &ldquo;what stays on your
              machine&rdquo; section below; the known outbound paths and their
              activation conditions are listed in the data-flow and
              release-verification sections.
            </p>
          </section>

          {/* ── Section 3: Data flow diagram ────────────────── */}
          <section id="data-flow" className="content-band trust-section">
            <SectionHeading title="Data flow">
              Five modes describe how data moves in Ledgerful. The default
              mode uploads nothing. Source code is never uploaded by default.
            </SectionHeading>
            <div className="trust-grid">
              {trustDataFlows.map((flow) => {
                const Icon = iconMap[flow.iconName];
                return (
                  <article key={flow.title}>
                    <Icon size={24} aria-hidden="true" />
                    <div className="trust-card-head">
                      <h3>{flow.title}</h3>
                      <StatusPill status={flow.state} />
                    </div>
                    <p>{flow.body}</p>
                  </article>
                );
              })}
            </div>
            <figure
              aria-label="Data flow diagram: local reads and writes, opt-in telemetry, and configured cloud-model egress"
              style={{ marginBlock: "20px 0" }}
            >
              <DataFlowDiagram />
              <figcaption className="diagram-caption">
                Every arrow inside the <strong>Your machine</strong> box is
                local. Two configured paths can cross the boundary: opt-in
                aggregate telemetry to Supabase, and sanitized, truncated
                context from the <code>ask</code> workflow to a selected cloud
                model. Neither path is active in the default local-only
                workflow.
              </figcaption>
            </figure>
            <div className="network-inventory" style={{ marginTop: "32px" }}>
              <article>
                <h3>Update checks</h3>
                <p>{networkOutbound.updateChecks}</p>
              </article>
              <article>
                <h3>Crash reporting</h3>
                <p>{networkOutbound.crashReporting}</p>
              </article>
              <article>
                <h3>Configured cloud models</h3>
                <p>{networkOutbound.cloudModels}</p>
              </article>
            </div>
          </section>

          {/* ── Section 4: Three-surface boundary ───────────── */}
          <section id="three-surface" className="content-band trust-section">
            <SectionHeading title="Three-surface boundary">
              Ledgerful is shipped as three local surfaces — CLI, daemon, and
              dashboard — plus an optional configured cloud model. The
              dashboard bind address is 127.0.0.1:52001; CORS is restricted to
              loopback origins; the session token is 256-bit random, validated
              in constant time, and never persisted to disk.
            </SectionHeading>
            <div className="trust-dl-grid">
              <div>
                <h3>CLI</h3>
                <p>
                  The <code>ledgerful</code> binary. It runs commands, reads
                  project state, writes ledger entries and reports, and
                  can launch the local dashboard. No network is required for
                  scan, audit, ledger, verify, or the local evidence export.
                </p>
              </div>
              <div>
                <h3>Daemon</h3>
                <p>
                  The loopback HTTP server backing the dashboard. Bound to
                  <code> 127.0.0.1:52001</code>. Auth via ephemeral session
                  token in <code>?token=&lt;hex&gt;</code> or{" "}
                  <code>Authorization: Bearer &lt;hex&gt;</code>. The token is
                  generated in memory, validated constant-time, and never
                  persisted to disk.
                </p>
              </div>
              <div>
                <h3>Dashboard</h3>
                <p>
                  A static SPA that opens against the daemon URL with the
                  ephemeral token. Lives in your browser. It does not call any
                  remote service; the bind address is loopback only.
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 5: Daemon access / token model ──────── */}
          <section
            id="dashboard-security"
            className="content-band trust-section"
          >
            <SectionHeading title="Dashboard and token model">
              The local dashboard is loopback-only. It is not accessible from
              the internet or from other machines on your network.
            </SectionHeading>
            <figure
              aria-label="Token model diagram: ephemeral local ?token= session on loopback"
              style={{ marginBlock: "8px 24px" }}
            >
              <TokenModelDiagram />
              <figcaption className="diagram-caption">
                Five steps from <code>ledgerful web start</code> to an active
                loopback dashboard. The token lives only in daemon memory, is
                validated constant-time, and is never persisted to disk.
              </figcaption>
            </figure>
            <div className="disclosure-notice">
              <p>
                <strong>Bind address:</strong> The daemon binds exclusively
                to <code>http://127.0.0.1:52001</code>. CORS is restricted to{" "}
                <code>localhost</code> and <code>127.0.0.1</code> on any port
                — cross-origin requests from remote or hosted domains are
                rejected.
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Token authentication:</strong> Every dashboard session
                requires an ephemeral session token passed via{" "}
                <code>?token=&lt;hex&gt;</code> in the query string or{" "}
                <code>Authorization: Bearer &lt;hex&gt;</code> in the request
                header. Tokens are validated using constant-time comparison
                to prevent timing attacks.
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Token entropy:</strong> Tokens are 256-bit
                cryptographically random values (32 bytes via{" "}
                <code>rand::thread_rng().fill_bytes</code>, seeded from OS
                entropy), hex-encoded to 64 characters. Entropy is sufficient
                to make loopback brute-force attacks infeasible.
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Token safety rules:</strong> Tokens are per-session
                and never persisted to disk by the daemon. Tokens must not
                appear in browser logs, screenshot-based bug reports, or
                documentation examples. If a token is accidentally exposed,
                restart the daemon to generate a new one.
              </p>
            </div>
          </section>

          {/* ── Section 6: Cryptographic signing ─────────────── */}
          <section id="signing" className="content-band trust-section">
            <SectionHeading title="Signing and key management">
              Ledgerful uses Ed25519 signing to provide tamper-evident ledger
              provenance and offline-verifiable SOC2 evidence.
            </SectionHeading>
            <div className="disclosure-notice">
              <p>
                <strong>Key generation:</strong> An Ed25519 key pair is
                generated on first use via <code>OsRng</code> (OS-level
                entropy). The signing key and verifying key are stored as
                hex-encoded files at{" "}
                <code>~/.ledgerful/keys/private.key</code> and{" "}
                <code>~/.ledgerful/keys/public.pem</code> (Windows:{" "}
                <code>%USERPROFILE%\.ledgerful\keys\</code>). No remote key
                management is required by default.
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Key storage at rest:</strong> Private keys are stored
                as plain hex files protected only by filesystem permissions.
                A local machine compromise — such as malware or a stolen
                laptop without Full Disk Encryption — could allow an attacker
                to extract the private key and forge signed ledger entries.{" "}
                <strong>
                  Full Disk Encryption (FDE) is the primary recommended
                  mitigation for local key security.
                </strong>{" "}
                Hardware-backed key storage (TPM, Secure Enclave) and hosted
                KMS are enterprise-planned features for a future control
                plane.
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Sync bundles:</strong> When local sync is enabled,
                Ledgerful signs and encrypts bundles before writing them to
                the sync directory. Bundle contents are not readable without
                the encryption key.
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>SOC2 export signing:</strong> Each SOC2 evidence ZIP
                includes <code>manifest.sig</code> (64-byte Ed25519 signature
                over <code>manifest.json</code>) and{" "}
                <code>manifest.pub</code> (32-byte verifying key). This allows
                offline tamper verification without trusting a remote key
                server.
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Key rotation and enterprise features:</strong> Key
                rotation is local and manual. Hardware-backed key storage,
                hosted KMS, and device trust management are
                enterprise-planned and require a future control plane. SSO /
                SAML / OIDC, SCIM, and RBAC are also enterprise-planned —
                none of these are implemented in the local daemon.
              </p>
            </div>
          </section>

          {/* ── Section 7: Release verification ──────────────── */}
          <section
            id="release-verification"
            className="content-band trust-section"
          >
            <SectionHeading title="Release verification">
              {release.value}. The release workflow requires SHA-256
              companion files for every binary archive.
            </SectionHeading>
            <div
              className="disclosure-notice"
              style={{ marginBottom: "24px" }}
            >
              <strong>Current baseline:</strong> {release.note} The steps
              below describe the verification process that will apply once
              URLs are available.
            </div>
            <ol className="doc-step-list">
              {releaseVerificationSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <div
              className="disclosure-notice"
              style={{ marginTop: "24px" }}
            >
              <strong>OS code signing status:</strong> Windows Authenticode
              signing and macOS Developer ID / Gatekeeper notarization are
              not yet implemented. Binaries may trigger OS security prompts
              on first launch. Code signing for both platforms and SLSA
              provenance attestations are planned enhancements for a future
              release.
            </div>
          </section>

          {/* ── Section 8: Telemetry ─────────────────────────── */}
          <section id="telemetry" className="content-band trust-section">
            <SectionHeading title="Telemetry">
              {telemetry.value}. It must be explicitly enabled.
            </SectionHeading>
            <div
              className="disclosure-notice"
              style={{ marginBottom: "24px" }}
            >
              <strong>Opt-in only:</strong> The default binary does not
              include the <code>{telemetry.feature}</code> feature. In a
              build that does, enable collection with{" "}
              <code>{telemetry.enableCommand}</code>; its state is stored in{" "}
              <code>{telemetry.configPath}</code>. Telemetry is never
              activated without explicit user action. The payload contains
              the documented aggregate fields below; it does not include
              command arguments, source code, file paths, diff text, or
              query text.
            </div>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.9rem",
                marginBottom: "16px",
              }}
            >
              Ingest endpoint:{" "}
              <code className="technical-token">{telemetry.endpoint}</code>
            </p>
            <div className="table-scroll">
              <table
                className="trust-table telemetry-table"
                aria-label="Telemetry fields sent when opt-in is enabled"
              >
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetrySchema.map((field) => (
                    <tr key={field.name}>
                      <th scope="row">
                        <strong>{field.name}</strong>
                      </th>
                      <td>{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="item-caveat" style={{ marginTop: "12px" }}>
              Command arguments, source code, file paths, diff text, query
              text, commit messages, and author identities are not part of
              this payload.
            </p>
            <details className="sample-export">
              <summary>View example telemetry payload (JSON)</summary>
              <p>
                <span className="sample-label">EXAMPLE</span> The payload
                below shows the complete payload shape documented above. The
                endpoint is the Supabase Edge Function documented on this
                page and is only contacted after{" "}
                <code>{telemetry.enableCommand}</code>.
              </p>
              <pre>
                <code>{`{
  "schema_version": 1,
  "anonymous_id": "00000000-0000-4000-8000-000000000000",
  "client_version": "0.1.7",
  "platform": "windows",
  "sent_at": "2026-07-02T14:00:00Z",
  "window_start": "2026-06-25T14:00:00Z",
  "window_end": "2026-07-02T14:00:00Z",
  "command_counts": {
    "verify": 4,
    "scan": 2
  },
  "features_enabled": ["web", "mcp", "sync"],
  "active_days_in_window": 3
}`}</code>
              </pre>
            </details>
          </section>

          {/* ── Section 9: Redacted evidence export ─────────── */}
          <section id="soc2-export" className="content-band trust-section">
            <SectionHeading title="Redacted evidence export">
              The SOC2 evidence export is a ZIP file generated entirely from
              local data. This is not a hosted SOC2 portal — no data leaves
              your machine during export.
            </SectionHeading>
            <div
              className="disclosure-notice"
              style={{ marginBottom: "24px" }}
            >
              <strong>Scope:</strong> This is a local ZIP export only. A
              hosted SOC2 portal (with continuous monitoring, auditor access
              controls, and live attestation) is enterprise-planned and
              requires a future hosted control plane.
            </div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 720,
                marginBottom: "12px",
                color: "var(--ink)",
              }}
            >
              ZIP layout
            </h3>
            <div className="table-scroll" style={{ marginBottom: "28px" }}>
              <table
                className="trust-table"
                aria-label="SOC2 export ZIP file layout"
              >
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
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 720,
                marginBottom: "12px",
                color: "var(--ink)",
              }}
            >
              Offline tamper verification
            </h3>
            <ol className="doc-step-list">
              <li>
                For each entry in <code>manifest.json</code>&apos;s{" "}
                <code>files</code> array, re-compute SHA-256 over the
                corresponding file&apos;s bytes from the ZIP and compare to
                the stored hash. A mismatch means the file was altered after
                the manifest was generated.
              </li>
              <li>
                Read <code>manifest.sig</code> (64 raw bytes) and{" "}
                <code>manifest.pub</code> (32 raw bytes). Verify the Ed25519
                signature over <code>manifest.json</code> bytes. A mismatch
                means the manifest itself was replaced.
              </li>
              <li>
                Both checks must pass for the export to be considered
                unmodified. A failure in step 1 indicates file tampering; a
                failure in step 2 indicates manifest replacement.
              </li>
            </ol>
            <details className="sample-export">
              <summary>
                View sample export manifest (illustrative — not real
                evidence)
              </summary>
              <p>
                The sample below shows the <code>manifest.json</code>{" "}
                structure and a few rows of <code>ledger.csv</code> exactly
                as a local export would render them. All values —
                timestamps, hashes, transaction ids, and signatures — are
                fabricated for illustration. A real export is regenerated
                on demand from your local ledger.
              </p>
              <h4>manifest.json (SAMPLE — not real evidence)</h4>
              <pre>
                <code>{`{
  "generatedAt": "2026-06-30T14:22:08.114Z",
  "toolVersion": "0.1.6",
  "entryCount": 3,
  "files": [
    {
      "name": "ledger.csv",
      "sha256": "5f4dcc3b5aa765d61d8327deb882cf99…a1b2",
      "bytes": 1820
    },
    {
      "name": "manifest.pub",
      "sha256": "3a7bd3e2360a3d29eea436fcfb7e44c7…d09e",
      "bytes": 32
    },
    {
      "name": "verification_history.csv",
      "sha256": "e8c1b09a3f2a47d6bc5c1f4a0b8e9d72…7c4f",
      "bytes": 412
    }
  ]
}`}</code>
              </pre>
              <h4>manifest.sig (SAMPLE)</h4>
              <pre>
                <code>{`64-byte Ed25519 signature over manifest.json bytes
(raw binary; not human-readable; placeholder shown)`}</code>
              </pre>
              <h4>manifest.pub (SAMPLE)</h4>
              <pre>
                <code>{`32-byte Ed25519 verifying key
(raw binary; not human-readable; placeholder shown)`}</code>
              </pre>
              <h4>ledger.csv (SAMPLE — first 3 rows)</h4>
              <div
                className="table-scroll"
                role="region"
                aria-label="Sample ledger CSV rows, horizontally scrollable"
                tabIndex={0}
              >
                <table
                  className="sample-csv-table"
                  aria-label="Sample ledger CSV rows"
                >
                  <thead>
                    <tr>
                      <th scope="col">tx_id</th>
                      <th scope="col">category</th>
                      <th scope="col">entity</th>
                      <th scope="col">change_type</th>
                      <th scope="col">summary</th>
                      <th scope="col">committed_at</th>
                      <th scope="col">signed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">0001</th>
                      <td>adr</td>
                      <td>docs/adr/0001-record-ledger-entries.md</td>
                      <td>create</td>
                      <td>
                        Record ledger entries as MADR-format files
                      </td>
                      <td>2026-06-12T09:14:02Z</td>
                      <td>true</td>
                    </tr>
                    <tr>
                      <th scope="row">0002</th>
                      <td>config</td>
                      <td>config.toml</td>
                      <td>update</td>
                      <td>
                        Enable coverage report and signing requirements
                      </td>
                      <td>2026-06-18T17:02:51Z</td>
                      <td>true</td>
                    </tr>
                    <tr>
                      <th scope="row">0003</th>
                      <td>refactor</td>
                      <td>src/verify/manifest.rs</td>
                      <td>update</td>
                      <td>
                        Sort manifest files array by name for determinism
                      </td>
                      <td>2026-06-25T11:38:44Z</td>
                      <td>true</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </section>

          {/* ── Section 10: Threat model + non-goals ────────── */}
          <section id="threat-model" className="content-band trust-section">
            <SectionHeading title="Threat model and non-goals">
              Where Ledgerful provides protection today, and the categories of
              guarantee it does not attempt to make.
            </SectionHeading>
            <div className="threat-grid">
              {threatModel.map((item) => (
                <article key={item.heading}>
                  <h3>{item.heading}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 720,
                margin: "32px 0 12px",
                color: "var(--ink)",
              }}
            >
              What Ledgerful does not claim
            </h3>
            <ul className="non-goals">
              {nonGoals.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div
              className="disclosure-notice"
              style={{ marginTop: "24px" }}
            >
              <strong>Reading this section:</strong> The threat model and
              non-goals are restated, not introduced. Each bullet traces back
              to the data flow, signing, telemetry, or evidence-export
              content above. If a future release changes the boundary (for
              example, by shipping a hosted control plane), this section
              will be updated in the same change.
            </div>
          </section>

          {/* ── Section 11: Responsible disclosure ──────────── */}
          <section id="disclosure" className="content-band trust-section">
            <SectionHeading title="Responsible disclosure">
              {disclosure.value}. Disclosure remains an unresolved launch
              fact.
            </SectionHeading>
            <div className="disclosure-notice">
              <p>
                <strong>Channel status:</strong> {disclosure.note}
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Forward note:</strong> Do not send vulnerability
                details to a public issue. Check this page for the current
                verified channel status.
              </p>
              <p style={{ marginTop: "12px" }}>
                <strong>Source repository:</strong> {repository.note}{" "}
                Canonical URL:{" "}
                {repository.anonymousAccess ? (
                  <a
                    href={repository.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-link"
                  >
                    github.com/Ryan-AI-Studios/Ledgerful
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                ) : (
                  <code>github.com/Ryan-AI-Studios/Ledgerful</code>
                )}
                . General (non-security) bugs may be reported via GitHub
                Issues once the repository is confirmed publicly open for
                issues.
              </p>
            </div>
          </section>

          {/* ── Section 12: License ──────────────────────────── */}
          <section id="license" className="content-band trust-section">
            <SectionHeading title="License">
              Current source terms are {license.base} plus the small-entity
              exception. Legal launch review is still open.
            </SectionHeading>
            <div className="disclosure-notice">
              <p>
                Ledgerful is currently distributed under{" "}
                <strong>{license.base}</strong> with the{" "}
                <strong>{license.exception}</strong>. The{" "}
                {repository.anonymousAccess ? (
                  <a
                    href={repository.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-link"
                  >
                    repository LICENSE file
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                ) : (
                  "reviewed local LICENSE file"
                )}{" "}
                reflects the operative source terms. Legal launch review
                remains unresolved and any later change must update the
                reviewed truth baseline before it reaches public copy.
              </p>
            </div>
          </section>

          {/* ── Section 13: Subprocessors (TWO lists) ────────── */}
          <section id="subprocessors" className="content-band trust-section">
            <SectionHeading title="Subprocessors">
              Default local analysis uses no subprocessors for project data.
              The two lists below are kept clearly separated: public-site
              hosting / docs infrastructure (which never touches user code)
              and the product / future-hosted-control-plane subprocessors.
            </SectionHeading>

            <div className="subprocessor-list">
              <h3
                id="subprocessor-public-heading"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 720,
                  margin: "8px 0 8px",
                  color: "var(--ink)",
                }}
              >
                Public-site hosting &amp; docs infrastructure
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.9rem",
                  margin: "0 0 16px",
                }}
              >
                Serves the static <code>ledgerful.io</code> site only. Does
                not process project source code, ledger data, or user data.
              </p>
              <div
                className="table-scroll"
                role="region"
                aria-label="Public-site subprocessors, horizontally scrollable"
                tabIndex={0}
              >
                <table
                  className="trust-table"
                  aria-labelledby="subprocessor-public-heading"
                >
                  <thead>
                    <tr>
                      <th scope="col">Subprocessor</th>
                      <th scope="col">Purpose</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publicSiteInfra.map((sp) => (
                      <tr key={sp.name}>
                        <th scope="row">
                          <strong>{sp.name}</strong>
                        </th>
                        <td>{sp.purpose}</td>
                        <td>
                          <StatusPill status={sp.state} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className="subprocessor-list"
              style={{ marginTop: "32px" }}
            >
              <h3
                id="subprocessor-product-heading"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 720,
                  margin: "0 0 8px",
                  color: "var(--ink)",
                }}
              >
                Product &amp; future-hosted control plane
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.9rem",
                  margin: "0 0 16px",
                }}
              >
                Subprocessors scoped to the Ledgerful product runtime.
                &ldquo;Current&rdquo; rows handle data the user has explicitly chosen to
                send today; &ldquo;planned&rdquo; rows are reserved for a future hosted
                control plane and do not receive any data yet.
              </p>
              <div
                className="table-scroll"
                role="region"
                aria-label="Product and future-hosted subprocessors, horizontally scrollable"
                tabIndex={0}
              >
                <table
                  className="trust-table"
                  aria-labelledby="subprocessor-product-heading"
                >
                  <thead>
                    <tr>
                      <th scope="col">Subprocessor</th>
                      <th scope="col">Purpose</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productSubprocessors.map((sp) => (
                      <tr key={sp.name}>
                        <th scope="row">
                          <strong>{sp.name}</strong>
                        </th>
                        <td>
                          {sp.purpose}
                          {sp.tier === "hosted-planned" ? (
                            <>
                              {" "}
                              <span className="subprocessor-tier-tag">
                                Hosted planned
                              </span>
                            </>
                          ) : null}
                        </td>
                        <td>
                          <StatusPill status={sp.state} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.85rem",
                marginTop: "16px",
              }}
            >
              Data deletion policies and data processing agreements will be
              defined when hosted mode launches. No subprocessor contract
              applies to local-only installs. Vercel is intentionally listed
              only under public-site infra; it does not process project data
              and is not part of the product / future-hosted subprocessor
              list.
            </p>
          </section>

          <section className="content-band">
            <SectionHeading title="Evaluate Ledgerful locally">
              The trust posture above is verifiable on your own machine.
              Install the CLI, run a scan, and inspect the local-first
              boundary.
            </SectionHeading>
            <div className="hero-actions">
              <Link className="button-primary" href="/install">
                Try Ledgerful locally
              </Link>
              <Link className="button-secondary" href="/pricing">
                See editions and feature states
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
