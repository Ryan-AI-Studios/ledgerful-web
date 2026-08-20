import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { githubActionInputs } from "@/lib/content/docs-pages";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";
import { launchTruth } from "@/lib/content/launch-facts";

export const metadata: Metadata = {
  title: { absolute: "GitHub Action — Ledgerful Docs" },
  description: pageDescriptions.docsGithubAction,
  alternates: { canonical: "/docs/github-action" },
  openGraph: { url: "/docs/github-action", images: [homeOgImage] },
  twitter: { images: [homeOgImage.url] },
};

/** Public action pin example — 40-char SHA (no Action GitHub Release tags). */
const ACTION_USES_PIN =
  "Ryan-AI-Studios/ledgerful-action@bacf400797142884c46e97c6ce755b7ef7433a53";

export default function DocsGithubActionPage() {
  const { githubAction, release } = launchTruth.facts;

  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · GitHub Action</p>
        <h1>Add risk comments to pull requests.</h1>
        <StatusPill maturity="available" deployment="runs-locally" />
        <p>
          {githubAction.value}. The public Action runs the real Ledgerful
          engine binary in your runner over a PR diff and posts a change-risk
          summary. Pin a version — this is not a Marketplace listing and not the
          planned hosted GitHub App.
        </p>
      </section>

      {/* ── Section 1: Action vs GitHub App ──────────────────── */}
      <section className="content-band">
        <SectionHeading title="GitHub Action vs GitHub App (planned)">
          The Ledgerful GitHub Action is a self-managed CI workflow you add to
          your own repository. A hosted GitHub App is a separate, hosted-planned
          feature that does not exist yet.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>GitHub Action (this page):</strong> A reusable workflow step
            that runs inside your own GitHub Actions CI environment. You control
            the workflow YAML, the permissions, and the token. Install from the
            public repo{" "}
            <a
              href="https://github.com/Ryan-AI-Studios/ledgerful-action"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              Ryan-AI-Studios/ledgerful-action
              <span className="sr-only"> (opens in new tab)</span>
            </a>{" "}
            with a pinned ref. Not listed on the GitHub Marketplace.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Hosted GitHub App:</strong>{" "}
            <StatusPill maturity="planned" deployment="hosted" /> A future hosted control-plane
            integration that would allow installing Ledgerful as a GitHub App
            without managing workflow YAML. This is planned and does not
            exist yet.
          </p>
        </div>
      </section>

      {/* ── Section 2: Version and pin honesty ─────────────────── */}
      <section className="content-band">
        <SectionHeading title="Version and pin honesty">
          {githubAction.value}. Pin both the Action ref and the engine binary
          version you trust.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Action package:</strong> Use{" "}
            <code>uses: {ACTION_USES_PIN}</code> (or a commit SHA). Prefer a pin
            you have reviewed; do not assume Marketplace or floating{" "}
            <code>@latest</code>.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Engine binary:</strong> Set{" "}
            <code>ledgerful-version</code> to a published engine tag (current
            Latest is {release.tag}). The Action default tracks the published
            engine tag last written into action.yml at the last Action-repo bump;
            later engine tags require another Action bump. Prefer also
            setting <code>ledgerful-checksum</code> from the matching release{" "}
            <code>.sha256</code> asset.
          </p>
          <p style={{ marginTop: "12px" }}>{githubAction.note}</p>
        </div>
      </section>

      {/* ── Section 3: Workflow YAML ──────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Workflow YAML">
          Add this step to a workflow triggered on <code>pull_request</code>{" "}
          events. The action needs <code>pull-requests: write</code> (and often{" "}
          <code>checks: write</code>) to post results, and{" "}
          <code>contents: read</code> to check out the repository and download
          the pinned release.
        </SectionHeading>
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            overflowX: "auto",
            marginBottom: "20px",
          }}
        >
          <pre style={{ background: "var(--surface)", whiteSpace: "pre" }}>
            <code>
              {`name: Ledgerful Risk Scan

on:
  pull_request:
    branches: [main]

permissions:
  pull-requests: write
  checks: write
  contents: read

jobs:
  risk-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: ${ACTION_USES_PIN}
        # note: pin Action ref (40-char SHA) + ledgerful-version; not Marketplace
        with:
          github-token: `}
              {"${{ secrets.GITHUB_TOKEN }}"}
              {`
          ledgerful-version: ${release.tag}
          # ledgerful-checksum: <sha256 of the matching platform archive>
          report-path: ledgerful-pr-report.json
          fail-on: high`}
            </code>
          </pre>
        </div>
        <div className="disclosure-notice">
          <strong>Token value:</strong> Always use{" "}
          <code>{"${{ secrets.GITHUB_TOKEN }}"}</code> — the built-in token
          provided by GitHub Actions. Do not create a personal access token for
          this purpose. The action only needs the permissions required for
          release download and PR / check posting. Prefer pinning a commit SHA
          for the Action ref in production workflows when supply-chain policy
          requires it.
        </div>
      </section>

      {/* ── Section 4: Inputs reference ──────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Inputs reference">
          Inputs match the public{" "}
          <code>Ryan-AI-Studios/ledgerful-action</code>{" "}
          <code>action.yml</code>. Defaults are shown where the Action declares
          them.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table className="trust-table" aria-label="GitHub Action inputs">
            <thead>
              <tr>
                <th scope="col">Input</th>
                <th scope="col">Required</th>
                <th scope="col">Default</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {githubActionInputs.map((input) => (
                <tr key={input.name}>
                  <th scope="row">
                    <code>{input.name}</code>
                  </th>
                  <td>{input.required ? "Yes" : "No"}</td>
                  <td>
                    {input.defaultValue ? (
                      <code>{input.defaultValue}</code>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td>{input.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Doc nav ───────────────────────────────────────────── */}
      <section className="content-band">
        <div className="doc-nav">
          <Link href="/docs/mcp">← MCP setup</Link>
          <Link href="/docs/compliance">Compliance export →</Link>
        </div>
      </section>
    </PageShell>
  );
}
