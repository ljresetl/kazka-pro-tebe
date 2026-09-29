"use client";

import { Paintbrush } from "lucide-react";
import { useState } from "react";
import { illustrateStory } from "@/lib/illustrate";
import type { Story } from "@/lib/types";

/**
 * Ілюстрації до казки з прогресом. Нову казку StoryView малює автоматично один раз.
 * Якщо частина картинок не намалювалася (обрив зв'язку), «Домалювати» малює лише пропущені.
 * «Намалювати ще раз» (усі заново) доступне лише після оплати — кожна картинка коштує грошей.
 */
export default function IllustrationsPanel({
  story,
  hasImages,
  missing,
  paid,
}: {
  story: Story;
  hasImages: boolean;
  missing: number;
  paid: boolean;
}) {
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");

  async function run(redraw: boolean) {
    setError("");
    try {
      await illustrateStory(story, (done, total) => setProgress([done, total]), { redraw });
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
          ? "Художник-ШІ намалював кожну сторінку. Якщо щось не сподобалося — намалюйте ще раз."
          : "Художник-ШІ намалював обкладинку й кожну сторінку. Після оплати їх можна буде перемалювати."
        : "Художник-ШІ малює обкладинку й кожну сторінку саме до вашої казки, в одному стилі. Це займає 1–3 хвилини.";

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
      ) : paid ? (
        <button type="button" className="btn btn-primary" onClick={() => run(true)}>
          <Paintbrush size={18} aria-hidden="true" />
          Намалювати ще раз
        </button>
      ) : null}
      {error && (
        <p className="form-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}
