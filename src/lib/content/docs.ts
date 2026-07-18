import type { Deployment, Maturity } from "./features";
import { launchTruth } from "./launch-facts";

export type DocTopic = {
  title: string;
  maturity: Maturity;
  deployment: Deployment;
  pillar?: "track" | "assess" | "prove" | "ask";
  summary: string;
  nextAction: string;
  href?: string;
};

export const docTopics: DocTopic[] = [
  {
    title: "CLI install and smoke test",
    maturity: "available",
    deployment: "runs-locally",
    pillar: "track",
    summary:
      "Install the Ledgerful CLI from a release binary or source, then run your first scan to confirm it works.",
    nextAction: "Build from source or download a release binary; run a smoke test.",
    href: "/docs/cli",
  },
  {
    title: "Local dashboard launch",
    maturity: "available",
    deployment: "runs-locally",
    pillar: "track",
    summary:
      "Dashboard access is loopback daemon-backed: a one-time launch token is stripped from the URL, held in memory, and sent as Authorization: Bearer.",
    nextAction: "Document token handling without exposing tokens in examples or logs.",
    href: "/docs/dashboard",
  },
  {
    title: "MCP setup",
    maturity: "beta",
    deployment: "runs-locally",
    pillar: "ask",
    summary:
      launchTruth.facts.mcpPackage.note,
    nextAction: "Install via npx or npm install; configure your MCP client.",
    href: "/docs/mcp",
  },
  {
    title: "GitHub Action setup",
    maturity: "planned",
    deployment: "hosted",
    pillar: "assess",
    summary:
      "A future hosted control-plane integration for PR risk comments. The workflow YAML is a reference shape, not an installable action today.",
    nextAction: "Publish install YAML after the public action is released.",
    href: "/docs/github-action",
  },
  {
    title: "SOC 2-style evidence export",
    maturity: "available",
    deployment: "runs-locally",
    pillar: "prove",
    summary:
      "Local daemon can generate a ZIP with signed manifest, ledger CSV, verification history, and ADRs.",
    nextAction: "Keep this framed as a local export, not a hosted SOC 2 portal.",
    href: "/docs/compliance",
  },
  {
    title: "SOC 2 control-evidence mapping",
    maturity: "planned",
    deployment: "runs-locally",
    pillar: "prove",
    summary:
      "A draft mapping of Ledgerful's framework-agnostic evidence to named SOC 2 controls. Draft — pending design-partner validation; the page is noindex until auditor interviews validate the map.",
    nextAction:
      "Open the draft mapping page (noindex, direct-link only) to review the control-to-evidence map.",
  },
  {
    title: "Local team sync",
    maturity: "beta",
    deployment: "runs-locally",
    pillar: "track",
    summary:
      "Team sync foundation uses signed/encrypted local-first bundles and dir:// transport.",
    nextAction: "Document setup and recovery once the product workflow is finalized.",
    href: "/docs/sync",
  },
  {
    title: "Release verification",
    maturity: "available",
    deployment: "runs-locally",
    pillar: "prove",
    summary:
      "Verify the v0.1.8 release binary with its SHA-256 checksum and run the local health report.",
    nextAction: "Download the release and verify the SHA-256 checksum.",
    href: "/docs/releases",
  },
  {
    title: "Public ledger",
    maturity: "available",
    deployment: "runs-locally",
    pillar: "prove",
    summary:
      "Ledgerful's own development ledger, published as a redacted, signed, browser-verifiable bundle at /ledger.",
    nextAction: "Open the public ledger page to verify entries in your browser.",
    href: "/docs/public-ledger",
  },
];
