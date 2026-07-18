/**
 * SOC 2 mapping page gate. Fail-safe: the route 404s unless the explicit
 * enable flag is set. Mirrors the indexing-policy.mjs pattern — the page
 * does not exist in production by default; design partners enable it on
 * a Vercel preview deployment by setting ENABLE_SOC2_MAPPING=true in the
 * preview environment.
 */
export function isSoc2MappingEnabled(value) {
  return value === "true";
}

export const soc2MappingEnabled = isSoc2MappingEnabled(
  process.env.ENABLE_SOC2_MAPPING,
);