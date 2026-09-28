// Спільні блоки SEO-сторінок (теми, імена, ідеї, вік, подарунки).
// Кожен блок — окремий розділ сторінки з власним заголовком.
import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, Brush, Check, Palette, Sparkles, Users } from "lucide-react";
import { OrnamentRule } from "@/components/Ornament";
import SlotImage from "@/components/SlotImage";
import { BOOK_FACTS, BOOK_QUALITY, PERKS } from "@/lib/book-facts";
import { AGE_GROUPS, CATEGORIES } from "@/lib/catalog";
import { REVIEWS } from "@/lib/reviews";
import { jsonLd } from "@/lib/seo";
import { abs } from "@/lib/site";

export function SectionHead({ title, lead, id }: { title: string; lead?: ReactNode; id?: string }) {
  return (
    <div className="section-head">
      <OrnamentRule className="ornament-rule" />
      <h2 id={id}>{title}</h2>
      {lead && <p>{lead}</p>}
    </div>
  );
}

export function Section({ tint, children, id }: { tint?: boolean; children: ReactNode; id?: string }) {
  return (
    <section className={`section ${tint ? "section-tint" : ""}`} id={id}>
      <div className="wrap">{children}</div>
    </section>
  );
}

/** Хлібні крихти: видимі посилання + BreadcrumbList для пошуковиків. */
export function Crumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Головна", path: "/" }, ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
  return (
    <nav className="seo-crumbs wrap" aria-label="Навігація">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <ol>
        {all.map((c, i) => (
          <li key={c.path}>{i === all.length - 1 ? <span aria-current="page">{c.name}</span> : <Link href={c.path}>{c.name}</Link>}</li>
        ))}
      </ol>
    </nav>
  );
}

/** Верх сторінки: заголовок, вступ, кнопки, картинка. */
export function PageHero({
  title,
  lead,
  image,
  imageAlt,
  cta = { href: "/stvoryty", label: "Створити дитячу книжку" },
  children,
}: {
  title: string;
  lead: ReactNode;
  image?: string;
  imageAlt?: string;
  cta?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <section className="seo-hero">
      <div className={`wrap ${image ? "seo-hero-grid" : ""}`}>
        <div>
          <h1>{title}</h1>
          <p className="seo-hero-lead">{lead}</p>
          <div className="home-hero-actions">
            <Link href={cta.href} className="btn btn-primary">
              {cta.label}
            </Link>
            <Link href="/pryklady" className="btn btn-ghost">
              Приклади
            </Link>
          </div>
          <QuickFacts />
          {children}
        </div>
        {image && (
          <div className="seo-hero-art">
            <SlotImage id={image} alt={imageAlt ?? title} detail="label" priority sizes="(min-width: 900px) 480px, 92vw" />
          </div>
        )}
      </div>
    </section>
  );
}

const FACT_ICONS = [Users, BookOpen, Brush, Palette];

/** Короткі факти про книжку під кнопками. */
export function QuickFacts() {
  return (
    <ul className="quick-facts">
      {BOOK_FACTS.map((f, i) => {
        const Icon = FACT_ICONS[i % FACT_ICONS.length];
        return (
          <li key={f}>
            <Icon size={18} aria-hidden="true" /> {f}
          </li>
        );
      })}
    </ul>
  );
}

/** Три кроки створення книжки. */
export function HowItWorks({ title = "Як створити персональну дитячу книжку", name }: { title?: string; name?: string }) {
  return (
    <Section tint>
      <SectionHead title={title} />
      <ol className="home-steps">
        <li>
          <SlotImage id="home/krok-1" alt="" detail="none" sizes="(min-width: 640px) 33vw, 92vw" />
          <h3>Розкажіть про героя</h3>
          <p>
            {name ? `Впишіть ім'я ${name}` : "Впишіть ім'я"}, вік і захоплення. За бажанням додайте фото — ілюстрації
            намалюємо за ним.
          </p>
        </li>
        <li>
          <SlotImage id="home/krok-2" alt="" detail="none" sizes="(min-width: 640px) 33vw, 92vw" />
          <h3>Оберіть історію</h3>
          <p>Тему, мораль, стиль ілюстрацій і шрифт. Ви задаєте основу — ми пишемо історію саме для вашої дитини.</p>
        </li>
        <li>
          <SlotImage id="home/krok-3" alt="" detail="none" sizes="(min-width: 640px) 33vw, 92vw" />
          <h3>Прочитайте й відредагуйте</h3>
          <p>Е-книгу бачите одразу. Змінюйте тексти, доки все не буде ідеально, а тоді замовте друковану книжку.</p>
        </li>
      </ol>
    </Section>
  );
}

/** Як виглядає друкована книжка. */
export function BookQuality() {
  return (
    <Section>
      <div className="quality">
        <div>
          <SectionHead
            title="Який вигляд має книжка"
            lead="Хочете тримати історію в руках? Замовте друк — і казка стане справжньою книжкою на полиці."
          />
          <h3 className="quality-sub">Якість і деталі</h3>
          <ul className="quality-list">
            {BOOK_QUALITY.map(([title, text]) => (
              <li key={title}>
                <Check size={18} aria-hidden="true" />
                <span>
                  <strong>{title}:</strong> {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <SlotImage id="book/hardcover" alt="Друкована дитяча книжка Казкарні" detail="label" sizes="(min-width: 900px) 440px, 92vw" />
      </div>
    </Section>
  );
}

/** Усі теми, згруповані за розділами, з посиланнями на сторінки тем. */
export function ThemeGrid({ title = "Книжки на будь-яку тему й нагоду", exclude }: { title?: string; exclude?: string }) {
  return (
    <Section tint id="usi-temy">
      <SectionHead title={title} lead="Понад сотня тем у восьми розділах — від динозаврів до першого дзвоника." />
      <div className="theme-groups">
        {CATEGORIES.map((c) => (
          <div key={c.id} className="theme-group">
            <h3>{c.label}</h3>
            <ul>
              {c.topics
                .filter((t) => t.id !== exclude)
                .map((t) => (
                  <li key={t.id}>
                    <Link href={`/temy/${t.id}`}>{t.label}</Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** Вибрані теми картками з іконками. */
export function TopicCards({ ids, title, lead }: { ids: string[]; title: string; lead?: string }) {
  const items = ids.flatMap((id) => CATEGORIES.flatMap((c) => c.topics.filter((t) => t.id === id)));
  return (
    <Section>
      <SectionHead title={title} lead={lead} />
      <div className="topic-chips">
        {items.map((t) => (
          <Link key={t.id} href={`/temy/${t.id}`} className="topic-chip">
            <SlotImage id={`tema/${t.id}`} alt="" detail="none" className="chip-img" sizes="34px" />
            {t.label}
          </Link>
        ))}
      </div>
    </Section>
  );
}

/** Питання й відповіді + FAQPage для пошуковиків. */
export function Faq({ items, title = "Часті запитання", tint }: { items: { q: string; a: string }[]; title?: string; tint?: boolean }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <Section tint={tint}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <SectionHead title={title} />
      <div className="faq">
        {items.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

/** Що ви отримуєте — список переваг із галочками. */
export function Perks({ title = "Ваша персональна дитяча книжка" }: { title?: string }) {
  return (
    <Section>
      <SectionHead title={title} />
      <ul className="checklist">
        {PERKS.map(([t, text]) => (
          <li key={t}>
            <Check size={20} aria-hidden="true" />
            <div>
              <strong>{t}</strong>
              <span>{text}</span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Фінальний заклик унизу сторінки. */
export function FinalCta({
  title = "Створіть неповторну книжку саме для своєї дитини",
  text = "Ім'я, улюблені іграшки, рідні — усе це стане частиною історії. Перші сторінки ви побачите одразу.",
  href = "/stvoryty",
}: {
  title?: string;
  text?: string;
  href?: string;
}) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="cta-band">
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <Link href={href} className="btn btn-primary">
            Створити книжку <Sparkles size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Сітка карток-посилань (імена, ідеї, вік). */
export function LinkCards({
  items,
  small,
}: {
  items: { href: string; title: string; sub?: string; image?: string; emoji?: string }[];
  small?: boolean;
}) {
  return (
    <ul className={`link-cards ${small ? "is-small" : ""}`}>
      {items.map((it) => (
        <li key={it.href}>
          <Link href={it.href} className="link-card">
            {it.image && <SlotImage id={it.image} alt="" detail="none" className="link-card-img" sizes="(min-width: 900px) 260px, 45vw" />}
            <span className="link-card-body">
              <strong>
                {it.title}
                {it.emoji && <span aria-hidden="true"> {it.emoji}</span>}
              </strong>
              {it.sub && <small>{it.sub}</small>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Відгуки покупців. Показуються лише справжні відгуки з lib/reviews.ts. */
export function Reviews({ tint, limit = 8 }: { tint?: boolean; limit?: number }) {
  const list = REVIEWS.slice(0, limit);
  return (
    <Section tint={tint}>
      <SectionHead title="Відгуки" lead="Фото й враження покупців від їхніх персональних книжок." />
      {list.length > 0 ? (
        <ul className="reviews">
          {list.map((r) => (
            <li key={r.name + r.date} className="review">
              <span className="review-stars" aria-label={`Оцінка ${r.rating} з 5`}>
                {"★".repeat(r.rating)}
              </span>
              <p>«{r.text}»</p>
              <strong>{r.name}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <div className="reviews-empty">
          <p>
            Казкарня щойно відкрилася, і перші книжки вже в дорозі до читачів. Тут з&apos;являться справжні відгуки й фото
            від родин — жодних вигаданих.
          </p>
        </div>
      )}
      <p className="section-more">
        <Link href="/vidhuky" className="btn btn-ghost">
          Усі відгуки
        </Link>
      </p>
    </Section>
  );
}

/** Вибір вікової групи — веде в конструктор з уже обраним віком (і темою). */
export function AgePicker({ topic, title = "Оберіть вік дитини" }: { topic?: string; title?: string }) {
  return (
    <section className="section age-pick">
      <div className="wrap">
        <div className="age-pick-box">
          <h2 className="age-pick-title">{title}</h2>
          <div className="age-cards">
            {AGE_GROUPS.map((a) => (
              <Link key={a.id} href={`/stvoryty?vik=${a.id}${topic ? `&tema=${topic}` : ""}`} className="age-card">
                <SlotImage id={`vik/${a.id}`} alt="" detail="none" sizes="96px" />
                <strong>{a.label}</strong>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
