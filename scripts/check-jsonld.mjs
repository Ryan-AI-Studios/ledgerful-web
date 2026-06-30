import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const serverAppDir = ".next/server/app";

const KNOWN_SCHEMA_TYPES = new Set([
  "Organization",
  "SoftwareApplication",
  "WebSite",
  "WebPage",
  "Product",
  "FAQPage",
]);

const REQUIRED_FIELDS = {
  Organization: ["name", "url"],
  SoftwareApplication: ["name", "applicationCategory"],
};

const errors = [];
const filesChecked = [];

async function collectHtmlFiles(dir) {
  const entries = [];
  try {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        entries.push(...(await collectHtmlFiles(fullPath)));
      } else if (item.isFile() && item.name.endsWith(".html")) {
        entries.push(fullPath);
      }
    }
  } catch (err) {
    errors.push(`Cannot read ${dir}: ${err.message}`);
  }
  return entries;
}

function validateBlock(block, sourceFile, index) {
  const prefix = `${sourceFile} block #${index + 1}`;
  let parsed;
  try {
    parsed = JSON.parse(block);
  } catch (err) {
    errors.push(`${prefix}: invalid JSON — ${err.message}`);
    return;
  }

  if (parsed["@context"] !== "https://schema.org") {
    errors.push(
      `${prefix}: @context must be "https://schema.org", got ${JSON.stringify(parsed["@context"])}`,
    );
  }

  const type = parsed["@type"];
  if (typeof type !== "string" || !KNOWN_SCHEMA_TYPES.has(type)) {
    errors.push(
      `${prefix}: @type must be a known schema type, got ${JSON.stringify(type)}`,
    );
    return;
  }

  const required = REQUIRED_FIELDS[type];
  if (required) {
    for (const field of required) {
      if (!(field in parsed)) {
        errors.push(`${prefix}: required field "${field}" missing for @type "${type}"`);
      }
    }
  }
}

const htmlFiles = await collectHtmlFiles(serverAppDir);
for (const file of htmlFiles) {
  const content = await readFile(file, "utf8");
  filesChecked.push(file);
  const matches = content.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  let count = 0;
  for (const match of matches) {
    validateBlock(match[1].trim(), file, count);
    count++;
  }
}

console.log(`Checked JSON-LD in ${filesChecked.length} HTML file(s).`);

if (errors.length > 0) {
  console.error("JSON-LD validation failed:");
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log("All JSON-LD blocks passed validation.");
