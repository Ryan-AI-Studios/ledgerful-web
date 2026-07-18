// check-soc2-mapping.mjs
//
// Truth-check gate for Track 0048-AuditorEvidenceMapping web slice.
// Asserts that /docs/soc2-mapping built page is present, emits noindex,
// carries the draft label and disclaimer, contains the engine mapping's
// control IDs, and contains no banned compliance-claim terms in affirmative
// form.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "parse5";

const ENGINE_MAPPINGS_PATH = "C:\\dev\\ledgerful\\mappings\\soc2.toml";
const BUILT_HTML_PATH = ".next/server/app/docs/soc2-mapping.html";

const EXPECTED_CONTROL_IDS = ["CC8.1", "CC3.4", "CC7.1", "CC7.2", "CC6.8", "CC4.1"];

function unquote(value) {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
}

function unescapeString(value) {
  return value
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

function parseStringValue(value) {
  return unescapeString(unquote(value.trim()));
}

function parseStringArray(text) {
  const values = [];
  let current = "";
  let inString = false;
  let escaped = false;

  for (const char of text) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      current += char;
      continue;
    }
    if (char === "," && !inString) {
      if (current.trim()) {
        values.push(parseStringValue(current));
      }
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) {
    values.push(parseStringValue(current));
  }

  return values;
}

function parseEngineToml() {
  const raw = readFileSync(ENGINE_MAPPINGS_PATH, "utf8");
  const lines = raw.split("\n");
  const controls = [];
  let currentSection = null;
  let currentControl = {};

  function flushControl() {
    if (currentSection === "control" && currentControl.id && currentControl.title) {
      controls.push({ id: currentControl.id, title: currentControl.title });
    }
    currentControl = {};
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    if (trimmed.startsWith("[[control]]")) {
      flushControl();
      currentSection = "control";
      continue;
    }

    if (trimmed === "[meta]") {
      flushControl();
      currentSection = "meta";
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (currentSection === "control") {
      if (key === "evidence") {
        parseStringArray(value);
      } else {
        currentControl[key] = parseStringValue(value);
      }
    }
  }

  flushControl();
  return controls;
}

function findRobotsContent(html) {
  const document = parse(html);
  const stack = [document];

  while (stack.length > 0) {
    const node = stack.pop();
    if (
      node?.nodeName === "meta" &&
      node.attrs?.some((attribute) => attribute.name === "name" && attribute.value === "robots")
    ) {
      return node.attrs.find((attribute) => attribute.name === "content")?.value;
    }
    if (node?.childNodes) stack.push(...node.childNodes);
  }

  return undefined;
}

function isNegatedLine(line) {
  const lower = line.toLowerCase();
  return (
    lower.includes("not ") ||
    lower.includes("do not ") ||
    lower.includes("does not ") ||
    lower.includes("never") ||
    lower.includes("are not ") ||
    lower.includes("is not ") ||
    lower.includes("we are not") ||
    lower.includes("no claim") ||
    lower.includes("not a ")
  );
}

function checkBannedTerms(html) {
  const banned = [
    { term: "SOC 2 compliant", pattern: /\bSOC 2 compliant\b/i },
    { term: "HIPAA ready", pattern: /\bHIPAA (ready|compliant)\b/i },
    { term: "certified", pattern: /\bcertified\b/i },
    { term: "tamper-proof", pattern: /\btamper-proof\b/i },
    { term: "is audited", pattern: /\bis audited\b/i },
    { term: "is a compliance attestation", pattern: /\bis a compliance attestation\b/i },
  ];

  const lines = html.split(/\r?\n/);
  const violations = [];

  for (const line of lines) {
    if (isNegatedLine(line)) continue;
    for (const { term, pattern } of banned) {
      if (pattern.test(line)) {
        violations.push({ term, line: line.trim() });
      }
    }
  }

  return violations;
}

const html = readFileSync(BUILT_HTML_PATH, "utf8");

assert.match(html, /<h1[^>]*>[^<]*SOC 2 control-evidence mapping[^<]*<\/h1>/, "built page must contain the expected h1");

const robotsContent = findRobotsContent(html);
assert.ok(robotsContent, "built page must emit robots metadata");
assert.match(robotsContent, /\bnoindex\b/, "robots content must contain noindex");
assert.match(robotsContent, /\bnofollow\b/, "robots content must contain nofollow");

assert.ok(
  html.includes("Draft — pending design-partner validation"),
  "built page must display the draft label",
);

assert.ok(
  /mapping aid/i.test(html) || /NOT a certification or compliance attestation/i.test(html),
  "built page must contain the disclaimer phrase",
);

for (const id of EXPECTED_CONTROL_IDS) {
  assert.ok(
    html.includes(id),
    `built page must contain expected control ID ${id}`,
  );
}

const bannedViolations = checkBannedTerms(html);
if (bannedViolations.length > 0) {
  for (const violation of bannedViolations) {
    console.error(`Banned term found: ${violation.term} in: ${violation.line}`);
  }
  process.exit(1);
}

const engineControls = parseEngineToml();
for (const control of engineControls) {
  assert.ok(
    html.includes(control.id),
    `built page must contain control ID ${control.id} from engine mappings/soc2.toml`,
  );
}

console.log(
  `SOC 2 mapping check passed (${engineControls.length} controls, noindex, draft-labeled, no banned terms).`,
);
