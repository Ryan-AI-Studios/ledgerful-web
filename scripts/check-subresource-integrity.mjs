import { createHash } from "node:crypto";
import process from "node:process";
import { parse } from "parse5";

const browserHeaders = {
  Accept: "*/*",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
    ? {
        "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
        "x-vercel-skip-toolbar": "1",
      }
    : {}),
};

function scriptResources(html, documentUrl) {
  const resources = [];
  const nodes = [parse(html)];
  while (nodes.length > 0) {
    const node = nodes.pop();
    if (node.childNodes) nodes.push(...node.childNodes);
    if (node.tagName !== "script") continue;
    const attributes = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
    if (!attributes.src) continue;
    resources.push({
      integrity: attributes.integrity,
      url: new URL(attributes.src, documentUrl),
    });
  }
  return resources;
}

function sha256(bytes) {
  return `sha256-${createHash("sha256").update(bytes).digest("base64")}`;
}

function parseTargets() {
  const args = process.argv.slice(2);
  const targets = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url") {
      if (i + 1 >= args.length) {
        console.error("Error: --url requires a value");
        process.exit(2);
      }
      targets.push(args[++i]);
    } else if (!args[i].startsWith("--")) {
      targets.push(args[i]);
    }
  }
  if (targets.length === 0 && process.env.PLAYWRIGHT_BASE_URL) {
    targets.push(process.env.PLAYWRIGHT_BASE_URL);
  }
  const normalized = [];
  for (const t of targets) {
    try {
      normalized.push(new URL(t).toString());
    } catch {
      console.error(`Error: invalid URL "${t}"`);
      process.exit(2);
    }
  }
  return [...new Set(normalized)];
}

const targets = parseTargets();
if (targets.length === 0) {
  console.error(
    "Usage: node scripts/check-subresource-integrity.mjs [--url <deployment-url>]... [<deployment-url>]... or set PLAYWRIGHT_BASE_URL",
  );
  process.exit(2);
}

const failures = [];
let checkedScripts = 0;

for (const target of targets) {
  const documentUrl = new URL(target);
  const documentResponse = await fetch(documentUrl, { headers: browserHeaders });
  if (!documentResponse.ok) {
    failures.push(`${documentUrl}: document returned HTTP ${documentResponse.status}`);
    continue;
  }

  const resources = scriptResources(await documentResponse.text(), documentUrl);
  const firstPartyResources = resources.filter(({ url }) => url.origin === documentUrl.origin);
  for (const resource of firstPartyResources) {
    const response = await fetch(resource.url, { headers: browserHeaders });
    checkedScripts += 1;
    if (!response.ok) {
      failures.push(`${resource.url}: returned HTTP ${response.status}`);
      continue;
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (resource.integrity) {
      const acceptedDigests = resource.integrity.split(/\s+/);
      const digest = sha256(bytes);
      if (!acceptedDigests.includes(digest)) {
        failures.push(
          `${resource.url}: integrity mismatch (declared ${resource.integrity}; received ${digest})`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`Deploy-parity script check failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(
  `Deploy-parity script check passed for ${targets.length} document(s) and ${checkedScripts} first-party script(s).`,
);
