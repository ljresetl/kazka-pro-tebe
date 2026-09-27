"use client";

import { ArrowLeft, ImagePlus, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AGE_GROUPS,
  BOOK_FONTS,
  CATEGORIES,
  CHARACTER_TYPES,
  findTopic,
  ILLUSTRATION_STYLES,
  MORALS,
  type AgeGroupId,
} from "@/lib/catalog";
import { bookFontClass } from "@/lib/book-fonts";
import { AI_ENABLED, AI_IMAGES, STATIC_SITE } from "@/lib/features";
import { savePhoto, shrinkPhoto } from "@/lib/image-store";
import { getSlot, isReady } from "@/lib/images";
import { asset } from "@/lib/site";
import { makeTemplateStory } from "@/lib/make-story";
import { saveStory } from "@/lib/storage";
import {
  composeDedication,
  friendFrom,
  hasDirectTemplate,
  themeForTopic,
  traitForMoral,
} from "@/lib/story-options";
import { getTheme } from "@/lib/themes";
import type { Character, Gender, Story, StoryRequest } from "@/lib/types";

const STEPS = ["Вік", "Розділ", "Тема", "Мораль", "Стиль", "Шрифт", "Герої", "Передмова"] as const;
const MAX_EXTRA = 4;
const PHOTOS_ON = AI_IMAGES && !STATIC_SITE;

/** Маленька картинка плитки: готове фото або заглушка з пунктирною рамкою. */
function TileImage({ id, wide = false }: { id: string; wide?: boolean }) {
  const slot = getSlot(id);
  if (isReady(slot)) {
    return (
      <Image
        src={asset(slot.file)}
        alt=""
        width={slot.width}
        height={slot.height}
        className={wide ? "wz-tile-img is-wide" : "wz-tile-img"}
        sizes={wide ? "(min-width: 900px) 220px, 45vw" : "96px"}
      />
    );
  }
  return (
    <span className={wide ? "wz-tile-ph is-wide" : "wz-tile-ph"} title={`Заглушка: ${slot.title}`} aria-hidden="true">
      фото
    </span>
  );
}

export type WizardInit = { name: string; ageGroup: string; category: string; topic: string };

export default function CreateWizard({ init }: { init: WizardInit }) {
  const router = useRouter();
  const initTopic = findTopic(init.topic);
  const [ageGroup, setAgeGroup] = useState<AgeGroupId | "">(
    AGE_GROUPS.some((a) => a.id === init.ageGroup) ? (init.ageGroup as AgeGroupId) : "",
  );
  const [category, setCategory] = useState(
    initTopic?.category.id ?? (CATEGORIES.some((c) => c.id === init.category) ? init.category : ""),
  );
  const [topic, setTopic] = useState(initTopic?.topic.id ?? "");
  const [moral, setMoral] = useState("");
  const [style, setStyle] = useState("");
  const [font, setFont] = useState("");

  const [name, setName] = useState(init.name);
  const [gender, setGender] = useState<Gender>("girl");
  const [age, setAge] = useState<number | "">(() => {
    const g = AGE_GROUPS.find((a) => a.id === init.ageGroup);
    return g ? Math.max(g.minAge, 2) : "";
  });
  const [hobbies, setHobbies] = useState("");
  const [food, setFood] = useState("");
  const [photo, setPhoto] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [extras, setExtras] = useState<Character[]>([]);

  const [from, setFrom] = useState("");
  const [relation, setRelation] = useState("");
  const [occasion, setOccasion] = useState("");
  const [teach, setTeach] = useState("");
  const [message, setMessage] = useState("");
  const [wish, setWish] = useState("");

  const done = [ageGroup, category, topic, moral, style, font];
  const firstOpen = done.findIndex((v) => !v);
  const [step, setStep] = useState(firstOpen === -1 ? 6 : firstOpen);
  const [status, setStatus] = useState<"idle" | "writing" | "error">("idle");
  const [error, setError] = useState("");
  const [heroError, setHeroError] = useState("");

  const group = AGE_GROUPS.find((a) => a.id === ageGroup);
  const cat = CATEGORIES.find((c) => c.id === category);
  const found = findTopic(topic);
  const chosenStyle = ILLUSTRATION_STYLES.find((s) => s.id === style);
  const chosenFont = BOOK_FONTS.find((f) => f.id === font);
  const sampleName = name.trim() || "Марійка";

  const chips: (string | undefined)[] = [
    group?.label,
    cat?.label,
    found?.topic.label,
    MORALS.find((m) => m.id === moral)?.label,
    chosenStyle?.label,
    chosenFont?.label,
    name.trim() ? `${name.trim()}${extras.length ? ` +${extras.length}` : ""}` : undefined,
  ];

  const go = (i: number) => {
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const pick = (setter: (v: string) => void, value: string, next: number) => {
    setter(value);
    go(next);
  };

  function heroValid() {
    if (!name.trim()) return "Напишіть ім'я головного героя.";
    if (age === "") return "Оберіть вік головного героя.";
    if (photo && !photoConsent) return "Підтвердьте згоду на використання фото або видаліть його.";
    return "";
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setHeroError("Оберіть фото у форматі JPG, PNG чи WebP.");
    try {
      setPhoto(await shrinkPhoto(file));
      setHeroError("");
    } catch {
      setHeroError("Не вдалося відкрити фото. Спробуйте інше.");
    }
  }

  async function submit() {
    const problem = heroValid();
    if (problem) {
      setHeroError(problem);
      return go(6);
    }
    setStatus("writing");
    setError("");
    window.scrollTo({ top: 0 });
    const heroAge = Number(age);
    const characters = extras.filter((c) => c.name.trim()).map((c) => ({ ...c, name: c.name.trim() }));
    const options = {
      ageGroup: ageGroup || undefined,
      category: category || undefined,
      topic: topic || undefined,
      moral: moral || undefined,
      style: style || undefined,
      font: font || undefined,
      hobbies: hobbies.trim() || undefined,
      food: food.trim() || undefined,
      characters: characters.length ? characters : undefined,
      dedicationFrom: from.trim() || undefined,
      dedicationRelation: relation.trim() || undefined,
      occasion: occasion.trim() || undefined,
      teach: teach.trim() || undefined,
    };
    const req: StoryRequest = {
      ...options,
      childName: name.trim(),
      gender,
      age: heroAge,
      theme: themeForTopic(topic),
      trait: traitForMoral(moral),
      friend: friendFrom(characters),
      message: message.trim() || composeDedication(name.trim(), options),
      wish: AI_ENABLED ? wish.trim() || undefined : undefined,
    };
    try {
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
      if (photo && photoConsent && PHOTOS_ON) await savePhoto(story.id, photo.data, photo.mimeType).catch(() => {});
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

  const updateExtra = (i: number, patch: Partial<Character>) =>
    setExtras((list) => list.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  return (
    <div className="wrap wz">
      <div className="wz-top">
        <p className="wz-count">
          Крок {step + 1} з {STEPS.length} · {STEPS[step]}
        </p>
        <div className="wz-progress" aria-hidden="true">
          <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        {chips.some(Boolean) && (
          <ul className="wz-chips" aria-label="Ваш вибір">
            {chips.map((label, i) =>
              label ? (
                <li key={STEPS[i]}>
                  <button type="button" onClick={() => go(i)} aria-label={`Змінити: ${STEPS[i]} — ${label}`}>
                    {label}
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </div>

      {step === 0 && (
        <section className="wz-step">
          <h1>Для якого віку книжка?</h1>
          <p className="wz-lead">Від віку залежить довжина речень і складність сюжету.</p>
          <div className="wz-tiles is-big">
            {AGE_GROUPS.map((a) => (
              <button
                key={a.id}
                type="button"
                className="wz-tile"
                aria-pressed={ageGroup === a.id}
                onClick={() => {
                  setAgeGroup(a.id);
                  if (age === "" || age < a.minAge || age > a.maxAge) setAge(Math.max(a.minAge, 2));
                  go(1);
                }}
              >
                <TileImage id={`vik/${a.id}`} />
                <strong>{a.label}</strong>
                <small>{a.about}</small>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="wz-step">
          <h1>Оберіть розділ</h1>
          <p className="wz-lead">Далі покажемо теми з цього розділу.</p>
          <div className="wz-tiles">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="wz-tile"
                aria-pressed={category === c.id}
                onClick={() => {
                  if (c.id !== category) setTopic("");
                  pick(setCategory, c.id, 2);
                }}
              >
                <TileImage id={`rozdil/${c.id}`} />
                <strong>{c.label}</strong>
                <small>{c.about}</small>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="wz-step">
          <h1>{cat ? `${cat.label}: оберіть тему` : "Оберіть тему"}</h1>
          {!cat ? (
            <button type="button" className="btn btn-ghost" onClick={() => go(1)}>
              Спершу оберіть розділ
            </button>
          ) : (
            <div className="wz-tiles is-small">
              {cat.topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="wz-tile"
                  aria-pressed={topic === t.id}
                  onClick={() => pick(setTopic, t.id, 3)}
                >
                  <TileImage id={`tema/${t.id}`} />
                  <strong>{t.label}</strong>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {step === 3 && (
        <section className="wz-step">
          <h1>Чого навчить казка?</h1>
          <p className="wz-lead">Герой розв&apos;яже пригоду саме завдяки цій цінності.</p>
          <div className="wz-tiles is-small">
            {MORALS.map((m) => (
              <button
                key={m.id}
                type="button"
                className="wz-tile"
                aria-pressed={moral === m.id}
                onClick={() => pick(setMoral, m.id, 4)}
              >
                <TileImage id={`moral/${m.id}`} />
                <strong>{m.label}</strong>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="wz-step">
          <h1>Стиль ілюстрацій</h1>
          <p className="wz-lead">Однакова сцена в кожному стилі — оберіть, як виглядатиме ваша книжка.</p>
          <div className="wz-tiles is-wide">
            {ILLUSTRATION_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className="wz-tile"
                aria-pressed={style === s.id}
                onClick={() => pick(setStyle, s.id, 5)}
              >
                <TileImage id={`styl/${s.id}`} wide />
                <strong>{s.label}</strong>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="wz-step">
          <h1>Шрифт книжки</h1>
          <p className="wz-lead">Так буде набрано текст казки.</p>
          <div className="wz-tiles is-fonts">
            {BOOK_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="wz-tile is-font"
                aria-pressed={font === f.id}
                onClick={() => pick(setFont, f.id, 6)}
              >
                <span className={`wz-font-sample ${bookFontClass(f.id)}`}>Жили-були {sampleName} і дракон</span>
                <strong>{f.label}</strong>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 6 && (
        <section className="wz-step">
          <h1>Герої казки</h1>
          <p className="wz-lead">Головний герой — ваша дитина. Можна додати ще до {MAX_EXTRA} героїв: братика, бабусю, песика чи улюблену іграшку.</p>

          <div className="form-card wz-hero">
            <h2>Головний герой</h2>
            <div className="field">
              <label htmlFor="name">Ім&apos;я</label>
              <input
                id="name"
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Наприклад, Марійка"
                autoComplete="off"
                autoCapitalize="words"
              />
              <p className="field-help">Так, як ви звертаєтеся вдома: Марійка, Тимко, Соня.</p>
            </div>
            <div className="form-row is-2">
              <fieldset className="field">
                <legend>Хто це</legend>
                <div className="choices">
                  {(
                    [
                      ["girl", "Дівчинка"],
                      ["boy", "Хлопчик"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="choice">
                      <input type="radio" name="gender" checked={gender === value} onChange={() => setGender(value)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="age">Вік</label>
                <select
                  id="age"
                  className="field-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Оберіть</option>
                  {Array.from({ length: 17 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? "до 1 року" : `${i}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row is-2">
              <div className="field">
                <label htmlFor="hobbies">Захоплення (необов&apos;язково)</label>
                <input
                  id="hobbies"
                  className="field-input"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  maxLength={120}
                  placeholder="малювати, футбол, динозаври"
                />
              </div>
              <div className="field">
                <label htmlFor="food">Улюблена їжа (необов&apos;язково)</label>
                <input
                  id="food"
                  className="field-input"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  maxLength={80}
                  placeholder="вареники з вишнями"
                />
              </div>
            </div>

            <div className="field wz-photo">
              <span className="field-label">Фото дитини (необов&apos;язково)</span>
              {photo ? (
                <div className="wz-photo-row">
                  {/* eslint-disable-next-line @next/next/no-img-element -- локальне прев'ю з data: */}
                  <img src={photo.preview} alt="Завантажене фото" className="wz-photo-preview" />
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => setPhoto(null)}>
                    <Trash2 size={16} aria-hidden="true" />
                    Видалити фото
                  </button>
                </div>
              ) : (
                <label className={`wz-upload ${PHOTOS_ON ? "" : "is-off"}`}>
                  <ImagePlus size={22} aria-hidden="true" />
                  <span>{PHOTOS_ON ? "Додати фото" : "Скоро: ілюстрації, схожі на вашу дитину"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={!PHOTOS_ON}
                    onChange={(e) => onPhoto(e.target.files?.[0])}
                  />
                </label>
              )}
              <p className="field-help">
                Одна дитина в кадрі, обличчя добре видно. Фото зберігається лише у вашому браузері, один раз
                передається генератору для обкладинки й одразу видаляється.
              </p>
              {photo && (
                <label className="consent-check">
                  <input type="checkbox" checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)} />
                  <span>
                    Я батько, мати чи законний представник дитини й погоджуюся на обробку фото для створення ілюстрацій
                    згідно з <Link href="/konfidentsiinist">політикою конфіденційності</Link>.
                  </span>
                </label>
              )}
            </div>
          </div>

          {extras.map((c, i) => (
            <div key={i} className="form-card wz-hero">
              <div className="wz-hero-head">
                <h2>Герой {i + 2}</h2>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={() => setExtras((list) => list.filter((_, j) => j !== i))}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Прибрати
                </button>
              </div>
              <fieldset className="field">
                <legend>Хто це</legend>
                <div className="choices">
                  {CHARACTER_TYPES.map((t) => (
                    <label key={t.id} className="choice">
                      <input
                        type="radio"
                        name={`type-${i}`}
                        checked={c.type === t.id}
                        onChange={() => updateExtra(i, { type: t.id })}
                      />
                      <span>
                        {t.icon} {t.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="form-row is-2">
                <div className="field">
                  <label htmlFor={`x-name-${i}`}>Ім&apos;я</label>
                  <input
                    id={`x-name-${i}`}
                    className="field-input"
                    value={c.name}
                    onChange={(e) => updateExtra(i, { name: e.target.value })}
                    maxLength={40}
                    placeholder={c.type === "pet" ? "Бублик" : c.type === "object" ? "Ведмедик Тедді" : "Остап"}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`x-rel-${i}`}>Хто це для дитини</label>
                  <input
                    id={`x-rel-${i}`}
                    className="field-input"
                    value={c.relation ?? ""}
                    onChange={(e) => updateExtra(i, { relation: e.target.value })}
                    maxLength={40}
                    placeholder={c.type === "pet" ? "песик" : c.type === "object" ? "улюблена іграшка" : "молодший братик"}
                  />
                </div>
              </div>
              <div className="form-row is-2">
                <div className="field">
                  <label htmlFor={`x-age-${i}`}>Вік (необов&apos;язково)</label>
                  <input
                    id={`x-age-${i}`}
                    className="field-input"
                    inputMode="numeric"
                    value={c.age ?? ""}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      updateExtra(i, { age: Number.isFinite(n) ? Math.min(n, 120) : undefined });
                    }}
                    maxLength={3}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`x-hob-${i}`}>Захоплення (необов&apos;язково)</label>
                  <input
                    id={`x-hob-${i}`}
                    className="field-input"
                    value={c.hobbies ?? ""}
                    onChange={(e) => updateExtra(i, { hobbies: e.target.value })}
                    maxLength={120}
                    placeholder="ганятися за м'ячиком"
                  />
                </div>
              </div>
            </div>
          ))}

          {extras.length < MAX_EXTRA && (
            <button
              type="button"
              className="btn btn-soft wz-add"
              onClick={() => setExtras((list) => [...list, { type: "person", name: "" }])}
            >
              <Plus size={18} aria-hidden="true" />
              Додати героя
            </button>
          )}

          {heroError && (
            <p className="form-error" role="alert">
              {heroError}
            </p>
          )}
          <div className="wz-nav">
            <button type="button" className="btn btn-ghost" onClick={() => go(5)}>
              <ArrowLeft size={18} aria-hidden="true" />
              Назад
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const problem = heroValid();
                setHeroError(problem);
                if (!problem) go(7);
              }}
            >
              Далі
            </button>
          </div>
        </section>
      )}

      {step === 7 && (
        <section className="wz-step">
          <h1>Передмова</h1>
          <p className="wz-lead">
            Кілька теплих слів стануть першою сторінкою книжки. Усі поля необов&apos;язкові.
          </p>
          <div className="form-card">
            <div className="form-row is-2">
              <div className="field">
                <label htmlFor="from">Від кого</label>
                <input
                  id="from"
                  className="field-input"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  maxLength={60}
                  placeholder="бабуся Марія"
                />
              </div>
              <div className="field">
                <label htmlFor="relation">Хто це дитині</label>
                <input
                  id="relation"
                  className="field-input"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  maxLength={40}
                  placeholder="бабуся"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="occasion">Привід</label>
              <input
                id="occasion"
                className="field-input"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                maxLength={80}
                placeholder="8-й день народження"
              />
            </div>
            <div className="field">
              <label htmlFor="teach">Чого хочете навчити дитину</label>
              <input
                id="teach"
                className="field-input"
                value={teach}
                onChange={(e) => setTeach(e.target.value)}
                maxLength={200}
                placeholder="не боятися пробувати нове"
              />
              {!AI_ENABLED && (
                <p className="field-help">Врахуємо, коли підключимо письменника-ШІ; зараз казку складають готові сюжети.</p>
              )}
            </div>
            <div className="field">
              <label htmlFor="message">Своє звернення до дитини</label>
              <textarea
                id="message"
                className="field-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder={
                  from.trim()
                    ? composeDedication(sampleName, { dedicationFrom: from, occasion })
                    : `${sampleName}, з днем народження! Любимо тебе, мама й тато.`
                }
              />
              <p className="field-help">
                Якщо залишити порожнім, а «Від кого» заповнити, звернення складемо самі. До 200 символів.
              </p>
            </div>
            {AI_ENABLED && (
              <div className="field">
                <label htmlFor="wish">Про що ще має бути казка</label>
                <textarea
                  id="wish"
                  className="field-input"
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  maxLength={400}
                  rows={3}
                  placeholder="Завтра перший день у садочку, трохи боїться."
                />
              </div>
            )}
          </div>

          {!AI_ENABLED && topic && !hasDirectTemplate(topic) && (
            <p className="wz-note">
              Зараз казки складаються з наших готових сюжетів. Для теми «{found?.topic.label}» візьмемо найближчу пригоду —
              «{getTheme(themeForTopic(topic)).label}». Повністю за темою казку напише письменник-ШІ, щойно ми його
              підключимо.
            </p>
          )}

          {status === "error" && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="wz-nav">
            <button type="button" className="btn btn-ghost" onClick={() => go(6)}>
              <ArrowLeft size={18} aria-hidden="true" />
              Назад
            </button>
            <button type="button" className="btn btn-primary" onClick={submit}>
              <Sparkles size={18} aria-hidden="true" />
              Створити казку
            </button>
          </div>
          <p className="legal-note">
            Натискаючи кнопку, ви погоджуєтеся на обробку введених даних згідно з{" "}
            <Link href="/konfidentsiinist">політикою конфіденційності</Link>. Перегляд казки безкоштовний.
          </p>
        </section>
      )}

      {step < 6 && step > 0 && (
        <div className="wz-nav">
          <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}>
            <ArrowLeft size={18} aria-hidden="true" />
            Назад
          </button>
          {done[step] && (
            <button type="button" className="btn btn-primary" onClick={() => go(step + 1)}>
              Далі
            </button>
          )}
        </div>
      )}
    </div>
  );
}
