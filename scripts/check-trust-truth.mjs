import { readFileSync, existsSync } from "fs";
import { join } from "path";

const htmlPath = join(process.cwd(), ".next/server/app/trust.html");
let html;
try {
  html = readFileSync(htmlPath, "utf8");
} catch {
  console.error("FAIL: Could not read", htmlPath, "— run npm run build first");
  process.exit(1);
}

const lower = html.toLowerCase();
const failures = [];

if (lower.includes("ledgerful.io")) {
  failures.push("Canonical-domain FAIL: trust page must use ledgerful.dev, not ledgerful.io");
}
if (lower.includes("operative source terms")) {
  failures.push("License FAIL: resolved terms must not be called operative");
}
if (!lower.includes("in force") && !lower.includes("license is in force")) {
  failures.push("License FAIL: trust page must state the license is in force");
}
if (lower.includes("github actions integration for the future hosted ci workflow")) {
  failures.push(
    "GitHub boundary FAIL: the self-managed Action must not be conflated with the future hosted App",
  );
}

for (const required of ["authorization", "bearer", "in memory", "stripped"]) {
  if (!lower.includes(required)) {
    failures.push(
      `Auth-flow FAIL: trust page is missing hardened token detail "${required}"`,
    );
  }
}

// Assert 2: opt-in (telemetry)
if (!lower.includes("opt-in")) {
  failures.push('Assert 2 FAIL: "opt-in" not found — telemetry opt-in claim missing');
}

// Assert 3: no-source-upload
if (!lower.includes("source") || !lower.includes("upload")) {
  failures.push('Assert 3 FAIL: "source" and/or "upload" not found — no-source-upload claim missing');
}

// Assert 4: daemon access
if (!lower.includes("loopback") && !lower.includes("127.0.0.1")) {
  failures.push('Assert 4 FAIL: "loopback" or "127.0.0.1" not found — daemon access not documented');
}

// Assert 5: release verification
if (!lower.includes("sha-256") && !lower.includes("checksum")) {
  failures.push('Assert 5 FAIL: "SHA-256" or "checksum" not found — release verification not documented');
}

// Assert 6: responsible disclosure
if (!lower.includes("responsible disclosure")) {
  failures.push('Assert 6 FAIL: "responsible disclosure" not found');
}

// Assert 7: enterprise identity terms must not appear without "planned"
// Uses word-boundary regex to avoid false positives from HTML attribute values
// such as "crossorigin" which contains "sso" as a substring.
// Excludes OIDC occurrences in the supply chain attestation section where
// "OIDC" refers to the cosign/Sigstore signing identity (GitHub Actions OIDC),
// not enterprise SSO. The RSC flight payload duplicates the section content so
// we also check for cosign/sigstore/fulcio as supply-chain context markers.
const enterpriseTerms = ["sso", "saml", "oidc", "scim", "rbac"];
for (const term of enterpriseTerms) {
  // Require a non-identifier boundary on both sides so "oidc-issuer" flags
  // are not treated as an unqualified OIDC claim.
  const regex = new RegExp(`(?<![a-z0-9_-])${term}(?![a-z0-9_-])`, "gi");
  let match;
  while ((match = regex.exec(lower)) !== null) {
    const idx = match.index;
    // Check within 120 chars in either direction for "planned"
    const window = lower.slice(Math.max(0, idx - 120), idx + term.length + 120);
    if (window.includes("planned")) {
      continue;
    }
    // Allow OIDC in supply-chain attestation context (cosign/Sigstore/Fulcio/release-workflow)
    if (term === "oidc" && (window.includes("cosign") || window.includes("sigstore") || window.includes("fulcio") || window.includes("release workflow"))) {
      continue;
    }
    failures.push(`Assert 7 FAIL: "${term.toUpperCase()}" appears without a "planned" qualifier nearby`);
    break; // one failure per term is enough
  }
}
// Also check "audit log" without planned
const auditIdx = lower.indexOf("audit log");
if (auditIdx !== -1) {
  const window = lower.slice(Math.max(0, auditIdx - 120), auditIdx + 120);
  if (!window.includes("planned")) {
    failures.push('Assert 7 FAIL: "audit log" appears without "planned" qualifier nearby');
  }
}

// Assert 8: crash reporting addressed
if (!lower.includes("crash")) {
  failures.push('Assert 8 FAIL: crash reporting not addressed — add explicit statement about crash reports');
}

// Assert 9: telemetry schema matches the engine UsagePayload.
for (const field of [
  "schema_version",
  "anonymous_id",
  "client_version",
  "platform",
  "sent_at",
  "window_start",
  "window_end",
  "command_counts",
  "features_enabled",
  "active_days_in_window",
]) {
  if (!lower.includes(field)) {
    failures.push(`Assert 9 FAIL: telemetry field "${field}" is missing`);
  }
}
for (const staleField of ["subcommand / action", "duration / timing"]) {
  if (lower.includes(staleField)) {
    failures.push(`Assert 9 FAIL: stale telemetry field "${staleField}" is still published`);
  }
}

// Assert 10: configured cloud-model egress and selected .env reads are disclosed.
for (const phrase of [
  "configured cloud model",
  "sanitized, truncated",
  "gemini",
  "ollama cloud",
  "openrouter",
  "repository-local .env",
]) {
  if (!lower.includes(phrase)) {
    failures.push(`Assert 10 FAIL: trust disclosure is missing "${phrase}"`);
  }
}

// Assert 11: current signing-key filename is documented.
if (!lower.includes("private.key")) {
  failures.push('Assert 11 FAIL: current private.key signing-key path is missing');
}

// Assert 12: waitlist ESP subprocessor is disclosed
if (!lower.includes("kit (waitlist)") && !lower.includes("kit (formerly convertkit)")) {
  failures.push('Assert 12 FAIL: Kit waitlist ESP subprocessor not disclosed on trust page');
}
if (!lower.includes("double opt-in")) {
  failures.push('Assert 12 FAIL: "double opt-in" not found — waitlist consent model not documented');
}
if (!lower.includes("email capture is separate from telemetry")) {
  failures.push('Assert 12 FAIL: email-capture ≠ telemetry reconciliation missing');
}
if (!lower.includes("waitlist deletion request")) {
  failures.push('Assert 12 FAIL: waitlist deletion path not disclosed');
}

// Assert 13: supply chain attestation — shipped language + caveats
if (!lower.includes("supply chain attestation")) {
  failures.push('Assert 13 FAIL: "supply chain attestation" section not found on trust page');
}
if (!lower.includes("sbom")) {
  failures.push('Assert 13 FAIL: "SBOM" not mentioned — supply chain section missing SBOM disclosure');
}
if (!lower.includes("cosign")) {
  failures.push('Assert 13 FAIL: "cosign" not mentioned — supply chain signing not documented');
}
if (!lower.includes("slsa")) {
  failures.push('Assert 13 FAIL: "SLSA" not mentioned — build provenance not documented');
}
if (!lower.includes("cargo auditable")) {
  failures.push('Assert 13 FAIL: "cargo auditable" not mentioned — embedded dep list not documented');
}
// Supply chain section must reflect shipped state (not planned)
const scaIdx = lower.indexOf('id="supply-chain-attestation"');
if (scaIdx !== -1) {
  const sectionEnd = lower.indexOf('id="telemetry"', scaIdx + 1);
  const section = lower.slice(
    scaIdx,
    sectionEnd !== -1 ? sectionEnd : lower.length,
  );
  // Must NOT still say "planned (track 0053)" as the primary status
  if (section.includes("planned (track 0053)")) {
    failures.push('Assert 13 FAIL: supply chain section still says "Planned (track 0053)" — v0.1.8 shipped these capabilities');
  }
  // Must NOT say "will be actionable once the pipeline ships"
  if (section.includes("will be actionable once the pipeline ships")) {
    failures.push('Assert 13 FAIL: supply chain section still says commands "will be actionable once the pipeline ships" — they are actionable now');
  }
  // Must NOT say "what each release will carry" (future tense for shipped capability)
  if (section.includes("what each release will carry")) {
    failures.push('Assert 13 FAIL: supply chain section still uses future tense "what each release will carry" — capabilities shipped');
  }
  // Must NOT contain present-tense capability verbs that imply unshipped (the old denylist)
  const unshippedVerbs = ["to be generated", "will be signed", "will carry", "will be built with", "will embed", "will be attached"];
  for (const verb of unshippedVerbs) {
    if (section.includes(verb)) {
      failures.push(`Assert 13 FAIL: future-tense claim "${verb}" found in supply chain section — capability has shipped`);
    }
  }
}
// Must carry both mandatory caveats
if (!lower.includes("cozo") && !lower.includes("cozo-redux")) {
  failures.push('Assert 13 FAIL: cozo git-dependency gap not documented on trust page');
}
if (!lower.includes("native sqlite") && !lower.includes("bundled native sqlite")) {
  failures.push('Assert 13 FAIL: bundled native SQLite gap not documented on trust page');
}
// Boundary: must not claim this is a product feature for users
if (!lower.includes("not a product feature") && !lower.includes("not a product feature that")) {
  failures.push('Assert 13 FAIL: supply chain section must state it is not a product feature for the user');
}

// Assert 14: banned terms must not appear on the trust page
for (const banned of ["tamper-proof", "immutable", "blockchain-grade"]) {
  if (lower.includes(banned)) {
    failures.push(`Assert 14 FAIL: banned term "${banned}" found on trust page`);
  }
}

// Assert 15: SECURITY.md exists and contains required content
const securityPath = join(process.cwd(), "SECURITY.md");
if (!existsSync(securityPath)) {
  failures.push('Assert 15 FAIL: SECURITY.md does not exist at repo root');
} else {
  const securityContent = readFileSync(securityPath, "utf8").toLowerCase();
  if (!securityContent.includes("supply chain attestation")) {
    failures.push('Assert 15 FAIL: SECURITY.md does not mention "supply chain attestation"');
  }
  if (!securityContent.includes("shipped")) {
    failures.push('Assert 15 FAIL: SECURITY.md does not use "shipped" language for supply chain capabilities');
  }
  if (!securityContent.includes("cosign verify-blob")) {
    failures.push('Assert 15 FAIL: SECURITY.md missing cosign verify-blob recipe');
  }
  if (!securityContent.includes("gh attestation verify")) {
    failures.push('Assert 15 FAIL: SECURITY.md missing gh attestation verify recipe');
  }
  if (!securityContent.includes("cargo audit bin")) {
    failures.push('Assert 15 FAIL: SECURITY.md missing cargo audit bin recipe');
  }
  if (!securityContent.includes("cozo")) {
    failures.push('Assert 15 FAIL: SECURITY.md missing cozo git-dependency gap');
  }
  if (!securityContent.includes("native sqlite") && !securityContent.includes("bundled native sqlite")) {
    failures.push('Assert 15 FAIL: SECURITY.md missing native SQLite gap');
  }
  if (!securityContent.includes("not a product feature") && !securityContent.includes("not a product feature that")) {
    failures.push('Assert 15 FAIL: SECURITY.md missing boundary statement');
  }
  for (const banned of ["tamper-proof", "immutable", "blockchain-grade"]) {
    if (securityContent.includes(banned)) {
      failures.push(`Assert 15 FAIL: banned term "${banned}" found in SECURITY.md`);
    }
  }
}

// Assert 16: release-notes template exists and contains required content
const templatePath = join(process.cwd(), "docs/release-notes-template.md");
if (!existsSync(templatePath)) {
  failures.push('Assert 16 FAIL: docs/release-notes-template.md does not exist');
} else {
  const templateContent = readFileSync(templatePath, "utf8").toLowerCase();
  if (!templateContent.includes("sha-256") && !templateContent.includes("sha256")) {
    failures.push('Assert 16 FAIL: release-notes template missing SHA-256 verification section');
  }
  if (!templateContent.includes("supply chain attestation")) {
    failures.push('Assert 16 FAIL: release-notes template missing supply chain attestation section');
  }
  if (!templateContent.includes("cosign")) {
    failures.push('Assert 16 FAIL: release-notes template missing cosign mention');
  }
  if (!templateContent.includes("gh attestation verify")) {
    failures.push('Assert 16 FAIL: release-notes template missing gh attestation verify');
  }
  if (!templateContent.includes("cargo audit bin")) {
    failures.push('Assert 16 FAIL: release-notes template missing cargo audit bin');
  }
  if (!templateContent.includes("cozo")) {
    failures.push('Assert 16 FAIL: release-notes template missing cozo gap');
  }
  if (!templateContent.includes("native sqlite")) {
    failures.push('Assert 16 FAIL: release-notes template missing native SQLite gap');
  }
}

if (failures.length > 0) {
  console.error("\ncheck-trust-truth: FAILED\n");
  failures.forEach((f) => console.error(" ", f));
  process.exit(1);
} else {
  console.log("check-trust-truth: all assertions passed");
}
