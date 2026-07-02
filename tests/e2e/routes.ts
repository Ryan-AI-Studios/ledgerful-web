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
  "/docs/releases",
  "/docs/sync",
  "/install",
  "/pricing",
  "/trust",
] as const;

export const primaryNavigation = [
  { href: "/", label: "Home" },
  { href: "/install", label: "Install" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust" },
  { href: "/changelog", label: "Changelog" },
] as const;
