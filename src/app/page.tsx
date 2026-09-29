import type { Metadata } from "next";
import Link from "next/link";
import HolidayBanner from "@/components/HolidayBanner";
import { OrnamentRule } from "@/components/Ornament";
import { AgePicker, Faq, Perks, Reviews, Section, SectionHead, ThemeGrid } from "@/components/seo/Blocks";
import ExampleShowcase from "@/components/seo/ExampleShowcase";
import SlotImage from "@/components/SlotImage";
import { EXAMPLES } from "@/lib/examples";
import { EBOOK, HARDCOVER } from "@/lib/offer";
import { formatUah } from "@/lib/prices";
import { jsonLd, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMeta({
    title: `Персональна дитяча книжка з ім'ям дитини — ${SITE.name}`,
    description: `Дитяча книжка на замовлення, де головний герой — ваша дитина, з її ім'ям і обличчям. Е-книга на 14 сторінок за ${formatUah(EBOOK)}, друкована у твердій обкладинці — ${formatUah(HARDCOVER)}.`,
    path: "/",
  }),
  title: { absolute: `Персональна дитяча книжка з ім'ям дитини — ${SITE.name}` },
};

const FAQ = [
  {
    q: "Скільки коштує персональна дитяча книжка?",
    a: `Е-книга за ${formatUah(EBOOK)} доступна одразу. Якщо все подобається, можна замовити друк і доставку гарної книжки у твердій обкладинці за ${formatUah(HARDCOVER)}.`,
  },
  {
    q: "Коли можна замовити друковану книжку й отримати її?",
    a: "Щойно ви отримали е-книгу й задоволені результатом, замовте книжку у твердій обкладинці. Друк займає 3–5 робочих днів, доставка Новою Поштою — 1–2 дні.",
  },
  {
    q: "Що саме я отримаю, коли створю книжку?",
    a: "Е-книгу на 14 сторінок, яку можна читати онлайн, зберегти в PDF і надіслати рідним. Подобається? Замовте друковану у твердій обкладинці й надішліть кому завгодно.",
  },
  {
    q: "Чи можна подивитися книжку заздалегідь?",
    a: "Кожна книжка створюється неповторною, але перші сторінки ви бачите одразу й безкоштовно. А щоб уявити результат, перегляньте вже створені приклади.",
  },
  {
    q: "Що, якщо книжка не сподобається?",
    a: "Тексти й ілюстрації можна змінити. Оскільки книжка створюється спеціально для вас, повернення коштів неможливе — тому ціна е-книги невисока, щоб спробувати без великого ризику.",
  },
];

const productLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Персональна дитяча книжка",
  description: SITE.description,
  brand: { "@type": "Brand", name: SITE.name },
  image: `${SITE.url}/og.jpg`,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "UAH",
    lowPrice: EBOOK,
    highPrice: HARDCOVER,
    offerCount: 2,
    url: abs("/tsiny"),
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productLd)} />

      <section className="home-hero">
        <div className="wrap home-hero-grid">
          <div>
            <h1>Створіть персональну дитячу книжку</h1>
            <p className="home-hero-lead">
              Дитяча книжка на замовлення, де головний герой — сама дитина, з власним ім&apos;ям і обличчям. Завантажте
              фото, оберіть тему — і чарівна історія оживе.
            </p>
            <div className="home-hero-actions">
              <Link href="/stvoryty" className="btn btn-primary">
                Створити дитячу книжку
              </Link>
            </div>
          </div>
          <div className="home-hero-art">
            <SlotImage id="home/hero" alt="Стос персональних дитячих книжок" detail="full" priority sizes="(min-width: 900px) 540px, 92vw" />
          </div>
        </div>
      </section>

      <section className="section section-tint" id="yak-tse-pratsyuye">
        <div className="wrap">
          <ol className="home-steps">
            <li>
              <SlotImage id="home/krok-1" alt="" detail="full" sizes="(min-width: 640px) 33vw, 92vw" />
              <h3>Персоналізуйте головного героя</h3>
              <p>
                Впишіть імена й дані героїв і завантажте їхні фото, щоб <strong>ілюстрації намалювали за вашими фото</strong>.
              </p>
            </li>
            <li>
              <SlotImage id="home/krok-2" alt="" detail="full" sizes="(min-width: 640px) 33vw, 92vw" />
              <h3>Створіть персональну історію</h3>
              <p>
                Ви задаєте основу, а ми пишемо <strong>історію на замовлення</strong>. Оберіть сюжет і стиль, що
                найкраще пасують до <strong>захоплень дитини</strong>.
              </p>
            </li>
            <li>
              <SlotImage id="home/krok-3" alt="" detail="full" sizes="(min-width: 640px) 33vw, 92vw" />
              <h3>Прочитайте й відредагуйте</h3>
              <p>
                Одразу отримуєте <strong>е-книгу за {formatUah(EBOOK)}</strong>. Змінюйте тексти й ілюстрації, доки все
                не буде ідеально, а тоді замовте <strong>тверду обкладинку за {formatUah(HARDCOVER)}</strong>.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <HolidayBanner />
          <p className="section-more">
            <Link href="/podarunky" className="feature-link">
              Усі приводи для подарунка →
            </Link>
          </p>
        </div>
      </section>

      <section className="section section-tint">
        <div className="wrap">
          <SectionHead
            title="Створіть персональну дитячу книжку"
            lead="Почніть створювати свою книжку: оберіть історію, завантажте фото й дивіться, як ваша неповторна книжка оживає."
          />
        </div>
      </section>
      <AgePicker title="Оберіть вік дитини" />

      <Section>
        <SectionHead
          title="Приклади"
          lead="Перегляньте приклади історій з неповторними героями й ілюстраціями, намальованими за фото, — для будь-якої дитини."
        />
        <div className="ex-shows">
          {EXAMPLES.slice(0, 3).map((e) => (
            <ExampleShowcase key={e.slug} e={e} />
          ))}
        </div>
        <p className="section-more">
          <Link href="/pryklady" className="btn btn-ghost">
            Усі приклади
          </Link>
        </p>
      </Section>

      <ThemeGrid />

      <Reviews />
      <Perks title="Створіть неповторну книжку саме для своєї дитини" />

      <Faq items={FAQ} tint />
      <section className="section section-tint" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Link href="/dopomoha" className="feature-link">
            Усі часті запитання →
          </Link>
        </div>
      </section>

      <Section>
        <div className="prose-block">
          <OrnamentRule className="ornament-rule" />
          <h2>Подаруйте неповторну дитячу книжку</h2>
          <p>
            Персональна дитяча книжка <Link href="/imena">з ім&apos;ям</Link>, де головну роль грає сама дитина. Ідеальний
            подарунок на день народження, народження малюка чи свято. У {SITE.name} ви завантажуєте фото, вказуєте кілька
            особистих деталей, а <strong>ми пишемо</strong> неповторну історію з узгодженими ілюстраціями — під ім&apos;я,
            вік і захоплення дитини.
          </p>
          <h3>Чому варто подарувати персональну книжку?</h3>
          <p>
            <strong>Історія на замовлення:</strong> фото дитини вплітається в ілюстрації, а ім&apos;я, захоплення й вік —
            просто в сюжет. Діти, які впізнають себе в історії, охоче читають разом із дорослими — і це розвиває словниковий
            запас та навички читання без жодного примусу.
          </p>
          <p>
            <strong>Завжди доречний подарунок:</strong> на <Link href="/podarunky/den-narodzhennia">день народження</Link>,{" "}
            <Link href="/podarunky">свята</Link> чи просто так. Книжку, де героєм є сама дитина, читають набагато частіше
            за звичайну. Подарунок, що тішить довго.
          </p>
          <p>
            <strong>Від е-книги до твердої обкладинки:</strong> впишіть ім&apos;я, завантажте фото й оберіть стиль
            ілюстрацій. Одразу отримаєте е-книгу на 14 сторінок, яку ще можна відредагувати, перш ніж надрукувати{" "}
            <Link href="/tsiny">у твердій обкладинці</Link>. Щільний папір, міцна палітурка й стійкі кольори — щоб
            книжка мала гарний вигляд навіть після сотні читань.
          </p>
          <h3>Замовте персональну дитячу книжку з ім&apos;ям</h3>
          <p>
            <Link href="/tsiny">Перегляньте ціни</Link> і створіть е-книгу вже сьогодні. Подобається результат? Тоді
            замовте книжку у твердій обкладинці й отримайте її в подарунок Новою Поштою.
          </p>
          <Link href="/stvoryty" className="btn btn-primary">
            Створити дитячу книжку
          </Link>
        </div>
      </Section>
    </>
  );
}
