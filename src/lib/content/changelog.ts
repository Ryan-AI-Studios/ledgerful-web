export type ChangelogEntry = {
  date: string;
  area: "Public web" | "Local engine" | "Dashboard app" | "Hosted control plane";
  title: string;
  state: "completed" | "in progress" | "planned";
  details: string;
  /** Stable permalink fragment: date + slugified title (0097 Atom feed). */
  slug: string;
};

/** Deterministic slug: date + slugified title (lowercase, non-alnum → `-`). */
export function changelogSlug(date: string, title: string): string {
  const datePart = date
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const titlePart = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${datePart}-${titlePart}`;
}

const rawEntries: Omit<ChangelogEntry, "slug">[] = [
  {
    date: "2026-07-29",
    area: "Public web",
    title: "Claim currency: v0.2.3 and public Action",
    state: "completed",
    details:
      "Present-tense site claims refreshed to engine v0.2.3 and npm @ledgerful/mcp-server 0.1.12 (engine pin v0.2.3). GitHub Action docs corrected to the public Ryan-AI-Studios/ledgerful-action install path with pin honesty. Live launch-truth gate now distinguishes drift (exit 1) from transport UNVERIFIED (exit 2) and runs on weekday schedule + dispatch + main push.",
  },
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

export const changelogEntries: ChangelogEntry[] = rawEntries.map((entry) => ({
  ...entry,
  slug: changelogSlug(entry.date, entry.title),
}));

const slugSet = new Set(changelogEntries.map((e) => e.slug));
if (slugSet.size !== changelogEntries.length) {
  throw new Error("changelogEntries: duplicate slug derived from date+title");
}
