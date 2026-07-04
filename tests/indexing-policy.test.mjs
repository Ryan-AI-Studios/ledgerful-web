import assert from "node:assert/strict";
import test from "node:test";
import { isIndexingAllowed } from "../src/lib/indexing-policy.mjs";

test("indexing requires the exact opt-in in Vercel production", () => {
  assert.equal(isIndexingAllowed("true", "production"), true);
  assert.equal(isIndexingAllowed("true", "preview"), false);
  assert.equal(isIndexingAllowed("true", "development"), false);
  assert.equal(isIndexingAllowed("true", undefined), false);
});

test("production remains hidden for missing or malformed opt-in values", () => {
  assert.equal(isIndexingAllowed("TRUE", "production"), false);
  assert.equal(isIndexingAllowed("1", "production"), false);
  assert.equal(isIndexingAllowed(" true ", "production"), false);
  assert.equal(isIndexingAllowed("false", "production"), false);
  assert.equal(isIndexingAllowed(undefined, "production"), false);
});
