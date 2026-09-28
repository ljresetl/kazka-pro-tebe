"use client";

import { Check, Send } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { HELP } from "@/lib/help";
import { SITE } from "@/lib/site";

const ALL = HELP.flatMap((s) => s.items);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STOP = new Set(["книжка", "книжку", "книжки", "можна", "коли", "мені", "моєї", "мого", "будь", "ласка", "добрий", "день"]);

/** Підказує до трьох відповідей із центру допомоги за словами з теми й повідомлення. */
function suggest(text: string) {
  const words = text
    .toLowerCase()
    .split(/[^а-яіїєґ']+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
  if (words.length === 0) return [];
  return ALL.map((i) => {
    const hay = (i.q + " " + i.a).toLowerCase();
    return { i, score: words.filter((w) => hay.includes(w.slice(0, 5))).length };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.i);
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [state, setState] = useState<"form" | "sending" | "sent" | "error">("form");
  const [error, setError] = useState("");
  const hints = useMemo(() => suggest(`${subject} ${message}`), [subject, message]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !EMAIL_RE.test(email.trim()) || !subject.trim() || !message.trim()) {
      setError("Заповніть, будь ласка, усі поля.");
      return;
    }
    setError("");
    setState("sending");
    const body = new FormData();
    body.append("name", name);
    body.append("email", email);
    body.append("subject", subject);
    body.append("message", message);
    photos.forEach((p) => body.append("photos", p));
    try {
      const res = await fetch("/api/contact", { method: "POST", body });
      if (res.ok) {
        setState("sent");
        return;
      }
      // Бот ще не налаштований або сайт статичний — пропонуємо написати листом.
      if (SITE.email) {
        const mail = `${message}\n\n${name}, ${email}`;
        window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mail)}`;
        setState("form");
        return;
      }
      throw new Error("no channel");
    } catch {
      setState("error");
      setError("Не вдалося надіслати повідомлення. Спробуйте пізніше або напишіть нам в інший спосіб.");
    }
  }

  if (state === "sent") {
    return (
      <div className="notice" role="status">
        <Check size={18} aria-hidden="true" /> Дякуємо! Повідомлення надіслано — відповімо на {email} у робочі дні.
      </div>
    );
  }

  return (
    <form className="form-card contact-form" onSubmit={submit} noValidate>
      <p className="notice is-info">
        Маєте питання? Цілком можливо, відповідь уже є в <Link href="/dopomoha">центрі допомоги</Link>. Зазирніть
        туди, перш ніж писати нам.
      </p>
      <div className="form-row is-2">
        <div className="field">
          <label htmlFor="c-name">Ім&apos;я</label>
          <input id="c-name" className="field-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="c-email">Пошта</label>
          <input
            id="c-email"
            type="email"
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-subject">Тема</label>
        <input id="c-subject" className="field-input" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} required />
      </div>
      <div className="field">
        <label htmlFor="c-message">Повідомлення</label>
        <textarea
          id="c-message"
          className="field-input"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={3000}
          required
        />
      </div>
      {hints.length > 0 && (
        <div className="contact-hints" aria-live="polite">
          <p>
            <strong>Можливо, це відповідь на ваше питання:</strong>
          </p>
          <div className="faq">
            {hints.map((h) => (
              <details key={h.q}>
                <summary>{h.q}</summary>
                <p>{h.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}
      <div className="field">
        <label htmlFor="c-photos">Додати фото (необов&apos;язково)</label>
        <input id="c-photos" type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 3))} />
        <p className="field-help">Не більше 3 фото. На фото ми одразу побачимо, що не так, — наприклад, пошкодження книжки.</p>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
        <Send size={18} aria-hidden="true" /> {state === "sending" ? "Надсилаємо…" : "Надіслати"}
      </button>
    </form>
  );
}
