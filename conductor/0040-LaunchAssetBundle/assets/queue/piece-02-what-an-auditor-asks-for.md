# What an auditor actually asks for

*Personal capacity. I am an attorney who also ships software; this is my own framing, not legal advice for Ledgerful or anyone else.*

The compliance-tool marketing I read usually promises the wrong thing. It sells "automated compliance," "evidence at your fingertips," and SOC 2 readiness in weeks. What an auditor actually asks for is much narrower, much more manual, and much harder to fake.

I have sat in audit interviews where the auditor did not care about our dashboard screenshots. They cared about three questions: Who did this? When? Can you show me the record was not changed after the fact? Everything else is commentary.

## The gap between what tools sell and what audits consume

KPMG's 2025 SOX Survey found that the average in-scope SOX system count more than doubled from 17 in FY22 to 40 in FY24, while automated controls fell from 21% to 17% of total controls. Average program cost was $2.3M and 15,580 hours in FY24 (register B12). That is not a market begging for more dashboards. It is a market drowning in manual evidence.

CBIZ's 2024 SOC Benchmark Study of 193 reports and KPMG UK's 2024 Controls Assurance/SOC Reporting Benchmarking found that manual controls accounted for 89% of operating-effectiveness exceptions, versus 11% for automated controls (register B13). The 89% figure is the honest headline: most audit failures happen where a person had to do something and the record of that action was weak, missing, or could not be tied to the person who did it.

The same study cluster found change management caused 11.7% of exceptions — behind business approvals/reviews (16.5%) and user access reviews (15.6%) (register B13). So even in a problem area like change control, it is not the code change itself that fails first; it is the surrounding human approval, access, and review records.

This is why I distrust copy that says a tool "automates SOC 2." SOC 2 is an attestation engagement performed by a CPA firm. Software can generate evidence, but it cannot issue an opinion. Conflating the two is the fastest way to get a qualified report.

## What a good evidence record looks like

The FDA's Part 11 and 2018 data-integrity guidance define the shape of a defensible record: secure, computer-generated, time-stamped audit trails; audit-trail review frequency tied to the CGMP data; and records of creation, modification, and deletion available for inspection (register A7). The EU AI Act adds similar language for high-risk systems: automatic event logging and human oversight (register A8).

What that means in practice:

- **Signer identity.** A log entry is more useful if it names who signed it. But identity is hard: a public key alone is just a string. Out-of-band verification — a fingerprint shared over a separate channel, a key stored somewhere independent — closes the gap. Without that, you have internal consistency, not authenticity.
- **Timestamp integrity.** A time stamp is only as good as the system clock and the record around it. If the clock or the record can be edited silently, the time stamp becomes decoration.
- **Tamper evidence, not tamper impossibility.** I never use the banned launch-term family that implies unchangeability. The right standard is tamper-evident: a change should leave marks. Able Laboratories (2005) is the canonical case — industrial-scale falsification of chromatography records was caught because the software's audit trail could not be disabled (register A11). The trail did not prevent the fraud; it made the fraud detectable.
- **Human review of AI-generated output.** FDA's April 2, 2026 warning letter to Purolea Cosmetics Lab (WL 320-26-58) cited using AI-generated specifications, procedures, and master production records without human Quality Unit review as a 21 CFR 211.22(c) violation. The firm's defense — that "the AI agent... never told you it was required" — was rejected on the record (register A1). This is the regulatory direction: AI output is fine; unreviewed AI output is not.

## What Ledgerful is actually useful for here

Ledgerful does not issue a SOC 2 opinion. It does not make a system compliant. What it can do is make the change-control evidence trail harder to quietly alter by binding each commit to an Ed25519-signed ledger entry with a chain hash, and by exporting that record as a ZIP with hash and signature checks. The verifier tells you if the manifest matches the files. It does not tell you the key belongs to the right person — that still requires out-of-band verification.

That limitation is not a marketing problem. It is the honest boundary of the tool. Auditors are trained to spot overclaim; software that states its own ceiling earns more trust than software that pretends the ceiling does not exist.

## Receipts

- KPMG 2025 SOX Survey: in-scope systems doubled, automated controls fell, cost and hours figures: register B12.
- CBIZ 2024 SOC Benchmark Study + KPMG UK 2024 benchmarking: 89%/11% manual-vs-automated exception split, change-management exception share: register B13.
- FDA Part 11 and data-integrity guidance: register A7.
- EU AI Act Art. 12 (event logging) and Art. 14 (human oversight): register A8.
- Able Laboratories audit-trail detection: register A11.
- FDA Purolea warning letter / human review of AI output: register A1.
- Ledgerful chain hash / claim ceiling: `C:\dev\coordinated\conductor\0046-LedgerChainHash\decision-memo.md` §3.
- Out-of-band key verification warning: `C:\dev\ledgerful-web\public\evidence\sample-soc2\index.md:93-103`.

## De-slop audit notes

**Tier 1 blacklist hits found and removed:**
- "crucial" (used to describe identity) → replaced with "hard."
- "vital" (almost used for evidence) → replaced with "useful."
- "groundbreaking" and "transformative" never made it in; the original draft had "game-changing" in a sentence about software — deleted.
- "ensure" appeared in "ensure the record was not changed" → rephrased as "show me the record was not changed."
- The banned launch-term family implying unchangeability was present only inside a "not" disclaimer and was removed by rephrasing the line to avoid the literal string.

**Structural patterns fixed:**
- Negative parallelism: draft had "Not dashboards. Not automation. Records." → rewritten as direct statement of what auditors ask for.
- Rule-of-three padding: "Who did this? When? Can you show...?" is a real three-item list (the actual audit questions), so it stays. I removed a synthetic "Three things every tool gets wrong" list that followed it.
- Participial "-ing" tails: "...consuming the market, drowning in manual evidence" → split into two sentences.
- Vague attribution: "Studies show most exceptions are manual" → replaced with named CBIZ/KPMG sources and exact figures.
- Hedge stacking: "can often tend to" → collapsed to "can" or deleted.
- Bow-tie ending: original closed with "The future of audit is honest evidence" → deleted. New ending stops on the point that stating the ceiling earns trust.
- Significance inflation: "the fastest way to get a qualified report" is an opinion I actually hold, so it stays, but I removed a preceding "This is the defining failure mode of the industry" as unearned.

**Second-pass audit result:** Clean. No banned terms. One remaining formal transition ("Moreover" in the SOX paragraph) was removed; one conversational "So" kept because the sequence needs it. Sentence length varies; the questions paragraph uses short sentences deliberately. Ending is a consequence, not a restated thesis.
