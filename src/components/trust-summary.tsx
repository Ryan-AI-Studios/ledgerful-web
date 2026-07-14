/**
 * Concise executive summary (1-screen target) for /trust.
 *
 * No new claims — every line restates something already in `trustDataFlows`,
 * `readsLocally` / `writesLocally`, `networkOutbound`, `telemetrySchema`, and
 * the launch-facts telemetry fact. Boundary answer first (default = local).
 *
 * Renders as a single contained card with a 2-col dl-style list; the whole
 * thing fits in roughly one viewport on a 1280×800 desktop and stacks
 * naturally on smaller widths.
 */
export function TrustSummary() {
  return (
    <aside className="trust-summary" aria-labelledby="trust-summary-title">
      <p className="trust-summary-kicker">Five-minute executive summary</p>
      <h2 id="trust-summary-title">
        The default stays on your machine. Two paths can cross the boundary —
        both are off unless you turn them on.
      </h2>
      <dl className="trust-summary-list">
        <div>
          <dt>Default boundary</dt>
          <dd>
            Local-first engine on your machine. Reads git state and project
            structure; writes ledger, reports, and an Ed25519 signing key to
            <code> .ledgerful/</code> and <code>~/.ledgerful/keys/</code>. No
            outbound network is required for scan, audit, ledger, verify,
            dashboard, or the local SOC 2-style evidence export.
          </dd>
        </div>
        <div>
          <dt>What reads / writes / uploads</dt>
          <dd>
            Reads: git history, project files, <code>.ledgerful/ledger.db</code>,
            config, and selected model settings. Writes: ledger, reports, and
            signing keys by default; sync bundles only in a sync-enabled build
            using local <code>dir://</code>. Uploads: none by default. See the
            boundary table below.
          </dd>
        </div>
        <div>
          <dt>Opt-in telemetry</dt>
          <dd>
            Excluded from the default build. A <code>usage-metrics</code> build
            sends a fixed aggregate JSON payload (command counts, platform,
            version, features, anonymous ID) to the documented Supabase
            ingest only after <code>ledgerful usage enable</code>. No source,
            paths, diff text, query text, or commit messages.
          </dd>
        </div>
        <div>
          <dt>Configured cloud-model egress</dt>
          <dd>
            The <code>ask</code> workflow can send sanitized, truncated impact
            and retrieved context to Gemini, Ollama Cloud, or OpenRouter only
            when a provider is configured and selected. API credentials may be
            read from the process environment or a repository-local{" "}
            <code>.env</code> file.
          </dd>
        </div>
        <div>
          <dt>Signing &amp; key storage</dt>
          <dd>
            Ed25519 key pair at <code>~/.ledgerful/keys/private.key</code>{" "}
            (Windows: <code>%USERPROFILE%\.ledgerful\keys\</code>). Each SOC 2-style
            evidence ZIP embeds a manifest hash, an Ed25519 signature, and a
            verifying key for offline tamper verification.
          </dd>
        </div>
        <div>
          <dt>Release verification</dt>
          <dd>
            The v0.1.8 release is publicly available with SHA-256 checksums
            for each binary archive. Supply chain attestation (SBOM, cosign
            signing, SLSA provenance) shipped with v0.1.8 — see the supply
            chain attestation section below. OS code signing (Windows
            Authenticode, macOS notarization) is planned.
          </dd>
        </div>
        <div>
          <dt>Where evidence export lives</dt>
          <dd>
            The local evidence export (manifest, signed ZIP, sample row
            preview) is published ungated further down this page — no form,
            no signup, no email gate.
          </dd>
        </div>
        <div>
          <dt>Subprocessors</dt>
          <dd>
            Vercel hosts the public marketing site only and does not process
            project data. Supabase (telemetry, opt-in) and the configured
            model provider are the only current product sub-processors. See
            the two clearly-separated lists below.
          </dd>
        </div>
      </dl>
      <p className="trust-summary-foot">
        Boundary answer first: <strong>local by default, opt-in by name</strong>.
        For the source of every claim above, see the changelog.
      </p>
    </aside>
  );
}
