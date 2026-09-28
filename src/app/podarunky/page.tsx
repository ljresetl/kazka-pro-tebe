import type { Metadata } from "next";
import { AgeChips, Crumbs, LinkCards, Perks, PopularNames, SeoOutro, ThemeGrid } from "@/components/seo/Blocks";
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
      <AgeChips />
      <PopularNames seed="podarunky" tint />
      <Perks title="Створіть неповторну книжку саме для своєї дитини" />
      <SeoOutro
        title="Подарунок, що пасує до нагоди"
        parts={[
          {
            h: "Як обирати подарунок за приводом",
            p: [
              "На Миколая — маленьке диво під подушкою, на Різдво — історія для всієї родини, на день народження — свято, де іменинник головний. До народження малюка варто подумати й про старшого братика чи сестричку.",
              "Оберіть привід вище, і ми підкажемо теми й ідеї, що найкраще пасують саме до нього.",
            ],
          },
          {
            h: "Чому персональна книжка працює як подарунок",
            p: [
              "Іграшки швидко набридають, а книжка, де дитина — головний герой, залишається на полиці роками. Її перечитують, показують друзям і згадують уже дорослими.",
              "Додайте передмову від себе — і подарунок стане ще особистішим. Е-книга готова одразу, а друковану у твердій обкладинці надішлемо Новою Поштою.",
            ],
          },
        ]}
      />
    </>
  );
}
