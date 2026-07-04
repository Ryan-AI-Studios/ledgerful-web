import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content/navigation";
import { indexingAllowed } from "@/lib/indexing-policy.mjs";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexingAllowed
      ? {
          userAgent: "*",
          allow: "/",
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
