"use client";

import Link from "next/link";
import BookReader from "@/components/BookReader";
import PrintBook, { PrintButtons } from "@/components/PrintBook";
import { PRICES } from "@/lib/prices";
import { useStory } from "@/lib/storage";
import { getTheme } from "@/lib/themes";

const FREE_PAGES = 3;

export default function StoryView({ id }: { id: string }) {
  const story = useStory(id);

  if (story === undefined) return <div className="writing" />;

  if (story === null) {
    return (
      <div className="checkout">
        <h1>Казку не знайдено</h1>
        <p>
          Казки зберігаються в браузері, де їх створили. Можливо, ви відкрили посилання на іншому пристрої або очистили
          дані сайту.
        </p>
        <Link href="/stvoryty" className="btn btn-primary">
          Створити нову казку
        </Link>
      </div>
    );
  }

  const theme = getTheme(story.theme);
  const paid = Boolean(story.paid);
  const printPages = paid ? story.pages : story.pages.slice(0, FREE_PAGES);

  return (
    <div className="print-root">
      <div className="book-page">
        <div className="book-head">
          <div>
            <h1 className="riso-type">{story.title}</h1>
            <p className="book-meta">
              {theme.label} · {story.pages.length} сторінок{" "}
              {paid ? <span className="badge">Оплачено</span> : <span className="badge">Безкоштовний перегляд</span>}
            </p>
          </div>
          <Link href="/stvoryty" className="btn btn-ghost">
            Створити ще одну
          </Link>
        </div>

        <BookReader
          title={story.title}
          dedication={story.dedication}
          cover={theme.scene}
          pages={story.pages}
          lockedFrom={paid ? undefined : FREE_PAGES}
          lockedMessage={
            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600 }}>Далі казка відкривається після оплати</p>
              <Link href={`/kazka/oplata?id=${story.id}`} className="btn btn-primary">
                Відкрити всю казку за {PRICES[0].amount} грн
              </Link>
            </div>
          }
        />

        <div className="book-actions">
          {paid ? (
            <div className="panel">
              <h2>Ваша казка готова до друку</h2>
              <p>
                Роздрукуйте книжку або збережіть її як PDF, щоб надіслати бабусі чи друкарні. Кнопка «Роздрукувати
                розмальовку» робить ілюстрації контурами — дитина розфарбує їх сама.
              </p>
              <PrintButtons />
            </div>
          ) : (
            <div className="panel">
              <h2>Сподобалась казка?</h2>
              <ul className="offer-list">
                {PRICES.map((p) => (
                  <li key={p.id}>
                    <span>{p.name}</span>
                    <strong>{p.amount} грн</strong>
                  </li>
                ))}
              </ul>
              <Link href={`/kazka/oplata?id=${story.id}`} className="btn btn-primary">
                Обрати й оплатити
              </Link>
            </div>
          )}

          {!paid && (
            <div className="panel">
              <h2>Спробуйте друк безкоштовно</h2>
              <p>Роздрукуйте перші {FREE_PAGES} сторінки, щоб побачити, як книжка виглядає на папері.</p>
              <PrintButtons note="Безкоштовний друк містить перші сторінки з позначкою «Перегляд»." />
            </div>
          )}
        </div>
      </div>

      <PrintBook
        title={story.title}
        dedication={story.dedication}
        cover={theme.scene}
        pages={printPages}
        watermark={paid ? undefined : "Перегляд · kazka-pro-tebe"}
      />
    </div>
  );
}
