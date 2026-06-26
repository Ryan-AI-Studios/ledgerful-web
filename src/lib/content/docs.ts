import type { FeatureState } from "./features";

export type DocTopic = {
  title: string;
  state: FeatureState | "unresolved";
  summary: string;
  nextAction: string;
};

export const docTopics: DocTopic[] = [
  {
    title: "CLI install and smoke test",
    state: "unresolved",
    summary:
      "The install path should point at real release artifacts once release downloads and checksums are smoke-tested.",
    nextAction: "Track release artifacts before publishing one-line install docs.",
  },
  {
    title: "Local dashboard launch",
    state: "local-only",
    summary:
      "Dashboard access is loopback daemon-backed and uses an ephemeral ?token= session model.",
    nextAction: "Document token handling without exposing tokens in examples or logs.",
  },
  {
    title: "MCP setup",
    state: "beta",
    summary:
      "MCP stdio server and package path exist, but public package links need release proof.",
    nextAction: "Add registry/package links after live package smoke.",
  },
  {
    title: "GitHub Action setup",
    state: "beta",
    summary:
      "Action path exists; public docs should distinguish self-managed Action from future hosted GitHub App.",
    nextAction: "Publish install YAML after action release hygiene is complete.",
  },
  {
    title: "SOC2 evidence export",
    state: "local-only",
    summary:
      "Local daemon can generate a ZIP with signed manifest, ledger CSV, verification history, and ADRs.",
    nextAction: "Keep this framed as a local export, not a hosted SOC2 portal.",
  },
  {
    title: "Local team sync",
    state: "local-only",
    summary:
      "Team sync foundation uses signed/encrypted local-first bundles and dir:// transport.",
    nextAction: "Document setup and recovery once the product workflow is finalized.",
  },
  {
    title: "Release verification",
    state: "unresolved",
    summary:
      "Checksums and provenance should be public once tagged release artifacts exist.",
    nextAction: "Resolve release download and checksum URLs before launch.",
  },
];
