import type { Deployment, Maturity } from "./features";
import { launchTruth } from "./launch-facts";

export type EditionItem = {
  label: string;
  maturity: Maturity;
  deployment: Deployment;
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
  maturity: Maturity;
  deployment: Deployment;
  description: string;
  includes: EditionItem[];
  cta?: EditionCta;
};

export type MatrixCell = {
  maturity: Maturity;
  deployment: Deployment;
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
  { label: "Local CLI and engine", maturity: "available", deployment: "runs-locally" },
  { label: "Local dashboard", maturity: "available", deployment: "runs-locally" },
  { label: "Signed ledger provenance", maturity: "available", deployment: "runs-locally" },
  { label: "Manual SOC 2-style evidence ZIP", maturity: "available", deployment: "runs-locally" },
  {
    label: "MCP stdio tools",
    maturity: "available",
    deployment: "runs-locally",
  },
  {
    label: "GitHub Action setup path",
    maturity: "beta",
    deployment: "runs-locally",
    caveat: "Public install docs in progress",
  },
  {
    label: "Local team sync foundation",
    maturity: "beta",
    deployment: "runs-locally",
    caveat: "Requires a build compiled with --features sync",
  },
];

export const editions: Edition[] = [
  {
    name: "Local",
    audience:
      "Individuals, noncommercial use, and small companies under $1M aggregate gross revenue (internal use)",
    price: "Free for qualifying use",
    maturity: "available",
    deployment: "runs-locally",
    description:
      "Run the current local build under the in-force PolyForm Noncommercial License with the Small-Entity Commercial Exception.",
    includes: localCapabilities,
  },
  {
    name: "Commercial License",
    audience:
      "Companies at or above $1M aggregate gross revenue running Ledgerful internally",
    price: "Commercial license required",
    maturity: "available",
    deployment: "runs-locally",
    description:
      "The same local-first CLI, dashboard, ledger, and evidence export as Local, under a commercial license. The base license is in force; commercial pricing is not yet announced.",
    includes: localCapabilities,
    cta: { label: "Review license terms", href: "/trust#license" },
  },
  {
    name: "Hosted",
    audience: "Managers who need cross-repo hosted visibility",
    price: "Pricing not announced",
    maturity: "planned",
    deployment: "hosted",
    description:
      "Planned hosted portfolio, GitHub App workflow, signed summary ingestion, billing, and retained audit state. Requires a future hosted control plane — no live feature claims until it ships.",
    includes: [
      { label: "Hosted portfolio dashboard", maturity: "planned", deployment: "hosted" },
      { label: "GitHub App", maturity: "planned", deployment: "hosted" },
      { label: "Hosted audit log", maturity: "planned", deployment: "hosted" },
      { label: "Billing portal", maturity: "planned", deployment: "hosted" },
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
    maturity: "planned",
    deployment: "hosted",
    description:
      "Planned enterprise identity, audit export, retention controls, support SLA, and optional self-hosted control plane. Described as roadmap — never sold today.",
    includes: [
      { label: "SAML / OIDC SSO", maturity: "planned", deployment: "hosted" },
      { label: "SCIM", maturity: "planned", deployment: "hosted" },
      { label: "RBAC", maturity: "planned", deployment: "hosted" },
      { label: "Custom retention and support SLA", maturity: "planned", deployment: "hosted" },
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
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
        ],
      },
      {
        feature: "Local dashboard",
        cells: [
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
        ],
      },
      {
        feature: "Signed ledger provenance",
        cells: [
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
        ],
      },
      {
        feature: "SOC 2-style evidence ZIP export",
        cells: [
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
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
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
        ],
      },
      {
        feature: "Team signatures and devices",
        cells: [
          { maturity: "beta", deployment: "runs-locally" },
          { maturity: "beta", deployment: "runs-locally" },
          { maturity: "beta", deployment: "runs-locally" },
          { maturity: "beta", deployment: "runs-locally" },
        ],
      },
      {
        feature: "Portfolio reports",
        cells: [
          { maturity: "beta", deployment: "runs-locally" },
          { maturity: "beta", deployment: "runs-locally" },
          { maturity: "planned", deployment: "hosted" },
          { maturity: "planned", deployment: "hosted" },
        ],
      },
    ],
  },
  {
    label: "GitHub and Release",
    rows: [
      {
        feature: "MCP stdio tools",
        cells: [
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
          { maturity: "available", deployment: "runs-locally" },
        ],
      },
      {
        feature: "GitHub Action setup path",
        caveat: "Public install docs in progress",
        cells: [
          { maturity: "beta", deployment: "runs-locally" },
          { maturity: "beta", deployment: "runs-locally" },
          { maturity: "beta", deployment: "runs-locally" },
          { maturity: "beta", deployment: "runs-locally" },
        ],
      },
      {
        feature: "GitHub App",
        cells: [null, null, { maturity: "planned", deployment: "hosted" }, { maturity: "planned", deployment: "hosted" }],
      },
    ],
  },
  {
    label: "Hosted (planned)",
    rows: [
      {
        feature: "Hosted portfolio dashboard",
        cells: [null, null, { maturity: "planned", deployment: "hosted" }, { maturity: "planned", deployment: "hosted" }],
      },
      {
        feature: "Hosted audit log",
        cells: [null, null, { maturity: "planned", deployment: "hosted" }, { maturity: "planned", deployment: "hosted" }],
      },
      {
        feature: "Billing portal",
        cells: [null, null, { maturity: "planned", deployment: "hosted" }, { maturity: "planned", deployment: "hosted" }],
      },
    ],
  },
  {
    label: "Enterprise (planned)",
    rows: [
      {
        feature: "SAML / OIDC SSO",
        cells: [null, null, null, { maturity: "planned", deployment: "hosted" }],
      },
      {
        feature: "SCIM",
        cells: [null, null, null, { maturity: "planned", deployment: "hosted" }],
      },
      {
        feature: "RBAC",
        cells: [null, null, null, { maturity: "planned", deployment: "hosted" }],
      },
      {
        feature: "Custom retention and support SLA",
        cells: [null, null, null, { maturity: "planned", deployment: "hosted" }],
      },
    ],
  },
];

export const pricingFootnotes: string[] = [
  `${launchTruth.facts.license.note} No paid commercial price is announced.`,
  "GitHub App, hosted portfolio, hosted audit log, and billing portal require a future hosted control plane. No timeline is announced.",
  "SAML / OIDC SSO, SCIM, and RBAC are planned for enterprise and require a future hosted control plane with enterprise identity infrastructure. No timeline is announced.",
  `MCP stdio tools are published on npm (v${launchTruth.facts.mcpPackage.version}). GitHub Action setup path is beta. ${launchTruth.facts.githubAction.note}`,
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
