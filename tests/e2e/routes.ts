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
  "/waitlist",
] as const;

export const primaryNavigation = [
  { href: "/", label: "Home" },
  { href: "/architecture", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust" },
] as const;
