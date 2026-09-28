import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookQuality, Crumbs, FinalCta, HowItWorks, LinkCards, Section, SectionHead } from "@/components/seo/Blocks";
import StartBox from "@/components/seo/StartBox";
import { getIdea, getTag, IDEAS, relatedIdeas } from "@/lib/pages/ideas";
import { popularNames } from "@/lib/pages/names";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return IDEAS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata(props: PageProps<"/idei/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const idea = getIdea(slug);
  if (!idea) return {};
  return pageMeta({ title: `${idea.title} — ідея для персональної дитячої книжки`, description: `${idea.short} ${idea.why}`, path: `/idei/${slug}` });
}

export default async function IdeaPage(props: PageProps<"/idei/[slug]">) {
  const { slug } = await props.params;
  const idea = getIdea(slug);
  if (!idea) notFound();
  const href = `/stvoryty?tema=${idea.topic}`;
  const names = popularNames(slug, 7);

  return (
    <>
      <Crumbs items={[{ name: "Ідеї для книжок", path: "/idei" }, { name: idea.title, path: `/idei/${slug}` }]} />
      <section className="seo-hero">
        <div className="wrap idea-grid">
          <article className="idea-text">
            <h1>
              {idea.title} <span aria-hidden="true">{idea.emoji}</span>
            </h1>
            <ul className="idea-tags">
              {idea.tags.map((t) => (
                <li key={t}>
                  <Link href={`/idei/katehoriia/${t}`}>{getTag(t)?.label}</Link>
                </li>
              ))}
            </ul>
            <h2>Ідея для дитячої книжки</h2>
            <p className="seo-hero-lead">{idea.short}</p>
            <p>{idea.long}</p>
            <h3>Уривок історії</h3>
            <blockquote className="idea-sample">«{idea.sample}»</blockquote>
            <h2>Варіанти назви книжки</h2>
            <ul className="idea-titles">
              {idea.titles.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
          <StartBox image={`tema-velyka/${idea.topic}`} title="Створіть власну дитячу книжку" cta="Створити дитячу книжку" href={href} />
        </div>
      </section>

      <Section tint>
        <SectionHead title="Навіщо персональна дитяча книжка?" lead={idea.why} />
      </Section>
      <HowItWorks title="Як це працює" />
      <BookQuality />

      <Section tint>
        <SectionHead title="Інші ідеї для дитячих книжок" />
        <LinkCards items={relatedIdeas(idea).map((i) => ({ href: `/idei/${i.slug}`, title: i.title, emoji: i.emoji, image: `tema/${i.topic}` }))} />
        <p className="section-more">
          <Link href="/idei" className="btn btn-ghost">
            Усі ідеї
          </Link>
        </p>
      </Section>

      <Section>
        <SectionHead title="Улюблені імена для дитячих книжок" />
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

      <FinalCta href={href} />
    </>
  );
}
