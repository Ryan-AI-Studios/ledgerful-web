import type { FeatureState } from "./features";

export type Edition = {
  name: string;
  audience: string;
  price: string;
  state: FeatureState;
  description: string;
  includes: { label: string; state: FeatureState }[];
};

export const editions: Edition[] = [
  {
    name: "Free / Local",
    audience: "Individual developers and open-source maintainers",
    price: "$0",
    state: "available",
    description:
      "Run Ledgerful locally with CLI analysis, local dashboard, signed ledger, and manual evidence export.",
    includes: [
      { label: "Local CLI and engine", state: "available" },
      { label: "Local dashboard", state: "local-only" },
      { label: "MCP stdio tools", state: "beta" },
      { label: "Manual SOC2 evidence ZIP", state: "local-only" },
    ],
  },
  {
    name: "Pro / Team Local",
    audience: "Teams that want local-first collaboration",
    price: "Planned per-seat",
    state: "beta",
    description:
      "Team-local sync, portfolio reporting, signatures, and GitHub Action templates without requiring source upload.",
    includes: [
      { label: "Local team sync foundation", state: "local-only" },
      { label: "Team signatures and devices", state: "beta" },
      { label: "GitHub Action setup path", state: "beta" },
      { label: "Portfolio reports", state: "beta" },
    ],
  },
  {
    name: "Team Hosted Beta",
    audience: "Managers who need cross-repo hosted visibility",
    price: "Hosted planned",
    state: "hosted planned",
    description:
      "Future hosted portfolio, GitHub App workflow, signed summary ingestion, billing, and retained audit state.",
    includes: [
      { label: "Hosted portfolio dashboard", state: "hosted planned" },
      { label: "GitHub App", state: "hosted planned" },
      { label: "Billing portal", state: "hosted planned" },
      { label: "Hosted audit log", state: "hosted planned" },
    ],
  },
  {
    name: "Enterprise / Contact",
    audience: "Security-conscious and regulated organizations",
    price: "Enterprise planned",
    state: "enterprise planned",
    description:
      "Future enterprise identity, audit export, retention controls, support, and optional self-hosted control plane.",
    includes: [
      { label: "SAML/OIDC SSO", state: "enterprise planned" },
      { label: "SCIM", state: "enterprise planned" },
      { label: "RBAC", state: "enterprise planned" },
      { label: "Custom retention and support SLA", state: "enterprise planned" },
    ],
  },
];
