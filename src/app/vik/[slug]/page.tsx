import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs, Faq, Perks, Reviews, Section, SectionHead } from "@/components/seo/Blocks";
import BlogTeasers from "@/components/seo/BlogTeasers";
import ThemeTabs from "@/components/seo/ThemeTabs";
import SlotImage from "@/components/SlotImage";
import { findTopic } from "@/lib/catalog";
import { AGES, getAgeText } from "@/lib/pages/ages";
import { getAge } from "@/lib/pages/age-list";
import { popularNames } from "@/lib/pages/names";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return AGES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<"/vik/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const t = getAgeText(slug);
  if (!t) return {};
  return pageMeta({ title: t.h1, description: t.intro, path: `/vik/${slug}` });
}

export default async function AgePage(props: PageProps<"/vik/[slug]">) {
  const { slug } = await props.params;
  const t = getAgeText(slug);
  const age = getAge(slug);
  if (!t || !age) notFound();
  const [a, b] = t.topics.map((id) => findTopic(id)!.topic);
  const href = `/stvoryty?vik=${age.group}`;

  return (
    <>
      <Crumbs items={[{ name: "Вік", path: "/vik" }, { name: age.label, path: `/vik/${slug}` }]} />
      <section className="seo-hero">
        <div className="wrap seo-hero-grid">
          <div>
            <h1>{t.h1}</h1>
            <p className="seo-hero-lead">{t.intro}</p>
            <Link href={href} className="btn btn-primary">
              Створити книжку
            </Link>
          </div>
          <div className="seo-hero-art">
            <SlotImage id={`vik-rik/${slug}`} alt={age.label} detail="label" priority sizes="(min-width: 900px) 420px, 92vw" />
          </div>
        </div>
      </section>

      <Section>
        <div className="prose-block">
          <h2>Яка дитина {age.years === 0 ? "в перший рік" : `у ${age.label}`}</h2>
          <p>{t.about}</p>
          <h2>Книжка, у якій дитина впізнає себе</h2>
          <p>
            {t.book} Наприклад,{" "}
            <Link href={`/temy/${a.id}`}>книжка на тему «{a.label.toLowerCase()}»</Link> або{" "}
            <Link href={`/temy/${b.id}`}>«{b.label.toLowerCase()}»</Link>. Хочете побачити, який вигляд має готова
            книжка? Перегляньте <Link href="/pryklady">приклади</Link>.
          </p>
        </div>
      </Section>

      <Section tint>
        <SectionHead title="Оберіть тему" />
        <ThemeTabs age={age.group} />
      </Section>

      <Section>
        <div className="cta-band">
          <div>
            <h2>Хочете, щоб дитина стала головним героєм?</h2>
            <p>{t.cta}</p>
          </div>
          <Link href={href} className="btn btn-primary">
            Створити книжку
          </Link>
        </div>
      </Section>

      <Section>
        <div className="prose-block">
          <h2>Як створити книжку й читати з дитиною</h2>
          <p>{t.read}</p>
          <h2>Чому цей подарунок залишиться надовго</h2>
          <p>{t.gift}</p>
        </div>
      </Section>

      <Reviews tint />
      <Faq items={t.faq} />

      <Section tint>
        <SectionHead title="Улюблені імена" />
        <div className="topic-chips">
          {popularNames(slug, 25).map((n) => (
            <Link key={n.slug} href={`/imena/${n.slug}`} className="topic-chip is-plain">
              {n.name} <span aria-hidden="true">{n.emoji}</span>
            </Link>
          ))}
          <Link href="/imena" className="topic-chip is-accent">
            Усі імена
          </Link>
        </div>
      </Section>

      <BlogTeasers />
      <Perks title="Створіть неповторну книжку саме для своєї дитини" />
      <section className="section">
        <div className="wrap" style={{ textAlign: "center" }}>
          <Link href={href} className="btn btn-primary">
            Створити дитячу книжку
          </Link>
        </div>
      </section>
    </>
  );
}
