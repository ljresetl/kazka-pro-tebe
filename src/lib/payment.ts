"use client";

import { saveOrder, saveStory } from "./storage";
import type { Order, Story } from "./types";

// ЄДИНЕ місце, яке треба змінити, щоб підключити справжню оплату.
//
// Зараз працює тестовий режим: замовлення одразу вважається оплаченим.
// Для LiqPay / WayForPay / monobank потрібен сервер, який підписує платіж
// секретним ключем (у браузері ключ зберігати не можна). План:
//   1. Перенести сайт на хостинг із сервером (напр. Vercel) — код уже вміє
//      працювати з сервером, див. src/app/api.
//   2. Додати маршрут src/app/api/payment/route.ts: він приймає замовлення,
//      підписує платіж і повертає посилання на сторінку оплати.
//   3. У startPayment нижче замість тестової гілки викликати цей маршрут
//      і повернути { status: "redirect", url }.
//   4. Додати маршрут для зворотного виклику платіжної системи, який
//      позначає замовлення оплаченим і надсилає PDF на пошту.

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

export async function startPayment(order: Order, story: Story): Promise<PaymentResult> {
  saveOrder(order);

  if (PAYMENT_MODE === "test") {
    await new Promise((r) => setTimeout(r, 1200));
    markOrderPaid(order, story);
    return { status: "paid" };
  }

  // TODO(оплата): запит до власного сервера, який створює платіж.
  return {
    status: "error",
    message: "Оплата тимчасово недоступна. Спробуйте пізніше або напишіть нам.",
  };
}

/** Викликається після успішної оплати. */
export function markOrderPaid(order: Order, story: Story) {
  saveOrder({ ...order, status: "paid" });
  saveStory({ ...story, paid: true });
}
