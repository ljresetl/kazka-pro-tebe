"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Scene from "./Scene";

// Перший екран: батьки вводять ім'я — і обкладинка одразу стає «їхньою».
export default function HeroCover() {
  const [name, setName] = useState("");
  const router = useRouter();
  const shown = name.trim() || "Соломійка";

  return (
    <section className="hero">
      <div>
        <h1 className="riso-type">Казка, де головний герой — ваша дитина</h1>
        <p className="hero-lead">
          Напишіть ім&apos;я, оберіть пригоду — і за дві хвилини отримаєте ілюстровану казку українською.
          Читайте з екрана, друкуйте вдома або замовте книжку в палітурці.
        </p>
        <form
          className="hero-form"
          onSubmit={(e) => {
            e.preventDefault();
            const q = name.trim() ? `?name=${encodeURIComponent(name.trim())}` : "";
            router.push(`/stvoryty${q}`);
          }}
        >
          <label htmlFor="hero-name" className="sr-only">
            Ім&apos;я дитини
          </label>
          <input
            id="hero-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ім'я дитини"
            maxLength={40}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary">
            Створити казку
          </button>
        </form>
        <p className="hero-note muted">Перегляд безкоштовний. Платите, лише якщо казка сподобалась.</p>
      </div>

      <div className="live-cover" aria-label={`Обкладинка книжки: ${shown} і зоряний кит`}>
        <Scene id="space" />
        <div className="live-cover-title">
          <h2>{shown} і зоряний кит</h2>
          <p>Цю казку створено для тебе, {shown}.</p>
        </div>
      </div>
    </section>
  );
}
