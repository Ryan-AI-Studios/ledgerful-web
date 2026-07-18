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

function parseStringArray(text, sourcePath) {
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
            `Incomplete [[control]] table in ${ENGINE_MAPPINGS_PATH}: missing "${key}".`,
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
        `Malformed line ${lineNumber} in ${ENGINE_MAPPINGS_PATH}: "${trimmed}". Expected key = value.`,
      );
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (currentSection === "meta") {
      if (!metaKeys.has(key)) {
        throw new Error(
          `Unexpected key "${key}" at line ${lineNumber} in [meta] table of ${ENGINE_MAPPINGS_PATH}.`,
        );
      }
      meta[key] = parseStringValue(value);
      continue;
    }

    if (currentSection === "control") {
      const stringKeys = new Set(["id", "title", "provenance", "limit"]);
      if (key === "evidence") {
        currentControl.evidence = parseStringArray(value, ENGINE_MAPPINGS_PATH);
      } else if (stringKeys.has(key)) {
        currentControl[key] = parseStringValue(value);
      } else {
        throw new Error(
          `Unexpected key "${key}" at line ${lineNumber} in [[control]] table of ${ENGINE_MAPPINGS_PATH}.`,
        );
      }
    }
  }

  flushControl();

  for (const key of metaKeys) {
    if (!meta[key]) {
      throw new Error(
        `Missing required [meta] field "${key}" in ${ENGINE_MAPPINGS_PATH}.`,
      );
    }
  }

  if (controls.length === 0) {
    throw new Error(
      `No [[control]] tables found in ${ENGINE_MAPPINGS_PATH}. The mapping cannot be empty.`,
    );
  }

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

const engineControls = parseEngineToml();
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
