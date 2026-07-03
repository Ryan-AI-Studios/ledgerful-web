/**
 * check-docs-truth.mjs — WEB-0004 automated truth assertions.
 *
 * Reads static HTML from .next/server/app/docs/ after a production build.
 * Exits 1 if any assertion fails. Run via: npm run check:docs
 */

import { readFileSync } from "fs";
import { join } from "path";

// ── HTML loader ────────────────────────────────────────────────────────────────
// Next.js App Router emits static pages at one of two paths depending on the
// route shape. Try both before failing.

function readHtml(slug) {
  const base = join(process.cwd(), ".next/server/app");
  const candidates =
    slug === "index"
      ? [join(base, "docs.html"), join(base, "docs", "index.html")]
      : [
          join(base, "docs", `${slug}.html`),
          join(base, "docs", slug, "index.html"),
        ];

  for (const p of candidates) {
    try {
      return readFileSync(p, "utf8");
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    `Could not read HTML for docs/${slug}. Tried:\n  ${candidates.join("\n  ")}\nRun npm run build first.`
  );
}

// ── Load all 8 docs pages ──────────────────────────────────────────────────────

const pages = {};
const slugs = ["index", "cli", "dashboard", "mcp", "github-action", "compliance", "sync", "releases"];

for (const slug of slugs) {
  try {
    pages[slug] = readHtml(slug);
  } catch (err) {
    console.error(`FAIL: ${err.message}`);
    process.exit(1);
  }
}

// ── Load /install (top-level route, not nested under /docs) ───────────────────
// WEB-0023: the fake "ledgerful compliance export" CLI command lived on
// /install, not under /docs — check-docs-truth never looked at it, which is
// exactly how the bug survived Assert 12 (docs/compliance only). Assert 16
// below closes that gap.

function readTopLevelHtml(slug) {
  const base = join(process.cwd(), ".next/server/app");
  const candidates = [join(base, `${slug}.html`), join(base, slug, "index.html")];
  for (const p of candidates) {
    try {
      return readFileSync(p, "utf8");
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    `Could not read HTML for ${slug}. Tried:\n  ${candidates.join("\n  ")}\nRun npm run build first.`
  );
}

let installHtml;
try {
  installHtml = readTopLevelHtml("install");
} catch (err) {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
}

const failures = [];

// ── Assert 1: Every doc page must have a noindex robots meta ─────────────────
// The global layout.tsx sets robots: { index: false, follow: false } which
// Next.js renders as <meta name="robots" content="noindex,nofollow,..."/>.

const noindexPattern = /<meta[^>]+name=["']robots["'][^>]*noindex/i;
const noindexPattern2 = /<meta[^>]*noindex[^>]*name=["']robots["']/i;

for (const slug of slugs) {
  const html = pages[slug];
  if (!noindexPattern.test(html) && !noindexPattern2.test(html)) {
    failures.push(
      `Assert 1 FAIL [docs/${slug}]: noindex robots meta tag not found`
    );
  }
}

// ── Assert 2: /docs/mcp — "release" or "pending" near @ledgerful/mcp-server ──

{
  const html = pages["mcp"];
  const lower = html.toLowerCase();
  const mcpPkg = "@ledgerful/mcp-server";
  const idx = lower.indexOf(mcpPkg);
  if (idx === -1) {
    failures.push(
      `Assert 2 FAIL [docs/mcp]: "@ledgerful/mcp-server" not found in HTML`
    );
  } else {
    const window = lower.slice(Math.max(0, idx - 300), idx + mcpPkg.length + 300);
    if (!window.includes("release") && !window.includes("pending")) {
      failures.push(
        `Assert 2 FAIL [docs/mcp]: "@ledgerful/mcp-server" found but "release" or "pending" not found within 300 chars`
      );
    }
  }
}

// ── Assert 3: /docs/mcp — no live link to npmjs.com or registry.npmjs.org ────

{
  const lower = pages["mcp"].toLowerCase();
  if (lower.includes("npmjs.com") || lower.includes("registry.npmjs.org")) {
    failures.push(
      `Assert 3 FAIL [docs/mcp]: live npmjs.com or registry.npmjs.org link found — package is not yet published`
    );
  }
}

// ── Assert 4: /docs/github-action — "GitHub App" absent OR near "planned" ────
// Check every occurrence, same approach as trust check for enterprise terms.

{
  const lower = pages["github-action"].toLowerCase();
  const term = "github app";
  const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  let match;
  let failedOccurrence = false;
  while ((match = re.exec(lower)) !== null) {
    const idx = match.index;
    const surrounding = lower.slice(Math.max(0, idx - 200), idx + term.length + 200);
    if (!surrounding.includes("planned")) {
      failedOccurrence = true;
      break;
    }
  }
  if (failedOccurrence) {
    failures.push(
      `Assert 4 FAIL [docs/github-action]: "GitHub App" appears without "planned" qualifier within 200 chars`
    );
  }
}

// ── Assert 5: /docs/github-action — version placeholder near `uses:` ─────────

{
  const lower = pages["github-action"].toLowerCase();
  const usesIdx = lower.indexOf("uses:");
  if (usesIdx === -1) {
    failures.push(
      `Assert 5 FAIL [docs/github-action]: "uses:" not found — workflow YAML section missing`
    );
  } else {
    const window = lower.slice(Math.max(0, usesIdx - 100), usesIdx + 200);
    // Look for version placeholder: literal <version>, HTML-encoded &lt;version&gt;, or "pending"
    const hasVersionPlaceholder =
      window.includes("&lt;version&gt;") ||
      window.includes("<version>") ||
      window.includes("pending");
    if (!hasVersionPlaceholder) {
      failures.push(
        `Assert 5 FAIL [docs/github-action]: version placeholder or "pending" not found near "uses:" line`
      );
    }
    // Also ensure there's no pinned @v<digit> tag without a caveat
    const pinnedTagRe = /@v\d/g;
    let match;
    while ((match = pinnedTagRe.exec(lower)) !== null) {
      const surround = lower.slice(
        Math.max(0, match.index - 200),
        match.index + match[0].length + 200
      );
      if (!surround.includes("pending") && !surround.includes("caveat") && !surround.includes("note")) {
        failures.push(
          `Assert 5 FAIL [docs/github-action]: pinned @v<tag> found without any caveat nearby`
        );
        break;
      }
    }
  }
}

// ── Assert 6: /docs/cli — release artifact note present ──────────────────────

{
  const lower = pages["cli"].toLowerCase();
  const hasReleaseBinary =
    lower.includes("release artifact") ||
    lower.includes("release binary") ||
    lower.includes("release artifacts");
  if (!hasReleaseBinary) {
    failures.push(
      `Assert 6 FAIL [docs/cli]: "release artifact" or "release binary" not found — must document that release binaries are not yet available`
    );
  }
}

// ── Assert 7: /docs/dashboard — "loopback" or "127.0.0.1" present ────────────

{
  const lower = pages["dashboard"].toLowerCase();
  if (!lower.includes("loopback") && !lower.includes("127.0.0.1")) {
    failures.push(
      `Assert 7 FAIL [docs/dashboard]: "loopback" or "127.0.0.1" not found — daemon bind address not documented`
    );
  }
}

// ── Assert 8: /docs/dashboard — "token" with safety warning in proximity ───────

{
  const lower = pages["dashboard"].toLowerCase();
  const safetyTerms = ["safety", "safe", "warning", "do not", "never", "exposed", "restart"];
  let tokenIdx = lower.indexOf("token");
  if (tokenIdx === -1) {
    failures.push(
      `Assert 8 FAIL [docs/dashboard]: "token" not found — token security section missing`
    );
  } else {
    // Check all "token" occurrences; pass if any has safety language within 400 chars.
    // (The first occurrence may be in the HTML <meta> description, far from body content.)
    let anySafe = false;
    while (tokenIdx !== -1) {
      const window = lower.slice(Math.max(0, tokenIdx - 400), tokenIdx + "token".length + 400);
      if (safetyTerms.some((term) => window.includes(term))) {
        anySafe = true;
        break;
      }
      tokenIdx = lower.indexOf("token", tokenIdx + 1);
    }
    if (!anySafe) {
      failures.push(
        `Assert 8 FAIL [docs/dashboard]: "token" found but no safety warning language within 400 chars of any token occurrence (safety/safe/warning/do not/never/exposed/restart)`
      );
    }
  }
}
// ── Assert 9: /docs/compliance — "local" near "soc2" or "export" ─────────────

{
  const lower = pages["compliance"].toLowerCase();
  // Check that "local" appears near "soc2" or "export"
  const checkProximity = (termA, termB, windowSize = 200) => {
    let idx = lower.indexOf(termA);
    while (idx !== -1) {
      const surrounding = lower.slice(Math.max(0, idx - windowSize), idx + termA.length + windowSize);
      if (surrounding.includes(termB)) return true;
      idx = lower.indexOf(termA, idx + 1);
    }
    return false;
  };

  const localNearSoc2 = checkProximity("local", "soc2");
  const localNearExport = checkProximity("local", "export");

  if (!localNearSoc2 && !localNearExport) {
    failures.push(
      `Assert 9 FAIL [docs/compliance]: "local" not found near "soc2" or "export" — local-only scope not clearly stated`
    );
  }
}

// ── Assert 10: /docs/releases — no raw release download URLs ─────────────────
// Check that no href points to a GitHub release download without a pending notice.

{
  const lower = pages["releases"].toLowerCase();

  // Look for patterns that would indicate a live release download link
  const downloadUrlPatterns = [
    /href=["'][^"']*releases\/download\/[^"']+\.(tar\.gz|zip|exe|pkg|dmg)/i,
    /href=["'][^"']*releases\/download\/v\d/i,
  ];

  for (const pattern of downloadUrlPatterns) {
    if (pattern.test(pages["releases"])) {
      // It's OK if there's a "pending" notice nearby — but a raw href is a fail
      failures.push(
        `Assert 10 FAIL [docs/releases]: live release download URL found in href — these are WEB-0005 launch facts and must not be live links`
      );
      break;
    }
  }

  // Also require that the page explicitly states downloads are pending or not yet available
  if (!lower.includes("pending") && !lower.includes("not yet available") && !lower.includes("web-0005")) {
    failures.push(
      `Assert 10 FAIL [docs/releases]: no "pending", "not yet available", or "web-0005" notice found — must disclose that release artifacts are not yet available`
    );
  }
}

// ── Assert 11: /docs/github-action — secrets.GITHUB_TOKEN present ─────────────

{
  const lower = pages["github-action"].toLowerCase();
  if (!lower.includes("secrets.github_token")) {
    failures.push(
      `Assert 11 FAIL [docs/github-action]: "secrets.GITHUB_TOKEN" not found in HTML`
    );
  }
}

// ── Assert 12: /docs/compliance — no "ledgerful compliance export" CLI command ─
// The export is dashboard-only; ledgerful compliance export does not exist.

{
  const lower = pages["compliance"].toLowerCase();
  if (lower.includes("ledgerful compliance export")) {
    failures.push(
      `Assert 12 FAIL [docs/compliance]: "ledgerful compliance export" found — this CLI command does not exist; the export is dashboard-only`
    );
  }
}

// ── Assert 13: Windows release checksum covers the emitted ZIP archive ───────

{
  const lower = pages["releases"].toLowerCase();
  if (!lower.includes("ledgerful-x86_64-pc-windows-msvc.zip")) {
    failures.push(
      "Assert 13 FAIL [docs/releases]: Windows ZIP archive name is missing",
    );
  }
  if (lower.includes("get-filehash ledgerful.exe")) {
    failures.push(
      "Assert 13 FAIL [docs/releases]: checksum incorrectly hashes ledgerful.exe instead of the ZIP",
    );
  }
}

// ── Assert 14: action example points at the action subdirectory ───────────────

if (!pages["github-action"].includes("Ryan-AI-Studios/Ledgerful/action@")) {
  failures.push(
    "Assert 14 FAIL [docs/github-action]: uses reference must include /action",
  );
}

// ── Assert 15: doctor is a report, not a generated bundle ────────────────────

{
  const lower = pages["releases"].toLowerCase();
  if (lower.includes("support bundle") || lower.includes("generate a support")) {
    failures.push(
      "Assert 15 FAIL [docs/releases]: ledgerful doctor must not be described as generating a bundle",
    );
  }
  if (!lower.includes("health report")) {
    failures.push(
      "Assert 15 FAIL [docs/releases]: ledgerful doctor health-report wording is missing",
    );
  }
}

// ── Assert 16: /install — no "ledgerful compliance export" fake CLI command ──
// Same check as Assert 12, extended to /install — see the comment above
// readTopLevelHtml() for why this page needed its own coverage.

{
  const lower = installHtml.toLowerCase();
  if (lower.includes("ledgerful compliance export")) {
    failures.push(
      `Assert 16 FAIL [install]: "ledgerful compliance export" found — this CLI command does not exist; the export is dashboard-only`
    );
  }
}

// ── Results ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error("\ncheck-docs-truth: FAILED\n");
  failures.forEach((f) => console.error(" ", f));
  process.exit(1);
} else {
  console.log("check-docs-truth: all 16 assertions passed ✓");
}
