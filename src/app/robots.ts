import type { MetadataRoute } from "next";
import { abs, INDEXING } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Сайт у розробці — закритий від усіх пошуковиків.
  if (!INDEXING) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/kazka/", "/moi-kazky/"] }],
    sitemap: `${abs("/")}sitemap.xml`,
  };
}
