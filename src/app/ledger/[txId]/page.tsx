import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { LedgerVerifier } from "@/components/ledger-verifier";
import {
  getPublicLedgerEntries,
  getPublicLedgerEntryByTxId,
} from "@/lib/content/public-ledger";
import { homeOgImage } from "@/lib/content/navigation";

export function generateStaticParams(): { txId: string }[] {
  return getPublicLedgerEntries().map((entry) => ({ txId: entry.tx_id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ txId: string }>;
}): Promise<Metadata> {
  const { txId } = await params;
  const entry = getPublicLedgerEntryByTxId(txId);
  return {
    title: entry?.summary ?? `Ledger entry ${txId}`,
    description: entry?.reason ?? `Public ledger entry ${txId}`,
    alternates: {
      canonical: `/ledger/${txId}`,
    },
    openGraph: {
      url: `/ledger/${txId}`,
      images: [homeOgImage],
    },
    twitter: {
      images: [homeOgImage.url],
    },
  };
}

export const dynamicParams = false;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

function truncateHex(hex: string | null, n = 12): string {
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

export default async function LedgerEntryPage({
  params,
}: {
  params: Promise<{ txId: string }>;
}) {
  const { txId } = await params;
  const entry = getPublicLedgerEntryByTxId(txId);

  if (!entry) {
    return (
      <PageShell>
        <section className="page-hero compact">
          <h1>Entry not found</h1>
          <p>
            No ledger entry with tx_id <code>{txId}</code> exists in this
            sample.
          </p>
          <Link href="/ledger" className="button-secondary">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to ledger
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Public ledger entry</p>
        <h1 className="technical-token">{entry.summary ?? "Ledger entry"}</h1>
        <p className="technical-token">tx_id: {entry.tx_id}</p>
      </section>

      <section className="content-band">
        <div className="ledger-entry-detail">
          <SectionHeading title="Entry details" />
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Signed fields (<code>summary</code>, <code>reason</code>) are displayed
            with email addresses and sign-off lines masked for readability. The
            downloadable bundle preserves the original signed bytes so Ed25519
            verification remains valid.
          </p>
          <dl className="ledger-detail-list">
            <div>
              <dt>tx_id</dt>
              <dd className="mono">{entry.tx_id}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{entry.category ?? "—"}</dd>
            </div>
            <div>
              <dt>Summary</dt>
              <dd>{displayMask(entry.summary)}</dd>
            </div>
            <div>
              <dt>Reason</dt>
              <dd className="ledger-reason">{displayMask(entry.reason)}</dd>
            </div>
            <div>
              <dt>Committed at</dt>
              <dd>{formatDate(entry.committed_at)}</dd>
            </div>
            <div>
              <dt>Risk level</dt>
              <dd>{entry.risk_level ?? "—"}</dd>
            </div>
            <div>
              <dt>Author pseudonym</dt>
              <dd className="mono" title={entry.author_pseudonym ?? undefined}>
                {entry.author_pseudonym ?? "—"}
              </dd>
            </div>
            <div>
              <dt>Verification result</dt>
              <dd>{entry.verification_result ?? "not recorded"}</dd>
            </div>
            <div>
              <dt>Verification duration (ms)</dt>
              <dd>{entry.verification_duration_ms ?? "not recorded"}</dd>
            </div>
            <div>
              <dt>Signature</dt>
              <dd className="mono" title={entry.signature ?? undefined}>
                {truncateHex(entry.signature, 16)}
              </dd>
            </div>
            <div>
              <dt>Public key</dt>
              <dd className="mono" title={entry.public_key ?? undefined}>
                {truncateHex(entry.public_key, 16)}
              </dd>
            </div>
            <div>
              <dt>Entry hash</dt>
              <dd className="mono" title={entry.entry_hash ?? undefined}>
                {truncateHex(entry.entry_hash, 16)}
              </dd>
            </div>
            <div>
              <dt>Previous hash</dt>
              <dd className="mono">
                {entry.prev_hash ?? "not present in sample"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="content-band">
        <SectionHeading title="Verify this entry" />
        <p className="ledger-verify-hint">
          Click below to verify this entry with WebCrypto: v1 rows run full
          Ed25519 offline; v2 rows show the redaction honesty fence and point to
          local <code>ledgerful verify --signatures</code>.
        </p>
        <LedgerVerifier entries={[entry]} />
      </section>

      <section className="content-band">
        <div className="ledger-actions">
          <Link href="/ledger" className="button-secondary">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to ledger
          </Link>
          <a
            href="/ledger/verifier.html"
            target="_blank"
            rel="noopener noreferrer"
            className="button-secondary"
          >
            <FileText size={18} aria-hidden="true" />
            Offline verifier
          </a>
          <a
            href="/ledger/entries.ndjson"
            download
            className="button-secondary"
          >
            <Download size={18} aria-hidden="true" />
            Download entries.ndjson
          </a>
        </div>
      </section>
    </PageShell>
  );
}
