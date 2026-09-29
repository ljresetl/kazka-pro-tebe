"use client";

import { readStory, saveOrder, saveStory } from "./storage";
import type { Order } from "./types";

// Оплата замовлень.
//
// NEXT_PUBLIC_PAYMENT_MODE=test (за замовчуванням) — тестовий режим:
//   замовлення одразу вважається оплаченим, гроші не списуються.
// NEXT_PUBLIC_PAYMENT_MODE=live — справжня оплата через LiqPay:
//   потрібні сервер (Vercel) і ключі LIQPAY_PUBLIC_KEY / LIQPAY_PRIVATE_KEY.
//   Серверна частина — src/lib/liqpay.ts і src/app/api/payment/*.

export const PAYMENT_MODE: "test" | "live" = process.env.NEXT_PUBLIC_PAYMENT_MODE === "live" ? "live" : "test";

/** Створює замовлення з унікальним номером і часом створення. */
export function createOrder(input: Omit<Order, "id" | "status" | "createdAt">): Order {
  const now = Date.now();
  return { ...input, id: `K-${now.toString(36).toUpperCase()}`, status: "pending", createdAt: now };
}

/** Переводить покупця на сторінку оплати платіжної системи. */
export function goToPayment(url: string) {
  window.location.assign(url);
}

export type PaymentResult =
  | { status: "paid" }
  | { status: "redirect"; url: string }
  | { status: "error"; message: string };

export async function startPayment(order: Order): Promise<PaymentResult> {
  saveOrder(order);

  if (PAYMENT_MODE === "test") {
    await new Promise((r) => setTimeout(r, 1200));
    // Сервер теж має знати про «оплату», інакше не домалює книжку (src/lib/quota.ts).
    const storyIds = [...new Set([...(order.items ?? []).map((i) => i.storyId), ...(order.storyId ? [order.storyId] : [])])];
    await fetch("/api/payment/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyIds }),
    }).catch(() => {});
    markOrderPaid(order);
    return { status: "paid" };
  }

  // Бойовий режим: сервер перераховує суму, підписує платіж LiqPay і повертає посилання.
  // Після оплати LiqPay поверне покупця на /kazka/oplata/rezultat?order=…
  try {
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) throw new Error(data.error);
    return { status: "redirect", url: data.url };
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error && err.message
          ? err.message
          : "Не вдалося перейти до оплати. Спробуйте ще раз або напишіть нам.",
    };
  }
}

/** Питає сервер, чи оплачено замовлення (після повернення з LiqPay). */
export async function checkPayment(orderId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/payment/status?order=${encodeURIComponent(orderId)}`, { cache: "no-store" });
    const data = (await res.json()) as { paid?: boolean };
    return Boolean(data.paid);
  } catch {
    return false;
  }
}

/** Викликається після успішної оплати: відкриває всі книжки із замовлення. */
export function markOrderPaid(order: Order) {
  saveOrder({ ...order, status: "paid" });
  const ids = new Set<string>([...(order.items ?? []).map((i) => i.storyId), ...(order.storyId ? [order.storyId] : [])]);
  for (const id of ids) {
    const story = readStory(id);
    if (story && !story.paid) saveStory({ ...story, paid: true, paidOrder: order.id });
  }
}
