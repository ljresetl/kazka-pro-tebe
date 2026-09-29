"use client";

import { Paintbrush } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { illustrateStory } from "@/lib/illustrate";
import type { Story } from "@/lib/types";

/**
 * Ілюстрації до казки з прогресом. Ще не оплачену казку малюємо автоматично один раз,
 * а «Намалювати ще раз» доступне лише після оплати (кожна картинка коштує грошей).
 */
export default function IllustrationsPanel({ story, hasImages, paid }: { story: Story; hasImages: boolean; paid: boolean }) {
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (hasImages || started.current) return;
    started.current = true;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id]);

  async function run() {
    setError("");
    try {
      await illustrateStory(story, (done, total) => setProgress([done, total]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося намалювати ілюстрації.");
    }
    setProgress(null);
  }

  return (
    <div className="panel">
      <h2>{progress ? "Малюємо ілюстрації" : hasImages ? "Ілюстрації готові" : "Намалюймо ілюстрації"}</h2>
      <p>
        {hasImages && !progress
          ? paid
            ? "Художник-ШІ намалював кожну сторінку. Якщо щось не сподобалося — намалюйте ще раз."
            : "Художник-ШІ намалював обкладинку й кожну сторінку. Після оплати їх можна буде перемалювати."
          : "Художник-ШІ малює обкладинку й кожну сторінку саме до вашої казки, в одному стилі. Це займає 1–3 хвилини."}
      </p>
      {progress ? (
        <p role="status" style={{ fontWeight: 700 }}>
          Малюємо {progress[0] + 1 > progress[1] ? progress[1] : progress[0] + 1} з {progress[1]}…
        </p>
      ) : hasImages && !paid ? null : (
        <button type="button" className="btn btn-primary" onClick={run}>
          <Paintbrush size={18} aria-hidden="true" />
          {hasImages ? "Намалювати ще раз" : "Намалювати ілюстрації"}
        </button>
      )}
      {error && (
        <p className="form-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}
