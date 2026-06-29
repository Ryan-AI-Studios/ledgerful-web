/**
 * Shared content model for WEB-0004 doc pages.
 * Verified against Ledgerful source: mcp/manifest.rs, action/action.yml,
 * conductor/conductor.md, and WebStartArgs.
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

/** GitHub Action inputs confirmed from action/action.yml */
export const githubActionInputs: GithubActionInput[] = [
  {
    name: "github-token",
    required: true,
    description: "GitHub token used to post and update PR risk comments. Use secrets.GITHUB_TOKEN.",
  },
  {
    name: "project-path",
    required: false,
    defaultValue: ".",
    description: "Workspace-relative path to the repository root. Defaults to the workspace root.",
  },
  {
    name: "base-ref",
    required: false,
    description: "Git ref to compare against. Defaults to the PR base branch.",
  },
  {
    name: "risk-threshold",
    required: false,
    defaultValue: "TRIVIAL",
    description: "Minimum risk level to include in the comment (TRIVIAL, LOW, MEDIUM, HIGH).",
  },
  {
    name: "fail-on-risk",
    required: false,
    description: "Set to LOW, MEDIUM, or HIGH to fail the job when risk meets or exceeds this level.",
  },
  {
    name: "ledgerful-version",
    required: false,
    description: "Git tag to install. Defaults to the latest published release.",
  },
  {
    name: "post-on-clean",
    required: false,
    defaultValue: "false",
    description: "When true, posts a comment even when no risk is detected.",
  },
];

export type SyncCommand = {
  command: string;
  description: string;
};

/** Sync subcommands confirmed from conductor.md */
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
