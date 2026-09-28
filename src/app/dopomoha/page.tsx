import type { Metadata } from "next";
import { Crumbs } from "@/components/seo/Blocks";
import { HELP } from "@/lib/help";
import { jsonLd, pageMeta } from "@/lib/seo";
import HelpCenter from "./HelpCenter";

export const metadata: Metadata = pageMeta({
  title: "Центр допомоги",
  description: "Відповіді на запитання про персональні дитячі книжки: створення, фото, редагування, ціни, оплата, доставка Новою Поштою й повернення.",
  path: "/dopomoha",
});

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HELP.flatMap((s) => s.items).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
};

export default function HelpPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqLd)} />
      <Crumbs items={[{ name: "Допомога", path: "/dopomoha" }]} />
      <section className="seo-hero" id="top">
        <div className="wrap help-wrap">
          <h1>Центр допомоги</h1>
          <HelpCenter sections={HELP} />
        </div>
      </section>
    </>
  );
}
