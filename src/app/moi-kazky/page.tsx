"use client";

import { BookOpen, Copy, Gift, Library, Palette, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BackLink from "@/components/BackLink";
import { OrnamentRule } from "@/components/Ornament";
import Scene from "@/components/Scene";
import { lineName, REFERRAL_DISCOUNT } from "@/lib/cart";
import { deleteImages } from "@/lib/image-store";
import { formatUah, getPrice } from "@/lib/prices";
import { abs } from "@/lib/site";
import { addToCart, deleteStory, ensureMyCode, useMyCode, useOrders, useStories } from "@/lib/storage";
import { getTheme } from "@/lib/themes";
import type { Order } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long" });

function orderTitle(o: Order) {
  if (o.items?.length) return o.items.map((i) => `${lineName(i)} ×${i.kind === "ebook" ? 1 : i.qty} · «${i.storyTitle}»`).join(", ");
  return `${o.product ? getPrice(o.product).name : ""} · ${o.storyTitle ?? ""}`;
}

/** «Запросіть друзів»: особисте посилання з кодом-подарунком. */
function InviteFriends() {
  const code = useMyCode();
  const [copied, setCopied] = useState(false);
  const link = code ? abs(`/?kod=${code}`) : "";
  return (
    <section className="panel invite" aria-labelledby="h-invite">
      <h2 id="h-invite">
        <Gift size={20} aria-hidden="true" /> Запросіть друзів
      </h2>
      <p>
        Надішліть друзям своє посилання-подарунок: вони отримають −{REFERRAL_DISCOUNT}% на першу е-книгу. А коли друг
        оплатить книжку, напишіть нам свій код — подаруємо вам безкоштовну е-книгу.
      </p>
      {code ? (
        <div className="invite-row">
          <input className="field-input" readOnly value={link} aria-label="Ваше посилання-подарунок" onFocus={(e) => e.target.select()} />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              navigator.clipboard?.writeText(link).then(() => setCopied(true), () => {});
            }}
          >
            <Copy size={16} aria-hidden="true" /> {copied ? "Скопійовано" : "Копіювати"}
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn-primary" onClick={() => ensureMyCode()}>
          Отримати посилання-подарунок
        </button>
      )}
      {code && <p className="muted">Ваш код: {code}</p>}
    </section>
  );
}

export default function MyStoriesPage() {
  const stories = useStories();
  const orders = useOrders();
  const router = useRouter();

  return (
    <div className="wrap" style={{ paddingBottom: 48 }}>
      <div className="back-row">
        <BackLink fallback="/" />
      </div>
      <div className="page-top">
        <OrnamentRule className="ornament-rule" />
        <h1>Мої казки</h1>
        <p>Книжки зберігаються в цьому браузері. Якщо відкриєте сайт на іншому пристрої, їх там не буде.</p>
      </div>

      {stories === undefined ? null : stories.length === 0 ? (
        <div className="empty">
          <h2>Тут поки порожньо</h2>
          <p>Створіть першу книжку — перші сторінки видно одразу й безкоштовно.</p>
          <Link href="/stvoryty" className="btn btn-primary">
            Створити дитячу книжку
          </Link>
        </div>
      ) : (
        <div className="my-list">
          {stories.map((s) => (
            <div key={s.id} className="my-card">
              <Link href={`/kazka?id=${s.id}`} className="my-item">
                <Scene id={getTheme(s.theme).scene} />
                <div>
                  <h3>{s.title}</h3>
                  <p>
                    {dateFmt.format(s.createdAt)} ·{" "}
                    {s.paid ? <span className="badge is-paid">Оплачено</span> : "Безкоштовний перегляд"}
                  </p>
                </div>
              </Link>
              <div className="my-actions">
                <Link href={`/kazka?id=${s.id}`} className="btn btn-soft btn-small">
                  <BookOpen size={16} aria-hidden="true" /> Відкрити
                </Link>
                <Link href={`/stvoryty?prodovzhennia=${s.id}`} className="btn btn-soft btn-small">
                  <Library size={16} aria-hidden="true" /> Продовження
                </Link>
                <button
                  type="button"
                  className="btn btn-soft btn-small"
                  onClick={() => {
                    addToCart({ storyId: s.id, storyTitle: s.title, kind: "hardcover", cover: "matova", ebookPaid: Boolean(s.paid), paidOrder: s.paidOrder });
                    router.push("/koshyk");
                  }}
                >
                  Замовити друк
                </button>
                {s.paid && (
                  <Link href={`/kazka?id=${s.id}#rozmalovka`} className="btn btn-soft btn-small">
                    <Palette size={16} aria-hidden="true" /> Розмальовка
                  </Link>
                )}
                {!s.paid && (
                  <button
                    type="button"
                    className="icon-btn my-del"
                    aria-label={`Видалити казку «${s.title}»`}
                    onClick={() => {
                      if (window.confirm(`Видалити казку «${s.title}»?`)) {
                        deleteStory(s.id);
                        deleteImages(s.id).catch(() => {});
                      }
                    }}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <InviteFriends />
      </div>

      {orders && orders.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 className="display" style={{ fontSize: 22, marginBottom: 12 }}>
            Замовлення
          </h2>
          <div className="panel">
            <ul className="offer-list" style={{ margin: 0 }}>
              {orders.map((o) => (
                <li key={o.id}>
                  <span>
                    <strong>{o.id}</strong>
                    <br />
                    <span className="muted" style={{ fontSize: 14 }}>
                      {orderTitle(o)} · {o.status === "paid" ? "оплачено" : "очікує оплати"}
                    </span>
                  </span>
                  <strong>{formatUah(o.amount)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
