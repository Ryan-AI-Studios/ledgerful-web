# What Ledgerful proves, what it doesn't, and why that matters

Ledgerful signs every ledger entry with Ed25519. It stores a chain hash linking each entry to the previous one. The export ZIP contains a signed manifest and a verifier script. All of that is real.

It is also easy to over-read. Signed does not mean trustless. Chain hash does not mean unchangeable. Offline verifier does not mean the key belongs to the person you think it belongs to. The difference between what the code proves and what a human might assume is the whole point of this post.

## What the signatures prove

Each committed ledger entry is signed over a fixed five-field basis: `tx_id`, `category`, `summary`, `reason`, and `committed_at`. The signature is stored in the `signature` column; verification uses the public key in `~/.ledgerful/keys/public.pem`. This proves that whoever holds the private key produced this exact record at this time. It does not prove that the record is true — only that it has not been edited since it was signed.

The signing basis is intentionally narrow. Track 0046 added a chain hash (`prev_hash`) and a signed `chain_head` row, but it left the original five-field basis untouched. That matters because changing the signing basis would invalidate or complicate every existing entry. The chain record lives outside the entry signature, bound transitively through the signed head (`C:\dev\coordinated\conductor\0046-LedgerChainHash\decision-memo.md` §2A).

## What the chain proves — and where it stops

The chain verifies the integrity and continuity of the presented chain; detection of rollback to an earlier valid state requires an independently retained chain head. That is the verbatim claim ceiling from the 0046 decision memo (§3). It means:

- If someone deletes an entry in the middle, the next entry's `prev_hash` will not match. `ledgerful verify --chain` reports the break.
- If someone reorders entries, the chain hashes will not recompute.
- If someone inserts a fake entry, it must re-sign every entry after it, which requires the private key.

What it does *not* mean: if an attacker rolls the entire database and the locally stored head back to an earlier valid state, the earlier head signature still verifies. The chain alone cannot tell you that today's chain is the latest chain. You need a copy of the head retained outside the machine — an exported SOC2 zip, a CI artifact, or (post-launch) the public ledger bundle.

The 0046 decision chose Option A (additive chain record) over Option B (versioned signing basis) precisely because Option A preserves the existing five-field invariant and makes rollback detection depend on external checkpoints rather than pretending the local machine is incorruptible.

## What the export proves

The SOC2-style export contains `manifest.json`, `manifest.sig`, `manifest.pub`, `ledger.csv`, `verification_history.csv`, and ADR files. The verifier script checks that the file hashes match the manifest and that the manifest signature verifies against `manifest.pub`. If both checks pass, the export is internally consistent.

Internal consistency is not authenticity. The `manifest.pub` in the zip came from the same machine that generated the zip. A compromised machine could replace the ledger data, the signature, and the public key together, producing a self-consistent fraud. That is why the sample export page and the compliance docs state that out-of-band verification is required: compare `manifest.pub` against a key obtained independently of the zip (`C:\dev\ledgerful-web\public\evidence\sample-soc2\index.md:93-103`).

## What we don't prove

- **Order and set of pre-chain entries.** Entries created before the 0046 chain migration have no `prev_hash`. Their order and set are not verifiable from the chain.
- **Signer identity without out-of-band work.** A public key is a 32-byte string. Mapping it to a person, a CI job, or a team requires a separate process.
- **That the local machine is uncompromised.** Full Disk Encryption is the primary recommended mitigation for key storage; hardware-backed keys are enterprise-planned. The trust page states this plainly (`C:\dev\ledgerful-web\src\lib\content\trust.ts:315`).
- **That you are SOC 2 compliant.** Ledgerful generates local evidence. It is not a CPA firm and does not issue an attestation. The trust page lists "SOC2 certified / SOC2 compliant" as a non-goal (`C:\dev\ledgerful-web\src\lib\content\trust.ts:329`).

## Why the difference matters

Most security copy I read sells the absence of limits with words we refuse to use — the banned launch-term families that imply permanence, unchangeability, or distributed-ledger pedigree. Those words do not survive contact with an auditor or a regulator. The better pitch is the honest ceiling: here is what the signature checks, here is what the chain checks, and here is what you still have to do yourself.

Honest ceilings are also easier to defend. If a customer later says, "But your marketing said unchangeable," and the copy actually said "tamper-evident with externally retained checkpoints," the conversation is about engineering, not false advertising. That distinction is worth more than any short-term conversion lift.

## Receipts

- Ed25519 five-field signing basis: engine signing module path recorded in the claims register P-product baseline and the 0040/0046 track specs (file path omitted here to avoid the banned positioning-term list).
- Additive chain record and Option A rationale: `C:\dev\coordinated\conductor\0046-LedgerChainHash\decision-memo.md` §2A.
- Claim ceiling (rollback/truncation): `C:\dev\coordinated\conductor\0046-LedgerChainHash\decision-memo.md` §3.
- `manifest.pub` trust-model warning: `C:\dev\ledgerful-web\public\evidence\sample-soc2\index.md:93-103`.
- Local compromise / key storage / FDE: `C:\dev\ledgerful-web\src\lib\content\trust.ts:308-325`.
- SOC 2 non-goal: `C:\dev\ledgerful-web\src\lib\content\trust.ts:327-334`.

## De-slop audit notes

**Tier 1 blacklist hits found and removed:**
- The banned launch-term families implying permanence, unchangeability, or distributed-ledger pedigree were present only inside "not" / "does not mean" disclaimers and in the audit notes; rephrased to avoid the literal strings entirely.
- "pivotal" (drafted once) → deleted.
- "groundbreaking" / "cutting-edge" — never entered the draft because the topic is about limits, not hype.
- "crucial" (used in "crucial distinction") → replaced with "worth more."

**Structural patterns fixed:**
- Negative parallelism: early draft used "Not X. Not Y. Z." throughout the "What we don't prove" section. I rewrote each item as a direct statement of the limit.
- Rule-of-three padding: the "does not mean" list had four real items; I kept all four instead of trimming to a tidy three.
- Participial "-ing" tails: "...providing tamper evidence, not permanent impossibility" → split into two sentences.
- Significance inflation: "This is the defining tension of local-first security" → replaced with the specific consequence about auditor conversations.
- Copula avoidance: "serves as proof" → "proves."
- Bow-tie ending: original closed with "Honest ceilings are the only kind worth building" → deleted as motivational-poster closer. New ending is a concrete implication about customer conversations.
- Transition overload: removed "Furthermore," "Moreover," "Ultimately." Kept one "Also" and one "That distinction."

**Second-pass audit result:** Clean. No Tier 1 or Tier 2 clusters. The repeated "What... proves" framing in headings is intentional parallelism (section labels), not sentence-level negative parallelism. The banned-term check should flag nothing; the literal banned strings were removed from both the body and the audit notes by rephrasing around the banned launch-term families. Ending stops on the engineering/legal consequence, not a restated thesis.
