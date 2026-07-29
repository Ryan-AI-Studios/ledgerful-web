/**
 * Single public route registry for sitemap, e2e coverage, and post-build
 * completeness checks (0097). Every built App Router path from
 * `.next/server/app-paths-manifest.json` must appear in exactly one of
 * `indexableRoutes` or `excludedRoutes`.
 *
 * Do not hand-maintain a parallel list in sitemap.ts or tests/e2e/routes.ts.
 */

export const indexableRoutes = [
  "/",
  "/architecture",
  "/changelog",
  "/docs",
  "/docs/cli",
  "/docs/compliance",
  "/docs/dashboard",
  "/docs/github-action",
  "/docs/golden-path",
  "/docs/mcp",
  "/docs/policy-check",
  "/docs/public-ledger",
  "/docs/releases",
  "/docs/security",
  "/docs/sync",
  "/editions",
  "/install",
  "/ledger",
  "/trust",
  "/waitlist",
] as const;

export type IndexableRoute = (typeof indexableRoutes)[number];

export type ExcludedRoute = {
  readonly route: string;
  readonly reason: string;
};

/**
 * Built paths that must not appear in the public sitemap. Reasons are
 * reviewed; do not silence the coverage gate by dumping unknown routes here.
 */
export const excludedRoutes = [
  {
    route: "/docs/soc2-mapping",
    reason:
      "404 by design behind ENABLE_SOC2_MAPPING; check-soc2-mapping.mjs asserts the 404",
  },
  {
    route: "/ledger/[txId]",
    reason:
      "Sample public-ledger detail pages; each is linked from /ledger and thin sample URLs are not a discovery win",
  },
  {
    route: "/api/waitlist",
    reason: "API route handler, not a public page",
  },
  {
    route: "/changelog/feed.xml",
    reason: "Atom feed route handler; discovered via rel=alternate, not the sitemap",
  },
  {
    route: "/_not-found",
    reason: "Next.js internal not-found route",
  },
  {
    route: "/_global-error",
    reason: "Next.js internal global-error route",
  },
  {
    route: "/icon.svg",
    reason: "Metadata icon route",
  },
  {
    route: "/apple-icon",
    reason: "Metadata apple-icon route",
  },
  {
    route: "/robots.txt",
    reason: "Metadata robots route — not a sitemap entry",
  },
  {
    route: "/sitemap.xml",
    reason: "Metadata sitemap route — not a sitemap entry",
  },
] as const satisfies readonly ExcludedRoute[];

export const excludedRoutePaths = excludedRoutes.map((entry) => entry.route);
