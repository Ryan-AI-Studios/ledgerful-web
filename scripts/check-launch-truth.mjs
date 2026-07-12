import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

async function request(url) {
  return fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    headers: {
      Accept: "application/vnd.github+json, application/json;q=0.9, */*;q=0.8",
      "User-Agent": USER_AGENT,
    },
  });
}

function assertPublishedState(response, expectedPublished, label) {
  if (expectedPublished) {
    assert.ok(response.ok, `${label} became unavailable (HTTP ${response.status})`);
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
    const data = await release.json();
    assert.equal(
      data.tag_name,
      launchTruth.facts.release.tag,
      `Published release tag drifted from ${launchTruth.facts.release.tag} to ${data.tag_name}`,
    );
    const assetNames = new Set(data.assets.map((asset) => asset.name));
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
    const data = await npmPackage.json();
    assert.equal(
      data.version,
      launchTruth.facts.mcpPackage.version,
      `Published MCP package version drifted from ${launchTruth.facts.mcpPackage.version} to ${data.version}`,
    );
  }
}

assertInternalBaseline();
if (process.env.LAUNCH_TRUTH_LIVE === "1") {
  await checkPublishedState();
  console.log(
    `Launch truth baseline matches anonymous published state (verified ${launchTruth.verifiedAt}).`,
  );
} else {
  console.log(
    "Launch truth: live network drift-check skipped (set LAUNCH_TRUTH_LIVE=1 to enable).",
  );
}
