import type { Metadata } from "next";
import Link from "next/link";
import ExampleCard from "@/components/ExampleCard";
import HeroCover from "@/components/HeroCover";
import { OrnamentRule } from "@/components/Ornament";
import Scene from "@/components/Scene";
import SeoText from "@/components/SeoText";
import { EXAMPLES } from "@/lib/examples";
import { formatUah, PRICES } from "@/lib/prices";
import { jsonLd, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";
import { THEMES } from "@/lib/themes";

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
    a: "Для дітей 2–8 років. Для малюків 2–3 років казка коротша: на кожній сторінці лише найголовніше. Для старших — більше деталей, діалогів і пригод.",
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
    a: "Так. На першій сторінці буде ваше звернення до дитини — від мами, тата, бабусі чи хрещених. Його можна написати під час створення казки.",
  },
  {
    q: "Скільки йде друкована книжка?",
    a: "Друк займає 3–5 робочих днів, доставка Новою Поштою — 1–2 дні. PDF-версію ви отримуєте одразу після оплати.",
  },
  {
    q: "Що робити, якщо казка не сподобалась?",
    a: "Створіть іншу — це безкоштовно. Можна змінити пригоду, рису характеру чи натиснути «Інший сюжет», щоб отримати нову історію з тим самим героєм.",
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

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productLd)} />

      <HeroCover />

      <section className="section section-tint" id="yak-tse-pratsyuye">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Від імені до книжки — чотири кроки</h2>
            <p>Без менеджерів, анкет і тижнів очікування. Казку ви бачите одразу.</p>
          </div>
          <ol className="steps">
            <li>
              <h3>Розкажіть про дитину</h3>
              <p>Ім&apos;я, вік, улюблена пригода і риса характеру, якою дитина пишається.</p>
            </li>
            <li>
              <h3>Прочитайте безкоштовно</h3>
              <p>Казка з&apos;являється за хвилину. Перші три сторінки відкриті одразу.</p>
            </li>
            <li>
              <h3>Додайте звернення</h3>
              <p>Кілька теплих слів від вас стануть першою сторінкою книжки.</p>
            </li>
            <li>
              <h3>Друкуйте чи замовляйте</h3>
              <p>PDF для домашнього принтера, розмальовка або книжка в палітурці.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Почитайте, якими виходять казки</h2>
            <p>Десять прикладів з іменами Марійки, Тимка, Соломії та інших дітей. Читаються прямо на сайті.</p>
          </div>
          <div className="scroller">
            {EXAMPLES.slice(0, 6).map((e) => (
              <ExampleCard key={e.slug} e={e} />
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <Link href="/pryklady" className="btn btn-ghost">
              Усі 10 прикладів
            </Link>
          </p>
        </div>
      </section>

      <section className="section section-tint">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Чим ми відрізняємося</h2>
            <p>Іменні книжки в Україні продають давно. Ми зробили так, щоб було швидше, простіше й чесніше.</p>
          </div>
          <div className="compare">
            <div className="compare-card">
              <h3>Звичайна іменна книжка</h3>
              <ul>
                <li>Приклад готує менеджер — від кількох днів до двох тижнів</li>
                <li>Лише друкована книжка за 600–4000 грн</li>
                <li>Кілька сюжетів на вибір</li>
                <li>Змінити щось — через листування</li>
              </ul>
            </div>
            <div className="compare-card is-us">
              <h3>{SITE.name}</h3>
              <ul>
                <li>Казку видно одразу, перегляд безкоштовний</li>
                <li>PDF для друку вдома від {formatUah(PRICES[0].amount)}</li>
                <li>12 сюжетів із тисячами варіантів тексту — казки не повторюються</li>
                <li>«Інший сюжет» одним натиском, звернення від вас на першій сторінці</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <OrnamentRule className="ornament-rule" />
            <h2>Шість пригод на вибір</h2>
            <p>У кожній дитина комусь допомагає — сміливістю, добротою чи кмітливістю.</p>
          </div>
          <div className="card-grid is-compact">
            {THEMES.map((t) => (
              <Link key={t.id} href={`/stvoryty?theme=${t.id}`} className="card">
                <Scene id={t.scene} />
                <div className="card-body">
                  <h3>{t.label}</h3>
                  <p>{t.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
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
