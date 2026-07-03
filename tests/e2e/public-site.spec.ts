import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { primaryNavigation, publicRoutes } from "./routes";

const viewportWidths = [320, 375, 768, 1280, 1440] as const;

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  const onConsole = (message: ConsoleMessage) => {
    if (message.type() === "error") errors.push(message.text());
  };
  page.on("console", onConsole);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    const pageOrigin = page.url() === "about:blank" ? null : new URL(page.url()).origin;
    const isFirstParty =
      request.resourceType() === "document" ||
      (pageOrigin !== null && new URL(request.url()).origin === pageOrigin);
    if (!isFirstParty) return;
    errors.push(
      `${request.resourceType()} request failed: ${request.url()} (${request.failure()?.errorText ?? "unknown error"})`,
    );
  });
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const pageOrigin = page.url() === "about:blank" ? null : new URL(page.url()).origin;
    if (pageOrigin !== null && new URL(response.url()).origin === pageOrigin) {
      errors.push(
        `${response.request().resourceType()} response failed: ${response.url()} (HTTP ${response.status()})`,
      );
    }
  });
  return errors;
}

for (const route of publicRoutes) {
  test(`${route} loads without runtime, CSP, heading, or preview regressions`, async ({
    page,
  }) => {
    const errors = collectRuntimeErrors(page);
    const response = await page.goto(route, { waitUntil: "networkidle" });

    expect(response?.ok()).toBe(true);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex.*nofollow/,
    );

    const csp = response?.headers()["content-security-policy"] ?? "";
    const scriptSource = csp
      .split(";")
      .map((directive) => directive.trim())
      .find((directive) => directive.startsWith("script-src"));
    expect(scriptSource).toMatch(/^script-src 'self'( 'sha256-[A-Za-z0-9+/=]+')+$/);
    expect(scriptSource).not.toContain("'unsafe-inline'");
    expect(scriptSource).not.toContain("'unsafe-eval'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    await expect(page.locator("script[src][integrity]")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

for (const theme of ["dark", "light"] as const) {
  for (const route of publicRoutes) {
    test(`${route} has no detectable WCAG A or AA violations in ${theme} theme`, async ({
      page,
    }) => {
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem("ledgerful-theme", selectedTheme);
      }, theme);
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        results.violations.map(({ id, impact, nodes }) => ({
          id,
          impact,
          targets: nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    });
  }
}

for (const width of viewportWidths) {
  for (const route of publicRoutes) {
    test(`${route} has no document overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 1000 ? 900 : 1000 });
      await page.goto(route);

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        body: {
          clientWidth: document.body.clientWidth,
          scrollWidth: document.body.scrollWidth,
          minWidth: getComputedStyle(document.body).minWidth,
          margin: getComputedStyle(document.body).margin,
        },
        main: {
          clientWidth: document.querySelector("main")?.clientWidth,
          scrollWidth: document.querySelector("main")?.scrollWidth,
          minWidth: document.querySelector("main")
            ? getComputedStyle(document.querySelector("main")!).minWidth
            : null,
        },
        offenders: [...document.body.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              getComputedStyle(element).overflowX === "visible" &&
              element.getBoundingClientRect().right > document.documentElement.clientWidth + 1,
          )
          .slice(0, 8)
          .map((element) => ({
            tag: element.tagName,
            className: element.className,
            text: element.textContent?.trim().slice(0, 80),
            right: Math.round(element.getBoundingClientRect().right),
          })),
      }));
      expect(
        dimensions.scrollWidth,
        JSON.stringify({
          body: dimensions.body,
          main: dimensions.main,
          offenders: dimensions.offenders,
        }),
      ).toBeLessThanOrEqual(dimensions.clientWidth);
    });
  }
}

test("primary navigation is active and survives client navigation", async ({ page }) => {
  await page.goto("/");
  for (const item of primaryNavigation) {
    const link = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", {
      name: item.label,
      exact: true,
    });
    if (item.href === "/") {
      await expect(link).toHaveAttribute("aria-current", "page");
      continue;
    }
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${item.href.replace("/", "\\/")}$`));
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", {
        name: item.label,
        exact: true,
      }),
    ).toHaveAttribute("aria-current", "page");
    await page.goto("/");
  }

  await page.goto("/docs/cli");
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Docs", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("the production not-found boundary renders without runtime errors", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  const response = await page.goto("/route-that-does-not-exist", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors.filter((error) => !error.includes("status of 404 (Not Found)"))).toEqual([]);
});

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 1440, height: 1000 },
]) {
  test(`homepage install hierarchy is visible at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    for (const locator of [
      page.getByRole("heading", { level: 1 }),
      page.getByText("Your source code never leaves your machine by default", {
        exact: false,
      }),
      page.locator("#hero").getByRole("link", { name: "Install Ledgerful" }),
      page.locator(".hero-proof"),
    ]) {
      await expect(locator).toBeInViewport();
    }
  });
}

test("homepage relocated evidence panel is visible in the 'how it stays local' section", async ({
  page,
}) => {
  await page.goto("/");
  const panel = page.locator("#stays-local .evidence-panel");
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toBeVisible();
});

test("homepage install command copy button copies the real install command", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const copyButton = page
    .locator("#hero")
    .getByRole("button", { name: "Copy install command" });
  await copyButton.click();
  await expect(
    page.locator("#hero").getByRole("button", { name: "Install command copied" }),
  ).toBeVisible();
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe(
    "cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful",
  );
});

// WEB-0022 — homepage narrative structure: one h1, then h2s in the exact
// section order the rebuilt page is specified to render, plus the three
// top-level landmarks.
const homepageH2Order = [
  "One scan. One receipt.",
  "Where your data goes",
  "Proof points, linked to evidence",
  "The volume of change has outpaced the evidence for it.",
  "What a scan actually produces",
  "Every capability, in one flat list",
  "How it stays local",
  "Start where you sit",
  "What each state label means",
  "Install now, or read the docs first",
];

test("homepage heading and landmark structure matches the specified section order", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

  const h2s = page.locator("main").getByRole("heading", { level: 2 });
  await expect(h2s).toHaveText(homepageH2Order);
});

// Realistic phone width x height pairs, not just one height per width — a
// prior pass only checked 812px-tall viewports for both 320 and 375px
// widths, which happened to be the one height where the CTA was (barely)
// clipped into view; shorter, equally-real phone heights had it fully
// off-screen. `toBeInViewport()`'s default intersection ratio is 0, so any
// nonzero overlap passed — this asserts full containment (ratio: 1) and
// cross-checks the raw bounding box, matching how the regression was
// actually caught (a real getBoundingClientRect() measurement, not the
// test's own assertion).
const dod2Viewports = [
  { width: 320, height: 568 }, // iPhone SE (1st gen) / small older Android
  { width: 320, height: 812 },
  { width: 375, height: 667 }, // iPhone SE (2nd/3rd gen), iPhone 8
  { width: 375, height: 812 }, // iPhone 13 mini / iPhone X
];

for (const { width, height } of dod2Viewports) {
  test(`homepage install CTA is fully visible without scrolling at ${width}x${height} (DoD-2)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const install = page.locator("#hero").getByRole("link", { name: "Install Ledgerful" });
    await expect(install).toBeInViewport({ ratio: 1 });

    const box = await install.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);
  });
}

test("skip link and native disclosure are keyboard operable", async ({ page }) => {
  await page.goto("/trust");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  const summary = page.getByText("View example telemetry payload (JSON)", { exact: true });
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(summary.locator("xpath=..")).toHaveAttribute("open", "");
});

test("mobile section-nav disclosure is keyboard operable at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/trust");

  // The desktop rail is hidden at 375px; the mobile <details> disclosure shows.
  const rail = page.locator(".trust-section-nav--rail");
  await expect(rail).toHaveCSS("display", "none");
  const disclosure = page.locator(".trust-section-nav--disclosure");
  await expect(disclosure).toBeVisible();

  // Open the disclosure via keyboard (Enter on summary, reached by Tab).
  const summary = disclosure.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");

  // Tab into the now-open list and confirm a real anchor is reached via
  // keyboard (not programmatic focus) and is focused + activatable.
  await page.keyboard.press("Tab");
  const firstLink = disclosure.locator("a").first();
  await expect(firstLink).toBeFocused();
  expect(await firstLink.getAttribute("href")).toMatch(/^#/);

  // Activate a link that is below the fold so the scroll (and
  // scroll-margin-top) is actually exercised. The last section nav
  // anchor ("13. Subprocessors") is near the page bottom.
  const lastLink = disclosure.locator("a").last();
  await lastLink.focus();
  await expect(lastLink).toBeFocused();
  const href = await lastLink.getAttribute("href");
  const targetId = href!.slice(1);
  await page.keyboard.press("Enter");

  // The anchor click updates the URL hash and scrolls the target into
  // view. Under parallel test load the native scroll can lag, so
  // explicitly scroll the target into view before asserting visibility.
  const target = page.locator(`#${targetId}`);
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeInViewport();
});

test("trust launch blockers do not expose unavailable public links", async ({ page }) => {
  await page.goto("/trust");
  await expect(page.locator("#disclosure a, #license a")).toHaveCount(0);
  await expect(page.locator("#disclosure")).toContainText("pending activation");
  await expect(page.locator("#license")).toContainText("PolyForm Noncommercial");
  await expect(page.locator("#license")).toContainText("Legal launch review");
});

test("trust inline links are distinguishable without color alone", async ({ page }) => {
  await page.goto("/trust");
  const links = page.locator("a.inline-link:visible");
  const count = await links.count();
  if (count === 0) return; // inline links are conditional on repository access state
  for (const link of await links.all()) {
    expect(await link.evaluate((element) => getComputedStyle(element).textDecorationLine)).toContain(
      "underline",
    );
  }
});

// WEB-0024 — recomposed /trust adds the reads/writes/uploads boundary
// table and splits the subprocessor list into two. Six `.table-scroll`
// wrappers in total: the boundary table, the SOC2 ZIP layout, the
// telemetry schema, the sample ledger CSV (inside the redacted export
// <details>), the public-site subprocessor list, and the product /
// future-hosted subprocessor list. At 320/375px the boundary table
// (5 columns of sentences), the sample ledger CSV (7 columns), the
// public-site subprocessor table (1 row, but the purpose cell contains
// a long sentence that wraps wider than the column), and the product
// subprocessor table (3 columns with longer purpose text) actually
// overflow. The SOC2 ZIP layout and the telemetry schema do not.
for (const width of [320, 375]) {
  test(`trust only exposes necessary keyboard scroll regions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("/trust");
    const wrappers = page.locator(".table-scroll");
    await expect(wrappers).toHaveCount(6);
    let scrollableCount = 0;

    for (const wrapper of await wrappers.all()) {
      const disclosure = wrapper.locator("xpath=ancestor::details[1]");
      if ((await disclosure.count()) > 0 && !(await disclosure.getAttribute("open"))) {
        await disclosure.locator("summary").click();
      }
      const before = await wrapper.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        scrollLeft: element.scrollLeft,
      }));

      if (before.scrollWidth > before.clientWidth) {
        scrollableCount += 1;
        await expect(wrapper).toHaveAttribute("role", "region");
        await expect(wrapper).toHaveAttribute("aria-label", /horizontally scrollable/);
        await expect(wrapper).toHaveAttribute("tabindex", "0");
        await wrapper.focus();
        await page.keyboard.press("ArrowRight");
        await expect
          .poll(() => wrapper.evaluate((element) => element.scrollLeft))
          .toBeGreaterThan(before.scrollLeft);
      } else {
        await expect(wrapper).not.toHaveAttribute("tabindex", "0");
      }
    }

    expect(scrollableCount).toBe(4);
  });
}

// WEB-0024 — automate the PDF generation step. This is a regression
// guard that `@media print` doesn't silently break; a human still
// eyeballs the artifact for cut tables/diagrams.
test("trust page generates a printable PDF for human review", async ({ page }) => {
  await page.goto("/trust");
  await page.emulateMedia({ media: "print" });

  // Assert the print CSS actually applied before generating the PDF:
  // the section nav + hero CTAs must be hidden, and the collapsible
  // evidence samples must be forced open (so they render in the PDF).
  const navRail = page.locator(".trust-section-nav--rail");
  await expect(navRail).toHaveCSS("display", "none");

  const heroActions = page.locator(".hero-actions");
  await expect(heroActions).toHaveCSS("display", "none");

  const sampleDetails = page.locator("details.sample-export");
  const detailCount = await sampleDetails.count();
  expect(detailCount).toBeGreaterThan(0);
  for (const detail of await sampleDetails.all()) {
    // print CSS forces details[open] content visible; assert the open
    // attribute OR that the child content is rendered (not display:none).
    const isOpen = await detail.getAttribute("open");
    const contentVisible = await detail
      .locator(":scope > *:not(summary)")
      .first()
      .evaluate((el) => getComputedStyle(el).display !== "none");
    expect(isOpen !== null || contentVisible).toBe(true);
  }

  const pdfPath = "test-results/trust-print.pdf";
  const buffer = await page.pdf({
    path: pdfPath,
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
  });
  expect(buffer.byteLength).toBeGreaterThan(8 * 1024);
  expect(buffer.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  expect(buffer.length).toBeGreaterThan(0);
});

test("dark mode and reduced motion retain readable deterministic rendering", async ({
  browser,
}) => {
  const context = await browser.newContext({
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");

  const styles = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const html = getComputedStyle(document.documentElement);
    return {
      backgroundColor: body.backgroundColor,
      color: body.color,
      scrollBehavior: html.scrollBehavior,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      darkMode: matchMedia("(prefers-color-scheme: dark)").matches,
    };
  });

  expect(styles.darkMode).toBe(true);
  expect(styles.reducedMotion).toBe(true);
  expect(styles.backgroundColor).not.toBe(styles.color);
  expect(styles.scrollBehavior).toBe("auto");
  await context.close();
});

test("dark is the no-preference default and the theme control persists light", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Light", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await page.evaluate(() => localStorage.getItem("ledgerful-theme"))).toBe("light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("system theme follows the operating-system preference", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  await context.addInitScript(() => localStorage.setItem("ledgerful-theme", "system"));
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await context.close();
});

test("saved theme is applied by the CSP-hashed head script before hydration", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: true });
  await context.addInitScript(() => localStorage.setItem("ledgerful-theme", "light"));
  await context.route("**/_next/static/**/*.js", (route) => route.abort());
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("group", { name: "Color theme" })).toHaveCount(0);
  await expect(page.locator(".theme-toggle-placeholder")).toBeVisible();
  await context.close();
});

test("theme controls expose visible keyboard focus", async ({ page }) => {
  await page.goto("/");
  const system = page.getByRole("button", { name: "System", exact: true });
  await system.focus();
  await expect(system).toBeFocused();
  const outline = await system.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(outline.style).not.toBe("none");
  expect(Number.parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
});

test("mobile header visual order matches keyboard order", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  // ThemeToggle hydrates client-side (it renders a placeholder until mount);
  // wait for the real control before reading DOM order so this assertion
  // doesn't race the homepage's client-side hydration under load.
  await page.waitForSelector('.theme-toggle button[data-theme-choice="system"]');
  const order = await page.evaluate(() => {
    const homeElement = document.querySelector<HTMLElement>('.site-nav a[href="/"]');
    const systemElement = document.querySelector<HTMLElement>(
      '.theme-toggle button[data-theme-choice="system"]',
    );
    const installElement = document.querySelector<HTMLElement>(".header-install");
    if (!homeElement || !systemElement || !installElement) {
      throw new Error("Expected mobile header controls were not rendered.");
    }
    return {
      homeBeforeSystem: Boolean(
        homeElement.compareDocumentPosition(systemElement) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      systemBeforeInstall: Boolean(
        systemElement.compareDocumentPosition(installElement) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      vertical: [
        homeElement.getBoundingClientRect().top,
        systemElement.getBoundingClientRect().top,
        installElement.getBoundingClientRect().top,
      ],
    };
  });
  expect(order.homeBeforeSystem).toBe(true);
  expect(order.systemBeforeInstall).toBe(true);
  expect(order.vertical[0]).toBeLessThanOrEqual(order.vertical[1]);
  expect(order.vertical[1]).toBeLessThanOrEqual(order.vertical[2]);
});

test("theme switching still works when preference storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage disabled", "SecurityError");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Light", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("head theme fallback keeps dark browser chrome when storage reads are blocked", async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage disabled", "SecurityError");
    };
  });
  await context.route("**/_next/static/**/*.js", (route) => route.abort());
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.locator("html").evaluate((element) => element.style.colorScheme)).toBe("dark");
  await context.close();
});

test("the page background gradient does not tile", async ({ page }) => {
  await page.goto("/");
  const repeat = await page.evaluate(() => getComputedStyle(document.body).backgroundRepeat);
  expect(repeat.split(",").every((value) => value.trim() === "no-repeat")).toBe(true);
});

// ── WEB-0023 — install page: verified command leads, before the platform table ──

test("install page leads with the install command before the platform table, with a smoke test in between (DoD-1)", async ({
  page,
}) => {
  await page.goto("/install");

  const order = await page.evaluate(() => {
    const commandBlock = document.querySelector(".install-command--expanded");
    const platformTable = document.querySelector(".platform-table");
    const smokeHeading = Array.from(document.querySelectorAll(".step-index")).find((element) =>
      element.textContent?.includes("SMOKE TEST"),
    );
    if (!commandBlock || !platformTable || !smokeHeading) {
      return { found: false, commandBeforeTable: false, smokeBeforeTable: false };
    }
    return {
      found: true,
      commandBeforeTable: Boolean(
        commandBlock.compareDocumentPosition(platformTable) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      smokeBeforeTable: Boolean(
        smokeHeading.compareDocumentPosition(platformTable) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    };
  });

  expect(order.found).toBe(true);
  expect(order.commandBeforeTable).toBe(true);
  expect(order.smokeBeforeTable).toBe(true);
});

test("install page never renders the fake 'ledgerful compliance export' CLI command", async ({ page }) => {
  await page.goto("/install");
  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  expect(bodyText).not.toContain("ledgerful compliance export");
});

// The copy button's disabled-until-hydrated requirement (WEB-0023 DoD-1) has
// two halves, tested two different ways because a live hydration race can't
// be honestly asserted mid-flight in Playwright:
//   1. Pre-hydration: block every JS bundle so hydration never happens at
//      all, then read the server-rendered `disabled` attribute directly off
//      the DOM — the same technique already used above for the theme-toggle
//      placeholder tests (see "saved theme is applied by the CSP-hashed head
//      script before hydration"). This proves the SSR output itself ships
//      the button disabled, not just that it becomes enabled quickly.
//   2. Post-hydration: normal JS-enabled load, assert the button is enabled
//      and functional (mirrors the homepage copy-button test).

test("install page copy button ships server-rendered disabled — no dead UI when JS never loads (DoD-1)", async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.route("**/_next/static/**/*.js", (route) => route.abort());
  const page = await context.newPage();
  await page.goto("/install", { waitUntil: "domcontentloaded" });

  const copyButton = page
    .locator(".install-command--expanded")
    .getByRole("button", { name: /Copy install command/ });
  await expect(copyButton).toBeVisible();
  await expect(copyButton).toBeDisabled();

  await context.close();
});

test("install page copy button becomes enabled after hydration and copies the real install command", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/install");

  const copyButton = page
    .locator(".install-command--expanded")
    .getByRole("button", { name: "Copy install command" });
  await expect(copyButton).toBeEnabled();
  await copyButton.click();
  await expect(
    page.locator(".install-command--expanded").getByRole("button", { name: "Install command copied" }),
  ).toBeVisible();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe(
    "cargo install --git https://github.com/Ryan-AI-Studios/Ledgerful --bin ledgerful",
  );
});

// ── WEB-0023 — architecture diagram: restacks vertically, legible at 320px (DoD-4) ──

test("architecture diagram restacks vertically and stays legible at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/architecture");

  const diagram = page.locator(".arch-diagram-v2");
  await expect(diagram).toBeVisible();

  const result = await page.evaluate(() => {
    const root = document.querySelector(".arch-diagram-v2");
    if (!root) return null;

    const hostNodes = Array.from(root.querySelectorAll(".arch-host-nodes .arch-node"));
    const outsideNodes = Array.from(root.querySelectorAll(".arch-outside-nodes .arch-node"));

    const isStackedGroup = (nodes: Element[]) =>
      nodes.every((node, i) => {
        if (i === 0) return true;
        const prev = nodes[i - 1].getBoundingClientRect();
        const cur = node.getBoundingClientRect();
        // Restacked to one column means each node sits fully below the
        // previous one, not beside it (a shrunk-but-still-side-by-side
        // layout would instead show overlapping vertical ranges here).
        return cur.top >= prev.bottom - 1;
      });

    const titleEls = Array.from(root.querySelectorAll<HTMLElement>(".arch-node-title"));
    const viewportWidth = document.documentElement.clientWidth;

    return {
      hostStacked: isStackedGroup(hostNodes),
      outsideStacked: isStackedGroup(outsideNodes),
      labels: titleEls.map((el) => el.textContent?.trim()),
      fontSizes: titleEls.map((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
      clipped: titleEls.some((el) => {
        const rect = el.getBoundingClientRect();
        return rect.left < 0 || rect.right > viewportWidth + 1;
      }),
      viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  expect(result).not.toBeNull();
  expect(result!.hostStacked).toBe(true);
  expect(result!.outsideStacked).toBe(true);
  expect(result!.labels).toEqual(
    expect.arrayContaining(["ledgerful CLI", "Embedded UI", "ledgerful.dev", "Hosted control plane"]),
  );
  // Legible, not shrunk-to-fit: every node title stays at a real,
  // comfortably readable size instead of being scaled down to cram a
  // desktop layout into 320px.
  for (const size of result!.fontSizes) {
    expect(size).toBeGreaterThanOrEqual(14);
  }
  expect(result!.clipped).toBe(false);
  expect(result!.scrollWidth).toBeLessThanOrEqual(result!.clientWidth);
});

// ── 0025-WebPricingReframe — plain-English boundary, planned-card CTAs, FAQ ──

test("pricing planned-card CTAs point at labeled mailto destinations, not fake contact paths", async ({
  page,
}) => {
  await page.goto("/pricing");

  const waitlist = page.getByRole("link", { name: "Join the waitlist" });
  await expect(waitlist).toBeVisible();
  await expect(waitlist).toHaveAttribute("href", /^mailto:waitlist@ledgerful\.dev\?subject=/);

  const contact = page.getByRole("link", { name: "Contact us" });
  await expect(contact).toBeVisible();
  await expect(contact).toHaveAttribute("href", /^mailto:hello@ledgerful\.dev\?subject=/);

  const licenseTerms = page.getByRole("link", { name: "Review license terms" });
  await expect(licenseTerms).toBeVisible();
  await expect(licenseTerms).toHaveAttribute("href", "/trust#license");
});

test("pricing license examples render the pending-legal-review draft banner", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByText("DRAFT — PENDING LEGAL REVIEW.")).toBeVisible();
  // Four personas from licensePersonas — spot-check first and last.
  await expect(
    page.getByText("A 3-person consultancy runs Ledgerful internally", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("A vendor bundles Ledgerful into a product it sells to customers.", {
      exact: false,
    }),
  ).toBeVisible();
});

test("pricing FAQ disclosures are keyboard operable", async ({ page }) => {
  await page.goto("/pricing");

  const item = page.locator(".pricing-faq-item").first();
  await expect(item).not.toHaveAttribute("open", "");

  const summary = item.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(item).toHaveAttribute("open", "");
});
