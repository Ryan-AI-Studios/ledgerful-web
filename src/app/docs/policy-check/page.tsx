import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import {
  policyCheckBaseBranchConstraint,
  policyCheckHonestLimit,
  policyCiPermissions,
  policyCiWorkflowYaml,
  policyJsonExample,
  policyRules,
  policyTomlCiSafe,
  policyTomlFull,
} from "@/lib/content/policy-check";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: { absolute: "Policy check — Ledgerful Docs" },
  description: pageDescriptions.docsPolicyCheck,
  alternates: { canonical: "/docs/policy-check" },
  openGraph: { url: "/docs/policy-check", images: [homeOgImage] },
  twitter: { images: [homeOgImage.url] },
};

export default function DocsPolicyCheckPage() {
  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · Policy check</p>
        <h1>Gate merges on declared policy.</h1>
        <StatusPill maturity="available" deployment="runs-locally" />
        <p>
          <code>ledgerful policy check</code> evaluates a flat, named rule set
          against PR/diff/ledger state and exits nonzero on violation — offline,
          deterministic, no engine network code.
        </p>
      </section>

      <section className="content-band" id="honest-limit">
        <SectionHeading title="Honest limit">
          Policy as code is evaluation of declared rules, not a compliance
          certificate.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Honest limit:</strong> {policyCheckHonestLimit}
          </p>
        </div>
      </section>

      <section className="content-band" id="availability">
        <SectionHeading title="Availability">
          The command is on the public engine source. Install from source (or a
          release binary that includes it).
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Source install (includes policy check):</strong>
          </p>
          <pre style={{ marginTop: "12px", whiteSpace: "pre-wrap" }}>
            <code>
              {`cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful --locked`}
            </code>
          </pre>
          <p style={{ marginTop: "12px" }}>
            The v0.1.8 prebuilt release binaries predate this command. Use a
            source install, or a later release that ships{" "}
            <code>policy check</code>, until the next numbered release catches
            up. Confirm with <code>ledgerful policy check --help</code>.
          </p>
        </div>
      </section>

      <section className="content-band" id="base-branch">
        <SectionHeading title="Base-branch policy constraint">
          Read this before wiring CI.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Bypass-proof default:</strong> {policyCheckBaseBranchConstraint}
          </p>
          <p style={{ marginTop: "12px" }}>
            When you run{" "}
            <code>ledgerful policy check --pr origin/main...HEAD</code>,
            Ledgerful loads <code>.ledgerful/policy.toml</code> via{" "}
            <code>git show &lt;base_ref&gt;:.ledgerful/policy.toml</code>. A
            policy change only takes effect after it is merged to the base
            branch. To pin an org-level file instead, pass{" "}
            <code>--policy /path/to/org-policy.toml</code> (trusted path).
          </p>
        </div>
      </section>

      <section className="content-band" id="invocation">
        <SectionHeading title="Invocation">
          Human report by default; machine JSON for CI wrappers.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>
              {`ledgerful policy check
ledgerful policy check --pr origin/main...HEAD
ledgerful policy check --pr origin/main...HEAD --fail-on high
ledgerful policy check --policy .ledgerful/policy.toml
ledgerful policy check --pr origin/main...HEAD --format json`}
            </code>
          </pre>
        </div>
        <div className="table-scroll-wrapper" style={{ marginTop: "20px" }}>
          <table className="trust-table" aria-label="policy check flags">
            <thead>
              <tr>
                <th scope="col">Flag</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <code>--pr &lt;range&gt;</code>
                </th>
                <td>
                  PR-style range (<code>base...head</code>, <code>base..head</code>
                  , or bare <code>base</code>). Evaluates the{" "}
                  <strong>committed range</strong> only.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>--fail-on &lt;level&gt;</code>
                </th>
                <td>
                  Override config <code>rules.fail_on</code> for this run:{" "}
                  <code>off</code> | <code>low</code> | <code>medium</code> |{" "}
                  <code>high</code>.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>--policy &lt;path&gt;</code>
                </th>
                <td>
                  Trusted policy file (org/CI). Skips base-branch and
                  working-tree resolution.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  <code>--format json|text</code>
                </th>
                <td>
                  Machine contract (<code>json</code>) or human report (
                  <code>text</code>, default).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="content-band" id="evaluation-target">
        <SectionHeading title="Evaluation target">
          Local mode predicts CI for committed content and still catches
          pending work before push.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table className="trust-table" aria-label="policy evaluation targets">
            <thead>
              <tr>
                <th scope="col">Mode</th>
                <th scope="col">What is inspected</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <code>--pr</code>
                </th>
                <td>
                  Committed range only — risk from the PR diff; committed ledger
                  signatures and bound verification runs when a ledger DB is
                  presented. Does not inspect pending DB transactions or the
                  sidecar.
                </td>
              </tr>
              <tr>
                <th scope="row">Local / default</th>
                <td>
                  Pending ledger txs, the <code>pending_hook_tx</code> sidecar,
                  and working-tree risk when evaluable.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "20px" }}>
          <p>
            <strong>Git-only vs ledger-backed:</strong>{" "}
            <code>.ledgerful/</code> is gitignored (state stays local). Force-add{" "}
            <code>policy.toml</code> for CI. Clean runners have no{" "}
            <code>ledger.db</code> unless your pipeline presents one. Use
            CI-safe rules (git-evaluable only) on the base branch unless you
            restore a ledger artifact.
          </p>
        </div>
      </section>

      <section className="content-band" id="rules">
        <SectionHeading title="Built-in rules">
          Named, parameterized rules in a flat TOML config. No expression-language
          DSL.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table className="trust-table" aria-label="built-in policy rules">
            <thead>
              <tr>
                <th scope="col">Rule id</th>
                <th scope="col">Default (local / full)</th>
                <th scope="col">Behavior</th>
              </tr>
            </thead>
            <tbody>
              {policyRules.map((rule) => (
                <tr key={rule.id}>
                  <th scope="row">
                    <code>{rule.id}</code>
                  </th>
                  <td>{rule.defaultLocal}</td>
                  <td>{rule.behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="content-band" id="config">
        <SectionHeading title="Config examples">
          Flat <code>.ledgerful/policy.toml</code>. Force-add it so the base
          branch can serve it via <code>git show</code>.
        </SectionHeading>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 720,
            marginBottom: "12px",
            color: "var(--ink)",
          }}
        >
          CI-safe (recommended base branch)
        </h3>
        <div className="terminal-window" style={{ marginBottom: "24px" }}>
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{policyTomlCiSafe}</code>
          </pre>
        </div>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 720,
            marginBottom: "12px",
            color: "var(--ink)",
          }}
        >
          Full local / ledger-backed
        </h3>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{policyTomlFull}</code>
          </pre>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "20px" }}>
          <p>
            <strong>Presets:</strong> <code>observe</code> evaluates and warns
            but always exits 0. <code>enforce</code> blocks (nonzero exit) on
            violations. These presets subsume <code>gate.mode</code> (observe /
            enforce) without a breaking change — mode transitions still write
            signed MAINTENANCE ledger entries. Policy and mode never enter the
            Ed25519 signing basis.
          </p>
        </div>
      </section>

      <section className="content-band" id="json-contract">
        <SectionHeading title="JSON machine contract">
          <code>--format json</code> is the machine contract for CI wrappers
          (including the GitHub Action surface). Versioned; camelCase.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{policyJsonExample}</code>
          </pre>
        </div>
        <p style={{ marginTop: "16px", color: "var(--muted)" }}>
          Per violation: <code>ruleId</code>, <code>file</code>,{" "}
          <code>line</code>, <code>message</code>, <code>severity</code>.{" "}
          <code>passed</code> is true only when there are zero violations.
          Optional <code>notes</code> is omitted when empty.
        </p>
      </section>

      <section className="content-band" id="ci">
        <SectionHeading title="CI usage and permissions">
          Pairs with the GitHub Action surface: <code>policy check</code> only
          evaluates and exits; posting comments or check-runs stays in the Action
          wrapper.
        </SectionHeading>
        <div className="table-scroll-wrapper" style={{ marginBottom: "24px" }}>
          <table className="trust-table" aria-label="CI permissions for policy check">
            <thead>
              <tr>
                <th scope="col">Permission</th>
                <th scope="col">Why</th>
              </tr>
            </thead>
            <tbody>
              {policyCiPermissions.map((row) => (
                <tr key={row.permission}>
                  <th scope="row">
                    <code>{row.permission}</code>
                  </th>
                  <td>{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{policyCiWorkflowYaml}</code>
          </pre>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "20px" }}>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            <li>
              Prefer a committed base-branch <code>policy.toml</code> with{" "}
              <code>preset = &quot;enforce&quot;</code> and CI-safe rules. If
              the base has no policy file, <code>--pr</code> synthesizes the
              same CI-safe enforce defaults (
              <code>policySource: &quot;synthesized&quot;</code>).
            </li>
            <li>
              <code>fetch-depth: 0</code> (or an explicit fetch of the base ref)
              is required so <code>git show</code> can resolve the base policy.
            </li>
            <li>
              To enforce ledger-backed rules in CI, present a ledger artifact
              and enable those rules on the base branch.
            </li>
            <li>
              The engine path is offline: no network crates on the policy path.
              Network posting (if any) belongs to the Action wrapper, never the
              engine.
            </li>
          </ul>
        </div>
        <p style={{ marginTop: "20px" }}>
          Related:{" "}
          <Link href="/docs/github-action" className="inline-link">
            GitHub Action docs
          </Link>{" "}
          (Action install status is separate from this CLI gate) and the{" "}
          <Link href="/trust#policy-as-code" className="inline-link">
            Trust policy-as-code summary
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
