#!/usr/bin/env node
/**
 * generate-og-images.mjs
 * ----------------------------------------------------------------------
 * Standalone Playwright capture script (NOT a Playwright *test*, NOT a
 * runtime `next/og` ImageResponse handler) that renders per-route Open
 * Graph cards as build-time static PNGs.
 *
 * Track: 0021-WebProofAssets (C:\dev\coordinated\conductor\0021-WebProofAssets)
 *
 * Spec DoD-5 (folded from review — corrected): OG images must be
 * build-time static `.png` files, not a runtime `ImageResponse` /
 * `opengraph-image.tsx` edge handler. This site is deliberately
 * static-first; runtime OG would add an edge-function boundary and
 * per-request compute for images that never change between requests.
 * `src/app/opengraph-image.tsx` (the existing generic runtime placeholder)
 * is intentionally left untouched — replacing it is 0026's job (OG
 * wiring/validation), not this track's.
 *
 * This script owns *generation from real proof* only:
 *   - Each card's title/description is copied verbatim from that route's
 *     real `export const metadata` (or, where a route has no page-specific
 *     title of its own, its real on-page <h1>) in `src/app/**\/page.tsx`.
 *   - Each card's CLI line is copied verbatim from that same page's own
 *     real code blocks (see the `ROUTES` table below for the exact
 *     source line cited per route).
 *   - Each card's visual is a real crop of the real, already-captured
 *     local dashboard screenshot at
 *     `public/product/dashboard-risk-summary.avif` (2560x1600, a genuine
 *     Playwright capture — see its `.provenance.json` in
 *     `C:\dev\FrontendDev\output\ledgerful-assets\`).
 *   - Colors are the repo's real dark-theme design tokens, copied from
 *     `src/app/globals.css` `:root` (dark is the default/intentional
 *     theme per DESIGN.md).
 *
 * NOT YET WIRED: these PNGs are not referenced by any route's metadata or
 * `opengraph-image.tsx` yet. Wiring + crop validation at 1200x630 is 0026.
 *
 * Usage (run from ledgerful-web so `@playwright/test` resolves from this
 * repo's own node_modules — unlike `capture-dashboard.mjs`, this script
 * lives inside the repo, so a normal ESM import is sufficient):
 *
 *   cd C:\dev\ledgerful-web
 *   node scripts/generate-og-images.mjs
 *   (or: npm run generate:og)
 *
 * Output: public/og/{home,trust,pricing,install,architecture}.png
 *   Each is exactly 1200x630, deviceScaleFactor 1 (no 2x/3x multiplier —
 *   OG images are consumed at 1x by social platforms, unlike the 2x
 *   product screenshot captures).
 *
 * Provenance (DoD-6): each output PNG gets a companion `.provenance.json`
 * written to `C:\dev\FrontendDev\output\ledgerful-assets\` (NOT the public
 * repo — same convention as capture-dashboard.mjs/optimize-assets.mjs),
 * citing the exact source of every piece of real content on the card: the
 * route/metadata/CLI-command source (from the `ROUTES` table's `sources`
 * field below) and the dashboard-image source (a pointer to that image's
 * own `.provenance.json`, since the dashboard capture's provenance already
 * records how it was captured — this file doesn't duplicate it).
 * ----------------------------------------------------------------------
 */

import { chromium } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const OUTPUT_DIR = path.join(REPO_ROOT, "public", "og");
const DASHBOARD_IMAGE_REL = "product/dashboard-risk-summary.avif";
const DASHBOARD_IMAGE_PATH = path.join(REPO_ROOT, "public", DASHBOARD_IMAGE_REL);

// Same out-of-repo working directory capture-dashboard.mjs and
// optimize-assets.mjs already write their `.provenance.json` companions to
// (see those scripts' headers) — kept consistent so all of this track's
// provenance lives in one place, not committed to the public repo.
const PROVENANCE_DIR = "C:\\dev\\FrontendDev\\output\\ledgerful-assets";
const DASHBOARD_IMAGE_PROVENANCE = "dashboard-risk-summary.avif.provenance.json";

const SIZE = { width: 1200, height: 630 };

function nowIso() {
  return new Date().toISOString();
}

function getEngineVersion() {
  try {
    return execFileSync("ledgerful", ["--version"], { encoding: "utf8" }).trim();
  } catch (err) {
    return `unknown (${err.message})`;
  }
}

// Real dark-theme tokens, copied verbatim from `src/app/globals.css`
// `:root` (dark is the server-rendered, no-JavaScript default per
// DESIGN.md "Theme behavior"). Kept as a flat object here rather than
// re-reading globals.css at runtime so the generated HTML has no build
// dependency on Tailwind/PostCSS processing the OKLCH-to-RGB fallback
// step — Playwright's bundled Chromium renders `oklch()` natively.
const TOKENS = {
  canvas: "oklch(0.15 0.012 220)",
  surfaceRaised: "oklch(0.19 0.016 220)",
  inkPrimary: "oklch(0.95 0.006 210)",
  inkMuted: "oklch(0.76 0.018 210)",
  brand: "oklch(0.72 0.105 205)",
  brandStrong: "oklch(0.82 0.09 205)",
  onBrand: "oklch(0.15 0.025 220)",
  rule: "oklch(0.35 0.018 220)",
  terminalBg: "oklch(0.12 0.012 220)",
  terminalText: "oklch(0.91 0.012 180)",
  terminalBorder: "oklch(0.31 0.015 220)",
};

// Lucide `shield-check` icon paths, copied verbatim from
// node_modules/lucide-react/dist/esm/icons/shield-check.mjs — the same
// icon `SiteHeader` uses for the real brand glyph (src/components/site-header.tsx).
const SHIELD_CHECK_PATHS = [
  "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
  "m9 12 2 2 4-4",
];

/**
 * Per-route real content. Every `title`/`description` is copied verbatim
 * from that route's `export const metadata` in its `page.tsx` (or, for
 * home, the real on-page <h1> — home's page.tsx sets only a metadata
 * `description`, not a page-specific `title`; see the script's final
 * report for that gap). Every `command`/`commandLabel` is copied verbatim
 * from a real code block already shipped on that route (or, where noted,
 * a sibling route's real code block that is more thematically apt).
 */
const ROUTES = [
  {
    slug: "home",
    routePath: "/",
    // src/app/page.tsx <h1> (home sets metadata.description only, not
    // metadata.title — see report). Real, already-shipped copy. Updated for
    // WEB-0022's homepage rebuild, which replaced the old h1 with the
    // adjudicated headline (recommendation.md §4.1).
    title: "Understand code change risk before it ships. Runs locally on your code.",
    // src/lib/content/navigation.ts pageDescriptions.home
    description:
      "Ledgerful runs on your machine to analyze repo changes, record signed provenance, plan verification, and export audit evidence — without uploading source code by default.",
    // src/components/install-command.tsx INSTALL_COMMAND — the homepage's
    // real primary-CTA command (WEB-0022 replaced the old "01 · Scan"
    // workflow block this used to cite with the install-first hero).
    command: "cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful",
    commandLabel: "Install — real source-build command, no signup",
    // Structured mirror of the citation comments above, for provenance
    // (see writeOgProvenance) — kept in sync with the comments by hand.
    sources: {
      title: "src/app/page.tsx <h1> (home sets metadata.description only, not metadata.title)",
      description: "src/lib/content/navigation.ts pageDescriptions.home",
      command: "src/components/install-command.tsx INSTALL_COMMAND",
    },
  },
  {
    slug: "trust",
    routePath: "/trust",
    // src/app/trust/page.tsx metadata.title
    title: "Trust and security — local-first data flow and SOC2 evidence",
    // src/lib/content/navigation.ts pageDescriptions.trust
    description:
      "Local-first data flow, telemetry, sync, SOC2 export, and future hosted boundaries.",
    // src/components/captured-evidence.ts capturedEvidence.verifyHealth —
    // a real captured CLI run (command + its real final output line).
    command: "ledgerful verify --health",
    commandLabel: "All verification dependencies are available.",
    sources: {
      title: "src/app/trust/page.tsx metadata.title",
      description: "src/lib/content/navigation.ts pageDescriptions.trust",
      command:
        "src/components/captured-evidence.ts capturedEvidence.verifyHealth (real captured CLI run: command + real final output line)",
    },
  },
  {
    slug: "pricing",
    routePath: "/pricing",
    // src/app/pricing/page.tsx metadata.title
    title: "Pricing — editions and feature states",
    // src/lib/content/navigation.ts pageDescriptions.pricing
    description:
      "Ledgerful editions with explicit available, beta, local-only, hosted planned, and enterprise planned states.",
    // NOTE: install/page.tsx's own code block lists `ledgerful compliance
    // export` as a CLI command, but that subcommand does not exist in the
    // shipped v0.1.7 CLI (`ledgerful compliance --help` errors with
    // "unrecognized subcommand 'compliance'" — SOC2 export is a dashboard/
    // API-only feature, see `Soc2ExportButton.tsx` +
    // `GET /api/compliance/export`). That's a pre-existing bug in
    // install/page.tsx, out of scope to fix here (0021 doesn't touch that
    // file) — flagged separately in deferred.md. Using a real, verified CLI
    // command instead so this NEW asset doesn't repeat the error: output
    // captured directly from `ledgerful verify --signatures` against the
    // sample repo (see C:\dev\FrontendDev\output\ledgerful-assets\).
    command: "ledgerful verify --signatures",
    commandLabel: "All signature validations passed successfully!",
    sources: {
      title: "src/app/pricing/page.tsx metadata.title",
      description: "src/lib/content/navigation.ts pageDescriptions.pricing",
      command:
        "ledgerful verify --signatures output captured against the sample repo (see C:\\dev\\FrontendDev\\output\\ledgerful-assets\\) — NOT install/page.tsx's `ledgerful compliance export` (that subcommand doesn't exist in v0.1.7; pre-existing bug in install/page.tsx, tracked in deferred.md, out of scope here)",
    },
  },
  {
    slug: "install",
    routePath: "/install",
    // src/app/install/page.tsx metadata.title
    title: "Install the Ledgerful CLI",
    // src/lib/content/navigation.ts pageDescriptions.install
    description:
      "Install the Ledgerful CLI from source, verify the binary, and run your first scan. Pre-built release binaries are a launch fact and are not yet available.",
    // src/app/install/page.tsx "02 · Install" CodeBlock, verbatim.
    command: "cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful",
    commandLabel: "Source build · ~3–6 min on first run",
    sources: {
      title: "src/app/install/page.tsx metadata.title",
      description: "src/lib/content/navigation.ts pageDescriptions.install",
      command: 'src/app/install/page.tsx "02 · Install" CodeBlock, verbatim',
    },
  },
  {
    slug: "architecture",
    routePath: "/architecture",
    // src/app/architecture/page.tsx metadata.title
    title: "Architecture — local engine, dashboard, and web surfaces",
    // src/lib/content/navigation.ts pageDescriptions.architecture
    description:
      "The three Ledgerful surfaces — local engine and CLI, embedded loopback dashboard, public web — and the planned hosted control plane. Local-first data flow, opt-in telemetry.",
    // src/app/architecture/page.tsx:47 (the "Dashboard" surface card's
    // `meta` field), verbatim. NOT install/page.tsx's "First commands"
    // block — that block's own command text does not include this string.
    command: "ledgerful web start",
    commandLabel: "Binds 127.0.0.1:52001 · ephemeral ?token= auth",
    sources: {
      title: "src/app/architecture/page.tsx metadata.title",
      description: "src/lib/content/navigation.ts pageDescriptions.architecture",
      command:
        'src/app/architecture/page.tsx:47 (the "Dashboard" surface card\'s `meta` field), verbatim',
    },
  },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function titleFontSize(title) {
  if (title.length > 50) return 40;
  if (title.length > 35) return 46;
  return 56;
}

function buildHtml({ title, routePath, description, command, commandLabel, dashboardDataUri }) {
  const fontSize = titleFontSize(title);
  const shieldPaths = SHIELD_CHECK_PATHS.map((d) => `<path d="${d}" />`).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    width: ${SIZE.width}px;
    height: ${SIZE.height}px;
    overflow: hidden;
    background: ${TOKENS.canvas};
    color: ${TOKENS.inkPrimary};
    font-family: -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }
  .card {
    display: flex;
    width: ${SIZE.width}px;
    height: ${SIZE.height}px;
  }
  .copy {
    display: flex;
    flex-direction: column;
    width: 620px;
    padding: 56px;
    min-width: 0;
  }
  .brand-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 760;
    font-size: 21px;
    color: ${TOKENS.inkPrimary};
  }
  .brand-glyph {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: ${TOKENS.brand};
    color: ${TOKENS.onBrand};
    flex-shrink: 0;
  }
  .kicker {
    width: fit-content;
    margin-top: 26px;
    border: 1px solid ${TOKENS.rule};
    border-radius: 999px;
    padding: 6px 12px;
    color: ${TOKENS.brandStrong};
    font-family: "Consolas", "SFMono-Regular", Menlo, monospace;
    font-size: 14px;
    font-weight: 600;
  }
  h1 {
    margin: 20px 0 0;
    max-width: 560px;
    font-size: ${fontSize}px;
    line-height: 1.06;
    letter-spacing: -0.03em;
    font-weight: 780;
    color: ${TOKENS.inkPrimary};
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
  p.description {
    margin: 16px 0 0;
    max-width: 560px;
    color: ${TOKENS.inkMuted};
    font-size: 20px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
  .spacer { flex: 1; }
  .cli-chip {
    width: fit-content;
    max-width: 560px;
    border: 1px solid ${TOKENS.terminalBorder};
    border-radius: 8px;
    background: ${TOKENS.terminalBg};
    padding: 12px 16px;
  }
  .cli-chip .cli-line {
    color: ${TOKENS.terminalText};
    font-family: "Consolas", "SFMono-Regular", Menlo, monospace;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cli-chip .cli-line .prompt { color: ${TOKENS.brandStrong}; margin-right: 8px; }
  .cli-chip .cli-label {
    margin-top: 6px;
    color: ${TOKENS.inkMuted};
    font-family: "Consolas", "SFMono-Regular", Menlo, monospace;
    font-size: 12px;
  }
  .evidence {
    display: flex;
    flex-direction: column;
    width: 580px;
    height: ${SIZE.height}px;
    border-left: 1px solid ${TOKENS.rule};
    background: ${TOKENS.surfaceRaised};
  }
  .evidence-media {
    flex: 1;
    min-height: 0;
    background-image: url("${dashboardDataUri}");
    background-size: cover;
    /* Horizontal offset tuned to crop past the dashboard's left sidebar
       nav (avoids showing chopped/truncated sidebar label text) and land
       on the real "Project Health" + "Recent Changes" content panels.
       Vertical offset is inert here: cover's binding dimension is height
       (box height ~= scaled image height), so there is ~no vertical
       overflow to position within. */
    background-position: 26% top;
    background-repeat: no-repeat;
  }
  .evidence-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-top: 1px solid ${TOKENS.rule};
    font-family: "Consolas", "SFMono-Regular", Menlo, monospace;
    font-size: 13px;
  }
  .evidence-meta .evidence-caption { color: ${TOKENS.inkMuted}; }
  .evidence-meta .evidence-url { color: ${TOKENS.inkPrimary}; font-weight: 620; }
</style>
</head>
<body>
  <div class="card">
    <div class="copy">
      <div class="brand-row">
        <span class="brand-glyph">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${shieldPaths}</svg>
        </span>
        <span>Ledgerful</span>
      </div>
      <div class="kicker">ledgerful.dev${routePath === "/" ? "" : escapeHtml(routePath)}</div>
      <h1>${escapeHtml(title)}</h1>
      <p class="description">${escapeHtml(description)}</p>
      <div class="spacer"></div>
      <div class="cli-chip">
        <div class="cli-line"><span class="prompt">$</span>${escapeHtml(command)}</div>
        <div class="cli-label">${escapeHtml(commandLabel)}</div>
      </div>
    </div>
    <div class="evidence">
      <div class="evidence-media"></div>
      <div class="evidence-meta">
        <span class="evidence-caption">Real local dashboard receipt</span>
        <span class="evidence-url">127.0.0.1:52001/dashboard</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Emit a `.provenance.json` companion for one generated OG PNG (DoD-6),
 * written outside the public repo alongside this track's other provenance
 * files. Shape mirrors capture-dashboard.mjs's writeProvenance(): what
 * generated it, when, from what real sources, at what final size — enough
 * to reproduce the card without hand-written notes.
 */
async function writeOgProvenance({ route, outputPath, engineVersion }) {
  const provenance = {
    asset: path.basename(outputPath),
    kind: "og-image",
    generatedAtIso: nowIso(),
    generatedBy: "generate-og-images.mjs",
    route: route.routePath,
    size: SIZE,
    deviceScaleFactor: 1,
    colorScheme: "dark",
    reducedMotion: "reduce",
    // Real-content citations for every field rendered on the card — see the
    // `sources` field on this route's ROUTES entry and the file header
    // comment for the general sourcing rules (title/description from
    // metadata or a real on-page element, command/commandLabel from a real
    // shipped code block or captured CLI run).
    content: {
      title: { value: route.title, source: route.sources.title },
      description: { value: route.description, source: route.sources.description },
      command: { value: route.command, source: route.sources.command },
      commandLabel: { value: route.commandLabel, source: route.sources.command },
    },
    // The card's visual evidence panel is a CSS background-crop of this
    // real dashboard capture. Point at its own provenance file (already
    // recorded by optimize-assets.mjs) instead of duplicating its contents.
    dashboardImage: {
      path: `public/${DASHBOARD_IMAGE_REL}`,
      provenanceFile: DASHBOARD_IMAGE_PROVENANCE,
      provenanceDir: PROVENANCE_DIR,
    },
    designTokenSource: "src/app/globals.css :root (dark theme, verbatim — see TOKENS constant in this script)",
    ledgerfulEngineVersion: engineVersion,
  };

  const provPath = path.join(PROVENANCE_DIR, `${path.basename(outputPath)}.provenance.json`);
  await writeFile(provPath, JSON.stringify(provenance, null, 2) + "\n", "utf8");
  return provPath;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(PROVENANCE_DIR, { recursive: true });

  const engineVersion = getEngineVersion();
  const dashboardBuffer = await readFile(DASHBOARD_IMAGE_PATH);
  const dashboardDataUri = `data:image/avif;base64,${dashboardBuffer.toString("base64")}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: SIZE,
    deviceScaleFactor: 1, // OG images are consumed at 1x by social platforms.
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  try {
    for (const route of ROUTES) {
      const html = buildHtml({ ...route, dashboardDataUri });
      await page.setContent(html, { waitUntil: "load" });
      // Best-effort wait for any web font to finish loading; capped so an
      // offline run still completes deterministically with the system
      // font-stack fallback baked into the template above.
      await page
        .evaluate(() =>
          Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 1500))]),
        )
        .catch(() => {});

      const outputPath = path.join(OUTPUT_DIR, `${route.slug}.png`);
      await page.screenshot({ path: outputPath, type: "png" });
      console.log(`[generate-og-images] saved ${outputPath}`);

      const provPath = await writeOgProvenance({ route, outputPath, engineVersion });
      console.log(`[generate-og-images] saved ${provPath}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\n[generate-og-images] done. Generated ${ROUTES.length} OG image(s) in ${OUTPUT_DIR}`);
  console.log(`[generate-og-images] provenance written to ${PROVENANCE_DIR}`);
}

main().catch((err) => {
  console.error("[generate-og-images] FAILED:", err);
  process.exit(1);
});
