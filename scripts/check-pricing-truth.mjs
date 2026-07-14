import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pricing, install] = await Promise.all([
  readFile(".next/server/app/pricing.html", "utf8"),
  readFile(".next/server/app/install.html", "utf8"),
]);

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

// No checkout, trial, or sales CTAs until a real path exists
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

// Planned editions must carry a 'Pricing not announced' label
assert.match(
  pricing,
  /Pricing not announced/,
  "Hosted and enterprise editions must display 'Pricing not announced'",
);

// 0025-WebPricingReframe: plain-English boundary sentence must lead the page
assert.match(
  pricing,
  /free for individuals, noncommercial use, and small companies/i,
  "Pricing must lead with the plain-English free/paid/agreement boundary sentence",
);

// New edition names must be present (Local / Commercial License / Hosted / Enterprise)
assert.match(pricing, /Commercial License/, "Pricing must include the Commercial License edition");

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
