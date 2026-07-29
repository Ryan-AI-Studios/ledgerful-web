/**
 * check-sitemap.mjs — route-registry completeness + sitemap hygiene (0097).
 *
 * Oracle: post-build `.next/server/app-paths-manifest.json` (pages + API/handlers).
 * Fail closed if the manifest is missing — never fall back to a page.tsx glob.
 * Requires `npm run build` first (CI already orders build → check:truth).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, ".next", "server", "app-paths-manifest.json");

async function loadTsModule(relativeFromRoot) {
  const sourceUrl = path.join(root, relativeFromRoot);
  const source = await readFile(sourceUrl, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`
  );
}

/**
 * Normalize app-paths-manifest keys to URL paths.
 * "/page" → "/"
 * "/docs/security/page" → "/docs/security"
 * "/api/waitlist/route" → "/api/waitlist"
 * "/ledger/[txId]/page" → "/ledger/[txId]"
 * "/changelog/feed.xml/route" → "/changelog/feed.xml"
 */
export function normalizeManifestPath(key) {
  let p = key.startsWith("/") ? key : `/${key}`;
  if (p.endsWith("/page")) {
    p = p.slice(0, -"/page".length) || "/";
  } else if (p.endsWith("/route")) {
    p = p.slice(0, -"/route".length) || "/";
  }
  if (p === "") p = "/";
  return p;
}

async function findSitemapXml() {
  const candidates = [
    path.join(root, ".next", "server", "app", "sitemap.xml.body"),
    path.join(root, ".next", "server", "app", "sitemap.xml"),
    path.join(root, ".next", "static", "sitemap.xml"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  // Next may place it under .next/server/app with different extensions
  const appDir = path.join(root, ".next", "server", "app");
  if (!existsSync(appDir)) return null;
  const stack = [appDir];
  while (stack.length) {
    const dir = stack.pop();
    const entries = await readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (ent.name.startsWith("sitemap.xml")) return full;
    }
  }
  return null;
}

if (!existsSync(manifestPath)) {
  console.error(
    "check-sitemap: missing .next/server/app-paths-manifest.json — run `npm run build` first",
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const { indexableRoutes, excludedRoutes } = await loadTsModule(
  "src/lib/content/routes.ts",
);

const indexable = new Set(indexableRoutes);
const excluded = new Set(excludedRoutes.map((e) => e.route));
const covered = new Set([...indexable, ...excluded]);

const missing = [];
for (const key of Object.keys(manifest)) {
  const route = normalizeManifestPath(key);
  if (!covered.has(route)) {
    missing.push({ key, route });
  }
}

assert.equal(
  missing.length,
  0,
  `Routes present in app-paths-manifest but in neither indexableRoutes nor excludedRoutes:\n${missing
    .map((m) => `  ${m.route} (manifest key: ${m.key})`)
    .join("\n")}`,
);

// Built sitemap hygiene
const sitemapFile = await findSitemapXml();
assert.ok(sitemapFile, "Built sitemap.xml not found under .next — run `npm run build` first");
const sitemapXml = await readFile(sitemapFile, "utf8");

assert.ok(!sitemapXml.includes("#"), "sitemap must not contain fragment URLs");
assert.ok(
  !sitemapXml.includes("/docs/soc2-mapping"),
  "sitemap must not include /docs/soc2-mapping (404 by design)",
);
assert.ok(
  !/<lastmod[\s>]/i.test(sitemapXml),
  "sitemap must not include <lastmod> (intentionally omitted — wrong dates are worse than none)",
);

const { siteUrl } = await loadTsModule("src/lib/content/navigation.ts");
for (const route of indexableRoutes) {
  const url = route === "/" ? siteUrl : `${siteUrl}${route}`;
  assert.ok(
    sitemapXml.includes(`<loc>${url}</loc>`) || sitemapXml.includes(url),
    `sitemap missing indexable route: ${route} (${url})`,
  );
}

console.log(
  `check-sitemap: all assertions passed ✓ (${Object.keys(manifest).length} manifest paths, ${indexableRoutes.length} indexable)`,
);
