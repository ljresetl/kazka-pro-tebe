import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgeChips, BookQuality, Crumbs, Faq, HowItWorks, Perks, Reviews, Section, SectionHead, ThemeGrid } from "@/components/seo/Blocks";
import { GENERAL_FAQ } from "@/lib/general-faq";
import { LetterNav } from "@/components/seo/NamesList";
import StartBox from "@/components/seo/StartBox";
import SlotImage from "@/components/SlotImage";
import { getName, NAMES, nameTexts, popularNames } from "@/lib/pages/names";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return NAMES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata(props: PageProps<"/imena/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const n = getName(slug);
  if (!n) return {};
  const t = nameTexts(n);
  return pageMeta({ title: `Персональна дитяча книжка з ім'ям ${n.name}: ${t.titles[0]}`, description: t.lead, path: `/imena/${slug}` });
}

export default async function NamePage(props: PageProps<"/imena/[slug]">) {
  const { slug } = await props.params;
  const n = getName(slug);
  if (!n) notFound();
  const t = nameTexts(n);
  const href = `/stvoryty?tema=${n.topic}&imia=${encodeURIComponent(n.name)}`;

  return (
    <>
      <Crumbs
        items={[
          { name: "Імена", path: "/imena" },
          { name: `Книжка з ім'ям ${n.name}`, path: `/imena/${slug}` },
        ]}
      />
      <section className="seo-hero">
        <div className="wrap idea-grid">
          <article className="idea-text">
            <h1>
              Персональна дитяча книжка з ім&apos;ям {n.name} <span aria-hidden="true">{n.emoji}</span>
            </h1>
            <h2>Чому книжка з ім&apos;ям {n.name}?</h2>
            <p className="seo-hero-lead">{t.lead}</p>
            {t.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <h3>Зазирніть у пригоду, яку переживає {n.name}:</h3>
            <blockquote className="idea-sample">«{t.sample}»</blockquote>
            <h2>Ідеї назви книжки з ім&apos;ям {n.name}:</h2>
            <ul className="idea-titles">
              {t.titles.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </article>
          <div className="name-side">
            <StartBox image={`imya/${slug}`} title={t.titles[0]} cta={`Створити книжку з ім'ям ${n.name}`} href={href} />
            <figure className="photo-example">
              <SlotImage id="book/foto-pryklad" alt={`Як фото перетворюється на ілюстрацію в книжці з ім'ям ${n.name}`} detail="label" sizes="(min-width: 900px) 360px, 92vw" />
              <figcaption>Додайте фото — і героя намалюємо схожим на вашу дитину.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <HowItWorks title={`Як створити книжку з ім'ям ${n.name}`} name={n.gen} />
      <BookQuality />
      <ThemeGrid title="Книжки за темою" />

      <Section>
        <SectionHead title="Улюблені імена для дитячих книжок" />
        <div className="topic-chips">
          {popularNames(slug, 7).map((x) => (
            <Link key={x.slug} href={`/imena/${x.slug}`} className="topic-chip is-plain">
              {x.name} <span aria-hidden="true">{x.emoji}</span>
            </Link>
          ))}
          <Link href="/imena" className="topic-chip is-accent">
            Усі імена
          </Link>
        </div>
        <LetterNav active={n.letter} />
      </Section>

      <Reviews tint />
      <AgeChips />
      <Faq items={GENERAL_FAQ} tint />
      <Perks title="Створіть неповторну книжку саме для своєї дитини" />
    </>
  );
}
