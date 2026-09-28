import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog";
import { EXAMPLES } from "@/lib/examples";
import { LIBRARY } from "@/lib/library";
import { AGES } from "@/lib/pages/age-list";
import { GIFTS } from "@/lib/pages/gifts";
import { IDEA_TAGS, IDEAS, IDEAS_PER_PAGE } from "@/lib/pages/ideas";
import { letterSlug, NAME_LETTERS, NAMES } from "@/lib/pages/names";
import { THEME_IDS } from "@/lib/pages/themes";
import { abs } from "@/lib/site";

const NAMES_PER_PAGE = 28;

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
    page("/tsiny", 0.8),
    page("/mozhlyvosti", 0.7),
    page("/vidhuky", 0.6, "weekly"),
    page("/dopomoha", 0.5),
    page("/temy", 0.7),
    ...THEME_IDS.map((id) => page(`/temy/${id}`, 0.7)),
    page("/idei", 0.7),
    ...Array.from({ length: Math.ceil(IDEAS.length / IDEAS_PER_PAGE) - 1 }, (_, i) => page(`/idei/storinka/${i + 2}`, 0.3)),
    ...IDEA_TAGS.map((t) => page(`/idei/katehoriia/${t.id}`, 0.5)),
    ...IDEAS.map((i) => page(`/idei/${i.slug}`, 0.6)),
    page("/imena", 0.7),
    ...Array.from({ length: Math.ceil(NAMES.length / NAMES_PER_PAGE) - 1 }, (_, i) => page(`/imena/storinka/${i + 2}`, 0.3)),
    ...NAME_LETTERS.map((l) => page(`/imena/litera/${letterSlug(l)}`, 0.5)),
    ...NAMES.map((n) => page(`/imena/${n.slug}`, 0.6)),
    page("/vik", 0.7),
    ...AGES.map((a) => page(`/vik/${a.slug}`, 0.7)),
    page("/podarunky", 0.7),
    ...GIFTS.map((g) => page(`/podarunky/${g.slug}`, 0.7)),
    page("/dostavka-i-oplata", 0.4, "yearly"),
    page("/kontakty", 0.4, "yearly"),
    page("/umovy", 0.2, "yearly"),
    page("/konfidentsiinist", 0.2, "yearly"),
  ];
}
