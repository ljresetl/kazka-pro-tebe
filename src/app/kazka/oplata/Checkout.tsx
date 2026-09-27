"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRICES, type PriceId } from "@/lib/prices";
import { markPaid, useStory } from "@/lib/storage";

// Оплата в демо-режимі: платіжну систему (LiqPay, WayForPay або monobank)
// підключимо, щойно буде зареєстровано ФОП і відкрито еквайринг.
export default function Checkout({ id }: { id: string }) {
  const story = useStory(id);
  const router = useRouter();
  const [choice, setChoice] = useState<PriceId>("pdf");
  const [email, setEmail] = useState("");

  if (story === undefined) return <div className="writing" />;
  if (story === null) {
    return (
      <div className="checkout">
        <h1>Казку не знайдено</h1>
        <Link href="/stvoryty" className="btn btn-primary">
          Створити нову казку
        </Link>
      </div>
    );
  }

  const selected = PRICES.find((p) => p.id === choice) ?? PRICES[0];

  return (
    <div className="checkout">
      <h1>Оплата казки «{story.title}»</h1>

      <form
        className="create-form"
        onSubmit={(e) => {
          e.preventDefault();
          markPaid(story);
          router.push(`/kazka?id=${story.id}`);
        }}
      >
        <fieldset className="field">
          <legend>Що бажаєте</legend>
          <div className="choices">
            {PRICES.map((p) => (
              <label key={p.id} className="choice">
                <input
                  type="radio"
                  name="product"
                  value={p.id}
                  checked={choice === p.id}
                  onChange={() => setChoice(p.id)}
                />
                <span>
                  {p.name} — {p.amount} грн
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="email">Пошта для PDF</label>
          <input
            id="email"
            type="email"
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mama@example.com"
            autoComplete="email"
          />
        </div>

        <p className="demo-note">
          <strong>Тестовий режим.</strong> Платіжна система ще не підключена, тому кнопка нижче просто відкриває всю
          казку без оплати.
        </p>

        <div>
          <button type="submit" className="btn btn-primary">
            Оплатити {selected.amount} грн
          </button>
        </div>
      </form>
    </div>
  );
}
