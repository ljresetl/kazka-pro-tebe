import type { Metadata } from "next";
import { Suspense } from "react";
import { Crumbs, Perks, Reviews } from "@/components/seo/Blocks";
import ExampleShowcase from "@/components/seo/ExampleShowcase";
import { EXAMPLES } from "@/lib/examples";
import { jsonLd, pageMeta } from "@/lib/seo";
import { abs } from "@/lib/site";
import ExamplesList from "./ExamplesList";

export const metadata: Metadata = pageMeta({
  title: "Приклади персональних дитячих книжок",
  description:
    "Приклади персональних дитячих книжок українською: фото, з яких намальовано героїв, параметри історії й повний текст. Подивіться, якою буде книжка про вашу дитину.",
  path: "/pryklady",
});

const listLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Приклади персональних дитячих книжок",
  itemListElement: EXAMPLES.map((e, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: abs(`/pryklady/${e.slug}`),
    name: e.title,
  })),
};

export default function ExamplesPage() {
  const cards = Object.fromEntries(EXAMPLES.map((e) => [e.slug, <ExampleShowcase key={e.slug} e={e} />]));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(listLd)} />
      <Crumbs items={[{ name: "Приклади", path: "/pryklady" }]} />
      <section className="seo-hero">
        <div className="wrap">
          <h1 style={{ textAlign: "center" }}>Приклади персональних дитячих книжок</h1>
          <p className="seo-hero-lead" style={{ textAlign: "center", marginInline: "auto" }}>
            Цікаво, яким може бути персональна дитяча книжка? Перегляньте наші приклади й подивіться, як кожна дитина
            може стати зіркою неповторної чарівної пригоди.
          </p>
          <Suspense fallback={<div className="ex-shows">{EXAMPLES.map((e) => cards[e.slug])}</div>}>
            <ExamplesList cards={cards} />
          </Suspense>
        </div>
      </section>
      <Reviews tint />
      <Perks title="Створіть неповторну книжку саме для своєї дитини" />
    </>
  );
}
