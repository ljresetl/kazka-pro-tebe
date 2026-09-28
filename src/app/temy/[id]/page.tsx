import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AgePicker,
  Crumbs,
  FinalCta,
  HowItWorks,
  LinkCards,
  PageHero,
  Perks,
  Reviews,
  Section,
  SectionHead,
} from "@/components/seo/Blocks";
import StoryPreview from "@/components/seo/StoryPreview";
import { findTopic } from "@/lib/catalog";
import { ideasForTopic } from "@/lib/pages/ideas";
import { inflect } from "@/lib/pages/inflect";
import { exampleHero, namesForTopic } from "@/lib/pages/names";
import { getThemeText, THEME_IDS, themeSections } from "@/lib/pages/themes";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return THEME_IDS.map((id) => ({ id }));
}

export async function generateMetadata(props: PageProps<"/temy/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const t = getThemeText(id);
  if (!t) return {};
  return pageMeta({ title: t.h1, description: t.lead, path: `/temy/${id}` });
}

export default async function ThemePage(props: PageProps<"/temy/[id]">) {
  const { id } = await props.params;
  const t = getThemeText(id);
  const found = findTopic(id);
  if (!t || !found) notFound();
  const { category, topic } = found;
  const hero = exampleHero(id);
  const sample = inflect(t.sample, hero.name, hero.g, hero.gen);
  const ideas = ideasForTopic(id, 3);
  const names = namesForTopic(id, 14);

  return (
    <>
      <Crumbs items={[{ name: "Теми", path: "/temy" }, { name: topic.label, path: `/temy/${id}` }]} />
      <PageHero title={t.h1} lead={t.lead} image={`tema-velyka/${id}`} imageAlt={topic.label} cta={{ href: `/stvoryty?tema=${id}`, label: "Створити дитячу книжку" }} />

      <AgePicker topic={id} />

      <Section>
        <div className="theme-text">
          <h2>Чим особлива книжка на тему «{topic.label}»</h2>
          {themeSections(id).map((s) => (
            <div key={s.title}>
              <h3>{s.title}</h3>
              <p>
                {s.text}
                {s.link && (
                  <>
                    {" "}
                    {s.link.before} <Link href={s.link.href}>{s.link.label}</Link>.
                  </>
                )}
              </p>
            </div>
          ))}
          <StoryPreview
            text={sample}
            more={`Що буде далі — вирішуєте ви. Оберіть ім'я, вік і мораль, і ми напишемо продовження саме для вашої дитини: з її улюбленими іграшками, рідними й пригодами, яких немає в жодній іншій книжці.`}
            href={`/stvoryty?tema=${id}`}
          />
        </div>
      </Section>

      <HowItWorks />
      <Perks title="Створіть неповторну книжку саме для своєї дитини" />
      <Reviews tint />

      <Section>
        <SectionHead title="Книжки на будь-яку тему й нагоду" />
        <div className="topic-chips">
          {category.topics
            .filter((x) => x.id !== id)
            .map((x) => (
              <Link key={x.id} href={`/temy/${x.id}`} className="topic-chip is-plain">
                {x.label}
              </Link>
            ))}
          <Link href="/temy" className="topic-chip is-accent">
            Усі теми
          </Link>
        </div>
      </Section>

      {ideas.length > 0 && (
        <Section tint>
          <SectionHead title={`Ідеї для книжки на тему «${topic.label}»`} />
          <LinkCards items={ideas.map((i) => ({ href: `/idei/${i.slug}`, title: i.title, emoji: i.emoji, image: `tema/${i.topic}` }))} />
        </Section>
      )}

      {names.length > 0 && (
        <Section>
          <SectionHead title={`Книжки на тему «${topic.label}» за іменами`} />
          <div className="topic-chips">
            {names.map((n) => (
              <Link key={n.slug} href={`/imena/${n.slug}`} className="topic-chip is-plain">
                {n.name} <span aria-hidden="true">{n.emoji}</span>
              </Link>
            ))}
            <Link href="/imena" className="topic-chip is-accent">
              Усі імена
            </Link>
          </div>
        </Section>
      )}

      <FinalCta
        title="Готові до власної історії?"
        text="Створіть неповторну книжку, де головний герой — ваша дитина. Почніть з е-книги, а згодом замовте друковану, яку збережете назавжди."
        href={`/stvoryty?tema=${id}`}
      />
    </>
  );
}
