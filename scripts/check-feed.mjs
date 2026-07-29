/**
 * check-feed.mjs — Atom feed parity with changelogEntries (0097).
 * Requires a prior build so the static feed route is materialised.
 *
 * Asserts entry count, slug set, title set, order, namespace, RFC 3339 dates,
 * Planned-date rule, and byte-level structural parity with changelogEntries
 * (DoD-7: no extra prose).
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RFC3339 =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function unescapeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function orderedEntries(entries) {
  const dated = entries
    .filter((e) => DATE_RE.test(e.date))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const planned = entries.filter((e) => !DATE_RE.test(e.date));
  return [...dated, ...planned];
}

function buildExpectedFeed(entries, siteUrl) {
  const real = entries
    .map((e) => e.date)
    .filter((d) => DATE_RE.test(d))
    .sort()
    .reverse();
  assert.ok(real.length > 0, "changelog requires at least one YYYY-MM-DD date");
  const updated = `${real[0]}T00:00:00Z`;
  const FEED_SELF = `${siteUrl}/changelog/feed.xml`;
  const FEED_HTML = `${siteUrl}/changelog`;
  const entriesXml = orderedEntries(entries)
    .map((entry) => {
      const permalink = `${FEED_HTML}#${entry.slug}`;
      const entryUpdated = DATE_RE.test(entry.date)
        ? `${entry.date}T00:00:00Z`
        : updated;
      const summary = `${entry.area}: ${entry.details}`;
      return [
        "  <entry>",
        `    <id>${escapeXml(permalink)}</id>`,
        `    <title>${escapeXml(entry.title)}</title>`,
        `    <updated>${entryUpdated}</updated>`,
        `    <link rel="alternate" href="${escapeXml(permalink)}"/>`,
        `    <summary>${escapeXml(summary)}</summary>`,
        "  </entry>",
      ].join("\n");
    })
    .join("\n");
  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<feed xmlns="http://www.w3.org/2005/Atom">`,
    `  <id>${escapeXml(FEED_SELF)}</id>`,
    `  <title>${escapeXml("Ledgerful changelog")}</title>`,
    `  <updated>${updated}</updated>`,
    `  <link rel="self" href="${escapeXml(FEED_SELF)}" type="application/atom+xml"/>`,
    `  <link rel="alternate" href="${escapeXml(FEED_HTML)}" type="text/html"/>`,
    `  <author><name>${escapeXml("Ledgerful")}</name></author>`,
    entriesXml,
    `</feed>`,
    "",
  ].join("\n");
}

async function loadFeedXml() {
  const bodyPath = path.join(
    root,
    ".next",
    "server",
    "app",
    "changelog",
    "feed.xml.body",
  );
  if (existsSync(bodyPath)) {
    return readFile(bodyPath, "utf8");
  }

  const routeJs = path.join(
    root,
    ".next",
    "server",
    "app",
    "changelog",
    "feed.xml",
    "route.js",
  );
  if (existsSync(routeJs)) {
    const mod = await import(`file:///${routeJs.replace(/\\/g, "/")}`);
    assert.equal(typeof mod.GET, "function", "built feed route must export GET");
    const res = await mod.GET();
    return await res.text();
  }

  assert.fail(
    "Built changelog feed not found under .next — run `npm run build` first",
  );
}

const { changelogEntries } = await loadTsModule("src/lib/content/changelog.ts");
const { siteUrl } = await loadTsModule("src/lib/content/navigation.ts");

const xml = await loadFeedXml();
const expectedXml = buildExpectedFeed(changelogEntries, siteUrl);

assert.match(
  xml,
  /<feed\s+xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/,
  "Atom root must declare xmlns=http://www.w3.org/2005/Atom",
);

// Normalize line endings for Windows vs Unix build artifacts.
assert.equal(
  xml.replace(/\r\n/g, "\n"),
  expectedXml.replace(/\r\n/g, "\n"),
  "feed XML must match changelogEntries-derived Atom byte-for-byte (DoD-7 parity + order)",
);

const titles = [...xml.matchAll(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/g)].map(
  (m) => unescapeXml(m[1]),
);
const ids = [...xml.matchAll(/<entry>[\s\S]*?<id>([\s\S]*?)<\/id>/g)].map((m) =>
  unescapeXml(m[1]),
);
const updateds = [...xml.matchAll(/<updated>([^<]+)<\/updated>/g)].map((m) => m[1]);

const expectedOrder = orderedEntries(changelogEntries);

assert.equal(
  titles.length,
  changelogEntries.length,
  `feed entry count ${titles.length} != changelogEntries ${changelogEntries.length}`,
);

// Order: newest real dates first, planned last (plan step 24/27)
assert.deepEqual(
  titles,
  expectedOrder.map((e) => e.title),
  "feed entry title order must match newest-dated-first then planned",
);
assert.deepEqual(
  ids,
  expectedOrder.map((e) => `${siteUrl}/changelog#${e.slug}`),
  "feed entry id order must match stable permalink order",
);

const expectedSlugs = new Set(changelogEntries.map((e) => e.slug));
const feedSlugs = new Set(ids.map((id) => (id.includes("#") ? id.split("#").pop() : "")));
assert.equal(feedSlugs.size, expectedSlugs.size, "feed slug set size mismatch");
for (const slug of expectedSlugs) {
  assert.ok(feedSlugs.has(slug), `feed missing slug id: ${slug}`);
}

for (const u of updateds) {
  assert.match(u, RFC3339, `updated must be RFC 3339 date-time: ${u}`);
}

const realDates = changelogEntries
  .map((e) => e.date)
  .filter((d) => DATE_RE.test(d))
  .sort()
  .reverse();
const expectedFeedUpdated = `${realDates[0]}T00:00:00Z`;
const feedLevelUpdated = xml.match(/<feed[\s\S]*?<updated>([^<]+)<\/updated>/)?.[1];
assert.equal(
  feedLevelUpdated,
  expectedFeedUpdated,
  "feed-level <updated> must be max real entry date",
);

const planned = changelogEntries.filter((e) => !DATE_RE.test(e.date));
for (const entry of planned) {
  const permalink = `${siteUrl}/changelog#${entry.slug}`;
  const entryBlock = xml.match(
    new RegExp(
      `<entry>[\\s\\S]*?<id>${permalink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/id>[\\s\\S]*?<\\/entry>`,
    ),
  )?.[0];
  assert.ok(entryBlock, `planned entry block missing for ${entry.slug}`);
  const entryUpdated = entryBlock.match(/<updated>([^<]+)<\/updated>/)?.[1];
  assert.equal(
    entryUpdated,
    expectedFeedUpdated,
    `planned entry ${entry.slug} must use feed-level updated`,
  );
}

console.log("check-feed: all assertions passed ✓");
