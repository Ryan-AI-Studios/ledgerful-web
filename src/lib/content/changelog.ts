export type ChangelogEntry = {
  date: string;
  area: "Public web" | "Local engine" | "Dashboard app" | "Hosted control plane";
  title: string;
  state: "completed" | "in progress" | "planned";
  details: string;
};

export const changelogEntries: ChangelogEntry[] = [
  {
    date: "2026-07-21",
    area: "Public web",
    title: "Golden-path proof loop page",
    state: "completed",
    details:
      "New /docs/golden-path: self-guided install → demo --keep → CRYPTO VALID → openable DEMO evidence zip. Two clocks (T_proof vs T_first) pinned from engine measurements, DEMO/observe/disposable-key honesty, skeptic checklist, commercial request CTA, public ledger as post-success only.",
  },
  {
    date: "2026-07-19",
    area: "Public web",
    title: "Policy as code (CI gates) documented",
    state: "completed",
    details:
      "Trust section and /docs/policy-check for ledgerful policy check: named rules, base-branch CI constraint, permissions model, and honest-limit language (declared rules over the presented ledger — not certification).",
  },
  {
    date: "2026-06-26",
    area: "Public web",
    title: "Public site baseline",
    state: "in progress",
    details:
      "Initial marketing, docs, pricing, trust, changelog, SEO, and verification baseline for this repo.",
  },
  {
    date: "2026-06-25",
    area: "Local engine",
    title: "Commercial roadmap snapshot",
    state: "completed",
    details:
      "Roadmap confirms the local engine, CLI, daemon APIs, local SOC 2-style export, MCP path, GitHub Action path, and team sync foundation.",
  },
  {
    date: "2026-06-25",
    area: "Dashboard app",
    title: "Embedded dashboard remains separate",
    state: "completed",
    details:
      "The dashboard app remains a static export embedded in the local binary and does not define this public site's runtime.",
  },
  {
    date: "Planned",
    area: "Hosted control plane",
    title: "Vercel + Supabase control-plane spike",
    state: "planned",
    details:
      "Hosted tenancy, GitHub App webhooks, billing, SSO, SCIM, RBAC, and hosted audit logs are future control-plane work.",
  },
];
