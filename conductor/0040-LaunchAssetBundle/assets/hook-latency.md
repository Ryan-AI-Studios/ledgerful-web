# Ledgerful hook-latency receipt

**Claim:** Ledgerful adds ~434.4 ms per commit on this machine.

**Method:** A/B differential measured with `hyperfine`. Git internals cancel; the difference is Ledgerful's overhead (commit-msg sidecar write + post-commit promotion; pre-commit also runs in the default `ledgerful init` hook set and verifies prior ledger signatures).

## Results

| Measurement | Mean | Median | Stddev | Min | Max | Runs |
|---|---|---|---|---|---|---|
| A: `git commit` WITH Ledgerful hooks | 490.729 ms | 480.191 ms | 40.691 ms | 456.137 ms | 636.197 ms | 20 |
| B: `git commit` WITHOUT Ledgerful hooks | 56.373 ms | 54.293 ms | 4.743 ms | 51.601 ms | 72.088 ms | 20 |
| **Differential (A - B, mean)** | **434.356 ms** | - | - | - | - | - |
| **Differential (A - B, median)** | **425.898 ms** | - | - | - | - | - |

## Machine spec

| Attribute | Value |
|---|---|
| OS | Microsoft Windows 11 Pro 10.0.26200 |
| CPU | AMD Ryzen 7 5800XT 8-Core Processor             |
| Cores / Threads | 8 / 16 |
| RAM | 31.9 GB |
| Disk | ST1000DM003-1SB102 (Fixed hard disk media) |
| Hyperfine | hyperfine 1.20.0 |
| Ledgerful | ledgerful 0.1.7 |

## Honest range

On this Windows 11 workstation, Ledgerful's observed per-commit overhead is **~426-434 ms** (median and mean differential). Individual commits vary by +/- 41 ms with hooks on, so a fair public claim is a range: **385-475 ms per commit**. Cold-start commits (fresh ledger, signature cache miss) may be slower; this measurement reflects a warm developer loop with state reset between runs.

## Re-runnability

Benchmark script: `benchmark-hook-latency.ps1` (same directory).
Intermediate hyperfine exports: `hooks-on.json`, `hooks-off.json`.

```powershell
# From PowerShell:
.\benchmark-hook-latency.ps1 -Warmup 10 -Runs 20
```

## Receipt references

- Track 0040-LaunchAssetBundle, spec scope item 5: hook-latency receipt must be an A/B differential with `--prepare` state reset and recorded machine spec.
- `research5.md` section 8.6: converted the prior unbenchmarked warning into the measured differential above.
