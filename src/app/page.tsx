import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import ExampleCard from "@/components/ExampleCard";
import HolidayBanner from "@/components/HolidayBanner";
import { OrnamentRule } from "@/components/Ornament";
import SeoText from "@/components/SeoText";
import SlotImage from "@/components/SlotImage";
import { AGE_GROUPS, findTopic } from "@/lib/catalog";
import { EXAMPLES } from "@/lib/examples";
import { formatUah, PRICES } from "@/lib/prices";
import { jsonLd, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";
import { getTheme } from "@/lib/themes";

export const metadata: Metadata = {
  ...pageMeta({
    title: `Іменна казка для дитини українською — ${SITE.name}`,
    description:
      "Персональна казка, де головний герой — ваша дитина. Вводите ім'я, обираєте пригоду й одразу читаєте. PDF для друку вдома від 199 грн або книжка в палітурці з доставкою.",
    path: "/",
  }),
  title: { absolute: `Іменна казка для дитини українською — ${SITE.name}` },
};

const FAQ = [
  {
    q: "Для якого віку ці казки?",
    a: "Від малюків до 10+ років. Вік обираєте першим кроком: для найменших казка коротша й з повторами, для старших — більше деталей, діалогів і пригод.",
  },
  {
    q: "Скільки коштує і коли платити?",
    a: `Перегляд безкоштовний: перші сторінки видно одразу. Платите, лише якщо казка сподобалась: PDF для друку — ${formatUah(PRICES[0].amount)}, книжка в палітурці — ${formatUah(PRICES[2].amount)}.`,
  },
  {
    q: "Як роздрукувати PDF удома?",
    a: "Після оплати натисніть «Роздрукувати або зберегти PDF». Підійде звичайний принтер і папір A4: одна сторінка казки на аркуш. Можна друкувати скільки завгодно разів.",
  },
  {
    q: "Чи можна написати звернення від себе?",
    a: "Так. На кроці «Передмова» вкажіть, від кого подарунок і з якої нагоди, або напишіть власні слова — вони стануть першою сторінкою книжки.",
  },
  {
    q: "Чи можна додати братика, бабусю чи песика?",
    a: "Так, окрім дитини в казці може бути ще до чотирьох героїв: рідні, друзі, улюбленці чи іграшки. Для кожного вкажіть ім'я і хто це для дитини.",
  },
  {
    q: "Скільки йде друкована книжка?",
    a: "Друк займає 3–5 робочих днів, доставка Новою Поштою — 1–2 дні. PDF-версію ви отримуєте одразу після оплати.",
  },
  {
    q: "Що робити, якщо казка не сподобалась?",
    a: "Створіть іншу — це безкоштовно. Можна змінити тему чи мораль або натиснути «Інший сюжет», щоб отримати нову історію з тим самим героєм.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const productLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Іменна казка для дитини",
  description: SITE.description,
  brand: { "@type": "Brand", name: SITE.name },
  image: `${SITE.url}/og.jpg`,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "UAH",
    lowPrice: Math.min(...PRICES.map((p) => p.amount)),
    highPrice: Math.max(...PRICES.map((p) => p.amount)),
    offerCount: PRICES.length,
    url: abs("/stvoryty"),
  },
};

const POPULAR_TOPICS = [
  "dynozavry",
  "kosmos",
  "pryntsesy",
  "pozhezhnyky",
  "yedynorohy",
  "piraty",
  "den-narodzhennia",
  "mykolai",
  "bratyk",
  "strakh-temriavy",
  "horshchyk",
  "kozatska-sich",
  "pershyi-dzvonyk",
  "superheroi",
];

const FEATURES = [
  ["Перегляд безкоштовно", "Казку видно одразу — платите, лише якщо сподобалась."],
  [`PDF від ${formatUah(PRICES[0].amount)}`, "Друкуйте вдома на звичайному принтері скільки завгодно разів."],
  ["Книжка в палітурці", "Друкуємо й надсилаємо Новою Поштою по всій Україні."],
  ["До 5 героїв", "Дитина, братик чи сестричка, бабуся, песик або улюблена іграшка."],
  ["10 стилів і 8 шрифтів", "Акварель, пластилін, комікс, м'яке аніме — книжка виглядає так, як хочете ви."],
  ["Передмова від вас", "Кілька теплих слів від рідних на першій сторінці."],
  ["Розмальовка до казки", "Ті самі сцени контурами — розфарбуйте разом із дитиною."],
  ["Жива українська мова", "Без суржику й канцеляриту, з правильними відмінками й родами."],
];

export default function Home() {
  const examples = EXAMPLES.slice(0, 6);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productLd)} />

      <section className="home-hero">
        <div className="wrap home-hero-grid">
          <div>
            <h1>Казка, де головний герой — ваша дитина</h1>
            <p className="home-hero-lead">
              Оберіть тему, стиль ілюстрацій і героїв — за хвилину отримаєте персональну книжку українською. Читайте з
              екрана, друкуйте вдома або замовте в палітурці.
            </p>
            <div className="home-hero-actions">
              <Link href="/stvoryty" className="btn btn-primary">
                Створити дитячу книжку
              </Link>
              <Link href="/pryklady" className="btn btn-ghost">
                Подивитися приклади
              </Link>
            </div>
            <ul className="home-hero-facts">
              <li>
                <Check size={18} aria-hidden="true" /> Перегляд безкоштовно
              </li>
              <li>
                <Check size={18} aria-hidden="true" /> Готово за хвилину
              </li>
              <li>
                <Check size={18} aria-hidden="true" /> PDF від {formatUah(PRICES[0].amount)}
              </li>
            </ul>
          </div>
          <div className="home-hero-art">
            <SlotImage
              id="home/hero"
              alt="Стос іменних дитячих книжок Казкарні"
              detail="full"
              priority
              sizes="(min-width: 900px) 540px, 92vw"
            />
          </div>
        </div>
      </section>

      <section className="section section-tint" id="yak-tse-pratsyuye">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Як створити книжку</h2>
            <p>Без менеджерів і тижнів очікування. Казку ви бачите одразу.</p>
          </div>
          <ol className="home-steps">
            <li>
              <SlotImage id="home/krok-1" alt="" detail="full" sizes="(min-width: 640px) 33vw, 92vw" />
              <h3>Розкажіть про героя</h3>
              <p>Ім&apos;я, вік, захоплення дитини. Додайте рідних, улюбленця чи іграшку — до 5 героїв.</p>
            </li>
            <li>
              <SlotImage id="home/krok-2" alt="" detail="full" sizes="(min-width: 640px) 33vw, 92vw" />
              <h3>Оберіть історію й стиль</h3>
              <p>Понад сотню тем у 8 розділах, мораль казки, 10 стилів ілюстрацій і 8 шрифтів.</p>
            </li>
            <li>
              <SlotImage id="home/krok-3" alt="" detail="full" sizes="(min-width: 640px) 33vw, 92vw" />
              <h3>Читайте й друкуйте</h3>
              <p>Перегляд безкоштовний. PDF — одразу після оплати, книжка в палітурці — Новою Поштою.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <HolidayBanner />
        </div>
      </section>

      <section className="section section-tint">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Для якого віку книжка?</h2>
            <p>Від віку залежить довжина речень і складність сюжету.</p>
          </div>
          <div className="age-cards">
            {AGE_GROUPS.map((a) => (
              <Link key={a.id} href={`/stvoryty?vik=${a.id}`} className="age-card">
                <SlotImage id={`vik/${a.id}`} alt="" detail="none" sizes="96px" />
                <strong>{a.label}</strong>
                <small>{a.about}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Приклади книжок</h2>
            <p>Прочитайте повністю прямо на сайті — і подивіться, з якими параметрами їх створено.</p>
          </div>
          <div className="ex-params">
            {examples.map((e) => (
              <div key={e.slug} className="ex-param-card">
                <ExampleCard e={e} />
                <dl className="ex-param-list">
                  <dt>Герой</dt>
                  <dd>
                    {e.childName}, {e.ageLabel}
                  </dd>
                  <dt>Тема</dt>
                  <dd>{getTheme(e.theme).label}</dd>
                  <dt>Мораль</dt>
                  <dd>{e.trait}</dd>
                  <dt>Героїв</dt>
                  <dd>{e.friend ? `2 (${e.friend})` : "1"}</dd>
                </dl>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <Link href="/pryklady" className="btn btn-ghost">
              Усі {EXAMPLES.length} прикладів
            </Link>
          </p>
        </div>
      </section>

      <section className="section section-tint">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Теми й приводи</h2>
            <p>Динозаври, перший дзвоник, братик у родині чи страх темряви — казка допоможе з будь-якою подією.</p>
          </div>
          <div className="topic-chips">
            {POPULAR_TOPICS.map((id) => {
              const found = findTopic(id);
              if (!found) return null;
              return (
                <Link key={id} href={`/stvoryty?tema=${id}`} className="topic-chip">
                  <SlotImage id={`tema/${id}`} alt="" detail="none" className="chip-img" sizes="34px" />
                  {found.topic.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Що ви отримуєте</h2>
          </div>
          <ul className="checklist">
            {FEATURES.map(([title, text]) => (
              <li key={title}>
                <Check size={20} aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-tint" id="tsiny">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Ціни</h2>
            <p>Перегляд завжди безкоштовний. Оплачуєте тільки ту казку, яку хочете зберегти.</p>
          </div>
          <div className="prices">
            {PRICES.map((p) => (
              <div key={p.id} className={`price ${p.main ? "is-main" : ""}`}>
                {p.main && <span className="price-badge">Найчастіше обирають</span>}
                <h3>{p.name}</h3>
                <p className="price-amount">
                  {p.amount} <small>грн</small>
                </p>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href="/stvoryty" className={`btn ${p.main ? "btn-primary" : "btn-ghost"}`}>
                  Створити казку
                </Link>
              </div>
            ))}
          </div>
          <p className="hint" style={{ marginTop: 20 }}>
            Деталі — на сторінці <Link href="/dostavka-i-oplata">«Доставка й оплата»</Link>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Безкоштовні казки</h2>
            <p>«Рукавичка», «Колобок» і авторські казки — читайте з екрана й друкуйте розмальовки без оплати.</p>
          </div>
          <Link href="/biblioteka" className="btn btn-ghost">
            Відкрити бібліотеку
          </Link>
        </div>
      </section>

      <section className="section section-tint">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Питання батьків</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cta-band">
            <div>
              <h2>Подаруйте дитині казку про неї саму</h2>
              <p>Перші сторінки — безкоштовно. Хвилина — і казка готова.</p>
            </div>
            <Link href="/stvoryty" className="btn btn-primary">
              Створити казку
            </Link>
          </div>
        </div>
      </section>

      <SeoText title="Іменна казка українською: навіщо вона дитині">
        <div>
          <p>
            Діти слухають уважніше, коли казка про них. Власне ім&apos;я в тексті тримає увагу краще за будь-яку
            картинку, а впізнати себе в героєві — справжнє диво для малюка 3–6 років. Тому іменна казка часто стає
            улюбленою книжкою, яку просять читати знову й знову.
          </p>
          <p>
            Кожен сюжет у {SITE.name} побудований навколо однієї риси: сміливості, доброти, терплячості, кмітливості,
            допитливості чи вміння дружити. Дитина бачить, як саме ця якість допомагає героєві — тобто їй самій —
            розв&apos;язати проблему. Без моралізаторства, через пригоду.
          </p>
          <h3>Жива українська мова</h3>
          <p>
            Ми пишемо простою і правильною українською, без суржику й калькованих фраз. Для найменших казка коротша й
            тримається головного, для старших — з деталями, діалогами й звуками. Рід дієслів і займенників
            узгоджується з тим, хто головний герой: хлопчик чи дівчинка, а друг чи улюбленець дитини вирушає в пригоду
            разом із нею.
          </p>
        </div>
        <div>
          <h3>Подарунок, який не загубиться серед іграшок</h3>
          <p>
            Іменна книжка — подарунок на день народження, Миколая, Новий рік чи випускний у садочку. На першій
            сторінці можна залишити звернення від мами, тата, бабусі або хрещених, і воно залишиться з дитиною на
            роки.
          </p>
          <h3>Друк удома або книжка в палітурці</h3>
          <p>
            PDF-версію зручно роздрукувати на звичайному принтері A4 й скріпити, а розмальовку — розфарбувати разом.
            Якщо хочеться справжню книжку, замовте друк у м&apos;якій палітурці з доставкою Новою Поштою.
          </p>
          <p>
            Спершу переконайтеся, що казка подобається: перші сторінки відкриті безкоштовно, а якщо сюжет не підійшов —
            натисніть «Інший сюжет» чи змініть пригоду.
          </p>
        </div>
      </SeoText>
    </>
  );
}
