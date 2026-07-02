import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
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
    if (request.resourceType() === "document" || request.resourceType() === "script") {
      errors.push(`${request.resourceType()} request failed: ${request.url()}`);
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
    expect(errors).toEqual([]);
  });
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
      page.getByText("without uploading source code by default", { exact: false }),
      page.getByRole("link", { name: "Install Ledgerful" }),
      page.locator(".evidence-panel"),
    ]) {
      await expect(locator).toBeInViewport();
    }
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

test("trust text links are visually distinguishable without color alone", async ({ page }) => {
  await page.goto("/trust");
  const links = page.locator("#disclosure a, #license a");
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    expect(await link.evaluate((element) => getComputedStyle(element).textDecorationLine)).toContain(
      "underline",
    );
  }
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

test("the page background gradient does not tile", async ({ page }) => {
  await page.goto("/");
  const repeat = await page.evaluate(() => getComputedStyle(document.body).backgroundRepeat);
  expect(repeat.split(",").every((value) => value.trim() === "no-repeat")).toBe(true);
});
