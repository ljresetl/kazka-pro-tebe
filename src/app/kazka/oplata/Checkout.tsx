"use client";

import { Check, Gift, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BackLink from "@/components/BackLink";
import Scene from "@/components/Scene";
import ShareButtons from "@/components/ShareButtons";
import { createOrder, goToPayment, PAYMENT_MODE, startPayment } from "@/lib/payment";
import { formatUah, getPrice, PRICES } from "@/lib/prices";
import { abs } from "@/lib/site";
import { useStory } from "@/lib/storage";
import { getTheme } from "@/lib/themes";
import type { ProductId } from "@/lib/types";

type Errors = Partial<Record<"name" | "email" | "phone" | "city" | "branch" | "agree", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Приводить телефон до вигляду +380XXXXXXXXX або повертає null. */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (/^380\d{9}$/.test(digits)) return `+${digits}`;
  if (/^0\d{9}$/.test(digits)) return `+38${digits}`;
  return null;
}

export default function Checkout({ id, initialProduct }: { id: string; initialProduct?: string }) {
  const story = useStory(id);
  const router = useRouter();
  const [product, setProduct] = useState<ProductId>(getPrice(initialProduct ?? "pdf").id);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [branch, setBranch] = useState("");
  const [gift, setGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"form" | "paying" | "done" | "error">("form");
  const [payError, setPayError] = useState("");

  if (story === undefined) return <div className="writing" />;
  if (story === null) {
    return (
      <div className="wrap">
        <div className="empty" style={{ margin: "32px 0" }}>
          <h1 className="display" style={{ fontSize: 26 }}>
            Казку не знайдено
          </h1>
          <p>Схоже, ця казка створена на іншому пристрої.</p>
          <Link href="/stvoryty" className="btn btn-primary">
            Створити нову казку
          </Link>
        </div>
      </div>
    );
  }

  const price = getPrice(product);
  const theme = getTheme(story.theme);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = "Вкажіть ім'я та прізвище.";
    if (!EMAIL_RE.test(email.trim())) e.email = "Перевірте пошту — на неї прийде PDF.";
    if (price.shipping || phone.trim()) {
      if (!normalizePhone(phone)) e.phone = "Телефон у форматі 0XX XXX XX XX.";
    }
    if (price.shipping) {
      if (!city.trim()) e.city = "Вкажіть місто або село.";
      if (!branch.trim()) e.branch = "Вкажіть номер відділення чи поштомату.";
    }
    if (!agree) e.agree = "Потрібна згода з умовами.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    if (!story) return;
    setState("paying");
    const order = createOrder({
      storyId: story.id,
      storyTitle: story.title,
      product,
      amount: price.amount,
      contact: { name: name.trim(), email: email.trim(), phone: normalizePhone(phone) ?? "" },
      delivery: price.shipping ? { city: city.trim(), branch: branch.trim() } : undefined,
      comment: gift && giftNote.trim() ? `Подарунок. Листівка: ${giftNote.trim()}` : gift ? "Подарунок" : undefined,
    });
    const result = await startPayment(order, story);
    if (result.status === "paid") setState("done");
    else if (result.status === "redirect") goToPayment(result.url);
    else {
      setPayError(result.message);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="success">
          <div className="success-icon" aria-hidden="true">
            <Check size={36} strokeWidth={3} />
          </div>
          <h1>Дякуємо! Казка ваша</h1>
          <p>
            {price.shipping
              ? "Ми надішлемо книжку Новою Поштою після друку (3–5 робочих днів). А PDF уже доступний — друкуйте хоч зараз."
              : "Уся казка відкрита. Роздрукуйте її або збережіть як PDF — кнопки на сторінці казки."}
          </p>
          <div className="button-row" style={{ justifyContent: "center" }}>
            <button type="button" className="btn btn-primary" onClick={() => router.push(`/kazka?id=${story.id}`)}>
              Відкрити казку
            </button>
            <Link href="/moi-kazky" className="btn btn-ghost">
              Мої казки
            </Link>
          </div>
        </div>
        <div className="panel" style={{ marginTop: 24 }}>
          <ShareButtons
            url={abs("/")}
            title="Казкарня — іменні казки для дітей"
            text="Тут можна за хвилину створити казку, де головний герой — ваша дитина:"
            label="Розкажіть друзям"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="back-row">
        <BackLink fallback={`/kazka?id=${story.id}`} label="До казки" />
      </div>
      <div className="page-top">
        <h1>Оформлення замовлення</h1>
      </div>

      <form className="checkout" onSubmit={submit} noValidate>
        <div className="checkout-main">
          <section className="form-card" aria-labelledby="h-product">
            <h2 id="h-product" className="display" style={{ fontSize: 20 }}>
              Що оформлюємо
            </h2>
            <div className="product-options">
              {PRICES.map((p) => (
                <label key={p.id} className="product-option">
                  <input
                    type="radio"
                    name="product"
                    value={p.id}
                    checked={product === p.id}
                    onChange={() => setProduct(p.id)}
                  />
                  <span className="po-text">
                    <span>{p.name}</span>
                    <small>{p.features[0]}</small>
                  </span>
                  <strong>{formatUah(p.amount)}</strong>
                </label>
              ))}
            </div>
          </section>

          <section className="form-card" aria-labelledby="h-contact">
            <h2 id="h-contact" className="display" style={{ fontSize: 20 }}>
              Контакти
            </h2>
            <div className="field">
              <label htmlFor="f-name">Ім&apos;я та прізвище</label>
              <input
                id="f-name"
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>
            <div className="form-row is-2">
              <div className="field">
                <label htmlFor="f-email">Пошта</label>
                <input
                  id="f-email"
                  type="email"
                  inputMode="email"
                  className="field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="mama@gmail.com"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? (
                  <p className="field-error">{errors.email}</p>
                ) : (
                  <p className="field-help">Сюди надішлемо PDF і чек.</p>
                )}
              </div>
              <div className="field">
                <label htmlFor="f-phone">Телефон{price.shipping ? "" : " (необов'язково)"}</label>
                <input
                  id="f-phone"
                  type="tel"
                  inputMode="tel"
                  className="field-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="067 123 45 67"
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
            </div>
          </section>

          {price.shipping && (
            <section className="form-card" aria-labelledby="h-delivery">
              <h2 id="h-delivery" className="display" style={{ fontSize: 20 }}>
                Доставка Новою Поштою
              </h2>
              <div className="form-row is-2">
                <div className="field">
                  <label htmlFor="f-city">Місто або село</label>
                  <input
                    id="f-city"
                    className="field-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    autoComplete="address-level2"
                    placeholder="Київ"
                    aria-invalid={Boolean(errors.city)}
                  />
                  {errors.city && <p className="field-error">{errors.city}</p>}
                </div>
                <div className="field">
                  <label htmlFor="f-branch">Відділення або поштомат</label>
                  <input
                    id="f-branch"
                    className="field-input"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="№ 25"
                    aria-invalid={Boolean(errors.branch)}
                  />
                  {errors.branch && <p className="field-error">{errors.branch}</p>}
                </div>
              </div>
              <p className="field-help">Доставку оплачуєте при отриманні за тарифами Нової Пошти.</p>
            </section>
          )}

          <section className="form-card">
            <label className="checkbox">
              <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
              <span>
                <Gift size={16} aria-hidden="true" style={{ verticalAlign: "-2px" }} /> Це подарунок
              </span>
            </label>
            {gift && (
              <div className="field">
                <label htmlFor="f-gift">Текст листівки (необов&apos;язково)</label>
                <textarea
                  id="f-gift"
                  className="field-input"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="Для Марійки від хрещених"
                />
              </div>
            )}
          </section>
        </div>

        <aside className="checkout-side">
          <div className="panel">
            <div className="checkout-summary">
              <Scene id={theme.scene} />
              <div>
                <h2>{story.title}</h2>
                <p>{price.name}</p>
              </div>
            </div>
            <div className="total-row">
              <span>До сплати</span>
              <strong>{formatUah(price.amount)}</strong>
            </div>

            <label className="checkbox" style={{ marginBottom: 16 }}>
              <input
                id="f-agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                aria-invalid={Boolean(errors.agree)}
              />
              <span style={{ fontSize: 15 }}>
                Погоджуюся з <Link href="/umovy">умовами оферти</Link> та{" "}
                <Link href="/konfidentsiinist">політикою конфіденційності</Link>
              </span>
            </label>
            {errors.agree && (
              <p className="field-error" style={{ marginBottom: 12 }}>
                {errors.agree}
              </p>
            )}

            {PAYMENT_MODE === "test" && (
              <p className="notice" style={{ marginBottom: 16 }}>
                <strong>Тестовий режим.</strong> Оплата ще не підключена: кнопка просто відкриє казку.
              </p>
            )}
            {state === "error" && (
              <p className="form-error" role="alert" style={{ marginBottom: 16 }}>
                {payError}
              </p>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={state === "paying"}>
              <Lock size={16} aria-hidden="true" />
              {state === "paying" ? "Обробляємо…" : `Оплатити ${formatUah(price.amount)}`}
            </button>
            <p className="legal-note">Оплата карткою Visa / Mastercard, Apple Pay або Google Pay.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
