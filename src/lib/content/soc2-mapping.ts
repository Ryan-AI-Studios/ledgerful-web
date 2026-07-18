import { readFileSync } from "node:fs";

/**
 * Build-time content module for the SOC 2 control-evidence mapping page.
 *
 * Reads the engine's mappings/soc2.toml at build time and parses it into a
 * typed shape. No runtime fetch, no secrets, no "use client".
 */

export type Soc2Control = {
  id: string;
  title: string;
  evidence: string[];
  provenance: string;
  limit: string;
};

export type Soc2Mapping = {
  meta: {
    framework: string;
    version: string;
    source: string;
    disclaimer: string;
    status: string;
  };
  controls: Soc2Control[];
};

export const soc2MappingDraftLabel = "Draft — pending design-partner validation";

const ENGINE_MAPPINGS_PATH = "C:\\dev\\ledgerful\\mappings\\soc2.toml";

function unquote(value: string): string {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
}

function unescapeString(value: string): string {
  return value
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

function parseStringValue(value: string): string {
  return unescapeString(unquote(value.trim()));
}

function parseStringArray(text: string, sourcePath: string): string[] {
  if (!text.startsWith("[") || !text.endsWith("]")) {
    throw new Error(
      `Malformed string array in ${sourcePath}: "${text}". Array must start with '[' and end with ']'.`,
    );
  }
  text = text.slice(1, -1).trim();

  const values: string[] = [];
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

export function parseSoc2Toml(raw: string, sourcePath: string): Soc2Mapping {
  const lines = raw.split("\n");
  const mapping: Soc2Mapping = {
    meta: { framework: "", version: "", source: "", disclaimer: "", status: "" },
    controls: [],
  };

  let currentSection: "meta" | "control" | null = null;
  let currentControl: Partial<Soc2Control> = {};

  function flushControl() {
    if (currentSection === "control") {
      const required: (keyof Soc2Control)[] = ["id", "title", "evidence", "provenance", "limit"];
      for (const key of required) {
        const value = currentControl[key];
        if (value === undefined || (Array.isArray(value) && value.length === 0)) {
          throw new Error(
            `Incomplete [[control]] table in ${sourcePath}: missing "${key}".`,
          );
        }
      }
      mapping.controls.push(currentControl as Soc2Control);
    }
    currentControl = {};
  }

  let lineNumber = 0;
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
        `Malformed line ${lineNumber} in ${sourcePath}: "${trimmed}". Expected key = value.`,
      );
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (currentSection === "meta") {
      const metaKeys: (keyof Soc2Mapping["meta"])[] = [
        "framework",
        "version",
        "source",
        "disclaimer",
        "status",
      ];
      if (!metaKeys.includes(key as keyof Soc2Mapping["meta"])) {
        throw new Error(
          `Unexpected key "${key}" at line ${lineNumber} in [meta] table of ${sourcePath}.`,
        );
      }
      mapping.meta[key as keyof Soc2Mapping["meta"]] = parseStringValue(value);
      continue;
    }

    if (currentSection === "control") {
      if (key === "evidence") {
        if (!value.startsWith("[") || !value.endsWith("]")) {
          throw new Error(
            `Control at line ${lineNumber} in ${sourcePath} has malformed "evidence" value. Array must be on a single line.`,
          );
        }
        currentControl.evidence = parseStringArray(value, sourcePath);
      } else {
        const controlStringKeys: (keyof Omit<Soc2Control, "evidence">)[] = ["id", "title", "provenance", "limit"];
        if (!controlStringKeys.includes(key as keyof Omit<Soc2Control, "evidence">)) {
          throw new Error(
            `Unexpected key "${key}" at line ${lineNumber} in [[control]] table of ${sourcePath}.`,
          );
        }
        currentControl[key as keyof Omit<Soc2Control, "evidence">] = parseStringValue(value);
      }
    }
  }

  flushControl();

  const requiredMeta: (keyof Soc2Mapping["meta"])[] = ["framework", "version", "source", "disclaimer", "status"];
  for (const key of requiredMeta) {
    if (!mapping.meta[key]) {
      throw new Error(
        `Missing required [meta] field "${key}" in ${sourcePath}.`,
      );
    }
  }

  if (mapping.controls.length === 0) {
    throw new Error(
      `No [[control]] tables found in ${sourcePath}. The mapping cannot be empty.`,
    );
  }

  return mapping;
}

export function getSoc2Mapping(): Soc2Mapping {
  let raw: string;
  try {
    raw = readFileSync(ENGINE_MAPPINGS_PATH, "utf8");
  } catch (error) {
    throw new Error(
      `Failed to read engine SOC 2 mapping at ${ENGINE_MAPPINGS_PATH}. ` +
        `The web slice cannot drift from the engine source of truth. ` +
        `Ensure the engine repo is present and run the build again.`,
      { cause: error },
    );
  }
  return parseSoc2Toml(raw, ENGINE_MAPPINGS_PATH);
}
