import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import BookReader from "@/components/BookReader";
import PrintBook, { PrintButtons } from "@/components/PrintBook";
import { BookQuality, Faq, Perks } from "@/components/seo/Blocks";
import SlotImage from "@/components/SlotImage";
import { EXAMPLES, exampleParams, getExample } from "@/lib/examples";
import { GENERAL_FAQ } from "@/lib/general-faq";
import { jsonLd, OG_IMAGE, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";

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
    description: `${ex.summary} Читайте повністю онлайн: книжка на 14 сторінок, для дітей ${ex.ageLabel}. Створіть таку саму казку для своєї дитини.`,
    path: `/pryklady/${ex.slug}`,
    image,
    type: "book",
  });
}

export default async function ExamplePage(props: PageProps<"/pryklady/[slug]">) {
  const { slug } = await props.params;
  const ex = getExample(slug);
  if (!ex) notFound();

  const index = EXAMPLES.findIndex((e) => e.slug === ex.slug);
  const next = EXAMPLES.at((index + 1) % EXAMPLES.length)!;
  const url = abs(`/pryklady/${ex.slug}`);

  const bookLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: ex.title,
    inLanguage: "uk",
    bookFormat: "https://schema.org/EBook",
    numberOfPages: 26,
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
    <div className="print-root">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(bookLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(crumbsLd)} />
      <div className="wrap book-page">
        <div className="back-row" style={{ paddingTop: 0, marginBottom: 12 }}>
          <BackLink fallback="/pryklady" label="Усі приклади" />
        </div>
        <p className="ex-kicker">Приклад персональної дитячої книжки:</p>
        <h1 className="ex-title">{ex.title}</h1>

        <div className="ex-panel">
          <div className="ex-show-photos">
            <h2 className="ex-show-h">Використані фото</h2>
            <SlotImage id={`pryklad-foto/${ex.slug}`} alt={`Фото, з якого намальовано героя: ${ex.childName}`} detail="none" sizes="200px" />
            <span className="ex-show-arrow" aria-hidden="true">
              ↘
            </span>
          </div>
          <div className="ex-show-params">
            <h2 className="ex-show-h">Параметри історії</h2>
            <dl className="ex-param-table">
              {exampleParams(ex)
                .filter(([k]) => k !== "Назва")
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}:</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              <div>
                <dt>Історія:</dt>
                <dd>{ex.summary}</dd>
              </div>
            </dl>
          </div>
          <div className="ex-panel-actions">
            <PrintButtons coloring={false} note="Приклад можна зберегти як PDF: у вікні друку оберіть «Зберегти як PDF»." label="Завантажити приклад" />
            <Link href={`/stvoryty?theme=${ex.theme}`} className="btn btn-primary">
              Створити власну дитячу книжку
            </Link>
          </div>
        </div>

        <BookReader
          title={ex.title}
          dedication={ex.dedication}
          cover={ex.cover}
          coverImage={ex.coverImage}
          pages={ex.pages}
        />
        <p style={{ marginTop: 16 }}>
          Далі: «{next.title}» — {next.childName}, {next.ageLabel}.{" "}
          <Link href={`/pryklady/${next.slug}`}>Читати наступний приклад</Link>
        </p>
      </div>

      <BookQuality />
      <Perks title="Створіть неповторну книжку саме для своєї дитини" />
      <Faq items={GENERAL_FAQ} tint />

      <PrintBook title={ex.title} dedication={ex.dedication} cover={ex.cover} coverImage={ex.coverImage} pages={ex.pages} />
    </div>
  );
}
