import Image from "next/image";
import Link from "next/link";
import HeroCover from "@/components/HeroCover";
import Scene from "@/components/Scene";
import { EXAMPLES } from "@/lib/examples";
import { PRICES } from "@/lib/prices";
import { yearsWord } from "@/lib/template-story";
import { THEMES } from "@/lib/themes";

export default function Home() {
  return (
    <>
      <HeroCover />

      <section className="section" id="yak-tse-pratsyuye">
        <h2>Три кроки від імені до книжки</h2>
        <p className="section-lead">Жодних менеджерів і тижнів очікування: книжку ви бачите одразу.</p>
        <ol className="steps">
          <li>
            <h3>Розкажіть про дитину</h3>
            <p>Ім&apos;я, вік, улюблена пригода і риса характеру, якою дитина пишається.</p>
          </li>
          <li>
            <h3>Прочитайте перші сторінки</h3>
            <p>Казка з&apos;являється за хвилину-дві. Перші три сторінки — безкоштовно.</p>
          </li>
          <li>
            <h3>Друкуйте або замовляйте</h3>
            <p>PDF для домашнього принтера, розмальовка або книжка в палітурці з доставкою.</p>
          </li>
        </ol>
      </section>

      <section className="section">
        <h2>Шість пригод на вибір</h2>
        <p className="section-lead">У кожній пригоді дитина допомагає комусь завдяки своїй сміливості, доброті чи кмітливості.</p>
        <div className="themes">
          {THEMES.map((t) => (
            <Link key={t.id} href={`/stvoryty?theme=${t.id}`} className="theme-card">
              <Scene id={t.scene} />
              <div className="theme-card-body">
                <h3>{t.label}</h3>
                <p>{t.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Почитайте, якими виходять казки</h2>
        <p className="section-lead">
          Десять прикладів про Марійку, Тимка, Соломію та інших дітей. Читаються прямо на сайті, нічого не треба
          завантажувати.
        </p>
        <div className="library-grid">
          {EXAMPLES.slice(0, 3).map((e) => (
            <Link key={e.slug} href={`/pryklady/${e.slug}`} className="theme-card">
              {e.coverImage ? (
              <Image src={e.coverImage.src} width={e.coverImage.width} height={e.coverImage.height} alt="" className="card-img" />
            ) : (
              <Scene id={e.cover} />
            )}
              <div className="theme-card-body">
                <h3>{e.title}</h3>
                <p>
                  {e.childName}, {yearsWord(e.age)}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: 32 }}>
          <Link href="/pryklady" className="btn btn-ghost">
            Усі 10 прикладів
          </Link>
        </p>
      </section>

      <section className="section" id="tsiny">
        <h2>Ціни</h2>
        <p className="section-lead">Перегляд завжди безкоштовний. Оплачуєте тільки ту казку, яку хочете зберегти.</p>
        <div className="prices">
          {PRICES.map((p) => (
            <div key={p.id} className={`price ${p.main ? "is-main" : ""}`}>
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
      </section>

      <section className="section">
        <h2>Безкоштовна бібліотека</h2>
        <p className="section-lead">
          «Рукавичка», «Колобок» та авторські казки — читайте з екрана або друкуйте розмальовки без оплати.
        </p>
        <Link href="/biblioteka" className="btn btn-ghost">
          Відкрити бібліотеку
        </Link>
      </section>

      <section className="section faq">
        <h2>Питання батьків</h2>
        <details>
          <summary>Для якого віку казки?</summary>
          <p>Для дітей 2–8 років. Довжину речень і слова ми підбираємо під вік, який ви вкажете.</p>
        </details>
        <details>
          <summary>Як роздрукувати PDF удома?</summary>
          <p>
            Після оплати натисніть «Роздрукувати або зберегти PDF». Підійде звичайний принтер і папір A4: одна сторінка
            казки на аркуш.
          </p>
        </details>
        <details>
          <summary>Чи можна виправити текст?</summary>
          <p>Так, створіть казку ще раз з іншою темою чи рисою характеру — кожен перегляд безкоштовний.</p>
        </details>
        <details>
          <summary>Скільки йде друкована книжка?</summary>
          <p>Друк займає 3–5 робочих днів, доставка Новою Поштою — 1–2 дні.</p>
        </details>
      </section>
    </>
  );
}
