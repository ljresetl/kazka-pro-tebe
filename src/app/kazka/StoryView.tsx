"use client";

import { BookOpen, Shuffle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackLink from "@/components/BackLink";
import BookReader from "@/components/BookReader";
import PrintBook, { PrintButtons } from "@/components/PrintBook";
import { makeTemplateStory, requestFromStory } from "@/lib/make-story";
import { formatUah, PRICES } from "@/lib/prices";
import { saveStory, useStory } from "@/lib/storage";
import { plotCount, yearsWord } from "@/lib/template-story";
import { getTheme } from "@/lib/themes";

const FREE_PAGES = 3;

export default function StoryView({ id }: { id: string }) {
  const story = useStory(id);
  const router = useRouter();

  if (story === undefined) return <div className="writing" />;

  if (story === null) {
    return (
      <div className="wrap">
        <div className="empty" style={{ margin: "32px 0" }}>
          <h1 className="display" style={{ fontSize: 26 }}>
            Казку не знайдено
          </h1>
          <p>
            Казки зберігаються в браузері, де їх створили. Можливо, ви відкрили посилання на іншому пристрої або
            очистили дані сайту.
          </p>
          <div className="button-row" style={{ justifyContent: "center" }}>
            <Link href="/stvoryty" className="btn btn-primary">
              Створити нову казку
            </Link>
            <Link href="/moi-kazky" className="btn btn-ghost">
              Мої казки
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const theme = getTheme(story.theme);
  const paid = Boolean(story.paid);
  const printPages = paid ? story.pages : story.pages.slice(0, FREE_PAGES);
  const canRegenerate = !paid && story.source === "template" && plotCount(story.theme) > 1;

  function anotherPlot() {
    if (!story) return;
    const next = makeTemplateStory(requestFromStory(story), story.plotId);
    saveStory(next);
    router.push(`/kazka?id=${next.id}`);
  }

  return (
    <div className="print-root">
      <div className="wrap book-page">
        <div className="back-row" style={{ paddingTop: 0, marginBottom: 12 }}>
          <BackLink fallback="/moi-kazky" label="Мої казки" />
        </div>
        <div className="book-head">
          <div>
            <h1>{story.title}</h1>
            <p className="book-meta">
              <span>
                {story.childName}, {yearsWord(story.age)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{theme.label}</span>
              {paid ? (
                <span className="badge is-paid">Оплачено</span>
              ) : (
                <span className="badge">Безкоштовний перегляд</span>
              )}
            </p>
          </div>
          <div className="button-row">
            {canRegenerate && (
              <button type="button" className="btn btn-soft btn-small" onClick={anotherPlot}>
                <Shuffle size={16} aria-hidden="true" />
                Інший сюжет
              </button>
            )}
            <Link href="/stvoryty" className="btn btn-ghost btn-small">
              Нова казка
            </Link>
          </div>
        </div>

        <BookReader
          title={story.title}
          dedication={story.dedication}
          cover={theme.scene}
          pages={story.pages}
          lockedFrom={paid ? undefined : FREE_PAGES}
          lockedMessage={
            <div>
              <p>Далі казка відкривається після оплати</p>
              <Link href={`/kazka/oplata?id=${story.id}`} className="btn btn-primary">
                Відкрити всю казку — {formatUah(PRICES[0].amount)}
              </Link>
            </div>
          }
        />

        <div className="book-actions">
          {paid ? (
            <div className="panel">
              <h2>Казка готова до друку</h2>
              <p>
                Роздрукуйте книжку або збережіть її як PDF, щоб надіслати бабусі чи в друкарню. «Розмальовка» зробить
                ілюстрації контурами — дитина розфарбує їх сама.
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
                    <strong>{formatUah(p.amount)}</strong>
                  </li>
                ))}
              </ul>
              <Link href={`/kazka/oplata?id=${story.id}`} className="btn btn-primary btn-block">
                Обрати й оплатити
              </Link>
            </div>
          )}

          {paid ? (
            <div className="panel">
              <h2>Замовити книжку в палітурці</h2>
              <p>Кольоровий друк, м&apos;яка обкладинка, доставка Новою Поштою за 1–2 дні після друку.</p>
              <Link href={`/kazka/oplata?id=${story.id}&product=print`} className="btn btn-ghost">
                <BookOpen size={18} aria-hidden="true" />
                Замовити за {formatUah(PRICES[2].amount)}
              </Link>
            </div>
          ) : (
            <div className="panel">
              <h2>Спробуйте друк безкоштовно</h2>
              <p>Роздрукуйте перші {FREE_PAGES} сторінки, щоб побачити, як книжка виглядає на папері.</p>
              <PrintButtons note="Безкоштовний друк містить обкладинку й перші сторінки з позначкою «Перегляд»." />
            </div>
          )}
        </div>
      </div>

      <PrintBook
        title={story.title}
        dedication={story.dedication}
        cover={theme.scene}
        pages={printPages}
        watermark={paid ? undefined : "Перегляд · Казкарня"}
      />
    </div>
  );
}
