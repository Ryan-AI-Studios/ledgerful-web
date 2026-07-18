export const publicRoutes = [
  "/",
  "/architecture",
  "/changelog",
  "/docs",
  "/docs/cli",
  "/docs/compliance",
  "/docs/dashboard",
  "/docs/github-action",
  "/docs/mcp",
  "/docs/public-ledger",
  "/docs/releases",
  "/docs/soc2-mapping",
  "/docs/sync",
  "/install",
  "/editions",
  "/trust",
  "/waitlist",
] as const;

export const primaryNavigation = [
  { href: "/#pillars", label: "Product" },
  { href: "/architecture", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/editions", label: "Editions" },
  { href: "/trust", label: "Trust" },
] as const;
