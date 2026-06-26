export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.ledgerful.dev";

export const mainNavigation = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust" },
  { href: "/changelog", label: "Changelog" },
];

export const pageDescriptions = {
  home: "Ledgerful is local-first change intelligence and provenance for programming teams.",
  docs: "Install, verify, and operate Ledgerful without confusing local tooling with hosted features.",
  pricing: "Ledgerful editions with explicit available, beta, local-only, hosted planned, and enterprise planned states.",
  trust: "Local-first data flow, telemetry, sync, SOC2 export, and future hosted boundaries.",
  changelog: "Public web, local engine, dashboard, and hosted-control-plane milestones.",
};
