"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import { OrnamentRule } from "@/components/Ornament";
import Scene from "@/components/Scene";
import { formatUah, getPrice } from "@/lib/prices";
import { deleteImages } from "@/lib/image-store";
import { deleteStory, useOrders, useStories } from "@/lib/storage";
import { getTheme } from "@/lib/themes";

const dateFmt = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long" });

export default function MyStoriesPage() {
  const stories = useStories();
  const orders = useOrders();

  return (
    <div className="wrap" style={{ paddingBottom: 48 }}>
      <div className="back-row">
        <BackLink fallback="/" />
      </div>
      <div className="page-top">
        <OrnamentRule className="ornament-rule" />
        <h1>Мої казки</h1>
        <p>Казки зберігаються в цьому браузері. Якщо відкриєте сайт на іншому пристрої, їх там не буде.</p>
      </div>

      {stories === undefined ? null : stories.length === 0 ? (
        <div className="empty">
          <h2>Тут поки порожньо</h2>
          <p>Створіть першу казку — це безкоштовно й займає хвилину.</p>
          <Link href="/stvoryty" className="btn btn-primary">
            Створити казку
          </Link>
        </div>
      ) : (
        <div className="my-list">
          {stories.map((s) => (
            <div key={s.id} style={{ position: "relative" }}>
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
              {!s.paid && (
                <button
                  type="button"
                  className="icon-btn"
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
          ))}
        </div>
      )}

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
                    <strong>{o.id}</strong> · {o.storyTitle}
                    <br />
                    <span className="muted" style={{ fontSize: 14 }}>
                      {getPrice(o.product).name} · {o.status === "paid" ? "оплачено" : "очікує оплати"}
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
