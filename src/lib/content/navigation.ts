export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.ledgerful.dev";

export const mainNavigation = [
  { href: "/", label: "Home" },
  { href: "/install", label: "Install" },
  { href: "/architecture", label: "Architecture" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust" },
  { href: "/changelog", label: "Changelog" },
];

export const pageDescriptions = {
  home: "Ledgerful runs on your machine to analyze repo changes, record signed provenance, plan verification, and export audit evidence — without uploading source code by default.",
  install:
    "Install the Ledgerful CLI from source, verify the binary, and run your first scan. Pre-built release binaries are a launch fact and are not yet available.",
  architecture:
    "The three Ledgerful surfaces — local engine and CLI, embedded loopback dashboard, public web — and the planned hosted control plane. Local-first data flow, opt-in telemetry.",
  docs: "Install, verify, and operate Ledgerful without confusing local tooling with hosted features.",
  pricing: "Ledgerful editions with explicit available, beta, local-only, hosted planned, and enterprise planned states.",
  trust: "Local-first data flow, telemetry, sync, SOC2 export, and future hosted boundaries.",
  changelog: "Public web, local engine, dashboard, and hosted-control-plane milestones.",
  docsCli: "Install the Ledgerful CLI from source and run your first scan.",
  docsDashboard: "Launch the local daemon, open the dashboard, and understand token security.",
  docsMcp: "Configure the Ledgerful MCP stdio server for AI assistant integration.",
  docsGithubAction: "Add Ledgerful risk comments to GitHub pull requests with the GitHub Action.",
  docsCompliance: "Export local SOC2 evidence as a signed ZIP from the Ledgerful dashboard.",
  docsSync: "Set up local team sync with signed, encrypted bundles over a dir:// transport.",
  docsReleases: "Verify Ledgerful release checksums and generate a support bundle.",
};
