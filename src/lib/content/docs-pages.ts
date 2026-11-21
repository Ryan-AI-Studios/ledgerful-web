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
 * GitHub Action inputs from action.yml at a867acedfb80798c4d96bea9f68020b2f899b3bd.
 */
export const githubActionInputs: GithubActionInput[] = [
  {
    name: "ledgerful-version",
    required: false,
    defaultValue: "v0.2.14",
    description:
      "Pinned Ledgerful engine release version to run. Set a published version explicitly to use an engine tag other than the pinned Action commit’s default.",
  },
  {
    name: "ledgerful-checksum",
    required: false,
    description:
      "SHA-256 checksum of the pinned release archive (.tar.gz/.zip) for the runner OS/arch. Verified against the downloaded archive before extraction. The input has no default. Workflow A requires a checksum at runtime. Workflow B uses the scan report.",
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
      "Optional job-failure threshold (low, medium, or high). It does not change the posted check-run conclusion.",
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
