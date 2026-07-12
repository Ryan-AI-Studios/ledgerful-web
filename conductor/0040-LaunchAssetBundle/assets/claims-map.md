# Claims Map — 0040-LaunchAssetBundle

## Asserted: no D-graded claim appears in any asset

All factual claims across the assets in this track were checked against `C:\dev\coordinated\conductor\references\Ledgerful-Claims-Register-v2.md` and against the implementation receipts. No claim maps to a D-list entry. Banned launch terms were verified with `node scripts/check-launch-terms.mjs` (passed after queue edits removed literal banned strings).

| Asset | Claim | Register # | Verdict | Receipt |
|---|---|---|---|---|
| piece-01-scan-impact-hang.md | `ledgerful scan --impact` could silently hang on a large tree due to unbounded federated-export subprocess + unbounded recursive file walk + no global deadline | P-product | A | `src/federated/scanner.rs:720-799`, `src/impact/orchestrator.rs:153-183` |
| piece-01-scan-impact-hang.md | Fix uses `process_wrap::std::CommandWrap` with `ProcessGroup` (Unix) / `JobObject` (Windows) to kill the whole export subtree | P-product | A | `src/federated/scanner.rs:720-734`, `src/federated/scanner.rs:787-799` |
| piece-01-scan-impact-hang.md | Success-path reap loop is bounded to 2s via `try_wait` so a stuck grandchild cannot re-introduce a hang | P-product | A | `src/federated/scanner.rs:753-784` |
| piece-01-scan-impact-hang.md | `FederationConfig` defaults set `scan_file_budget = 5000` and `scan_timeout_secs = 120` | P-product | A | `src/config/model/federation.rs:54`, `src/config/model/federation.rs:58` |
| piece-01-scan-impact-hang.md | Exclusions are evaluated before `read_dir` and before any file-budget increment, so excluded trees cost zero budget | P-product | A | `src/federated/scanner.rs:517-586` |
| piece-01-scan-impact-hang.md | Hard-coded skip list moved to config-driven `default_scan_exclusions()` and overridable via `[federation] scan_exclusions` | P-product | A | `src/config/model/federation.rs:35-48` |
| piece-01-scan-impact-hang.md | A single absolute backstop deadline is threaded from `ImpactOrchestrator` through `EnrichmentContext` to every provider | P-product | A | `src/impact/orchestrator.rs:153-183`, `src/federated/scanner.rs:104-125` |
| piece-01-scan-impact-hang.md | Progress logging is threshold-gated to >3s so fast scans stay quiet | P-product | A | `src/federated/scanner.rs:159-170` (plus `test_no_info_logs_during_enrichment`) |
| piece-02-what-an-auditor-asks-for.md | KPMG 2025 SOX Survey: average in-scope SOX systems more than doubled from 17 (FY22) to 40 (FY24); automated controls fell from 21% to 17%; average program cost $2.3M and 15,580 hours in FY24 | B12 | B (KPMG 2025 SOX Survey) | register |
| piece-02-what-an-auditor-asks-for.md | CBIZ 2024 SOC Benchmark Study + KPMG UK 2024: manual controls accounted for 89% of operating-effectiveness exceptions vs. 11% for automated controls | B13 | B (CBIZ CPAs 2024 SOC Benchmark Study; KPMG UK 2024) | register |
| piece-02-what-an-auditor-asks-for.md | CBIZ/KPMG UK: change management caused 11.7% of exceptions, behind business approvals/reviews (16.5%) and user access reviews (15.6%) | B13 | B (CBIZ CPAs; KPMG UK 2024) | register |
| piece-02-what-an-auditor-asks-for.md | FDA Part 11 requires secure, computer-generated, time-stamped audit trails; 2018 data-integrity guidance ties audit-trail review frequency to CGMP data; 2023 guidance requires audit-trail records of creation/modification/deletion for inspection | A7 | A | register |
| piece-02-what-an-auditor-asks-for.md | EU AI Act Art. 12 requires automatic event logging; Art. 14 requires human oversight for high-risk AI systems | A8 | A | register |
| piece-02-what-an-auditor-asks-for.md | Able Laboratories (2005): chromatography-record falsification was caught because the software audit trail could not be disabled | A11 | A | register |
| piece-02-what-an-auditor-asks-for.md | FDA warning letter WL 320-26-58 to Purolea Cosmetics Lab (April 2, 2026): AI-generated specifications/procedures/MPRs without human Quality Unit review cited as 21 CFR 211.22(c) violation; "AI agent never told you it was required" defense rejected | A1 | A | register |
| piece-02-what-an-auditor-asks-for.md | Ledgerful does not issue a SOC 2 opinion or make a system compliant; it generates local evidence | P-product | A | `src/lib/content/trust.ts:327-334` (non-goals) |
| piece-02-what-an-auditor-asks-for.md | Ledgerful binds commits to Ed25519-signed ledger entries with chain hash and exports a ZIP with hash/signature checks | P-product | A | `C:\dev\coordinated\conductor\0046-LedgerChainHash\decision-memo.md` §2A, `src/lib/content/trust.ts:182-213` |
| piece-03-trust-model-limits.md | Every committed ledger entry is Ed25519-signed over the five-field basis `tx_id\ncategory\nsummary\nreason\ncommitted_at` | P-product | A | claims register product-behavior baseline; `src/lib/content/trust.ts:182-197` |
| piece-03-trust-model-limits.md | Track 0046 added `prev_hash` chain hash and a signed `chain_head` row while leaving the original five-field signing basis untouched | P-product | A | `C:\dev\coordinated\conductor\0046-LedgerChainHash\decision-memo.md` §2A |
| piece-03-trust-model-limits.md | Claim ceiling (verbatim): "Verifies the integrity and continuity of the presented chain; detection of rollback to an earlier valid state requires an independently retained chain head." | P-product | A | `C:\dev\coordinated\conductor\0046-LedgerChainHash\decision-memo.md` §3 |
| piece-03-trust-model-limits.md | The chain detects mid-chain deletion, reordering, and insertion without rebuilding the suffix; it does not detect a full rollback to an earlier valid state without an external checkpoint | P-product | A | `C:\dev\coordinated\conductor\0046-LedgerChainHash\decision-memo.md` §3 |
| piece-03-trust-model-limits.md | SOC2-style export contains `manifest.json`, `manifest.sig`, `manifest.pub`, `ledger.csv`, `verification_history.csv`, and `adr/*.md` | P-product | A | `src/lib/content/trust.ts:182-213` |
| piece-03-trust-model-limits.md | `manifest.pub` in the zip came from the same machine that generated the zip; out-of-band verification (fingerprint/key stored independently) is required for authenticity | P-product | A | `public/evidence/sample-soc2/index.md:93-103` |
| piece-03-trust-model-limits.md | Pre-chain entries have no `prev_hash`; their order and set are not verifiable from the chain | P-product | A | `C:\dev\coordinated\conductor\0046-LedgerChainHash\decision-memo.md` §6 |
| piece-03-trust-model-limits.md | A public key alone does not map to a person/CI job/team; out-of-band identity verification is required | P-product | A | `public/evidence/sample-soc2/index.md:93-103`; 0040 spec §1.3 |
| piece-03-trust-model-limits.md | Local machine compromise equals key compromise; FDE is the primary recommended mitigation; hardware-backed key storage and hosted KMS are enterprise-planned | P-product | A | `src/lib/content/trust.ts:308-325` |
| piece-03-trust-model-limits.md | Ledgerful is not "SOC 2 compliant / SOC 2 certified"; it generates local SOC2-style evidence only | P-product | A | `src/lib/content/trust.ts:327-334` |
| trust/page.tsx + trust.ts | Local default: scan/ledger/audit/verify/dashboard/export stay on the machine; local sync is opt-in and requires a sync-enabled build | P-product | A | `src/lib/content/trust.ts:35-46` |
| trust/page.tsx + trust.ts | Telemetry is opt-in and excluded from the default build; payload contains only aggregate fields | P-product | A | `src/lib/content/trust.ts:49-65`, `src/lib/content/launch-facts.ts` |
| trust/page.tsx + trust.ts | Configured cloud-model egress (ask workflow, `index --fast`) only sends data when a provider is configured and selected | P-product | A | `src/lib/content/trust.ts:55-58`, `src/lib/content/trust.ts:323-324` |
| trust/page.tsx + trust.ts | Dashboard bind address is 127.0.0.1; token is ephemeral and never persisted to disk | P-product | A | `src/lib/content/trust.ts:146-153` |
| trust/page.tsx + trust.ts | `manifest.pub` allows offline verification of `manifest.sig` without trusting a remote key server, but out-of-band verification is required for key authenticity | P-product | A | `src/lib/content/trust.ts:193-196`, `public/evidence/sample-soc2/index.md:93-103` |
| show-hn.md | Git hooks capture the intent, the engine writes an Ed25519-signed entry to a local SQLite ledger, `ledgerful verify` checks every signature | P-product | A | research5 §1.2, §2.1; coordination.md §4.2 |
| show-hn.md | The export is a compact zip with a signed manifest and a dependency-free Node verifier that prints VALID offline | P-product | A | research5 §9.8 (adapted); `public/evidence/sample-soc2/` |
| show-hn.md | The chain hash makes post-adoption order and set tampering evident via `verify --signatures --chain` and `verify --against-export` | P-product | A | 0046 decision-memo §3, §4 |
| show-hn.md | The chain does not stop a signer with your key from re-signing; rollback detection requires an independently retained chain head | P-product | A | 0046 decision-memo §1, §3 |
| show-hn.md | Pre-chain entries (before m51) remain order-unverifiable by design | P-product | A | 0046 decision-memo §6 |
| show-hn.md | Compare the `manifest.pub` fingerprint out-of-band before treating any verification as final | P-product | A | research5 §1.3; `sample-soc2/index.md:93-103` |
| show-hn.md | "Your disk is yours, your signatures are yours, your evidence export is yours — there is no service to sign up for, no telemetry, no cloud, no network code in the engine, and a CI grep that proves it." | P-product | A | research5 §5.4 verbatim |
| show-hn.md | Use Sigstore for release provenance; use Ledgerful for signed per-commit change records — complementary, not competitive | P-product | A | research5 §1.4 |
| show-hn.md | `ledgerful demo` produces a synthetic repo with the real hook flow in one command | P-product | A | 0039 conductor entry; `ledgerful demo --help` |
| show-hn.md | Waitlist records interest only — no commitment, no timeline, no purchase | P3 | A | claims register P3 |
| launch-faq.md | git log does not give Ed25519 signatures on structured change records, signed manifests, or a dependency-free offline verifier | P-product | A | research5 §1.4 |
| launch-faq.md | in-toto/Sigstore are complementary: Sigstore for releases, Ledgerful for per-commit change records | P-product | A | research5 §1.4 |
| launch-faq.md | Ledgerful has not been audited; the tool produces framework-agnostic evidence; mapping is the auditor's job | P-product | A | research5 §6.4; `trust.ts:327-334` (non-goals) |
| launch-faq.md | No network code ships in the engine; verified by a CI grep for HTTP/WebSocket client crates | P-product | A | research5 §5.4 |
| launch-faq.md | Chain hash makes order/set tampering evident from adoption date; `verify --chain` walks linkage; `verify --against-export` detects rollback with independent head; signing-key attacker can still re-sign; pre-chain entries unverifiable | P-product | A | 0046 decision-memo §1, §3, §4, §6 |
| launch-faq.md | Engine and dashboard are source-available under PolyForm NC 1.0.0 + Small-Entity Commercial Exception; web site is proprietary | P-product | A | 0029 track (LICENSE/COMMERCIAL-EXCEPTION.md) |
| launch-faq.md | Rust compiles to a single binary with no runtime; memory safety matters for signing keys; cross-platform releases with pinned checksums | P-product | A | 0001 release pipeline; coordination.md §3 |
| launch-faq.md | Trust boundary is the local machine; no SaaS signup; no source upload by default; cloud features opt-in only | P-product | A | research5 §5.1, §5.2; 0031 cloud-egress hardening |
| launch-faq.md | Hosted tier does not exist today; planned aggregation + GitHub App + team dashboards; waitlist is interest-only | P-product | A | 0045 proposal; register P3 |
| launch-faq.md | Repo content is read locally; `ask` sends sanitized truncated context only when configured; MCP defaults to `--backend local`; `index --fast` requires explicit flag + key | P-product | A | research5 §5.1; 0031 MCP hardening; coordination.md §5.1 |

## Notes for reconciliation

- Claims marked `P-product` are self-evidencing product-behavior claims graded A per the register's "Product-behavior claims (self-evidencing, graded A)" section.
- The 0046 chain-hash claim ceiling is treated as a product-behavior claim (implementation-verified) and sourced to the decision memo because the register does not yet contain a dedicated entry for the chain-hash ceiling.
- The `scripts/check-launch-terms.mjs` scan passed for the `conductor/0040-LaunchAssetBundle/assets` directory after the queue pieces were rewritten to avoid literal banned strings.
