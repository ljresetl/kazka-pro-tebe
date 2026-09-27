import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import { OrnamentRule } from "@/components/Ornament";
import SeoText from "@/components/SeoText";
import { formatDate, POSTS } from "@/lib/blog";
import { jsonLd, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Блог про українські казки: розбори, мораль, питання для дітей",
  description:
    "Розбираємо українські народні казки: про що вони, чого вчать і як обговорити їх із дитиною. Нові статті щотижня.",
  path: "/blog",
});

const blogLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: `Блог ${SITE.name}`,
  url: abs("/blog"),
  inLanguage: "uk",
  blogPost: POSTS.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    url: abs(`/blog/${p.slug}`),
    datePublished: p.date,
  })),
};

export default function BlogPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(blogLd)} />
      <div className="wrap" style={{ paddingBottom: 32 }}>
        <div className="back-row">
          <BackLink fallback="/" />
        </div>
        <div className="page-top">
          <OrnamentRule className="ornament-rule" />
          <h1>Блог про українські казки</h1>
          <p>Розбираємо народні казки: про що вони насправді, чого вчать і як поговорити про них із дитиною.</p>
        </div>

        <div className="post-list">
          {POSTS.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card">
              <p className="post-meta">
                <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readMinutes} хв читання
              </p>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <span className="post-more">Читати розбір</span>
            </Link>
          ))}
        </div>
      </div>

      <SeoText title="Навіщо розбирати казки з дитиною">
        <div>
          <p>
            Казка — не лише розвага перед сном. Коли дорослий після читання ставить кілька простих запитань, дитина
            вчиться переказувати, пояснювати вчинки героїв і робити власні висновки. Це основа читацької грамотності,
            яка знадобиться в школі.
          </p>
        </div>
        <div>
          <p>
            У кожному розборі ми пояснюємо сюжет і мораль казки, підказуємо, як читати її цікавіше, і наприкінці даємо
            запитання для розмови. Усі казки, про які пишемо, можна безкоштовно прочитати в нашій{" "}
            <Link href="/biblioteka">бібліотеці</Link>.
          </p>
        </div>
      </SeoText>
    </>
  );
}
