import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content/navigation";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
