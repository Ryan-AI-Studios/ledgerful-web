/**
 * check-security-txt.mjs — RFC 9116 security.txt gate (0097).
 *
 * Fails when the file is missing, required fields are wrong, Contact/Canonical
 * disagree with launch-facts/siteUrl, Encryption is advertised without a key,
 * or Expires is within 30 days (or past). That last rule is intentional: the
 * renewal obligation is a build failure on every PR, not a calendar reminder.
 * When it fails near expiry on an unrelated PR, bump Expires in
 * public/.well-known/security.txt — do not remove this gate from check:truth.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const securityTxtPath = path.join(root, "public", ".well-known", "security.txt");

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

function parseFields(text) {
  /** @type {Map<string, string[]>} */
  const fields = new Map();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const colon = line.indexOf(":");
    assert.ok(colon > 0, `security.txt line missing field name: ${rawLine}`);
    const name = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    const list = fields.get(name) ?? [];
    list.push(value);
    fields.set(name, list);
  }
  return fields;
}

const RFC3339 =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const { launchTruth } = await loadTsModule("src/lib/content/launch-facts.ts");
const { siteUrl } = await loadTsModule("src/lib/content/navigation.ts");

assert.ok(
  existsSync(securityTxtPath),
  "public/.well-known/security.txt is missing",
);

const text = await readFile(securityTxtPath, "utf8");
// UTF-8 BOM would be a different encoding presentation; reject it.
assert.ok(!text.startsWith("\uFEFF"), "security.txt must not start with a UTF-8 BOM");

const fields = parseFields(text);
const contacts = fields.get("Contact") ?? [];
const expiresList = fields.get("Expires") ?? [];
const canonicalList = fields.get("Canonical") ?? [];
const policyList = fields.get("Policy") ?? [];
const encryptionList = fields.get("Encryption") ?? [];

assert.ok(contacts.length >= 1, "security.txt must include at least one Contact field");
assert.equal(
  expiresList.length,
  1,
  `Expires must appear exactly once (found ${expiresList.length})`,
);
assert.equal(
  canonicalList.length,
  1,
  `Canonical must appear exactly once (found ${canonicalList.length})`,
);
assert.ok(policyList.length >= 1, "security.txt must include a Policy field");

const expires = expiresList[0];
assert.match(expires, RFC3339, `Expires must be RFC 3339 date-time, got: ${expires}`);
const expiresDate = new Date(expires);
assert.ok(!Number.isNaN(expiresDate.getTime()), `Expires is not a valid date: ${expires}`);

const now = Date.now();
const daysLeft = (expiresDate.getTime() - now) / (1000 * 60 * 60 * 24);
assert.ok(
  daysLeft > 30,
  `security.txt Expires is in ${Math.floor(daysLeft)} days (threshold 30). Bump Expires in public/.well-known/security.txt (RFC 9116).`,
);

const mailto = contacts.find((c) => c.startsWith("mailto:"));
assert.ok(mailto, "security.txt must include a mailto: Contact");
const email = mailto.replace(/^mailto:/i, "");
assert.equal(
  email,
  launchTruth.facts.disclosure.email,
  "security.txt mailto Contact must match launchTruth.facts.disclosure.email",
);

const expectedCanonical = `${siteUrl}/.well-known/security.txt`;
assert.equal(
  canonicalList[0],
  expectedCanonical,
  `Canonical must equal ${expectedCanonical}`,
);

const expectedPolicy = `${siteUrl}/trust#disclosure`;
assert.ok(
  policyList.includes(expectedPolicy),
  `Policy must include ${expectedPolicy} (found: ${policyList.join(", ")})`,
);

const expectedGithubContact =
  "https://github.com/Ryan-AI-Studios/Ledgerful/security/advisories/new";
assert.ok(
  contacts.includes(expectedGithubContact),
  `Contact must include GitHub private vulnerability reporting URL ${expectedGithubContact}`,
);

const preferredLanguages = fields.get("Preferred-Languages") ?? [];
assert.equal(
  preferredLanguages.length,
  1,
  "Preferred-Languages must appear exactly once",
);
assert.equal(
  preferredLanguages[0],
  "en",
  "Preferred-Languages must be en",
);

if (!launchTruth.facts.disclosure.pgpPublished) {
  assert.equal(
    encryptionList.length,
    0,
    "Encryption field must not appear while launchTruth says no PGP key is published",
  );
}

console.log("check-security-txt: all assertions passed ✓");
