export type LaunchFactStatus = "resolved" | "unresolved" | "planned";

export type LaunchFact = {
  id: keyof typeof launchTruth.facts;
  label: string;
  status: LaunchFactStatus;
  value: string;
  note: string;
  href?: string;
};

const repositoryUrl = "https://github.com/Ryan-AI-Studios/Ledgerful";

/**
 * Reviewed launch facts for every public surface.
 *
 * This is intentionally checked-in data. scripts/check-launch-truth.mjs detects
 * publication drift, but a human must review and update the copy before a new
 * release, package, or repository state becomes a public claim.
 */
export const launchTruth = {
  schemaVersion: 1,
  verifiedAt: "2026-07-12",
  sources: {
    engine: "C:\\dev\\ledgerful",
    anonymousGitHub: "https://api.github.com/repos/Ryan-AI-Studios/Ledgerful",
    anonymousNpm:
      "https://registry.npmjs.org/@ledgerful%2fmcp-server/latest",
  },
  facts: {
    disclosure: {
      label: "Responsible disclosure channel",
      status: "resolved",
      value: "security@ledgerful.dev is active",
      note: "The security@ledgerful.dev mailbox is provisioned and the engine repository is public with a SECURITY.md policy. GitHub private vulnerability reporting is available on the public repository. No PGP key is published yet; reports are accepted via email or GitHub's private vulnerability reporting.",
      email: "security@ledgerful.dev",
      emailVerified: true,
      pgpPublished: false,
    },
    repository: {
      label: "Canonical GitHub repository",
      status: "resolved",
      value: "Public",
      note: "The canonical repository is publicly accessible at github.com/Ryan-AI-Studios/Ledgerful. Anonymous HTTPS, GitHub API, and raw-file access are all confirmed. Source-install commands are actionable.",
      href: repositoryUrl,
      apiUrl: "https://api.github.com/repos/Ryan-AI-Studios/Ledgerful",
      anonymousAccess: true,
    },
    statusPage: {
      label: "Status page",
      status: "planned",
      value: "Deferred to hosted services",
      note: "Decision 2026-07-13: no public status page at v1 (Option B). A local-first tool with no hosted control plane has no uptime to report. Deferred until the hosted control plane (CP-0/CP-1) ships; do not link status.ledgerful.dev until a real status surface exists.",
    },
    license: {
      label: "Source-available license terms",
      status: "resolved",
      value: "In force",
      note: "Ledgerful (the engine and dashboard) is source-available under the PolyForm Noncommercial License 1.0.0 plus the Ledgerful Small-Entity Commercial Exception v1.0, which permits qualifying entities under US$1M aggregated gross revenue to use Ledgerful internally at no charge. The license is in force: Ledgerful, LLC formed (FL, effective 2026-07-01, doc L26000356073); individual→LLC IP assignment executed; COMMERCIAL-EXCEPTION.md counsel-reviewed; FL + USPTO trademark search clear. This web repository is separate and proprietary (all rights reserved, no license granted).",
      base: "PolyForm Noncommercial License 1.0.0",
      exception: "Ledgerful Small-Entity Commercial Exception v1.0",
      legalLaunchReviewComplete: true,
    },
    mcpPackage: {
      label: "MCP npm package",
      status: "resolved",
      value: "Published on npm",
      note: "@ledgerful/mcp-server is published on the public npm registry at version 0.1.10. It downloads the prebuilt binary from the v0.1.8 GitHub release. npx and npm install instructions are actionable.",
      name: "@ledgerful/mcp-server",
      version: "0.1.10",
      registryUrl:
        "https://registry.npmjs.org/@ledgerful%2fmcp-server/latest",
      publiclyAvailable: true,
    },
    release: {
      label: "Release downloads and checksums",
      status: "resolved",
      value: "v0.1.8 with SHA-256 checksums, SBOM, and cosign signing",
      note: "The v0.1.8 release is publicly available on GitHub with binary archives for 4 platforms, SHA-256 checksums for each, CycloneDX SBOM (engine + MCP), cosign keyless signing (Sigstore Fulcio), SLSA build-provenance attestation, SBOM attestation, and cargo-auditable dependency embedding.",
      tag: "v0.1.8",
      localSourceVersion: "0.1.8",
      apiUrl:
        "https://api.github.com/repos/Ryan-AI-Studios/Ledgerful/releases/latest",
      publiclyAvailable: true,
      requiredAssets: [
        "ledgerful-x86_64-unknown-linux-gnu.tar.gz",
        "ledgerful-x86_64-unknown-linux-gnu.tar.gz.sha256",
        "ledgerful-x86_64-pc-windows-msvc.zip",
        "ledgerful-x86_64-pc-windows-msvc.zip.sha256",
        "ledgerful-x86_64-apple-darwin.tar.gz",
        "ledgerful-x86_64-apple-darwin.tar.gz.sha256",
        "ledgerful-aarch64-apple-darwin.tar.gz",
        "ledgerful-aarch64-apple-darwin.tar.gz.sha256",
      ],
    },
    githubAction: {
      label: "GitHub Action install URL",
      status: "unresolved",
      value: "Not publicly installable",
      note: "The GitHub Action is a planned feature. No action.yml exists in the public repository yet. The workflow YAML on the docs page is a reference for the planned shape, not an installable action.",
      sourcePath: "action/action.yml",
      publiclyInstallable: false,
    },
    telemetry: {
      label: "Usage telemetry",
      status: "resolved",
      value: "Optional build feature; disabled by default",
      note: "Usage metrics are excluded from the default engine feature set. Builds that include usage-metrics still require an explicit ledgerful usage enable command before structured usage events can be sent.",
      feature: "usage-metrics",
      inDefaultBuild: false,
      enabledByDefault: false,
      enableCommand: "ledgerful usage enable",
      configPath: "~/.ledgerful/usage/config.toml",
      endpoint:
        "https://scmxtnjqqklvcwyeouvj.supabase.co/functions/v1/telemetry-ingest",
      payloadFields: [
        "schema_version",
        "anonymous_id",
        "client_version",
        "platform",
        "sent_at",
        "window_start",
        "window_end",
        "command_counts",
        "features_enabled",
        "active_days_in_window",
      ],
      ipRetention: "The connection IP is transiently visible to the ingestion endpoint but is scrubbed and never stored; stored telemetry contains no IP or PII.",
    },
    waitlistEsp: {
      label: "Waitlist email provider",
      status: "resolved",
      value: "Kit (double opt-in)",
      note: "The /waitlist form sends your email address to Kit (formerly ConvertKit) via a first-party server relay. Kit receives the email address, an opt-in timestamp, and a design_partner custom field (set to \"true\" only if you check the design-partner box). No name, source code, or project data is sent. Double opt-in is mandatory: adding you to a double opt-in form triggers a confirmation email, and you must confirm from your inbox before you are added. The Kit API key lives only in the server environment and never appears in the browser bundle. To request deletion, contact hello@ledgerful.dev with the subject \"Waitlist deletion request\" — your data will be removed from Kit within 5 business days.",
      provider: "Kit",
      providerUrl: "https://kit.com",
      doubleOptIn: true,
      dataReceived: ["email_address", "opt_in_timestamp", "design_partner (optional, only if checked)"],
      apiVersion: "v4",
      apiBaseUrl: "https://api.kit.com/v4",
      keyLocation: "server environment only (never client bundle)",
    },
    hostedControlPlane: {
      label: "Hosted control plane",
      status: "planned",
      value: "Future Vercel + Supabase baseline",
      note: "Hosted tenancy, billing, webhooks, and identity are not in this repo.",
    },
    supplyChainAttestation: {
      label: "Supply chain attestation",
      status: "resolved",
      value: "SBOM, cosign signing, SLSA provenance shipped with v0.1.8",
      note: "The v0.1.8 release ships CycloneDX SBOM (engine + MCP), cosign keyless signing (Sigstore Fulcio, GitHub OIDC), SLSA build-provenance attestation (actions/attest), SBOM attestation (actions/attest-sbom), and cargo-auditable dependency embedding. Two honest SBOM gaps: the cozo git-dependency has no registry coordinate (not automatically CVE-matched), and bundled native SQLite is not enumerated as its own component.",
      components: [
        "CycloneDX SBOM (engine --all-features + MCP npm)",
        "cosign keyless signing (Sigstore Fulcio, GitHub OIDC)",
        "SLSA build-provenance attestation (actions/attest)",
        "SBOM attestation (actions/attest-sbom)",
        "cargo auditable dep embedding",
      ],
      publicRepoRequired: true,
      track: "0053-SupplyChainAttestation",
    },
  },
} as const;

export const launchFacts: LaunchFact[] = Object.entries(
  launchTruth.facts,
).map(([id, fact]) => ({
  id: id as keyof typeof launchTruth.facts,
  label: fact.label,
  status: fact.status,
  value: fact.value,
  note: fact.note,
  href: "href" in fact ? fact.href : undefined,
}));
