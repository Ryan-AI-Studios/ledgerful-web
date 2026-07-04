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
    },
    hostedControlPlane: {
      label: "Hosted control plane",
      status: "planned",
      value: "Future Vercel + Supabase baseline",
      note: "Hosted tenancy, billing, webhooks, and identity are not in this repo.",
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
