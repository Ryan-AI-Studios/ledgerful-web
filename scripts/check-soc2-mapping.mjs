// check-soc2-mapping.mjs
//
// Truth-check gate for Track 0048-AuditorEvidenceMapping web slice.
// Asserts that /docs/soc2-mapping built page is present, emits noindex,
// carries the draft label and disclaimer, contains the engine mapping's
// control IDs, and contains no banned compliance-claim terms in affirmative
// form.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "parse5";

// Parser in this script must stay in sync with src/lib/content/soc2-mapping.ts.

const VENDOR_MAPPINGS_PATH = path.join(process.cwd(), "src", "lib", "content", "soc2-mapping.toml");
const ENGINE_MAPPINGS_PATH = "C:\\dev\\ledgerful\\mappings\\soc2.toml";
const BUILT_HTML_PATH = ".next/server/app/docs/soc2-mapping.html";

const NEGATION_MARKERS = [
  "not ",
  "do not ",
  "does not ",
  "never",
  "are not ",
  "is not ",
  "we are not",
  "no claim",
  "not a ",
];

function parseStringValue(value, lineNumber) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('"')) {
    throw new Error(
      `expected quoted string at line ${lineNumber}: ${trimmed}`,
    );
  }
  const closing = trimmed.indexOf('"', 1);
  if (closing === -1) {
    throw new Error(
      `unterminated string at line ${lineNumber}`,
    );
  }
  if (closing !== trimmed.length - 1) {
    throw new Error(
      `trailing characters after quoted string at line ${lineNumber}: ${trimmed}`,
    );
  }
  const inner = trimmed.slice(1, -1);
  return inner
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

function parseStringArray(text, sourcePath, lineNumber) {
  if (!text.startsWith("[") || !text.endsWith("]")) {
    throw new Error(
      `Malformed string array in ${sourcePath}: "${text}". Array must start with '[' and end with ']'.`,
    );
  }
  const inner = text.slice(1, -1).trim();
  const values = [];
  let current = "";
  let inString = false;
  let escaped = false;

  for (const char of inner) {
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
      const element = parseStringValue(current, lineNumber);
      if (element === "") {
        throw new Error(
          `empty evidence element at line ${lineNumber} in ${sourcePath}`,
        );
      }
      values.push(element);
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) {
    const element = parseStringValue(current, lineNumber);
    if (element === "") {
      throw new Error(
        `empty evidence element at line ${lineNumber} in ${sourcePath}`,
      );
    }
    values.push(element);
  }

  return values;
}

function parseVendoredToml() {
  const raw = readFileSync(VENDOR_MAPPINGS_PATH, "utf8");
  const lines = raw.split("\n");
  const meta = { framework: "", version: "", source: "", disclaimer: "", status: "" };
  const metaKeys = new Set(["framework", "version", "source", "disclaimer", "status"]);
  const controls = [];
  let currentSection = null;
  let currentControl = {};
  let lineNumber = 0;

  function flushControl() {
    if (currentSection === "control") {
      const required = ["id", "title", "evidence", "provenance", "limit"];
      for (const key of required) {
        const value = currentControl[key];
        if (value === undefined || (Array.isArray(value) && value.length === 0)) {
          throw new Error(
            `Incomplete [[control]] table in ${VENDOR_MAPPINGS_PATH}: missing "${key}".`,
          );
        }
      }
      controls.push({ id: currentControl.id, title: currentControl.title });
    }
    currentControl = {};
  }

  for (const line of lines) {
    lineNumber += 1;
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
      throw new Error(
        `Malformed line ${lineNumber} in ${VENDOR_MAPPINGS_PATH}: "${trimmed}". Expected key = value.`,
      );
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (currentSection === "meta") {
      if (!metaKeys.has(key)) {
        throw new Error(
          `Unexpected key "${key}" at line ${lineNumber} in [meta] table of ${VENDOR_MAPPINGS_PATH}.`,
        );
      }
      meta[key] = parseStringValue(value, lineNumber);
      continue;
    }

    if (currentSection === "control") {
      const stringKeys = new Set(["id", "title", "provenance", "limit"]);
      if (key === "evidence") {
        currentControl.evidence = parseStringArray(value, VENDOR_MAPPINGS_PATH, lineNumber);
      } else if (stringKeys.has(key)) {
        const parsed = parseStringValue(value, lineNumber);
        if (parsed === "") {
          throw new Error(
            `empty control ${key} at line ${lineNumber} in ${VENDOR_MAPPINGS_PATH}`,
          );
        }
        currentControl[key] = parsed;
      } else {
        throw new Error(
          `Unexpected key "${key}" at line ${lineNumber} in [[control]] table of ${VENDOR_MAPPINGS_PATH}.`,
        );
      }
    }
  }

  flushControl();

  for (const key of metaKeys) {
    if (!meta[key]) {
      throw new Error(
        `Missing required [meta] field "${key}" in ${VENDOR_MAPPINGS_PATH}.`,
      );
    }
  }

  if (controls.length === 0) {
    throw new Error(
      `No [[control]] tables found in ${VENDOR_MAPPINGS_PATH}. The mapping cannot be empty.`,
    );
  }

  return controls;
}

function assertVendorMatchesEngine() {
  let engineRaw;
  try {
    engineRaw = readFileSync(ENGINE_MAPPINGS_PATH);
  } catch {
    console.log("Vendored soc2-mapping.toml is the source of truth (engine source not available).");
    return;
  }
  const vendorRaw = readFileSync(VENDOR_MAPPINGS_PATH);
  if (Buffer.compare(engineRaw, vendorRaw) !== 0) {
    throw new Error(
      `Vendored soc2-mapping.toml differs from engine source ${ENGINE_MAPPINGS_PATH} — re-vendor it.`,
    );
  }
  console.log("Vendored soc2-mapping.toml matches engine source.");
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

function isNegatedClause(clause) {
  const lower = clause.toLowerCase();
  return NEGATION_MARKERS.some((marker) => lower.includes(marker));
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

  const clauses = html.split(/\r?\n|\.\s+|;\s+|,\s+/);
  const violations = [];

  for (const clause of clauses) {
    if (isNegatedClause(clause)) continue;
    for (const { term, pattern } of banned) {
      if (pattern.test(clause)) {
        violations.push({ term, line: clause.trim() });
      }
    }
  }

  return violations;
}

function extractRenderedControlIds(html) {
  const matches = html.matchAll(/<p[^>]*class="soc2-mapping-control-id"[^>]*>([^<]*)<\/p>/g);
  const ids = [];
  for (const match of matches) {
    ids.push(match[1].trim());
  }
  return ids;
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

const bannedViolations = checkBannedTerms(html);
if (bannedViolations.length > 0) {
  for (const violation of bannedViolations) {
    console.error(`Banned term found: ${violation.term} in: ${violation.line}`);
  }
  process.exit(1);
}

assertVendorMatchesEngine();
const engineControls = parseVendoredToml();
const renderedIds = extractRenderedControlIds(html);
const engineIds = engineControls.map((c) => c.id);

const renderedSet = new Set(renderedIds);
const engineSet = new Set(engineIds);

for (const id of renderedIds) {
  if (!engineSet.has(id)) {
    console.error(`rendered control ID ${id} not in engine TOML`);
    process.exit(1);
  }
}

for (const id of engineIds) {
  if (!renderedSet.has(id)) {
    console.error(`engine TOML control ID ${id} not rendered`);
    process.exit(1);
  }
}

console.log(
  `SOC 2 mapping check passed (${engineControls.length} controls, noindex, draft-labeled, no banned terms).`,
);
