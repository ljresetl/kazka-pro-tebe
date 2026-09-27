import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import BookReader from "@/components/BookReader";
import PrintBook, { PrintButtons } from "@/components/PrintBook";
import SeoText from "@/components/SeoText";
import ShareButtons from "@/components/ShareButtons";
import { getBook, LIBRARY } from "@/lib/library";
import { jsonLd, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";

export function generateStaticParams() {
  return LIBRARY.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(props: PageProps<"/biblioteka/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const book = getBook(slug);
  if (!book) return {};
  return pageMeta({
    title: `${book.title} — казка читати онлайн і роздрукувати`,
    description: `${book.summary} ${book.about}`.slice(0, 160),
    path: `/biblioteka/${book.slug}`,
    type: "book",
  });
}

export default async function LibraryBookPage(props: PageProps<"/biblioteka/[slug]">) {
  const { slug } = await props.params;
  const book = getBook(slug);
  if (!book) notFound();
  const url = abs(`/biblioteka/${book.slug}`);
  const others = LIBRARY.filter((b) => b.slug !== book.slug);

  const bookLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    inLanguage: "uk",
    bookFormat: "https://schema.org/EBook",
    numberOfPages: book.pages.length,
    genre: "Дитяча казка",
    isAccessibleForFree: true,
    abstract: book.about,
    publisher: { "@type": "Organization", name: SITE.name },
    url,
  };
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Безкоштовні казки", item: abs("/biblioteka") },
      { "@type": "ListItem", position: 3, name: book.title, item: url },
    ],
  };

  return (
    <div className="print-root">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(bookLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(crumbsLd)} />
      <div className="wrap book-page">
        <div className="back-row" style={{ paddingTop: 0, marginBottom: 12 }}>
          <BackLink fallback="/biblioteka" label="Усі казки" />
        </div>
        <nav aria-label="Хлібні крихти">
          <ol className="crumbs">
            <li>
              <Link href="/">Головна</Link>
            </li>
            <li>
              <Link href="/biblioteka">Безкоштовні казки</Link>
            </li>
            <li aria-current="page">{book.title}</li>
          </ol>
        </nav>
        <div className="book-head">
          <div>
            <h1>{book.title}</h1>
            <p className="book-meta">
              <span>{book.author}</span>
              <span className="tag">{book.ages}</span>
            </p>
          </div>
        </div>

        <BookReader title={book.title} dedication={book.about} cover={book.cover} pages={book.pages} />

        <div className="book-actions">
          <div className="panel">
            <h2>Друк безкоштовний</h2>
            <p>Роздрукуйте казку або розмальовку на звичайному принтері A4.</p>
            <PrintButtons />
          </div>
          <div className="panel">
            <h2>А тепер — казка про вашу дитину</h2>
            <p>З ім&apos;ям вашої дитини в головній ролі. Перегляд безкоштовний.</p>
            <Link href="/stvoryty" className="btn btn-primary">
              Створити казку
            </Link>
            <div style={{ marginTop: 24 }}>
              <ShareButtons url={url} title={book.title} text={`Казка «${book.title}» — читати й друкувати безкоштовно:`} />
            </div>
          </div>
        </div>
      </div>

      <SeoText title={`«${book.title}»: про що казка`}>
        <div>
          <p>{book.about}</p>
          <p>
            Рекомендований вік — {book.ages}. Казка має {book.pages.length} сторінок; кожну зручно читати за хвилину, а
            всю — за один вечір.
          </p>
        </div>
        <div>
          <h3>Читайте також</h3>
          <ul>
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/biblioteka/${o.slug}`}>{o.title}</Link> — {o.summary}
              </li>
            ))}
          </ul>
        </div>
      </SeoText>

      <PrintBook title={book.title} dedication={book.about} cover={book.cover} pages={book.pages} />
    </div>
  );
}
