/**
 * Policy-check public content for Trust + /docs/policy-check.
 *
 * Source of truth for behavior: engine `docs/policy-check.md` (track 0049).
 * Public claims stay within shipped CLI evaluation only — not certification.
 */

export const policyCheckHonestLimit =
  "policy check evaluates the declared rules over the presented ledger and risk inputs. It is not a compliance verdict, certification, or proof that a change is safe. Chain continuity strengthens the presented ledger; it is still not a substitute for your org's change-management process.";

export const policyCheckBaseBranchConstraint =
  "In CI the enforced policy is the base branch's (or a trusted --policy path), not your PR's. Edits to .ledgerful/policy.toml in a PR branch do not change the gate until they are merged and reviewed on the base branch.";

export type PolicyRule = {
  id: string;
  defaultLocal: string;
  behavior: string;
};

export const policyRules: PolicyRule[] = [
  {
    id: "require_signed_entries",
    defaultLocal: "on",
    behavior:
      "Any committed entry with missing or invalid signature/public_key is a violation. Fail-closed if the ledger database is absent (present an artifact or disable the rule).",
  },
  {
    id: "no_pending_tx",
    defaultLocal: "on",
    behavior:
      "Local only: pending ledger transactions and the pending_hook_tx sidecar are violations. Skipped under --pr (committed range only).",
  },
  {
    id: "verification_must_pass",
    defaultLocal: "on",
    behavior:
      "A bound verification run for the evaluation target must pass. Fail-closed if the ledger database is absent or no bound run exists. Under --pr, every changed path needs a covering bound run (newest covering run is decisive).",
  },
  {
    id: "max_risk_without_adr",
    defaultLocal: "high",
    behavior:
      "When risk is at or above the threshold, every changed path needs covering ADR evidence for this change set. Set to off to disable.",
  },
  {
    id: "fail_on",
    defaultLocal: "high",
    behavior:
      "When risk is at or above the threshold, emit a violation. Risk uses the same levels as scan --pr. Set to off to disable.",
  },
];

export type PolicyCiPermission = {
  permission: string;
  why: string;
};

export const policyCiPermissions: PolicyCiPermission[] = [
  {
    permission: "contents: read",
    why: "Checkout and git show of the base-branch policy file.",
  },
  {
    permission: "pull-requests: read",
    why: "Optional Action wrapper may read PR metadata for annotations.",
  },
  {
    permission: "checks: write",
    why: "Optional: native check-run from the 0047 Action wrapper. Not required for policy check itself.",
  },
];

/** CI-safe base-branch policy example (git-evaluable rules only). */
export const policyTomlCiSafe = `# .ledgerful/policy.toml  (force-add; .ledgerful/ is gitignored)
preset = "enforce"

[rules]
require_signed_entries = false   # needs presented ledger.db
no_pending_tx = true             # skipped under --pr; useful locally
verification_must_pass = false   # needs presented ledger.db + bound runs
max_risk_without_adr = "high"    # off | low | medium | high
fail_on = "high"                 # off | low | medium | high
`;

/** Full local / ledger-backed policy example. */
export const policyTomlFull = `preset = "enforce"

[rules]
require_signed_entries = true
no_pending_tx = true
verification_must_pass = true
max_risk_without_adr = "high"
fail_on = "high"
`;

/** Minimal CI workflow: policy check only evaluates + exits; posting is the Action wrapper. */
export const policyCiWorkflowYaml = `name: Ledgerful policy gate

on:
  pull_request:

permissions:
  contents: read
  pull-requests: read
  checks: write

jobs:
  policy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install ledgerful
        run: cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful --locked

      - name: Policy check
        run: |
          ledgerful policy check \\
            --pr origin/\${{ github.base_ref }}...HEAD \\
            --format json \\
            --fail-on high
`;

export const policyJsonExample = `{
  "schemaVersion": 1,
  "violations": [
    {
      "ruleId": "no_pending_tx",
      "file": ".ledgerful/state/ledger.db",
      "line": null,
      "message": "pending ledger transaction a1b2c3d4 (entity=src/foo.rs)",
      "severity": "error"
    }
  ],
  "passed": false,
  "mode": "enforce",
  "policySource": "base-branch"
}
`;
