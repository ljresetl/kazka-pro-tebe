import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog";
import { EXAMPLES } from "@/lib/examples";
import { LIBRARY } from "@/lib/library";
import { abs } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: abs(path),
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/stvoryty", 0.9),
    page("/pryklady", 0.8, "weekly"),
    ...EXAMPLES.map((e) => page(`/pryklady/${e.slug}`, 0.7)),
    page("/biblioteka", 0.7),
    ...LIBRARY.map((b) => page(`/biblioteka/${b.slug}`, 0.6)),
    page("/blog", 0.7, "weekly"),
    ...POSTS.map((p) => ({ ...page(`/blog/${p.slug}`, 0.6), lastModified: new Date(p.date) })),
    page("/dostavka-i-oplata", 0.4, "yearly"),
    page("/kontakty", 0.4, "yearly"),
    page("/umovy", 0.2, "yearly"),
    page("/konfidentsiinist", 0.2, "yearly"),
  ];
}
