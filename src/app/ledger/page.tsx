import type { Metadata } from "next";
import Link from "next/link";
import { Download, ShieldCheck, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import {
  getPublicLedgerEntries,
  getPublicLedgerManifest,
} from "@/lib/content/public-ledger";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Public ledger — Ledgerful's development change ledger",
  description: pageDescriptions.ledger,
  alternates: {
    canonical: "/ledger",
  },
  openGraph: {
    url: "/ledger",
    images: [homeOgImage],
  },
  twitter: {
    images: [homeOgImage.url],
  },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncateHex(hex: string | null, n = 8): string {
  if (!hex) return "—";
  if (hex.length <= n + 5) return hex;
  return `${hex.slice(0, n)}…${hex.slice(-4)}`;
}

function displayMask(text: string | null): string {
  if (!text) return "—";
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
    .replace(/((?:Signed-off-by|Co-Authored-by):\s*)([^\u003c\n\r]+)/gi, "$1[REDACTED_NAME]");
}

export default function LedgerPage() {
  const allEntries = getPublicLedgerEntries();
  const manifest = getPublicLedgerManifest();

  const MAX_PAGE_ENTRIES = 20;
  const entries = allEntries.slice(0, MAX_PAGE_ENTRIES);
  const remainingCount = allEntries.length - entries.length;

  return (
    <PageShell>
      <section className="ledger-hero page-hero compact">
        <p className="hero-kicker">Public ledger</p>
        <h1>Ledgerful&apos;s development ledger, signed and verifiable.</h1>
        <p>
          A redacted, cryptographically signed sample of the Ledgerful engine&apos;s
          own change ledger. Every entry carries an Ed25519 signature you can
          verify in the browser, with no backend call.
        </p>
      </section>

      <section className="content-band">
        <div className="ledger-honest-ceiling disclosure-notice">
          <p>
            <strong>What this proves:</strong> each entry&apos;s Ed25519 signature.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>What this does not prove:</strong> the order or set of
            entries (chain continuity) or the identity behind the signing key.
            Out-of-band fingerprint comparison is required before treating a key
            as authentic.
          </p>
          <p style={{ marginTop: "12px" }}>
            This is a sample of the engine&apos;s development ledger; the publishing
            cron is disabled. Chain linkage (&quot;prev_hash&quot;) is not present in
            this sample.
          </p>
          <p style={{ marginTop: "12px" }}>
            <strong>Redaction note:</strong> signed fields are published
            byte-exact so verification stays valid. Author identity is replaced
            by an HMAC pseudonym. A small number of entries with third-party PII
            embedded in their signed text are excluded rather than altered.
          </p>
        </div>
      </section>

      <section className="content-band">
        <div className="ledger-stats">
          <div className="ledger-stat">
            <span className="ledger-stat-value">{manifest.entryCount}</span>
            <span className="ledger-stat-label">Entries</span>
          </div>
          <div className="ledger-stat">
            <span className="ledger-stat-value">
              {formatDate(manifest.timeRange.first)}
            </span>
            <span className="ledger-stat-label">First entry</span>
          </div>
          <div className="ledger-stat">
            <span className="ledger-stat-value">
              {formatDate(manifest.timeRange.last)}
            </span>
            <span className="ledger-stat-label">Last entry</span>
          </div>
          <div className="ledger-stat">
            <span className="ledger-stat-value">
              {formatDate(manifest.generatedAt)}
            </span>
            <span className="ledger-stat-label">Generated</span>
          </div>
        </div>
      </section>

      <section className="content-band">
        <SectionHeading title="Ledger entries">
          Each row links to its entry detail page where the signature
          verification controls are shown. The full bundle is downloadable
          below.
        </SectionHeading>

        <div className="table-scroll">
          <table className="ledger-table">
            <thead>
              <tr>
                <th scope="col">tx_id</th>
                <th scope="col">Category</th>
                <th scope="col">Summary</th>
                <th scope="col">Committed</th>
                <th scope="col">Risk</th>
                <th scope="col">Author</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const signed = Boolean(entry.signature && entry.public_key);
                return (
                  <tr key={entry.tx_id} data-ledger-row>
                    <td className="mono">
                      <a
                        href={`/ledger/${entry.tx_id}`}
                        className="inline-link"
                        title={entry.tx_id}
                      >
                        {truncateHex(entry.tx_id, 12)}
                      </a>
                    </td>
                    <td>{entry.category ?? "—"}</td>
                    <td className="ledger-summary-cell">
                      {displayMask(entry.summary)}
                    </td>
                    <td>{formatDate(entry.committed_at)}</td>
                    <td>{entry.risk_level ?? "—"}</td>
                    <td className="mono" title={entry.author_pseudonym ?? ""}>
                      {truncateHex(entry.author_pseudonym, 10)}
                    </td>
                    <td>{signed ? "signed" : "unsigned"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          {remainingCount > 0 && (
            <p className="ledger-remaining-note" style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "16px" }}>
              Showing the {entries.length} most recent entries. {remainingCount} earlier
              entries are in the{" "}
              <a href="/ledger/entries.ndjson" download className="inline-link">
                full download
              </a>
              .
            </p>
          )}
      </section>

      <section className="content-band">
        <SectionHeading title="Verify and download">
          Open the offline verifier to check all entry signatures in your
          browser, or download the raw bundle.
        </SectionHeading>
        <div className="ledger-actions">
          <a
            href="/ledger/verifier.html"
            target="_blank"
            rel="noopener noreferrer"
            className="button-primary"
          >
            <ShieldCheck size={18} aria-hidden="true" />
            Verify entries (offline verifier)
          </a>
          <a
            href="/ledger/entries.ndjson"
            download
            className="button-secondary"
          >
            <Download size={18} aria-hidden="true" />
            Download entries.ndjson
          </a>
          <Link href="/docs/public-ledger" className="button-secondary">
            Read the docs
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
