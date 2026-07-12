import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/classes", "/account", "/api", "/auth", "/verify-email"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
