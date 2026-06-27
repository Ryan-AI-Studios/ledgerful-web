import type { Metadata } from "next";
import { Cloud, HardDrive, RadioTower, Shield } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { pageDescriptions } from "@/lib/content/navigation";
import {
  networkOutbound,
  plannedSubprocessors,
  readsLocally,
  releaseVerificationSteps,
  soc2ExportLayout,
  telemetrySchema,
  trustDataFlows,
  writesLocally,
} from "@/lib/content/trust";

export const metadata: Metadata = {
  title: "Trust and Security",
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

      {/* ── Section 1: Data flow ─────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Data flow">
          Four modes describe how data moves in Ledgerful. The default mode
          uploads nothing. Source code is never uploaded by default.
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
      </section>

      {/* ── Section 2: Outbound network activity ─────────────── */}
      <section className="content-band">
        <SectionHeading title="Outbound network activity">
          A complete inventory of what the Ledgerful CLI sends over the network,
          and when. Security reviewers should find the answer to both common
          questions here.
        </SectionHeading>
        <div className="network-inventory">
          <article>
            <h3>Update checks</h3>
            <p>{networkOutbound.updateChecks}</p>
          </article>
          <article>
            <h3>Crash reporting</h3>
            <p>{networkOutbound.crashReporting}</p>
          </article>
        </div>
      </section>

      {/* ── Section 3: Reads and writes ──────────────────────── */}
      <section className="content-band">
        <SectionHeading title="What stays on your machine">
          All reads and writes are local. Source code is never uploaded as part
          of normal operation. The engine does not exfiltrate project data.
        </SectionHeading>
        <div className="trust-dl-grid">
          <div>
            <h3>What Ledgerful reads</h3>
            <ul>
              {readsLocally.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>What Ledgerful writes</h3>
            <ul>
              {writesLocally.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Section 4: Daemon access ──────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Dashboard and token security">
          The local dashboard is loopback-only. It is not accessible from the
          internet or from other machines on your network.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Bind address:</strong> The daemon binds exclusively to{" "}
            <code>http://127.0.0.1:52001</code>. CORS is restricted to{" "}
            <code>localhost</code> and <code>127.0.0.1</code> on any port —
            cross-origin requests from remote or hosted domains are rejected.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Token authentication:</strong> Every dashboard session
            requires an ephemeral session token passed via{" "}
            <code>?token=&lt;hex&gt;</code> in the query string or{" "}
            <code>Authorization: Bearer &lt;hex&gt;</code> in the request
            header. Tokens are validated using constant-time comparison to
            prevent timing attacks.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Token entropy:</strong> Tokens are 256-bit cryptographically
            random values (32 bytes via{" "}
            <code>rand::thread_rng().fill_bytes</code>, seeded from OS entropy),
            hex-encoded to 64 characters. Entropy is sufficient to make
            loopback brute-force attacks infeasible.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Token safety rules:</strong> Tokens are per-session and
            never persisted to disk by the daemon. Tokens must not appear in
            browser logs, screenshot-based bug reports, or documentation
            examples. If a token is accidentally exposed, restart the daemon to
            generate a new one.
          </p>
        </div>
      </section>

      {/* ── Section 5: Cryptographic signing ─────────────────── */}
      <section className="content-band">
        <SectionHeading title="Signing and key management">
          Ledgerful uses Ed25519 signing to provide tamper-evident ledger
          provenance and offline-verifiable SOC2 evidence.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Key generation:</strong> An Ed25519 key pair is generated on
            first use via <code>OsRng</code> (OS-level entropy). The signing
            key and verifying key are stored as hex-encoded files at{" "}
            <code>~/.changeguard/keys/private.pem</code> and{" "}
            <code>~/.changeguard/keys/public.pem</code> (Windows:{" "}
            <code>%USERPROFILE%\.changeguard\keys\</code>). No remote key
            management is required by default.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Key storage at rest:</strong> Private keys are stored as
            plain hex files protected only by filesystem permissions. A local
            machine compromise — such as malware or a stolen laptop without Full
            Disk Encryption — could allow an attacker to extract the private key
            and forge signed ledger entries.{" "}
            <strong>
              Full Disk Encryption (FDE) is the primary recommended mitigation
              for local key security.
            </strong>{" "}
            Hardware-backed key storage (TPM, Secure Enclave) and hosted KMS
            are enterprise-planned features for a future control plane.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Sync bundles:</strong> When local sync is enabled,
            Ledgerful signs and encrypts bundles before writing them to the sync
            directory. Bundle contents are not readable without the encryption
            key.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>SOC2 export signing:</strong> Each SOC2 evidence ZIP
            includes <code>manifest.sig</code> (64-byte Ed25519 signature over{" "}
            <code>manifest.json</code>) and <code>manifest.pub</code> (32-byte
            verifying key). This allows offline tamper verification without
            trusting a remote key server.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Key rotation and enterprise features:</strong> Key rotation
            is local and manual. Hardware-backed key storage, hosted KMS, and
            device trust management are enterprise-planned and require a future
            control plane. SSO / SAML / OIDC, SCIM, and RBAC are also
            enterprise-planned — none of these are implemented in the local
            daemon.
          </p>
        </div>
      </section>

      {/* ── Section 6: SOC2 evidence export ──────────────────── */}
      <section className="content-band">
        <SectionHeading title="Local evidence export">
          The SOC2 evidence export is a ZIP file generated entirely from local
          data. This is not a hosted SOC2 portal — no data leaves your machine
          during export.
        </SectionHeading>
        <div className="disclosure-notice" style={{ marginBottom: "24px" }}>
          <strong>Scope:</strong> This is a local ZIP export only. A hosted
          SOC2 portal (with continuous monitoring, auditor access controls, and
          live attestation) is enterprise-planned and requires a future hosted
          control plane.
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
        <div style={{ overflowX: "auto", marginBottom: "28px" }}>
          <table className="trust-table" aria-label="SOC2 export ZIP file layout">
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
        <ol
          style={{
            display: "grid",
            gap: "10px",
            margin: 0,
            paddingLeft: "1.4em",
            color: "var(--muted)",
            fontSize: "0.9rem",
            lineHeight: "1.65",
          }}
        >
          <li>
            For each entry in <code>manifest.json</code>&apos;s{" "}
            <code>files</code> array, re-compute SHA-256 over the corresponding
            file&apos;s bytes from the ZIP and compare to the stored hash. A
            mismatch means the file was altered after the manifest was
            generated.
          </li>
          <li>
            Read <code>manifest.sig</code> (64 raw bytes) and{" "}
            <code>manifest.pub</code> (32 raw bytes). Verify the Ed25519
            signature over <code>manifest.json</code> bytes. A mismatch means
            the manifest itself was replaced.
          </li>
          <li>
            Both checks must pass for the export to be considered unmodified. A
            failure in step 1 indicates file tampering; a failure in step 2
            indicates manifest replacement.
          </li>
        </ol>
      </section>

      {/* ── Section 7: Release verification ──────────────────── */}
      <section className="content-band">
        <SectionHeading title="Release verification">
          Every Ledgerful release ships SHA-256 checksum files alongside binary
          archives. Verify the checksum before running the binary.
        </SectionHeading>
        <div className="disclosure-notice" style={{ marginBottom: "24px" }}>
          <strong>Note:</strong> Specific release download URLs are a WEB-0005
          launch fact. They will be published when releases are smoke-tested and
          publicly documented. The steps below describe the verification process
          that will apply once URLs are available.
        </div>
        <ol
          style={{
            display: "grid",
            gap: "12px",
            margin: 0,
            paddingLeft: "1.4em",
            color: "var(--muted)",
            fontSize: "0.9rem",
            lineHeight: "1.65",
          }}
        >
          {releaseVerificationSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <strong>OS code signing status:</strong> Windows Authenticode signing
          and macOS Developer ID / Gatekeeper notarization are not yet
          implemented. Binaries may trigger OS security prompts on first launch.
          Code signing for both platforms and SLSA provenance attestations are
          planned enhancements for a future release.
        </div>
      </section>

      {/* ── Section 8: Telemetry ──────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Telemetry">
          Usage telemetry is opt-in. It is disabled by default and must be
          explicitly enabled.
        </SectionHeading>
        <div className="disclosure-notice" style={{ marginBottom: "24px" }}>
          <strong>Opt-in only:</strong> Enable via{" "}
          <code>ledgerful usage</code> or by setting{" "}
          <code>[telemetry].enabled = true</code> in{" "}
          <code>config.toml</code>. Telemetry is never activated without
          explicit user action. Source code, file content, diff text, and commit
          messages are never sent — only structured usage events are transmitted.
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.9rem",
            marginBottom: "16px",
          }}
        >
          Ingest endpoint:{" "}
          <code>
            https://scmxtnjqqklvcwyeouvj.supabase.co/functions/v1/telemetry-ingest
          </code>
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="trust-table" aria-label="Telemetry fields sent when opt-in is enabled">
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
          Source code, file content, diff text, commit messages, and author
          identities are never sent.
        </p>
      </section>

      {/* ── Section 9: Responsible disclosure ────────────────── */}
      <section className="content-band">
        <SectionHeading title="Responsible disclosure">
          A responsible disclosure channel will be published when the public
          launch infrastructure is in place. Disclosure details are an
          unresolved launch fact.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Channel status:</strong> The responsible disclosure channel
            is not yet published. Do not send vulnerability reports to general
            contact addresses or public issue trackers. When the channel is
            published, an encrypted submission path (PGP public key) will be
            provided so vulnerability researchers can submit reports
            confidentially.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Forward note:</strong> A verified security contact and
            encrypted submission path (PGP key) will be published before public
            launch. Check this page for the current disclosure channel status.
          </p>
        </div>
      </section>

      {/* ── Section 10: Subprocessors ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Subprocessors">
          Local mode uses no subprocessors by default. Opt-in telemetry sends
          usage events to Supabase only when explicitly enabled. Hosted mode is
          planned and will introduce additional subprocessors.
        </SectionHeading>
        <div className="disclosure-notice" style={{ marginBottom: "24px" }}>
          <strong>Local mode:</strong> Zero subprocessors. The Ledgerful engine,
          ledger, dashboard, and SOC2 export all operate on your machine without
          sending data to any third-party service. The opt-in telemetry endpoint
          (Supabase) is the only exception, and only when you explicitly enable
          telemetry.
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.9rem",
            marginBottom: "16px",
          }}
        >
          Subprocessors by scope and status:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table
            className="trust-table"
            aria-label="Planned subprocessors for hosted mode"
          >
            <thead>
              <tr>
                <th scope="col">Subprocessor</th>
                <th scope="col">Purpose</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {plannedSubprocessors.map((sp) => (
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
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.85rem",
            marginTop: "16px",
          }}
        >
          Data deletion policies and data processing agreements will be defined
          when hosted mode launches. No subprocessor contract applies to
          local-only installs.
        </p>
      </section>
    </PageShell>
  );
}
