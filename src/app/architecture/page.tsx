import type { Metadata } from "next";
import Link from "next/link";
import { Cloud, Globe, MonitorSmartphone } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "Architecture — local engine, dashboard, and web surfaces",
  description: pageDescriptions.architecture,
  alternates: { canonical: "/architecture" },
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
    body: "The Ledgerful binary runs entirely on your machine. It owns the ledger, scan, audit, verify, sync, web (daemon), and MCP command surfaces. No remote service is required for normal operation.",
    meta: "Runs on host · no network calls by default",
    status: "available",
  },
  {
    index: "02",
    role: "Dashboard",
    title: "Embedded loopback dashboard",
    icon: "globe",
    body: "The dashboard is a local web UI served by the Ledgerful daemon, bound to 127.0.0.1:52001 with an ephemeral session token. It is not accessible from the internet or other machines on your network.",
    meta: "Binds 127.0.0.1:52001 · ephemeral ?token= auth",
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
    body: "Signed and encrypted sync bundles are written to a directory you choose. You control the transport (a shared drive, a USB stick, or any other dir://-compatible path). Nothing broadcasts.",
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

function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 720 360"
      role="img"
      aria-labelledby="arch-diagram-title arch-diagram-desc"
      className="arch-diagram-frame"
    >
      <title id="arch-diagram-title">
        Three Ledgerful surfaces and the local-first boundary
      </title>
      <desc id="arch-diagram-desc">
        A host machine box containing the local CLI / engine and the
        loopback-bound embedded dashboard. The public marketing website sits
        outside the host. A future hosted control plane is shown as a dashed,
        planned node. The host and public web are separated by the local-first
        boundary; no traffic crosses by default.
      </desc>

      {/* ── Host machine box ─────────────────────────────── */}
      <rect
        x="24"
        y="28"
        width="500"
        height="304"
        rx="10"
        ry="10"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.2"
      />
      <text
        x="40"
        y="50"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.08em"
      >
        YOUR MACHINE
      </text>

      {/* ── Engine surface ───────────────────────────────── */}
      <rect
        x="44"
        y="68"
        width="220"
        height="110"
        rx="8"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <text
        x="60"
        y="92"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.06em"
      >
        SURFACE 01 · ENGINE
      </text>
      <text
        x="60"
        y="118"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="currentColor"
      >
        ledgerful CLI
      </text>
      <text
        x="60"
        y="142"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fill="currentColor"
        opacity="0.78"
      >
        scan · ledger · audit · verify · sync · mcp
      </text>
      <text
        x="60"
        y="162"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.65"
      >
        .ledgerful/  (keys, ledger, indexes)
      </text>

      {/* ── Dashboard surface ────────────────────────────── */}
      <rect
        x="284"
        y="68"
        width="220"
        height="110"
        rx="8"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <text
        x="300"
        y="92"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.06em"
      >
        SURFACE 02 · DASHBOARD
      </text>
      <text
        x="300"
        y="118"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="currentColor"
      >
        Embedded UI
      </text>
      <text
        x="300"
        y="142"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="12"
        fill="currentColor"
        opacity="0.78"
      >
        localhost:52001 · ?token= session
      </text>
      <text
        x="300"
        y="162"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.65"
      >
        loopback only · no external bind
      </text>

      {/* ── Boundary line ────────────────────────────────── */}
      <line
        x1="154"
        y1="178"
        x2="154"
        y2="218"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line
        x1="394"
        y1="178"
        x2="394"
        y2="218"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* ── Local-first data flow band ───────────────────── */}
      <rect
        x="44"
        y="218"
        width="460"
        height="64"
        rx="8"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      <text
        x="60"
        y="242"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.06em"
      >
        LOCAL-FIRST BOUNDARY
      </text>
      <text
        x="60"
        y="262"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="13"
        fill="currentColor"
      >
        source code · diffs · keys · ledger · audit
      </text>
      <text
        x="60"
        y="276"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="11"
        fill="currentColor"
        opacity="0.65"
      >
        all on host · no upload by default · telemetry is opt-in
      </text>

      {/* ── Public web box (outside host) ────────────────── */}
      <rect
        x="560"
        y="68"
        width="136"
        height="110"
        rx="8"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <text
        x="574"
        y="92"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.7"
        letterSpacing="0.06em"
      >
        SURFACE 03 · PUBLIC WEB
      </text>
      <text
        x="574"
        y="120"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="15"
        fontWeight="700"
        fill="currentColor"
      >
        ledgerful.dev
      </text>
      <text
        x="574"
        y="140"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="11"
        fill="currentColor"
        opacity="0.78"
      >
        static · docs · pricing
      </text>
      <text
        x="574"
        y="156"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="11"
        fill="currentColor"
        opacity="0.78"
      >
        no hosted auth
      </text>

      {/* ── Boundary separator (gap between host and web) ── */}
      <line
        x1="524"
        y1="40"
        x2="524"
        y2="320"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeDasharray="2 4"
      />

      {/* ── Hosted control plane (planned) ───────────────── */}
      <rect
        x="560"
        y="218"
        width="136"
        height="64"
        rx="8"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeDasharray="5 4"
      />
      <text
        x="574"
        y="240"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.55"
        letterSpacing="0.06em"
      >
        PLANNED · NOT LIVE
      </text>
      <text
        x="574"
        y="262"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="13"
        fontWeight="700"
        fill="currentColor"
        opacity="0.75"
      >
        Hosted control plane
      </text>
      <text
        x="574"
        y="276"
        fontFamily="var(--font-archivo), sans-serif"
        fontSize="10"
        fill="currentColor"
        opacity="0.55"
      >
        tenancy · audit · identity
      </text>
    </svg>
  );
}

export default function ArchitecturePage() {
  return (
    <PageShell>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Architecture</p>
        <h1>Three surfaces. One local-first boundary.</h1>
        <p>
          Ledgerful separates the local engine, the loopback dashboard, and
          the public web so the local-first promise stays verifiable on the
          box. A hosted control plane is planned and explicitly marked.
        </p>
      </section>

      {/* ── Diagram ────────────────────────────────────────── */}
      <section className="content-band" id="diagram">
        <SectionHeading title="Surfaces and the local-first boundary">
          The host runs the engine and dashboard. The public web is static and
          does not host a control plane. The hosted mode is planned and is
          shown dashed.
        </SectionHeading>
        <figure className="arch-diagram" aria-label="Three Ledgerful surfaces diagram">
          <ArchitectureDiagram />
          <figcaption className="arch-diagram-caption">
            Nothing inside the host machine box uploads by default. The
            dashboard binds to <code>127.0.0.1</code> only. Telemetry is
            opt-in. The public web is a static site; the hosted control plane
            shown dashed is planned, not live.
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
          ledger, audit, verify, sync, dashboard, and export stay local; cloud
          model context and aggregate telemetry are separate configured paths.
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
              rejected. Every dashboard session requires an ephemeral session
              token passed via <code>?token=&lt;hex&gt;</code> or{" "}
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
              <code>%USERPROFILE%\.ledgerful\keys\</code>). The SOC2 evidence
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
            outbound network inventory, signing model, SOC2 export layout,
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
