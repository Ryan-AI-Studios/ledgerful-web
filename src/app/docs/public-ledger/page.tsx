import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { publicLedgerAllowlist } from "@/lib/content/public-ledger";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "Public ledger — documentation",
  description: pageDescriptions.ledger,
  alternates: {
    canonical: "/docs/public-ledger",
  },
  openGraph: {
    url: "/docs/public-ledger",
    images: [homeOgImage],
  },
  twitter: {
    images: [homeOgImage.url],
  },
};

export default function DocsPublicLedgerPage() {
  return (
    <PageShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="page-hero compact">
        <p className="hero-kicker">Docs · Public ledger</p>
        <h1>Public ledger.</h1>
        <StatusPill maturity="available" deployment="runs-locally" />
        <p>
          Ledgerful publishes its own development change ledger as a redacted,
          signed, browser-verifiable bundle at{" "}
          <Link href="/ledger" className="inline-link">
            /ledger
          </Link>
          .
        </p>
      </section>

      {/* ── What it is ───────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="What it is">
          Ledgerful&apos;s own development change ledger, published as a
          redacted, cryptographically verifiable static bundle at{" "}
          <Link href="/ledger" className="inline-link">
            /ledger
          </Link>
          . Every entry carries a real Ed25519 signature from the engine&apos;s
          commit hook. Offline browser re-verify works for legacy v1 payloads;
          v2 provenance fields may be redacted, so the offline verifier fences
          full re-verify and points to local{" "}
          <code>ledgerful verify --signatures</code>.
        </SectionHeading>
      </section>

      {/* ── What it proves ─────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="What it proves">
          For v1 (or missing <code>sig_version</code>) rows: Ed25519 over the
          published five-field basis via WebCrypto — no backend call. For v2
          rows: signature presence and an honest fence when free-text provenance
          is redacted from the public allowlist.
        </SectionHeading>
      </section>

      {/* ── Honest ceiling ─────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="What it does not prove">
          Chain continuity as a full walk, signer identity without an out-of-band
          key pin, or full v2 free-text provenance when those fields are redacted.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Honest ceiling:</strong> the public ledger proves v1 entry
            signatures offline and publishes signed material for inspection. It
            does not prove order/set alone, key identity without a pin, or
            offline re-verify of redacted v2 provenance — use local CLI for that.
          </p>
        </div>
      </section>

      {/* ── Allowlist ────────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="The allowlist">
          Only these fields are published:
        </SectionHeading>
        <ul className="doc-allowlist">
          {publicLedgerAllowlist.map((field) => (
            <li key={field}>
              <code>{field}</code>
            </li>
          ))}
        </ul>
        <div className="disclosure-notice" style={{ marginTop: "24px" }}>
          <p>
            <strong>Author identity is a pseudonym.</strong> The{" "}
            <code>author_pseudonym</code> field is computed as HMAC-SHA256 over
            the author identity using a local secret key. The same author always
            produces the same pseudonym, so attribution patterns are
            correlatable, but the real identity is not recoverable from the
            bundle.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Redactions:</strong> file paths, entity names, author email,
            author name, commit messages beyond the published summary and
            reason, argv, environment variables, hostnames, machine
            identifiers, and internal ticket or PR numbers are removed. Email
            addresses and sign-off lines inside <code>summary</code> or{" "}
            <code>reason</code> are kept byte-exact in the bundle (editing them
            would break Ed25519 signatures) and masked at display time in the
            web UI. Entries with third-party PII in signed text are excluded
            from the bundle entirely.
          </p>
        </div>
      </section>

      {/* ── How to verify ────────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="How to verify">
          You can verify entries without installing Ledgerful.
        </SectionHeading>
        <ol className="doc-step-list">
          <li>
            Open the on-site verifier at{" "}
            <Link href="/ledger" className="inline-link">
              /ledger
            </Link>{" "}
            and click <strong>Verify all signatures</strong>.
          </li>
          <li>
            Open the offline verifier at{" "}
            <a
              href="/ledger/verifier.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              /ledger/verifier.html
              <span className="sr-only"> (opens in new tab)</span>
            </a>{" "}
            — it works from <code>file://</code> with no network.
          </li>
          <li>
            Or use the CLI fallback: run{" "}
            <code>ledgerful verify --signatures</code> against a local repo
            that has the ledger bundle.
          </li>
        </ol>
      </section>

      {/* ── Thin chain head ──────────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Thin signed chain head">
          A stable thin head artifact is published alongside the full bundle.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>URL:</strong>{" "}
            <a href="/ledger/chain_head.json" className="inline-link">
              /ledger/chain_head.json
            </a>{" "}
            (canonical production:{" "}
            <code>https://www.ledgerful.dev/ledger/chain_head.json</code>
            ; same shape as <code>ledgerful export head</code> /
            <code>manifest.chainHead</code>:{" "}
            <code>latest_entry_hash</code>, <code>genesis</code>,{" "}
            <code>length</code>, signature fields when signed).
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Checkpoint semantics:</strong> download the public head,
            then compare your <em>local</em> workspace ledger against it. The
            local chain must <strong>extend or equal</strong> the published
            checkpoint (same genesis; hash at public <code>length</code>{" "}
            matches). That detects local rollback/rewrite relative to the
            published head — not “the public site proves your private product
            history.” Customer repos still need their own off-machine retention
            (operator path: <code>export head</code> + retain +{" "}
            <code>verify --against-export</code>).
          </p>
          <pre
            className="doc-code-block"
            style={{
              marginTop: "16px",
              overflow: "auto",
              padding: "12px 16px",
              background: "var(--surface-2, var(--surface))",
              borderRadius: "8px",
              fontSize: "0.875rem",
            }}
          >
{`curl -fsSL -o head.json https://www.ledgerful.dev/ledger/chain_head.json
ledgerful verify --signatures --against-export .\\head.json`}
          </pre>
          <p style={{ marginTop: "12px" }}>
            There is no <code>verify --against-url</code> (path-only by design).
            Compose <code>curl</code> + <code>--against-export</code> as above.
            No Rekor / multi-party transparency log is claimed.
          </p>
        </div>
      </section>

      {/* ── No network, local generation ───────────────────── */}
      <section className="content-band">
        <SectionHeading title="Export-then-commit (no data sent anywhere)">
          The public ledger is generated locally with{" "}
          <code>ledgerful ledger export-public</code>, then committed into this
          web repository. No data is sent to a Ledgerful server. GitHub-hosted
          CI validates committed artifacts; it does not invent ledger history.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>Publish path:</strong> on a machine that holds the engine{" "}
            <code>.ledgerful</code> state (and bot key for{" "}
            <code>--sign</code>), run{" "}
            <code>ledgerful ledger export-public --output &lt;dir&gt; --sign</code>{" "}
            or enable the helper{" "}
            <code>scripts/publish-public-ledger.mjs</code> with{" "}
            <code>LEDGERFUL_PUBLISH_LEDGER_ENABLED=1</code>. Copy artifacts into{" "}
            <code>public/ledger/</code> (entries, manifest, README,{" "}
            <code>manifest.sig</code>/<code>manifest.pub</code>,{" "}
            <code>chain_head.json</code>) and open a PR. There is no engine{" "}
            <code>publish-public</code> command.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>CSP dual-file verifier:</strong> production{" "}
            <code>verifier.html</code> + <code>verifier.js</code> are never
            overwritten by the publish helper (track 0075).
          </p>
        </div>
      </section>

      {/* ── Publishing helper ships disabled ───────────────────── */}
      <section className="content-band">
        <SectionHeading title="Publishing helper">
          The web publish helper ships disabled. It is opt-in only, default off.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            The web helper script{" "}
            <code>scripts/publish-public-ledger.mjs</code> ships disabled. Enable
            it with{" "}
            <code>LEDGERFUL_PUBLISH_LEDGER_ENABLED=1</code>. It runs in your own
            environment (portable <code>LEDGERFUL_ENGINE_REPO</code>, default{" "}
            <code>../ledgerful</code>), prefers <code>--sign</code>, writes{" "}
            <code>chain_head.json</code>, and by default only copies artifacts
            (set <code>LEDGERFUL_PUBLISH_LEDGER_COMMIT=1</code> for optional
            auto-commit). Manifest and chain-head signatures are real when the
            bot key is available.
          </p>
        </div>
      </section>

      {/* ── Trust model warning ──────────────────────────────── */}
      <section className="content-band">
        <SectionHeading title="Trust model warning">
          Treat the public ledger as a signed sample, not a trust anchor.
        </SectionHeading>
        <div className="disclosure-notice">
          <p>
            <strong>manifest.pub originated from the same machine.</strong> The
            verifying key in this bundle came from the same environment that
            generated the ledger. A compromised machine could replace both the
            ledger data and the signing key, producing a convincing but
            fraudulent bundle.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Out-of-band verification required:</strong> to close that gap,
            the receiver must verify the public key against a trusted
            out-of-band copy of the Ed25519 fingerprint — for example, a key
            fingerprint shared over a separate secure channel, or a copy stored
            in a location independent of the machine that generated the bundle.
            Without this step, the signature proves internal consistency but not
            the authenticity of the signing key itself.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
