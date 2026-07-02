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
    state: "unresolved",
    summary:
      launchTruth.facts.release.note,
    nextAction: "Track release artifacts before publishing one-line install docs.",
    href: "/docs/cli",
  },
  {
    title: "Local dashboard launch",
    state: "local-only",
    summary:
      "Dashboard access is loopback daemon-backed and uses an ephemeral ?token= session model.",
    nextAction: "Document token handling without exposing tokens in examples or logs.",
    href: "/docs/dashboard",
  },
  {
    title: "MCP setup",
    state: "beta",
    summary:
      launchTruth.facts.mcpPackage.note,
    nextAction: "Add registry/package links after live package smoke.",
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
    title: "SOC2 evidence export",
    state: "local-only",
    summary:
      "Local daemon can generate a ZIP with signed manifest, ledger CSV, verification history, and ADRs.",
    nextAction: "Keep this framed as a local export, not a hosted SOC2 portal.",
    href: "/docs/compliance",
  },
  {
    title: "Local team sync",
    state: "local-only",
    summary:
      "Team sync foundation uses signed/encrypted local-first bundles and dir:// transport.",
    nextAction: "Document setup and recovery once the product workflow is finalized.",
    href: "/docs/sync",
  },
  {
    title: "Release verification",
    state: "unresolved",
    summary:
      launchTruth.facts.release.note,
    nextAction: "Resolve release download and checksum URLs before launch.",
    href: "/docs/releases",
  },
];
