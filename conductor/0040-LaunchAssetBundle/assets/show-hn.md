# Show HN submission — frozen for 0042 execution

## Title candidates (≤80 chars)

1. `Ledgerful: signed change records for git repos, local-first, offline verifier` (72 chars) <!-- research5 §9.8 -->
2. `Ledgerful: compact signed evidence export with a dependency-free verifier` (73 chars) <!-- research5 §9.8 (adapted) -->
3. `Ledgerful: git hooks that sign every change, no cloud, no background process` (79 chars) <!-- research5 §2.4, §5.4 -->

**Chosen:** 2

## Body

Ledgerful signs a structured change record every time you commit: git hooks capture the intent, the engine writes an Ed25519-signed entry to a local SQLite ledger, and `ledgerful verify` checks every signature. <!-- research5 §1.2, §2.1 -->

The export is a compact zip with a signed manifest and a dependency-free Node verifier that prints `VALID` offline. <!-- research5 §9.8 (adapted: "8-line" claim was pre-implementation; actual verifier is a standalone mjs script — the claim is "dependency-free, offline, prints VALID") -->

A few honest limits before the HN trust discussion starts: the chain hash (shipping now) makes post-adoption order and set tampering *evident* when you run `ledgerful verify --signatures --chain` or compare against an independently retained export with `verify --against-export`. <!-- conductor 0046 decision-memo §3, §4 --> It does not stop a signer with your key from re-signing entries, and rolling the whole chain back to an earlier valid state is detectable only if you keep a chain head outside the machine. <!-- conductor 0046 decision-memo §1, §3 --> Pre-chain entries (before the m51 adoption point) remain order-unverifiable by design. <!-- 0046 decision-memo §6 --> Compare the `manifest.pub` fingerprint out-of-band before treating any verification as final. <!-- research5 §1.3, sample-soc2/index.md:93–103 -->

Your disk is yours, your signatures are yours, your evidence export is yours — there is no service to sign up for, no telemetry, no cloud, no network code in the engine, and a CI grep that proves it. <!-- research5 §5.4 verbatim -->

Use Sigstore for release provenance and transparency logs; use Ledgerful for signed, per-commit change records that live next to your repo on your disk. They solve different problems and complement each other. <!-- research5 §1.4 -->

Install: `curl -fsSL https://ledgerful.dev/install.sh | sh` (Linux/macOS/Windows). Demo in one command: `ledgerful demo`. <!-- research5 §2.3, 0039 shipped: ledgerful demo + ledgerful export evidence --profile soc2 -->

If you might want a hosted tier or design-partner access when it ships, register interest at https://ledgerful.dev/waitlist — no commitment, no timeline, no purchase. <!-- register P3, 0041 waitlist spec -->

---

<!-- Receipt summary -->
<!-- research5 §1.2 (entry signing basis), §1.3 (trust-model limits), §1.4 (git log / Sigstore replies), §2.1 (git hooks), §2.3 (demo path), §5.4 (privacy sentence), §9.8 (one-liner) -->
<!-- conductor 0046 decision-memo §1 (threat model / signer tier), §3 (claim ceiling), §4 (export-as-checkpoint), §6 (pre-chain order-unverifiable) -->
<!-- coordination.md §3.2, §4.7 (trends/chain shipped; endpoints live) -->
<!-- claims register P3 (waitlist no-commitment language) -->
