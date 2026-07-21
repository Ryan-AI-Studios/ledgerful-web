import type { NextConfig } from "next";
import { readFileSync } from "node:fs";

const routeScriptHashes = (() => {
  try {
    return JSON.parse(
      readFileSync(new URL("./.csp/csp-script-hashes.json", import.meta.url), "utf8"),
    ) as Record<string, string[]>;
  } catch {
    return {};
  }
})();

const cspFor = (hashes: string[]) => {
  const scriptSource = [
    "'self'",
    ...[...new Set(hashes)].map((hash) => `'${hash}'`),
  ].join(" ");
  return `default-src 'self'; script-src ${scriptSource}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`;
};

const buildId = () =>
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  "ledgerful-local-build";

const commonHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=300" },
];

const fallbackHashes = [
  ...(routeScriptHashes["/_not-found"] ?? []),
  ...(routeScriptHashes["/_global-error"] ?? []),
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  generateBuildId: async () => buildId(),
  // Next 16 treats localhost vs 127.0.0.1 as cross-origin for dev assets/HMR.
  // Without this, hydration (theme toggle, etc.) can hang when browsing via 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Do not re-enable experimental SRI without a real Vercel deploy proving CDN parity.
  // Vercel can serve transformed chunk bytes that fail browser validation:
  // https://github.com/vercel/next.js/issues/91633
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/editions",
        statusCode: 301,
      },
    ];
  },
  async headers() {
    // Production (and `next start`) uses hash-locked CSP from build-with-csp.
    // `next dev` injects changing Turbopack/HMR/React refresh inline scripts that
    // are not in the static hash allowlist. Applying production CSP there blocks
    // hydration — client components (theme toggle, BrandMark) never become live.
    // Keep the other security headers in all environments.
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/(.*)",
          headers: commonHeaders,
        },
      ];
    }

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspFor(fallbackHashes) },
          ...commonHeaders,
        ],
      },
      ...Object.entries(routeScriptHashes)
        .filter(([route]) => !route.startsWith("/_"))
        .map(([route, hashes]) => ({
          source: route,
          headers: [
            {
              key: "Content-Security-Policy",
              value: cspFor([
                ...hashes,
                ...(routeScriptHashes["/_global-error"] ?? []),
              ]),
            },
          ],
        })),
    ];
  },
};

export default nextConfig;
