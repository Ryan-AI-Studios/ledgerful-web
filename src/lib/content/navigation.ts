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
  { href: "/#pillars", label: "Product" },
  { href: "/architecture", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/editions", label: "Editions" },
  { href: "/trust", label: "Trust" },
];

// Home and Install are rendered in the footer but not in the header nav
// (the brand logo is the Home link; Install is a standalone CTA in the
// header).
export const footerOnlyNavigation = [
  { href: "/", label: "Home" },
  { href: "/install", label: "Install" },
];

export const footerNavigation = [
  { href: "/changelog", label: "Changelog" },
  { href: "/ledger", label: "Public ledger" },
];

export const publicNavigation = [...mainNavigation, ...footerNavigation];

export const pageDescriptions = {
  home: "Ledgerful runs on your machine to analyze repo changes, record signed provenance, plan verification, and export audit evidence without uploading source code by default.",
  install:
    "Install the Ledgerful CLI with Homebrew, Scoop, cargo binstall, a one-line release installer, or a Cargo source build. winget is planned. Verify the binary and run your first scan.",
  architecture:
    "What Ledgerful reads, analyzes, and produces entirely on your machine, then the three Ledgerful surfaces: local engine and CLI, embedded loopback dashboard, public web, and the planned hosted control plane. Local-first data flow, opt-in telemetry.",
  docs: "Install, verify, and operate Ledgerful without confusing local tooling with hosted features.",
  pricing: "Ledgerful editions with explicit available, beta, and planned states.",
  trust: "Local-first data flow, telemetry, sync, SOC 2-style export, and future hosted boundaries.",
  changelog: "Public web, local engine, dashboard, and hosted-control-plane milestones.",
  waitlist: "Get launch announcements and changelog updates from Ledgerful. Double opt-in, no purchase required.",
  docsCli:
    "Install the Ledgerful CLI with Homebrew, Scoop, cargo binstall, or a Cargo source build, then run your first scan.",
  docsDashboard: "Launch the local daemon, open the dashboard, and understand token security.",
  docsMcp: "Configure the Ledgerful MCP stdio server for AI assistant integration.",
  docsGithubAction: "Add Ledgerful risk comments to GitHub pull requests with the GitHub Action.",
  docsCompliance: "Export local SOC 2-style evidence as a signed ZIP from the Ledgerful dashboard.",
  docsSync: "Set up local team sync with signed, encrypted bundles over a dir:// transport.",
  docsReleases: "Verify Ledgerful release checksums and run the local health report.",
  docsSoc2Mapping:
    "A draft mapping of Ledgerful's framework-agnostic evidence to named SOC 2 controls. Draft — pending design-partner validation. Not a certification or compliance attestation.",
  docsPolicyCheck:
    "Run ledgerful policy check to gate merges on declared named rules. Offline evaluation, base-branch policy in CI, JSON machine contract — not a compliance certificate.",
  ledger:
    "Ledgerful's development change ledger, published as a redacted, signed, and verifiable sample. Verify Ed25519 signatures in the browser.",
};
