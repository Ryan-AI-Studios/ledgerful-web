import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const deployedBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/+$/, "");
const previewBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
  use: {
    baseURL: deployedBaseUrl ?? `http://127.0.0.1:${port}`,
    extraHTTPHeaders:
      deployedBaseUrl && previewBypass
        ? {
            "x-vercel-protection-bypass": previewBypass,
            "x-vercel-set-bypass-cookie": "true",
            "x-vercel-skip-toolbar": "1",
          }
        : undefined,
    // Protected-preview headers contain a credential. Never persist them in traces.
    trace: previewBypass ? "off" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: deployedBaseUrl
    ? undefined
    : {
        command: `npm run start -- --port ${port}`,
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
