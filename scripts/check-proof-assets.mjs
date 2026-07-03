// check-proof-assets.mjs
//
// Static, no-server truth check for the 0021-WebProofAssets proof assets:
// dashboard captures (public/product/), per-route OG images (public/og/),
// hero-proof.tsx's <Image> contract, and the SOC2 sample export.
//
// Why a static script and not a Playwright test: hero-proof.tsx and
// artifact-preview.tsx are not yet wired into any route (that's 0022+), so
// there is no page to navigate to and assert rendered DOM against. Everything
// checkable right now is checkable by reading files on disk — real pixel
// dimensions via sharp, and the component source as text — so that's what
// this script does. Once 0022+ wires these into a page, browser-level tests
// (rendered <img> attributes, CLS, mobile legibility) belong in Playwright
// and can supplement, not replace, this script.
//
// Exit code: 0 only if every HARD check below passes. Soft warnings (see
// section 7) are reported but do not fail the run.

import sharp from "sharp";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const hardErrors = [];
const warnings = [];
const notes = [];

function fail(msg) {
  hardErrors.push(msg);
  console.error(`  [FAIL] ${msg}`);
}
function pass(msg) {
  console.log(`  [OK]   ${msg}`);
}
function warn(msg) {
  warnings.push(msg);
  console.warn(`  [WARN] ${msg}`);
}
function note(msg) {
  notes.push(msg);
  console.log(`  [NOTE] ${msg}`);
}

async function dims(filePath) {
  const meta = await sharp(filePath).metadata();
  return { width: meta.width, height: meta.height };
}

// ---------------------------------------------------------------------------
// 1. Image dimensions: public/product/* and public/og/*
// ---------------------------------------------------------------------------
console.log("\n== 1. Image dimensions ==");

const heroProofPath = path.join(root, "src/components/hero-proof.tsx");
const heroProofSrc = await readFile(heroProofPath, "utf8");
const imageTagMatch = heroProofSrc.match(/<Image\b[\s\S]*?\/>/);

if (!imageTagMatch) {
  fail(`No <Image> element found in ${heroProofPath}`);
}

let heroSrcRel = null;
let heroPropWidth = null;
let heroPropHeight = null;

if (imageTagMatch) {
  const tag = imageTagMatch[0];
  const srcMatch = tag.match(/\bsrc="([^"]+)"/);
  const widthMatch = tag.match(/\bwidth=\{(\d+)\}/);
  const heightMatch = tag.match(/\bheight=\{(\d+)\}/);

  if (!srcMatch || !widthMatch || !heightMatch) {
    fail(
      "hero-proof.tsx <Image> is missing src/width/height props needed to cross-check against the real asset dimensions",
    );
  } else {
    heroSrcRel = srcMatch[1];
    heroPropWidth = Number(widthMatch[1]);
    heroPropHeight = Number(heightMatch[1]);

    const avifPath = path.join(root, "public", heroSrcRel.replace(/^\//, ""));
    const webpPath = avifPath.replace(/\.avif$/, ".webp");

    for (const p of [avifPath, webpPath]) {
      if (!existsSync(p)) {
        fail(`hero-proof.tsx references ${path.relative(root, p)} but the file does not exist`);
        continue;
      }
      const { width, height } = await dims(p);
      if (width === heroPropWidth && height === heroPropHeight) {
        pass(
          `${path.basename(p)} is ${width}x${height}, matches hero-proof.tsx <Image> props (width={${heroPropWidth}} height={${heroPropHeight}})`,
        );
      } else {
        fail(
          `${path.basename(p)} is ${width}x${height}, but hero-proof.tsx declares width={${heroPropWidth}} height={${heroPropHeight}} — the component props and the real asset have drifted apart`,
        );
      }
    }
  }
}

// The -detail crop is not referenced by any component yet (out of scope for
// this track), so its expected dimensions are hardcoded from the capture
// pipeline's known crop (see optimize-assets.mjs / *.provenance.json) rather
// than cross-checked against a prop.
const DETAIL_EXPECTED = { width: 1400, height: 416 };
for (const ext of ["avif", "webp"]) {
  const p = path.join(root, "public/product", `dashboard-risk-summary-detail.${ext}`);
  if (!existsSync(p)) {
    fail(`Missing expected asset: ${path.relative(root, p)}`);
    continue;
  }
  const { width, height } = await dims(p);
  if (width === DETAIL_EXPECTED.width && height === DETAIL_EXPECTED.height) {
    pass(`${path.basename(p)} is ${width}x${height}`);
  } else {
    fail(
      `${path.basename(p)} is ${width}x${height}, expected ${DETAIL_EXPECTED.width}x${DETAIL_EXPECTED.height}`,
    );
  }
}

// Flag any file in public/product/ that isn't one of the four known assets —
// informational only, since a future track may add more, but worth a note so
// a stray/unoptimized file doesn't go unnoticed.
const KNOWN_PRODUCT_FILES = new Set([
  "dashboard-risk-summary.avif",
  "dashboard-risk-summary.webp",
  "dashboard-risk-summary-detail.avif",
  "dashboard-risk-summary-detail.webp",
]);
const productDir = path.join(root, "public/product");
if (existsSync(productDir)) {
  const productFiles = await readdir(productDir);
  for (const f of productFiles) {
    if (!KNOWN_PRODUCT_FILES.has(f)) {
      note(`public/product/${f} is not one of the four known dashboard-capture assets — not dimension-checked by this script`);
    }
  }
} else {
  fail(`Missing directory: ${path.relative(root, productDir)}`);
}

// Every file in public/og/ must be exactly 1200x630, regardless of name.
const ogDir = path.join(root, "public/og");
if (existsSync(ogDir)) {
  const ogFiles = (await readdir(ogDir)).filter((f) => f.toLowerCase().endsWith(".png"));
  if (ogFiles.length === 0) {
    fail(`No .png files found in ${path.relative(root, ogDir)}`);
  }
  for (const f of ogFiles) {
    const p = path.join(ogDir, f);
    const { width, height } = await dims(p);
    if (width === 1200 && height === 630) {
      pass(`og/${f} is 1200x630`);
    } else {
      fail(`og/${f} is ${width}x${height}, expected exactly 1200x630`);
    }
  }
} else {
  fail(`Missing directory: ${path.relative(root, ogDir)}`);
}

// ---------------------------------------------------------------------------
// 2. Alt text on hero-proof.tsx's <Image>
// ---------------------------------------------------------------------------
console.log("\n== 2. Alt text ==");

if (imageTagMatch) {
  const altMatch = imageTagMatch[0].match(/\balt="([^"]*)"/);
  if (!altMatch) {
    fail("hero-proof.tsx <Image> has no alt attribute");
  } else {
    const alt = altMatch[1].trim();
    const placeholderPatterns = [
      /^image$/i,
      /^screenshot$/i,
      /^photo$/i,
      /^picture$/i,
      /^dashboard$/i,
      /^dashboard screenshot$/i,
      /^placeholder$/i,
    ];
    if (alt.length <= 15) {
      fail(`hero-proof.tsx alt text is too short (${alt.length} chars) to be meaningfully descriptive: "${alt}"`);
    } else if (placeholderPatterns.some((re) => re.test(alt))) {
      fail(`hero-proof.tsx alt text looks like a generic placeholder: "${alt}"`);
    } else {
      pass(`hero-proof.tsx alt text is descriptive (${alt.length} chars): "${alt}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Responsive `sizes` prop
// ---------------------------------------------------------------------------
console.log("\n== 3. Responsive `sizes` prop ==");

if (imageTagMatch) {
  if (/\bsizes="[^"]+"/.test(imageTagMatch[0])) {
    pass("hero-proof.tsx <Image> declares a `sizes` prop");
  } else {
    fail(
      "hero-proof.tsx <Image> is missing the `sizes` prop — without it, next/image falls back to a wide default that can serve an oversized source on narrow viewports",
    );
  }
}

// ---------------------------------------------------------------------------
// 4. Loading-priority ownership (informational, does not hard-fail either way)
// ---------------------------------------------------------------------------
console.log("\n== 4. Loading-priority ownership (informational) ==");

if (imageTagMatch) {
  const tag = imageTagMatch[0];
  const hasPriority = /\bpriority\b/.test(tag);
  const hasLoading = /\bloading=/.test(tag);
  if (hasPriority || hasLoading) {
    note(
      `hero-proof.tsx <Image> sets ${hasPriority ? "`priority`" : ""}${hasPriority && hasLoading ? " and " : ""}${hasLoading ? "`loading`" : ""}. This component doesn't know where it will land on a page yet (not wired into a route until 0022+); double-check the wiring page makes a deliberate choice rather than inheriting this.`,
    );
  } else {
    note(
      "hero-proof.tsx <Image> does not hardcode `priority` or `loading` — treated as correct: deciding LCP/above-the-fold priority is a page-composition concern, not this component's, since it isn't wired into a route yet (0022+ decides where it lands and should set `priority` explicitly if/when it's above the fold there).",
    );
  }
}

// ---------------------------------------------------------------------------
// 5. SOC2 sample cryptographic verification (the most important regression
//    guard in this script — a future edit under sample-soc2/ that breaks the
//    signature must fail loudly, not silently).
// ---------------------------------------------------------------------------
console.log("\n== 5. SOC2 sample cryptographic verification ==");

const soc2Dir = path.join(root, "public/evidence/sample-soc2");
const soc2Zip = path.join(soc2Dir, "ledgerful-soc2-evidence-sample.zip");
const soc2Verifier = path.join(soc2Dir, "verify-soc2-sample.mjs");

if (!existsSync(soc2Zip) || !existsSync(soc2Verifier)) {
  fail(`Missing SOC2 sample zip and/or verifier script under ${path.relative(root, soc2Dir)}`);
} else {
  const result = spawnSync(process.execPath, [soc2Verifier, soc2Zip], { encoding: "utf8" });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const printedValid = /^VALID:/m.test(output);
  const printedInvalid = /^INVALID:/m.test(output);

  if (result.status === 0 && printedValid && !printedInvalid) {
    pass("ledgerful-soc2-evidence-sample.zip verified VALID (file hashes + Ed25519 manifest.sig) via verify-soc2-sample.mjs");
  } else {
    fail(
      `ledgerful-soc2-evidence-sample.zip FAILED cryptographic verification (verifier exit code ${result.status}). This is a regression — a change under sample-soc2/ broke the signature or hashes. Verifier output:\n${output}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 6. SOC2 sample honesty disclaimer in index.md
// ---------------------------------------------------------------------------
console.log("\n== 6. SOC2 sample honesty disclaimer ==");

const indexMdPath = path.join(soc2Dir, "index.md");
if (!existsSync(indexMdPath)) {
  fail(`Missing ${path.relative(root, indexMdPath)}`);
} else {
  const indexMd = await readFile(indexMdPath, "utf8");
  if (/not a certified SOC\s*2/i.test(indexMd)) {
    pass("sample-soc2/index.md contains the 'not a certified SOC 2' honesty disclaimer");
  } else {
    fail(
      "sample-soc2/index.md no longer contains 'not a certified SOC 2' (or equivalent) — the honesty disclaimer language appears to have been loosened or removed",
    );
  }
}

// ---------------------------------------------------------------------------
// 6b. Truth-gate coverage for sample-soc2/index.md (this repo's existing
// check-docs-truth.mjs only inspects rendered route HTML, e.g. /docs/
// compliance — it never scans static public/**/*.md, so a false claim here
// would otherwise ship undetected). Cross-model review (opencode/glm-5.2)
// found this gate was missing after a false `ledgerful compliance export`
// CLI claim (that subcommand does not exist; SOC2 export is dashboard/API-
// only) slipped into an earlier draft of index.md. Guard against regression.
// ---------------------------------------------------------------------------
console.log("\n== 6b. sample-soc2/index.md truth-gate coverage ==");

if (existsSync(indexMdPath)) {
  const indexMd = await readFile(indexMdPath, "utf8");
  if (/ledgerful compliance export/i.test(indexMd)) {
    fail(
      "sample-soc2/index.md contains 'ledgerful compliance export' — this CLI subcommand does not exist (verified against the shipped ledgerful binary; SOC2 export is a dashboard/API-only feature via GET /api/compliance/export). Same false claim check-docs-truth.mjs Assert 12 enforces for /docs/compliance.",
    );
  } else {
    pass("sample-soc2/index.md does not claim a nonexistent 'ledgerful compliance export' CLI command");
  }

  if (/out-of-band/i.test(indexMd) && /manifest\.pub/i.test(indexMd)) {
    pass("sample-soc2/index.md includes an out-of-band manifest.pub trust-model warning");
  } else {
    fail(
      "sample-soc2/index.md is missing the out-of-band manifest.pub trust-model warning (the in-zip verifying key cannot self-authenticate — see /docs/compliance for the equivalent warning on a real export). Without it, the page overstates what the offline hash/signature check alone proves.",
    );
  }
}

// ---------------------------------------------------------------------------
// 7. Provenance redaction sanity check for public/product/* assets.
//
// The capture script (capture-dashboard.mjs) already refuses to save a
// screenshot if its own DOM leak-scan finds an un-redactable leak — that is
// the correct place for that check, before rasterizing, and is not
// duplicated here. This check instead confirms the provenance mechanism
// actually ran and actually recorded a `redactions` field for every shipped
// asset — a cheap sanity check, not a re-implementation of the leak scan.
//
// These files live outside the ledgerful-web repo
// (C:\dev\FrontendDev\output\ledgerful-assets\) and are not committed, so if
// that directory is absent (e.g. in CI, or a fresh clone), this section is a
// soft warning only. Every other section above checks files that ARE
// committed to this repo and therefore hard-fails.
// ---------------------------------------------------------------------------
console.log("\n== 7. Provenance redaction sanity check (soft outside this repo) ==");

const provenanceDir = "C:\\dev\\FrontendDev\\output\\ledgerful-assets";

if (!existsSync(provenanceDir)) {
  warn(
    `Provenance directory not found at ${provenanceDir} — it lives outside the ledgerful-web repo and won't exist in every environment (e.g. CI, a fresh clone). Skipping the redaction sanity check as a soft warning, not a hard failure.`,
  );
} else if (existsSync(productDir)) {
  const shippedAssets = (await readdir(productDir)).filter((f) => KNOWN_PRODUCT_FILES.has(f));
  for (const asset of shippedAssets) {
    const provPath = path.join(provenanceDir, `${asset}.provenance.json`);
    if (!existsSync(provPath)) {
      fail(`No provenance file found for shipped asset public/product/${asset} (expected ${provPath})`);
      continue;
    }

    let prov;
    try {
      prov = JSON.parse(await readFile(provPath, "utf8"));
    } catch (err) {
      fail(`${asset}: could not parse ${provPath} as JSON — ${err.message}`);
      continue;
    }

    // Optimized-derivative provenance files (this repo's shipped assets) point
    // back at the raw-capture provenance file that actually recorded
    // `redactions` (the leak-scan runs against the raw DOM capture, before
    // rasterizing/cropping/re-encoding). Check directly first, then follow
    // sourceRawProvenance if the field isn't on this file itself.
    let redactions = prov.redactions;
    let checkedPath = provPath;
    if (!redactions && prov.sourceRawProvenance) {
      const rawProvPath = path.join(provenanceDir, prov.sourceRawProvenance);
      if (existsSync(rawProvPath)) {
        try {
          const rawProv = JSON.parse(await readFile(rawProvPath, "utf8"));
          redactions = rawProv.redactions;
          checkedPath = rawProvPath;
        } catch (err) {
          fail(`${asset}: could not parse ${rawProvPath} as JSON — ${err.message}`);
          continue;
        }
      }
    }

    const populated = Array.isArray(redactions) && redactions.length > 0;
    if (populated) {
      pass(`${asset}: \`redactions\` populated in ${path.basename(checkedPath)} — ${JSON.stringify(redactions)}`);
    } else {
      fail(
        `${asset}: no populated \`redactions\` field found (checked ${path.basename(provPath)}${prov.sourceRawProvenance ? ` -> ${prov.sourceRawProvenance}` : ""}) — the provenance/leak-scan mechanism may not have run for this asset`,
      );
    }
  }

  // Every shipped public/og/*.png needs a `.provenance.json` companion too
  // (generate-og-images.mjs's writeOgProvenance()) — DoD-6 applies to every
  // generated asset, not just the DOM captures under public/product/. OG
  // cards aren't DOM captures, so there's no `redactions` field to check
  // here (nothing is redacted — every field is copied verbatim from a real
  // source at generation time); instead this confirms the provenance file
  // exists, parses, and actually cites a source for each rendered field.
  if (existsSync(ogDir)) {
    const shippedOgAssets = (await readdir(ogDir)).filter((f) => f.toLowerCase().endsWith(".png"));
    for (const asset of shippedOgAssets) {
      const provPath = path.join(provenanceDir, `${asset}.provenance.json`);
      if (!existsSync(provPath)) {
        fail(`No provenance file found for shipped asset public/og/${asset} (expected ${provPath})`);
        continue;
      }

      let prov;
      try {
        prov = JSON.parse(await readFile(provPath, "utf8"));
      } catch (err) {
        fail(`${asset}: could not parse ${provPath} as JSON — ${err.message}`);
        continue;
      }

      const requiredContentFields = ["title", "description", "command", "commandLabel"];
      const missingCitations = requiredContentFields.filter(
        (field) => !prov.content?.[field]?.source,
      );
      if (missingCitations.length > 0) {
        fail(
          `${asset}: provenance is missing a \`source\` citation for content field(s): ${missingCitations.join(", ")}`,
        );
      } else if (!prov.dashboardImage?.provenanceFile) {
        fail(`${asset}: provenance is missing \`dashboardImage.provenanceFile\` (the evidence-panel source citation)`);
      } else {
        pass(`${asset}: provenance present with source citations for all content fields + dashboard image`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log("\n===================================================");
if (hardErrors.length > 0) {
  console.error(`FAILED: ${hardErrors.length} hard error(s), ${warnings.length} warning(s), ${notes.length} note(s).`);
  process.exit(1);
} else {
  console.log(`PASSED: 0 hard errors, ${warnings.length} warning(s), ${notes.length} note(s).`);
  process.exit(0);
}
