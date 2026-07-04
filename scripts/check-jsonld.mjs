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

  // Regression guard for the 0026 fix: schema.org has no "DeveloperTool"
  // value — the correct enum member is "DeveloperApplication". Catch a
  // future re-introduction of the non-standard value.
  if (type === "SoftwareApplication" && parsed.applicationCategory === "DeveloperTool") {
    errors.push(
      `${prefix}: applicationCategory must never be "DeveloperTool" (non-standard) — use "DeveloperApplication"`,
    );
  }
}

// Content-drift check (0026 DoD-2/DoD-3): each HTML file's og:url meta tag
// must point at the same path as that file's own canonical link. This is
// the exact regression class the 0026 track fixed (every route's og:url
// silently defaulted to the homepage instead of its own URL) — catch it if
// it ever comes back.
// Attribute-order-independent: finds the whole tag by one attribute, then
// pulls a different attribute out of that tag string. A regex anchored to
// a fixed attribute order (e.g. `rel="..." href="..."`) would silently stop
// matching if Next or its HTML serializer ever reorders attributes.
function extractTagAttr(html, tagRegex, attrName) {
  const tagMatch = html.match(tagRegex);
  if (!tagMatch) return null;
  const attrMatch = tagMatch[0].match(new RegExp(`${attrName}="([^"]+)"`, "i"));
  return attrMatch ? attrMatch[1] : null;
}

function pathOf(url) {
  if (!url) return null;
  try {
    return new URL(url).pathname.replace(/\/$/, "") || "/";
  } catch {
    return null;
  }
}

function validateOgUrlDrift(content, sourceFile) {
  const canonicalHref = extractTagAttr(
    content,
    /<link\s+[^>]*rel="canonical"[^>]*>/i,
    "href",
  );
  const ogUrlContent = extractTagAttr(
    content,
    /<meta\s+[^>]*property="og:url"[^>]*>/i,
    "content",
  );

  if (!ogUrlContent) return; // No og:url on this page — nothing to drift-check.
  if (!canonicalHref) {
    errors.push(
      `${sourceFile}: has og:url ("${ogUrlContent}") but no canonical <link> to compare against`,
    );
    return;
  }

  const canonicalPath = pathOf(canonicalHref);
  const ogUrlPath = pathOf(ogUrlContent);

  if (canonicalPath === null || ogUrlPath === null) {
    errors.push(
      `${sourceFile}: could not parse canonical ("${canonicalHref}") or og:url ("${ogUrlContent}") as a URL`,
    );
    return;
  }

  if (canonicalPath !== ogUrlPath) {
    errors.push(
      `${sourceFile}: og:url path "${ogUrlPath}" does not match canonical path "${canonicalPath}"`,
    );
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
  validateOgUrlDrift(content, file);
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
