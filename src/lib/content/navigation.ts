export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.ledgerful.dev";

// Shared fallback OG/Twitter image for routes with no dedicated static OG
// asset of their own (changelog, docs index, docs/*). Next.js metadata
// merging replaces, rather than deep-merges, a route's own `openGraph`
// object against its parent, so any route that declares `openGraph` at all
// must repeat `images` explicitly to keep this shared image in place.
export const homeOgImage = {
  url: "/og/home.png",
  width: 1200,
  height: 630,
  alt: "Ledgerful - understand code change risk before it ships, runs locally on your code. Real local dashboard showing Project Health and Recent Changes beside the source-install command.",
};

export const mainNavigation = [
  { href: "/", label: "Home" },
  { href: "/install", label: "Install" },
  { href: "/architecture", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust" },
];

export const footerNavigation = [{ href: "/changelog", label: "Changelog" }];

export const publicNavigation = [...mainNavigation, ...footerNavigation];

export const pageDescriptions = {
  home: "Ledgerful runs on your machine to analyze repo changes, record signed provenance, plan verification, and export audit evidence without uploading source code by default.",
  install:
    "Install the Ledgerful CLI from a pre-built v0.1.8 release binary or build from source. Verify the binary and run your first scan.",
  architecture:
    "What Ledgerful reads, analyzes, and produces entirely on your machine, then the three Ledgerful surfaces: local engine and CLI, embedded loopback dashboard, public web, and the planned hosted control plane. Local-first data flow, opt-in telemetry.",
  docs: "Install, verify, and operate Ledgerful without confusing local tooling with hosted features.",
  pricing: "Ledgerful editions with explicit available, beta, local-only, hosted planned, and enterprise planned states.",
  trust: "Local-first data flow, telemetry, sync, SOC 2-style export, and future hosted boundaries.",
  changelog: "Public web, local engine, dashboard, and hosted-control-plane milestones.",
  waitlist: "Get launch announcements and changelog updates from Ledgerful. Double opt-in, no purchase required.",
  docsCli: "Install the Ledgerful CLI from source and run your first scan.",
  docsDashboard: "Launch the local daemon, open the dashboard, and understand token security.",
  docsMcp: "Configure the Ledgerful MCP stdio server for AI assistant integration.",
  docsGithubAction: "Add Ledgerful risk comments to GitHub pull requests with the GitHub Action.",
  docsCompliance: "Export local SOC 2-style evidence as a signed ZIP from the Ledgerful dashboard.",
  docsSync: "Set up local team sync with signed, encrypted bundles over a dir:// transport.",
  docsReleases: "Verify Ledgerful release checksums and run the local health report.",
};
