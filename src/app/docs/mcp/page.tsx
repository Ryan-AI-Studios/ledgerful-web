import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { mcpTools } from "@/lib/content/docs-pages";
import { StatusPill } from "@/components/status-pill";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "MCP Setup — Ledgerful Docs",
  description: pageDescriptions.docsMcp,
  alternates: { canonical: "/docs/mcp" },
};

export default function DocsMcpPage() {
  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · MCP</p>
        <h1>MCP server setup.</h1>
        <StatusPill status="beta" />
        <p>
          The Ledgerful MCP stdio server exposes 10 tools to AI assistants that
          support the Model Context Protocol.
        </p>
      </section>

      {/* ── Section 1: Package status ─────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Package status">
          The MCP server ships as part of the Ledgerful CLI. A standalone npm
          package for use with <code>npx</code> is not yet published.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>npm package pending release:</strong> The{" "}
            <code>@ledgerful/mcp-server</code> npm package is not yet published
            to the public registry. This install path is a forward reference — it
            will be available when the package is publicly released. Until then,
            use the CLI-based setup below.
          </p>
          <p style={{ marginTop: "12px" }}>
            A future release will allow starting the server with:
            <br />
            <code style={{ opacity: 0.7 }}>
              npx @ledgerful/mcp-server
            </code>{" "}
            (pending release — not yet available)
          </p>
        </div>
      </section>

      {/* ── Section 2: Start the MCP server ──────────────────── */}
      <section className="content-band">
        <SectionHeading title="Start the MCP server">
          Run <code>ledgerful mcp</code> from inside the repository root you
          want to analyze. The server reads <code>layout.root</code> from the
          current working directory — there is no <code>--root</code> flag.
        </SectionHeading>
        <div className="terminal-window">
          <div className="terminal-bar">
            <span />
            <span />
            <span />
          </div>
          <pre>
            <code>{`# From inside your target repository root:
ledgerful mcp`}</code>
          </pre>
        </div>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <strong>Working directory matters:</strong> The MCP server auto-detects
          the project root from <code>layout.root</code> in the current working
          directory. Your MCP client must launch the server from the repository
          root, not from your home directory or a parent directory. The{" "}
          <code>cwd</code> field in the client configuration is how you control
          this.
        </div>
      </section>

      {/* ── Section 3: Client configuration ──────────────────── */}
      <section className="content-band">
        <SectionHeading title="Client configuration">
          Configure your AI client to start the Ledgerful MCP server as a stdio
          process. The <code>cwd</code> field must point to your repository root.
        </SectionHeading>
        <p
          className="doc-caption"
        >
          Example configuration for Claude Desktop or a compatible MCP client:
        </p>
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
              {`{
  "mcpServers": {
    "ledgerful": {
      "command": "ledgerful",
      "args": ["mcp"],
      "cwd": "/path/to/your/repo"
    }
  }
}`}
            </code>
          </pre>
        </div>
        <p
          className="doc-caption"
        >
          Replace <code>/path/to/your/repo</code> with the absolute path to the
          repository root you want to analyze. On Windows use a backslash path
          such as <code>C:\Users\you\projects\myrepo</code>.
        </p>
      </section>

      {/* ── Section 4: MCP tools ─────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Available tools">
          The server exposes 10 tools. All tools operate over local data — no
          source code is uploaded.
        </SectionHeading>
        <div className="table-scroll-wrapper">
          <table className="trust-table" aria-label="Ledgerful MCP tools">
            <thead>
              <tr>
                <th scope="col">Tool</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {mcpTools.map((tool) => (
                <tr key={tool.name}>
                  <th scope="row">
                    <code>{tool.name}</code>
                  </th>
                  <td>{tool.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Doc nav ───────────────────────────────────────────── */}
      <section className="content-band">
        <div className="doc-nav">
          <Link href="/docs/dashboard">← Dashboard</Link>
          <Link href="/docs/github-action">GitHub Action →</Link>
        </div>
      </section>
    </PageShell>
  );
}
