export type LaunchFactStatus = "resolved" | "unresolved" | "planned";

export type LaunchFact = {
  label: string;
  status: LaunchFactStatus;
  value: string;
  note: string;
  href?: string;
};

export const launchFacts: LaunchFact[] = [
  {
    label: "Responsible disclosure channel",
    status: "unresolved",
    value: "Not yet published",
    note: "A verified security contact and encrypted submission path (PGP key) will be published before public launch. Do not send vulnerability reports to general contact addresses until this is resolved.",
    href: undefined,
  },
  {
    label: "Canonical GitHub repository",
    status: "resolved",
    value: "https://github.com/Ryan-AI-Studios/Ledgerful",
    note: "Anonymous access verified 2026-06-27: HTTP 200 and git ls-remote returned commit SHA ee702d481a3cb870f39b378170625a2bc054ba13.",
    href: "https://github.com/Ryan-AI-Studios/Ledgerful",
  },
  {
    label: "Status page",
    status: "unresolved",
    value: "Not published",
    note: "Do not link status.ledgerful.dev until the status surface exists.",
  },
  {
    label: "License wording",
    status: "unresolved",
    value: "License model under review",
    note: "The LICENSE file in the repository currently reads MIT, but the commercial license model (free personal use vs. paid commercial) has not been finalized. Do not publish license terms on the public site until the model is decided.",
    href: undefined,
  },
  {
    label: "MCP registry or npm package",
    status: "unresolved",
    value: "Release smoke pending",
    note: "Package path exists, but public install links need a real release/package smoke.",
  },
  {
    label: "Release downloads and checksums",
    status: "unresolved",
    value: "Tagged release pending",
    note: "Use checksums once a real tagged release and asset smoke are complete.",
  },
  {
    label: "GitHub Action install URL",
    status: "unresolved",
    value: "Public install docs pending",
    note: "Action path exists; install docs should wait for release hygiene.",
  },
  {
    label: "Hosted control plane",
    status: "planned",
    value: "Future Vercel + Supabase baseline",
    note: "Hosted tenancy, billing, webhooks, and identity are not in this repo.",
  },
];
