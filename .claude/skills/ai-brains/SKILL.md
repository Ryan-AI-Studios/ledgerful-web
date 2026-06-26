---
name: ai-brains
description: Use at session start or before risky public claim changes to retrieve prior Ledgerful decisions, constraints, and launch-truth notes across repos.
---

# AI-Brains for Ledgerful Web

AI-Brains is the cross-session memory layer. Use it to avoid repeating old
positioning mistakes and to find prior constraints before editing public copy.

commands{
  preflight:"ai-brains preflight --summary"
  unified_search:"ai-brains sync query \"<topic>\""
  recall:"ai-brains recall \"<topic>\" --semantic"
  pin:"ai-brains pin \"DECISION: <what + why>\""
}

use_when:
  - checking previous Ledgerful positioning decisions
  - checking whether a public claim was already ruled out
  - looking for cross-repo launch blockers
  - persisting a non-obvious public-web decision

pin_examples:
  - ai-brains pin "DECISION: Ledgerful Web labels hosted GitHub App as hosted planned until control-plane webhook ingest exists."
  - ai-brains pin "CONSTRAINT: Public pricing must distinguish local-only from hosted planned features."

safety{
  no_secrets:"never ingest or pin API keys, tokens, credentials, or .env contents"
  privacy:"prefer source-backed summaries over copying private logs"
}
