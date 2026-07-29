import { indexableRoutes } from "../../src/lib/content/routes";

/** Browser e2e coverage list — derived from the single route registry (0097). */
export const publicRoutes = indexableRoutes;

export const primaryNavigation = [
  { href: "/#pillars", label: "Product" },
  { href: "/architecture", label: "How it works" },
  { href: "/docs", label: "Docs" },
  { href: "/editions", label: "Editions" },
  { href: "/trust", label: "Trust" },
] as const;
