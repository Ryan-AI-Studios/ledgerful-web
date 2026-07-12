import type { FeatureState } from "./features";
import { launchTruth, type LaunchFactStatus } from "./launch-facts";

export type EditionItem = {
  label: string;
  state: FeatureState;
  caveat?: string;
};

export type EditionCta = {
  label: string;
  href: string;
  note?: string;
};

export type Edition = {
  name: string;
  audience: string;
  price: string;
  state: FeatureState | Extract<LaunchFactStatus, "unresolved">;
  description: string;
  includes: EditionItem[];
  cta?: EditionCta;
};

export type MatrixCell = {
  state: FeatureState;
} | null;

// cells order: [Local, Commercial License, Hosted, Enterprise]
export type MatrixRow = {
  feature: string;
  caveat?: string;
  cells: [MatrixCell, MatrixCell, MatrixCell, MatrixCell];
};

export type MatrixGroup = {
  label: string;
  rows: MatrixRow[];
};

export type PricingFaqItem = {
  question: string;
  answer: string;
};

/**
 * One plain sentence establishing the free/paid/agreement boundary before
 * any card or matrix detail. Source: 0025-WebPricingReframe spec.md, adjudicated
 * by recommendation.md §4.4.
 */
export const pricingBoundaryStatement =
  "Free for individuals, noncommercial use, and small companies (under $1M revenue, internal use); paid for larger companies; resale, hosting, or OEM would require a separate agreement.";

/**
 * Local capabilities are identical across the Local and Commercial License
 * editions — the license only changes who is legally permitted to run the
 * same software, not which capabilities are technically available. Shared
 * here so the two cards and the matrix cannot drift out of sync.
 */
export const localCapabilities: EditionItem[] = [
  { label: "Local CLI and engine", state: "available" },
  { label: "Local dashboard", state: "local-only" },
  { label: "Signed ledger provenance", state: "available" },
  { label: "Manual SOC2 evidence ZIP", state: "local-only" },
  {
    label: "MCP stdio tools",
    state: "beta",
    caveat: "Public release smoke pending",
  },
  {
    label: "GitHub Action setup path",
    state: "beta",
    caveat: "Public install docs and release smoke pending",
  },
  {
    label: "Local team sync foundation",
    state: "beta",
    caveat: "Requires a build compiled with --features sync",
  },
];

export const editions: Edition[] = [
  {
    name: "Local",
    audience:
      "Individuals, noncommercial use, and small companies under $1M aggregate gross revenue (internal use)",
    price: "Free for qualifying use",
    state: "available",
    description:
      "Run the current local build under the in-force PolyForm Noncommercial License with the Small-Entity Commercial Exception.",
    includes: localCapabilities,
  },
  {
    name: "Commercial License",
    audience:
      "Companies at or above $1M aggregate gross revenue running Ledgerful internally",
    price: "Commercial license required",
    state: "available",
    description:
      "The same local-first CLI, dashboard, ledger, and evidence export as Local, under a commercial license. The base license is in force; commercial pricing is not yet announced.",
    includes: localCapabilities,
    cta: { label: "Review license terms", href: "/trust#license" },
  },
  {
    name: "Hosted",
    audience: "Managers who need cross-repo hosted visibility",
    price: "Pricing not announced",
    state: "hosted planned",
    description:
      "Planned hosted portfolio, GitHub App workflow, signed summary ingestion, billing, and retained audit state. Requires a future hosted control plane — no live feature claims until it ships.",
    includes: [
      { label: "Hosted portfolio dashboard", state: "hosted planned" },
      { label: "GitHub App", state: "hosted planned" },
      { label: "Hosted audit log", state: "hosted planned" },
      { label: "Billing portal", state: "hosted planned" },
    ],
    cta: {
      label: "Join the waitlist",
      href: "mailto:waitlist@ledgerful.dev?subject=Ledgerful%20Hosted%20waitlist",
      note: "Inbox is provisioned; delivery is verified.",
    },
  },
  {
    name: "Enterprise",
    audience: "Security-conscious and regulated organizations",
    price: "Pricing not announced",
    state: "enterprise planned",
    description:
      "Planned enterprise identity, audit export, retention controls, support SLA, and optional self-hosted control plane. Described as roadmap — never sold today.",
    includes: [
      { label: "SAML / OIDC SSO", state: "enterprise planned" },
      { label: "SCIM", state: "enterprise planned" },
      { label: "RBAC", state: "enterprise planned" },
      { label: "Custom retention and support SLA", state: "enterprise planned" },
    ],
    cta: {
      label: "Contact us",
      href: "mailto:hello@ledgerful.dev?subject=Ledgerful%20Enterprise%20inquiry",
      note: "Inbox is provisioned; delivery is verified.",
    },
  },
];

export const matrixEditionHeaders = [
  "Local",
  "Commercial License",
  "Hosted",
  "Enterprise",
] as const;

export const matrixGroups: MatrixGroup[] = [
  {
    label: "Core Engine",
    rows: [
      {
        feature: "Local CLI and engine",
        cells: [
          { state: "available" },
          { state: "available" },
          { state: "available" },
          { state: "available" },
        ],
      },
      {
        feature: "Local dashboard",
        cells: [
          { state: "local-only" },
          { state: "local-only" },
          { state: "local-only" },
          { state: "local-only" },
        ],
      },
      {
        feature: "Signed ledger provenance",
        cells: [
          { state: "available" },
          { state: "available" },
          { state: "available" },
          { state: "available" },
        ],
      },
      {
        feature: "SOC2 evidence ZIP export",
        cells: [
          { state: "local-only" },
          { state: "local-only" },
          { state: "local-only" },
          { state: "local-only" },
        ],
      },
    ],
  },
  {
    label: "Collaboration",
    rows: [
      {
        feature: "Local team sync (sync-enabled build)",
        cells: [
          { state: "local-only" },
          { state: "local-only" },
          { state: "local-only" },
          { state: "local-only" },
        ],
      },
      {
        feature: "Team signatures and devices",
        cells: [
          { state: "beta" },
          { state: "beta" },
          { state: "beta" },
          { state: "beta" },
        ],
      },
      {
        feature: "Portfolio reports",
        cells: [
          { state: "beta" },
          { state: "beta" },
          { state: "hosted planned" },
          { state: "hosted planned" },
        ],
      },
    ],
  },
  {
    label: "GitHub and Release",
    rows: [
      {
        feature: "MCP stdio tools",
        caveat: "Public release smoke pending",
        cells: [
          { state: "beta" },
          { state: "beta" },
          { state: "beta" },
          { state: "beta" },
        ],
      },
      {
        feature: "GitHub Action setup path",
        caveat: "Public install docs and release smoke pending",
        cells: [
          { state: "beta" },
          { state: "beta" },
          { state: "beta" },
          { state: "beta" },
        ],
      },
      {
        feature: "GitHub App",
        cells: [null, null, { state: "hosted planned" }, { state: "hosted planned" }],
      },
    ],
  },
  {
    label: "Hosted (planned)",
    rows: [
      {
        feature: "Hosted portfolio dashboard",
        cells: [null, null, { state: "hosted planned" }, { state: "hosted planned" }],
      },
      {
        feature: "Hosted audit log",
        cells: [null, null, { state: "hosted planned" }, { state: "hosted planned" }],
      },
      {
        feature: "Billing portal",
        cells: [null, null, { state: "hosted planned" }, { state: "hosted planned" }],
      },
    ],
  },
  {
    label: "Enterprise (planned)",
    rows: [
      {
        feature: "SAML / OIDC SSO",
        cells: [null, null, null, { state: "enterprise planned" }],
      },
      {
        feature: "SCIM",
        cells: [null, null, null, { state: "enterprise planned" }],
      },
      {
        feature: "RBAC",
        cells: [null, null, null, { state: "enterprise planned" }],
      },
      {
        feature: "Custom retention and support SLA",
        cells: [null, null, null, { state: "enterprise planned" }],
      },
    ],
  },
];

export const pricingFootnotes: string[] = [
  `${launchTruth.facts.license.note} No paid commercial price is announced.`,
  "GitHub App, hosted portfolio, hosted audit log, and billing portal require a future hosted control plane. No timeline is announced.",
  "SAML / OIDC SSO, SCIM, and RBAC are enterprise planned and require a future hosted control plane with enterprise identity infrastructure. No timeline is announced.",
  `MCP stdio tools and GitHub Action setup paths are beta. ${launchTruth.facts.mcpPackage.note} ${launchTruth.facts.githubAction.note}`,
  "Source upload is never required for local editions. The local daemon does not implement SSO, RBAC, or tenant isolation.",
  "No Commercial License, Hosted, or Enterprise price is announced.",
];

/**
 * Two-column plain-English boundary used by <LicenseExamples>. Deliberately
 * collapses "commercial license" and "separate agreement" into one column
 * (recommendation.md §4.4 calls for a two-column block, not three).
 */
export const licenseBoundaryColumns: {
  heading: string;
  items: string[];
}[] = [
  {
    heading: "Free",
    items: [
      "Individual use, on your own machine.",
      "Noncommercial use, at any organization size.",
      "Internal business use by companies under $1M aggregate gross revenue.",
    ],
  },
  {
    heading: "Requires a license or agreement",
    items: [
      "Internal business use once a company reaches $1M aggregate gross revenue — commercial license.",
      "Hosting Ledgerful for third parties — separate agreement.",
      "Reselling Ledgerful, or bundling/embedding it into another product (OEM) — separate agreement.",
    ],
  },
];

export type LicensePersona = {
  scenario: string;
  outcome: string;
  reason: string;
};

/**
 * Best-effort personas matching the Ledgerful Small-Entity Commercial
 * Exception text. Rendered under a "plain-language summary — not legal
 * advice" banner per 0025-WebPricingReframe spec.md §2. The license is in
 * force (counsel-reviewed); the summary is still not the operative text.
 */
export const licensePersonas: LicensePersona[] = [
  {
    scenario: "A 3-person consultancy runs Ledgerful internally to review its own commits.",
    outcome: "Free",
    reason: "Qualifies as a small entity under the noncommercial + small-entity exception terms.",
  },
  {
    scenario: "A $50M-revenue company runs Ledgerful in CI across its engineering org.",
    outcome: "Commercial license required",
    reason: "Company revenue exceeds the $1M small-entity threshold for internal use.",
  },
  {
    scenario: "A hosting provider offers Ledgerful as a managed service to its customers.",
    outcome: "Separate agreement required",
    reason: "Hosting for third parties is outside both the free and commercial-license internal-use terms.",
  },
  {
    scenario: "A vendor bundles Ledgerful into a product it sells to customers.",
    outcome: "Separate agreement required",
    reason: "Reselling or OEM bundling is outside both the free and commercial-license internal-use terms.",
  },
];

export const pricingFaq: PricingFaqItem[] = [
  {
    question: "What counts toward the $1M revenue threshold?",
    answer:
      "The Ledgerful Small-Entity Commercial Exception measures a company's aggregated gross revenue across all its operations, not just the team running Ledgerful. Once a company crosses that threshold, continued internal use requires a commercial license.",
  },
  {
    question: "I'm a contractor or consultant — do I qualify?",
    answer:
      "It depends on whose revenue is measured. Running Ledgerful on your own consultancy's behalf is evaluated against your company's revenue. Running it while embedded in a client's engineering org is evaluated against that client's revenue.",
  },
  {
    question: "Can I host Ledgerful for my customers?",
    answer:
      "No — hosting Ledgerful as a service for third parties is not covered by the free or commercial-license internal-use terms and requires a separate agreement.",
  },
  {
    question: "Can I bundle or resell Ledgerful (OEM)?",
    answer:
      "No — bundling Ledgerful into a product you sell, or reselling it, requires a separate agreement rather than the free or commercial-license internal-use terms.",
  },
];
