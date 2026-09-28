import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs, Faq, LinkCards, PopularNames, Reviews, Section, SectionHead } from "@/components/seo/Blocks";
import BlogTeasers from "@/components/seo/BlogTeasers";
import ThemeTabs from "@/components/seo/ThemeTabs";
import SlotImage from "@/components/SlotImage";
import { findTopic } from "@/lib/catalog";
import { GIFTS, getGift } from "@/lib/pages/gifts";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return GIFTS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: PageProps<"/podarunky/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const g = getGift(slug);
  if (!g) return {};
  return pageMeta({ title: g.h1, description: g.intro, path: `/podarunky/${slug}` });
}

export default async function GiftPage(props: PageProps<"/podarunky/[slug]">) {
  const { slug } = await props.params;
  const g = getGift(slug);
  if (!g) notFound();
  const [a, b] = g.topics.map((id) => findTopic(id)!.topic);
  const href = `/stvoryty?tema=${g.topics[0]}`;

  return (
    <>
      <Crumbs items={[{ name: "Подарунки", path: "/podarunky" }, { name: g.label, path: `/podarunky/${slug}` }]} />
      <section className="seo-hero">
        <div className="wrap seo-hero-grid">
          <div>
            <h1>{g.h1}</h1>
            <p className="seo-hero-lead">{g.intro}</p>
            <Link href={href} className="btn btn-primary">
              Створити книжку
            </Link>
          </div>
          <div className="seo-hero-art">
            <SlotImage id={`pryvid/${slug}`} alt={g.label} detail="label" priority sizes="(min-width: 900px) 480px, 92vw" />
          </div>
        </div>
      </section>

      <Section tint>
        <SectionHead title="Оберіть, про що буде ваша книжка" />
        <ThemeTabs />
      </Section>

      <Section>
        <div className="prose-block">
          <h2>Чому до цієї нагоди пасує особистий подарунок</h2>
          <p>{g.why}</p>
          <h2>Книжка, де героєм є саме ця дитина</h2>
          <p>
            {g.book} Наприклад, <Link href={`/temy/${a.id}`}>історія на тему «{a.label.toLowerCase()}»</Link> або{" "}
            <Link href={`/temy/${b.id}`}>«{b.label.toLowerCase()}»</Link>. Більше задумів — серед наших{" "}
            <Link href="/idei">ідей для книжок</Link>.
          </p>
        </div>
      </Section>

      <Section>
        <div className="cta-band">
          <div>
            <h2>Хочете когось порадувати?</h2>
            <p>{g.cta}</p>
          </div>
          <Link href={href} className="btn btn-primary">
            Створити книжку
          </Link>
        </div>
      </Section>

      <Section>
        <div className="prose-block">
          <h2>Як це працює і як швидко</h2>
          <p>
            {g.howLead} Створити книжку можна онлайн за кілька хвилин: у <Link href="/stvoryty">конструкторі</Link>{" "}
            оберіть історію, впишіть ім&apos;я дитини й за бажанням додайте фото — решту зробимо ми. Е-книгу ви
            бачите одразу, тож її можна показати чи надіслати рідним. Якщо хочеться подарунка, який можна взяти в
            руки й поставити на полицю, дозамовте друковану книжку у твердій обкладинці — надрукуємо й надішлемо
            Новою Поштою. Ціни на обидва варіанти зручно порівняти на сторінці <Link href="/tsiny">цін</Link>.
          </p>
          <h2>Подарунок, що переживе інші</h2>
          <p>{g.lasts}</p>
        </div>
      </Section>

      <Reviews tint />
      <Faq items={g.faq} />

      <Section tint>
        <SectionHead title="Інші приводи для подарунка" />
        <LinkCards small items={GIFTS.filter((x) => x.slug !== slug).map((x) => ({ href: `/podarunky/${x.slug}`, title: x.label, image: `pryvid/${x.slug}` }))} />
        <p className="section-more">
          <Link href="/podarunky" className="btn btn-ghost">
            Усі приводи
          </Link>
        </p>
      </Section>

      <PopularNames seed={slug} limit={25} title="Улюблені імена" />
      <BlogTeasers tint />
    </>
  );
}
