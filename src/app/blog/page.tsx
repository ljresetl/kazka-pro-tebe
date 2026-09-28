import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import { OrnamentRule } from "@/components/Ornament";
import SeoText from "@/components/SeoText";
import SlotImage from "@/components/SlotImage";
import { blogImage, formatDate, POSTS } from "@/lib/blog";
import { jsonLd, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Блог про дитячі книжки",
  description:
    "Статті для батьків про дитячі книжки й читання: як обрати книжку за віком, розвивати уяву, говорити про почуття, які подарунки обрати, а також розбори українських казок.",
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
          <h1>Блог про дитячі книжки</h1>
          <p>Поради батькам про читання, подарунки й розвиток дитини, а також розбори українських народних казок.</p>
        </div>

        <div className="post-list">
          {POSTS.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card">
              <SlotImage id={`blog/${p.slug}`} slot={blogImage(p)} alt="" detail="none" className="post-card-img" sizes="(min-width: 900px) 360px, 92vw" />
              <p className="post-meta">
                <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readMinutes} хв читання
              </p>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <span className="post-more">Читати далі →</span>
            </Link>
          ))}
        </div>
      </div>

      <SeoText title="Навіщо читати й обговорювати книжки з дитиною">
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
