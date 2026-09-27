import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookReader from "@/components/BookReader";
import PrintBook, { PrintButtons } from "@/components/PrintBook";
import { getBook, LIBRARY } from "@/lib/library";

export function generateStaticParams() {
  return LIBRARY.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(props: PageProps<"/biblioteka/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const book = getBook(slug);
  return book ? { title: book.title, description: book.summary } : {};
}

export default async function LibraryBookPage(props: PageProps<"/biblioteka/[slug]">) {
  const { slug } = await props.params;
  const book = getBook(slug);
  if (!book) notFound();

  return (
    <div className="print-root">
      <div className="book-page">
        <div className="book-head">
          <div>
            <h1 className="riso-type">{book.title}</h1>
            <p className="book-meta">
              {book.author} · {book.ages}
            </p>
          </div>
          <Link href="/biblioteka" className="btn btn-ghost">
            Усі казки
          </Link>
        </div>

        <BookReader title={book.title} dedication={book.summary} cover={book.cover} pages={book.pages} />

        <div className="book-actions">
          <div className="panel">
            <h2>Друк безкоштовний</h2>
            <p>Роздрукуйте казку або розмальовку на звичайному принтері A4.</p>
            <PrintButtons />
          </div>
          <div className="panel">
            <h2>А тепер — казка про вашу дитину</h2>
            <p>Такою ж, але з іменем вашої дитини в головній ролі. Перегляд безкоштовний.</p>
            <Link href="/stvoryty" className="btn btn-primary">
              Створити казку
            </Link>
          </div>
        </div>
      </div>

      <PrintBook title={book.title} dedication={book.summary} cover={book.cover} pages={book.pages} />
    </div>
  );
}
