export type FeatureState =
  | "available"
  | "beta"
  | "local-only"
  | "hosted planned"
  | "enterprise planned";

export type FeatureItem = {
  name: string;
  state: FeatureState;
  description: string;
  evidence?: string;
};

export const stateLabels: Record<FeatureState, string> = {
  available: "Available",
  beta: "Beta",
  "local-only": "Local-only",
  "hosted planned": "Hosted planned",
  "enterprise planned": "Enterprise planned",
};

export const featureStates: FeatureItem[] = [
  {
    name: "Local CLI and engine",
    state: "available",
    description:
      "Runs analysis, ledger, audit, verify, sync, web, and MCP workflows from the local Ledgerful binary.",
    evidence: "Roadmap confirms the local engine and CLI are real today.",
  },
  {
    name: "Local dashboard",
    state: "local-only",
    description:
      "A loopback dashboard backed by the local daemon and ephemeral session token access.",
    evidence: "Daemon default is http://127.0.0.1:52001 with ?token= access.",
  },
  {
    name: "Signed ledger provenance",
    state: "available",
    description:
      "Committed changes can carry signed evidence and offline-verifiable audit artifacts.",
    evidence: "Local ledger and compliance export contracts are implemented.",
  },
  {
    name: "SOC2 evidence export",
    state: "local-only",
    description:
      "Exports a local ZIP bundle with manifest, hashes, signature, ledger CSV, verification history, and ADR files.",
    evidence: "Backend notes document /api/compliance/export as a ZIP download.",
  },
  {
    name: "MCP stdio tools",
    state: "beta",
    description:
      "Local MCP server and package path exist, but public package/release smoke remains a launch fact.",
    evidence: "Roadmap marks MCP package release smoke as unresolved.",
  },
  {
    name: "GitHub Action path",
    state: "beta",
    description:
      "Action package and PR validation path exist; public install hygiene still needs release proof.",
    evidence: "Roadmap separates Action implementation from public release docs.",
  },
  {
    name: "Team Hosted control plane",
    state: "hosted planned",
    description:
      "Hosted portfolio, GitHub App, billing, and retained audit state belong to a future control plane.",
  },
  {
    name: "SSO, SCIM, RBAC, hosted audit log",
    state: "enterprise planned",
    description:
      "Enterprise identity and audit features are not implemented in the local daemon.",
  },
];
