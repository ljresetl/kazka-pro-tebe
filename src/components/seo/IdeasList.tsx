import Link from "next/link";
import { AgeChips, Crumbs, LinkCards, Perks, PopularNames, SeoOutro, ThemeGrid } from "@/components/seo/Blocks";
import { IDEA_TAGS, type Idea } from "@/lib/pages/ideas";

/** Список ідей із фільтром категорій і сторінками (спільний для /idei, сторінок і категорій). */
export default function IdeasList({
  title,
  lead,
  ideas,
  activeTag,
  page,
  pages,
  crumbs,
}: {
  title: string;
  lead: string;
  ideas: Idea[];
  activeTag?: string;
  page?: number;
  pages?: number;
  crumbs: { name: string; path: string }[];
}) {
  const main = IDEA_TAGS.filter((t) => t.main || t.id === activeTag);
  return (
    <>
      <Crumbs items={crumbs} />
      <section className="seo-hero">
        <div className="wrap">
          <h1>{title}</h1>
          <p className="seo-hero-lead">{lead}</p>
          <nav className="topic-chips idea-filter" aria-label="Категорії ідей">
            <Link href="/idei" className={`topic-chip is-plain ${!activeTag ? "is-active" : ""}`} aria-current={!activeTag ? "page" : undefined}>
              Усі категорії
            </Link>
            {main.map((t) => (
              <Link
                key={t.id}
                href={`/idei/katehoriia/${t.id}`}
                className={`topic-chip is-plain ${activeTag === t.id ? "is-active" : ""}`}
                aria-current={activeTag === t.id ? "page" : undefined}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <LinkCards items={ideas.map((i) => ({ href: `/idei/${i.slug}`, title: i.title, emoji: i.emoji, sub: i.short, image: `tema/${i.topic}` }))} />
          {pages && pages > 1 && page && (
            <nav className="pager" aria-label="Сторінки">
              {page > 1 && (
                <Link href={page === 2 ? "/idei" : `/idei/storinka/${page - 1}`} rel="prev">
                  ← Назад
                </Link>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={n === 1 ? "/idei" : `/idei/storinka/${n}`} aria-current={n === page ? "page" : undefined}>
                  {n}
                </Link>
              ))}
              {page < pages && (
                <Link href={`/idei/storinka/${page + 1}`} rel="next">
                  Далі →
                </Link>
              )}
            </nav>
          )}
          <details className="more-tags">
            <summary>Усі категорії ідей ({IDEA_TAGS.length})</summary>
            <div className="topic-chips">
              {IDEA_TAGS.map((t) => (
                <Link key={t.id} href={`/idei/katehoriia/${t.id}`} className="topic-chip is-plain">
                  {t.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </section>
      <ThemeGrid />
      <AgeChips />
      <PopularNames seed={`idei-${activeTag ?? page ?? ""}`} tint />
      <Perks title="Створіть неповторну книжку саме для своєї дитини" />
      <SeoOutro
        title="Від першої ідеї до книжки, яка справді про вашу дитину"
        parts={[
          {
            h: "Як обрати тему, що підійде",
            p: [
              "Почніть із того, у що дитина грається найчастіше: динозаври, принцеси, машинки чи космос. Тема, яка вже живе в її іграх, миттєво захоплює й у книжці.",
              "Якщо попереду важлива подія — садочок, братик, переїзд чи перший дзвоник, — оберіть історію саме про неї. Так книжка стане підтримкою, а не лише розвагою.",
            ],
          },
          {
            h: "Від натхнення до власної книжки",
            p: [
              "Ідеї на цій сторінці — лише початок. У конструкторі ви додаєте ім'я, вік, захоплення й рідних, обираєте мораль, стиль ілюстрацій і шрифт, а ми пишемо історію саме для вашої дитини.",
              "Перші сторінки видно одразу й безкоштовно. Тексти можна змінити, а готову книжку — зберегти як е-книгу чи замовити у твердій обкладинці.",
            ],
          },
        ]}
      />
    </>
  );
}
