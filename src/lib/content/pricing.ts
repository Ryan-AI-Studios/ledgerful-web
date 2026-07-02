import type { FeatureState } from "./features";
import { launchTruth } from "./launch-facts";

export type EditionItem = {
  label: string;
  state: FeatureState;
  caveat?: string;
};

export type Edition = {
  name: string;
  audience: string;
  price: string;
  state: FeatureState;
  description: string;
  includes: EditionItem[];
};

export type MatrixCell = {
  state: FeatureState;
} | null;

// cells order: [License-qualified Local, Pro / Team Local, Team Hosted, Enterprise]
export type MatrixRow = {
  feature: string;
  caveat?: string;
  cells: [MatrixCell, MatrixCell, MatrixCell, MatrixCell];
};

export type MatrixGroup = {
  label: string;
  rows: MatrixRow[];
};

export const editions: Edition[] = [
  {
    name: "License-qualified Local",
    audience: "Noncommercial users and qualified small entities",
    price: "Royalty-free for qualifying use",
    state: "available",
    description:
      "Run Ledgerful locally with CLI analysis, local dashboard, signed ledger, and manual evidence export.",
    includes: [
      { label: "Local CLI and engine", state: "available" },
      { label: "Local dashboard", state: "local-only" },
      {
        label: "MCP stdio tools",
        state: "beta",
        caveat: "Release smoke pending",
      },
      { label: "Manual SOC2 evidence ZIP", state: "local-only" },
    ],
  },
  {
    name: "Pro / Team Local",
    audience: "Teams that want local-first collaboration without source upload",
    price: "Pricing not announced",
    state: "beta",
    description:
      "Team-local sync, portfolio reporting, signatures, and GitHub Action templates without requiring source upload.",
    includes: [
      { label: "Local team sync foundation", state: "local-only" },
      { label: "Team signatures and devices", state: "beta" },
      {
        label: "GitHub Action setup path",
        state: "beta",
        caveat: "Release smoke pending",
      },
      { label: "Portfolio reports", state: "beta" },
    ],
  },
  {
    name: "Team Hosted",
    audience: "Managers who need cross-repo hosted visibility",
    price: "Pricing not announced",
    state: "hosted planned",
    description:
      "Future hosted portfolio, GitHub App workflow, signed summary ingestion, billing, and retained audit state. Requires a future hosted control plane.",
    includes: [
      { label: "Hosted portfolio dashboard", state: "hosted planned" },
      { label: "GitHub App", state: "hosted planned" },
      { label: "Hosted audit log", state: "hosted planned" },
      { label: "Billing portal", state: "hosted planned" },
    ],
  },
  {
    name: "Enterprise",
    audience: "Security-conscious and regulated organizations",
    price: "Pricing not announced",
    state: "enterprise planned",
    description:
      "Future enterprise identity, audit export, retention controls, support SLA, and optional self-hosted control plane. Requires a future hosted control plane.",
    includes: [
      { label: "SAML / OIDC SSO", state: "enterprise planned" },
      { label: "SCIM", state: "enterprise planned" },
      { label: "RBAC", state: "enterprise planned" },
      { label: "Custom retention and support SLA", state: "enterprise planned" },
    ],
  },
];

export const matrixEditionHeaders = [
  "License-qualified Local",
  "Pro / Team Local",
  "Team Hosted",
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
        feature: "Local team sync",
        cells: [null, { state: "local-only" }, { state: "local-only" }, { state: "local-only" }],
      },
      {
        feature: "Team signatures and devices",
        cells: [null, { state: "beta" }, { state: "beta" }, { state: "beta" }],
      },
      {
        feature: "Portfolio reports",
        cells: [null, { state: "beta" }, { state: "hosted planned" }, { state: "hosted planned" }],
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
  "No Pro, Team Hosted, or Enterprise pricing is announced.",
];
