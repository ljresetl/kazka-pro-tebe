"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BackLink from "@/components/BackLink";
import { OrnamentRule } from "@/components/Ornament";
import Scene from "@/components/Scene";
import { AI_ENABLED, STATIC_SITE } from "@/lib/features";
import { makeTemplateStory } from "@/lib/make-story";
import { saveStory } from "@/lib/storage";
import { getTheme, THEMES, TRAITS } from "@/lib/themes";
import type { Gender, Story, StoryRequest, ThemeId } from "@/lib/types";

const AGES = [2, 3, 4, 5, 6, 7, 8];

export default function CreateForm({ initialName, initialTheme }: { initialName: string; initialTheme: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [gender, setGender] = useState<Gender>("girl");
  const [age, setAge] = useState(5);
  const [theme, setTheme] = useState<ThemeId>(getTheme(initialTheme).id);
  const [trait, setTrait] = useState(TRAITS[0]);
  const [friend, setFriend] = useState("");
  const [message, setMessage] = useState("");
  const [wish, setWish] = useState("");
  const [status, setStatus] = useState<"idle" | "writing" | "error">("idle");
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState(false);

  const current = getTheme(theme);
  const shownName = name.trim() || "Ваша дитина";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      document.getElementById("name")?.focus();
      return;
    }
    setStatus("writing");
    setError("");
    window.scrollTo({ top: 0 });
    try {
      const req: StoryRequest = {
        childName: name.trim(),
        gender,
        age,
        theme,
        trait,
        friend: friend.trim() || undefined,
        message: message.trim() || undefined,
        wish: AI_ENABLED ? wish.trim() || undefined : undefined,
      };
      let story: Story;
      if (STATIC_SITE) {
        // Статична версія сайту (GitHub Pages) не має сервера — казка складається в браузері.
        await new Promise((r) => setTimeout(r, 1100));
        story = makeTemplateStory(req);
      } else {
        const res = await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Не вдалося створити казку.");
        story = data as Story;
      }
      saveStory(story);
      router.push(`/kazka?id=${story.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося створити казку. Спробуйте ще раз.");
      setStatus("error");
    }
  }

  if (status === "writing") {
    return (
      <div className="writing" role="status">
        <div className="writing-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h1>Пишемо казку…</h1>
        <p>Головний герой — {name.trim()}.</p>
        <p className="muted">Зазвичай це займає до хвилини. Не закривайте сторінку.</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="back-row">
        <BackLink fallback="/" />
      </div>
      <div className="page-top">
        <OrnamentRule className="ornament-rule" />
        <h1>Створімо казку</h1>
        <p>Заповніть кілька полів — і за хвилину прочитаєте казку. Перегляд безкоштовний.</p>
      </div>

      <div className="create">
        <form className="form-card" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="name">Ім&apos;я дитини</label>
            <input
              id="name"
              className="field-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError(false);
              }}
              maxLength={40}
              placeholder="Наприклад, Марійка"
              autoComplete="off"
              autoCapitalize="words"
              aria-invalid={nameError}
              aria-describedby={nameError ? "name-error" : "name-help"}
              required
            />
            {nameError ? (
              <p className="field-error" id="name-error">
                Напишіть ім&apos;я дитини — без нього казка не вийде.
              </p>
            ) : (
              <p className="field-help" id="name-help">
                Так, як ви звертаєтеся вдома: Марійка, Тимко, Соня.
              </p>
            )}
          </div>

          <div className="form-row is-2">
            <fieldset className="field">
              <legend>Хто головний герой</legend>
              <div className="choices">
                {(
                  [
                    ["girl", "Дівчинка"],
                    ["boy", "Хлопчик"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="choice">
                    <input
                      type="radio"
                      name="gender"
                      value={value}
                      checked={gender === value}
                      onChange={() => setGender(value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="field">
              <legend>Вік</legend>
              <div className="choices">
                {AGES.map((a) => (
                  <label key={a} className="choice">
                    <input type="radio" name="age" value={a} checked={age === a} onChange={() => setAge(a)} />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <fieldset className="field">
            <legend>Пригода</legend>
            <div className="theme-choices">
              {THEMES.map((t) => (
                <label key={t.id} className="theme-choice">
                  <input
                    type="radio"
                    name="theme"
                    value={t.id}
                    checked={theme === t.id}
                    onChange={() => setTheme(t.id)}
                  />
                  <Scene id={t.scene} />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Що допоможе в пригоді</legend>
            <div className="choices">
              {TRAITS.map((t) => (
                <label key={t} className="choice">
                  <input type="radio" name="trait" value={t} checked={trait === t} onChange={() => setTrait(t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {AI_ENABLED && (
            <div className="field">
              <label htmlFor="wish">Про що має бути казка (необов&apos;язково)</label>
              <textarea
                id="wish"
                className="field-input"
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                maxLength={400}
                rows={4}
                placeholder="Наприклад: завтра перший день у садочку, трохи боїться. Або: обожнює пожежні машини й кота Мурчика."
              />
              <p className="field-help">
                Опишіть подію, страх чи захоплення дитини — казка буде саме про це. До 400 символів.
              </p>
            </div>
          )}

          <div className="field">
            <label htmlFor="friend">Друг або улюбленець (необов&apos;язково)</label>
            <input
              id="friend"
              className="field-input"
              value={friend}
              onChange={(e) => setFriend(e.target.value)}
              maxLength={40}
              placeholder="Наприклад, песик Бублик"
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label htmlFor="message">Звернення до дитини (необов&apos;язково)</label>
            <textarea
              id="message"
              className="field-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              placeholder="Марійко, з днем народження! Любимо тебе, мама й тато."
              rows={3}
            />
            <p className="field-help">Буде на першій сторінці книжки. До 200 символів.</p>
          </div>

          {status === "error" && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="submit-bar">
            <button type="submit" className="btn btn-primary btn-block">
              <Sparkles size={18} aria-hidden="true" />
              Створити казку безкоштовно
            </button>
          </div>
        </form>

        <aside className="create-aside" aria-label="Попередній вигляд обкладинки">
          <div className="preview-card">
            <Scene id={current.scene} />
            <div className="preview-card-body">
              <h2>{current.titleFor(shownName)}</h2>
              <p>{current.blurb}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
