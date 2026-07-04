/**
 * Search indexing is fail-safe. Crawling requires both the exact opt-in value
 * and Vercel's production deployment context. Preview and development
 * deployments remain hidden even if the opt-in is accidentally scoped to them.
 */
export function isIndexingAllowed(value, deploymentEnvironment) {
  return value === "true" && deploymentEnvironment === "production";
}

export const indexingAllowed = isIndexingAllowed(
  process.env.NEXT_PUBLIC_ALLOW_INDEXING,
  process.env.VERCEL_ENV,
);
