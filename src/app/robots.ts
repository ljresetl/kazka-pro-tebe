import type { MetadataRoute } from "next";
import { AI_BOTS } from "@/lib/bots";
import { abs, INDEXING } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Сайт у розробці — закритий від усіх пошуковиків.
  if (!INDEXING) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      // ШІ-збирачам текстів і картинок — заборона на весь сайт; пошуковикам — відкрито.
      { userAgent: AI_BOTS, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/kazka/", "/moi-kazky/"] },
    ],
    sitemap: `${abs("/")}sitemap.xml`,
  };
}
