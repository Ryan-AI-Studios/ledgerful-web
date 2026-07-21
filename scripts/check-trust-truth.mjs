import { readFileSync, existsSync } from "fs";
import { join } from "path";

function readHtml(route) {
  const htmlPath = join(process.cwd(), `.next/server/app${route}.html`);
  try {
    return readFileSync(htmlPath, "utf8");
  } catch {
    console.error("FAIL: Could not read", htmlPath, "— run npm run build first");
    process.exit(1);
  }
}

const trustHtmlRaw = readHtml("/trust");
const securityHtmlRaw = readHtml("/docs/security");
const trustLower = trustHtmlRaw.toLowerCase();
const securityLower = securityHtmlRaw.toLowerCase();
const failures = [];

// Assertions that must hold on the concise /trust landing page.

if (trustLower.includes("ledgerful.io")) {
  failures.push("Canonical-domain FAIL: trust page must use ledgerful.dev, not ledgerful.io");
}
if (trustLower.includes("operative source terms")) {
  failures.push("License FAIL: resolved terms must not be called operative");
}
if (!trustLower.includes("in force") && !trustLower.includes("license is in force")) {
  failures.push("License FAIL: trust page must state the license is in force");
}
if (trustLower.includes("github actions integration for the future hosted ci workflow")) {
  failures.push(
    "GitHub boundary FAIL: the self-managed Action must not be conflated with the future hosted App",
  );
}

// Assert 2-6: concise procurement-facing claims stay on /trust.
if (!trustLower.includes("opt-in")) {
  failures.push('Assert 2 FAIL: "opt-in" not found on /trust — telemetry opt-in claim missing');
}
if (!trustLower.includes("source") || !trustLower.includes("upload")) {
  failures.push('Assert 3 FAIL: "source" and/or "upload" not found on /trust — no-source-upload claim missing');
}
if (!trustLower.includes("loopback") && !trustLower.includes("127.0.0.1")) {
  failures.push('Assert 4 FAIL: "loopback" or "127.0.0.1" not found on /trust — daemon access not documented');
}
if (!trustLower.includes("sha-256") && !trustLower.includes("checksum")) {
  failures.push('Assert 5 FAIL: "SHA-256" or "checksum" not found on /trust — release verification not documented');
}
if (!trustLower.includes("responsible disclosure")) {
  failures.push('Assert 6 FAIL: "responsible disclosure" not found on /trust');
}

// Assert 14: banned terms must not appear on either trust/security page.
for (const banned of ["tamper-proof", "immutable", "blockchain-grade"]) {
  if (trustLower.includes(banned)) {
    failures.push(`Assert 14 FAIL: banned term "${banned}" found on /trust`);
  }
  if (securityLower.includes(banned)) {
    failures.push(`Assert 14 FAIL: banned term "${banned}" found on /docs/security`);
  }
}

// Assertions that must hold on the deep /docs/security page.

// Assert 4 (deep): hardened token details.
for (const required of ["authorization", "bearer", "in memory", "stripped"]) {
  if (!securityLower.includes(required)) {
    failures.push(
      `Auth-flow FAIL: /docs/security is missing hardened token detail "${required}"`,
    );
  }
}

// Assert 7: enterprise identity terms must not appear without "planned".
const enterpriseTerms = ["sso", "saml", "oidc", "scim", "rbac"];
for (const term of enterpriseTerms) {
  const regex = new RegExp(`(?<![a-z0-9_-])${term}(?![a-z0-9_-])`, "gi");
  let match;
  while ((match = regex.exec(securityLower)) !== null) {
    const idx = match.index;
    const window = securityLower.slice(Math.max(0, idx - 120), idx + term.length + 120);
    if (window.includes("planned")) {
      continue;
    }
    if (term === "oidc" && (window.includes("cosign") || window.includes("sigstore") || window.includes("fulcio") || window.includes("release workflow"))) {
      continue;
    }
    failures.push(`Assert 7 FAIL: "${term.toUpperCase()}" appears on /docs/security without a "planned" qualifier nearby`);
    break;
  }
}
const auditIdx = securityLower.indexOf("audit log");
if (auditIdx !== -1) {
  const window = securityLower.slice(Math.max(0, auditIdx - 120), auditIdx + 120);
  if (!window.includes("planned")) {
    failures.push('Assert 7 FAIL: "audit log" appears on /docs/security without "planned" qualifier nearby');
  }
}

// Assert 8: crash reporting addressed.
if (!securityLower.includes("crash")) {
  failures.push('Assert 8 FAIL: crash reporting not addressed on /docs/security');
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
  if (!securityLower.includes(field)) {
    failures.push(`Assert 9 FAIL: telemetry field "${field}" is missing on /docs/security`);
  }
}
for (const staleField of ["subcommand / action", "duration / timing"]) {
  if (securityLower.includes(staleField)) {
    failures.push(`Assert 9 FAIL: stale telemetry field "${staleField}" is still published on /docs/security`);
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
  if (!securityLower.includes(phrase)) {
    failures.push(`Assert 10 FAIL: /docs/security disclosure is missing "${phrase}"`);
  }
}

// Assert 11: current signing-key filename is documented.
if (!securityLower.includes("private.key")) {
  failures.push('Assert 11 FAIL: current private.key signing-key path is missing on /docs/security');
}

// Assert 12: waitlist ESP subprocessor is disclosed.
if (!securityLower.includes("kit (waitlist)") && !securityLower.includes("kit (formerly convertkit)")) {
  failures.push('Assert 12 FAIL: Kit waitlist ESP subprocessor not disclosed on /docs/security');
}
if (!securityLower.includes("double opt-in")) {
  failures.push('Assert 12 FAIL: "double opt-in" not found on /docs/security — waitlist consent model not documented');
}
if (!securityLower.includes("email capture is separate from telemetry")) {
  failures.push('Assert 12 FAIL: email-capture ≠ telemetry reconciliation missing on /docs/security');
}
if (!securityLower.includes("waitlist deletion request")) {
  failures.push('Assert 12 FAIL: waitlist deletion path not disclosed on /docs/security');
}

// Assert 13: supply chain attestation — shipped language + caveats.
if (!securityLower.includes("supply chain attestation")) {
  failures.push('Assert 13 FAIL: "supply chain attestation" section not found on /docs/security');
}
if (!securityLower.includes("sbom")) {
  failures.push('Assert 13 FAIL: "SBOM" not mentioned on /docs/security');
}
if (!securityLower.includes("cosign")) {
  failures.push('Assert 13 FAIL: "cosign" not mentioned on /docs/security');
}
if (!securityLower.includes("slsa")) {
  failures.push('Assert 13 FAIL: "SLSA" not mentioned on /docs/security');
}
if (!securityLower.includes("cargo auditable")) {
  failures.push('Assert 13 FAIL: "cargo auditable" not mentioned on /docs/security');
}
const scaIdx = securityLower.indexOf('id="supply-chain-attestation"');
if (scaIdx !== -1) {
  const sectionEnd = securityLower.indexOf('id="telemetry"', scaIdx + 1);
  const section = securityLower.slice(
    scaIdx,
    sectionEnd !== -1 ? sectionEnd : securityLower.length,
  );
  if (section.includes("planned (track 0053)")) {
    failures.push('Assert 13 FAIL: supply chain section still says "Planned (track 0053)" — supply-chain attestation shipped since v0.1.8');
  }
  if (section.includes("will be actionable once the pipeline ships")) {
    failures.push('Assert 13 FAIL: supply chain section still says commands "will be actionable once the pipeline ships" — they are actionable now');
  }
  if (section.includes("what each release will carry")) {
    failures.push('Assert 13 FAIL: supply chain section still uses future tense "what each release will carry" — capabilities shipped');
  }
  const unshippedVerbs = ["to be generated", "will be signed", "will carry", "will be built with", "will embed", "will be attached"];
  for (const verb of unshippedVerbs) {
    if (section.includes(verb)) {
      failures.push(`Assert 13 FAIL: future-tense claim "${verb}" found in supply chain section — capability has shipped`);
    }
  }
}
if (!securityLower.includes("cozo") && !securityLower.includes("cozo-redux")) {
  failures.push('Assert 13 FAIL: cozo git-dependency gap not documented on /docs/security');
}
if (!securityLower.includes("native sqlite") && !securityLower.includes("bundled native sqlite")) {
  failures.push('Assert 13 FAIL: bundled native SQLite gap not documented on /docs/security');
}
if (!securityLower.includes("not a product feature") && !securityLower.includes("not a product feature that")) {
  failures.push('Assert 13 FAIL: /docs/security supply chain section must state it is not a product feature for the user');
}

// Assert 15: SECURITY.md exists and contains required content.
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

// Assert 16: release-notes template exists and contains required content.
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

// Assert 17: policy as code (0049) on /trust — section + honest limit + base-branch constraint.
if (!trustLower.includes("policy as code") && !trustLower.includes('id="policy-as-code"')) {
  failures.push(
    'Assert 17 FAIL: "policy as code" section missing on /trust (id="policy-as-code" or heading text)',
  );
}
if (!trustLower.includes("ledgerful policy check") && !trustLower.includes("policy check")) {
  failures.push('Assert 17 FAIL: "policy check" not mentioned on /trust');
}
if (
  !trustLower.includes("declared") ||
  !trustLower.includes("presented") ||
  !(
    trustLower.includes("not a compliance") ||
    trustLower.includes("not a certification") ||
    trustLower.includes("compliance verdict")
  )
) {
  failures.push(
    'Assert 17 FAIL: honest-limit language missing on /trust (declared/presented + not compliance/certification)',
  );
}
if (!trustLower.includes("base branch") && !trustLower.includes("base-branch")) {
  failures.push(
    'Assert 17 FAIL: base-branch policy constraint not called out on /trust',
  );
}
// Also required on the deep security architecture page.
if (!securityLower.includes("policy as code") && !securityLower.includes('id="policy-as-code"')) {
  failures.push(
    'Assert 17 FAIL: "policy as code" section missing on /docs/security',
  );
}
if (!securityLower.includes("base branch") && !securityLower.includes("base-branch")) {
  failures.push(
    'Assert 17 FAIL: base-branch policy constraint not called out on /docs/security',
  );
}
// Banned positive compliance overclaims only — "not SOC 2 certified" is allowed.
function hasPositiveOverclaim(haystack, phrase) {
  const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  let m;
  while ((m = re.exec(haystack)) !== null) {
    const window = haystack.slice(Math.max(0, m.index - 40), m.index + phrase.length + 10);
    if (/\bnot\b|\bno\b|\baren't\b|\bare not\b/.test(window)) {
      continue;
    }
    return true;
  }
  return false;
}
for (const banned of ["you are compliant", "makes you compliant", "soc 2 certified"]) {
  if (hasPositiveOverclaim(trustLower, banned)) {
    failures.push(`Assert 17 FAIL: banned compliance overclaim "${banned}" on /trust`);
  }
  if (hasPositiveOverclaim(securityLower, banned)) {
    failures.push(
      `Assert 17 FAIL: banned compliance overclaim "${banned}" on /docs/security`,
    );
  }
}

// Assert 18: the optional local context bridge is disclosed for completeness of
// the data-flow boundary, and kept generic — Claims Register A18 + the bridge
// surface firewall (Track 0064/0065): never name AI-Brains, never imply a
// cloud/LLM/session nature or a supported API.
if (!securityLower.includes("local context bridge")) {
  failures.push('Assert 18 FAIL: optional "local context bridge" completeness note missing on /docs/security');
}
for (const [route, html] of [["/trust", trustLower], ["/docs/security", securityLower]]) {
  if (html.includes("ai-brains") || html.includes("ai brains")) {
    failures.push(`Assert 18 FAIL: bridge disclosure must stay generic — must not name AI-Brains on ${route} (Claims Register A18 / bridge firewall)`);
  }
}

if (failures.length > 0) {
  console.error("\ncheck-trust-truth: FAILED\n");
  failures.forEach((f) => console.error(" ", f));
  process.exit(1);
} else {
  console.log("check-trust-truth: all assertions passed");
}
