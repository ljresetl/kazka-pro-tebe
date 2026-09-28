import type { Metadata } from "next";
import { Crumbs, LinkCards, ThemeGrid } from "@/components/seo/Blocks";
import { GIFTS } from "@/lib/pages/gifts";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Подарунок для будь-якої нагоди",
  description: "Персональна дитяча книжка на Миколая, Різдво, день народження, народження малюка, 1 вересня та інші свята. Оберіть привід і дізнайтеся, чому книжка пасує саме до нього.",
  path: "/podarunky",
});

export default function GiftsPage() {
  return (
    <>
      <Crumbs items={[{ name: "Подарунки", path: "/podarunky" }]} />
      <section className="seo-hero">
        <div className="wrap">
          <h1>Подарунок для будь-якої нагоди</h1>
          <p className="seo-hero-lead">
            Деякі миті заслуговують на більше, ніж звичайний подарунок. Оберіть привід і дізнайтеся, чому персональна
            книжка пасує до нього якнайкраще.
          </p>
          <LinkCards small items={GIFTS.map((g) => ({ href: `/podarunky/${g.slug}`, title: g.label, image: `pryvid/${g.slug}` }))} />
        </div>
      </section>
      <ThemeGrid />
    </>
  );
}
