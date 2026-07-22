"use client";

import { useCallback, useState } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import type { PublicLedgerEntry } from "@/lib/content/public-ledger";

/** Offline status for one public entry (0072 dual-path honesty). */
const V2_FENCE_LABEL =
  "SIGNATURE: not re-verified offline (v2 provenance fields redacted; verify with local ledgerful verify --signatures)";

type VerifyState =
  | { status: "idle" }
  | { status: "running" }
  | {
      status: "done";
      valid: number;
      invalid: number;
      /** v2 rows: signed but provenance redacted — not claimed offline. */
      notReverified: number;
      errors: string[];
    };

function buildVerificationPayload(entry: PublicLedgerEntry): string {
  return [
    `tx_id:${entry.tx_id ?? ""}`,
    `category:${entry.category ?? ""}`,
    `summary:${entry.summary ?? ""}`,
    `reason:${entry.reason ?? ""}`,
    `committed_at:${entry.committed_at ?? ""}`,
  ].join("\n");
}

/** Dual-path by stored sig_version (missing → 1 = historical five-field). */
function entrySigVersion(entry: PublicLedgerEntry): number {
  if (entry.sig_version == null) return 1;
  const n = Number(entry.sig_version);
  return Number.isFinite(n) ? n : 1;
}

function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes.buffer;
}

const subtle = typeof window !== "undefined" ? window.crypto?.subtle : undefined;

export function LedgerVerifier({ entries, entryCount }: { entries?: PublicLedgerEntry[]; entryCount?: number }) {
  const [state, setState] = useState<VerifyState>({ status: "idle" });

  const verify = useCallback(async () => {
    let entriesToVerify = entries ?? [];
    if (entriesToVerify.length === 0 && entryCount && entryCount > 0) {
      setState({ status: "running" });
      try {
        const resp = await fetch("/ledger/entries.ndjson");
        if (!resp.ok) throw new Error(`Failed to fetch entries.ndjson: ${resp.status}`);
        const text = await resp.text();
        entriesToVerify = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => JSON.parse(l) as PublicLedgerEntry);
      } catch (err) {
        setState({
          status: "done",
          valid: 0,
          invalid: 0,
          notReverified: 0,
          errors: [`Failed to load entries: ${(err as Error).message}`],
        });
        return;
      }
    }

    if (!subtle) {
      setState({
        status: "done",
        valid: 0,
        invalid: entriesToVerify.length,
        notReverified: 0,
        errors: [
          "WebCrypto is not available in this browser. Use the CLI verifier or open the offline verifier in a modern browser (Chrome 113+, Firefox 130+, Safari 17+).",
        ],
      });
      return;
    }

    setState({ status: "running" });
    const errors: string[] = [];
    let valid = 0;
    let invalid = 0;
    let notReverified = 0;

    for (const entry of entriesToVerify) {
      try {
        if (!entry.public_key || !entry.signature) {
          invalid++;
          errors.push(`${entry.tx_id}: missing public key or signature`);
          continue;
        }

        const sigVersion = entrySigVersion(entry);
        if (sigVersion >= 2) {
          // Honesty fence (mirrors engine public_export verifier): do not
          // Ed25519-verify five-field payload for v2 — provenance is redacted.
          notReverified++;
          errors.push(`${entry.tx_id}: ${V2_FENCE_LABEL}`);
          continue;
        }

        const key = await subtle.importKey(
          "raw",
          hexToBytes(entry.public_key),
          { name: "Ed25519" },
          false,
          ["verify"],
        );
        const ok = await subtle.verify(
          { name: "Ed25519" },
          key,
          hexToBytes(entry.signature),
          new TextEncoder().encode(buildVerificationPayload(entry)),
        );
        if (ok) valid++;
        else {
          invalid++;
          errors.push(`${entry.tx_id}: signature invalid`);
        }
      } catch (err) {
        invalid++;
        errors.push(`${entry.tx_id}: ${(err as Error).message}`);
      }
    }

    setState({ status: "done", valid, invalid, notReverified, errors });
  }, [entries, entryCount]);

  const totalEntries = entries?.length ?? entryCount ?? 0;

  return (
    <div className="ledger-verifier">
      <button
        type="button"
        className="button-primary"
        onClick={verify}
        disabled={state.status === "running"}
        aria-busy={state.status === "running"}
      >
        <ShieldCheck size={18} aria-hidden="true" />
        {state.status === "running"
          ? "Verifying entries…"
          : "Verify all entries"}
      </button>

      {state.status === "done" && (
        <div className="ledger-verify-result">
          <p
            className={
              state.invalid === 0 ? "ledger-verify-ok" : "ledger-verify-bad"
            }
          >
            {state.invalid === 0 && state.notReverified === 0 ? (
              <>
                <ShieldCheck size={16} aria-hidden="true" />{" "}
                {state.valid} of {totalEntries} entries verified as valid.
              </>
            ) : state.invalid === 0 ? (
              <>
                <ShieldCheck size={16} aria-hidden="true" />{" "}
                {state.valid} of {totalEntries} entries verified as valid offline
                (v1 five-field). {state.notReverified} not re-verified offline
                (v2 provenance redacted; use local{" "}
                <code>ledgerful verify --signatures</code>).
              </>
            ) : (
              <>
                <AlertCircle size={16} aria-hidden="true" />{" "}
                {state.valid} of {totalEntries} entries valid,{" "}
                {state.invalid} invalid
                {state.notReverified > 0
                  ? `, ${state.notReverified} not re-verified offline (v2)`
                  : ""}
                .
              </>
            )}
          </p>
          {state.errors.length > 0 && (
            <div className="ledger-verify-errors">
              {state.errors.map((err) => (
                <p key={err} className="mono">
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
