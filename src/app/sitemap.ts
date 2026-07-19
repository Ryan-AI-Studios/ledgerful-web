import type { MetadataRoute } from "next";
import { publicNavigation, siteUrl } from "@/lib/content/navigation";

const docRoutes = [
  "/docs/cli",
  "/docs/dashboard",
  "/docs/mcp",
  "/docs/github-action",
  "/docs/policy-check",
  "/docs/compliance",
  "/docs/sync",
  "/docs/releases",
  "/docs/public-ledger",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-06-27");

  return [
    ...publicNavigation.map((route) => ({
      url: `${siteUrl}${route.href === "/" ? "" : route.href}`,
      lastModified: now,
      changeFrequency: (route.href === "/" ? "weekly" : "monthly") as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: route.href === "/" ? 1 : 0.8,
    })),
    ...docRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: 0.7,
    })),
  ];
}
