import type { MetadataRoute } from "next";
import { mainNavigation, siteUrl } from "@/lib/content/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-06-26");

  return mainNavigation.map((route) => ({
    url: `${siteUrl}${route.href === "/" ? "" : route.href}`,
    lastModified: now,
    changeFrequency: route.href === "/" ? "weekly" : "monthly",
    priority: route.href === "/" ? 1 : 0.8,
  }));
}
