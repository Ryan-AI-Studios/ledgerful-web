"use client";

import { useCallback, useState } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import type { PublicLedgerEntry } from "@/lib/content/public-ledger";

type VerifyState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; valid: number; invalid: number; errors: string[] };

function buildVerificationPayload(entry: PublicLedgerEntry): string {
  return [
    `tx_id:${entry.tx_id ?? ""}`,
    `category:${entry.category ?? ""}`,
    `summary:${entry.summary ?? ""}`,
    `reason:${entry.reason ?? ""}`,
    `committed_at:${entry.committed_at ?? ""}`,
  ].join("\n");
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

    for (const entry of entriesToVerify) {
      try {
        if (!entry.public_key || !entry.signature) {
          invalid++;
          errors.push(`${entry.tx_id}: missing public key or signature`);
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

    setState({ status: "done", valid, invalid, errors });
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
          <p className={state.invalid === 0 ? "ledger-verify-ok" : "ledger-verify-bad"}>
            {state.invalid === 0 ? (
              <>
                <ShieldCheck size={16} aria-hidden="true" />{" "}
                {state.valid} of {totalEntries} entries verified as valid.
              </>
            ) : (
              <>
                <AlertCircle size={16} aria-hidden="true" />{" "}
                {state.valid} of {totalEntries} entries valid,{" "}
                {state.invalid} invalid.
              </>
            )}
          </p>
          {state.errors.length > 0 && (
            <div className="ledger-verify-errors">
              {state.errors.map((err) => (
                <p key={err} className="mono">{err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
