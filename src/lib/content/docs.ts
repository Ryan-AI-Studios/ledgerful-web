import type { FeatureState } from "./features";
import { launchTruth } from "./launch-facts";

export type DocTopic = {
  title: string;
  state: FeatureState | "unresolved";
  summary: string;
  nextAction: string;
  href?: string;
};

export const docTopics: DocTopic[] = [
  {
    title: "CLI install and smoke test",
    state: "available",
    summary:
      launchTruth.facts.release.note,
    nextAction: "Build from source or download a release binary; verify the SHA-256 checksum.",
    href: "/docs/cli",
  },
  {
    title: "Local dashboard launch",
    state: "local-only",
    summary:
      "Dashboard access is loopback daemon-backed: a one-time launch token is stripped from the URL, held in memory, and sent as Authorization: Bearer.",
    nextAction: "Document token handling without exposing tokens in examples or logs.",
    href: "/docs/dashboard",
  },
  {
    title: "MCP setup",
    state: "beta",
    summary:
      launchTruth.facts.mcpPackage.note,
    nextAction: "Install via npx or npm install; configure your MCP client.",
    href: "/docs/mcp",
  },
  {
    title: "GitHub Action setup",
    state: "beta",
    summary:
      launchTruth.facts.githubAction.note,
    nextAction: "Publish install YAML after action release hygiene is complete.",
    href: "/docs/github-action",
  },
  {
    title: "SOC 2-style evidence export",
    state: "local-only",
    summary:
      "Local daemon can generate a ZIP with signed manifest, ledger CSV, verification history, and ADRs.",
    nextAction: "Keep this framed as a local export, not a hosted SOC 2 portal.",
    href: "/docs/compliance",
  },
  {
    title: "Local team sync",
    state: "beta",
    summary:
      "Team sync foundation uses signed/encrypted local-first bundles and dir:// transport.",
    nextAction: "Document setup and recovery once the product workflow is finalized.",
    href: "/docs/sync",
  },
  {
    title: "Release verification",
    state: "available",
    summary:
      launchTruth.facts.release.note,
    nextAction: "Download the v0.1.8 release and verify the SHA-256 checksum.",
    href: "/docs/releases",
  },
];
