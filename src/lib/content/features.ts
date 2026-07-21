export type Maturity = "available" | "beta" | "planned";
export type Deployment = "runs-locally" | "hosted";
export type Edition = "local" | "commercial" | "hosted" | "enterprise";

export type FeatureItem = {
  name: string;
  maturity: Maturity;
  deployment: Deployment;
  description: string;
  evidence?: string;
};

export const maturityLabels: Record<Maturity, string> = {
  available: "Available",
  beta: "Beta",
  planned: "Planned",
};

export const deploymentLabels: Record<Deployment, string> = {
  "runs-locally": "Runs locally",
  hosted: "Hosted",
};

export const editionLabels: Record<Edition, string> = {
  local: "Local",
  commercial: "Commercial",
  hosted: "Hosted",
  enterprise: "Enterprise",
};

export const featureStates: FeatureItem[] = [
  {
    name: "Local CLI and engine",
    maturity: "available",
    deployment: "runs-locally",
    description:
      "Runs analysis, ledger, audit, verify, web, and MCP workflows from the default local Ledgerful binary.",
    evidence: "Roadmap confirms the local engine and CLI are real today.",
  },
  {
    name: "Local team sync foundation",
    maturity: "beta",
    deployment: "runs-locally",
    description:
      "Signed, encrypted dir:// bundles are available in a feature-gated build compiled with --features sync; sync is not included in the default install.",
    evidence: "The engine Cargo feature list keeps sync outside default features.",
  },
  {
    name: "Local dashboard",
    maturity: "available",
    deployment: "runs-locally",
    description:
      "A loopback dashboard backed by the local daemon and ephemeral session token access.",
    evidence:
      "The launch URL hands off a one-time token; the dashboard strips it and uses Authorization: Bearer for daemon requests.",
  },
  {
    name: "Signed ledger provenance",
    maturity: "available",
    deployment: "runs-locally",
    description:
      "Committed changes can carry signed evidence and offline-verifiable audit artifacts.",
    evidence: "Local ledger and compliance export contracts are implemented.",
  },
  {
    name: "SOC 2-style evidence export",
    maturity: "available",
    deployment: "runs-locally",
    description:
      "Exports a local ZIP bundle with manifest, hashes, signature, ledger CSV, verification history, and ADR files.",
    evidence: "Backend notes document /api/compliance/export as a ZIP download.",
  },
  {
    name: "MCP stdio tools",
    maturity: "available",
    deployment: "runs-locally",
    description:
      "The @ledgerful/mcp-server package is published on npm (v0.1.11; engine pin v0.1.9). The local MCP server connects AI assistants to the engine.",
    evidence: "launch-facts.ts confirms @ledgerful/mcp-server is published on npm.",
  },
  {
    name: "GitHub Action path",
    maturity: "beta",
    deployment: "runs-locally",
    description:
      "Action package and PR validation path exist; public install docs are still in progress.",
    evidence: "Roadmap separates Action implementation from public release docs.",
  },
  {
    name: "Hosted control plane",
    maturity: "planned",
    deployment: "hosted",
    description:
      "A future hosted service. Not built.",
  },
  {
    name: "SSO, SCIM, RBAC, hosted audit log",
    maturity: "planned",
    deployment: "hosted",
    description:
      "Enterprise identity and audit features are not implemented in the local daemon.",
  },
];
