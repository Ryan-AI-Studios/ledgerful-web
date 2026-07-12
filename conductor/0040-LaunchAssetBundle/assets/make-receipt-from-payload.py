import json, sys
from pathlib import Path

payload_path = Path(sys.argv[1])
with open(payload_path, encoding="utf-8-sig") as f:
    p = json.load(f)

def maybe_int(x):
    return int(x) if float(x).is_integer() else x

md = f"""# Ledgerful hook-latency receipt

**Claim:** Ledgerful adds ~{p['claim']} ms per commit on this machine.

**Method:** A/B differential measured with `hyperfine`. Git internals cancel; the difference is Ledgerful's overhead (commit-msg sidecar write + post-commit promotion; pre-commit also runs in the default `ledgerful init` hook set and verifies prior ledger signatures).

## Results

| Measurement | Mean | Stddev | Min | Max | Runs |
|---|---|---|---|---|---|
| A: `git commit` WITH Ledgerful hooks | {p['meanAms']} ms | {p['stdAms']} ms | {p['minAms']} ms | {p['maxAms']} ms | {p['runsA']} |
| B: `git commit` WITHOUT Ledgerful hooks | {p['meanBms']} ms | {p['stdBms']} ms | {p['minBms']} ms | {p['maxBms']} ms | {p['runsB']} |
| **Differential (A - B)** | **{p['overheadMs']} ms** | - | - | - | - |

## Machine spec

| Attribute | Value |
|---|---|
| OS | {p['os']} |
| CPU | {p['cpu']} |
| Cores / Threads | {p['cores']} / {p['logical']} |
| RAM | {p['ram']} GB |
| Disk | {p['disk']} ({p['diskType']}) |
| Hyperfine | {p['hyperfine']} |
| Ledgerful | {p['ledgerful']} |

## Honest range

On this Windows 11 workstation, Ledgerful's observed per-commit overhead is **~{maybe_int(p['overheadRound'])} ms** (mean differential). Individual commits vary by +/- {maybe_int(p['stdRound'])} ms with hooks on, so a fair public claim is a range: **{maybe_int(p['rangeLow'])}-{maybe_int(p['rangeHigh'])} ms per commit**. Cold-start commits (fresh ledger, signature cache miss) may be slower; this measurement reflects a warm developer loop with state reset between runs.

## Re-runnability

Benchmark script: `benchmark-hook-latency.ps1` (same directory).
Intermediate hyperfine exports: `hooks-on.json`, `hooks-off.json`.

```powershell
# From PowerShell:
.\\benchmark-hook-latency.ps1 -Warmup 10 -Runs 20
```

## Receipt references

- Track 0040-LaunchAssetBundle, spec scope item 5: hook-latency receipt must be an A/B differential with `--prepare` state reset and recorded machine spec.
- `research5.md` section 8.6: converted the prior unbenchmarked warning into the measured differential above.
"""

receipt_path = Path(p["receipt"])
with open(receipt_path, "w", encoding="utf-8") as f:
    f.write(md)
print(f"Receipt written to: {receipt_path}")
