import type { Deployment, Maturity } from "./features";
import { launchTruth } from "./launch-facts";
import {
  buildCommercialLicenseMailto,
  commercialCardPriceLabel,
  commercialPricing,
} from "./commercial-pricing";

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
  /** Optional first-class provisional / introductory badge (Commercial). */
  provisionalLabel?: string;
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
  "Free for individuals, noncommercial use, and qualifying small entities (under $1M aggregated gross revenue across You and Affiliates, Internal Business Use only); paid Commercial License for broader internal commercial use; resale, hosting, or OEM requires a separate written agreement.";

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
    maturity: "planned",
    deployment: "runs-locally",
    caveat: "Not publicly installable yet",
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
      "Individuals, noncommercial use, and qualifying small entities under $1M aggregated gross revenue across You and Affiliates (Internal Business Use only)",
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
      "Companies at or above $1M aggregated gross revenue (or otherwise outside QSE) running Ledgerful for Internal Business Use",
    price: commercialCardPriceLabel(),
    maturity: "available",
    deployment: "runs-locally",
    provisionalLabel: commercialPricing.provisionalLabel,
    description:
      "The same local-first CLI, dashboard, ledger, and evidence export as Local, under a paid commercial license. Introductory headcount-band pricing is provisional and may move upward on traction (announced, never silent).",
    includes: localCapabilities,
    cta: {
      label: "Request commercial license",
      href: buildCommercialLicenseMailto(),
      note: commercialPricing.fulfillmentSentence,
    },
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
        caveat: "Not publicly installable yet",
        cells: [
          { maturity: "planned", deployment: "runs-locally" },
          { maturity: "planned", deployment: "runs-locally" },
          { maturity: "planned", deployment: "runs-locally" },
          { maturity: "planned", deployment: "runs-locally" },
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
  `${launchTruth.facts.license.note} Commercial License headcount-band prices are introductory/provisional and published on this page; Hosted and Enterprise prices are not announced.`,
  "GitHub App, hosted portfolio, hosted audit log, and billing portal require a future hosted control plane. No timeline is announced.",
  "SAML / OIDC SSO, SCIM, and RBAC are planned for enterprise and require a future hosted control plane with enterprise identity infrastructure. No timeline is announced.",
  `MCP stdio tools are published on npm (v${launchTruth.facts.mcpPackage.version}). GitHub Action setup path is planned — not publicly installable yet. ${launchTruth.facts.githubAction.note}`,
  "Source upload is never required for local editions. The local daemon does not implement SSO, RBAC, or tenant isolation.",
  "No Hosted or Enterprise price is announced. OEM, hosting-as-a-service, resale, and redistribution require a separate written agreement regardless of size.",
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
      "Internal Business Use by a Qualified Small Entity: under $1M aggregated gross revenue across You and all Affiliates (exactly $1M is not QSE).",
      "Evaluation Use: 30 days, once per Entity + its Affiliate group, non-Production only; does not reset on upgrades or new versions.",
    ],
  },
  {
    heading: "Requires a license or agreement",
    items: [
      "Internal Business Use once you are at or above $1M aggregated gross revenue (or otherwise outside QSE) after any Evaluation Use or 90-day transition — commercial license.",
      "Hosting Ledgerful for third parties — separate written agreement, regardless of size.",
      "Reselling Ledgerful, or bundling/embedding it into another product (OEM) — separate written agreement, regardless of size.",
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
    scenario: "A 3-person consultancy under $1M aggregated gross revenue runs Ledgerful internally to review its own commits.",
    outcome: "Free (QSE Internal Business Use)",
    reason:
      "Qualifies as a Qualified Small Entity under the Exception: under $1M aggregated across You and Affiliates, Internal Business Use only.",
  },
  {
    scenario: "A $50M-revenue company evaluates Ledgerful in a non-Production sandbox for two weeks.",
    outcome: "Evaluation Use (free, limited)",
    reason:
      "Evaluation Use allows 30 days once per Entity + Affiliate group for non-Production only. It is not a production pilot and does not reset on upgrades.",
  },
  {
    scenario: "A $50M-revenue company runs Ledgerful in production CI across its engineering org.",
    outcome: "Commercial license required",
    reason:
      "At or above the $1M threshold for Internal Business Use beyond Evaluation Use or any 90-day transition grant.",
  },
  {
    scenario: "A hosting provider offers Ledgerful as a managed service to its customers.",
    outcome: "Separate agreement required",
    reason:
      "Hosting for third parties is outside both free and commercial-license Internal Business Use terms, regardless of company size.",
  },
  {
    scenario: "A vendor bundles Ledgerful into a product it sells to customers.",
    outcome: "Separate agreement required",
    reason:
      "Reselling or OEM bundling requires a separate written agreement, not the free path or the headcount-band commercial license alone.",
  },
];

export const pricingFaq: PricingFaqItem[] = [
  {
    question: "What counts toward the under-$1M revenue threshold?",
    answer:
      "The Ledgerful Small-Entity Commercial Exception measures Aggregated Gross Revenue across You and all Affiliates, not just the team running Ledgerful. Use under $1M / less than $1M wording — at exactly $1,000,000 you are not a Qualified Small Entity. Once you are at or above the threshold, continued Internal Business Use (beyond Evaluation Use or any 90-day transition) requires a commercial license. This is not legal advice; the Exception text controls.",
  },
  {
    question: "What is Evaluation Use?",
    answer:
      "Evaluation Use is a limited Exception grant: 30 days, once per Entity and its Affiliate group, non-Production only. It begins on first use of a version under this license and does not reset on upgrades, new versions, or Affiliate transfers. It is not an open production pilot. See the Exception for the operative terms.",
  },
  {
    question: "What is the 90-day transition grant?",
    answer:
      "When you cross the QSE revenue threshold or undergo a Change of Control, the Exception provides a 90-day transition period so you can obtain a commercial license without an immediate hard cutover. Details and conditions are in the Exception text — this summary is not legal advice.",
  },
  {
    question: "How is Commercial License priced?",
    answer:
      "Introductory annual USD pricing for Internal Business Use commercial licenses: up to 25 engineers $1,500/year; up to 50 engineers $2,500/year; over 50 engineers contact legal@ledgerful.dev. Pricing is provisional and may move upward on traction (announced, never silent). Request a license by email — human invoice path only; no self-serve purchase. Hosted and Enterprise remain Pricing not announced.",
  },
  {
    question: "I'm a contractor or consultant — do I qualify?",
    answer:
      "It depends on whose revenue is measured. Running Ledgerful on your own consultancy's behalf is evaluated against your company's Aggregated Gross Revenue (You + Affiliates). Running it while embedded in a client's engineering org is evaluated against that client's revenue and Affiliate group.",
  },
  {
    question: "Can I host Ledgerful for my customers?",
    answer:
      "No — hosting Ledgerful as a service for third parties is not covered by free or commercial-license Internal Business Use terms and requires a separate written agreement via legal@ledgerful.dev, regardless of company size.",
  },
  {
    question: "Can I bundle or resell Ledgerful (OEM)?",
    answer:
      "No — bundling Ledgerful into a product you sell, or reselling it, requires a separate written agreement rather than the free path or headcount-band commercial license. Contact legal@ledgerful.dev.",
  },
];
