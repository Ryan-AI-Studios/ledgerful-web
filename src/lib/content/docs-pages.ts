/**
 * Shared content model for doc pages.
 * Verified against Ledgerful source: mcp/manifest.rs, action/action.yml,
 * engine source, and WebStartArgs.
 */

export type McpTool = {
  name: string;
  description: string;
};

/** 10 MCP tools confirmed from mcp/manifest.rs */
export const mcpTools: McpTool[] = [
  {
    name: "scan",
    description: "Run a risk scan on changed files and return structured impact data.",
  },
  {
    name: "search",
    description: "Full-text search over the local ledger and index.",
  },
  {
    name: "ask",
    description: "Ask a natural-language question about the repository and receive a grounded answer.",
  },
  {
    name: "ledger_status",
    description: "Return the current ledger commit count, last committed hash, and signing status.",
  },
  {
    name: "ledger_search",
    description: "Search the signed ledger for provenance records matching a query.",
  },
  {
    name: "hotspots",
    description: "Identify high-churn files and risky change concentrations in the repository.",
  },
  {
    name: "endpoints_changed",
    description: "List API endpoint surfaces that changed in the current diff.",
  },
  {
    name: "security_boundaries",
    description: "Report trust boundaries and data-flow edges that the current diff crosses.",
  },
  {
    name: "dead_code",
    description: "Identify symbols in the diff that may be unreachable or unused.",
  },
  {
    name: "verify_plan",
    description: "Verify a proposed change plan against ledger provenance and risk data.",
  },
];

export type GithubActionInput = {
  name: string;
  required: boolean;
  defaultValue?: string;
  description: string;
};

/**
 * GitHub Action inputs from live Ryan-AI-Studios/ledgerful-action action.yml
 * (repo root; measured 2026-07-29). Do not invent inputs.
 */
export const githubActionInputs: GithubActionInput[] = [
  {
    name: "ledgerful-version",
    required: false,
    defaultValue: "v0.2.1",
    description:
      "Pinned Ledgerful engine release version to run. Not `latest` — supply-chain hygiene. Action default may lag the Latest engine release (action-repo residual defaultValue v0.2.1); pin explicitly.",
  },
  {
    name: "ledgerful-checksum",
    required: false,
    description:
      "SHA-256 checksum of the pinned release archive (.tar.gz/.zip) for the runner OS/arch. Verified against the downloaded archive before extraction. Required in Workflow A (scan); not used in Workflow B.",
  },
  {
    name: "github-token",
    required: false,
    defaultValue: "${{ github.token }}",
    description:
      "GITHUB_TOKEN used to authenticate the release download (Workflow A) and to post the PR comment / check-run (Workflow B). Prefer secrets.GITHUB_TOKEN in workflow YAML.",
  },
  {
    name: "report-path",
    required: false,
    defaultValue: "ledgerful-pr-report.json",
    description:
      "Path to the JSON report file. Workflow A writes it; Workflow B reads it (relative to GITHUB_WORKSPACE).",
  },
  {
    name: "fail-on",
    required: false,
    defaultValue: "",
    description:
      "Optional non-blocking fail condition (low|medium|high). Reporting only — policy enforcement is out of scope here.",
  },
];

export type SyncCommand = {
  command: string;
  description: string;
};

/** Sync subcommands confirmed from engine source */
export const syncCommands: SyncCommand[] = [
  {
    command: "ledgerful sync init",
    description: "Initialize the sync configuration and generate a local transport entry.",
  },
  {
    command: "ledgerful sync run",
    description: "Write a signed, encrypted sync bundle to the configured transport directory.",
  },
  {
    command: "ledgerful sync status",
    description: "Report the last sync timestamp, bundle count, and transport health.",
  },
  {
    command: "ledgerful sync verify",
    description: "Verify all local sync bundles against their Ed25519 signatures.",
  },
  {
    command: "ledgerful sync log",
    description: "Show the sync history in chronological order.",
  },
];
