import type { Metadata } from "next";
import Link from "next/link";
import { Cloud, Globe, MonitorSmartphone } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { ArtifactPreview } from "@/components/artifact-preview";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: { absolute: "How Ledgerful works locally" },
  description: pageDescriptions.architecture,
  alternates: { canonical: "/architecture" },
  openGraph: {
    url: "/architecture",
    images: [
      {
        url: "/og/architecture.png",
        width: 1200,
        height: 630,
        alt: "How Ledgerful works locally — what the local engine reads, analyzes, and produces, with a real local dashboard receipt showing Project Health and Recent Changes.",
      },
    ],
  },
  twitter: {
    images: ["/og/architecture.png"],
  },
};

type Surface = {
  index: "01" | "02" | "03";
  role: string;
  title: string;
  icon: "monitor" | "globe" | "cloud";
  body: string;
  meta: string;
  status?: "available" | "local-only" | "hosted planned";
};

type StateRow = {
  scope: string;
  body: string;
  status: "available" | "beta" | "local-only" | "hosted planned";
};

const surfaces: Surface[] = [
  {
    index: "01",
    role: "Engine",
    title: "Local CLI and engine",
    icon: "monitor",
    body: "The Ledgerful binary runs entirely on your machine. The default build owns the ledger, scan, audit, verify, web (daemon), and MCP command surfaces. Local sync is feature-gated and requires a --features sync build. No remote service is required for normal operation.",
    meta: "Runs on host · no network calls by default",
    status: "available",
  },
  {
    index: "02",
    role: "Dashboard",
    title: "Embedded loopback dashboard",
    icon: "globe",
    body: "The dashboard is a local web UI served by the Ledgerful daemon, bound to 127.0.0.1:52001 with an ephemeral session token. It is not accessible from the internet or other machines on your network.",
    meta: "Binds 127.0.0.1:52001 · one-time launch token → Bearer auth",
    status: "local-only",
  },
  {
    index: "03",
    role: "Public web",
    title: "Public marketing and docs",
    icon: "cloud",
    body: "This site. Static, deployable on Vercel, no hosted backend. Public docs describe the local product; they do not run a hosted control plane.",
    meta: "Static · Vercel deployable · no authenticated state",
    status: "available",
  },
];

const iconMap = {
  monitor: MonitorSmartphone,
  globe: Globe,
  cloud: Cloud,
};

const stateRows: StateRow[] = [
  {
    scope: "Local default",
    body: "Ledgerful runs on your machine, reads from your repo and local files, writes to .ledgerful/. Source code never leaves the host. No remote calls for scan, ledger, audit, or export.",
    status: "available",
  },
  {
    scope: "Local team sync",
    body: "With a sync-enabled build, signed and encrypted bundles are written to a directory you choose. You control the transport (a shared drive, a USB stick, or any other dir://-compatible path). Nothing broadcasts.",
    status: "beta",
  },
  {
    scope: "Telemetry (opt-in)",
    body: "Disabled by default. When enabled, structured usage events are sent to a Supabase ingest endpoint. Source code, file content, diffs, and commit messages are never transmitted.",
    status: "available",
  },
  {
    scope: "Configured cloud model",
    body: "The ask workflow can send sanitized, truncated impact and retrieved codebase context to Gemini, Ollama Cloud, or OpenRouter when that provider is configured and selected. Local-model operation does not use this path.",
    status: "available",
  },
  {
    scope: "Hosted control plane",
    body: "A future hosted mode will add tenancy, hosted audit log, GitHub App callbacks, billing, and SSO/SCIM/RBAC. None of this is shipped today — see /pricing for explicit state labels.",
    status: "hosted planned",
  },
];

export default function ArchitecturePage() {
  return (
    <PageShell>
      {/* ── Hero — reframed around the workflow, not the topology
          (WEB-0023). Route and canonical are unchanged. ────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Architecture</p>
        <h1>How Ledgerful works locally.</h1>
        <p>
          Ledgerful reads your repo, analyzes it entirely on your machine, and
          writes real evidence to disk. The local engine, the loopback
          dashboard, and this public site are three distinct surfaces — a
          future hosted control plane is planned and always marked as such,
          never shown as already live.
        </p>
      </section>

      {/* ── Workflow: input → local analysis → outputs, BEFORE the
          component topology diagram (spec: lead with workflow). ───────── */}
      <section className="content-band" id="workflow">
        <SectionHeading title="What goes in, what runs locally, what comes out.">
          Before the surfaces and the diagram below, here is the actual
          workflow — with real, redacted evidence beside each output, not a
          mockup.
        </SectionHeading>

        <div className="step-block">
          <div className="step-head">
            <span className="step-index">READS</span>
            <h2>Your repo. Nothing more.</h2>
          </div>
          <div className="step-body">
            <p>
              Ledgerful reads your local git repository: the working tree,
              diffs against a base ref, commit history, and its own local
              config and state under <code>.ledgerful/</code>. It does not
              read files outside the repo, and source code, diffs, and commit
              messages are not uploaded anywhere by default.
            </p>
          </div>
        </div>

        <div className="step-block">
          <div className="step-head">
            <span className="step-index">ANALYZES</span>
            <h2>A deterministic local engine.</h2>
          </div>
          <div className="step-body">
            <p>
              <code>scan</code>, <code>verify</code>, and <code>audit</code>{" "}
              run entirely on your machine — deterministic checks against
              repo state, no network calls by default. The <code>ask</code>{" "}
              workflow is the one path that can leave the box, and only when
              you configure and select a cloud model; it is a separate,
              explicitly configured mode, not part of the default analysis.
            </p>
          </div>
        </div>

        <div className="step-block">
          <div className="step-head">
            <span className="step-index">PRODUCES</span>
            <h2>Three real outputs, each with real evidence.</h2>
          </div>
          <div className="step-body">
            <p>
              A scan can produce a risk summary, a verification plan, and a
              signed provenance record written to the ledger; the dashboard
              can turn ledger history into a SOC 2-style evidence export.
              Below is real, redacted output captured from each — the same
              artifacts shown on the homepage.
            </p>
          </div>
        </div>

        <div className="produces-grid" style={{ marginTop: "8px" }}>
          <article>
            <h3>Verification plan</h3>
            <ArtifactPreview id="verificationPlan" />
          </article>
          <article>
            <h3>Signed provenance record</h3>
            <ArtifactPreview id="provenanceRecord" />
          </article>
          <article>
            <h3>Evidence export manifest</h3>
            <ArtifactPreview id="evidenceExport" />
          </article>
        </div>
      </section>

      {/* ── Diagram — component topology, after the workflow ───────────── */}
      <section className="content-band" id="diagram">
        <SectionHeading title="Surfaces and the local-first boundary">
          The host runs the engine and dashboard. The public web is static and
          does not host a control plane. The hosted mode is planned and is
          shown dashed.
        </SectionHeading>
        <figure className="arch-diagram" aria-label="Three Ledgerful surfaces diagram">
          <ArchitectureDiagram />
          <figcaption className="arch-diagram-caption">
            Your machine hosts the engine (CLI) and the embedded dashboard,
            grouped inside the &ldquo;YOUR MACHINE&rdquo; boundary. Nothing in
            that boundary uploads by default; the dashboard binds to{" "}
            <code>127.0.0.1</code> only and telemetry is opt-in. Outside the
            boundary, the public web is a static site with no hosted backend.
            The hosted control plane, shown with a dashed border and labeled
            &ldquo;planned · not live,&rdquo; does not exist yet.
          </figcaption>
        </figure>
      </section>

      {/* ── Surfaces strip ─────────────────────────────────── */}
      <section className="split-band" id="surfaces">
        <SectionHeading title="The three surfaces today">
          Each surface has an explicit state. No hosted or enterprise
          capability is presented as live before the control plane exists.
        </SectionHeading>
        <div className="surface-strip">
          {surfaces.map((surface) => {
            const Icon = iconMap[surface.icon];
            const isPlanned = surface.status === "hosted planned";
            return (
              <article
                key={surface.index}
                className={`surface-card${
                  isPlanned ? " surface-card--planned" : ""
                }`}
              >
                <div className="surface-head">
                  <span className="surface-role">
                    SURFACE {surface.index}
                  </span>
                  {surface.status ? (
                    <StatusPill status={surface.status} />
                  ) : null}
                </div>
                <Icon size={22} aria-hidden="true" />
                <h3>{surface.title}</h3>
                <p>{surface.body}</p>
                <div className="surface-meta">
                  <span>{surface.meta}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Mode state table ───────────────────────────────── */}
      <section className="content-band" id="modes">
        <SectionHeading title="Operating modes and their data flow">
          Five modes describe what crosses the local-first boundary. Scan,
          ledger, audit, verify, dashboard, and export stay local. Feature-gated
          sync also stays local when compiled with <code>--features sync</code>;
          cloud model context and aggregate telemetry are separate configured
          paths.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table
            className="arch-state-table"
            aria-label="Operating modes and data flow"
          >
            <thead>
              <tr>
                <th scope="col">Mode</th>
                <th scope="col">What crosses the boundary</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {stateRows.map((row) => (
                <tr key={row.scope}>
                  <th scope="row" className="arch-state-scope">
                    {row.scope}
                  </th>
                  <td>{row.body}</td>
                  <td>
                    <StatusPill status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p
          className="doc-caption"
          style={{ marginTop: "16px" }}
        >
          Telemetry, when enabled, sends the aggregate schema documented on the
          trust page. Separately, configured cloud-model ask workflows can send
          sanitized, truncated context to the selected provider. See{" "}
          <Link
            href="/trust"
            style={{
              color: "var(--accent)",
            }}
          >
            the trust page
          </Link>{" "}
          for the full telemetry schema.
        </p>
      </section>

      {/* ── Bind address / token ───────────────────────────── */}
      <section className="content-band" id="bindings">
        <div className="step-block">
          <div className="step-head">
            <span className="step-index">DETAIL · DAEMON BIND</span>
            <h2>The dashboard is loopback-only.</h2>
          </div>
          <div className="step-body">
            <p>
              The local daemon binds exclusively to{" "}
              <code>http://127.0.0.1:52001</code>. CORS is restricted to{" "}
              <code>localhost</code> and <code>127.0.0.1</code> on any port —
              cross-origin requests from remote or hosted domains are
              rejected. The launch URL carries an ephemeral{" "}
              <code>?token=&lt;hex&gt;</code> once. The dashboard captures it
              in memory, strips it from the browser URL, and sends subsequent
              API requests with{" "}
              <code>Authorization: Bearer &lt;hex&gt;</code>. Tokens are
              per-session and are never persisted to disk.
            </p>
          </div>
        </div>

        <div className="step-block">
          <div className="step-head">
            <span className="step-index">DETAIL · KEYS &amp; EXPORT</span>
            <h2>Keys and evidence export stay on disk.</h2>
          </div>
          <div className="step-body">
            <p>
              An Ed25519 key pair is generated on first use via OS entropy.
              The signing key and verifying key are stored as hex-encoded
              files at <code>~/.ledgerful/keys/private.key</code> and{" "}
              <code>~/.ledgerful/keys/public.pem</code> (Windows:{" "}
              <code>%USERPROFILE%\.ledgerful\keys\</code>). The SOC 2-style evidence
              ZIP is generated entirely from local data; the manifest,
              signature, hashes, ledger CSV, verification history, and ADR
              files never leave the host during export.
            </p>
            <p style={{ marginTop: "12px" }}>
              Hardware-backed key storage, hosted KMS, SSO/SCIM, and RBAC are{" "}
              <em style={{ fontStyle: "normal", color: "var(--ink)" }}>
                enterprise planned
              </em>
              . They require the future hosted control plane and are not
              implemented in the local daemon.
            </p>
          </div>
        </div>
      </section>

      {/* ── Where next ────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Read next">
          Pair the architecture page with the install path, the trust posture,
          and the release evidence.
        </SectionHeading>
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
              href="/install"
              style={{
                color: "var(--primary-strong)",
                fontWeight: 680,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                textDecorationColor: "var(--line)",
              }}
            >
              Install →
            </Link>{" "}
            source install, verification steps, and first commands.
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
            outbound network inventory, signing model, SOC 2-style export layout,
            release verification.
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
            editions with explicit available, beta, local-only, hosted
            planned, and enterprise planned states.
          </li>
        </ul>
      </section>
    </PageShell>
  );
}
