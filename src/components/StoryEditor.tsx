"use client";

import { Paintbrush, Save, X } from "lucide-react";
import { useState } from "react";
import { redrawPage } from "@/lib/illustrate";
import { saveStory } from "@/lib/storage";
import type { Story } from "@/lib/types";

/** Редактор книжки: назва, передмова й текст кожної сторінки, перемальовування ілюстрацій. */
export default function StoryEditor({ story, canRedraw, onClose }: { story: Story; canRedraw: boolean; onClose: () => void }) {
  const [title, setTitle] = useState(story.title);
  const [dedication, setDedication] = useState(story.dedication);
  const [texts, setTexts] = useState(story.pages.map((p) => p.text));
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const dirty =
    title !== story.title || dedication !== story.dedication || texts.some((t, i) => t !== story.pages[i]?.text);

  function save() {
    saveStory({
      ...story,
      title: title.trim() || story.title,
      dedication: dedication.trim(),
      pages: story.pages.map((p, i) => ({ ...p, text: texts[i].trim() || p.text })),
    });
    setSaved(true);
  }

  async function redraw(i: number) {
    setError("");
    setBusy(i);
    try {
      // Малюємо за актуальним текстом сторінки.
      await redrawPage({ ...story, pages: story.pages.map((p, j) => (j === i ? { ...p, text: texts[i] } : p)) }, i);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося перемалювати ілюстрацію.");
    }
    setBusy(null);
  }

  return (
    <section className="panel story-editor" aria-labelledby="h-editor">
      <div className="story-editor-head">
        <h2 id="h-editor">Редагування книжки</h2>
        <button type="button" className="icon-btn" aria-label="Закрити редактор" onClick={onClose} style={{ position: "static" }}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <p className="muted">Змінюйте тексти, доки все не буде ідеально. Зміни зберігаються в цьому браузері.</p>

      <div className="field">
        <label htmlFor="ed-title">Назва книжки</label>
        <input id="ed-title" className="field-input" value={title} maxLength={120} onChange={(e) => (setTitle(e.target.value), setSaved(false))} />
      </div>
      <div className="field">
        <label htmlFor="ed-ded">Передмова</label>
        <textarea id="ed-ded" className="field-input" rows={2} value={dedication} maxLength={400} onChange={(e) => (setDedication(e.target.value), setSaved(false))} />
      </div>

      <ol className="editor-pages">
        {texts.map((t, i) => (
          <li key={i}>
            <label htmlFor={`ed-p${i}`}>Сторінка {i + 1}</label>
            <textarea
              id={`ed-p${i}`}
              className="field-input"
              rows={4}
              value={t}
              maxLength={1500}
              onChange={(e) => {
                const next = [...texts];
                next[i] = e.target.value;
                setTexts(next);
                setSaved(false);
              }}
            />
            {canRedraw && (
              <button type="button" className="btn btn-soft btn-small" onClick={() => redraw(i)} disabled={busy !== null}>
                <Paintbrush size={16} aria-hidden="true" />
                {busy === i ? "Малюємо…" : "Перемалювати ілюстрацію"}
              </button>
            )}
          </li>
        ))}
      </ol>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="story-editor-save">
        <button type="button" className="btn btn-primary" onClick={save} disabled={!dirty}>
          <Save size={18} aria-hidden="true" /> Зберегти зміни
        </button>
        {saved && !dirty && <span role="status">Збережено ✓</span>}
      </div>
    </section>
  );
}
