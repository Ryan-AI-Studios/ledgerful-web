#!/usr/bin/env node
/**
 * check-verifier-xss.mjs — structural guard for track 0075 (RT-X0).
 *
 * Asserts the live public-ledger offline verifier does not reintroduce
 * innerHTML sinks fed by entry free-text or status hashes.
 *
 * Wired into `npm run check:truth`. Exits 1 on any violation.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const verifierJs = join(root, "public", "ledger", "verifier.js");
const verifierHtml = join(root, "public", "ledger", "verifier.html");

const failures = [];

function fail(msg) {
  failures.push(msg);
}

if (!existsSync(verifierJs)) {
  fail(`Missing ${verifierJs}`);
} else {
  const src = readFileSync(verifierJs, "utf8");

  if (!src.includes("function appendCell(tr, v)")) {
    fail("verifier.js must define appendCell helper");
  }
  if (!src.includes("function appendStatusCell(tr, label, cls)")) {
    fail("verifier.js must define appendStatusCell helper");
  }
  // Require appendCell body to assign via textContent (not a hollow helper).
  const appendCellMatch = src.match(
    /function appendCell\(tr,\s*v\)\s*\{([\s\S]*?)\n  \}/,
  );
  if (!appendCellMatch) {
    fail("could not parse appendCell function body");
  } else {
    const body = appendCellMatch[1];
    if (!body.includes("td.textContent")) {
      fail("appendCell body must assign via td.textContent");
    }
    if (/\btd\.innerHTML\s*=/.test(body) || /\binnerHTML\s*=/.test(body)) {
      fail("appendCell body must not use innerHTML");
    }
  }
  if (!src.includes("td.textContent")) {
    fail("verifier.js must assign cell text via textContent");
  }
  if (!src.includes("appendCell(tr, entry.tx_id)")) {
    fail("tx_id must be rendered via appendCell");
  }
  if (!src.includes("appendCell(tr, entry.category)")) {
    fail("category must be rendered via appendCell");
  }
  if (
    !src.includes("appendCell(tr, entry.summary || \"\")") &&
    !src.includes("appendCell(tr, entry.summary || '')")
  ) {
    fail("summary must be rendered via appendCell");
  }
  if (!src.includes("VERIFY-ON-RAW")) {
    fail("verifier.js must pin VERIFY-ON-RAW comment so basis stays on raw fields");
  }

  if (/\btr\.innerHTML\s*=/.test(src)) {
    fail("tr.innerHTML must not appear in verifier.js");
  }

  const entryFields = ["entry.summary", "entry.tx_id", "entry.category", "entry.reason"];
  for (const field of entryFields) {
    const needles = [
      new RegExp(`innerHTML\\s*=\\s*['"\`].*${field.replace(".", "\\.")}`),
      new RegExp(`innerHTML\\s*[+]=\\s*.*${field.replace(".", "\\.")}`),
      new RegExp(`innerHTML\\s*=\\s*[^;]*\\+\\s*${field.replace(".", "\\.")}`),
      new RegExp(`${field.replace(".", "\\.")}[^;\\n]*innerHTML`),
    ];
    for (const re of needles) {
      if (re.test(src)) {
        fail(`must not concatenate ${field} into innerHTML`);
      }
    }
  }

  const lines = src.split("\n");
  for (const line of lines) {
    if (line.includes("innerHTML") && line.includes("actualEntriesHash")) {
      fail("actualEntriesHash must not be interpolated into an innerHTML assignment");
    }
    if (line.includes("innerHTML") && line.includes("expectedEntriesHash")) {
      fail(
        "expectedEntriesHash must not be interpolated into an innerHTML assignment",
      );
    }
  }

  // Status labels must use text nodes / appendStatusLabel, not status-line innerHTML.
  if (/manifestStatus\.innerHTML\s*=/.test(src)) {
    fail("manifestStatus must not use innerHTML");
  }
  if (/entriesStatus\.innerHTML\s*=/.test(src)) {
    fail("entriesStatus must not use innerHTML");
  }
}

if (!existsSync(verifierHtml)) {
  fail(`Missing ${verifierHtml}`);
} else {
  const html = readFileSync(verifierHtml, "utf8");
  if (!html.includes('src="verifier.js"') && !html.includes("src='verifier.js'")) {
    fail("verifier.html must load external verifier.js (CSP-safe)");
  }
  // No inline entry-rendering script with the classic sink.
  if (/tr\.innerHTML\s*=/.test(html)) {
    fail("verifier.html must not contain tr.innerHTML row sinks");
  }
}

// Generator must not reintroduce the pre-0075 inline row sink.
const generateSample = join(root, "scripts", "generate-public-ledger-sample.mjs");
if (existsSync(generateSample)) {
  const gen = readFileSync(generateSample, "utf8");
  if (/tr\.innerHTML\s*=/.test(gen)) {
    fail(
      "generate-public-ledger-sample.mjs must not contain tr.innerHTML (would overwrite production verifier)",
    );
  }
  if (!gen.includes("cspVerifierShell") && !gen.includes('src="verifier.js"')) {
    fail(
      "generate-public-ledger-sample.mjs must emit the CSP dual-file verifier shell",
    );
  }
}

// Publish helper must preserve dual-file verifier (not copy engine inline HTML).
const publishScript = join(root, "scripts", "publish-public-ledger.mjs");
if (existsSync(publishScript)) {
  const pub = readFileSync(publishScript, "utf8");
  if (
    /bundleFiles\s*=\s*\[[^\]]*["']verifier\.html["']/.test(pub) ||
    /["']verifier\.html["']\s*,/.test(pub) &&
      pub.includes("copyFileSync") &&
      /bundleFiles[\s\S]*verifier\.html/.test(pub)
  ) {
    // Narrow: fail if verifier.html is still listed in the publish copy list.
    const listMatch = pub.match(/const bundleFiles\s*=\s*\[([\s\S]*?)\];/);
    if (listMatch && listMatch[1].includes("verifier.html")) {
      fail(
        "publish-public-ledger.mjs must not copy engine verifier.html over the CSP dual-file pair",
      );
    }
  }
  if (!pub.includes("verifier.js") || !pub.includes("dual-file")) {
    fail(
      "publish-public-ledger.mjs must document/enforce the CSP dual-file verifier pair",
    );
  }
}

if (failures.length > 0) {
  console.error("check-verifier-xss FAILED:");
  for (const f of failures) console.error("  -", f);
  process.exit(1);
}

console.log("check-verifier-xss: OK (DOM-safe verifier patterns present)");
