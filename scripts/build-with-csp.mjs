import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parse } from "parse5";

const root = process.cwd();
const appOutput = path.join(root, ".next", "server", "app");
const hashDirectory = path.join(root, ".csp");
const hashFile = path.join(hashDirectory, "csp-script-hashes.json");

function runNextBuild() {
  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  // --webpack is pinned because vercel build fails with Turbopack output ("Unable to find lambda
  // for route"). The parse5-based CSP extractor is Turbopack-compatible, but Vercel's build
  // adapter is not. Revisit when Vercel supports Turbopack output for this Next.js version.
  const result = spawnSync(process.execPath, [nextBin, "build", "--webpack"], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return htmlFiles(target);
      return entry.isFile() && entry.name.endsWith(".html") ? [target] : [];
    }),
  );
  return files.flat();
}

function routeFor(file) {
  const relative = path.relative(appOutput, file).replaceAll("\\", "/");
  const route = `/${relative.slice(0, -".html".length)}`;
  return route === "/index" ? "/" : route;
}

function inlineScripts(html) {
  const scripts = [];
  const nodes = [parse(html)];
  while (nodes.length > 0) {
    const node = nodes.pop();
    if (node.childNodes) nodes.push(...node.childNodes);
    if (node.tagName !== "script" || node.attrs?.some((attr) => attr.name === "src")) continue;
    const script = (node.childNodes ?? [])
      .filter((child) => child.nodeName === "#text")
      .map((child) => child.value)
      .join("");
    if (script) scripts.push(script);
  }
  return scripts;
}

async function emittedInlineScriptHashes() {
  const routes = {};
  for (const file of await htmlFiles(appOutput)) {
    const hashes = new Set();
    const html = await readFile(file, "utf8");
    for (const script of inlineScripts(html)) {
      const digest = createHash("sha256").update(script).digest("base64");
      hashes.add(`sha256-${digest}`);
    }
    routes[routeFor(file)] = [...hashes].sort();
  }
  return Object.fromEntries(Object.entries(routes).sort(([a], [b]) => a.localeCompare(b)));
}

async function currentHashes() {
  try {
    return JSON.parse(await readFile(hashFile, "utf8"));
  } catch {
    return {};
  }
}

await mkdir(hashDirectory, { recursive: true });
runNextBuild();

const previous = await currentHashes();
const generated = await emittedInlineScriptHashes();
if (JSON.stringify(previous) !== JSON.stringify(generated)) {
  await writeFile(hashFile, `${JSON.stringify(generated, null, 2)}\n`, "utf8");
  console.log(`Updated generated CSP hashes for ${Object.keys(generated).length} routes; rebuilding headers.`);
  runNextBuild();

  const verified = await emittedInlineScriptHashes();
  if (JSON.stringify(generated) !== JSON.stringify(verified)) {
    throw new Error("Inline script hashes changed across deterministic production builds.");
  }
}

const hashCount = new Set(Object.values(generated).flat()).size;
console.log(`Verified ${hashCount} unique generated CSP hashes across ${Object.keys(generated).length} routes.`);
