"use client";

import { Paintbrush } from "lucide-react";
import { useState } from "react";
import { illustrateStory } from "@/lib/illustrate";
import type { Story } from "@/lib/types";

/** Кнопка «Намалювати ілюстрації» з прогресом. */
export default function IllustrationsPanel({ story, hasImages }: { story: Story; hasImages: boolean }) {
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");

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
      <h2>{hasImages ? "Ілюстрації готові" : "Намалюймо ілюстрації"}</h2>
      <p>
        {hasImages
          ? "Художник-ШІ намалював кожну сторінку. Якщо щось не сподобалося — намалюйте ще раз."
          : "Художник-ШІ намалює обкладинку й кожну сторінку саме до вашої казки, в одному стилі. Це займає 1–3 хвилини."}
      </p>
      {progress ? (
        <p role="status" style={{ fontWeight: 700 }}>
          Малюємо {progress[0] + 1 > progress[1] ? progress[1] : progress[0] + 1} з {progress[1]}…
        </p>
      ) : (
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
