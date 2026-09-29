"use client";

import { Check, Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { checkPayment, markOrderPaid } from "@/lib/payment";
import { clearCart, useOrders } from "@/lib/storage";

// Сюди LiqPay повертає покупця після оплати. Перевіряємо статус на сервері
// кілька разів (банк іноді підтверджує платіж із затримкою).
function Result() {
  const orderId = useSearchParams().get("order") ?? "";
  const orders = useOrders();
  const [state, setState] = useState<"checking" | "paid" | "pending">("checking");

  const order = orders?.find((o) => o.id === orderId);
  const storyId = order?.items?.[0]?.storyId ?? order?.storyId;

  useEffect(() => {
    if (!orderId || orders === undefined) return;
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
        const tickets = await checkPayment(orderId);
        if (tickets) {
          if (order) {
            markOrderPaid(order, tickets);
            if (order.items) clearCart();
          }
          if (!cancelled) setState("paid");
          return;
        }
        await new Promise((r) => setTimeout(r, 2500));
      }
      if (!cancelled) setState("pending");
    })();
    return () => {
      cancelled = true;
    };
    // Перевіряємо один раз, коли дані з браузера завантажились.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, orders === undefined]);

  return (
    <div className="wrap" style={{ maxWidth: 720 }}>
      <div className="success">
        {state === "paid" ? (
          <>
            <div className="success-icon" aria-hidden="true">
              <Check size={36} strokeWidth={3} />
            </div>
            <h1>Оплату отримано. Дякуємо!</h1>
            <p>Замовлення {orderId}. Книжка вже відкрита повністю. Друковані книжки надішлемо Новою Поштою після друку (3–5 робочих днів).</p>
            <div className="button-row" style={{ justifyContent: "center" }}>
              {storyId && (
                <Link href={`/kazka?id=${storyId}`} className="btn btn-primary">
                  Відкрити книжку
                </Link>
              )}
              <Link href="/moi-kazky" className="btn btn-ghost">
                Мої казки
              </Link>
            </div>
          </>
        ) : state === "checking" ? (
          <>
            <div className="writing-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h1>Перевіряємо оплату…</h1>
            <p>Це займає кілька секунд.</p>
          </>
        ) : (
          <>
            <div className="success-icon" aria-hidden="true" style={{ background: "var(--sun-soft)", color: "#b07800" }}>
              <Clock size={34} />
            </div>
            <h1>Оплата ще обробляється</h1>
            <p>
              Банк поки не підтвердив платіж {orderId}. Оновіть сторінку за хвилину. Якщо гроші списано, а казка не
              відкрилася, напишіть нам — ми допоможемо.
            </p>
            <div className="button-row" style={{ justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
                Перевірити ще раз
              </button>
              <Link href="/kontakty" className="btn btn-ghost">
                Контакти
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="writing" />}>
      <Result />
    </Suspense>
  );
}
