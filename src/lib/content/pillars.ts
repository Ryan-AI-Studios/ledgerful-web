export type Pillar = {
  id: string;
  label: string;
  capabilities: string[];
  description: string;
};

export const pillars: Pillar[] = [
  {
    id: "track",
    label: "Track every change",
    capabilities: ["Signed record on commit", "Tamper-evident audit trail", "Git-integrated workflow"],
    description: "On commit, Ledgerful writes a signed, tamper-evident record of what changed and why — an audit trail for code inside the normal git workflow.",
  },
  {
    id: "assess",
    label: "Assess risk",
    capabilities: ["Blast radius analysis", "Affected files", "Tests to run", "Complexity hotspots"],
    description: "Before a commit, Ledgerful analyzes the blast radius of a change — affected files, which tests to run, risk level, and complexity hotspots.",
  },
  {
    id: "prove",
    label: "Prove what happened",
    capabilities: ["Signed ledger", "SOC 2-style export", "Offline-verifiable chain-of-custody"],
    description: "Ledgerful generates offline-verifiable evidence — signed ledger entries and a SOC 2-style evidence export — that an auditor can check without trusting anyone's word.",
  },
  {
    id: "ask",
    label: "Ask your codebase",
    capabilities: ["Local knowledge graph", "Plain-English queries", "Route and function mapping"],
    description: "Ledgerful builds a local knowledge graph of the codebase and answers plain-English questions grounded in the actual code.",
  },
];

export const askCaveat = "Ask is local-model-capable (Ollama). Any cloud model (Gemini/OpenRouter) is strictly opt-in and user-configured — nothing uploads by default.";
