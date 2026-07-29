import type { MetadataRoute } from "next";
import { indexableRoutes } from "@/lib/content/routes";
import { siteUrl } from "@/lib/content/navigation";

/**
 * Public sitemap derived solely from `indexableRoutes` (0097).
 * lastModified is intentionally omitted: a single hardcoded date was worse than
 * none (Illyes 2026-07-16), and git-derived dates are unreliable on Vercel shallow clones.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return indexableRoutes.map((path) => ({
    url: path === "/" ? siteUrl : `${siteUrl}${path}`,
    changeFrequency: (path === "/" ? "weekly" : "monthly") as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: path === "/" ? 1 : path.startsWith("/docs") ? 0.7 : 0.8,
  }));
}
