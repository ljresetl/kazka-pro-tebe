"use client";

import { Paintbrush, RefreshCw } from "lucide-react";
import { useState } from "react";
import { illustrateStory, redrawPage } from "@/lib/illustrate";
import { readStory, saveStory } from "@/lib/storage";
import type { Illustration, Story } from "@/lib/types";

/** Скільки разів можна перемалювати одну сторінку — кожна картинка коштує грошей. */
export const REDRAWS_PER_PAGE = 2;

/**
 * Ілюстрації до казки з прогресом. Нову казку StoryView малює автоматично один раз.
 * Якщо частина картинок не намалювалася (обрив зв'язку), «Домалювати» малює лише пропущені.
 * Після оплати можна перемалювати окрему сторінку (до REDRAWS_PER_PAGE разів): зразки — лист персонажів
 * і попередня сторінка, тож нова картинка пасує до сусідніх. Усю книжку заново не малюємо — це дорого.
 * До оплати малюються лише обкладинка й безкоштовні сторінки (upTo).
 */
export default function IllustrationsPanel({
  story,
  hasImages,
  missing,
  paid,
  upTo,
  pageImages = [],
}: {
  story: Story;
  hasImages: boolean;
  missing: number;
  paid: boolean;
  /** Скільки перших сторінок малювати (до оплати — лише безкоштовні). */
  upTo: number;
  /** Намальовані сторінки — мініатюри для вибору, яку перемалювати. */
  pageImages?: (Illustration | undefined)[];
}) {
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");
  const [redrawing, setRedrawing] = useState<number | null>(null);
  const [used, setUsed] = useState<Record<number, number>>(story.redraws ?? {});

  async function redrawOne(index: number) {
    setError("");
    setRedrawing(index);
    try {
      await redrawPage(story, index);
      const fresh = readStory(story.id) ?? story;
      const redraws = { ...(fresh.redraws ?? {}), [index]: (fresh.redraws?.[index] ?? 0) + 1 };
      saveStory({ ...fresh, redraws });
      setUsed(redraws);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося перемалювати сторінку.");
    }
    setRedrawing(null);
  }

  async function run(redraw: boolean) {
    setError("");
    try {
      await illustrateStory(story, (done, total) => setProgress([done, total]), { redraw, upTo });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося намалювати ілюстрації.");
    }
    setProgress(null);
  }

  const partial = hasImages && missing > 0;
  const title = progress
    ? "Малюємо ілюстрації"
    : partial
      ? "Не всі ілюстрації готові"
      : hasImages
        ? "Ілюстрації готові"
        : "Намалюймо ілюстрації";
  const text = progress
    ? "Не закривайте сторінку — це займає 1–3 хвилини."
    : partial
      ? `Бракує ${missing} ілюстрацій — схоже, обірвався зв'язок. Домалюємо лише їх.`
      : hasImages
        ? paid
          ? `Художник-ШІ намалював кожну сторінку. Якщо якийсь малюнок не сподобався — перемалюйте лише його (кожну сторінку до ${REDRAWS_PER_PAGE} разів).`
          : `Художник-ШІ намалював обкладинку й перші ${upTo} сторінки. Решту він намалює одразу після оплати.`
        : "Художник-ШІ малює обкладинку й сторінки саме до вашої казки, в одному стилі. Це займає 1–3 хвилини.";

  return (
    <div className="panel">
      <h2>{title}</h2>
      <p>{text}</p>
      {progress ? (
        <p role="status" style={{ fontWeight: 700 }}>
          Готово {progress[0]} з {progress[1]}…
        </p>
      ) : missing > 0 ? (
        <button type="button" className="btn btn-primary" onClick={() => run(false)}>
          <Paintbrush size={18} aria-hidden="true" />
          {hasImages ? `Домалювати (${missing})` : "Намалювати ілюстрації"}
        </button>
      ) : paid && hasImages ? (
        <div className="redraw-grid">
          {story.pages.map((_, i) => {
            const img = pageImages[i];
            const left = REDRAWS_PER_PAGE - (used[i] ?? 0);
            return (
              <figure key={i} className="redraw-item">
                {img ? <img src={img.src} alt={`Сторінка ${i + 1}`} loading="lazy" /> : <div className="redraw-empty" />}
                <figcaption>Сторінка {i + 1}</figcaption>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  disabled={redrawing !== null || left <= 0}
                  onClick={() => redrawOne(i)}
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  {redrawing === i ? "Малюємо…" : left > 0 ? `Перемалювати (${left})` : "Ліміт"}
                </button>
              </figure>
            );
          })}
        </div>
      ) : null}
      {error && (
        <p className="form-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}
