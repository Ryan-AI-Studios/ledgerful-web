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
  verifiedAt: "2026-07-03",
  sources: {
    engine: "C:\\dev\\ledgerful",
    anonymousGitHub: "https://api.github.com/repos/Ryan-AI-Studios/Ledgerful",
    anonymousNpm:
      "https://registry.npmjs.org/@ledgerful%2fmcp-server/latest",
  },
  facts: {
    disclosure: {
      label: "Responsible disclosure channel",
      status: "unresolved",
      value: "Private channel not yet verified",
      note: "security@ledgerful.dev is documented but pending activation. GitHub private vulnerability reporting is not anonymously reachable while the repository is private, and no PGP key is published.",
      email: "security@ledgerful.dev",
      emailVerified: false,
      pgpPublished: false,
    },
    repository: {
      label: "Canonical GitHub repository",
      status: "unresolved",
      value: "Private preview",
      note: "The canonical repository exists locally, but anonymous HTTPS, GitHub API, and raw-file checks returned no public access on 2026-07-03. Source-install commands require authorized access.",
      href: repositoryUrl,
      apiUrl: "https://api.github.com/repos/Ryan-AI-Studios/Ledgerful",
      anonymousAccess: false,
    },
    statusPage: {
      label: "Status page",
      status: "unresolved",
      value: "Not published",
      note: "Do not link status.ledgerful.dev until the status surface exists.",
    },
    license: {
      label: "Draft source-license terms",
      status: "unresolved",
      value: "Pending legal review and license-in-force",
      note: "The Ledgerful source repository (not this web repo) contains draft PolyForm Noncommercial 1.0.0 terms plus the Ledgerful Small-Entity Commercial Exception v1.0. The intended exception would permit qualifying entities under US$1M aggregated gross revenue to use Ledgerful internally, but LLC formation, IP assignment, counsel review, and license-in-force remain open launch gates.",
      base: "PolyForm Noncommercial License 1.0.0",
      exception: "Ledgerful Small-Entity Commercial Exception v1.0",
      legalLaunchReviewComplete: false,
    },
    mcpPackage: {
      label: "MCP npm package",
      status: "unresolved",
      value: "Not published",
      note: "@ledgerful/mcp-server exists in source at version 0.1.6, but the anonymous npm registry returned 404 on 2026-07-03. npx and npm install instructions are not actionable yet.",
      name: "@ledgerful/mcp-server",
      version: "0.1.6",
      registryUrl:
        "https://registry.npmjs.org/@ledgerful%2fmcp-server/latest",
      publiclyAvailable: false,
    },
    release: {
      label: "Release downloads and checksums",
      status: "unresolved",
      value: "No anonymous public release",
      note: "The engine records v0.1.6 as its latest tag and the release workflow defines binary archives with SHA-256 companions, but GitHub exposes no anonymous release or assets while the repository is private. The local source version is 0.1.7.",
      tag: "v0.1.6",
      localSourceVersion: "0.1.7",
      apiUrl:
        "https://api.github.com/repos/Ryan-AI-Studios/Ledgerful/releases/latest",
      publiclyAvailable: false,
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
      value: "Source path exists; public install unavailable",
      note: "action/action.yml and its bundled runtime exist in the private source repository. Anonymous raw-file access returned 404, so no public GitHub Actions install reference is supported yet.",
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
      status: "planned",
      value: "SBOM, cosign signing, SLSA provenance planned (0053)",
      note: "Track 0053-SupplyChainAttestation will add per-release CycloneDX SBOM, cosign keyless signing, SLSA build-provenance attestation, SBOM attestation, and cargo-auditable dependency embedding to the release pipeline. The SBOM and cosign signing phases will be available on the private repo once the pipeline ships; GitHub artifact attestations require a public or Enterprise-Cloud repository and will activate at the 0027 public flip. Two honest SBOM gaps: the cozo git-dependency has no registry coordinate (not automatically CVE-matched), and bundled native SQLite is not enumerated as its own component.",
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
