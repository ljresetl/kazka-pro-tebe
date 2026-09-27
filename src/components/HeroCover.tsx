"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { asset } from "@/lib/site";
import { Hilochka } from "./Ornament";

// Перший екран: батьки вводять ім'я — і воно одразу з'являється
// на справжній сторінці казки з ілюстрацією.
export default function HeroCover() {
  const [name, setName] = useState("");
  const router = useRouter();
  const shown = name.trim() || "Соломія";

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">Українською · для дітей 2–8 років</span>
          <h1>
            Казка, де головний герой — <span className="accent">ваша дитина</span>
          </h1>
          <p className="hero-lead">
            Напишіть ім&apos;я, оберіть пригоду — і за хвилину отримаєте ілюстровану казку. Читайте з екрана,
            друкуйте вдома або замовте книжку в палітурці.
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
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ім'я дитини"
              maxLength={40}
              autoComplete="off"
              enterKeyHint="go"
            />
            <button type="submit" className="btn btn-primary">
              Створити казку
            </button>
          </form>
          <ul className="hero-points">
            <li>Перегляд безкоштовний</li>
            <li>Готово за хвилину</li>
            <li>PDF або книжка</li>
          </ul>
        </div>

        <div style={{ position: "relative" }}>
          <article className="hero-book" aria-label="Приклад сторінки казки з вашим іменем">
            <div className="hero-book-art">
              <Image
                src={asset("/illustrations/sea-mushlia/06.webp")}
                width={454}
                height={521}
                alt="Крабик дарує дівчинці рожеву мушлю на березі моря"
                priority
                sizes="(max-width: 640px) 100vw, 300px"
              />
              <span className="hero-sticker">Сторінка 6</span>
            </div>
            <div className="hero-book-text">
              <span className="page-label">Казка про мушлю, що співає</span>
              <h2>
                <mark>{shown}</mark> і мушля, що співає
              </h2>
              <p>
                Коли над морем засвітилися перші зірки, крабик приніс маленьку рожеву мушлю. «Це тобі, — сказав він. —
                Хай наша пісня завжди буде з тобою». Так закінчилася пригода, де головний герой — <mark>{shown}</mark>.
              </p>
            </div>
          </article>
          <Hilochka className="hero-decor" />
        </div>
      </div>
    </section>
  );
}
