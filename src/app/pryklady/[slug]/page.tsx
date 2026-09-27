import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookReader from "@/components/BookReader";
import { EXAMPLES, getExample } from "@/lib/examples";
import { yearsWord } from "@/lib/template-story";
import { getTheme } from "@/lib/themes";

export function generateStaticParams() {
  return EXAMPLES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/pryklady/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const ex = getExample(slug);
  return ex ? { title: `${ex.title} — приклад казки` } : {};
}

// Приклад читається лише на екрані: кнопок друку й завантаження тут немає,
// а при спробі друку сторінка буде порожньою (див. @media print у globals.css).
export default async function ExamplePage(props: PageProps<"/pryklady/[slug]">) {
  const { slug } = await props.params;
  const ex = getExample(slug);
  if (!ex) notFound();

  const theme = getTheme(ex.theme);
  const index = EXAMPLES.findIndex((e) => e.slug === ex.slug);
  const next = EXAMPLES.at((index + 1) % EXAMPLES.length)!;

  return (
    <div className="book-page">
      <div className="book-head">
        <div>
          <h1 className="riso-type">{ex.title}</h1>
          <p className="book-meta">
            Приклад · {ex.childName}, {yearsWord(ex.age)} · {theme.label} · допомагає {ex.trait}
          </p>
        </div>
        <Link href="/pryklady" className="btn btn-ghost">
          Усі приклади
        </Link>
      </div>

      <BookReader title={ex.title} dedication={ex.dedication} cover={ex.cover} coverImage={ex.coverImage} pages={ex.pages} />

      <div className="book-actions">
        <div className="panel">
          <h2>Хочете таку казку про свою дитину?</h2>
          <p>Вкажіть ім&apos;я — і за дві хвилини отримаєте власну казку в пригоді «{theme.label}». Перегляд безкоштовний.</p>
          <Link href={`/stvoryty?theme=${ex.theme}`} className="btn btn-primary">
            Створити свою казку
          </Link>
        </div>
        <div className="panel">
          <h2>Наступний приклад</h2>
          <p>
            «{next.title}» — {next.childName}, {yearsWord(next.age)}.
          </p>
          <Link href={`/pryklady/${next.slug}`} className="btn btn-ghost">
            Читати далі
          </Link>
        </div>
      </div>
    </div>
  );
}
