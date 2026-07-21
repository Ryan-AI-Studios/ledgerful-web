import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Build-time content module for the public ledger pages.
 *
 * These functions read the generated bundle at build time (server component,
 * Node.js fs) and return plain data. No runtime fetch, no secrets, no
 * "use client".
 */

export type PublicLedgerEntry = {
  tx_id: string;
  category: string | null;
  summary: string | null;
  reason: string | null;
  committed_at: string | null;
  author_pseudonym: string | null;
  verification_result: string | null;
  verification_duration_ms: number | null;
  risk_level: string | null;
  signature: string | null;
  public_key: string | null;
  entry_hash: string | null;
  prev_hash: string | null;
};

export type PublicLedgerManifest = {
  publisher: string;
  entryCount: number;
  timeRange: {
    first: string | null;
    last: string | null;
  };
  generatedAt: string;
  allowlist: readonly string[];
  sigAlg: string;
  bundleType: string;
  chainHeadPresent: boolean;
  files: readonly {
    name: string;
    sha256: string;
    size: number;
  }[];
  /** Present when exported by engine `ledger export-public --sign`. */
  honestCeiling?: string;
  publicKeyFingerprint?: string;
};

/** Raw engine export-public manifest (field names differ from the sample). */
type EngineExportManifest = {
  publisher?: string;
  entryCount?: number;
  generatedAt?: string;
  timeRange?: {
    first?: string | null;
    last?: string | null;
    earliest?: string | null;
    latest?: string | null;
  };
  signatureAlgorithm?: string;
  sigAlg?: string;
  allowlist?: readonly string[];
  allowlistVersion?: number;
  chainHead?: unknown;
  chainHeadPresent?: boolean;
  files?: PublicLedgerManifest["files"];
  bundleType?: string;
  honestCeiling?: string;
  publicKeyFingerprint?: string;
  entriesSha256?: string;
};

export const publicLedgerAllowlist = [
  "tx_id",
  "category",
  "summary",
  "reason",
  "committed_at",
  "author_pseudonym",
  "verification_result",
  "verification_duration_ms",
  "risk_level",
  "signature",
  "public_key",
  "entry_hash",
  "prev_hash",
] as const;

function bundlePath(relative: string): string {
  return path.join(process.cwd(), "public", "ledger", relative);
}

export function getPublicLedgerEntries(): PublicLedgerEntry[] {
  const ndjson = readFileSync(bundlePath("entries.ndjson"), "utf8");
  return ndjson
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parsed = JSON.parse(line) as PublicLedgerEntry;
      return parsed;
    });
}

/**
 * Normalize either the legacy sample manifest or a live
 * `ledger export-public` manifest into the shape the pages render.
 */
export function getPublicLedgerManifest(): PublicLedgerManifest {
  const raw = readFileSync(bundlePath("manifest.json"), "utf8");
  const parsed = JSON.parse(raw) as EngineExportManifest;

  const first =
    parsed.timeRange?.first ?? parsed.timeRange?.earliest ?? null;
  const last = parsed.timeRange?.last ?? parsed.timeRange?.latest ?? null;

  const files =
    parsed.files ??
    (parsed.entriesSha256
      ? [
          {
            name: "entries.ndjson",
            sha256: parsed.entriesSha256,
            size: 0,
          },
        ]
      : []);

  return {
    publisher: parsed.publisher ?? "ledgerful-ledger-bot",
    entryCount: parsed.entryCount ?? 0,
    timeRange: { first, last },
    generatedAt: parsed.generatedAt ?? "",
    allowlist: parsed.allowlist ?? publicLedgerAllowlist,
    sigAlg: parsed.sigAlg ?? parsed.signatureAlgorithm ?? "Ed25519",
    bundleType: parsed.bundleType ?? "public-ledger",
    chainHeadPresent:
      typeof parsed.chainHeadPresent === "boolean"
        ? parsed.chainHeadPresent
        : Boolean(parsed.chainHead),
    files,
    honestCeiling: parsed.honestCeiling,
    publicKeyFingerprint: parsed.publicKeyFingerprint,
  };
}

export function getPublicLedgerEntryByTxId(txId: string): PublicLedgerEntry | undefined {
  return getPublicLedgerEntries().find((entry) => entry.tx_id === txId);
}
