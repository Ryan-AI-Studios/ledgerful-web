import { readFileSync } from "fs";
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
  failures.push("License FAIL: unresolved draft terms must not be called operative");
}
if (!lower.includes("draft terms") || !lower.includes("legal launch review")) {
  failures.push("License FAIL: trust page must label the terms draft pending legal review");
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
const enterpriseTerms = ["sso", "saml", "oidc", "scim", "rbac"];
for (const term of enterpriseTerms) {
  const regex = new RegExp(`\\b${term}\\b`, "gi");
  let match;
  while ((match = regex.exec(lower)) !== null) {
    const idx = match.index;
    // Check within 120 chars in either direction for "planned"
    const window = lower.slice(Math.max(0, idx - 120), idx + term.length + 120);
    if (!window.includes("planned")) {
      failures.push(`Assert 7 FAIL: "${term.toUpperCase()}" appears without a "planned" qualifier nearby`);
      break; // one failure per term is enough
    }
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

if (failures.length > 0) {
  console.error("\ncheck-trust-truth: FAILED\n");
  failures.forEach((f) => console.error(" ", f));
  process.exit(1);
} else {
  console.log("check-trust-truth: all assertions passed");
}
