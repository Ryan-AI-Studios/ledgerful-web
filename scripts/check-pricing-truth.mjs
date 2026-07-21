import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const exceptionVendorPath = path.join("public", "COMMERCIAL-EXCEPTION.md");
assert.ok(
  existsSync(exceptionVendorPath),
  "public/COMMERCIAL-EXCEPTION.md must exist (vendored Exception)",
);
assert.ok(
  statSync(exceptionVendorPath).size >= 100,
  "public/COMMERCIAL-EXCEPTION.md must be non-empty",
);

const [pricing, install, commercialConfig] = await Promise.all([
  readFile(".next/server/app/editions.html", "utf8"),
  readFile(".next/server/app/install.html", "utf8"),
  readFile(path.join("src", "lib", "content", "commercial-pricing.ts"), "utf8"),
]);

// Parse figures from the runtime `commercialPricing.tiers` object (ignore type-only
// `priceUsd: 1500` annotations). Prefer `priceUsd: N as const` then fall back to unique values.
const runtimePriceMatches = [
  ...commercialConfig.matchAll(/priceUsd:\s*(\d+)\s+as\s+const/g),
].map((m) => Number(m[1]));
const priceUsdMatches =
  runtimePriceMatches.length >= 2
    ? runtimePriceMatches
    : [...new Set([...commercialConfig.matchAll(/priceUsd:\s*(\d+)/g)].map((m) => Number(m[1])))];
assert.equal(
  priceUsdMatches.length,
  2,
  "commercial-pricing.ts must declare exactly two runtime priceUsd bands",
);
assert.deepEqual(
  priceUsdMatches,
  [1500, 2500],
  "commercial-pricing.ts must pin Phase-0 figures priceUsd 1500 then 2500",
);
assert.match(
  commercialConfig,
  /legal@ledgerful\.dev/,
  "commercial-pricing.ts must use legal@ledgerful.dev",
);

const formatUsd = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

for (const amount of priceUsdMatches) {
  const display = formatUsd(amount);
  assert.match(
    pricing,
    new RegExp(display.replace(/\$/g, "\\$")),
    `Editions HTML must display ${display} derived from commercial-pricing.ts priceUsd ${amount}`,
  );
}

// Edition names must not imply a live hosted beta or unverified contact path
assert.doesNotMatch(
  pricing,
  /Team Hosted Beta/,
  "Pricing must not contain 'Team Hosted Beta' — rename to remove live-beta implication",
);
assert.doesNotMatch(
  pricing,
  /Enterprise\s*\/\s*Contact/,
  "Pricing must not contain 'Enterprise / Contact' — remove unverified contact path",
);

// No checkout, fake trial CTAs, or sales funnel language until a real path exists.
// "Evaluation Use" (Exception grant) is allowed; "free trial" / "start trial" are not.
assert.doesNotMatch(
  pricing,
  /\b(free trial|start trial|contact sales|subscribe now|checkout)\b/i,
  "Pricing must not contain unverified checkout, trial, or sales CTAs",
);
assert.doesNotMatch(
  pricing,
  /\bfree\s*\/\s*local\b/i,
  "Pricing must not describe PolyForm-qualified local use as generally free",
);
assert.doesNotMatch(
  install,
  /\bfree\s*\/\s*local\b/i,
  "Install must not describe PolyForm-qualified local use as generally free",
);
assert.match(
  install,
  /in force|source-available|polyform/i,
  "Install must reference the in-force license terms",
);
assert.match(
  pricing,
  /in force|in-force/i,
  "Pricing must identify the license as in force",
);
assert.doesNotMatch(
  pricing,
  /different license terms[^<]*available today/i,
  "Pricing must not present unresolved license terms as available today",
);

// Forbidden overclaims on the $1M threshold (exactly $1M is NOT QSE)
assert.doesNotMatch(
  pricing,
  /≤\s*\$?\s*1\s*M|≤\s*\$1,?000,?000|up to \$1M|up to \$1,?000,?000/i,
  "Pricing must not say ≤$1M or up to $1M — use under $1M / less than $1M",
);

// All approved feature state labels must appear
const requiredLabels = [
  ["Available", "available state label"],
  ["Beta", "beta state label"],
  ["Runs locally", "runs-locally state label"],
  ["Planned", "planned state label"],
];
for (const [label, desc] of requiredLabels) {
  assert.match(
    pricing,
    new RegExp(label, "i"),
    `Pricing must include the ${desc}`,
  );
}

// Planned editions (Hosted/Enterprise) must still carry 'Pricing not announced'
assert.match(
  pricing,
  /Pricing not announced/,
  "Hosted and enterprise editions must display 'Pricing not announced'",
);

// 0025-WebPricingReframe: plain-English boundary sentence must lead the page
assert.match(
  pricing,
  /Use Ledgerful locally for free\. License it for broader commercial use\./i,
  "Editions must lead with the value-first free/commercial boundary sentence",
);

// New edition names must be present (Local / Commercial License / Hosted / Enterprise)
assert.match(pricing, /Commercial License/, "Pricing must include the Commercial License edition");

// 0069 — under $1M / less-than style (not only ≤)
assert.match(
  pricing,
  /under\s*\$1M|less than\s*\$1M|under US\$1M/i,
  "Editions must use under $1M / less-than threshold wording",
);

// 0069 — Evaluation / non-Production + Affiliates + 90-day + legal@
// Load-bearing Exception qualifiers (DoD-3) must appear in rendered HTML.
assert.match(
  pricing,
  /non-Production|Evaluation Use/i,
  "Editions must surface Evaluation Use or non-Production limits",
);
assert.match(
  pricing,
  /Affiliates/i,
  "Editions must mention Affiliates (revenue aggregation)",
);
assert.match(
  pricing,
  /90[- ]day/i,
  "Editions must surface the 90-day transition grant",
);
assert.match(
  pricing,
  /legal@ledgerful\.dev/,
  "Editions must include legal@ledgerful.dev contact",
);
assert.match(
  pricing,
  /Internal Business Use/i,
  "Editions must mention Internal Business Use",
);
assert.match(
  pricing,
  /30[- ]day/i,
  "Editions must mention the 30-day Evaluation Use window",
);
assert.match(
  pricing,
  /once per Entity|once per entity/i,
  "Editions must mention once-per-Entity evaluation limit",
);
assert.match(
  pricing,
  /OEM|hosting-as-a-service|separate written agreement/i,
  "Editions must surface OEM/hosting separate-agreement limit",
);
assert.match(
  pricing,
  /Introductory pricing/i,
  "Editions must show provisional/introductory pricing framing",
);

// 0069 — Request commercial license mailto to legal@
assert.match(
  pricing,
  /href="mailto:legal@ledgerful\.dev\?[^"]*"[^>]*>[\s\S]{0,80}Request commercial license/i,
  "Commercial card/section must wire 'Request commercial license' to mailto:legal@ledgerful.dev",
);

// 0069 — Exception href must be present (vendored public copy)
assert.match(
  pricing,
  /href="\/COMMERCIAL-EXCEPTION\.md"/,
  "Editions must link /COMMERCIAL-EXCEPTION.md",
);

// 0069 — Commercial must not claim pricing is unannounced
assert.doesNotMatch(
  pricing,
  /commercial pricing is not yet announced/i,
  "Commercial must not say pricing is not yet announced",
);
assert.doesNotMatch(
  pricing,
  /No paid commercial price is announced/i,
  "Must not claim no paid commercial price is announced",
);

// Planned-card CTAs must be labeled mailto destinations, not fake contact/sales paths
assert.match(
  pricing,
  /href="mailto:waitlist@ledgerful\.dev\?subject=[^"]*"[^>]*>\s*Join the waitlist/,
  "Hosted (planned) card must wire 'Join the waitlist' to a mailto: destination",
);
assert.match(
  pricing,
  /href="mailto:hello@ledgerful\.dev\?subject=[^"]*"[^>]*>\s*Contact us/,
  "Enterprise (planned) card must wire 'Contact us' to a mailto: destination",
);

// Planned-card mailto CTAs — inbox is now provisioned
assert.match(
  pricing,
  /Inbox is provisioned/,
  "Planned-card CTAs must disclose that the inbox is provisioned and delivery is verified",
);

// License examples must carry the "not legal advice" disclaimer (not a DRAFT banner — license is in force)
assert.match(
  pricing,
  /not legal advice/i,
  "License examples must carry the 'not legal advice' disclaimer",
);

// Do not advertise the prior-MIT arbitrage on the conversion surface (user directive,
// overrides recommendation.md §4.4 — omission, not denial; see 0025 spec.md §2)
assert.doesNotMatch(
  pricing,
  /prior (versions?|releases?|tags?).{0,40}(stay|remain|are)\s+MIT/i,
  "Pricing must not advertise that prior versions stay MIT (omission, not denial)",
);

console.log("Pricing truth checks passed.");
