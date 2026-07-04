import assert from "node:assert/strict";
import test from "node:test";
import {
  bannedPositioningTerms,
  findPositioningViolations,
} from "../scripts/lib/positioning-terms.mjs";

test("the positioning gate detects every prohibited term case-insensitively", () => {
  const source = bannedPositioningTerms
    .map((term, index) => `${index + 1}. ${term.toUpperCase()}`)
    .join("\n");

  const violations = findPositioningViolations([
    { path: "src/app/example/page.tsx", content: source },
  ]);

  assert.deepEqual(
    violations.map(({ term }) => term),
    bannedPositioningTerms,
  );
});

test("the positioning gate preserves legitimate Ledgerful vocabulary", () => {
  const violations = findPositioningViolations([
    {
      path: "src/lib/content/example.ts",
      content:
        "Ledgerful records ledger provenance with cryptographic signatures and cryptography-backed verification.",
    },
  ]);

  assert.deepEqual(violations, []);
});

test("violations identify the source file and line", () => {
  const violations = findPositioningViolations([
    {
      path: "src/app/example/page.tsx",
      content: "Allowed first line.\nA wallet claim is forbidden.",
    },
  ]);

  assert.deepEqual(violations, [
    {
      path: "src/app/example/page.tsx",
      line: 2,
      term: "wallet",
      excerpt: "A wallet claim is forbidden.",
    },
  ]);
});

test("rendered output catches terms assembled from source fragments", () => {
  const sourceFragments = ["wal", "let"];
  const violations = findPositioningViolations([
    {
      path: ".next/server/app/example.html",
      content: `<main>${sourceFragments.join("")} claim</main>`,
    },
  ]);

  assert.deepEqual(
    violations.map(({ term }) => term),
    ["wallet"],
  );
});
