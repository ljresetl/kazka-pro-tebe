import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AgeChips, Crumbs, Perks, ThemeGrid } from "@/components/seo/Blocks";
import SlotImage from "@/components/SlotImage";
import { FEATURES } from "@/lib/features-list";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Персоналізація: стилі, теми й можливості",
  description: "Понад сотня тем, до п'яти героїв, 10 стилів ілюстрацій, 8 шрифтів, передмова, редагування текстів, продовження й розмальовка. Усі способи зробити книжку по-справжньому вашою.",
  path: "/mozhlyvosti",
});

export default function FeaturesPage() {
  return (
    <>
      <Crumbs items={[{ name: "Можливості", path: "/mozhlyvosti" }]} />
      <section className="seo-hero">
        <div className="wrap">
          <h1>Персоналізуйте свою дитячу книжку</h1>
          <p className="seo-hero-lead">
            {SITE.name} — місце, де ваша дитина стає героєм власної чарівної історії. Нижче — усі способи зробити цю
            історію по-справжньому вашою.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap feature-rows">
          {FEATURES.map((f, i) => (
            <article key={f.id} className={`feature-row ${i % 2 ? "is-flip" : ""}`}>
              <SlotImage id={`mozhlyvosti/${f.id}`} alt={f.title} detail="label" sizes="(min-width: 900px) 480px, 92vw" />
              <div>
                <h2>
                  {f.title} {f.isNew && <span className="badge-new">Новинка</span>}
                </h2>
                <p>{f.text}</p>
                <Link href={f.href} className="feature-link">
                  {f.link} <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <ThemeGrid />
      <AgeChips />
      <Perks title="Створіть неповторну книжку саме для своєї дитини" />
    </>
  );
}
