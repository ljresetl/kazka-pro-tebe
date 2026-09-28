import type { Metadata } from "next";
import { Crumbs, LinkCards, ThemeGrid } from "@/components/seo/Blocks";
import { AGES } from "@/lib/pages/age-list";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Для кожного віку — своя історія",
  description: "Персональні дитячі книжки від немовляти до 15 років. Оберіть вік і дізнайтеся, яка книжка пасує саме зараз і як читати разом.",
  path: "/vik",
});

export default function AgesPage() {
  return (
    <>
      <Crumbs items={[{ name: "Вік", path: "/vik" }]} />
      <section className="seo-hero">
        <div className="wrap">
          <h1>Для кожного віку — своя історія</h1>
          <p className="seo-hero-lead">
            Немовля слухає голос, дошкільня вмикає фантазію, а дев&apos;ятирічна дитина читає сама. Оберіть вік і
            дізнайтеся, чим персональна книжка особлива саме зараз.
          </p>
          <LinkCards small items={AGES.map((a) => ({ href: `/vik/${a.slug}`, title: a.label, image: `vik-rik/${a.slug}` }))} />
        </div>
      </section>
      <ThemeGrid />
    </>
  );
}
