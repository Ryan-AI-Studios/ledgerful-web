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
      launchTruth.facts.release.note,
    nextAction: "Build from source or download a release binary; verify the SHA-256 checksum.",
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
    maturity: "beta",
    deployment: "runs-locally",
    pillar: "assess",
    summary:
      launchTruth.facts.githubAction.note,
    nextAction: "Publish install YAML after action release hygiene is complete.",
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
      launchTruth.facts.release.note,
    nextAction: "Download the v0.1.8 release and verify the SHA-256 checksum.",
    href: "/docs/releases",
  },
];
