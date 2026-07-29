/**
 * Launch-truth baseline and optional live publication drift check.
 *
 * Exit taxonomy (fixed; used by CI launch-truth-drift):
 *   0 — pass (internal baseline OK; when live, published state matches register)
 *   1 — drift / assert fail (claims wrong, required asset missing, stale baseline, …)
 *   2 — UNVERIFIED (transport: timeout, DNS/network error, HTTP 429, HTTP 5xx)
 *
 * Live network is OFF by default so PR `check:truth` stays offline.
 * Enable live:  LAUNCH_TRUTH_LIVE=1  (or `npm run check:launch-truth:live`)
 * Offline escape when something else set LIVE: LAUNCH_TRUTH_LIVE=0
 *
 * Test hook (DoD-2 transport proof): LAUNCH_TRUTH_API_BASE
 *   When set, rewrites https://api.github.com → this base for GitHub API URLs only.
 *   Example (force UNVERIFIED): LAUNCH_TRUTH_API_BASE=https://198.51.100.1
 *   npm registry URLs are never rewritten by this override.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import ts from "typescript";

const sourceUrl = new URL("../src/lib/content/launch-facts.ts", import.meta.url);
const source = await readFile(sourceUrl, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const contentModule = await import(
  `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`
);
const { launchTruth, launchFacts } = contentModule;

const USER_AGENT = "ledgerful-web-launch-truth-check/1.0";
const GH_API_ORIGIN = "https://api.github.com";

/** Transport / environment failure — must exit 2, never silent 0. */
class UnverifiedError extends Error {
  constructor(reason) {
    super(reason);
    this.name = "UnverifiedError";
  }
}

function isTransportHttpStatus(status) {
  return status === 429 || status >= 500;
}

/**
 * Optional override for GitHub API base (DoD-2 / local transport tests).
 * Only rewrites urls that start with https://api.github.com.
 */
function resolveRequestUrl(url) {
  const override = process.env.LAUNCH_TRUTH_API_BASE?.trim();
  if (!override) return url;
  if (!url.startsWith(GH_API_ORIGIN)) return url;
  const base = override.replace(/\/$/, "");
  return `${base}${url.slice(GH_API_ORIGIN.length)}`;
}

async function request(url) {
  const resolved = resolveRequestUrl(url);
  try {
    return await fetch(resolved, {
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: {
        Accept: "application/vnd.github+json, application/json;q=0.9, */*;q=0.8",
        "User-Agent": USER_AGENT,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new UnverifiedError(`request failed for ${resolved}: ${message}`);
  }
}

/**
 * Publication-state assertion.
 * - Transport (429/5xx) → UnverifiedError (exit 2)
 * - expectedPublished true + non-ok (incl. 404) → assert fail (exit 1 / drift)
 * - expectedPublished false → only 404 is OK; other non-transport statuses fail assert
 */
function assertPublishedState(response, expectedPublished, label) {
  if (isTransportHttpStatus(response.status)) {
    throw new UnverifiedError(
      `${label}: transport HTTP ${response.status}`,
    );
  }
  if (expectedPublished) {
    assert.ok(
      response.ok,
      `${label} became unavailable (HTTP ${response.status})`,
    );
    return;
  }
  assert.equal(
    response.status,
    404,
    `${label} could not be verified as unpublished/private (expected HTTP 404, received ${response.status})`,
  );
}

function assertStaleness() {
  assert.match(launchTruth.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  const verifiedDate = new Date(`${launchTruth.verifiedAt}T00:00:00Z`);
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const ageMs = today.getTime() - verifiedDate.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays > 14) {
    console.warn(
      `Launch truth baseline is older than 14 days (verified ${launchTruth.verifiedAt}). Consider refreshing with current verified evidence.`,
    );
  }
  if (ageDays > 30) {
    assert.fail(
      `Launch truth baseline is stale (verified ${launchTruth.verifiedAt}, older than 30 days). Update launch-facts.ts with current verified evidence.`,
    );
  }
}

function assertInternalBaseline() {
  assert.equal(
    launchTruth.schemaVersion,
    1,
    "Update the drift checker when the launch-truth schema changes",
  );
  assertStaleness();
  assert.equal(
    launchFacts.length,
    Object.keys(launchTruth.facts).length,
    "Every launch-truth fact must render through launchFacts",
  );
  assert.equal(
    launchTruth.facts.telemetry.enabledByDefault,
    false,
    "Telemetry must remain disabled by default",
  );
  assert.equal(
    launchTruth.facts.telemetry.inDefaultBuild,
    false,
    "The default engine build must not imply compiled-in usage metrics",
  );
  assert.equal(
    launchTruth.facts.license.status,
    "resolved",
    "The public license state must be resolved (license is in force)",
  );
  assert.equal(
    launchTruth.facts.license.legalLaunchReviewComplete,
    true,
    "Legal launch review must be complete (LLC formed, IP assigned, counsel-reviewed)",
  );
  assert.deepEqual(
    launchTruth.facts.telemetry.payloadFields,
    [
      "schema_version",
      "anonymous_id",
      "client_version",
      "platform",
      "sent_at",
      "window_start",
      "window_end",
      "command_counts",
      "features_enabled",
      "active_days_in_window",
    ],
    "Telemetry launch truth must match the engine UsagePayload",
  );
  assert.equal(
    typeof launchTruth.facts.repository.anonymousAccess,
    "boolean",
    "Repository publication state must be explicit",
  );
  assert.equal(
    typeof launchTruth.facts.release.publiclyAvailable,
    "boolean",
    "Release publication state must be explicit",
  );
  assert.equal(
    typeof launchTruth.facts.mcpPackage.publiclyAvailable,
    "boolean",
    "MCP package publication state must be explicit",
  );
  assert.deepEqual(
    launchTruth.facts.release.requiredAssets.filter((asset) =>
      asset.includes("windows-msvc"),
    ),
    [
      "ledgerful-x86_64-pc-windows-msvc.zip",
      "ledgerful-x86_64-pc-windows-msvc.zip.sha256",
    ],
    "Windows release truth must match the ZIP artifacts emitted by release.yml",
  );
}

async function checkPublishedState() {
  const repository = await request(launchTruth.facts.repository.apiUrl);
  assertPublishedState(
    repository,
    launchTruth.facts.repository.anonymousAccess,
    "Anonymous repository state",
  );

  const release = await request(launchTruth.facts.release.apiUrl);
  assertPublishedState(
    release,
    launchTruth.facts.release.publiclyAvailable,
    "Published release state",
  );
  if (release.ok) {
    let data;
    try {
      data = await release.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new UnverifiedError(
        `Published release state: response body not JSON (${message})`,
      );
    }
    assert.equal(
      data.tag_name,
      launchTruth.facts.release.tag,
      `Published release tag drifted from ${launchTruth.facts.release.tag} to ${data.tag_name}`,
    );
    const assetNames = new Set(
      (data.assets ?? []).map((asset) => asset.name),
    );
    for (const requiredAsset of launchTruth.facts.release.requiredAssets) {
      assert.ok(
        assetNames.has(requiredAsset),
        `Published release is missing required asset ${requiredAsset}`,
      );
    }
  }

  const npmPackage = await request(launchTruth.facts.mcpPackage.registryUrl);
  assertPublishedState(
    npmPackage,
    launchTruth.facts.mcpPackage.publiclyAvailable,
    "Published MCP package state",
  );
  if (npmPackage.ok) {
    let data;
    try {
      data = await npmPackage.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new UnverifiedError(
        `Published MCP package state: response body not JSON (${message})`,
      );
    }
    assert.equal(
      data.version,
      launchTruth.facts.mcpPackage.version,
      `Published MCP package version drifted from ${launchTruth.facts.mcpPackage.version} to ${data.version}`,
    );
    // ledgerfulEngineTag is a top-level field on the registry document (0101).
    assert.equal(
      data.ledgerfulEngineTag,
      launchTruth.facts.mcpPackage.engineTag,
      `Published MCP ledgerfulEngineTag drifted from ${launchTruth.facts.mcpPackage.engineTag} to ${data.ledgerfulEngineTag}`,
    );
  }
}

function assertPublicLedgerBundle() {
  const bundleDir = new URL("../public/ledger/", import.meta.url);
  const ndjsonPath = new URL("entries.ndjson", bundleDir);
  const manifestPath = new URL("manifest.json", bundleDir);
  assert.ok(
    existsSync(ndjsonPath),
    "Public ledger bundle missing: public/ledger/entries.ndjson — run npm run generate:ledger",
  );
  const ndjson = readFileSync(ndjsonPath, "utf8");
  const lines = ndjson.split("\n").filter(Boolean);
  assert.ok(
    lines.length > 0,
    "Public ledger bundle is empty: public/ledger/entries.ndjson has no entries",
  );
  assert.ok(
    existsSync(manifestPath),
    "Public ledger manifest missing: public/ledger/manifest.json",
  );
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(
    manifest.entryCount,
    lines.length,
    `Public ledger manifest entryCount (${manifest.entryCount}) does not match entries.ndjson line count (${lines.length})`,
  );
  console.log(
    `Public ledger bundle: ${lines.length} entries, manifest verified.`,
  );
}

function emitUnverified(reason) {
  const line = `Launch truth: UNVERIFIED — ${reason}`;
  console.error(line);
  if (process.env.GITHUB_ACTIONS === "true") {
    // warning annotation (not error): this is transport, not claim drift
    console.error(`::warning::Launch truth UNVERIFIED — ${reason}`);
  }
}

function liveEnabled() {
  // Explicit offline escape if LIVE was set elsewhere in the environment.
  if (process.env.LAUNCH_TRUTH_LIVE === "0") return false;
  return process.env.LAUNCH_TRUTH_LIVE === "1";
}

async function main() {
  assertInternalBaseline();
  assertPublicLedgerBundle();

  if (liveEnabled()) {
    await checkPublishedState();
    console.log(
      `Launch truth baseline matches anonymous published state (verified ${launchTruth.verifiedAt}).`,
    );
  } else {
    console.log(
      "Launch truth: live network drift-check skipped (set LAUNCH_TRUTH_LIVE=1 to enable; LAUNCH_TRUTH_LIVE=0 forces offline).",
    );
  }
}

try {
  await main();
} catch (err) {
  if (err instanceof UnverifiedError) {
    emitUnverified(err.message);
    process.exit(2);
  }
  // AssertionError and other hard failures → drift / assert (exit 1)
  if (err && typeof err === "object" && "message" in err) {
    console.error(err.message);
  } else {
    console.error(err);
  }
  process.exit(1);
}
