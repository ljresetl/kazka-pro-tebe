import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import BookReader from "@/components/BookReader";
import SeoText from "@/components/SeoText";
import ShareButtons from "@/components/ShareButtons";
import { EXAMPLES, getExample } from "@/lib/examples";
import { jsonLd, OG_IMAGE, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";
import { getTheme } from "@/lib/themes";

export function generateStaticParams() {
  return EXAMPLES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/pryklady/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const ex = getExample(slug);
  if (!ex) return {};
  const image = ex.coverImage
    ? { url: `${SITE.url}${ex.coverImage.src.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", "")}`, width: ex.coverImage.width, height: ex.coverImage.height, alt: ex.title }
    : OG_IMAGE;
  return pageMeta({
    title: `${ex.title} — приклад іменної казки`,
    description: `${ex.summary} Читайте повністю онлайн: ${ex.pages.length} сторінок, для дітей ${ex.ageLabel}. Створіть таку саму казку для своєї дитини.`,
    path: `/pryklady/${ex.slug}`,
    image,
    type: "book",
  });
}

export default async function ExamplePage(props: PageProps<"/pryklady/[slug]">) {
  const { slug } = await props.params;
  const ex = getExample(slug);
  if (!ex) notFound();

  const theme = getTheme(ex.theme);
  const index = EXAMPLES.findIndex((e) => e.slug === ex.slug);
  const next = EXAMPLES.at((index + 1) % EXAMPLES.length)!;
  const url = abs(`/pryklady/${ex.slug}`);

  const bookLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: ex.title,
    inLanguage: "uk",
    bookFormat: "https://schema.org/EBook",
    numberOfPages: ex.pages.length,
    genre: "Дитяча казка",
    audience: { "@type": "PeopleAudience", suggestedMinAge: Math.max(2, ex.age - 1), suggestedMaxAge: ex.age + 2 },
    abstract: ex.summary,
    publisher: { "@type": "Organization", name: SITE.name },
    url,
  };
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Приклади", item: abs("/pryklady") },
      { "@type": "ListItem", position: 3, name: ex.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(bookLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(crumbsLd)} />
      <div className="wrap book-page">
        <div className="back-row" style={{ paddingTop: 0, marginBottom: 12 }}>
          <BackLink fallback="/pryklady" label="Усі приклади" />
        </div>
        <nav aria-label="Хлібні крихти">
          <ol className="crumbs">
            <li>
              <Link href="/">Головна</Link>
            </li>
            <li>
              <Link href="/pryklady">Приклади</Link>
            </li>
            <li aria-current="page">{ex.title}</li>
          </ol>
        </nav>
        <div className="book-head">
          <div>
            <h1>{ex.title}</h1>
            <p className="book-meta">
              <span className="tag">{ex.ageLabel}</span>
              <span className="tag is-mint">{theme.label}</span>
              <span className="tag is-sun">{ex.trait}</span>
            </p>
          </div>
        </div>

        <BookReader
          title={ex.title}
          dedication={ex.dedication}
          cover={ex.cover}
          coverImage={ex.coverImage}
          pages={ex.pages}
        />

        <div className="book-actions">
          <div className="panel">
            <h2>Таку саму казку — для вашої дитини</h2>
            <p>
              Вкажіть ім&apos;я — і за хвилину отримаєте власну казку в пригоді «{theme.label}». Перегляд
              безкоштовний.
            </p>
            <Link href={`/stvoryty?theme=${ex.theme}`} className="btn btn-primary">
              Створити свою казку
            </Link>
          </div>
          <div className="panel">
            <ShareButtons
              url={url}
              title={ex.title}
              text={`Казка «${ex.title}» — подивіться, які іменні казки бувають:`}
              label="Поділитися прикладом"
            />
            <p style={{ margin: "20px 0 8px" }}>
              Далі: «{next.title}» — {next.childName}, {next.ageLabel}.
            </p>
            <Link href={`/pryklady/${next.slug}`} className="btn btn-ghost btn-small">
              Читати наступний приклад
            </Link>
          </div>
        </div>
      </div>

      <SeoText title={`Про казку «${ex.title}»`}>
        <div>
          <p>{ex.summary}</p>
          <p>
            Це приклад із нашого каталогу: так виглядає казка в пригоді «{theme.label.toLowerCase()}» для дитини{" "}
            {ex.ageLabel}. Головна думка — {ex.trait}: саме ця риса допомагає героєві впоратися з випробуванням у
            кульмінації історії.
          </p>
        </div>
        <div>
          <p>
            У вашій версії замість імені «{ex.childName}» буде ім&apos;я вашої дитини, а слова зміняться відповідно до
            того, хлопчик це чи дівчинка. Звернення на першій сторінці ви напишете самі.
          </p>
          <p>
            Казку з {ex.pages.length} сторінок можна читати з екрана, роздрукувати як PDF на папері A4 або замовити
            книжкою в м&apos;якій палітурці.
          </p>
        </div>
      </SeoText>
    </>
  );
}
