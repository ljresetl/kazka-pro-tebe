"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Scene from "@/components/Scene";
import { saveStory } from "@/lib/storage";
import { getTheme, THEMES, TRAITS } from "@/lib/themes";
import { makeTemplateStory } from "@/lib/make-story";
import type { Gender, Story, StoryRequest, ThemeId } from "@/lib/types";

export default function CreateForm({ initialName, initialTheme }: { initialName: string; initialTheme: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [gender, setGender] = useState<Gender>("girl");
  const [age, setAge] = useState(5);
  const [theme, setTheme] = useState<ThemeId>(getTheme(initialTheme).id);
  const [trait, setTrait] = useState(TRAITS[0]);
  const [friend, setFriend] = useState("");
  const [status, setStatus] = useState<"idle" | "writing" | "error">("idle");
  const [error, setError] = useState("");

  const current = getTheme(theme);
  const shownName = name.trim() || "Ваша дитина";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Напишіть ім'я дитини — без нього казка не вийде.");
      setStatus("error");
      return;
    }
    setStatus("writing");
    setError("");
    try {
      const req: StoryRequest = {
        childName: name.trim(),
        gender,
        age,
        theme,
        trait,
        friend: friend.trim() || undefined,
      };
      let story: Story;
      if (process.env.NEXT_PUBLIC_STATIC_SITE === "1") {
        // Статична версія сайту (GitHub Pages) не має сервера — казка складається в браузері.
        await new Promise((r) => setTimeout(r, 900));
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
        <h1 className="display" style={{ fontSize: 28 }}>
          Пишемо казку…
        </h1>
        <p>Головний герой — {name.trim()}.</p>
        <p className="muted">Зазвичай це займає до двох хвилин. Не закривайте сторінку.</p>
      </div>
    );
  }

  return (
    <div className="create">
      <div>
        <h1 className="riso-type">Розкажіть про головного героя</h1>
        <form className="create-form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="name">Ім&apos;я дитини</label>
            <input
              id="name"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Наприклад, Марійка"
              autoComplete="off"
              required
            />
            <p className="field-help">Так, як ви звертаєтеся вдома: Марійка, Тимко, Соня.</p>
          </div>

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

          <div className="field">
            <label htmlFor="age">Вік</label>
            <select id="age" className="field-input" value={age} onChange={(e) => setAge(Number(e.target.value))}>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
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

          {status === "error" && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div>
            <button type="submit" className="btn btn-primary">
              Створити безкоштовний перегляд
            </button>
          </div>
        </form>
      </div>

      <aside className="create-aside" aria-label="Попередній вигляд обкладинки">
        <div className="live-cover">
          <Scene id={current.scene} />
          <div className="live-cover-title">
            <h2>{current.titleFor(shownName)}</h2>
            <p>{current.blurb}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
