"use client";

import { Check, Gift, Lock, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BackLink from "@/components/BackLink";
import ShareButtons from "@/components/ShareButtons";
import SlotImage from "@/components/SlotImage";
import { priceCart, REFERRAL_DISCOUNT } from "@/lib/cart";
import { EXTRAS, FREE_SHIPPING_FROM, THIRD_BOOK_DISCOUNT, withDiscount } from "@/lib/offer";
import { createOrder, goToPayment, PAYMENT_MODE, startPayment } from "@/lib/payment";
import { formatUah } from "@/lib/prices";
import { abs } from "@/lib/site";
import { addToCart, clearCart, removeFromCart, setCartQty, useCart, useReferral } from "@/lib/storage";

type Errors = Partial<Record<"name" | "email" | "phone" | "city" | "branch" | "agree", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Приводить телефон до вигляду +380XXXXXXXXX або повертає null. */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (/^380\d{9}$/.test(digits)) return `+${digits}`;
  if (/^0\d{9}$/.test(digits)) return `+38${digits}`;
  return null;
}

export default function CartPage() {
  const cart = useCart();
  const referral = useReferral();
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
  const [paidStory, setPaidStory] = useState("");

  if (cart === undefined) return <div className="writing" />;

  if (state === "done") {
    return (
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="success">
          <div className="success-icon" aria-hidden="true">
            <Check size={36} strokeWidth={3} />
          </div>
          <h1>Дякуємо! Замовлення оплачено</h1>
          <p>
            Е-книги вже відкриті повністю. Друковані книжки й додатки надішлемо Новою Поштою після друку (3–5 робочих
            днів).
          </p>
          <div className="button-row" style={{ justifyContent: "center" }}>
            {paidStory && (
              <Link href={`/kazka?id=${paidStory}`} className="btn btn-primary">
                Відкрити книжку
              </Link>
            )}
            <Link href="/moi-kazky" className="btn btn-ghost">
              Мої казки
            </Link>
          </div>
        </div>
        <div className="panel" style={{ marginTop: 24 }}>
          <ShareButtons
            url={abs("/")}
            title="Казкарня — персональні дитячі книжки"
            text="Тут можна створити книжку, де головний герой — ваша дитина:"
            label="Розкажіть друзям"
          />
        </div>
      </div>
    );
  }

  const totals = priceCart(cart, referral);
  const hardcovers = totals.lines.filter((l) => l.kind === "hardcover").reduce((n, l) => n + l.qty, 0);
  const storiesInCart = [...new Map(cart.map((l) => [l.storyId, l])).values()];

  if (totals.lines.length === 0) {
    return (
      <div className="wrap">
        <div className="back-row">
          <BackLink fallback="/" />
        </div>
        <div className="empty" style={{ margin: "32px 0" }}>
          <h1 className="display" style={{ fontSize: 26 }}>
            Кошик порожній
          </h1>
          <p>Створіть книжку — перші сторінки видно одразу й безкоштовно.</p>
          <div className="button-row" style={{ justifyContent: "center" }}>
            <Link href="/stvoryty" className="btn btn-primary">
              Створити дитячу книжку
            </Link>
            <Link href="/moi-kazky" className="btn btn-ghost">
              Мої казки
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = "Вкажіть ім'я та прізвище.";
    if (!EMAIL_RE.test(email.trim())) e.email = "Перевірте пошту — на неї прийде посилання на книжку й чек.";
    if (totals.needsDelivery || phone.trim()) {
      if (!normalizePhone(phone)) e.phone = "Телефон у форматі 0XX XXX XX XX.";
    }
    if (totals.needsDelivery) {
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
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    if (!cart) return;
    setState("paying");
    const order = createOrder({
      items: cart,
      referral,
      amount: totals.total,
      contact: { name: name.trim(), email: email.trim(), phone: normalizePhone(phone) ?? "" },
      delivery: totals.needsDelivery ? { city: city.trim(), branch: branch.trim() } : undefined,
      comment: gift && giftNote.trim() ? `Подарунок. Листівка: ${giftNote.trim()}` : gift ? "Подарунок" : undefined,
    });
    const result = await startPayment(order);
    if (result.status === "paid") {
      setPaidStory(cart[0]?.storyId ?? "");
      clearCart();
      setState("done");
    } else if (result.status === "redirect") goToPayment(result.url);
    else {
      setPayError(result.message);
      setState("error");
    }
  }

  return (
    <div className="wrap">
      <div className="back-row">
        <BackLink fallback="/moi-kazky" label="Мої казки" />
      </div>
      <div className="page-top">
        <h1>Кошик</h1>
        <p>
          {hardcovers >= FREE_SHIPPING_FROM
            ? "Доставка безкоштовна!"
            : `Додайте ще ${FREE_SHIPPING_FROM - hardcovers} друковану книжку — і доставка буде безкоштовною.`}{" "}
          Кожна 3-тя книжка у твердій обкладинці — зі знижкою {THIRD_BOOK_DISCOUNT}%.
        </p>
      </div>

      <form className="checkout" onSubmit={submit} noValidate>
        <div className="checkout-main">
          <section className="form-card" aria-labelledby="h-items">
            <h2 id="h-items" className="display" style={{ fontSize: 20 }}>
              Ваше замовлення
            </h2>
            <ul className="cart-lines">
              {totals.lines.map((l) => (
                <li key={l.key} className="cart-line">
                  <div>
                    <strong>{l.name}</strong>
                    <span className="muted">«{l.storyTitle}»</span>
                    {l.kind === "hardcover" && (
                      <span className="cart-cover">
                        Обкладинка:{" "}
                        <select
                          value={l.cover ?? "matova"}
                          aria-label="Покриття обкладинки"
                          onChange={(e) => {
                            removeFromCart(l.key);
                            addToCart({ ...l, cover: e.target.value as "matova" | "hlyantseva", qty: l.qty });
                          }}
                        >
                          <option value="matova">матова</option>
                          <option value="hlyantseva">глянцева</option>
                        </select>
                      </span>
                    )}
                    {l.note && <small className="muted">{l.note}</small>}
                  </div>
                  <div className="cart-qty">
                    {l.kind !== "ebook" && (
                      <>
                        <button type="button" aria-label="Менше" onClick={() => setCartQty(l.key, l.qty - 1)} disabled={l.qty <= 1}>
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <span aria-live="polite">{l.qty}</span>
                        <button type="button" aria-label="Більше" onClick={() => setCartQty(l.key, l.qty + 1)}>
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                  <strong className="cart-sum">{formatUah(l.total)}</strong>
                  <button type="button" className="icon-btn cart-del" aria-label={`Прибрати: ${l.name}`} onClick={() => removeFromCart(l.key)}>
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="form-card" aria-labelledby="h-extras">
            <h2 id="h-extras" className="display" style={{ fontSize: 20 }}>
              Додайте до книжки — зі знижкою 20%
            </h2>
            <ul className="extras extras-cart">
              {EXTRAS.map((e) => (
                <li key={e.id} className="extra">
                  <SlotImage id={`dodatky/${e.id}`} alt={e.name} detail="none" sizes="160px" />
                  <h3>{e.name}</h3>
                  <p className="extra-price">
                    <s>{formatUah(e.price)}</s> <strong>{formatUah(withDiscount(e.price))}</strong>
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => {
                      const s = storiesInCart[0];
                      if (s) addToCart({ storyId: s.storyId, storyTitle: s.storyTitle, kind: "extra", extraId: e.id });
                    }}
                  >
                    <Plus size={16} aria-hidden="true" /> Додати
                  </button>
                </li>
              ))}
            </ul>
            {storiesInCart.some((s) => !cart.some((l) => l.storyId === s.storyId && l.kind === "hardcover")) && (
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => {
                  const s = storiesInCart.find((x) => !cart.some((l) => l.storyId === x.storyId && l.kind === "hardcover"));
                  if (s) addToCart({ storyId: s.storyId, storyTitle: s.storyTitle, kind: "hardcover", cover: "matova", ebookPaid: s.ebookPaid, paidOrder: s.paidOrder });
                }}
              >
                <Plus size={16} aria-hidden="true" /> Додати друковану книжку у твердій обкладинці
              </button>
            )}
          </section>

          <section className="form-card" aria-labelledby="h-contact">
            <h2 id="h-contact" className="display" style={{ fontSize: 20 }}>
              Контакти
            </h2>
            <div className="field">
              <label htmlFor="f-name">Ім&apos;я та прізвище</label>
              <input id="f-name" className="field-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} />
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
                {errors.email ? <p className="field-error">{errors.email}</p> : <p className="field-help">Сюди надішлемо посилання на книжку й чек.</p>}
              </div>
              <div className="field">
                <label htmlFor="f-phone">Телефон{totals.needsDelivery ? "" : " (необов'язково)"}</label>
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

          {totals.needsDelivery && (
            <section className="form-card" aria-labelledby="h-delivery">
              <h2 id="h-delivery" className="display" style={{ fontSize: 20 }}>
                Доставка Новою Поштою
              </h2>
              <div className="form-row is-2">
                <div className="field">
                  <label htmlFor="f-city">Місто або село</label>
                  <input id="f-city" className="field-input" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" placeholder="Київ" aria-invalid={Boolean(errors.city)} />
                  {errors.city && <p className="field-error">{errors.city}</p>}
                </div>
                <div className="field">
                  <label htmlFor="f-branch">Відділення або поштомат</label>
                  <input id="f-branch" className="field-input" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="№ 25" aria-invalid={Boolean(errors.branch)} />
                  {errors.branch && <p className="field-error">{errors.branch}</p>}
                </div>
              </div>
              <p className="field-help">Можна вказати адресу отримувача — наприклад, бабусі чи хрещених.</p>
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
                <textarea id="f-gift" className="field-input" value={giftNote} onChange={(e) => setGiftNote(e.target.value)} maxLength={200} rows={2} placeholder="Для Марійки від хрещених" />
              </div>
            )}
          </section>
        </div>

        <aside className="checkout-side">
          <div className="panel">
            <ul className="offer-list">
              <li>
                <span>Товари</span>
                <strong>{formatUah(totals.subtotal)}</strong>
              </li>
              {totals.discounts.map((d) => (
                <li key={d.label}>
                  <span>{d.label}</span>
                  <strong>−{formatUah(d.amount)}</strong>
                </li>
              ))}
              {totals.needsDelivery && (
                <li>
                  <span>Доставка</span>
                  <strong>{totals.shipping ? formatUah(totals.shipping) : "безкоштовно"}</strong>
                </li>
              )}
            </ul>
            {referral && (
              <p className="notice" style={{ marginBottom: 12 }}>
                Ви прийшли за запрошенням друга: −{REFERRAL_DISCOUNT}% на е-книгу.
              </p>
            )}
            <div className="total-row">
              <span>До сплати</span>
              <strong>{formatUah(totals.total)}</strong>
            </div>

            <label className="checkbox" style={{ marginBottom: 16 }}>
              <input id="f-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={Boolean(errors.agree)} />
              <span style={{ fontSize: 15 }}>
                Погоджуюся з <Link href="/umovy">умовами оферти</Link> та <Link href="/konfidentsiinist">політикою конфіденційності</Link>
              </span>
            </label>
            {errors.agree && (
              <p className="field-error" style={{ marginBottom: 12 }}>
                {errors.agree}
              </p>
            )}
            {PAYMENT_MODE === "test" && (
              <p className="notice" style={{ marginBottom: 16 }}>
                <strong>Тестовий режим.</strong> Оплата ще не підключена: кнопка просто відкриє книжку.
              </p>
            )}
            {state === "error" && (
              <p className="form-error" role="alert" style={{ marginBottom: 16 }}>
                {payError}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={state === "paying"}>
              <Lock size={16} aria-hidden="true" />
              {state === "paying" ? "Обробляємо…" : `Оплатити ${formatUah(totals.total)}`}
            </button>
            <p className="legal-note">Оплата карткою Visa / Mastercard, Apple Pay або Google Pay.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
