import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { checkLaunchTruth, evaluateStaleness } from "../scripts/check-launch-truth.mjs";

const source = await readFile(new URL("../src/lib/content/launch-facts.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { launchTruth, launchFacts } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const now = new Date("2026-03-01T00:30:00Z");
const { repository, release, mcpPackage } = launchTruth.facts;
const endpoints = [repository.apiUrl, release.apiUrl, mcpPackage.registryUrl];

async function run({ verifiedAt = "2026-03-01", live = false, schemaVersion = 1, replies = {} } = {}) {
  const defaults = {
    [repository.apiUrl]: () => Response.json({ private: false }),
    [release.apiUrl]: () => Response.json({
      tag_name: release.tag,
      assets: release.requiredAssets.map((name) => ({ name })),
    }),
    [mcpPackage.registryUrl]: () => Response.json({
      version: mcpPackage.version,
      ledgerfulEngineTag: mcpPackage.engineTag,
    }),
  };
  const requests = [];
  const warnings = [];
  const errors = [];
  const unexpected = [];
  const code = await checkLaunchTruth({
    launchTruth: { ...launchTruth, verifiedAt, schemaVersion },
    launchFacts,
    now,
    live,
    fetchResponse(url) {
      requests.push(url);
      if (!Object.hasOwn(defaults, url)) {
        unexpected.push(url);
        throw new Error(`Unexpected request to ${url}`);
      }
      return (replies[url] ?? defaults[url])();
    },
    output: { log() {}, warn: (line) => warnings.push(line), error: (line) => errors.push(line) },
  });
  assert.deepEqual(unexpected, []);
  return { code, requests, warnings, errors };
}

test("UTC day boundaries warn at 15 and fail at 31", async () => {
  for (const [date, age, warning, code] of [
    ["2026-02-15", 14, false, 0],
    ["2026-02-14", 15, true, 0],
    ["2026-01-30", 30, true, 0],
    ["2026-01-29", 31, true, 3],
  ]) {
    assert.equal(evaluateStaleness(date, now).ageDays, age);
    const result = await run({ verifiedAt: date });
    assert.equal(result.code, code);
    assert.equal(result.warnings.length > 0, warning);
    assert.deepEqual(result.requests, []);
  }
});

test("stale and invalid dates stop live checks before network", async () => {
  for (const date of ["2026-01-29", "2026-03-02", "2026-3-01", "2026-99-99", "2026-02-30"]) {
    const result = await run({ verifiedAt: date, live: true });
    assert.equal(result.code, 3, date);
    assert.deepEqual(result.requests, []);
    assert.match(result.errors.join("\n"), /STALE/);
    assert.doesNotMatch(result.errors.join("\n"), /DRIFT/);
  }
});

test("live success reaches GitHub and npm", async () => {
  const result = await run({ live: true });
  assert.equal(result.code, 0);
  assert.deepEqual(result.requests, endpoints);
});

test("release and npm mismatches and HTTP 403 are assertions", async () => {
  for (const [url, reply, expectedRequests] of [
    [release.apiUrl, () => Response.json({ tag_name: "v0.0.0" }), endpoints.slice(0, 2)],
    [mcpPackage.registryUrl, () => Response.json({ version: "0.0.0" }), endpoints],
    [mcpPackage.registryUrl, () => Response.json({
      version: mcpPackage.version,
      ledgerfulEngineTag: "v0.0.0",
    }), endpoints],
    [repository.apiUrl, () => new Response(null, { status: 403 }), endpoints.slice(0, 1)],
  ]) {
    const result = await run({ live: true, replies: { [url]: reply } });
    assert.equal(result.code, 1);
    assert.deepEqual(result.requests, expectedRequests);
  }
  const result = await run({ live: true, schemaVersion: 0 });
  assert.equal(result.code, 1);
  assert.deepEqual(result.requests, []);
});

test("mocked transport failures are UNVERIFIED, including at npm", async () => {
  for (const [url, reply, expectedRequests] of [
    [repository.apiUrl, () => { throw new TypeError("Mock DNS failure"); }, endpoints.slice(0, 1)],
    [mcpPackage.registryUrl, () => new Response(null, { status: 503 }), endpoints],
  ]) {
    const result = await run({ live: true, replies: { [url]: reply } });
    assert.equal(result.code, 2);
    assert.deepEqual(result.requests, expectedRequests);
    assert.match(result.errors.join("\n"), /UNVERIFIED/);
    assert.doesNotMatch(result.errors.join("\n"), /DRIFT/);
  }
});

test("workflow reporter emits the category and propagates the checker exit", () => {
  const script = fileURLToPath(new URL("../scripts/report-launch-truth-status.mjs", import.meta.url));
  for (const [code, diagnostic] of [
    [0, /live state matches register/],
    [1, /::error::Launch truth DRIFT/],
    [2, /::warning::Launch truth UNVERIFIED/],
    [3, /::error::Launch truth STALE/],
    [7, /::error::Launch truth checker returned unexpected status 7/],
  ]) {
    const result = spawnSync(process.execPath, [script, String(code)], { encoding: "utf8" });
    assert.ifError(result.error);
    assert.equal(result.status, code);
    const output = result.stdout + result.stderr;
    assert.match(output, diagnostic);
    if (code !== 1) assert.doesNotMatch(output, /DRIFT/);
  }
});
