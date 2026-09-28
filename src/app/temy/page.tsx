import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, Section, SectionHead } from "@/components/seo/Blocks";
import SlotImage from "@/components/SlotImage";
import { ALL_TOPICS, CATEGORIES } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Теми персональних дитячих книжок",
  description: `${ALL_TOPICS.length} тем у дев'яти розділах: казки, пригоди, заняття, світи, свята, родина, навчальні, почуття й історії. Оберіть тему — і дитина стане героєм історії.`,
  path: "/temy",
});

export default function ThemesPage() {
  return (
    <>
      <Crumbs items={[{ name: "Теми", path: "/temy" }]} />
      <section className="seo-hero">
        <div className="wrap">
          <h1>Книжки на будь-яку тему й нагоду</h1>
          <p className="seo-hero-lead">
            Понад сотня тем у дев&apos;яти розділах — від динозаврів і козаків до першого дзвоника й страху темряви. Оберіть
            тему, і дитина стане героєм історії.
          </p>
        </div>
      </section>
      {CATEGORIES.map((c, i) => (
        <Section key={c.id} tint={i % 2 === 0}>
          <SectionHead title={c.label} lead={c.about} />
          <div className="topic-chips">
            {c.topics.map((t) => (
              <Link key={t.id} href={`/temy/${t.id}`} className="topic-chip">
                <SlotImage id={`tema/${t.id}`} alt="" detail="none" className="chip-img" sizes="34px" />
                {t.label}
              </Link>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
