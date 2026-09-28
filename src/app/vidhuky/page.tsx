import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, FinalCta } from "@/components/seo/Blocks";
import { REVIEWS } from "@/lib/reviews";
import { jsonLd, pageMeta } from "@/lib/seo";
import { asset, SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Відгуки про персональні дитячі книжки",
  description: `Справжні фото й враження родин, які створили персональну дитячу книжку в ${SITE.name}.`,
  path: "/vidhuky",
});

export default function ReviewsPage() {
  const count = REVIEWS.length;
  const rating = count ? REVIEWS.reduce((s, r) => s + r.rating, 0) / count : 0;
  const ld =
    count > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Персональна дитяча книжка",
          brand: { "@type": "Brand", name: SITE.name },
          aggregateRating: { "@type": "AggregateRating", ratingValue: rating.toFixed(1), reviewCount: count },
          review: REVIEWS.slice(0, 20).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            datePublished: r.date,
            reviewBody: r.text,
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
          })),
        }
      : null;
  const write = SITE.email ? `mailto:${SITE.email}?subject=${encodeURIComponent("Відгук про книжку")}` : "/kontakty";

  return (
    <>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />}
      <Crumbs items={[{ name: "Відгуки", path: "/vidhuky" }]} />
      <section className="seo-hero">
        <div className="wrap">
          <h1>Покупці про свою персональну дитячу книжку</h1>
          {count > 0 ? (
            <>
              <p className="seo-hero-lead">Справжні фото й реакції родин на їхні персональні дитячі книжки.</p>
              <p className="review-summary">
                <span className="review-stars">{"★".repeat(Math.round(rating))}</span> {rating.toFixed(1)}/5 з {count}{" "}
                відгуків
              </p>
            </>
          ) : (
            <p className="seo-hero-lead">
              {SITE.name} щойно відкрилася. Тут будуть лише справжні відгуки й фото від родин, які отримали свої книжки.
              Створили книжку? Розкажіть, як дитина її зустріла, — ваш відгук може стати першим.
            </p>
          )}
          <nav className="topic-chips" aria-label="Фільтр відгуків">
            <span className="topic-chip is-plain is-active">Усі</span>
            <span className="topic-chip is-plain">📷 З фото ({REVIEWS.filter((r) => r.photo).length})</span>
          </nav>
          {count > 0 && (
            <ul className="reviews reviews-page">
              {REVIEWS.map((r) => (
                <li key={r.name + r.date} className="review">
                  {r.photo && (
                    // eslint-disable-next-line @next/next/no-img-element -- фото покупців різних розмірів
                    <img src={asset(r.photo)} alt={`Фото книжки від ${r.name}`} loading="lazy" className="review-photo" />
                  )}
                  <span className="review-stars" aria-label={`Оцінка ${r.rating} з 5`}>
                    {"★".repeat(r.rating)}
                  </span>
                  <p>«{r.text}»</p>
                  <h2 className="review-name">{r.name}</h2>
                </li>
              ))}
            </ul>
          )}
          <p className="section-more">
            <a href={write} className="btn btn-primary">
              Залишити відгук
            </a>{" "}
            <Link href="/pryklady" className="btn btn-ghost">
              Подивитися приклади книжок
            </Link>
          </p>
        </div>
      </section>
      <FinalCta title="Створіть неповторну історію для своєї дитини" />
    </>
  );
}
