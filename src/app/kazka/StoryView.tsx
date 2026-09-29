"use client";

import { BookOpen, Library, Pencil, Shuffle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import BookReader from "@/components/BookReader";
import { bookFontClass } from "@/lib/book-fonts";
import PrintBook, { PrintButtons } from "@/components/PrintBook";
import IllustrationsPanel from "@/components/IllustrationsPanel";
import { AI_ENABLED, AI_IMAGES, CREATION_PAUSED, STATIC_SITE } from "@/lib/features";
import { illustrateStory } from "@/lib/illustrate";
import { useStoryImages } from "@/lib/image-store";
import { BOOK_PAGES } from "@/lib/book-facts";
import { findTopic } from "@/lib/catalog";
import { makeTemplateStory, requestFromStory } from "@/lib/make-story";
import StoryEditor from "@/components/StoryEditor";
import { EBOOK, HARDCOVER } from "@/lib/offer";
import { formatUah } from "@/lib/prices";
import { addToCart, saveStory, useStory } from "@/lib/storage";
import { plotCount, yearsWord } from "@/lib/template-story";
import { getTheme } from "@/lib/themes";
import type { Story } from "@/lib/types";

const FREE_PAGES = 3;

export default function StoryView({ id }: { id: string }) {
  const story = useStory(id);
  const router = useRouter();
  const [regenerating, setRegenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const images = useStoryImages(id);
  // Поки художник-ШІ малює нову казку, показуємо екран очікування, а казку — вже з ілюстраціями.
  const [drawing, setDrawing] = useState<[number, number] | null>(null);
  const [drawError, setDrawError] = useState("");
  const drawStarted = useRef(false);
  // Після оплати домальовуємо решту сторінок (до оплати малюються лише обкладинка й перші FREE_PAGES).
  const [rest, setRest] = useState<[number, number] | null>(null);
  const restStarted = useRef(false);

  useEffect(() => {
    if (!story || story.illustrate !== "pending" || drawStarted.current || !AI_IMAGES || STATIC_SITE || CREATION_PAUSED) return;
    drawStarted.current = true;
    restStarted.current = Boolean(story.paid);
    // Позначаємо одразу: якщо сторінку перезавантажать, вдруге платно малювати не почнемо.
    saveStory({ ...story, illustrate: "started" });
    // Кожна картинка коштує грошей, тож до оплати малюємо лише те, що людина побачить безкоштовно.
    const upTo = story.paid ? story.pages.length : FREE_PAGES;
    setDrawing([0, Math.min(upTo, story.pages.length) + 1]);
    illustrateStory(story, (done, total) => setDrawing([done, total]), { upTo })
      .catch((err) => setDrawError(err instanceof Error ? err.message : "Не вдалося намалювати ілюстрації."))
      .finally(() => setDrawing(null));
  }, [story]);

  useEffect(() => {
    if (!story?.paid || story.illustrate !== "started" || restStarted.current || drawing) return;
    if (!AI_IMAGES || STATIC_SITE || CREATION_PAUSED) return;
    restStarted.current = true;
    // Уже намальовані сторінки illustrateStory пропускає, тож зайвих запитів не буде.
    illustrateStory(story, (done, total) => setRest(done < total ? [done, total] : null))
      .catch((err) => setDrawError(err instanceof Error ? err.message : "Не вдалося намалювати ілюстрації."))
      .finally(() => setRest(null));
  }, [story, drawing]);

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
  const pages = story.pages.map((p, i) => ({ ...p, image: images.pages[i] ?? p.image }));
  const printPages = paid ? pages : pages.slice(0, FREE_PAGES);
  const hasAiImages = Boolean(images.cover || images.pages.some(Boolean));
  const drawUpTo = paid ? story.pages.length : Math.min(FREE_PAGES, story.pages.length);
  const missingImages = (images.cover ? 0 : 1) + story.pages.slice(0, drawUpTo).filter((_, i) => !images.pages[i]).length;
  // До оплати малюються обкладинка й безкоштовні сторінки, решта — одразу після оплати.
  const canIllustrate = AI_IMAGES && !STATIC_SITE && !CREATION_PAUSED;
  const aiMode = AI_ENABLED && !STATIC_SITE;
  const canRegenerate = !CREATION_PAUSED && !paid && (aiMode || plotCount(story.theme) > 1);

  function buy(kind: "ebook" | "hardcover") {
    if (!story) return;
    addToCart({
      storyId: story.id,
      storyTitle: story.title,
      kind,
      cover: kind === "hardcover" ? "matova" : undefined,
      ebookPaid: Boolean(story.paid),
      paidOrder: story.paidOrder,
    });
    router.push("/koshyk");
  }

  async function anotherPlot() {
    if (!story) return;
    const req = requestFromStory(story);
    let next: Story = makeTemplateStory(req, story.plotId);
    if (aiMode) {
      setRegenerating(true);
      try {
        const res = await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        if (res.ok) next = (await res.json()) as Story;
      } catch {
        // Лишаємо шаблонний варіант.
      }
      setRegenerating(false);
    }
    saveStory(next);
    router.push(`/kazka?id=${next.id}`);
  }

  if (drawing || rest || (story.illustrate === "pending" && !CREATION_PAUSED)) {
    const [done, total] = drawing ?? rest ?? [0, (paid ? story.pages.length : Math.min(FREE_PAGES, story.pages.length)) + 1];
    return (
      <div className="writing" role="status">
        <div className="writing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {rest && <p style={{ fontWeight: 700 }}>Дякуємо за оплату!</p>}
        <h2 className="wz-step-title">{rest ? "Домальовуємо вашу книжку…" : "Малюємо ілюстрації…"}</h2>
        <p>
          Готово {done} з {total}
        </p>
        <p className="muted">Зазвичай це займає 1–3 хвилини. Не закривайте сторінку.</p>
      </div>
    );
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
              <span>{(story.options?.topic && findTopic(story.options.topic)?.topic.label) || theme.label}</span>
              {paid ? (
                <span className="badge is-paid">Оплачено</span>
              ) : (
                <span className="badge">Безкоштовний перегляд</span>
              )}
            </p>
          </div>
          <div className="button-row">
            {canRegenerate && (
              <button type="button" className="btn btn-soft btn-small" onClick={anotherPlot} disabled={regenerating}>
                <Shuffle size={16} aria-hidden="true" />
                {regenerating ? "Пишемо…" : "Інший сюжет"}
              </button>
            )}
            <button type="button" className="btn btn-soft btn-small" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
              <Pencil size={16} aria-hidden="true" />
              Редагувати
            </button>
            <Link href={`/stvoryty?prodovzhennia=${story.id}`} className="btn btn-ghost btn-small">
              <Library size={16} aria-hidden="true" />
              Продовження
            </Link>
          </div>
        </div>

        {editing && (
          <div style={{ marginBottom: 24 }}>
            <StoryEditor story={story} canRedraw={canIllustrate && paid && hasAiImages} onClose={() => setEditing(false)} />
          </div>
        )}

        <BookReader
          title={story.title}
          dedication={story.dedication}
          cover={theme.scene}
          coverImage={images.cover}
          pages={pages}
          fontClass={bookFontClass(story.options?.font)}
          lockedFrom={paid ? undefined : FREE_PAGES}
          lockedMessage={
            <div>
              <p>Далі казка відкривається після оплати</p>
              <button type="button" className="btn btn-primary" onClick={() => buy("ebook")}>
                Відкрити всю книжку — {formatUah(EBOOK)}
              </button>
            </div>
          }
        />

        {drawError && (
          <p className="form-error" role="alert" style={{ marginTop: 16 }}>
            {drawError}
          </p>
        )}

        {canIllustrate && (
          <div style={{ marginTop: 24 }}>
            <IllustrationsPanel story={story} hasImages={hasAiImages} missing={missingImages} paid={paid} upTo={drawUpTo} />
          </div>
        )}

        <div className="book-actions">
          {paid ? (
            <div className="panel" id="rozmalovka">
              <h2>Е-книга готова</h2>
              <p>
                Роздрукуйте книжку або збережіть її як PDF, щоб надіслати бабусі. «Розмальовка» зробить ілюстрації
                контурами — дитина розфарбує їх сама.
              </p>
              <PrintButtons />
            </div>
          ) : (
            <div className="panel">
              <h2>Сподобалась книжка?</h2>
              <ul className="offer-list">
                <li>
                  <span>Е-книга, {BOOK_PAGES} сторінок</span>
                  <strong>{formatUah(EBOOK)}</strong>
                </li>
                <li>
                  <span>Книжка у твердій обкладинці (е-книга входить)</span>
                  <strong>{formatUah(HARDCOVER)}</strong>
                </li>
              </ul>
              <div className="button-row">
                <button type="button" className="btn btn-primary" onClick={() => buy("ebook")}>
                  Купити е-книгу
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => buy("hardcover")}>
                  <BookOpen size={18} aria-hidden="true" />
                  Тверда обкладинка
                </button>
              </div>
            </div>
          )}

          {paid ? (
            <div className="panel">
              <h2>Замовити книжку у твердій обкладинці</h2>
              <p>
                Формат A4, щільний крейдований папір, матова або глянцева обкладинка. Оплачена е-книга вже врахована:
                доплата — {formatUah(HARDCOVER - EBOOK)}. Доставка Новою Поштою.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => buy("hardcover")}>
                <BookOpen size={18} aria-hidden="true" />
                Замовити за {formatUah(HARDCOVER - EBOOK)}
              </button>
              <p className="hint" style={{ marginTop: 12 }}>
                До книжки можна додати листівку, розмальовку, картину на полотні чи календар — зі знижкою 20%.
              </p>
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
        coverImage={images.cover}
        pages={printPages}
        fontClass={bookFontClass(story.options?.font)}
        watermark={paid ? undefined : "Перегляд · Казкарня"}
      />
    </div>
  );
}
