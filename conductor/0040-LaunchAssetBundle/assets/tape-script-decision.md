# 0040-LaunchAssetBundle — Tape-script decision

**Decision:** The dashboard trends surface does **NOT** appear on camera.

**Scope context:** Track 0040 spec item 4 requires two VHS captures of `ledgerful demo` and asks that the tape-script decision record whether the 0038 trends/dashboard surface appears on camera. This file is that decision.

**Rationale (from research5 §2.3 + 0039 + 0046/0050):**

- The launch story is the terminal loop: `change → commit → signed receipt → verify → VALID`. That is the 20–35s primary asset and the emotional beat of the 60–90s walkthrough.
- Track 0038 shipped a real `GET /api/trends` endpoint and frontend wiring, but it is a dashboard surface, not a terminal surface. It requires `ledgerful web start`, an ephemeral browser session token, and a viewport that is separate from the terminal narrative.
- 0039's `ledgerful demo` deliberately does **not** start the web dashboard at the end (0039 spec section A: "print the dashboard command instead; keeps runtime bounded and the VHS script simple"). The demo ends with the verifier instruction, which is the correct final frame for both tapes.
- 0050's gate-mode notice is shown in the demo terminal output, satisfying the "mode notice included" precondition.
- Including the dashboard trends surface would require switching contexts (terminal → browser) inside the capture, would break the terminal-only loop narrative, and would make 0038 part of the critical path for the capture. The recommended and adopted decision is to keep it terminal-only.

**Consequence:** 0038 leaves the 0040 critical path. Only 0036, 0037, 0039, 0046, and 0050 gate the capture. The trends surface may appear in a later post-launch asset if needed.

**Receipts:**
- 0040 spec, scope item 4: `C:\dev\coordinated\conductor\0040-LaunchAssetBundle\spec.md:22`
- 0039 spec: `C:\dev\coordinated\conductor\0039-DemoPathAndCliExport\spec.md:8–29`
- 0039 conductor entry (demo shipped): `C:\dev\coordinated\conductor\conductor.md:54`
- research5 §2.3 ("60-second demo gap" resolved by 0039): `C:\Users\RyanB\Desktop\proposed\research5.md:315–353`
