import { readFileSync } from "node:fs";
import path from "node:path";

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

const VENDOR_MAPPINGS_PATH = path.join(
  process.cwd(),
  "src",
  "lib",
  "content",
  "soc2-mapping.toml",
);

function parseStringValue(value: string, lineNumber: number): string {
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

function parseStringArray(text: string, sourcePath: string, lineNumber: number): string[] {
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
      mapping.meta[key as keyof Soc2Mapping["meta"]] = parseStringValue(value, lineNumber);
      continue;
    }

    if (currentSection === "control") {
      if (key === "evidence") {
        if (!value.startsWith("[") || !value.endsWith("]")) {
          throw new Error(
            `Control at line ${lineNumber} in ${sourcePath} has malformed "evidence" value. Array must be on a single line.`,
          );
        }
        currentControl.evidence = parseStringArray(value, sourcePath, lineNumber);
      } else {
        const controlStringKeys: (keyof Omit<Soc2Control, "evidence">)[] = ["id", "title", "provenance", "limit"];
        if (!controlStringKeys.includes(key as keyof Omit<Soc2Control, "evidence">)) {
          throw new Error(
            `Unexpected key "${key}" at line ${lineNumber} in [[control]] table of ${sourcePath}.`,
          );
        }
        const parsed = parseStringValue(value, lineNumber);
        if (parsed === "") {
          throw new Error(
            `empty control ${key} at line ${lineNumber} in ${sourcePath}`,
          );
        }
        currentControl[key as keyof Omit<Soc2Control, "evidence">] = parsed;
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
  const raw = readFileSync(VENDOR_MAPPINGS_PATH, "utf8");
  return parseSoc2Toml(raw, VENDOR_MAPPINGS_PATH);
}
