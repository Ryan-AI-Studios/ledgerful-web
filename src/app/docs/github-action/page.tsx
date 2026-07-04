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

export default function DocsGithubActionPage() {
  const { githubAction, release } = launchTruth.facts;

  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · GitHub Action</p>
        <h1>Add risk comments to pull requests.</h1>
        <StatusPill status="beta" />
        <p>
          The Ledgerful GitHub Action runs a risk scan on each pull request and
          posts a structured comment with impact and risk data.
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
            the workflow YAML, the permissions, and the token. It is implemented
            in source as a beta, but is not publicly installable yet.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Hosted GitHub App:</strong>{" "}
            <StatusPill status="hosted planned" /> A future hosted control-plane
            integration that would allow installing Ledgerful as a GitHub App
            without managing workflow YAML. This is hosted planned and does not
            exist yet.
          </p>
        </div>
      </section>

      {/* ── Section 2: Version placeholder ───────────────────── */}
      <section className="content-band">
        <SectionHeading title="Version and release status">
          {githubAction.value}. When a public version is verified, pin to it
          using the format shown below.
        </SectionHeading>
        <div className="disclosure-notice">
          <strong>Version pending:</strong> Replace{" "}
          <code>{"<version>"}</code> in the workflow YAML below with the latest
          published release tag from{" "}
          {release.publiclyAvailable ? (
            <a
              href="https://github.com/Ryan-AI-Studios/Ledgerful/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              github.com/Ryan-AI-Studios/Ledgerful/releases
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          ) : (
            <code>github.com/Ryan-AI-Studios/Ledgerful/releases</code>
          )}
          . {release.note}
        </div>
      </section>

      {/* ── Section 3: Workflow YAML ──────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Workflow YAML">
          Add this step to a workflow triggered on <code>pull_request</code>{" "}
          events. The action needs two permissions: <code>pull-requests: write</code>{" "}
          to post comments, and <code>contents: read</code> to check out the
          repository.
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
  contents: read

jobs:
  risk-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: Ryan-AI-Studios/Ledgerful/action@`}
              {"<version>"}
              {`    # pending — replace with latest tag
        with:
          github-token: `}{"${{ secrets.GITHUB_TOKEN }}"}{`
          risk-threshold: TRIVIAL
          fail-on-risk: HIGH`}
            </code>
          </pre>
        </div>
        <div className="disclosure-notice">
          <strong>Token value:</strong> Always use{" "}
          <code>{"${{ secrets.GITHUB_TOKEN }}"}</code> — the built-in token
          provided by GitHub Actions. Do not create a personal access token for
          this purpose. The action only needs <code>pull-requests: write</code>{" "}
          to post PR comments and <code>contents: read</code> to access the
          repository. The <code>checks: write</code> permission is not required.
        </div>
      </section>

      {/* ── Section 4: Inputs reference ──────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Inputs reference">
          All inputs except <code>github-token</code> are optional. Defaults are
          shown where applicable.
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
