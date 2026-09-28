import Link from "next/link";
import { Check } from "lucide-react";
import { Crumbs, LinkCards, Section, SectionHead } from "@/components/seo/Blocks";
import { PERKS } from "@/lib/book-facts";
import { AGES } from "@/lib/pages/age-list";
import { letterSlug, NAME_LETTERS, nameBookTitle, type NameEntry } from "@/lib/pages/names";

export const NAMES_PER_PAGE = 28;

/** Абетка імен: посилання на сторінки літер. */
export function LetterNav({ active }: { active?: string }) {
  return (
    <nav className="letter-nav" aria-label="Імена за літерами">
      {NAME_LETTERS.map((l) => (
        <Link key={l} href={`/imena/litera/${letterSlug(l)}`} aria-current={l === active ? "page" : undefined}>
          {l}
        </Link>
      ))}
    </nav>
  );
}

export function NameCards({ names }: { names: NameEntry[] }) {
  return (
    <LinkCards
      small
      items={names.map((n) => ({ href: `/imena/${n.slug}`, title: n.name, emoji: n.emoji, sub: nameBookTitle(n), image: `imya/${n.slug}` }))}
    />
  );
}

/** «Не знайшли ім'я?» + переваги + кнопка. */
export function NotFoundName() {
  return (
    <Section tint>
      <div className="notfound-name">
        <SectionHead
          title="Не знайшли ім'я своєї дитини?"
          lead="Не біда! Імена на цій сторінці — лише приклади. Під час створення книжки ви самі вписуєте ім'я, додаєте фото й обираєте тему, яка найкраще пасує вашій дитині."
        />
        <ul className="perk-checks">
          {PERKS.map(([t]) => (
            <li key={t}>
              <Check size={18} aria-hidden="true" /> {t}
            </li>
          ))}
        </ul>
        <Link href="/stvoryty" className="btn btn-primary">
          Створити власну книжку
        </Link>
      </div>
    </Section>
  );
}

export function AgeLinks() {
  return (
    <Section>
      <SectionHead title="Для кожного віку — своя історія" />
      <div className="topic-chips">
        {AGES.map((a) => (
          <Link key={a.slug} href={`/vik/${a.slug}`} className="topic-chip is-plain">
            {a.label}
          </Link>
        ))}
        <Link href="/vik" className="topic-chip is-accent">
          Усі вікові групи
        </Link>
      </div>
    </Section>
  );
}

function Pager({ page, pages, base }: { page: number; pages: number; base: string }) {
  const at = (n: number) => (n === 1 ? base : `${base}/storinka/${n}`);
  return (
    <nav className="pager" aria-label="Сторінки">
      {page > 1 && (
        <Link href={at(page - 1)} rel="prev">
          ← Назад
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link key={n} href={at(n)} aria-current={n === page ? "page" : undefined}>
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link href={at(page + 1)} rel="next">
          Далі →
        </Link>
      )}
    </nav>
  );
}

export { Pager };

export default function NamesList({
  title,
  lead,
  names,
  page,
  pages,
  letter,
  crumbs,
  withAbout,
}: {
  title: string;
  lead: string;
  names: NameEntry[];
  page?: number;
  pages?: number;
  letter?: string;
  crumbs: { name: string; path: string }[];
  withAbout?: boolean;
}) {
  return (
    <>
      <Crumbs items={crumbs} />
      <section className="seo-hero">
        <div className="wrap">
          <h1>{title}</h1>
          <p className="seo-hero-lead">{lead}</p>
          <LetterNav active={letter} />
          <NameCards names={names} />
          {pages && page && pages > 1 && <Pager page={page} pages={pages} base="/imena" />}
        </div>
      </section>
      {withAbout && <AgeLinks />}
      <NotFoundName />
      {withAbout && (
        <Section>
          <div className="prose-block">
            <h2>Сила книжки з ім&apos;ям вашої дитини</h2>
            <p>
              Коли дитина знаходить у книжці власне ім&apos;я, стається щось особливе. Історія вже не про когось
              чужого, а про неї саму. Тут зібрано найпопулярніші українські імена, але книжку можна створити для
              будь-якого імені — навіть найрідкіснішого чи домашнього «Сонечко».
            </p>
            <h3>Що дає ім&apos;я в історії</h3>
            <ul>
              <li>
                <strong>Миттєве впізнавання:</strong> діти слухають уважніше й переживають історію сильніше, коли
                герой носить їхнє ім&apos;я.
              </li>
              <li>
                <strong>Вечірній ритуал:</strong> книжку про себе дитина обирає щовечора знову й знову.
              </li>
              <li>
                <strong>Бажання читати:</strong> ті, хто тільки вчиться, охочіше читають історію, де самі грають
                головну роль.
              </li>
              <li>
                <strong>Пам&apos;ять на роки:</strong> книжка з ім&apos;ям і фото з часом стає дорогим спогадом
                про дитинство.
              </li>
            </ul>
            <h3>Кожне ім&apos;я — своя історія</h3>
            <p>
              Кожна книжка створюється заново для конкретної дитини. Ви обираєте тему, вписуєте ім&apos;я й
              додаєте фото, а історія та ілюстрації складаються навколо вашої дитини. Двох однакових книжок не
              буває.
            </p>
          </div>
        </Section>
      )}
    </>
  );
}
