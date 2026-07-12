# Launch FAQ — prepared answers (≤120 words each)

Receipts are inline HTML comments. Each answer ends with a source summary comment.

---

## 1. How is this different from git log?

`git log` gives you authorship and order in a content-addressed store. It does not give you an Ed25519 signature on each structured change record, a signed manifest over the exported records, or a dependency-free offline verifier that prints `VALID`. Ledgerful captures the same commits through git hooks, then writes a signed ledger entry for each one. The trust anchor is a keypair on your disk, not the hosting provider. <!-- research5 §1.4 -->

<!-- research5 §1.2 (Ed25519 per entry), §1.4 (git log comparison) -->

---

## 2. What about in-toto / Sigstore?

They are complementary, not competitive. in-toto attests which keys touched which artifact in which supply-chain step; Sigstore signs releases against Rekor's transparency log. Ledgerful signs per-commit change records locally, next to your repo, on your disk. If your concern is release provenance, use Sigstore. If your concern is a signed, portable history of why each change happened, that's Ledgerful. <!-- research5 §1.4 -->

<!-- research5 §1.4 (in-toto/Sigstore complementarity) -->

---

## 3. Has Ledgerful been SOC 2 audited?

No. Ledgerful has not been audited, and no audit would make your organization compliant automatically. The tool produces framework-agnostic evidence — signed ledger entries, verification history, and a redacted SOC 2-style export — that you or your auditor can map to the controls you care about. The mapping is the auditor's job, not ours. We do not claim SOC 2, HIPAA, or 21 CFR Part 11 readiness. <!-- research5 §6.4, §6.2 -->

<!-- research5 §6.1 (framework-agnostic evidence), §6.2 (mapping is customer's job), §6.4 (not audited) -->

---

## 4. Does it phone home?

No network code ships in the engine. That is verified by a CI grep that checks for HTTP/WebSocket client crates in the engine crate. Your ledger, signing key, and repo analysis stay on your machine. The only data that leaves is what you explicitly export (the SOC 2 zip, or the opt-in public-ledger bundle if you enable it later), plus opt-in usage telemetry if you turn it on. <!-- research5 §5.4 -->

<!-- research5 §5.1 (what stays), §5.2 (what leaves, opt-in), §5.4 (privacy sentence / CI grep) -->

---

## 5. What does the chain hash prove?

It does not prevent every kind of tampering. It makes order and set tampering *evident* from the adoption date. `ledgerful verify --signatures --chain` checks that every post-genesis entry links to its predecessor and that the signed chain head is valid. `verify --against-export <path>` detects rollback or tail truncation by comparing the live chain head to a previously exported head you retain independently. A signing-key attacker can still re-sign a rolled-back chain; local-only detection has that ceiling. Pre-chain entries remain order-unverifiable. <!-- 0046 decision-memo §1, §3, §4, §6 -->

<!-- 0046 decision-memo §1 (threat model), §3 (claim ceiling), §4 (export checkpoint), §6 (pre-chain limit) -->

---

## 6. Why PolyForm Noncommercial?

The engine and dashboard are source-available under PolyForm Noncommercial 1.0.0 with a Small-Entity Commercial Exception. Individuals and small entities below the revenue threshold can use them free for commercial work; larger organizations need a commercial license. The web site itself is proprietary. We chose this because a permissive license would let large vendors run the product as a service without contributing back, while still keeping the code readable and forkable for most users. <!-- 0029 LICENSE/COMMERCIAL-EXCEPTION.md, 0025 pricing license-tier framing -->

<!-- 0029 track (license applied); 0025 pricing page (license-tier framing); source repo license file -->

---

## 7. Why Rust?

Rust compiles to a single binary with no runtime. That fits the local-first model: you install one file, it runs without a VM or container, and it talks to your local git repo directly. Memory safety matters for a tool that handles signing keys and parses repo content. Cross-platform releases for Linux, macOS Intel, macOS ARM64, and Windows ship from the same codebase with pinned checksums. <!-- 0001 release spec, coordination.md §3 OS archives -->

<!-- 0001 release pipeline (multi-OS archives + SHA256); Rust toolchain (single binary, no runtime, memory safety) -->

---

## 8. Why local-first?

The trust boundary is the machine you already own. Your ledger lives in `.ledgerful/state/ledger.db`. Your signing key lives in `~/.ledgerful/keys/`. There is no SaaS to sign up for, no source upload by default, and no background process beyond the git hooks. Cloud features are opt-in only where they exist: `ask` sends sanitized, truncated context to a backend only when you configure one, and `index --fast` sends code chunks to Gemini only when you explicitly pass `--fast` and set a key. <!-- research5 §5.1, §5.2; 0031 MCP cloud-egress hardening -->

<!-- research5 §5.1 (local-first data flow); 0031 (ask/index --fast opt-in cloud egress hardening) -->

---

## 9. What does the hosted tier do?

It does not exist today. The planned hosted tier would add aggregation across repos, a GitHub App for PR checks, and team dashboards. It is an optional layer, not a replacement for the local product. No one has to use it to get signed evidence; the local binary is the full product. If you want early access, the waitlist records interest only — no commitment, no purchase, no timeline. <!-- 0045 public-ledger proposal (hosted planned); register P3 (waitlist no-commitment); 0040 spec -->

<!-- 0040 spec (hosted tier planned); 0045 public-ledger proposal §2.6 (publishing opt-in); claims register P3 (waitlist no-commitment) -->

---

## 10. Is my repo content read?

Yes, locally. The engine reads git state, file structure, and diffs to produce impact analysis, hotspot scores, and ledger records. That content is never uploaded by default. The `ask` command sends only sanitized, truncated context when you configure a backend; the MCP `ask` tool defaults to `--backend local` and allows cloud egress only through a host-level environment variable a malicious repo cannot set. `index --fast` sends code chunks to Gemini only when you explicitly pass `--fast` and provide a key. <!-- research5 §5.1; 0031 MCP hardening; coordination.md §5.1 (index --fast opt-in) -->

<!-- research5 §5.1 (repo content stays local by default); 0031 (ask default-local + LEDGERFUL_MCP_ALLOW_CLOUD_EGRESS host-level); coordination.md §5.1 (index --fast opt-in) -->
