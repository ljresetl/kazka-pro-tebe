import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import { BookQuality, Crumbs, Faq, FinalCta, Reviews, Section, SectionHead } from "@/components/seo/Blocks";
import SlotImage from "@/components/SlotImage";
import { EBOOK, EBOOK_FEATURES, EXTRAS, EXTRAS_DISCOUNT, HARDCOVER, HARDCOVER_FEATURES, PRICE_FAQ, withDiscount } from "@/lib/offer";
import { formatUah } from "@/lib/prices";
import { jsonLd, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Ціни на персональну дитячу книжку",
  description: `Е-книга — ${formatUah(EBOOK)}, друкована книжка у твердій обкладинці — ${formatUah(HARDCOVER)} (ціна е-книги вже врахована). Доставка безкоштовна від двох книжок.`,
  path: "/tsiny",
});

const offerLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Персональна дитяча книжка",
  brand: { "@type": "Brand", name: SITE.name },
  offers: [
    { "@type": "Offer", name: "Е-книга", price: EBOOK, priceCurrency: "UAH", url: abs("/tsiny") },
    { "@type": "Offer", name: "Книжка у твердій обкладинці", price: HARDCOVER, priceCurrency: "UAH", url: abs("/tsiny") },
  ],
};

export default function PricesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(offerLd)} />
      <Crumbs items={[{ name: "Ціни", path: "/tsiny" }]} />
      <section className="seo-hero">
        <div className="wrap">
          <h1>Ціни на персональну дитячу книжку</h1>
          <p className="seo-hero-lead">
            Спершу ви отримуєте персональну дитячу книжку як е-книгу. Подобається результат? Тоді замовте гарну
            версію у твердій обкладинці — подарунок, який дитина берегтиме завжди.
          </p>
          <div className="price-flow">
            <div className="price-card">
              <h2>Е-книга</h2>
              <p>Персональна цифрова дитяча книжка, доступна одразу на вашому пристрої.</p>
              <p className="price-card-amount">{formatUah(EBOOK)}</p>
              <p className="price-card-note">Цю суму ми зарахуємо в ціну книжки у твердій обкладинці.</p>
              <ul>
                {EBOOK_FEATURES.map((f) => (
                  <li key={f}>
                    <Check size={18} aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/stvoryty" className="btn btn-primary">
                Створити дитячу книжку
              </Link>
            </div>
            <div className="price-arrow" aria-hidden="true">
              <ArrowRight className="only-wide" size={32} />
              <ArrowDown className="only-narrow" size={32} />
            </div>
            <div className="price-card is-main">
              <h2>Тверда обкладинка</h2>
              <p>Дитяча книжка, надрукована на якісних матеріалах, — гарна пам&apos;ять на роки.</p>
              <p className="price-card-amount">{formatUah(HARDCOVER)}</p>
              <p className="price-card-note">Ваша оплата за е-книгу ({formatUah(EBOOK)}) вже врахована в цій ціні.</p>
              <ul>
                {HARDCOVER_FEATURES.map((f) => (
                  <li key={f}>
                    <Check size={18} aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/moi-kazky" className="btn btn-ghost">
                Замовити е-книгу в обкладинці
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BookQuality />

      <Section tint>
        <SectionHead
          title="Ще більше можливостей з вашою книжкою"
          lead={`Після створення книжки можна замовити й ці персональні вироби з ілюстраціями — зі знижкою ${EXTRAS_DISCOUNT}%, якщо замовляєте разом із книжкою.`}
        />
        <ul className="extras">
          {EXTRAS.map((e) => (
            <li key={e.id} className="extra">
              <SlotImage id={`dodatky/${e.id}`} alt={e.name} detail="label" sizes="(min-width: 900px) 260px, 45vw" />
              <h3>{e.name}</h3>
              <p>{e.text}</p>
              <p className="extra-price">
                {e.from && <span>від </span>}
                <s>{formatUah(e.price)}</s> <strong>{formatUah(withDiscount(e.price))}</strong>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Faq items={PRICE_FAQ} title="Часті запитання" />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Link href="/dopomoha" className="btn btn-ghost">
            Усі часті запитання →
          </Link>
        </div>
      </section>
      <Reviews tint />
      <FinalCta />
    </>
  );
}
