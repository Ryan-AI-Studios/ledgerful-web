import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pricing = await readFile(".next/server/app/pricing.html", "utf8");

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

// All five approved feature state labels must appear
const requiredLabels = [
  ["Available", "available state label"],
  ["Beta", "beta state label"],
  ["Local-only", "local-only state label"],
  ["Hosted planned", "hosted planned state label"],
  ["Enterprise planned", "enterprise planned state label"],
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

// Quiet-preview noindex must still be active
assert.match(
  pricing,
  /<meta name="robots" content="[^"]*noindex[^"]*"/,
  "Pricing page must emit noindex metadata while quiet preview is active",
);

console.log("Pricing truth checks passed.");
