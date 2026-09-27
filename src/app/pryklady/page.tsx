import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import BackLink from "@/components/BackLink";
import ExampleCard from "@/components/ExampleCard";
import { OrnamentRule } from "@/components/Ornament";
import SeoText from "@/components/SeoText";
import { EXAMPLES } from "@/lib/examples";
import { jsonLd, pageMeta } from "@/lib/seo";
import { abs } from "@/lib/site";
import ExamplesList from "./ExamplesList";

export const metadata: Metadata = pageMeta({
  title: "Приклади іменних казок для дітей 3–7 років",
  description:
    "Десять прикладів персональних казок українською: космос, ліс, море, динозаври, замок і лука. Читайте онлайн і подивіться, якою буде казка про вашу дитину.",
  path: "/pryklady",
});

const listLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Приклади іменних казок",
  itemListElement: EXAMPLES.map((e, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: abs(`/pryklady/${e.slug}`),
    name: e.title,
  })),
};

export default function ExamplesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(listLd)} />
      <div className="wrap" style={{ paddingBottom: 32 }}>
        <div className="back-row">
          <BackLink fallback="/" />
        </div>
        <div className="page-top">
          <OrnamentRule className="ornament-rule" />
          <h1>Приклади казок</h1>
          <p>
            Так виглядають казки, які ми створюємо: той самий сюжет отримаєте й ви, лише з іменем вашої дитини.
            Читайте прямо тут.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="card-grid">
              {EXAMPLES.map((e) => (
                <ExampleCard key={e.slug} e={e} />
              ))}
            </div>
          }
        >
          <ExamplesList />
        </Suspense>

        <div className="cta-band" style={{ marginTop: 40 }}>
          <div>
            <h2>Сподобався приклад?</h2>
            <p>Створіть таку саму казку зі своїм героєм — перегляд безкоштовний.</p>
          </div>
          <Link href="/stvoryty" className="btn btn-primary">
            Створити казку
          </Link>
        </div>
      </div>

      <SeoText title="Як обрати казку для дитини">
        <div>
          <p>
            Для малюків 2–3 років найкраще працюють спокійні сюжети з повторами: сумний Місяць, мушля, що співає, або
            зірочка, яку треба повернути на небо. Короткі речення й знайомі образи — дім, вікно, ліжечко — допомагають
            заснути без сліз.
          </p>
          <p>
            Дітям 4–5 років подобаються пригоди з маленьким випробуванням: знайти маму диплодока, розгадати знаки на
            пеньку чи помиритися з хмаркою. Тут з&apos;являються нові слова й трохи довший текст на сторінці.
          </p>
        </div>
        <div>
          <p>
            Для 6–8 років обирайте сюжети, де герой діє сам і довше: піднятися на маяк під час шторму чи допомогти
            дракону, який боїться темряви. Такі казки діти часто вже читають самостійно.
          </p>
          <p>
            Звертайте увагу й на рису характеру. Якщо дитина соромиться — оберіть казку про сміливість. Якщо
            поспішає — про терплячість. Казка не повчає напряму, але показує, як саме ця якість рятує ситуацію.
          </p>
        </div>
      </SeoText>
    </>
  );
}
